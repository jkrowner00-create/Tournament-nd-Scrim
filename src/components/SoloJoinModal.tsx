import React, { useState } from 'react';
import type { Tournament } from '../types';
import { useApp } from '../context/AppContext';
import { Trophy, X, ShieldAlert } from 'lucide-react';

interface SoloJoinModalProps {
  tournament: Tournament;
  onClose: () => void;
}

export const SoloJoinModal: React.FC<SoloJoinModalProps> = ({ tournament, onClose }) => {
  const { userProfile, joinSoloTournament, showToast } = useApp();
  const [gameName, setGameName] = useState(userProfile?.gameName || userProfile?.displayName || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fee = tournament.entryFee || 0;
  const balance = userProfile?.balance || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameName.trim()) {
      showToast('Please enter your exact in-game name.', 'warning');
      return;
    }
    if (balance < fee) {
      showToast(`Insufficient balance (₹${balance}). Entry fee is ₹${fee}. Please add funds to wallet.`, 'danger');
      return;
    }

    setIsSubmitting(true);
    try {
      await joinSoloTournament(tournament.id, gameName.trim(), fee);
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to join tournament.', 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-hidden animate-fade-in">
      <div className="glass-panel w-full max-w-md max-h-[92vh] flex flex-col rounded-2xl border border-[var(--border-color)] overflow-hidden shadow-2xl animate-card-enter">
        {/* Header */}
        <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--secondary-bg)] shrink-0">
          <div className="flex items-center gap-2.5">
            <Trophy className="w-5 h-5 text-[var(--warning-color)]" />
            <div>
              <h3 className="font-bold text-base text-[var(--text-primary)]">
                Join {tournament.mode} Match
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">{tournament.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center btn-theme-outline cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4 text-xs overflow-y-auto flex-1">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
              Your In-Game Name / UID *
            </label>
            <input
              type="text"
              value={gameName}
              onChange={e => setGameName(e.target.value)}
              placeholder="e.g. MortalGamingOP"
              required
              className="w-full px-3 py-2 app-input text-xs"
            />
            <p className="text-[11px] text-[var(--text-secondary)] mt-1">
              Ensure this exactly matches your in-game name for kill rewards & victory prize verification.
            </p>
          </div>

          {/* Tournament Overview Stats */}
          <div className="p-3 rounded-xl bg-[var(--secondary-bg)] border border-[var(--border-color)] space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[var(--text-secondary)]">Entry Fee:</span>
              <strong className={fee > 0 ? 'text-[var(--text-primary)]' : 'text-[var(--success-color)]'}>
                {fee > 0 ? `₹${fee}` : 'Free'}
              </strong>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-[var(--text-secondary)]">Total Prize Pool:</span>
              <strong className="text-[var(--warning-color)]">₹{tournament.prizePool}</strong>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-[var(--text-secondary)]">Per Kill Prize:</span>
              <strong className="text-blue-400">₹{tournament.perKillPrize}</strong>
            </div>
            <div className="pt-1.5 border-t border-[var(--border-color)] flex justify-between items-center text-xs">
              <span className="text-[var(--text-secondary)]">Your Wallet Balance:</span>
              <strong className="text-[var(--text-primary)]">₹{balance}</strong>
            </div>
          </div>

          {balance < fee && (
            <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-800 text-red-300 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
              <span>Insufficient balance! Please add funds in the Wallet section.</span>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 min-h-[42px] rounded-xl btn-theme-outline font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || balance < fee}
              className="px-5 min-h-[42px] rounded-xl btn-accent text-xs font-black uppercase tracking-wider disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Joining...' : `Confirm & Pay ₹${fee}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
