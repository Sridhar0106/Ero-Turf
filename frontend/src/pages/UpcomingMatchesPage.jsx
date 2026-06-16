import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UpcomingMatchCard } from '../components/cricket/MatchCards';
import { MatchCardSkeleton } from '../components/ui/LoadingSkeleton';
import { getUpcomingMatches } from '../services/api';
import { FiClock } from 'react-icons/fi';

export default function UpcomingMatchesPage() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const { data } = await getUpcomingMatches();
      setMatches(data.data || []);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-16" style={{ paddingTop: '130px' }}>
      <div className="container mx-auto px-6 md:px-8 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <span className="badge badge-blue mb-3">Schedule</span>
          <h1 className="section-heading gradient-text-white">Upcoming Matches</h1>
          <p className="text-[#8B949E] mt-2">
            Stay ahead of the game — track all upcoming cricket matches
          </p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => <MatchCardSkeleton key={i} />)}
          </div>
        ) : matches.length === 0 ? (
          <div className="text-center py-24">
            <FiClock className="text-6xl mx-auto mb-4" style={{ color: '#8B949E' }} />
            <p className="text-xl font-bold text-[#8B949E]">No upcoming matches</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {matches.map((match, i) => (
              <motion.div
                key={match.id || i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <UpcomingMatchCard match={match} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
