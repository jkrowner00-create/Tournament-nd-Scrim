import React from 'react';
import type { Tournament } from '../types';
import {
  Trophy,
  Shield,
  Crosshair,
  Flame,
  Award,
  AlertTriangle,
  X,
  Coins,
  CheckCircle2,
} from 'lucide-react';

interface PointsTableModalProps {
  tournament: Tournament;
  onClose: () => void;
}

export const PointsTableModal: React.FC<PointsTableModalProps> = ({ tournament, onClose }) => {
  const prizePool = tournament.prizePool || 0;
  const perKillPrize = tournament.perKillPrize || 0;

  // Standard competitive battle royale prize breakdown
  const firstPrize = Math.round(prizePool * 0.5);
  const secondPrize = Math.round(prizePool * 0.3);
  const thirdPrize = Math.max(0, prizePool - firstPrize - secondPrize);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl glass-panel border border-[var(--border-color)] shadow-2xl p-4 sm:p-6 bg-[var(--secondary-bg)] max-h-[92vh] flex flex-col animate-card-enter">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--glow-color-2)] rounded-full blur-3xl opacity-20 pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[var(--border-color)] mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[var(--warning-color)]/15 text-[var(--warning-color)] border border-[var(--border-color)] flex items-center justify-center shadow-sm">
              <Trophy size={20} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-[var(--text-primary)] uppercase tracking-tight">
                Free Fire Scrims Points Matrix
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                {tournament.name} • Official Competitive Scale
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center btn-theme-outline cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* Prize Pool Allocation Card */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--border-color)] shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black uppercase tracking-wider text-[var(--warning-color)] flex items-center gap-1.5">
                <Coins size={14} /> Total Prize Pool: ₹{prizePool.toLocaleString()}
              </span>
              {perKillPrize > 0 && (
                <span className="text-[11px] font-bold text-[var(--success-color)] bg-[var(--success-color)]/10 px-2 py-0.5 rounded-full border border-[var(--success-color)]/30">
                  +₹{perKillPrize} Per Kill
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-[var(--secondary-bg)] border border-[var(--border-color)] shadow-sm">
                <div className="text-[10px] font-black uppercase text-[var(--warning-color)]">🥇 1st Place</div>
                <div className="text-sm sm:text-base font-black text-[var(--text-primary)] mt-0.5">₹{firstPrize.toLocaleString()}</div>
                <div className="text-[9px] text-[var(--text-secondary)]">50% of Pool</div>
              </div>

              <div className="p-2.5 rounded-xl bg-[var(--secondary-bg)] border border-[var(--border-color)] shadow-sm">
                <div className="text-[10px] font-black uppercase text-[var(--text-secondary)]">🥈 2nd Place</div>
                <div className="text-sm sm:text-base font-black text-[var(--text-primary)] mt-0.5">₹{secondPrize.toLocaleString()}</div>
                <div className="text-[9px] text-[var(--text-secondary)]">30% of Pool</div>
              </div>

              <div className="p-2.5 rounded-xl bg-[var(--secondary-bg)] border border-[var(--border-color)] shadow-sm">
                <div className="text-[10px] font-black uppercase text-[var(--text-secondary)]">🥉 3rd Place</div>
                <div className="text-sm sm:text-base font-black text-[var(--text-primary)] mt-0.5">₹{thirdPrize.toLocaleString()}</div>
                <div className="text-[9px] text-[var(--text-secondary)]">20% of Pool</div>
              </div>
            </div>
          </div>

          {/* Official Free Fire Scrims Placement Points Matrix */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
                <Award size={14} className="text-[var(--warning-color)]" /> Free Fire Placement Points
              </h4>
              <span className="text-[10px] text-[var(--success-color)] font-bold">1 Kill = 1 Kill Point</span>
            </div>

            <div className="rounded-2xl overflow-hidden border border-[var(--border-color)] bg-[var(--card-bg)] text-xs shadow-sm">
              <div className="grid grid-cols-2 p-2.5 bg-[var(--secondary-bg)] font-bold uppercase text-[10px] text-[var(--text-secondary)] border-b border-[var(--border-color)]">
                <span>Placement Rank</span>
                <span className="text-right">Points Awarded</span>
              </div>

              <div className="divide-y divide-[var(--border-color)]/50">
                <div className="grid grid-cols-2 p-2.5 font-bold text-amber-300 bg-amber-500/15">
                  <span className="flex items-center gap-1.5">
                    <span>👑</span>
                    <strong className="tracking-wide uppercase font-black">#1 BOOYAH!</strong>
                  </span>
                  <span className="text-right font-black text-amber-400">12 Points</span>
                </div>
                <div className="grid grid-cols-2 p-2.5 text-[var(--text-primary)]">
                  <span>🥈 #2 Rank</span>
                  <span className="text-right font-bold text-[var(--text-primary)]">9 Points</span>
                </div>
                <div className="grid grid-cols-2 p-2.5 text-[var(--text-primary)]">
                  <span>🥉 #3 Rank</span>
                  <span className="text-right font-bold text-[var(--text-primary)]">8 Points</span>
                </div>
                <div className="grid grid-cols-2 p-2.5 text-[var(--text-secondary)]">
                  <span>#4 Rank</span>
                  <span className="text-right font-bold text-[var(--text-primary)]">7 Points</span>
                </div>
                <div className="grid grid-cols-2 p-2.5 text-[var(--text-secondary)]">
                  <span>#5 Rank</span>
                  <span className="text-right font-bold text-[var(--text-primary)]">6 Points</span>
                </div>
                <div className="grid grid-cols-2 p-2.5 text-[var(--text-secondary)]">
                  <span>#6 Rank</span>
                  <span className="text-right font-bold text-[var(--text-primary)]">5 Points</span>
                </div>
                <div className="grid grid-cols-2 p-2.5 text-[var(--text-secondary)]">
                  <span>#7 Rank</span>
                  <span className="text-right font-bold text-[var(--text-primary)]">4 Points</span>
                </div>
                <div className="grid grid-cols-2 p-2.5 text-[var(--text-secondary)]">
                  <span>#8 Rank</span>
                  <span className="text-right font-bold text-[var(--text-primary)]">3 Points</span>
                </div>
                <div className="grid grid-cols-2 p-2.5 text-[var(--text-secondary)]">
                  <span>#9 Rank</span>
                  <span className="text-right font-bold text-[var(--text-primary)]">2 Points</span>
                </div>
                <div className="grid grid-cols-2 p-2.5 text-[var(--text-secondary)]">
                  <span>#10 Rank</span>
                  <span className="text-right font-bold text-[var(--text-primary)]">1 Point</span>
                </div>
                <div className="grid grid-cols-2 p-2.5 text-[var(--text-secondary)]">
                  <span>#11 - #12 Rank</span>
                  <span className="text-right font-bold text-[var(--text-muted)]">0 Points</span>
                </div>
              </div>
            </div>
          </div>

        {/* Match Rules & Anti-Cheat */}
        <div className="p-3.5 rounded-2xl bg-[var(--surface-color)] border border-[var(--border-color)] text-xs text-[var(--text-muted)] space-y-1.5">
          <div className="font-bold text-[var(--text-primary)] text-xs uppercase flex items-center gap-1.5">
            <Shield size={13} className="text-[var(--success-color)]" /> Tournament Regulations
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={13} className="text-[var(--success-color)] flex-shrink-0" />
            <span>Room ID & Password revealed 15 minutes before match start.</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={13} className="text-[var(--success-color)] flex-shrink-0" />
            <span>Strict anti-cheat protocols in effect; emulator teaming prohibited.</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={13} className="text-[var(--success-color)] flex-shrink-0" />
            <span>Winnings automatically verified & credited directly to your winning wallet.</span>
          </div>
        </div>
      </div>

        {/* Done Button */}
        <button
          onClick={onClose}
          className="w-full min-h-[46px] mt-4 py-3 rounded-2xl btn-accent font-black text-xs uppercase tracking-wider cursor-pointer"
        >
          Close & Return to Matches
        </button>
      </div>
    </div>
  );
};

export default PointsTableModal;
