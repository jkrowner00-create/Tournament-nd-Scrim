import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import type { Tournament } from '../types';
import { SlotlistModal } from '../components/SlotlistModal';
import { ScrimRegisterModal } from '../components/ScrimRegisterModal';
import { SoloJoinModal } from '../components/SoloJoinModal';
import { RoomIdPassModal } from '../components/RoomIdPassModal';
import { EsportsCard } from '../components/EsportsCard';
import { PointsTableModal } from '../components/PointsTableModal';
import {
  TournamentFilterBar,
  type SortOption,
  type StatusOption,
} from '../components/TournamentFilterBar';
import {
  Trophy,
  Swords,
  Users,
  Clock,
  Tv,
  MapPin,
  KeyRound,
  CheckCircle2,
  Gamepad2,
  Award,
  Radio,
  Zap,
} from 'lucide-react';

interface TournamentsViewProps {
  initialGameId?: string | null;
  initialMode?: string | null;
}

export type CategoryMode = 'All' | 'Solo' | 'Duo' | 'Squad';

export const TournamentsView: React.FC<TournamentsViewProps> = ({
  initialGameId = null,
  initialMode = null,
}) => {
  const {
    tournaments,
    games,
    currentUser,
    userProfile,
    selectedGameFilter,
    setSelectedGameFilter,
    notifications,
  } = useAppContext();

  // Match Mode: All, Solo, Duo, Squad (Defaults to 'All')
  const [selectedCategory, setSelectedCategory] = useState<CategoryMode>(() => {
    if (initialMode === 'Solo') return 'Solo';
    if (initialMode === 'Duo') return 'Duo';
    if (initialMode === 'Squad') return 'Squad';
    return 'All';
  });

  // Dedicated Match Category: strictly 'upcoming' | 'ongoing' | 'result' (Defaults to 'upcoming')
  const [status, setStatus] = useState<StatusOption>('upcoming');
  const [sortBy, setSortBy] = useState<SortOption>('start_time_asc');
  const [selectedGameId, setSelectedGameId] = useState<string | null>(
    () => selectedGameFilter || initialGameId || null
  );
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Keep selectedGameId in sync with global selection and auto-switch to a tab that has matches
  React.useEffect(() => {
    if (selectedGameFilter !== undefined) {
      setSelectedGameId(selectedGameFilter);
      if (selectedGameFilter) {
        const gameMatches = tournaments.filter(t => t.gameId === selectedGameFilter);
        const hasUpcoming = gameMatches.some(t => (t.status || '').toLowerCase() === 'upcoming');
        const hasOngoing = gameMatches.some(t => (t.status || '').toLowerCase() === 'ongoing');
        const hasResult = gameMatches.some(t => {
          const s = (t.status || '').toLowerCase();
          return s === 'result' || s === 'completed';
        });

        // If currently on a tab with zero tournaments for this game, switch to one that HAS tournaments!
        if (status === 'upcoming' && !hasUpcoming) {
          if (hasOngoing) setStatus('ongoing');
          else if (hasResult) setStatus('result');
        } else if (status === 'ongoing' && !hasOngoing) {
          if (hasUpcoming) setStatus('upcoming');
          else if (hasResult) setStatus('result');
        } else if (status === 'result' && !hasResult) {
          if (hasUpcoming) setStatus('upcoming');
          else if (hasOngoing) setStatus('ongoing');
        }
      }
    }
  }, [selectedGameFilter, tournaments]);

  const handleSelectGameId = (gameId: string | null) => {
    setSelectedGameId(gameId);
    setSelectedGameFilter(gameId);
    if (gameId) {
      const gameMatches = tournaments.filter(t => t.gameId === gameId);
      const hasUpcoming = gameMatches.some(t => (t.status || '').toLowerCase() === 'upcoming');
      const hasOngoing = gameMatches.some(t => (t.status || '').toLowerCase() === 'ongoing');
      const hasResult = gameMatches.some(t => {
        const s = (t.status || '').toLowerCase();
        return s === 'result' || s === 'completed';
      });

      if (status === 'upcoming' && !hasUpcoming) {
        if (hasOngoing) setStatus('ongoing');
        else if (hasResult) setStatus('result');
      } else if (status === 'ongoing' && !hasOngoing) {
        if (hasUpcoming) setStatus('upcoming');
        else if (hasResult) setStatus('result');
      } else if (status === 'result' && !hasResult) {
        if (hasUpcoming) setStatus('upcoming');
        else if (hasOngoing) setStatus('ongoing');
      }
    }
  };

  // Modals state
  const [slotlistTournament, setSlotlistTournament] = useState<Tournament | null>(null);
  const [scrimRegisterData, setScrimRegisterData] = useState<{
    tournament: Tournament;
    slotNumber: number;
    groupKey: string | null;
  } | null>(null);
  const [soloJoinTournament, setSoloJoinTournament] = useState<Tournament | null>(null);
  const [roomIdTournament, setRoomIdTournament] = useState<Tournament | null>(null);
  const [resultsTournament, setResultsTournament] = useState<Tournament | null>(null);
  const [pointsModalTournament, setPointsModalTournament] = useState<Tournament | null>(null);

  const getGameName = (gameId: string) => {
    const game = games.find(g => g.id === gameId);
    return game?.name || 'Battle Royale';
  };

  const getGameImage = (gameId: string) => {
    const game = games.find(g => g.id === gameId);
    return game?.imageUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80';
  };

  const formatDate = (timestamp: number) => {
    if (!timestamp) return 'Scheduled';
    const d = new Date(timestamp);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // When a game is selected, tournaments and counts strictly scope to that selected game!
  const gameScopedTournaments = selectedGameId
    ? tournaments.filter(t => t.gameId === selectedGameId)
    : tournaments;

  // Status Counts strictly scoped to the active game selection
  const statusCounts = {
    upcoming: gameScopedTournaments.filter(t => (t.status || '').toLowerCase() === 'upcoming').length,
    ongoing: gameScopedTournaments.filter(t => (t.status || '').toLowerCase() === 'ongoing').length,
    result: gameScopedTournaments.filter(t => {
      const s = (t.status || '').toLowerCase();
      return s === 'result' || s === 'completed';
    }).length,
  };

  // Accurate Mode Counts for the currently active status tab (Upcoming, Ongoing, or Results)
  const currentStatusTournaments = gameScopedTournaments.filter(t => {
    const s = (t.status || '').toLowerCase();
    if (status === 'upcoming') return s === 'upcoming';
    if (status === 'ongoing') return s === 'ongoing';
    return s === 'result' || s === 'completed';
  });

  const modeCounts = {
    all: currentStatusTournaments.length,
    solo: currentStatusTournaments.filter(t => (t.mode || '').toLowerCase() === 'solo').length,
    duo: currentStatusTournaments.filter(t => (t.mode || '').toLowerCase() === 'duo').length,
    squad: currentStatusTournaments.filter(t => {
      const m = (t.mode || '').toLowerCase();
      return m === 'squad' || m === 'scrim' || t.isScrim;
    }).length,
  };

  // Filtered Tournaments - Strictly categorized into Upcoming, Ongoing, or Results for the selected game
  const filteredTournaments = tournaments.filter(t => {
    // 1. Strict Game Title Filter: Results, Upcoming, and Ongoing ONLY show the selected game's matches
    if (selectedGameId && t.gameId !== selectedGameId) return false;

    // 2. Status Filter: strictly Upcoming vs Ongoing vs Results
    const s = (t.status || '').toLowerCase();
    if (status === 'upcoming' && s !== 'upcoming') return false;
    if (status === 'ongoing' && s !== 'ongoing') return false;
    if (status === 'result' && s !== 'result' && s !== 'completed') return false;

    // 3. Mode Sub-Filter (Case-Insensitive): All, Solo, Duo, Squad
    if (selectedCategory !== 'All') {
      const m = (t.mode || '').toLowerCase();
      if (selectedCategory === 'Solo' && m !== 'solo') return false;
      if (selectedCategory === 'Duo' && m !== 'duo') return false;
      if (selectedCategory === 'Squad' && m !== 'squad' && m !== 'scrim' && !t.isScrim) return false;
    }

    // 4. Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (t.name || '').toLowerCase();
      const gameTitle = getGameName(t.gameId).toLowerCase();
      const dropMap = (t.dropMap || '').toLowerCase();
      const tags = (t.tags || []).join(' ').toLowerCase();

      if (!matchName.includes(q) && !gameTitle.includes(q) && !dropMap.includes(q) && !tags.includes(q)) {
        return false;
      }
    }

    return true;
  });

  // Sorting: Game Title, Entry Fee, Schedule Time, Prize Pool
  const sortedTournaments = [...filteredTournaments].sort((a, b) => {
    if (sortBy === 'game_title_asc') {
      return getGameName(a.gameId).localeCompare(getGameName(b.gameId));
    }
    if (sortBy === 'entry_fee_asc') {
      return (a.entryFee || 0) - (b.entryFee || 0);
    }
    if (sortBy === 'entry_fee_desc') {
      return (b.entryFee || 0) - (a.entryFee || 0);
    }
    if (sortBy === 'start_time_asc') {
      return (a.startTime || 0) - (b.startTime || 0);
    }
    if (sortBy === 'prize_desc') {
      return (b.prizePool || 0) - (a.prizePool || 0);
    }
    return 0;
  });

  const isFiltered =
    selectedCategory !== 'All' ||
    selectedGameId !== null ||
    searchQuery.trim().length > 0 ||
    sortBy !== 'start_time_asc';

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSelectedGameId(null);
    setSelectedGameFilter(null);
    setSearchQuery('');
    setSortBy('start_time_asc');
  };

  return (
    <div className="min-w-0 max-w-4xl mx-auto px-4 py-6 pb-24">
      {/* Header Banner - Dynamically Aligned with Active Category */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        className="relative rounded-2xl overflow-hidden mb-5 p-5 sm:p-6 bg-gradient-to-r from-[var(--surface-color)] to-[var(--card-bg)] border border-[var(--border-color)] shadow-lg"
      >
        <div className="absolute -top-10 -right-10 w-64 h-64 bg-[var(--primary-glow)] rounded-full blur-3xl opacity-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[var(--primary-color)] uppercase tracking-wider mb-1.5">
              {status === 'upcoming' && (
                <>
                  <Clock size={13} className="text-[var(--primary-color)]" />
                  <span>Scheduled Arenas</span>
                </>
              )}
              {status === 'ongoing' && (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--danger-color)] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--danger-color)]" />
                  </span>
                  <span className="text-[var(--danger-color)]">Live Combat Zone</span>
                </>
              )}
              {status === 'result' && (
                <>
                  <Trophy size={13} className="text-[var(--primary-color)]" />
                  <span>Hall of Champions</span>
                </>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] uppercase tracking-tight text-balance">
              {status === 'upcoming' && (
                <>
                  Upcoming <span className="text-[var(--primary-color)]">Matches & Scrims</span>
                </>
              )}
              {status === 'ongoing' && (
                <>
                  Ongoing <span className="text-[var(--danger-color)]">Live Matches</span>
                </>
              )}
              {status === 'result' && (
                <>
                  Concluded <span className="text-[var(--primary-color)]">Match Results</span>
                </>
              )}
            </h1>

            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1 max-w-xl leading-relaxed">
              {status === 'upcoming' &&
                'Register solo or reserve your squad scrim slot with automated payouts, live brackets, and instant slot lists.'}
              {status === 'ongoing' &&
                'Tournaments currently in battle. Access live Room ID & Password, view slot assignments, or stream the action.'}
              {status === 'result' &&
                'Official points standings, verified winner payouts, MVP player honors, and match replays.'}
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <div className="px-4 py-2.5 rounded-xl bg-[var(--bg-main)]/80 border border-[var(--border-color)] text-center min-w-[96px]">
              <div className="text-[10px] text-[var(--text-muted)] uppercase font-bold">
                {status === 'upcoming' ? 'Upcoming' : status === 'ongoing' ? 'Live Matches' : 'Results'}
              </div>
              <div
                className={`text-xl font-black tabular-nums ${
                  status === 'ongoing'
                    ? 'text-[var(--danger-color)]'
                    : 'text-[var(--primary-color)]'
                }`}
              >
                {statusCounts[status]}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Streamlined Category Switcher (Upcoming | Ongoing | Results) & Sub-Filters */}
      <TournamentFilterBar
        games={games}
        selectedGameId={selectedGameId}
        onSelectGameId={handleSelectGameId}
        status={status}
        onSelectStatus={setStatus}
        sortBy={sortBy}
        onSelectSortBy={setSortBy}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onReset={handleResetFilters}
        isFiltered={isFiltered}
        counts={statusCounts}
        selectedMode={selectedCategory}
        onSelectMode={setSelectedCategory}
        modeCounts={modeCounts}
      />

      {/* MATCH TYPE SPECIFIC ANNOUNCEMENT BANNER */}
      {(() => {
        const matchingNotifs = (notifications || []).filter(n => {
          if (!n) return false;
          if (n.matchType && n.matchType !== 'all') {
            return selectedCategory === 'All' ? true : n.matchType === selectedCategory;
          }
          if (n.target && n.target !== 'all') {
            return selectedCategory === 'All' ? true : n.target === selectedCategory;
          }
          return false;
        });

        if (matchingNotifs.length === 0) return null;
        const latest = matchingNotifs[0];

        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="mb-5 p-3.5 sm:p-4 rounded-2xl border border-[var(--glow-color-1)]/45 bg-[var(--surface-color)] shadow-md flex items-start gap-3"
            style={{
              boxShadow: '0 6px 24px -8px var(--glow-color-2)',
            }}
          >
            <div className="w-9 h-9 rounded-xl bg-[var(--primary-color)]/15 text-[var(--primary-color)] flex items-center justify-center shrink-0 mt-0.5 border border-[var(--primary-color)]/35">
              <Radio size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-0.5 text-xs">
                <span className="text-[11px] font-black uppercase text-[var(--primary-color)]">
                  {latest.matchType || latest.target} Announcement
                </span>
                <span aria-hidden="true" className="text-[var(--text-muted)]">·</span>
                <span className="font-bold text-[var(--text-primary)]">{latest.title}</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {latest.message}
              </p>
            </div>
          </motion.div>
        );
      })()}

      {/* Tournament Cards List */}
      {sortedTournaments.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-14 px-4 rounded-2xl bg-[var(--surface-color)] border border-[var(--border-color)]"
        >
          <div className="w-16 h-16 mx-auto rounded-full bg-[var(--primary-color)]/10 flex items-center justify-center text-[var(--primary-color)] mb-3">
            {status === 'upcoming' && <Clock size={30} />}
            {status === 'ongoing' && <Radio size={30} className="text-[var(--danger-color)]" />}
            {status === 'result' && <Trophy size={30} className="text-[var(--primary-color)]" />}
          </div>
          <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
            {status === 'upcoming' && 'No Upcoming Matches Right Now'}
            {status === 'ongoing' && 'No Matches Currently Live'}
            {status === 'result' && 'No Concluded Match Results Yet'}
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-1.5 max-w-sm mx-auto leading-relaxed">
            {status === 'upcoming' &&
              'All scheduled tournaments have concluded or are currently live. Check back shortly for new scrim announcements or host a tournament in the admin panel.'}
            {status === 'ongoing' &&
              'There are no live combat matches happening at this exact moment. Ongoing tournaments with active Room ID & Password credentials will appear here.'}
            {status === 'result' &&
              'Final match standings, verified winner payouts, MVP rankings, and official points tables will appear here once games finish.'}
          </p>
          {/* Smart cross-category recommendations if selected game has matches in other tabs */}
          {selectedGameId && (statusCounts.upcoming > 0 || statusCounts.ongoing > 0 || statusCounts.result > 0) && (
            <div className="mt-4 p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--border-color)] max-w-md mx-auto shadow-md">
              <span className="text-xs text-[var(--text-secondary)] block mb-3 font-medium">
                Matches are available for <strong className="text-[var(--text-primary)]">{getGameName(selectedGameId)}</strong> in other categories:
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {statusCounts.upcoming > 0 && status !== 'upcoming' && (
                  <button
                    onClick={() => setStatus('upcoming')}
                    className="px-4 py-2 rounded-xl btn-accent text-xs font-black cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <Clock size={13} />
                    <span>View Upcoming ({statusCounts.upcoming})</span>
                  </button>
                )}
                {statusCounts.ongoing > 0 && status !== 'ongoing' && (
                  <button
                    onClick={() => setStatus('ongoing')}
                    className="px-4 py-2 rounded-xl btn-theme-danger text-xs font-black cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <span className="w-2 h-2 rounded-full bg-[var(--danger-color)] animate-ping" />
                    <span>View Live Matches ({statusCounts.ongoing})</span>
                  </button>
                )}
                {statusCounts.result > 0 && status !== 'result' && (
                  <button
                    onClick={() => setStatus('result')}
                    className="px-4 py-2 rounded-xl btn-accent text-xs font-black cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <Trophy size={13} />
                    <span>View Results ({statusCounts.result})</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {isFiltered && (
            <button
              onClick={handleResetFilters}
              className="mt-4 px-5 py-2.5 rounded-xl btn-theme-outline text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              Reset Mode & Filters
            </button>
          )}
        </motion.div>
      ) : (
        <div className="space-y-5">
          <AnimatePresence mode="popLayout">
            {sortedTournaments.map((tournament, idx) => {
              const isScrim = tournament.isScrim || tournament.mode === 'Scrim';
              const banner = tournament.bannerUrl || getGameImage(tournament.gameId);
              const isUserRegistered =
                currentUser &&
                tournament.registeredPlayers &&
                tournament.registeredPlayers[currentUser.uid];

              // Check if user or their team has already booked a slot in this scrim
              let userSlotNum: number | null = null;
              let userTeamName: string | null = null;
              if (currentUser) {
                if (tournament.scrimSlots) {
                  for (const [sNum, slot] of Object.entries(tournament.scrimSlots)) {
                    if (
                      slot.captainUid === currentUser.uid ||
                      (userProfile?.mobile && slot.captainMobile === userProfile.mobile)
                    ) {
                      userSlotNum = Number(sNum);
                      userTeamName = slot.teamName;
                      break;
                    }
                  }
                }
                if (!userSlotNum && tournament.scrimGroups) {
                  for (const grp of Object.values(tournament.scrimGroups)) {
                    if (grp.slots) {
                      for (const [sNum, slot] of Object.entries(grp.slots)) {
                        if (
                          slot.captainUid === currentUser.uid ||
                          (userProfile?.mobile && slot.captainMobile === userProfile.mobile)
                        ) {
                          userSlotNum = Number(sNum);
                          userTeamName = slot.teamName;
                          break;
                        }
                      }
                    }
                  }
                }
              }
              const hasJoinedAlready = isUserRegistered || !!userSlotNum;

              // Calculate slots count for Scrims
              let bookedSlotsCount = 0;
              const totalSlots = tournament.slotCount || 12;
              if (isScrim) {
                if (tournament.scrimGroups) {
                  Object.values(tournament.scrimGroups).forEach(g => {
                    if (g.slots) bookedSlotsCount += Object.keys(g.slots).length;
                  });
                } else if (tournament.scrimSlots) {
                  bookedSlotsCount = Object.keys(tournament.scrimSlots).length;
                }
              } else {
                bookedSlotsCount = tournament.registeredPlayers
                  ? Object.keys(tournament.registeredPlayers).length
                  : 0;
              }

              const maxCapacity = isScrim ? totalSlots : tournament.maxPlayers || 100;
              const spotsRemaining = Math.max(0, maxCapacity - bookedSlotsCount);
              const progressPercent = Math.min(100, (bookedSlotsCount / maxCapacity) * 100);

              const champion = tournament.results?.find(r => r.position === 1);

              return (
                <motion.article
                  key={tournament.id}
                  layout
                  initial={{ opacity: 0, y: 18, scale: 0.985 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{
                    duration: 0.28,
                    delay: Math.min(idx * 0.055, 0.35),
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  whileHover={{ y: -4 }}
                  className="group tournament-card-animated relative rounded-2xl overflow-hidden"
                >
                  {/* Ambient Corner Theme Glow on Hover */}
                  <div
                    className="absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl opacity-0 group-hover:opacity-25 transition-opacity duration-300 pointer-events-none z-20"
                    style={{ background: 'var(--glow-color-1)' }}
                  />

                  {/* Top Banner Graphic - NEVER CROPPED, FULL WHOLE IMAGE DISPLAYED */}
                  <div className="relative w-full bg-black/90 flex items-center justify-center overflow-hidden border-b border-[var(--border-color)]/60 min-h-[180px] sm:min-h-[220px] max-h-[340px]">
                    {/* Ambient Blurred Backdrop for soft fill without cropping */}
                    <img
                      src={banner}
                      alt=""
                      aria-hidden="true"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800';
                      }}
                      className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-25 scale-125 pointer-events-none transition-transform duration-500 group-hover:scale-135"
                    />
                    {/* Full Complete Image (100% Uncropped) */}
                    <img
                      src={banner}
                      alt={tournament.name}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800';
                      }}
                      className="relative z-10 max-h-[320px] w-auto max-w-full object-contain p-1.5 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
                    />
                    {/* Bottom Contrast Scrim */}
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/75 via-black/25 to-transparent pointer-events-none z-10" />

                    {/* Mode & Status Tag Overlay */}
                    <div className="absolute top-3 left-3 z-20 flex flex-wrap items-center gap-1.5">
                      {tournament.status === 'result' || tournament.status === 'completed' ? (
                        <span
                          style={{ background: 'var(--accent-gradient)', color: 'var(--btn-accent-text, #000)' }}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider shadow-md flex items-center gap-1"
                        >
                          <Trophy size={12} /> Final Result
                        </span>
                      ) : tournament.status === 'ongoing' ? (
                        <span
                          style={{ backgroundColor: 'var(--danger-color)' }}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider text-white shadow-md flex items-center gap-1.5"
                        >
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                          </span>
                          Live Match
                        </span>
                      ) : tournament.status === 'cancelled' ? (
                        <span className="px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider bg-rose-700 text-white shadow-md">
                          Cancelled
                        </span>
                      ) : isScrim ? (
                        <span
                          style={{ background: 'var(--accent-gradient)', color: 'var(--btn-accent-text, #000)' }}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider shadow-md flex items-center gap-1"
                        >
                          <Zap size={12} /> Scrim · {totalSlots} Slots
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider bg-black/75 backdrop-blur-md text-white border border-white/15">
                          {tournament.mode || 'Solo'} Match
                        </span>
                      )}

                      {tournament.dropMap && (
                        <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-black/75 backdrop-blur-md text-[var(--warning-color)] border border-white/15 flex items-center gap-1">
                          <MapPin size={11} /> {tournament.dropMap}
                        </span>
                      )}
                    </div>

                    {/* Live Stream Link Button */}
                    {tournament.liveStreamUrl && (
                      <a
                        href={tournament.liveStreamUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute top-3 right-3 z-20 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider bg-[var(--danger-color)] text-white flex items-center gap-1.5 shadow-lg hover:brightness-110 transition-all"
                      >
                        <Tv size={12} /> Live Broadcast
                      </a>
                    )}

                    {/* Registered Indicator */}
                    {hasJoinedAlready && (
                      <div className="absolute bottom-3 right-3 z-20 px-3 py-1 rounded-lg text-xs font-bold bg-black/80 text-[var(--success-color)] border border-[var(--success-color)]/50 flex items-center gap-1.5 backdrop-blur-md shadow-md">
                        <CheckCircle2 size={14} />
                        <span>{userSlotNum ? `Slot #${userSlotNum}` : 'Joined'}</span>
                      </div>
                    )}
                  </div>

                  {/* Match Title & Clean Metadata Line */}
                  <div className="px-4 sm:px-5 pt-3.5 pb-2.5 border-b border-[var(--border-color)]/40 flex items-center justify-between gap-3 bg-[var(--surface-color)]/65">
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-bold text-[var(--primary-color)] uppercase tracking-wider flex items-center gap-1.5 mb-0.5">
                        <Gamepad2 size={13} />
                        <span>{getGameName(tournament.gameId)}</span>
                        <span aria-hidden="true" className="text-[var(--text-muted)]">·</span>
                        <span className="text-[var(--text-secondary)]">{tournament.mode || 'Solo'}</span>
                      </div>
                      <h3 className="text-base sm:text-lg font-black text-[var(--text-primary)] uppercase tracking-tight truncate group-hover:text-[var(--primary-color)] transition-colors duration-200">
                        {tournament.name}
                      </h3>
                    </div>
                  </div>

                  {/* Body Details Grid */}
                  <div className="p-4 sm:p-5">
                    {/* Champion highlight for result matches - Theme Aligned */}
                    {champion && (
                      <div className="mb-4 p-3 rounded-xl bg-[var(--secondary-bg)] border border-[var(--glow-color-1)]/40 shadow-sm flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-[var(--primary-color)]/15 text-[var(--primary-color)] flex items-center justify-center border border-[var(--primary-color)]/30">
                            <Trophy size={16} />
                          </div>
                          <div>
                            <span className="text-[10px] font-black text-[var(--primary-color)] uppercase tracking-wider block">
                              1st Place Champion
                            </span>
                            <span className="font-extrabold text-[var(--text-primary)] text-xs sm:text-sm">
                              {champion.name || champion.gameName}
                            </span>
                          </div>
                        </div>
                        {champion.winnings > 0 && (
                          <div className="text-right tabular-nums">
                            <span className="text-[10px] text-[var(--text-secondary)] block">Prize Money</span>
                            <span className="font-black text-[var(--primary-color)] text-sm">
                              ₹{champion.winnings.toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mb-4">
                      {/* Entry Fee */}
                      <div className="p-2.5 rounded-xl bg-[var(--bg-main)]/55 border border-[var(--border-color)]/80 group-hover:border-[var(--border-color)] transition-colors">
                        <div className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Entry Fee</div>
                        <div className="text-sm md:text-base font-extrabold text-[var(--text-primary)] tabular-nums">
                          {tournament.entryFee === 0 ? (
                            <span className="text-[var(--success-color)]">FREE</span>
                          ) : (
                            `₹${tournament.entryFee}`
                          )}
                        </div>
                      </div>

                      {/* Prize Pool */}
                      <div className="p-2.5 rounded-xl bg-[var(--bg-main)]/55 border border-[var(--border-color)]/80 group-hover:border-[var(--border-color)] transition-colors">
                        <div className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Prize Pool</div>
                        <div className="text-sm md:text-base font-extrabold text-[var(--primary-color)] tabular-nums">
                          ₹{tournament.prizePool || 0}
                        </div>
                      </div>

                      {/* Per Kill / Format */}
                      <div className="p-2.5 rounded-xl bg-[var(--bg-main)]/55 border border-[var(--border-color)]/80 group-hover:border-[var(--border-color)] transition-colors">
                        <div className="text-[10px] uppercase font-bold text-[var(--text-muted)]">
                          {isScrim ? 'Format' : 'Per Kill'}
                        </div>
                        <div className="text-sm md:text-base font-extrabold text-[var(--text-primary)] tabular-nums">
                          {isScrim ? 'Squad Slotlist' : `₹${tournament.perKillPrize || 0}`}
                        </div>
                      </div>

                      {/* Time */}
                      <div className="p-2.5 rounded-xl bg-[var(--bg-main)]/55 border border-[var(--border-color)]/80 group-hover:border-[var(--border-color)] transition-colors">
                        <div className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Schedule</div>
                        <div className="text-xs md:text-sm font-bold text-[var(--text-primary)] flex items-center gap-1 truncate tabular-nums">
                          <Clock size={12} className="text-[var(--primary-color)] flex-shrink-0" />
                          <span className="truncate">{formatDate(tournament.startTime)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Animated Progress Bar (Spots or Slots) */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                        <span className="text-[var(--text-muted)] tabular-nums">
                          {isScrim ? 'Slots Booked' : 'Players Joined'}:{' '}
                          <strong className="text-[var(--text-primary)]">
                            {bookedSlotsCount} / {maxCapacity}
                          </strong>
                        </span>
                        <span
                          className={`text-xs font-bold tabular-nums ${
                            tournament.status === 'result' || tournament.status === 'completed'
                              ? 'text-[var(--primary-color)]'
                              : tournament.status === 'cancelled'
                              ? 'text-[var(--danger-color)]'
                              : spotsRemaining === 0
                              ? 'text-[var(--danger-color)]'
                              : 'text-[var(--success-color)]'
                          }`}
                        >
                          {tournament.status === 'result' || tournament.status === 'completed'
                            ? 'Match Finalized'
                            : tournament.status === 'cancelled'
                            ? 'Match Cancelled'
                            : spotsRemaining === 0
                            ? 'Housefull'
                            : `${spotsRemaining} ${isScrim ? 'Slots' : 'Spots'} Left`}
                        </span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-[var(--bg-main)] overflow-hidden border border-[var(--border-color)] p-0.5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${
                              tournament.status === 'result' || tournament.status === 'completed'
                                ? 100
                                : progressPercent
                            }%`,
                          }}
                          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                          className="h-full rounded-full relative overflow-hidden"
                          style={{
                            background: 'var(--accent-gradient)',
                          }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent animate-shimmer" />
                        </motion.div>
                      </div>
                    </div>

                    {/* Theme-Aligned Animated Action Buttons Row */}
                    <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[var(--border-color)]/60">
                      {/* View Slotlist button for Scrims */}
                      {isScrim && (
                        <button
                          onClick={() => setSlotlistTournament(tournament)}
                          className="group/btn flex-1 min-w-[135px] min-h-[42px] py-2.5 px-3.5 rounded-xl btn-theme-outline text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                        >
                          <Users size={14} className="transition-transform duration-200 group-hover/btn:scale-110" />
                          <span>Slotlist & Drops</span>
                        </button>
                      )}

                      {/* Points & Rules Button - ONLY ELIGIBLE FOR SCRIMS */}
                      {isScrim && (
                        <button
                          onClick={() => setPointsModalTournament(tournament)}
                          className="group/btn min-h-[42px] py-2.5 px-3.5 rounded-xl btn-theme-soft text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                          title="View Official Scrim Points Table & Scoring Matrix"
                        >
                          <Award size={14} className="transition-transform duration-200 group-hover/btn:rotate-12" />
                          <span>Scrim Points Table</span>
                        </button>
                      )}

                      {/* Show Room ID & Password if allowed */}
                      {tournament.showIdPass && (
                        <button
                          onClick={() => setRoomIdTournament(tournament)}
                          className="group/btn min-h-[42px] py-2.5 px-3.5 rounded-xl btn-theme-soft text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                        >
                          <KeyRound size={14} className="transition-transform duration-200 group-hover/btn:-rotate-12" />
                          <span>Room ID & Pass</span>
                        </button>
                      )}

                      {/* View Results / Broadcast card if status is result or completed */}
                      {(tournament.status === 'result' || tournament.status === 'completed') && (
                        <button
                          onClick={() => setResultsTournament(tournament)}
                          className="group/btn flex-1 min-h-[42px] py-2.5 px-4 rounded-xl btn-accent font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                        >
                          <Trophy size={14} className="transition-transform duration-200 group-hover/btn:scale-110" />
                          <span>View Results & Prizes</span>
                        </button>
                      )}

                      {/* Cancelled Match Notice */}
                      {tournament.status === 'cancelled' && (
                        <div className="flex-1 min-h-[42px] py-2.5 px-3 rounded-xl bg-[var(--danger-color)]/15 border border-[var(--danger-color)]/35 text-xs font-bold text-[var(--danger-color)] text-center flex items-center justify-center">
                          Match Cancelled (Fees Refunded)
                        </div>
                      )}

                      {/* ALREADY JOINED CARD STATE (One team can only join one scrim or tournament at a time) */}
                      {hasJoinedAlready ? (
                        <button
                          onClick={() => {
                            if (isScrim) {
                              setSlotlistTournament(tournament);
                            } else if (tournament.showIdPass) {
                              setRoomIdTournament(tournament);
                            } else {
                              setPointsModalTournament(tournament);
                            }
                          }}
                          className="group/btn flex-1 min-w-[160px] min-h-[42px] py-2.5 px-4 rounded-xl btn-theme-success text-xs md:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <CheckCircle2 size={16} className="transition-transform duration-200 group-hover/btn:scale-110 shrink-0" />
                          <span className="truncate">
                            {userSlotNum
                              ? `Slot #${userSlotNum} Booked (${userTeamName || 'Your Team'})`
                              : 'Already Joined (Confirmed)'}
                          </span>
                        </button>
                      ) : tournament.status === 'upcoming' && spotsRemaining > 0 ? (
                        <button
                          onClick={() => {
                            if (isScrim) {
                              setSlotlistTournament(tournament);
                            } else {
                              setSoloJoinTournament(tournament);
                            }
                          }}
                          className="group/btn flex-1 min-w-[140px] min-h-[42px] py-2.5 px-4 rounded-xl btn-accent text-xs md:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                        >
                          <Swords size={15} className="transition-transform duration-200 group-hover/btn:rotate-12" />
                          <span>{isScrim ? 'Book Team Slot' : 'Join Match'}</span>
                        </button>
                      ) : tournament.status === 'upcoming' && spotsRemaining === 0 ? (
                        <div className="flex-1 min-h-[42px] py-2.5 px-4 rounded-xl bg-[var(--surface-color)] text-[var(--text-muted)] text-xs font-bold text-center border border-[var(--border-color)] flex items-center justify-center">
                          Full (Registration Closed)
                        </div>
                      ) : null}
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Modals Mounting */}
      {slotlistTournament && (
        <SlotlistModal
          tournament={slotlistTournament}
          onClose={() => setSlotlistTournament(null)}
          onOpenRegister={(slotNum, groupKey) => {
            const t = slotlistTournament;
            setSlotlistTournament(null);
            setScrimRegisterData({
              tournament: t,
              slotNumber: slotNum,
              groupKey,
            });
          }}
        />
      )}

      {scrimRegisterData && (
        <ScrimRegisterModal
          tournament={scrimRegisterData.tournament}
          slotNumber={scrimRegisterData.slotNumber}
          groupKey={scrimRegisterData.groupKey}
          onClose={() => setScrimRegisterData(null)}
        />
      )}

      {soloJoinTournament && (
        <SoloJoinModal
          tournament={soloJoinTournament}
          onClose={() => setSoloJoinTournament(null)}
        />
      )}

      {roomIdTournament && (
        <RoomIdPassModal
          tournament={roomIdTournament}
          onClose={() => setRoomIdTournament(null)}
        />
      )}

      {pointsModalTournament && (
        <PointsTableModal
          tournament={pointsModalTournament}
          onClose={() => setPointsModalTournament(null)}
        />
      )}

      {resultsTournament && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <EsportsCard
            title={resultsTournament.name}
            results={resultsTournament.results || []}
            onBack={() => setResultsTournament(null)}
          />
        </div>
      )}
    </div>
  );
};

export default TournamentsView;
