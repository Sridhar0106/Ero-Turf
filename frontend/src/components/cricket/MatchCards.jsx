import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMapPin, FiWifi, FiTrendingUp } from 'react-icons/fi';

function getTeamInitials(name) {
  return name
    ?.split(' ')
    .map((w) => w[0])
    .slice(0, 3)
    .join('')
    .toUpperCase() || '??';
}

const teamColors = [
  '#10B981', '#3B82F6', '#EF4444', '#8B5CF6',
  '#F59E0B', '#06B6D4', '#EC4899', '#10B981',
];

function TeamLogo({ name, img, size = 48 }) {
  if (img) {
    return (
      <img
        src={img}
        alt={name}
        style={{ width: size, height: size, objectFit: 'contain' }}
        onError={(e) => (e.target.style.display = 'none')}
      />
    );
  }
  const color = teamColors[name?.charCodeAt(0) % teamColors.length] || '#10B981';
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: `${color}15`,
        border: `2px solid ${color}30`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.28,
        fontWeight: 800,
        color,
        fontFamily: 'var(--font-brand)',
        letterSpacing: 1,
      }}
    >
      {getTeamInitials(name)}
    </div>
  );
}

function getFractionalOvers(oversVal) {
  const oversStr = String(oversVal);
  if (!oversStr.includes('.')) return parseFloat(oversStr) || 0;
  const [overs, balls] = oversStr.split('.').map(Number);
  return overs + (balls || 0) / 6;
}

function calculateRunRate(runs, oversVal) {
  const overs = getFractionalOvers(oversVal);
  if (overs === 0) return 0;
  return runs / overs;
}

