import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  FiCalendar, FiClock, FiDollarSign, FiUser,
  FiBarChart2, FiSettings, FiLogOut, FiCheck, FiX, FiChevronRight
} from 'react-icons/fi';

const sidebarTabs = [
  { id: 'bookings', label: 'My Bookings', icon: FiCalendar },
  { id: 'payments', label: 'Payment History', icon: FiDollarSign },
  { id: 'profile', label: 'Profile', icon: FiUser },
  { id: 'stats', label: 'Statistics', icon: FiBarChart2 },
  { id: 'settings', label: 'Settings', icon: FiSettings },
];

const MOCK_BOOKINGS = [
  {
    id: 1,
    teamName: "Sridhar A's Team",
    date: '2026-06-06',
    time: '08:00 PM - 09:00 PM',
    turfName: 'EROTURF - Main Ground',
    status: 'Cancelled'
  },
  {
    id: 2,
    teamName: "Sridhar A's Team",
    date: '2026-06-06',
    time: '10:00 PM - 11:00 PM',
    turfName: 'EROTURF - Main Ground',
    status: 'Confirmed'
  },
  {
    id: 3,
    teamName: "Sridhar A's Team",
    date: '2026-06-05',
    time: '07:00 PM - 08:00 PM',
    turfName: 'EROTURF - Main Ground',
    status: 'Cancelled'
  },
  {
    id: 4,
    teamName: "Sridhar A's Team",
    date: '2026-06-05',
    time: '08:00 PM - 09:00 PM • 10:00 PM',
    turfName: 'EROTURF - Main Ground',
    status: 'Cancelled'
  },
  {
    id: 5,
    teamName: "Sridhar A's Team",
    date: '2026-06-05',
    time: '09:00 PM - 10:00 PM',
    turfName: 'EROTURF - Main Ground',
    status: 'Confirmed'
  },
  {
    id: 6,
    teamName: "Sridhar A's Team",
    date: '2026-06-05',
    time: '11:00 PM - 12:00 AM',
    turfName: 'EROTURF - Main Ground',
    status: 'Cancelled'
  },
  {
    id: 7,
    teamName: "Sridhar A's Team",
    date: '2026-06-05',
    time: '11:00 PM - 10:00 PM',
    turfName: 'EROTURF - Main Ground',
    status: 'Cancelled'
  }
];

