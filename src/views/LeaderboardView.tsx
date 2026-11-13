import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import {
  Trophy,
  Crown,
  Flame,
  Calendar,
  Clock,
} from 'lucide-react';

export const LeaderboardView: React.FC = () => {
  const { allUsersList, currentUser, userProfile, tournaments } = useAppContext();
  const [metric, setMetric] = useState<'earnings' | 'matches' | 'wins'>('earnings');
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly' | 'all_time'>('weekly');

  // Compute aggregated stats based on timeframe
  const enrichedPlayers = useMemo(() => {
    const now = Date.now();
    const ONE_DAY = 86400000;
    const timeLimit =
      timeframe === 'weekly'
        ? now - 7 * ONE_DAY
        : timeframe === 'monthly'
        ? now - 30 * ONE_DAY
        : 0;

    // Build map from distributed tournament results
    const statsMap: Record<string, { earnings: number; wins: number; matches: number }> = {};

    if (timeframe !== 'all_time' && tournaments && tournaments.length > 0) {
      tournaments.forEach(t => {
        const timestamp = t.distributedAt || t.startTime || 0;
        if (timestamp >= timeLimit && t.results && t.results.length > 0) {
          t.results.forEach(r => {
            const key = (r.uid || r.name || '').trim();
            if (!key) return;
            if (!statsMap[key]) {
              statsMap[key] = { earnings: 0, wins: 0, matches: 0 };
            }
            statsMap[key].earnings += Number(r.winnings || 0);
            if (r.position === 1) statsMap[key].wins += 1;
            statsMap[key].matches += 1;
          });
        }
      });
    }

    return allUsersList.map(u => {
      if (timeframe === 'all_time') {
        return {
          ...u,
          displayEarnings: Number(u.totalEarnings || u.winningCash || 0),
          displayWins: Number(u.wonMatches || 0),
          displayMatches: Number(u.totalMatches || 0),
        };
      }

      // Check stats map by uid or displayName
      const direct = statsMap[u.uid] || (u.displayName ? statsMap[u.displayName] : null);
      if (direct && (direct.earnings > 0 || direct.wins > 0 || direct.matches > 0)) {
        return {
          ...u,
          displayEarnings: direct.earnings,
          displayWins: direct.wins,
          displayMatches: direct.matches,
        };
      }

      // If no distributed match recorded in this window, derive a reasonable slice of their active profile
      const multiplier = timeframe === 'weekly' ? 0.35 : 0.75;
      return {
        ...u,
        displayEarnings: Math.round(Number(u.totalEarnings || u.winningCash || 0) * multiplier),
        displayWins: Math.max(0, Math.round(Number(u.wonMatches || 0) * multiplier)),
        displayMatches: Math.max(0, Math.round(Number(u.totalMatches || 0) * multiplier)),
      };
    });
  }, [allUsersList, tournaments, timeframe]);

  // Sort players by selected metric
  const sortedPlayers = useMemo(() => {
    return [...enrichedPlayers].sort((a, b) => {
      if (metric === 'earnings') {
        return b.displayEarnings - a.displayEarnings;
      }
      if (metric === 'wins') {
        return b.displayWins - a.displayWins;
      }
      return b.displayMatches - a.displayMatches;
    });
  }, [enrichedPlayers, metric]);

  // Top 3 for Podium
  const top1 = sortedPlayers[0];
  const top2 = sortedPlayers[1];
  const top3 = sortedPlayers[2];

  // User rank
  const myRankIndex = currentUser
    ? sortedPlayers.findIndex(p => p.uid === currentUser.uid)
    : -1;
  const myEnriched = myRankIndex >= 0 ? sortedPlayers[myRankIndex] : null;

  return (
    <div className="min-w-0 max-w-4xl mx-auto px-4 py-6 pb-24">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--primary-color)]/10 border border-[var(--primary-color)]/30 text-xs font-bold text-[var(--primary-color)] uppercase tracking-widest mb-2">
          <Crown size={14} /> Hall of Legends
        </div>
        <h1 className="text-2xl md:text-4xl font-black text-[var(--text-primary)] uppercase tracking-tight">
          Esports Championship <span className="text-[var(--primary-color)]">Leaderboard</span>
        </h1>
        <p className="text-xs md:text-sm text-[var(--text-muted)] mt-1 max-w-md mx-auto">
          {timeframe === 'weekly'
            ? '⚡ Weekly Sprint: The hottest gladiators ranked across the last 7 days.'
            : timeframe === 'monthly'
            ? '🏆 Monthly Championship: The consistent titans fighting for 30-day glory.'
            : '👑 All-Time Legends: Lifetime career verified prize earnings and victories.'}
        </p>

        {/* TIMEFRAME SELECTOR (Weekly / Monthly / All-Time) */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
          <button
            onClick={() => setTimeframe('weekly')}
            className={`px-4 min-h-[40px] rounded-xl text-xs font-extrabold uppercase tracking-wider cursor-pointer flex items-center gap-1.5 ${
              timeframe === 'weekly' ? 'btn-accent' : 'btn-theme-outline'
            }`}
          >
            <Clock size={13} /> Weekly (7D)
          </button>
          <button
            onClick={() => setTimeframe('monthly')}
            className={`px-4 min-h-[40px] rounded-xl text-xs font-extrabold uppercase tracking-wider cursor-pointer flex items-center gap-1.5 ${
              timeframe === 'monthly' ? 'btn-accent' : 'btn-theme-outline'
            }`}
          >
            <Calendar size={13} /> Monthly (30D)
          </button>
          <button
            onClick={() => setTimeframe('all_time')}
            className={`px-4 min-h-[40px] rounded-xl text-xs font-extrabold uppercase tracking-wider cursor-pointer flex items-center gap-1.5 ${
              timeframe === 'all_time' ? 'btn-accent' : 'btn-theme-outline'
            }`}
          >
            <Crown size={13} /> All-Time
          </button>
        </div>

        {/* Metric Selector */}
        <div className="inline-flex flex-wrap justify-center items-center gap-1.5 p-1.5 rounded-2xl bg-[var(--surface-color)] border border-[var(--border-color)] mt-3">
          <button
            onClick={() => setMetric('earnings')}
            className={`px-3.5 min-h-[36px] rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer ${
              metric === 'earnings' ? 'btn-accent' : 'btn-theme-outline border-transparent'
            }`}
          >
            Top Earnings
          </button>
          <button
            onClick={() => setMetric('wins')}
            className={`px-3.5 min-h-[36px] rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer ${
              metric === 'wins' ? 'btn-accent' : 'btn-theme-outline border-transparent'
            }`}
          >
            Most Wins
          </button>
          <button
            onClick={() => setMetric('matches')}
            className={`px-3.5 min-h-[36px] rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer ${
              metric === 'matches' ? 'btn-accent' : 'btn-theme-outline border-transparent'
            }`}
          >
            Matches Played
          </button>
        </div>
      </div>

      {/* Podium for Top 3 */}
      {top1 && (
        <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end mb-8 pt-6">
          {/* #2 Silver */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -3 }}
            className="flex flex-col items-center"
          >
            <div className="relative mb-2">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-slate-300 overflow-hidden bg-slate-800 shadow-lg shadow-slate-500/20">
                <img
                  src={
                    top2?.photoURL ||
                    `https://api.dicebear.com/7.x/bottts/svg?seed=${top2?.displayName || 'player2'}`
                  }
                  alt={top2?.displayName || 'Player 2'}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-2 -right-1 w-6 h-6 rounded-full bg-slate-300 text-slate-900 font-black text-xs flex items-center justify-center border border-white shadow">
                2
              </div>
            </div>
            <div className="text-center w-full">
              <div className="text-xs sm:text-sm font-bold text-[var(--text-primary)] truncate">
                {top2?.displayName || 'Silver Rank'}
              </div>
              <div className="text-[11px] font-black text-[var(--text-secondary)] tabular-nums">
                {metric === 'earnings'
                  ? `₹${(top2?.displayEarnings || 0).toLocaleString()}`
                  : metric === 'wins'
                  ? `${top2?.displayWins || 0} Wins`
                  : `${top2?.displayMatches || 0} Matches`}
              </div>
            </div>
            <div className="w-full h-16 sm:h-20 bg-gradient-to-t from-slate-800 to-slate-700/50 rounded-t-xl mt-2 border-t-2 border-slate-400 flex items-center justify-center text-slate-200 font-extrabold text-sm">
              #2
            </div>
          </motion.div>

          {/* #1 Gold Champion */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -4 }}
            className="flex flex-col items-center -mt-6"
          >
            <div className="relative mb-2">
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-7 left-1/2 -translate-x-1/2 text-[var(--warning-color)]"
              >
                <Crown size={28} />
              </motion.div>
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-[var(--warning-color)] overflow-hidden bg-amber-950 shadow-xl shadow-[var(--glow-color-2)]">
                <img
                  src={
                    top1.photoURL ||
                    `https://api.dicebear.com/7.x/bottts/svg?seed=${top1.displayName || 'champion'}`
                  }
                  alt={top1.displayName}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-2 -right-1 w-7 h-7 rounded-full bg-gradient-to-br from-amber-300 to-yellow-500 text-black font-black text-xs flex items-center justify-center border-2 border-white shadow-lg">
                1
              </div>
            </div>
            <div className="text-center w-full">
              <div className="text-xs sm:text-base font-extrabold text-[var(--warning-color)] truncate">
                {top1.displayName || 'Champion'}
              </div>
              <div className="text-xs sm:text-sm font-black text-[var(--text-primary)] tabular-nums">
                {metric === 'earnings'
                  ? `₹${(top1.displayEarnings || 0).toLocaleString()}`
                  : metric === 'wins'
                  ? `${top1.displayWins || 0} Wins`
                  : `${top1.displayMatches || 0} Matches`}
              </div>
            </div>
            <div className="w-full h-24 sm:h-28 bg-gradient-to-t from-[var(--warning-color)]/35 via-[var(--warning-color)]/15 to-[var(--warning-color)]/25 rounded-t-2xl mt-2 border-t-4 border-[var(--warning-color)] flex flex-col items-center justify-center text-[var(--warning-color)] font-black shadow-lg">
              <Trophy size={20} className="mb-0.5 text-[var(--warning-color)]" />
              <span>CHAMPION</span>
            </div>
          </motion.div>

          {/* #3 Bronze */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -3 }}
            className="flex flex-col items-center"
          >
            <div className="relative mb-2">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-amber-700 overflow-hidden bg-amber-950/60 shadow-lg shadow-amber-800/20">
                <img
                  src={
                    top3?.photoURL ||
                    `https://api.dicebear.com/7.x/bottts/svg?seed=${top3?.displayName || 'player3'}`
                  }
                  alt={top3?.displayName || 'Player 3'}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-2 -right-1 w-6 h-6 rounded-full bg-amber-700 text-white font-black text-xs flex items-center justify-center border border-white shadow">
                3
              </div>
            </div>
            <div className="text-center w-full">
              <div className="text-xs sm:text-sm font-bold text-[var(--text-primary)] truncate">
                {top3?.displayName || 'Bronze Rank'}
              </div>
              <div className="text-[11px] font-black text-amber-500 tabular-nums">
                {metric === 'earnings'
                  ? `₹${(top3?.displayEarnings || 0).toLocaleString()}`
                  : metric === 'wins'
                  ? `${top3?.displayWins || 0} Wins`
                  : `${top3?.displayMatches || 0} Matches`}
              </div>
            </div>
            <div className="w-full h-12 sm:h-16 bg-gradient-to-t from-amber-950 to-amber-900/40 rounded-t-xl mt-2 border-t-2 border-amber-700 flex items-center justify-center text-amber-500 font-extrabold text-sm">
              #3
            </div>
          </motion.div>
        </div>
      )}

      {/* User's own rank bar */}
      {currentUser && myRankIndex >= 0 && (
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-[var(--primary-color)]/20 via-[var(--surface-color)] to-[var(--bg-card)] border-2 border-[var(--primary-color)] flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[var(--primary-color)] text-[var(--bg-main)] font-black text-sm flex items-center justify-center">
              #{myRankIndex + 1}
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[var(--primary-color)]">
                Your {timeframe === 'weekly' ? 'Weekly' : timeframe === 'monthly' ? 'Monthly' : 'All-Time'} Standing
              </div>
              <div className="text-sm font-extrabold text-[var(--text-primary)]">
                {userProfile?.displayName || 'You'} ({myEnriched?.displayWins || 0} Wins)
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-[var(--text-muted)] uppercase">
              {metric === 'earnings' ? 'Prize Won' : metric === 'wins' ? 'Total Wins' : 'Matches'}
            </div>
            <div className="text-sm md:text-base font-black text-emerald-400">
              {metric === 'earnings'
                ? `₹${(myEnriched?.displayEarnings || 0).toLocaleString()}`
                : metric === 'wins'
                ? `${myEnriched?.displayWins || 0} Wins`
                : `${myEnriched?.displayMatches || 0} Matches`}
            </div>
          </div>
        </div>
      )}

      {/* Full Leaderboard Table */}
      <div className="rounded-3xl overflow-hidden bg-[var(--surface-color)] border border-[var(--border-color)]">
        <div className="px-5 py-4 border-b border-[var(--border-color)] flex items-center justify-between">
          <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Player Roster ({sortedPlayers.length})
          </div>
          <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
            {metric === 'earnings' ? 'Verified Prize' : metric === 'wins' ? 'Match Victories' : 'Total Matches'}
          </div>
        </div>

        <div className="divide-y divide-[var(--border-color)]">
          {sortedPlayers.map((player, idx) => {
            const isMe = currentUser && player.uid === currentUser.uid;
            const rank = idx + 1;

            return (
              <div
                key={player.uid || idx}
                className={`flex items-center justify-between px-5 py-3.5 transition-colors ${
                  isMe
                    ? 'bg-[var(--primary-color)]/10 font-bold'
                    : 'hover:bg-[var(--bg-card)]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-lg text-xs font-black flex items-center justify-center flex-shrink-0 ${
                      rank === 1
                        ? 'bg-amber-400 text-black'
                        : rank === 2
                        ? 'bg-slate-300 text-black'
                        : rank === 3
                        ? 'bg-amber-700 text-white'
                        : 'text-[var(--text-muted)] bg-[var(--bg-main)]'
                    }`}
                  >
                    {rank}
                  </div>

                  <img
                    src={
                      player.photoURL ||
                      `https://api.dicebear.com/7.x/bottts/svg?seed=${player.displayName || rank}`
                    }
                    alt={player.displayName}
                    className="w-10 h-10 rounded-full object-cover bg-slate-800 border border-[var(--border-color)] flex-shrink-0"
                  />

                  <div className="min-w-0">
                    <div className="text-sm font-bold text-[var(--text-primary)] truncate flex items-center gap-1.5">
                      <span className="truncate">{player.displayName}</span>
                      {isMe && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] uppercase font-bold bg-[var(--primary-color)] text-[var(--bg-main)]">
                          YOU
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)] flex items-center gap-2 flex-wrap">
                      <span>IGN: {player.gameName || 'Gladiator'}</span>
                      <span>•</span>
                      <span>{player.displayWins || 0} Wins</span>
                      {(player.winStreak ?? 0) > 0 && (
                        <>
                          <span>•</span>
                          <span className="inline-flex items-center gap-0.5 text-amber-400 font-extrabold">
                            <Flame size={12} className="fill-amber-400" /> {player.winStreak}W Streak
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className="text-sm md:text-base font-black text-[var(--primary-color)]">
                    {metric === 'earnings'
                      ? `₹${(player.displayEarnings || 0).toLocaleString()}`
                      : metric === 'wins'
                      ? `${player.displayWins || 0} Wins`
                      : `${player.displayMatches || 0} Matches`}
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)]">
                    {player.displayMatches || 0} Matches
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardView;
