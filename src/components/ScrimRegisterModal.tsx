import React, { useState } from 'react';
import type { Tournament } from '../types';
import { useApp } from '../context/AppContext';
import { uploadToImgBB } from '../services/imgbb';
import { Shield, Upload, X, Check, Image as ImageIcon, Flame, MapPin, AlertTriangle } from 'lucide-react';

interface ScrimRegisterModalProps {
  tournament: Tournament;
  slotNumber: number;
  groupKey: string | null;
  onClose: () => void;
}

export const ScrimRegisterModal: React.FC<ScrimRegisterModalProps> = ({
  tournament,
  slotNumber,
  groupKey,
  onClose,
}) => {
  const { userProfile, currentUser, registerScrimTeam, showToast } = useApp();

  const [teamName, setTeamName] = useState('');
  const [teamTag, setTeamTag] = useState('');
  const [iglName, setIglName] = useState(userProfile?.gameName || userProfile?.displayName || '');
  const [logoUrl, setLogoUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

  // Check if user already booked a slot in this scrim
  let alreadyBookedSlot: number | null = null;
  if (currentUser) {
    if (tournament.scrimSlots) {
      for (const [sNum, s] of Object.entries(tournament.scrimSlots)) {
        if (s.captainUid === currentUser.uid || (userProfile?.mobile && s.captainMobile === userProfile.mobile)) {
          alreadyBookedSlot = Number(sNum);
          break;
        }
      }
    }
    if (!alreadyBookedSlot && tournament.scrimGroups) {
      for (const grp of Object.values(tournament.scrimGroups)) {
        if (grp.slots) {
          for (const [sNum, s] of Object.entries(grp.slots)) {
            if (s.captainUid === currentUser.uid || (userProfile?.mobile && s.captainMobile === userProfile.mobile)) {
              alreadyBookedSlot = Number(sNum);
              break;
            }
          }
        }
      }
    }
  }

  const fee = tournament.entryFee || 0;
  const balance = userProfile?.balance || 0;

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadStatus('Uploading logo to ImgBB...');
    try {
      try {
        const url = await uploadToImgBB(file);
        setLogoUrl(url);
        setUploadStatus('Logo uploaded successfully via ImgBB!');
      } catch (imgbbErr) {
        // Safe base64 fallback so upload NEVER breaks even offline
        const reader = new FileReader();
        reader.onload = ev => {
          const b64 = ev.target?.result as string;
          if (b64) {
            setLogoUrl(b64);
            setUploadStatus('Logo loaded locally!');
          }
        };
        reader.readAsDataURL(file);
      }
    } catch (err: any) {
      setUploadStatus(`Upload failed: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) {
      showToast('Team name is required.', 'warning');
      return;
    }
    if (!iglName.trim()) {
      showToast('IGL (In-Game Leader) name is required.', 'warning');
      return;
    }
    if (balance < fee) {
      showToast(`Insufficient balance (₹${balance}). Entry fee is ₹${fee}. Please deposit funds.`, 'danger');
      return;
    }

    const finalTag = teamTag.trim().toUpperCase() || teamName.trim().slice(0, 4).toUpperCase();
    const finalLogo =
      logoUrl.trim() ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(finalTag)}&background=FFD700&color=000&bold=true`;

    setIsSubmitting(true);
    try {
      await registerScrimTeam(
        tournament.id,
        slotNumber,
        groupKey,
        {
          teamName: teamName.trim(),
          teamTag: finalTag,
          logoUrl: finalLogo,
          captainName: iglName.trim(),
          captainMobile: userProfile?.mobile || '',
          dropSpot: tournament.dropMap || 'Custom',
          players: [iglName.trim()],
        },
        fee
      );
      showToast(`Slot #${slotNumber} booked for ${teamName.trim()}!`, 'success');
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to register scrim slot.', 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="glass-panel w-full max-w-md rounded-2xl border border-[var(--border-color)] overflow-hidden shadow-2xl max-h-[92vh] flex flex-col animate-card-enter">
        {/* Header */}
        <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--secondary-bg)] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[var(--glow-color-1)]/15 border border-[var(--warning-color)]/30 flex items-center justify-center text-[var(--warning-color)]">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-[var(--text-primary)]">
                Book Slot #{slotNumber}
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                {tournament.name} • Entry: {fee > 0 ? `₹${fee}` : 'Free'}
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

        {/* Scrim Match Info Banner */}
        {(tournament.scrimTotalMatches || tournament.scrimMapsSchedule || tournament.dropMap) && (
          <div className="px-4 py-2 bg-black/50 border-b border-[var(--border-color)]/50 flex items-center justify-between text-[11px] shrink-0">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold">
              <Flame className="w-3.5 h-3.5" />
              <span>{tournament.scrimTotalMatches ? `${tournament.scrimTotalMatches} Matches Scrim` : 'Official Scrim'}</span>
            </div>
            <div className="text-[var(--text-muted)] flex items-center gap-1 truncate max-w-[200px]">
              <MapPin className="w-3 h-3 text-[var(--primary-color)]" />
              <span className="truncate">{tournament.scrimMapsSchedule || tournament.dropMap || 'Official Maps'}</span>
            </div>
          </div>
        )}

        {/* Already Booked Banner */}
        {alreadyBookedSlot && (
          <div className="mx-4 mt-3 p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2 shrink-0">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>
              You already booked <strong>Slot #{alreadyBookedSlot}</strong>. Each team can only join once per scrim.
            </span>
          </div>
        )}

        {/* Clean Form Body: Team Name, Tag, IGL Name, Logo (ImgBB API) */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 text-xs flex-1 overflow-y-auto">
          {/* Team Name & Tag */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="col-span-2">
              <label className="block text-[11px] font-bold text-[var(--text-muted)] uppercase mb-1">
                Team Name *
              </label>
              <input
                type="text"
                value={teamName}
                onChange={e => setTeamName(e.target.value)}
                placeholder="e.g. Soul Esports"
                required
                className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)] font-semibold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[var(--text-muted)] uppercase mb-1">
                Tag (Max 5)
              </label>
              <input
                type="text"
                value={teamTag}
                maxLength={6}
                onChange={e => setTeamTag(e.target.value.toUpperCase())}
                placeholder="SOUL"
                className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)] font-black uppercase text-center"
              />
            </div>
          </div>

          {/* IGL Name */}
          <div>
            <label className="block text-[11px] font-bold text-[var(--text-muted)] uppercase mb-1">
              IGL (In-Game Leader) Name *
            </label>
            <input
              type="text"
              value={iglName}
              onChange={e => setIglName(e.target.value)}
              placeholder="e.g. Mortal_OP or Jonathan"
              required
              className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)] font-semibold"
            />
          </div>

          {/* Team Logo (ImgBB API Upload + URL + Preview) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-bold text-[var(--text-muted)] uppercase">
                Team Logo (ImgBB Upload or URL)
              </label>
              {logoUrl && (
                <button
                  type="button"
                  onClick={() => setLogoUrl('')}
                  className="text-[10px] text-red-400 hover:underline cursor-pointer"
                >
                  Remove Logo
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-xl bg-black/60 border border-[var(--border-color)] flex items-center justify-center overflow-hidden flex-shrink-0">
                {logoUrl ? (
                  <img src={logoUrl} alt="Team Logo" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-5 h-5 text-gray-500" />
                )}
              </div>

              <input
                type="text"
                value={logoUrl}
                onChange={e => setLogoUrl(e.target.value)}
                placeholder="Paste Image URL or choose file"
                className="flex-1 px-3 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)] truncate"
              />

              <label className="px-3.5 min-h-[42px] rounded-xl btn-theme-soft font-bold flex items-center gap-1.5 cursor-pointer flex-shrink-0">
                <Upload className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isUploading ? 'Uploading...' : 'Upload'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>
            </div>
            {uploadStatus && (
              <p className="text-[10px] text-[var(--warning-color)] mt-1 font-medium">{uploadStatus}</p>
            )}
          </div>

          {/* Wallet Balance & Summary */}
          <div className="p-3.5 rounded-xl bg-[var(--secondary-bg)] border border-[var(--border-color)] flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[var(--text-muted)] block uppercase font-bold">
                Wallet Balance
              </span>
              <span className={`text-sm font-black ${balance >= fee ? 'text-green-400' : 'text-red-400'}`}>
                ₹{balance}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-[var(--text-muted)] block uppercase font-bold">
                Entry Fee
              </span>
              <span className="text-sm font-black text-[var(--primary-color)]">
                {fee > 0 ? `₹${fee}` : 'FREE ENTRY'}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 min-h-[44px] py-2.5 rounded-xl btn-theme-outline text-xs font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploading || !!alreadyBookedSlot}
              className="flex-1 min-h-[44px] py-2.5 rounded-xl btn-accent text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Registering...</span>
              ) : alreadyBookedSlot ? (
                <span>Already Registered</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Confirm Slot #{slotNumber}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