const MOCK_PAYMENTS = [
  { id: 'PAY-8921', turf: 'EROTURF - Main Ground', date: '2026-06-06', amount: '₹1000', method: 'Credit Card', status: 'Success' },
  { id: 'PAY-8914', turf: 'EROTURF - Main Ground', date: '2026-06-06', amount: '₹1000', method: 'UPI (GPay)', status: 'Success' },
  { id: 'PAY-8804', turf: 'EROTURF - Main Ground', date: '2026-06-05', amount: '₹2000', method: 'Net Banking (HDFC)', status: 'Success' },
  { id: 'PAY-8751', turf: 'EROTURF - Main Ground', date: '2026-06-05', amount: '₹3000', method: 'Wallet (Paytm)', status: 'Success' },
];

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('bookings');
  const [filter, setFilter] = useState('All');

  // Profile input states
  const [profName, setProfName] = useState('');
  const [profEmail, setProfEmail] = useState('');
  const [profPhone, setProfPhone] = useState('');

  // Settings states
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(true);
  const [wpNotif, setWpNotif] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const defaultName = user?.name || 'Sridhar!';
  const defaultEmail = user?.email || 'sridhar0106a@gmail.com';
  const defaultPhone = user?.phone || '+91 98765 43210';

  useEffect(() => {
    setProfName(defaultName);
    setProfEmail(defaultEmail);
    setProfPhone(defaultPhone);
  }, [user]);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    toast.success('Profile updated successfully! 🏏');
  };

  const handleToggle = (type) => {
    if (type === 'email') setEmailNotif(!emailNotif);
    if (type === 'sms') setSmsNotif(!smsNotif);
    if (type === 'wp') setWpNotif(!wpNotif);
    toast.success('Preference updated!');
  };

  const displayName = profName || defaultName;
  const displayEmail = profEmail || defaultEmail;
  const displayInitial = displayName.charAt(0).toUpperCase();

  const filteredBookings = MOCK_BOOKINGS.filter((b) => {
    if (filter === 'All') return true;
    return b.status === filter;
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        
        .db-page * {
          font-family: 'Inter', sans-serif;
          box-sizing: border-box;
        }

        .db-page {
          background-color: #F8FAFC;
          min-height: calc(100vh - 90px);
          padding: 120px 24px 60px 24px;
        }

        @media (max-width: 768px) {
          .db-page {
            padding-top: 100px;
            padding-bottom: 40px;
          }
        }

        .db-container {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          gap: 32px;
          align-items: start;
        }

        @media (max-width: 1024px) {
          .db-container {
            flex-direction: column;
            gap: 24px;
          }
        }

        /* Sidebar card */
        .db-sidebar {
          width: 320px;
          background-color: #ffffff;
          border: 1px solid #E2E8F0;
          border-radius: 24px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02), 0 1px 2px rgba(0, 0, 0, 0.03);
          flex-shrink: 0;
        }

        @media (max-width: 1024px) {
          .db-sidebar {
            width: 100%;
          }
        }

        /* Profile details */
        .db-profile {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .db-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background-color: #0F4C3A;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 20px;
          flex-shrink: 0;
        }

        .db-profile-info {
          min-width: 0;
        }

        .db-profile-name {
          font-size: 16px;
          font-weight: 800;
          color: #0F172A;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .db-profile-email {
          font-size: 13px;
          color: #64748B;
          margin: 4px 0 0 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .db-divider {
          border-bottom: 1px solid #F1F5F9;
          margin: 20px 0;
        }

        /* Nav List */
        .db-nav-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .db-nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          border: none;
          background: none;
          text-align: left;
          padding: 12px 16px;
          font-size: 14px;
          font-weight: 600;
          color: #475569;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .db-nav-item:hover {
          background-color: #F8FAFC;
          color: #0F172A;
        }

        .db-nav-item.active {
          background-color: #E8F8F0;
          color: #00C853;
          font-weight: 700;
        }

        .db-nav-icon {
          font-size: 18px;
          color: #94A3B8;
        }

        .db-nav-item.active .db-nav-icon {
          color: #00C853;
        }

        /* Main Content */
        .db-main {
          flex: 1;
          min-width: 0;
          width: 100%;
        }

        /* Header block */
        .db-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 24px;
        }

        @media (max-width: 768px) {
          .db-header-row {
            flex-direction: column;
            align-items: start;
            gap: 16px;
          }
        }

        .db-welcome-title {
          font-size: 28px;
          font-weight: 800;
          color: #0F172A;
          margin: 0;
        }

        .db-welcome-sub {
          font-size: 14px;
          color: #64748B;
          margin: 6px 0 0 0;
        }

        /* Promo card */
        .db-promo {
          background-color: #F0FDF4;
          border: 1.5px solid #DCFCE7;
          border-radius: 20px;
          padding: 14px 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.01);
          flex-shrink: 0;
        }

        @media (max-width: 768px) {
          .db-promo {
            width: 100%;
            justify-content: space-between;
          }
        }

        .db-promo-icon-box {
          background-color: #00C853;
          width: 40px;
          height: 40px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-size: 18px;
          flex-shrink: 0;
        }

        .db-promo-text {
          min-width: 0;
        }

        .db-promo-title {
          font-size: 14px;
          font-weight: 700;
          color: #0F172A;
          margin: 0;
        }

        .db-promo-sub {
          font-size: 12px;
          color: #64748B;
          margin: 2px 0 0 0;
        }

        .db-promo-btn {
          background-color: #00C853;
          color: #ffffff;
          border: none;
          font-size: 12px;
          font-weight: 700;
          padding: 10px 16px;
          border-radius: 10px;
          cursor: pointer;
          white-space: nowrap;
          transition: background-color 0.2s;
        }

        .db-promo-btn:hover {
          background-color: #00A844;
        }

        /* Metrics */
        .db-metrics-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 24px;
        }

        @media (max-width: 992px) {
          .db-metrics-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }
        }

        .db-metric-card {
          background-color: #ffffff;
          border: 1.5px solid #E2E8F0;
          border-radius: 20px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 135px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
        }

        .db-metric-icon-circle {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
        }

        .db-metric-value {
          font-size: 28px;
          font-weight: 900;
          margin: 16px 0 0 0;
          line-height: 1.1;
        }

        .db-metric-label {
          font-size: 11px;
          font-weight: 700;
          color: #64748B;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 6px 0 0 0;
        }

        /* Bookings list card */
        .db-bookings-card {
          background-color: #ffffff;
          border: 1.5px solid #E2E8F0;
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
        }

        .db-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 16px;
          border-bottom: 1px solid #F1F5F9;
        }

        .db-card-title {
          font-size: 16px;
          font-weight: 800;
          color: #0F172A;
          margin: 0;
        }

        .db-select {
          border: 1px solid #E2E8F0;
          border-radius: 10px;
          padding: 6px 12px;
          font-size: 13px;
          font-weight: 600;
          color: #475569;
          outline: none;
          background-color: #ffffff;
          cursor: pointer;
          transition: border-color 0.2s;
        }

        .db-select:focus {
          border-color: #00C853;
        }

        .db-booking-list {
          display: flex;
          flex-direction: column;
        }

        .db-booking-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 0;
          border-bottom: 1px solid #F1F5F9;
          transition: background-color 0.15s;
        }

        .db-booking-row:last-child {
          border-bottom: none;
        }

        .db-booking-row-left {
          display: flex;
          align-items: center;
          gap: 16px;
          min-width: 0;
        }

        .db-status-circle {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          flex-shrink: 0;
        }

        .db-status-circle.confirmed {
          background-color: #E8F8F0;
          color: #00C853;
          border: 1px solid #D1F2E0;
        }

        .db-status-circle.cancelled {
          background-color: #FEF2F2;
          color: #EF4444;
          border: 1px solid #FEE2E2;
        }

        .db-booking-details {
          min-width: 0;
        }

        .db-booking-team {
          font-size: 14px;
          font-weight: 700;
          color: #0F172A;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .db-booking-meta {
          font-size: 13px;
          color: #64748B;
          margin: 4px 0 0 0;
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .db-meta-dot {
          color: #CBD5E1;
        }

        .db-booking-row-right {
          display: flex;
          align-items: center;
          gap: 20px;
          flex-shrink: 0;
        }

        .db-status-badge {
          font-size: 11px;
          font-weight: 800;
          padding: 4px 10px;
          border-radius: 12px;
          text-transform: capitalize;
        }

        .db-status-badge.confirmed {
          background-color: #E8F8F0;
          color: #00C853;
        }

        .db-status-badge.cancelled {
          background-color: #FEF2F2;
          color: #EF4444;
        }

        .db-chevron {
          color: #94A3B8;
          font-size: 18px;
          display: flex;
          align-items: center;
        }

        /* Payments styling */
        .db-table-card {
          background-color: #ffffff;
          border: 1px solid #E2E8F0;
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
          overflow-x: auto;
        }
        .db-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 14px;
          min-width: 600px;
        }
        .db-table th {
          padding: 12px 16px;
          color: #64748B;
          font-weight: 700;
          border-bottom: 1.5px solid #F1F5F9;
          text-transform: uppercase;
          font-size: 11px;
          letter-spacing: 0.5px;
        }
        .db-table td {
          padding: 16px;
          color: #0F172A;
          border-bottom: 1px solid #F1F5F9;
          font-weight: 500;
        }
        .db-table tr:last-child td {
          border-bottom: none;
        }

        /* Profile form styling */
        .db-profile-card {
          background-color: #ffffff;
          border: 1px solid #E2E8F0;
          border-radius: 20px;
          padding: 32px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
          max-width: 600px;
        }
        .db-form-group {
          margin-bottom: 20px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .db-form-label {
          font-size: 13px;
          font-weight: 700;
          color: #475569;
        }
        .db-form-input {
          border: 1.5px solid #E2E8F0;
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 14px;
          font-weight: 500;
          color: #0F172A;
          outline: none;
          background-color: #ffffff;
          transition: border-color 0.2s;
        }
        .db-form-input:focus {
          border-color: #00C853;
        }
        .db-form-btn {
          background-color: #00C853;
          color: #ffffff;
          border: none;
          font-size: 14px;
          font-weight: 700;
          padding: 12px 24px;
          border-radius: 10px;
          cursor: pointer;
          transition: background-color 0.2s;
          margin-top: 10px;
        }
        .db-form-btn:hover {
          background-color: #00A844;
        }

        /* Stats Tab styling */
        .db-stats-grid-inner {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          margin-top: 20px;
        }
        @media (max-width: 768px) {
          .db-stats-grid-inner {
            grid-template-columns: 1fr;
          }
        }
        .db-stats-chart-card {
          background-color: #ffffff;
          border: 1px solid #E2E8F0;
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
        }
        .db-stat-item-row {
          margin-bottom: 16px;
        }
        .db-stat-item-row:last-child {
          margin-bottom: 0;
        }
        .db-stat-item-info {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          font-weight: 600;
          color: #334155;
        }
        .db-progress-bar-bg {
          background-color: #F1F5F9;
          height: 8px;
          border-radius: 4px;
          overflow: hidden;
          margin-top: 8px;
        }
        .db-progress-bar-fill {
          height: 100%;
          background-color: #00C853;
          border-radius: 4px;
        }

        /* Settings Toggle */
        .db-settings-card {
          background-color: #ffffff;
          border: 1px solid #E2E8F0;
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
          max-width: 600px;
        }
        .db-toggle-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 0;
          border-bottom: 1px solid #F1F5F9;
        }
        .db-toggle-row:last-child {
          border-bottom: none;
        }
        .db-toggle-label {
          font-size: 14px;
          font-weight: 700;
          color: #0F172A;
        }
        .db-toggle-desc {
          font-size: 12px;
          color: #64748B;
          margin-top: 2px;
        }
        .db-switch {
          position: relative;
          display: inline-block;
          width: 44px;
          height: 24px;
          cursor: pointer;
        }
        .db-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        .db-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #CBD5E1;
          transition: .3s;
          border-radius: 24px;
        }
        .db-slider:before {
          position: absolute;
          content: "";
          height: 16px;
          width: 16px;
          left: 4px;
          bottom: 4px;
          background-color: white;
          transition: .3s;
          border-radius: 50%;
        }
        input:checked + .db-slider {
          background-color: #00C853;
        }
        input:checked + .db-slider:before {
          transform: translateX(20px);
        }
      `}</style>

      <div className="db-page">
        <div className="db-container">
          
          {/* Sidebar */}
          <aside className="db-sidebar">
            <div className="db-profile">
              <div className="db-avatar">
                {displayInitial}
              </div>
              <div className="db-profile-info">
                <h3 className="db-profile-name">{displayName}</h3>
                <p className="db-profile-email">{displayEmail}</p>
              </div>
            </div>

            <div className="db-divider" />

            <nav className="db-nav-list">
              {sidebarTabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`db-nav-item ${isActive ? 'active' : ''}`}
                  >
                    <tab.icon className="db-nav-icon" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>

            <div className="db-divider" />

            <button onClick={handleLogout} className="db-nav-item" style={{ color: '#64748B' }}>
              <FiLogOut className="db-nav-icon" />
              Logout
            </button>
          </aside>

          {/* Main Content Area */}
          <main className="db-main">
            
            {/* BOOKINGS TAB */}
            {activeTab === 'bookings' && (
              <>
                <div className="db-header-row">
                  <div>
                    <h1 className="db-welcome-title">
                      Welcome back, {displayName} 👋
                    </h1>
                    <p className="db-welcome-sub">
                      Here's what's happening with your bookings.
                    </p>
                  </div>

                  <div className="db-promo">
                    <div className="db-promo-icon-box">
                      <FiCalendar />
                    </div>
                    <div className="db-promo-text">
                      <h4 className="db-promo-title">Book your favorite turf</h4>
                      <p className="db-promo-sub">Play. Compete. Enjoy the game.</p>
                    </div>
                    <button onClick={() => window.location.href = '/book'} className="db-promo-btn">
                      Book Now
                    </button>
                  </div>
                </div>

                {/* Metrics */}
                <div className="db-metrics-grid">
                  <div className="db-metric-card">
                    <div className="db-metric-icon-circle" style={{ backgroundColor: '#E8F8F0', color: '#00C853' }}>
                      <FiCalendar />
                    </div>
                    <div>
                      <h2 className="db-metric-value" style={{ color: '#00C853' }}>10</h2>
                      <p className="db-metric-label">Total Bookings</p>
                    </div>
                  </div>

                  <div className="db-metric-card">
                    <div className="db-metric-icon-circle" style={{ backgroundColor: '#EFF6FF', color: '#3B82F6' }}>
                      <FiCalendar />
                    </div>
                    <div>
                      <h2 className="db-metric-value" style={{ color: '#3B82F6' }}>0</h2>
                      <p className="db-metric-label">Upcoming</p>
                    </div>
                  </div>

                  <div className="db-metric-card">
                    <div className="db-metric-icon-circle" style={{ backgroundColor: '#FFF7ED', color: '#EA580C' }}>
                      <FiDollarSign />
                    </div>
                    <div>
                      <h2 className="db-metric-value" style={{ color: '#EA580C' }}>₹7000</h2>
                      <p className="db-metric-label">Total Spent</p>
                    </div>
                  </div>

                  <div className="db-metric-card">
                    <div className="db-metric-icon-circle" style={{ backgroundColor: '#F5F3FF', color: '#8B5CF6' }}>
                      <FiClock />
                    </div>
                    <div>
                      <h2 className="db-metric-value" style={{ color: '#8B5CF6' }}>10</h2>
                      <p className="db-metric-label">Past Matches</p>
                    </div>
                  </div>
                </div>

                {/* Bookings Card */}
                <div className="db-bookings-card">
                  <div className="db-card-header">
                    <h3 className="db-card-title">Past Bookings</h3>
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      className="db-select"
                    >
                      <option value="All">All</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div className="db-booking-list">
                    {filteredBookings.map((b) => {
                      const isConfirmed = b.status === 'Confirmed';
                      return (
                        <div key={b.id} className="db-booking-row">
                          <div className="db-booking-row-left">
                            <div className={`db-status-circle ${isConfirmed ? 'confirmed' : 'cancelled'}`}>
                              {isConfirmed ? <FiCheck /> : <FiX />}
                            </div>
                            <div className="db-booking-details">
                              <h4 className="db-booking-team">{b.teamName}</h4>
                              <p className="db-booking-meta">
                                <span>{b.date}</span>
                                <span className="db-meta-dot">•</span>
                                <span>{b.time}</span>
                                <span className="db-meta-dot">•</span>
                                <span>{b.turfName}</span>
                              </p>
                            </div>
                          </div>
                          <div className="db-booking-row-right">
                            <span className={`db-status-badge ${isConfirmed ? 'confirmed' : 'cancelled'}`}>
                              {b.status}
                            </span>
                            <div className="db-chevron">
                              <FiChevronRight />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* PAYMENTS TAB */}
            {activeTab === 'payments' && (
              <>
                <div className="db-header-row">
                  <div>
                    <h1 className="db-welcome-title">Payment History</h1>
                    <p className="db-welcome-sub">View and download your billing statements.</p>
                  </div>
                </div>

                <div className="db-table-card">
                  <table className="db-table">
                    <thead>
                      <tr>
                        <th>Transaction ID</th>
                        <th>Turf / Ground</th>
                        <th>Date Paid</th>
                        <th>Amount Paid</th>
                        <th>Method</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MOCK_PAYMENTS.map((payment) => (
                        <tr key={payment.id}>
                          <td style={{ fontFamily: 'monospace', fontWeight: 600, color: '#475569' }}>{payment.id}</td>
                          <td>{payment.turf}</td>
                          <td>{payment.date}</td>
                          <td style={{ fontWeight: 700, color: '#0F172A' }}>{payment.amount}</td>
                          <td>{payment.method}</td>
                          <td>
                            <span className="db-status-badge confirmed" style={{ padding: '3px 8px' }}>
                              {payment.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <>
                <div className="db-header-row">
                  <div>
                    <h1 className="db-welcome-title">Profile Settings</h1>
                    <p className="db-welcome-sub">Manage your personal information and contact details.</p>
                  </div>
                </div>

                <div className="db-profile-card">
                  <form onSubmit={handleProfileUpdate}>
                    <div className="db-form-group">
                      <label className="db-form-label">Full Name</label>
                      <input
                        type="text"
                        value={profName}
                        onChange={(e) => setProfName(e.target.value)}
                        className="db-form-input"
                        placeholder="Enter full name"
                        required
                      />
                    </div>
                    <div className="db-form-group">
                      <label className="db-form-label">Email Address</label>
                      <input
                        type="email"
                        value={profEmail}
                        onChange={(e) => setProfEmail(e.target.value)}
                        className="db-form-input"
                        placeholder="name@example.com"
                        required
                      />
                    </div>
                    <div className="db-form-group">
                      <label className="db-form-label">Mobile Number</label>
                      <input
                        type="tel"
                        value={profPhone}
                        onChange={(e) => setProfPhone(e.target.value)}
                        className="db-form-input"
                        placeholder="Enter 10 digit number"
                        required
                      />
                    </div>
                    <button type="submit" className="db-form-btn">
                      Update Profile Info
                    </button>
                  </form>
                </div>
              </>
            )}

            {/* STATISTICS TAB */}
            {activeTab === 'stats' && (
              <>
                <div className="db-header-row">
                  <div>
                    <h1 className="db-welcome-title">Booking Stats</h1>
                    <p className="db-welcome-sub">Analyze your gameplay stats and match distributions.</p>
                  </div>
                </div>

                <div className="db-stats-grid-inner">
                  
                  {/* Left stats card */}
                  <div className="db-stats-chart-card">
                    <h3 className="db-card-title" style={{ marginBottom: 18 }}>Activity Breakdown</h3>
                    
                    <div className="db-stat-item-row">
                      <div className="db-stat-item-info">
                        <span>Total Matches Played</span>
                        <span>10</span>
                      </div>
                      <div className="db-progress-bar-bg">
                        <div className="db-progress-bar-fill" style={{ width: '100%', backgroundColor: '#8B5CF6' }} />
                      </div>
                    </div>

                    <div className="db-stat-item-row">
                      <div className="db-stat-item-info">
                        <span>Confirmed Booking Ratio</span>
                        <span>2 / 7 (28%)</span>
                      </div>
                      <div className="db-progress-bar-bg">
                        <div className="db-progress-bar-fill" style={{ width: '28%' }} />
                      </div>
                    </div>

                    <div className="db-stat-item-row">
                      <div className="db-stat-item-info">
                        <span>Cancelled Booking Ratio</span>
                        <span>5 / 7 (72%)</span>
                      </div>
                      <div className="db-progress-bar-bg">
                        <div className="db-progress-bar-fill" style={{ width: '72%', backgroundColor: '#EF4444' }} />
                      </div>
                    </div>
                  </div>

                  {/* Right stats card */}
                  <div className="db-stats-chart-card">
                    <h3 className="db-card-title" style={{ marginBottom: 18 }}>Ground Distribution</h3>
                    <div className="db-stat-item-row">
                      <div className="db-stat-item-info">
                        <span>EROTURF - Main Ground</span>
                        <span>100%</span>
                      </div>
                      <div className="db-progress-bar-bg">
                        <div className="db-progress-bar-fill" style={{ width: '100%', backgroundColor: '#00C853' }} />
                      </div>
                    </div>

                    <div className="db-stat-item-row" style={{ marginTop: 24 }}>
                      <h4 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#475569' }}>Preferred Slot</h4>
                      <p style={{ margin: '6px 0 0 0', fontSize: 16, fontWeight: 800, color: '#0F172A' }}>
                        08:00 PM - 09:00 PM
                      </p>
                      <p style={{ margin: '2px 0 0 0', fontSize: 12, color: '#64748B' }}>
                        You booked this slot 3 times.
                      </p>
                    </div>
                  </div>

                </div>
              </>
            )}

            {/* SETTINGS TAB */}
            {activeTab === 'settings' && (
              <>
                <div className="db-header-row">
                  <div>
                    <h1 className="db-welcome-title">Settings</h1>
                    <p className="db-welcome-sub">Configure notifications and messaging choices.</p>
                  </div>
                </div>

                <div className="db-settings-card">
                  <h3 className="db-card-title" style={{ marginBottom: 16 }}>Notification Channels</h3>
                  
                  <div className="db-toggle-row">
                    <div>
                      <span className="db-toggle-label">Email Alerts</span>
                      <p className="db-toggle-desc">Receive confirmation receipt emails for all turf bookings.</p>
                    </div>
                    <label className="db-switch">
                      <input type="checkbox" checked={emailNotif} onChange={() => handleToggle('email')} />
                      <span className="db-slider" />
                    </label>
                  </div>

                  <div className="db-toggle-row">
                    <div>
                      <span className="db-toggle-label">SMS Updates</span>
                      <p className="db-toggle-desc">Receive instant text alerts for bookings and match reminders.</p>
                    </div>
                    <label className="db-switch">
                      <input type="checkbox" checked={smsNotif} onChange={() => handleToggle('sms')} />
                      <span className="db-slider" />
                    </label>
                  </div>

                  <div className="db-toggle-row">
                    <div>
                      <span className="db-toggle-label">WhatsApp Notifications</span>
                      <p className="db-toggle-desc">Receive electronic ticket confirmations and chat support notifications.</p>
                    </div>
                    <label className="db-switch">
                      <input type="checkbox" checked={wpNotif} onChange={() => handleToggle('wp')} />
                      <span className="db-slider" />
                    </label>
                  </div>
                </div>
              </>
            )}

          </main>

        </div>
      </div>
    </>
  );
}
