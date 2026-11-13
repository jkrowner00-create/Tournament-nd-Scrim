import React, { useState } from 'react';
import type { Tournament, ScrimSlot } from '../types';
import { useApp } from '../context/AppContext';
import { Copy, MapPin, Tv, Shield, Users, Check, X } from 'lucide-react';

interface SlotlistModalProps {
  tournament: Tournament;
  onClose: () => void;
  onOpenRegister: (slotNum: number, groupKey: string | null) => void;
}

export const SlotlistModal: React.FC<SlotlistModalProps> = ({
  tournament,
  onClose,
  onOpenRegister,
}) => {
  const { showToast, currentUser } = useApp();
  const [selectedGroup, setSelectedGroup] = useState<string>('groupA');

  const isMultiGroup = Boolean(tournament.scrimGroups && Object.keys(tournament.scrimGroups).length > 0);
  const activeSlots: Record<string, ScrimSlot> = isMultiGroup
    ? tournament.scrimGroups?.[selectedGroup]?.slots || {}
    : tournament.scrimSlots || {};

  const totalSlotsCount = tournament.slotCount || 15;

  const handleCopyFormattedSlotlist = () => {
    let text = `📋 *${tournament.name.toUpperCase()} - SLOTLIST* 📋\n`;
    text += `🗺️ Map: ${tournament.dropMap || 'Erangel'} | Mode: ${tournament.mode}\n`;
    if (tournament.liveStreamUrl) {
      text += `🔴 Live Stream: ${tournament.liveStreamUrl}\n`;
    }
    text += `⏰ Match Time: ${new Date(tournament.startTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}\n\n`;

    if (isMultiGroup) {
      Object.entries(tournament.scrimGroups || {}).forEach(([gKey, gData]) => {
        text += `--- ${gData.groupName.toUpperCase()} ---\n`;
        for (let i = 1; i <= Math.ceil(totalSlotsCount / 2); i++) {
          const slot = gData.slots?.[i];
          if (slot) {
            text += `Slot ${i}: [${slot.teamTag}] ${slot.teamName} (${slot.dropSpot || 'Any'})\n`;
          } else {
            text += `Slot ${i}: [AVAILABLE]\n`;
          }
        }
        text += `\n`;
      });
    } else {
      for (let i = 1; i <= totalSlotsCount; i++) {
        const slot = activeSlots[i];
        if (slot) {
          text += `Slot ${i}: [${slot.teamTag}] ${slot.teamName} (${slot.dropSpot || 'Any'})\n`;
        } else {
          text += `Slot ${i}: [AVAILABLE - OPEN FOR REGISTRATION]\n`;
        }
      }
    }

    text += `\nRegister your squad on the official app: ${window.location.origin}`;

    navigator.clipboard.writeText(text);
    showToast('Formatted slotlist copied to clipboard!', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="glass-panel w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-[var(--border-color)] overflow-hidden animate-card-enter">
        {/* Header */}
        <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--secondary-bg)]">
          <div className="flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-[var(--warning-color)]" />
            <div>
              <h3 className="font-bold text-base text-[var(--text-primary)]">
                Scrim Slotlist & Drop Map
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                {tournament.name} • {totalSlotsCount} Slots Total
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center btn-theme-outline cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Bar (Total Matches, Maps Schedule, Live Stream, Copy) */}
        <div className="p-3 bg-[var(--card-bg)] border-b border-[var(--border-color)] flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {tournament.scrimTotalMatches && (
              <span className="px-2 py-0.5 rounded-md bg-[var(--warning-color)]/10 text-[var(--warning-color)] border border-[var(--warning-color)]/30 font-black text-[11px] uppercase">
                {tournament.scrimTotalMatches} Total Matches
              </span>
            )}
            <span className="flex items-center gap-1 font-semibold text-[var(--text-primary)]">
              <MapPin className="w-3.5 h-3.5 text-[var(--warning-color)]" />
              <span>{tournament.scrimMapsSchedule || `Map: ${tournament.dropMap || 'Erangel'}`}</span>
            </span>
            {tournament.liveStreamUrl && (
              <a
                href={tournament.liveStreamUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 px-2 py-0.5 rounded bg-red-600/20 text-red-400 border border-red-500 font-bold hover:bg-red-600 hover:text-white transition-colors"
              >
                <Tv className="w-3 h-3" />
                Live Broadcast
              </a>
            )}
          </div>

          <button
            onClick={handleCopyFormattedSlotlist}
            className="flex items-center gap-1.5 px-3.5 min-h-[38px] rounded-xl btn-theme-soft font-bold cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy Slotlist (WhatsApp / Discord)</span>
          </button>
        </div>

        {/* Custom Scrim Rules / Guidelines Bar if entered by admin */}
        {tournament.scrimCustomRules && (
          <div className="px-4 py-2 bg-amber-500/5 border-b border-[var(--border-color)]/40 text-[11px] text-[var(--text-secondary)] flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase text-[var(--warning-color)] shrink-0">Scrim Rules:</span>
            <span className="truncate">{tournament.scrimCustomRules}</span>
          </div>
        )}

        {/* Group Tabs (For tournaments > 15 slots) */}
        {isMultiGroup && (
          <div className="flex border-b border-[var(--border-color)] bg-[var(--secondary-bg)] px-3 py-2 gap-2">
            {Object.entries(tournament.scrimGroups || {}).map(([gKey, gData]) => (
              <button
                key={gKey}
                onClick={() => setSelectedGroup(gKey)}
                className={`px-4 min-h-[36px] text-xs font-bold rounded-xl cursor-pointer ${
                  selectedGroup === gKey ? 'btn-accent' : 'btn-theme-outline'
                }`}
              >
                {gData.groupName}
              </button>
            ))}
          </div>
        )}

        {/* Slot Grid */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2">
          {Array.from({ length: totalSlotsCount }).map((_, idx) => {
            const slotNum = idx + 1;
            const slotData = activeSlots[slotNum];
            const isBooked = Boolean(slotData);
            const isMyTeam = slotData?.captainUid === currentUser?.uid;

            return (
              <div
                key={slotNum}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                  isBooked
                    ? isMyTeam
                      ? 'bg-amber-950/30 border-[var(--warning-color)] shadow-[0_0_15px_rgba(251,191,36,0.15)]'
                      : 'bg-[var(--secondary-bg)] border-[var(--border-color)]'
                    : 'bg-[var(--card-bg)] border-dashed border-[var(--border-color)] hover:border-[var(--warning-color)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center font-black text-sm ${
                      isBooked
                        ? 'bg-[var(--warning-color)] text-black'
                        : 'bg-[var(--secondary-bg)] text-[var(--text-secondary)] border border-[var(--border-color)]'
                    }`}
                  >
                    #{slotNum}
                  </div>

                  {isBooked ? (
                    <div className="flex items-center gap-2.5">
                      {slotData.logoUrl ? (
                        <img
                          src={slotData.logoUrl}
                          alt="Logo"
                          className="w-8 h-8 rounded object-cover border border-[var(--border-color)]"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${slotData.teamTag}&background=333&color=FFF`;
                          }}
                        />
                      ) : (
                        <div className="w-8 h-8 rounded bg-[var(--border-color)] flex items-center justify-center text-[10px] font-bold text-white">
                          {slotData.teamTag}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[var(--text-primary)]">
                            {slotData.teamName}
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[var(--card-bg)] text-[var(--warning-color)] border border-[var(--border-color)]">
                            [{slotData.teamTag}]
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] mt-0.5">
                          <span>Captain: {slotData.captainName}</span>
                          {slotData.dropSpot && (
                            <>
                              <span>•</span>
                              <span className="text-amber-400 font-medium">
                                📍 {slotData.dropSpot}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <span className="text-sm font-semibold text-[var(--text-secondary)]">
                        Available Slot
                      </span>
                      <p className="text-[11px] text-gray-500">
                        Open for team registration
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  {isBooked ? (
                    <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-green-950/60 text-green-400 border border-green-800 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      Reserved
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenRegister(slotNum, isMultiGroup ? selectedGroup : null);
                      }}
                      className="px-4 min-h-[38px] text-xs font-extrabold rounded-xl btn-accent cursor-pointer whitespace-nowrap"
                    >
                      Book Slot #{slotNum}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[var(--border-color)] bg-[var(--secondary-bg)] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 min-h-[40px] text-xs font-bold rounded-xl btn-theme-outline cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
