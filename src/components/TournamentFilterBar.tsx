import React from 'react';
import type { Game } from '../types';
import {
  Search,
  ArrowUpDown,
  Gamepad2,
  X,
  RotateCcw,
  Clock,
  Radio,
  Trophy,
  Crosshair,
  Users,
  Shield,
  Layers,
  Check,
} from 'lucide-react';

export type SortOption =
  | 'start_time_asc'
  | 'game_title_asc'
  | 'entry_fee_asc'
  | 'entry_fee_desc'
  | 'prize_desc';

export type StatusOption = 'upcoming' | 'ongoing' | 'result';

export type CategoryMode = 'All' | 'Solo' | 'Duo' | 'Squad';

interface TournamentFilterBarProps {
  games: Game[];
  selectedGameId: string | null;
  onSelectGameId: (gameId: string | null) => void;
  status: StatusOption;
  onSelectStatus: (status: StatusOption) => void;
  sortBy: SortOption;
  onSelectSortBy: (sort: SortOption) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onReset: () => void;
  isFiltered: boolean;
  counts?: {
    upcoming: number;
    ongoing: number;
    result: number;
  };
  selectedMode?: CategoryMode;
  onSelectMode?: (mode: CategoryMode) => void;
  modeCounts?: {
    all: number;
    solo: number;
    duo: number;
    squad: number;
  };
}