export default function LiveMatchCard({ match }) {
  const { name, matchType, status, venue, teams = [], teamInfo = [], score = [] } = match;
  const [expanded, setExpanded] = useState(false);

  const team1 = teamInfo[0] || { name: teams[0] || 'Team A', shortname: 'T1' };
  const team2 = teamInfo[1] || { name: teams[1] || 'Team B', shortname: 'T2' };
  const score1 = score[0];
  const score2 = score[1];

  const isFinished = match.matchEnded || 
                     (status && /won|tied|draw|no result|abandoned/i.test(status));

  return (
    <motion.div
      whileHover={{ y: -4, borderColor: 'var(--color-border-green)' }}
      className="glass p-5 rounded-2xl transition-all duration-300 border border-[#E2E8F0] bg-white flex flex-col justify-between"
      style={{ cursor: 'default' }}
    >
      <div>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0 pr-2">
            <p className="text-xs font-semibold text-[#475569] uppercase tracking-wider">{matchType}</p>
            <h3 className="text-sm font-semibold text-[#0F172A] mt-0.5 truncate">{name}</h3>
          </div>
          {isFinished ? (
            <div className="flex items-center gap-1.5 shrink-0 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
              <span className="w-1.5 h-1.5 rounded-full bg-[#64748B]" />
              <span
                className="text-[10px] font-extrabold uppercase tracking-wider text-[#64748B]"
              >
                Finished
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 shrink-0 bg-[#FEF2F2] px-2.5 py-1 rounded-full border border-[#FEE2E2]">
              <div className="live-dot animate-pulse" />
              <span
                className="text-[10px] font-extrabold uppercase tracking-wider text-[#EF4444]"
              >
                Live
              </span>
            </div>
          )}
        </div>

        {/* Scoreboard */}
        <div className="flex items-center gap-3">
          {/* Team 1 */}
          <div className="flex-1 flex items-center gap-3">
            <TeamLogo name={team1.name} img={team1.img} size={44} />
            <div>
              <p className="text-sm font-bold text-[#0F172A]">{team1.shortname || team1.name}</p>
              {score1 ? (
                <p
                  className="text-lg font-black"
                  style={{ fontFamily: 'var(--font-brand)', color: 'var(--color-primary-dark)' }}
                >
                  {score1.r}/{score1.w}
                  <span className="text-xs font-normal text-[#475569] ml-1">
                    ({score1.o} ov)
                  </span>
                </p>
              ) : (
                <p className="text-[#475569] text-xs">Yet to bat</p>
              )}
            </div>
          </div>

          {/* VS */}
          <div className="text-center px-2">
            <p className="text-xs font-black text-[#475569]">VS</p>
          </div>

          {/* Team 2 */}
          <div className="flex-1 flex items-center gap-3 flex-row-reverse text-right">
            <TeamLogo name={team2.name} img={team2.img} size={44} />
            <div>
              <p className="text-sm font-bold text-[#0F172A]">{team2.shortname || team2.name}</p>
              {score2 ? (
                <p
                  className="text-lg font-black"
                  style={{ fontFamily: 'var(--font-brand)', color: '#2563eb' }}
                >
                  {score2.r}/{score2.w}
                  <span className="text-xs font-normal text-[#475569] ml-1">
                    ({score2.o} ov)
                  </span>
                </p>
              ) : (
                <p className="text-[#475569] text-xs">Yet to bat</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div>
        {/* Footer */}
        <div
          className="flex items-center justify-between mt-4 pt-4 border-t border-[#E2E8F0] gap-2"
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <FiMapPin className="text-xs text-[#475569] shrink-0" />
            <p className="text-xs text-[#475569] truncate">{venue}</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className="text-xs font-extrabold text-[#00C853] hover:text-[#00B248] transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
          >
            {expanded ? 'Hide Scorecard ▲' : 'View Scorecard ▼'}
          </button>
        </div>

        {/* Scorecard Expansion */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0, marginTop: 0 }}
              animate={{ height: 'auto', opacity: 1, marginTop: 16 }}
              exit={{ height: 0, opacity: 0, marginTop: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden border-t border-slate-100 pt-4 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-black text-[#64748B] uppercase tracking-wider">Innings Summary</h4>
                {isFinished && (
                  <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                    Result Out
                  </span>
                )}
              </div>

              <div className="space-y-2.5">
                {/* Team 1 Innings */}
                <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-3 flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-bold text-slate-800 truncate">{team1.name}</p>
                    <p className="text-[9px] font-semibold text-slate-400 mt-0.5">
                      {score1?.inning || 'First Innings'}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-black text-slate-800">
                      {score1 ? `${score1.r}/${score1.w}` : 'DNB'}
                    </p>
                    {score1 && (
                      <p className="text-[9px] font-semibold text-slate-500 mt-0.5">
                        Overs: {score1.o} · RR: {calculateRunRate(score1.r, score1.o).toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Team 2 Innings */}
                <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-3 flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-bold text-slate-800 truncate">{team2.name}</p>
                    <p className="text-[9px] font-semibold text-slate-400 mt-0.5">
                      {score2?.inning || 'Second Innings'}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-black text-slate-800">
                      {score2 ? `${score2.r}/${score2.w}` : 'DNB'}
                    </p>
                    {score2 && (
                      <p className="text-[9px] font-semibold text-slate-500 mt-0.5">
                        Overs: {score2.o} · RR: {calculateRunRate(score2.r, score2.o).toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Graphic compare */}
              {score1 && score2 && (
                <div className="space-y-1 bg-slate-50/40 p-2.5 rounded-xl border border-slate-100/50">
                  <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-wider">
                    <span>{team1.shortname || 'Team 1'} ({score1.r})</span>
                    <span>{team2.shortname || 'Team 2'} ({score2.r})</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden flex">
                    <div 
                      style={{ width: `${(score1.r / (score1.r + score2.r)) * 100}%` }} 
                      className="h-full bg-emerald-500"
                    />
                    <div 
                      style={{ width: `${(score2.r / (score1.r + score2.r)) * 100}%` }} 
                      className="h-full bg-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* Winner banner */}
              {isFinished && (
                <div className="bg-amber-50/80 border border-amber-200/50 rounded-xl p-3 flex items-center gap-3">
                  <span className="text-2xl animate-bounce">🏆</span>
                  <div className="min-w-0">
                    <p className="text-[9px] font-extrabold text-amber-800 uppercase tracking-wider">Match Result</p>
                    <p className="text-xs font-black text-amber-950 mt-0.5 leading-snug">
                      {status || 'Match finished'}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export function UpcomingMatchCard({ match }) {
  const { name, matchType, date, dateTimeGMT, venue, teams = [], teamInfo = [] } = match;
  const team1 = teamInfo[0] || { name: teams[0] || 'Team A', shortname: 'T1' };
  const team2 = teamInfo[1] || { name: teams[1] || 'Team B', shortname: 'T2' };

  const matchDate = new Date(dateTimeGMT || date);
  const now = new Date();
  const diffMs = matchDate - now;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  const countdown =
    diffMs > 0
      ? diffDays > 0
        ? `${diffDays}d ${diffHours}h`
        : `${diffHours}h ${diffMins}m`
      : 'Starting soon';

  return (
    <motion.div
      whileHover={{ y: -4, borderColor: 'rgba(59,130,246,0.3)' }}
      className="glass p-5 rounded-2xl transition-all duration-300 border border-[#E2E8F0] bg-white"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0 pr-2">
          <p className="text-xs font-semibold text-[#475569] uppercase tracking-wider">{matchType}</p>
          <h3 className="text-sm font-semibold text-[#0F172A] mt-0.5">{name}</h3>
        </div>
        <span className="badge badge-blue shrink-0">Upcoming</span>
      </div>

      {/* Teams */}
      <div className="flex items-center gap-4 py-2">
        <div className="flex items-center gap-2 flex-1">
          <TeamLogo name={team1.name} img={team1.img} size={40} />
          <p className="text-sm font-bold text-[#0F172A]">{team1.shortname || team1.name}</p>
        </div>
        <div className="text-center">
          <p className="text-xs font-black text-[#475569]">VS</p>
        </div>
        <div className="flex items-center gap-2 flex-1 flex-row-reverse">
          <TeamLogo name={team2.name} img={team2.img} size={40} />
          <p className="text-sm font-bold text-[#0F172A] text-right">{team2.shortname || team2.name}</p>
        </div>
      </div>

      {/* Countdown */}
      <div
        className="flex items-center justify-between mt-4 pt-4 border-t border-[#E2E8F0]"
      >
        <div className="flex items-center gap-2">
          <FiMapPin className="text-xs text-[#475569]" />
          <p className="text-xs text-[#475569] truncate max-w-[180px]">{venue}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <FiTrendingUp className="text-xs text-[#d97706]" />
          <span className="text-sm font-bold text-[#d97706]" style={{ fontFamily: 'var(--font-brand)' }}>
            {countdown}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
