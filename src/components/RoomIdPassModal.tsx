import React, { useState } from 'react';
import type { Tournament } from '../types';
import { useApp } from '../context/AppContext';
import { Key, Copy, Check, X, AlertTriangle } from 'lucide-react';

interface RoomIdPassModalProps {
  tournament: Tournament;
  onClose: () => void;
}

export const RoomIdPassModal: React.FC<RoomIdPassModalProps> = ({ tournament, onClose }) => {
  const { showToast } = useApp();
  const [copiedId, setCopiedId] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);

  const roomId = tournament.showIdPass && tournament.roomId ? tournament.roomId : 'Waiting for Admin Update...';
  const roomPass = tournament.showIdPass && tournament.roomPassword ? tournament.roomPassword : 'Waiting for Admin Update...';

  const copyId = () => {
    if (tournament.roomId) {
      navigator.clipboard.writeText(tournament.roomId);
      setCopiedId(true);
      showToast('Room ID copied!', 'success');
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const copyPass = () => {
    if (tournament.roomPassword) {
      navigator.clipboard.writeText(tournament.roomPassword);
      setCopiedPass(true);
      showToast('Room Password copied!', 'success');
      setTimeout(() => setCopiedPass(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-hidden animate-fade-in">
      <div className="glass-panel w-full max-w-sm max-h-[92vh] flex flex-col rounded-2xl border border-[var(--border-color)] overflow-hidden text-center shadow-2xl animate-card-enter">
        {/* Header */}
        <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--secondary-bg)] shrink-0">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-[var(--warning-color)]" />
            <h3 className="font-bold text-sm text-[var(--text-primary)]">
              Room Credentials
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center btn-theme-outline cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Credentials Cards */}
        <div className="p-5 space-y-4 text-xs overflow-y-auto flex-1">
          <p className="text-[11px] text-[var(--text-secondary)]">
            Match: <strong className="text-white">{tournament.name}</strong>
          </p>

          {/* Room ID */}
          <div className="p-3.5 rounded-xl bg-[var(--secondary-bg)] border border-[var(--border-color)] flex items-center justify-between">
            <div className="text-left">
              <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">
                Room ID
              </span>
              <strong className="text-base font-mono text-[var(--warning-color)]">
                {roomId}
              </strong>
            </div>
            {tournament.roomId && (
              <button
                onClick={copyId}
                className="w-9 h-9 rounded-xl btn-theme-soft flex items-center justify-center cursor-pointer"
                title="Copy Room ID"
              >
                {copiedId ? <Check className="w-4 h-4 text-[var(--success-color)]" /> : <Copy className="w-4 h-4" />}
              </button>
            )}
          </div>

          {/* Room Password */}
          <div className="p-3.5 rounded-xl bg-[var(--secondary-bg)] border border-[var(--border-color)] flex items-center justify-between">
            <div className="text-left">
              <span className="text-[10px] text-[var(--text-secondary)] uppercase font-bold tracking-wider block">
                Room Password
              </span>
              <strong className="text-base font-mono text-[var(--warning-color)]">
                {roomPass}
              </strong>
            </div>
            {tournament.roomPassword && (
              <button
                onClick={copyPass}
                className="w-9 h-9 rounded-xl btn-theme-soft flex items-center justify-center cursor-pointer"
                title="Copy Password"
              >
                {copiedPass ? <Check className="w-4 h-4 text-[var(--success-color)]" /> : <Copy className="w-4 h-4" />}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[var(--warning-color)]/10 border border-[var(--warning-color)]/30 text-[11px] text-[var(--text-primary)] text-left">
            <AlertTriangle className="w-4 h-4 shrink-0 text-[var(--warning-color)]" />
            <span>Do not share room credentials with anyone who has not registered for this lobby.</span>
          </div>

          <button
            onClick={onClose}
            className="w-full min-h-[44px] py-2.5 rounded-xl btn-accent text-xs font-extrabold uppercase tracking-wider cursor-pointer"
          >
            Ready to Play
          </button>
        </div>
      </div>
    </div>
  );
};
