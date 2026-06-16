import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth, getAvatarUrl, handleAvatarError } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  getAdminStats, getAdminBookings, getAdminUsers, blockSlots, getTurfs,
} from '../services/api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell,
} from 'recharts';
import {
  FiUsers, FiCalendar, FiDollarSign, FiShield, FiGrid, FiBook, FiLock,
} from 'react-icons/fi';
import { GiCricketBat } from 'react-icons/gi';
import toast from 'react-hot-toast';

const adminTabs = [
  { id: 'overview', label: 'Overview', icon: FiGrid },
  { id: 'bookings', label: 'Bookings', icon: FiBook },
  { id: 'users', label: 'Users', icon: FiUsers },
  { id: 'slots', label: 'Block Slots', icon: FiLock },
];

const statusColors = {
  confirmed: '#10B981', pending: '#F59E0B', cancelled: '#EF4444', completed: '#3B82F6',
};

export default function AdminDashboard() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [turfs, setTurfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingFilter, setBookingFilter] = useState('');
  const [slotBlock, setSlotBlock] = useState({
    turfId: '', date: '', slots: [], reason: '',
  });

  useEffect(() => {
    if (!isAdmin) {
      navigate('/dashboard');
      return;
    }
    loadData();
  }, [isAdmin]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sRes, bRes, uRes, tRes] = await Promise.allSettled([
        getAdminStats(),
        getAdminBookings({ limit: 50 }),
        getAdminUsers(),
        getTurfs(),
      ]);
      if (sRes.status === 'fulfilled') setStats(sRes.value.data.stats);
      if (bRes.status === 'fulfilled') setBookings(bRes.value.data.bookings || []);
      if (uRes.status === 'fulfilled') setUsers(uRes.value.data.users || []);
      if (tRes.status === 'fulfilled') setTurfs(tRes.value.data.turfs || []);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockSlots = async () => {
    if (!slotBlock.turfId || !slotBlock.date || slotBlock.slots.length === 0) {
      toast.error('Select turf, date, and at least one slot');
      return;
    }
    try {
      await blockSlots(slotBlock);
      toast.success(`${slotBlock.slots.length} slots blocked`);
      setSlotBlock({ turfId: '', date: '', slots: [], reason: '' });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to block slots');
    }
  };

  const filteredBookings = bookings.filter((b) =>
    bookingFilter
      ? b.bookingId?.includes(bookingFilter) ||
        b.team?.teamName?.toLowerCase().includes(bookingFilter.toLowerCase())
      : true
  );

  const pieData = Object.entries(
    bookings.reduce((acc, b) => {
      acc[b.status] = (acc[b.status] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  return (
    <div className="min-h-screen pb-16 bg-white" style={{ paddingTop: '130px' }}>
      <div className="container mx-auto px-6 md:px-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-8"
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #10B981, #065F46)' }}
          >
            <FiShield className="text-white text-xl" />
          </div>
          <div>
            <h1 className="section-heading text-[#0F172A]">Admin Panel</h1>
            <p className="text-xs text-[#475569]">EROTURF Management Dashboard</p>
          </div>
        </motion.div>

        {/* Quick stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Users', value: stats.totalUsers, icon: FiUsers, color: '#3B82F6' },
              { label: 'Total Bookings', value: stats.totalBookings, icon: FiCalendar, color: '#10B981' },
              { label: 'Today\'s Bookings', value: stats.todayBookings, icon: GiCricketBat, color: '#F59E0B' },
              { label: 'Revenue', value: `₹${Math.round(stats.totalRevenue).toLocaleString()}`, icon: FiDollarSign, color: '#8B5CF6' },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="stat-card bg-white border border-[#E2E8F0] shadow-sm rounded-2xl p-5"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: `${s.color}12` }}>
                  <s.icon style={{ color: s.color, fontSize: '1.1rem' }} />
                </div>
                <p className="text-2xl font-black" style={{ fontFamily: 'var(--font-brand)', color: s.color }}>
                  {s.value}
                </p>
                <p className="text-xs text-[#475569] mt-1 font-medium">{s.label}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Occupancy bar */}
        {stats && (
          <div className="glass rounded-2xl p-5 mb-8 border border-[#E2E8F0] bg-white shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-[#0F172A]">Today's Occupancy</span>
              <span className="font-black text-[#047857]" style={{ fontFamily: 'var(--font-brand)' }}>
                {stats.occupancyRate}%
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-[#F1F5F9]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stats.occupancyRate}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #10B981, #F59E0B)' }}
              />
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-48 flex md:flex-col gap-2 overflow-x-auto no-scrollbar flex-nowrap pb-1 scroll-smooth shrink-0">
            {adminTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${
                  activeTab === tab.id ? 'text-white font-bold' : 'text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
                }`}
                style={activeTab === tab.id ? { background: 'linear-gradient(135deg, #10B981, #065F46)' } : {}}
                id={`admin-tab-${tab.id}`}
              >
                <tab.icon /> {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1">
            {/* Overview */}
            {activeTab === 'overview' && stats && (
              <div className="space-y-6">
                <div className="glass rounded-2xl p-6 border border-[#E2E8F0] bg-white shadow-sm">
                  <h3 className="font-bold text-[#0F172A] mb-6">Revenue — Last 7 Days</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={stats.revenueChart}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 11 }}
                        tickFormatter={(v) => v.slice(5)} />
                      <YAxis tick={{ fill: '#475569', fontSize: 11 }} />
                      <Tooltip contentStyle={{
                        background: '#FFFFFF', border: '1px solid #E2E8F0',
                        borderRadius: 12, color: '#0F172A',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                      }} />
                      <Bar dataKey="revenue" fill="#10B981" radius={[6, 6, 0, 0]}
                        name="Revenue (₹)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {pieData.length > 0 && (
                  <div className="glass rounded-2xl p-6 border border-[#E2E8F0] bg-white shadow-sm">
                    <h3 className="font-bold text-[#0F172A] mb-6">Booking Status Distribution</h3>
                    <div className="flex items-center gap-6">
                      <ResponsiveContainer width="50%" height={160}>
                        <PieChart>
                          <Pie data={pieData} cx="50%" cy="50%" innerRadius={40}
                            outerRadius={70} paddingAngle={3} dataKey="value">
                            {pieData.map((entry, i) => (
                              <Cell key={i}
                                fill={statusColors[entry.name] || '#64748B'} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="space-y-2">
                        {pieData.map((d) => (
                          <div key={d.name} className="flex items-center gap-2 text-sm">
                            <div className="w-3 h-3 rounded-full"
                              style={{ background: statusColors[d.name] || '#64748B' }} />
                            <span className="text-[#475569] capitalize">{d.name}</span>
                            <span className="font-bold text-[#0F172A]">{d.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Bookings */}
            {activeTab === 'bookings' && (
              <div className="space-y-4">
                <input
                  className="input-field bg-[#F8FAFC]"
                  placeholder="Search by booking ID or team name..."
                  value={bookingFilter}
                  onChange={(e) => setBookingFilter(e.target.value)}
                  id="admin-booking-search"
                />
                <div className="space-y-2 animate-fade-in">
                  {filteredBookings.map((b, i) => (
                    <motion.div
                      key={b._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="glass rounded-xl p-4 border border-[#E2E8F0] bg-white shadow-sm"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                          <p className="font-mono text-xs text-[#047857] font-bold">{b.bookingId}</p>
                          <p className="font-semibold text-[#0F172A] text-sm mt-0.5">
                            {b.team?.teamName}
                          </p>
                          <p className="text-xs text-[#475569]">
                            {b.date} · {b.slot} · {b.user?.name}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-[#047857]" style={{ fontFamily: 'var(--font-brand)' }}>
                            ₹{b.pricing?.total}
                          </p>
                          <span className="badge text-xs mt-1" style={{
                            background: `${statusColors[b.status]}10`,
                            color: statusColors[b.status],
                            border: `1px solid ${statusColors[b.status]}20`,
                          }}>
                            {b.status}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Users */}
            {activeTab === 'users' && (
              <div className="space-y-2 animate-fade-in">
                {users.map((u, i) => (
                  <motion.div
                    key={u._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="glass rounded-xl p-4 flex items-center gap-4 border border-[#E2E8F0] bg-white shadow-sm"
                  >
                    <img
                      src={getAvatarUrl(u)}
                      alt={u.name}
                      className="w-10 h-10 rounded-xl object-cover border border-[#E2E8F0]"
                      onError={(e) => handleAvatarError(e, u.name)}
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-[#0F172A] text-sm">{u.name}</p>
                      <p className="text-xs text-[#475569]">{u.email || u.phone}</p>
                    </div>
                    <span className={`badge ${u.role === 'admin' ? 'badge-green' : 'badge-blue'}`}>
                      {u.role}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Block Slots */}
            {activeTab === 'slots' && (
              <div className="glass rounded-2xl p-6 space-y-4 border border-[#E2E8F0] bg-white shadow-sm">
                <h3 className="font-bold text-[#0F172A]">Block Time Slots</h3>
                <p className="text-sm text-[#475569]">Block specific time slots to prevent bookings (maintenance, events, etc.)</p>

                <select
                  className="input-field bg-[#F8FAFC]"
                  value={slotBlock.turfId}
                  onChange={(e) => setSlotBlock({ ...slotBlock, turfId: e.target.value })}
                  id="block-turf-select"
                >
                  <option value="">Select Turf</option>
                  {turfs.map((t) => (
                    <option key={t._id} value={t._id}>{t.name}</option>
                  ))}
                </select>

                <input
                  type="date"
                  className="input-field bg-[#F8FAFC]"
                  value={slotBlock.date}
                  onChange={(e) => setSlotBlock({ ...slotBlock, date: e.target.value })}
                  id="block-date"
                />

                <div>
                  <p className="text-sm font-medium text-[#475569] mb-2">Select Slots to Block</p>
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                    {['12:00 AM','01:00 AM','02:00 AM','03:00 AM','04:00 AM','05:00 AM',
                      '06:00 AM','07:00 AM','08:00 AM','09:00 AM','10:00 AM','11:00 AM',
                      '12:00 PM','01:00 PM','02:00 PM','03:00 PM','04:00 PM','05:00 PM',
                      '06:00 PM','07:00 PM','08:00 PM','09:00 PM','10:00 PM','11:00 PM'].map((slot) => {
                      const selected = slotBlock.slots.includes(slot);
                      return (
                        <button
                          key={slot}
                          onClick={() =>
                            setSlotBlock((prev) => ({
                              ...prev,
                              slots: selected
                                ? prev.slots.filter((s) => s !== slot)
                                : [...prev.slots, slot],
                            }))
                          }
                          className={`py-2 text-xs rounded-lg font-medium transition-all ${
                            selected ? 'slot-selected' : 'slot-available'
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <input
                  className="input-field bg-[#F8FAFC]"
                  placeholder="Reason for blocking (optional)"
                  value={slotBlock.reason}
                  onChange={(e) => setSlotBlock({ ...slotBlock, reason: e.target.value })}
                  id="block-reason"
                />

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleBlockSlots}
                  className="btn-primary w-full flex items-center justify-center gap-2 shadow-sm"
                  id="block-slots-btn"
                >
                  <FiLock /> Block {slotBlock.slots.length} Slot{slotBlock.slots.length !== 1 ? 's' : ''}
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
