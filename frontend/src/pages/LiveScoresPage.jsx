import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import LiveMatchCard, { UpcomingMatchCard } from '../components/cricket/MatchCards';
import { MatchCardSkeleton } from '../components/ui/LoadingSkeleton';
import { getLiveMatches, getUpcomingMatches } from '../services/api';
import { FiRefreshCw, FiActivity, FiClock } from 'react-icons/fi';
import toast from 'react-hot-toast';

const REFRESH_INTERVAL = 30000; // 30 seconds

export default function LiveScoresPage() {
  const [activeTab, setActiveTab] = useState('live');
  const [liveMatches, setLiveMatches] = useState([]);
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [source, setSource] = useState('');
  const [error, setError] = useState(null);

  const fetchMatches = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      // Fetch Live Matches
      const liveRes = await getLiveMatches();
      setLiveMatches(liveRes.data.data || []);
      setSource(liveRes.data.source);
      setLastUpdated(new Date());

      // Fetch Upcoming Matches
      const upcomingRes = await getUpcomingMatches();
      setUpcomingMatches(upcomingRes.data.data || []);
    } catch (err) {
      console.error("Error fetching match data:", err);
      const errMsg = err?.response?.data?.message || "Failed to fetch cricket scores from server.";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMatches();
    const interval = setInterval(() => fetchMatches(true), REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchMatches]);

  return (
    <div className="min-h-screen pb-16 bg-white" style={{ paddingTop: '130px' }}>
      <div className="container mx-auto px-6 md:px-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between mb-8 flex-wrap gap-4"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="badge badge-green flex items-center gap-1.5">
                <FiActivity className="text-sm" />
                CRICKET ZONE
              </span>
            </div>
            <h1 className="section-heading text-[#0F172A]">Match Centre</h1>
            {lastUpdated && activeTab === 'live' && (
              <p className="text-xs text-[#475569] mt-1">
                Last Sync: {lastUpdated.toLocaleTimeString()}
                {source === 'mock' && ' · Demo data'}
                {' '}· Auto-refreshing every 30s
              </p>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => fetchMatches(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all bg-[#D1FAE5] hover:bg-[#A7F3D0] text-[#047857] border border-[rgba(16,185,129,0.3)] shadow-sm"
            id="refresh-live-btn"
          >
            <FiRefreshCw className={refreshing ? 'animate-spin' : ''} />
            Refresh Scores
          </motion.button>
        </motion.div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#E2E8F0] mb-8 gap-6">
          <button
            onClick={() => setActiveTab('live')}
            className={`pb-3 text-lg font-bold border-b-2 transition-all relative ${
              activeTab === 'live'
                ? 'border-[#10B981] text-[#10B981]'
                : 'border-transparent text-[#475569] hover:text-[#0F172A]'
            }`}
          >
            Live Scores
            {liveMatches.length > 0 && (
              <span className="ml-2 bg-[#EF4444] text-white text-xs px-2 py-0.5 rounded-full font-bold">
                {liveMatches.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`pb-3 text-lg font-bold border-b-2 transition-all relative ${
              activeTab === 'upcoming'
                ? 'border-[#10B981] text-[#10B981]'
                : 'border-transparent text-[#475569] hover:text-[#0F172A]'
            }`}
          >
            Upcoming Fixtures
            {upcomingMatches.length > 0 && (
              <span className="ml-2 bg-[#3B82F6] text-white text-xs px-2 py-0.5 rounded-full font-bold">
                {upcomingMatches.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab Contents */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <MatchCardSkeleton key={i} />)}
          </div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 border border-[#EF4444]/20 rounded-2xl bg-[#FEF2F2] max-w-2xl mx-auto p-6"
          >
            <FiActivity className="text-5xl mx-auto mb-4 text-[#EF4444] animate-pulse" />
            <p className="text-lg font-bold text-[#991B1B]">Cricket Data Feed Error</p>
            <p className="text-sm text-[#B91C1C] mt-2 font-medium bg-white/60 inline-block px-4 py-2 rounded-xl border border-[#FEE2E2]">
              {error}
            </p>
            <p className="text-xs text-[#7F1D1D]/70 mt-4 leading-relaxed max-w-md mx-auto font-medium">
              We connect to CricAPI to retrieve live cricket data. The configured API key has exceeded its daily hits limit or is invalid. Please update your environment key or try again later.
            </p>
          </motion.div>
        ) : activeTab === 'live' ? (
          liveMatches.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 border border-dashed border-[#E2E8F0] rounded-2xl bg-[#F8FAFC]"
            >
              <FiActivity className="text-5xl mx-auto mb-4 text-[#475569]" />
              <p className="text-lg font-bold text-[#0F172A]">No live matches right now</p>
              <p className="text-sm text-[#475569] mt-1">Check back later or view upcoming fixtures</p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              {liveMatches.map((match, i) => (
                <motion.div
                  key={match.id || i}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <LiveMatchCard match={match} />
                </motion.div>
              ))}
            </motion.div>
          )
        ) : (
          upcomingMatches.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 border border-dashed border-[#E2E8F0] rounded-2xl bg-[#F8FAFC]"
            >
              <FiClock className="text-5xl mx-auto mb-4 text-[#475569]" />
              <p className="text-lg font-bold text-[#0F172A]">No upcoming matches scheduled</p>
              <p className="text-sm text-[#475569] mt-1">Stay tuned for tournament announcements!</p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              {upcomingMatches.map((match, i) => (
                <motion.div
                  key={match.id || i}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <UpcomingMatchCard match={match} />
                </motion.div>
              ))}
            </motion.div>
          )
        )}
      </div>
    </div>
  );
}