export const TournamentFilterBar: React.FC<TournamentFilterBarProps> = ({
  games,
  selectedGameId,
  onSelectGameId,
  status,
  onSelectStatus,
  sortBy,
  onSelectSortBy,
  searchQuery,
  onSearchChange,
  onReset,
  isFiltered,
  counts,
  selectedMode = 'All',
  onSelectMode,
  modeCounts,
}) => {
  const selectedGameObj = games.find(g => g.id === selectedGameId);

  return (
    <div className="space-y-3.5 mb-6">
      {/* 1. PRIMARY MATCH CATEGORIES: UPCOMING | ONGOING | RESULTS */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2 p-1.5 rounded-2xl bg-[var(--surface-color)] border border-[var(--border-color)] shadow-md">
        {/* UPCOMING */}
        <button
          onClick={() => onSelectStatus('upcoming')}
          className={`min-h-[44px] py-2.5 px-2 rounded-xl text-xs sm:text-sm font-extrabold uppercase tracking-wider flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
            status === 'upcoming'
              ? 'btn-accent'
              : 'btn-theme-outline border-transparent bg-transparent text-[var(--text-muted)]'
          }`}
        >
          <Clock size={15} />
          <span className="truncate">Upcoming</span>
          {counts && (
            <span
              className={`text-[10px] sm:text-xs font-black px-1.5 py-0.5 rounded-full tabular-nums ${
                status === 'upcoming'
                  ? 'bg-black/20'
                  : 'bg-[var(--card-bg)] text-[var(--text-muted)] border border-[var(--border-color)]'
              }`}
            >
              {counts.upcoming}
            </span>
          )}
        </button>

        {/* ONGOING (LIVE) */}
        <button
          onClick={() => onSelectStatus('ongoing')}
          className={`min-h-[44px] py-2.5 px-2 rounded-xl text-xs sm:text-sm font-extrabold uppercase tracking-wider flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
            status === 'ongoing'
              ? 'text-white shadow-lg'
              : 'btn-theme-outline border-transparent bg-transparent text-[var(--text-muted)] hover:text-[var(--danger-color)]'
          }`}
          style={
            status === 'ongoing'
              ? {
                  backgroundColor: 'var(--danger-color)',
                  boxShadow: '0 4px 16px color-mix(in srgb, var(--danger-color) 45%, transparent)',
                }
              : undefined
          }
        >
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span
              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{ backgroundColor: status === 'ongoing' ? '#ffffff' : 'var(--danger-color)' }}
            />
            <span
              className="relative inline-flex rounded-full h-2.5 w-2.5"
              style={{ backgroundColor: status === 'ongoing' ? '#ffffff' : 'var(--danger-color)' }}
            />
          </span>
          <span className="truncate">Ongoing</span>
          {counts && (
            <span
              className={`text-[10px] sm:text-xs font-black px-1.5 py-0.5 rounded-full tabular-nums ${
                status === 'ongoing'
                  ? 'bg-black/25 text-white'
                  : 'bg-[var(--card-bg)] text-[var(--text-muted)] border border-[var(--border-color)]'
              }`}
            >
              {counts.ongoing}
            </span>
          )}
        </button>

        {/* RESULTS */}
        <button
          onClick={() => onSelectStatus('result')}
          className={`min-h-[44px] py-2.5 px-2 rounded-xl text-xs sm:text-sm font-extrabold uppercase tracking-wider flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
            status === 'result'
              ? 'btn-accent'
              : 'btn-theme-outline border-transparent bg-transparent text-[var(--text-muted)]'
          }`}
        >
          <Trophy size={15} className={status === 'result' ? '' : 'text-[var(--primary-color)]'} />
          <span className="truncate">Results</span>
          {counts && (
            <span
              className={`text-[10px] sm:text-xs font-black px-1.5 py-0.5 rounded-full tabular-nums ${
                status === 'result'
                  ? 'bg-black/20'
                  : 'bg-[var(--card-bg)] text-[var(--text-muted)] border border-[var(--border-color)]'
              }`}
            >
              {counts.result}
            </span>
          )}
        </button>
      </div>

      {/* 2. GAME SELECTOR CHIPS - FILTER MATCHES & RESULTS BY GAME */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider mr-1 hidden sm:inline flex-shrink-0">
          Game:
        </span>
        <button
          onClick={() => onSelectGameId(null)}
          className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer flex-shrink-0 ${
            selectedGameId === null ? 'btn-accent' : 'btn-theme-outline'
          }`}
        >
          <Gamepad2 size={13} />
          <span>All Games</span>
        </button>

        {games.map(g => {
          const isSelected = selectedGameId === g.id;
          return (
            <button
              key={g.id}
              onClick={() => onSelectGameId(isSelected ? null : g.id)}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer flex-shrink-0 ${
                isSelected ? 'btn-accent' : 'btn-theme-outline'
              }`}
            >
              <span>{g.name}</span>
              {isSelected ? <X size={12} className="opacity-90" /> : null}
            </button>
          );
        })}
      </div>

      {/* Active Game Filter Notification Banner if a specific game is selected */}
      {selectedGameObj && (
        <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-[var(--primary-color)]/10 border border-[var(--primary-color)]/35 text-xs">
          <span className="text-[var(--text-primary)]">
            Showing <strong className="text-[var(--primary-color)]">{status === 'result' ? 'results' : status === 'ongoing' ? 'live matches' : 'upcoming tournaments'}</strong> for:{' '}
            <strong className="text-[var(--text-primary)]">{selectedGameObj.name}</strong>
          </span>
          <button
            onClick={() => onSelectGameId(null)}
            className="px-2.5 py-1 rounded-lg btn-theme-soft text-[11px] font-bold flex items-center gap-1 cursor-pointer whitespace-nowrap"
          >
            <span>Show All</span>
            <X size={12} />
          </button>
        </div>
      )}

      {/* 3. MATCH MODE SELECTORS (Solo, Duo, Squad) */}
      {onSelectMode && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider mr-1 hidden sm:inline flex-shrink-0">
            Mode:
          </span>
          {[
            { id: 'All' as const, label: 'All Modes', icon: Layers, count: modeCounts?.all },
            { id: 'Solo' as const, label: 'Solo', icon: Crosshair, count: modeCounts?.solo },
            { id: 'Duo' as const, label: 'Duo', icon: Users, count: modeCounts?.duo },
            { id: 'Squad' as const, label: 'Squad & Scrim', icon: Shield, count: modeCounts?.squad },
          ].map(m => {
            const Icon = m.icon;
            const isSelected = selectedMode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => onSelectMode(m.id)}
                className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer flex-shrink-0 ${
                  isSelected ? 'btn-accent' : 'btn-theme-outline'
                }`}
              >
                <Icon size={12} />
                <span>{m.label}</span>
                {typeof m.count === 'number' && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold tabular-nums ${
                      isSelected
                        ? 'bg-black/20'
                        : 'bg-[var(--card-bg)] text-[var(--text-muted)]'
                    }`}
                  >
                    {m.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* 4. UTILITY ROW: Instant Search & Sort Dropdown */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        {/* Instant Search */}
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Search match, title, map, or tags..."
            className="w-full min-h-[40px] pl-9 pr-9 py-2 rounded-xl bg-[var(--surface-color)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary-color)] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--primary-color)] cursor-pointer"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Sort by Dropdown */}
        <div className="relative min-w-[165px]">
          <select
            value={sortBy}
            onChange={e => onSelectSortBy(e.target.value as SortOption)}
            className="w-full min-h-[40px] appearance-none pl-3.5 pr-8 py-2 rounded-xl bg-[var(--surface-color)] border border-[var(--border-color)] text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)] cursor-pointer"
          >
            <option value="start_time_asc">⏳ Time: Soonest First</option>
            <option value="entry_fee_asc">💰 Entry Fee: Low to High</option>
            <option value="entry_fee_desc">💎 Entry Fee: High to Low</option>
            <option value="prize_desc">🏆 Prize: Highest Pool</option>
            <option value="game_title_asc">🎮 Game: A → Z</option>
          </select>
          <ArrowUpDown
            size={13}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
          />
        </div>

        {/* Reset Filters button if any filter is active */}
        {isFiltered && (
          <button
            onClick={onReset}
            title="Reset filters"
            className="min-h-[40px] px-3.5 py-2 rounded-xl btn-theme-danger text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer flex-shrink-0 whitespace-nowrap"
          >
            <RotateCcw size={13} />
            <span className="hidden sm:inline">Reset</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default TournamentFilterBar;

