import React, { useState, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { THEMES_LIST, type ThemeId } from '../types';
import { uploadToImgBB } from '../services/imgbb';
import { PolicyModal } from '../components/PolicyModal';
import {
  User,
  Camera,
  Edit2,
  Trophy,
  Swords,
  Coins,
  Palette,
  Shield,
  ShieldCheck,
  FileText,
  RotateCcw,
  LogOut,
  Phone,
  Gamepad2,
  Check,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  Share2,
  Flame,
  Zap,
  Award,
  TrendingUp,
} from 'lucide-react';

export const ProfileView: React.FC = () => {
  const {
    currentUser,
    userProfile,
    logout,
    updateInGameName,
    updateProfileAvatar,
    activeTheme,
    userThemeOverride,
    setPersonalTheme,
    resetPersonalTheme,
    settings,
    showToast,
    navigate,
  } = useAppContext();

  // Modals
  const [policyType, setPolicyType] = useState<string | null>(null);
  const [editingIgn, setEditingIgn] = useState(false);
  const [newIgn, setNewIgn] = useState(userProfile?.gameName || '');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingAvatar(true);
      showToast('Uploading avatar to ImgBB...', 'info');
      const url = await uploadToImgBB(file);
      await updateProfileAvatar(url);
      showToast('Avatar updated successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Avatar upload failed', 'danger');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSaveIgn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIgn.trim()) return;
    try {
      await updateInGameName(newIgn.trim());
      setEditingIgn(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to update in-game name', 'danger');
    }
  };

  if (!currentUser || !userProfile) {
    return (
      <div className="min-w-0 max-w-md mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-[var(--surface-color)] border border-[var(--border-color)] flex items-center justify-center text-[var(--primary-color)] mb-4 shadow-xl">
          <User size={36} />
        </div>
        <h2 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tight">
          Join the Arena
        </h2>
        <p className="text-sm text-[var(--text-muted)] mt-1 mb-6">
          Log in or create your player profile to register for tournaments, reserve scrim slots, and customize themes.
        </p>
        <button
          onClick={() => navigate('home')}
          className="w-full min-h-[46px] py-3 px-6 rounded-2xl btn-accent font-black text-sm uppercase tracking-wider cursor-pointer"
        >
          Go to Sign In / Sign Up
        </button>
      </div>
    );
  }

  return (
    <div className="min-w-0 max-w-4xl mx-auto px-4 py-6 pb-28">
      {/* Profile Card Header */}
      <div className="relative rounded-3xl p-6 md:p-8 bg-gradient-to-br from-[var(--surface-color)] to-[var(--bg-card)] border border-[var(--border-color)] shadow-xl overflow-hidden mb-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--primary-glow)] rounded-full blur-3xl opacity-15 pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          {/* Avatar with ImgBB upload */}
          <div className="relative group">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl border-4 border-[var(--primary-color)] overflow-hidden bg-slate-900 shadow-2xl">
              <img
                src={
                  userProfile.photoURL ||
                  `https://api.dicebear.com/7.x/bottts/svg?seed=${userProfile.displayName}`
                }
                alt={userProfile.displayName}
                className="w-full h-full object-cover"
              />
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingAvatar}
              className="absolute -bottom-2 -right-2 p-2.5 rounded-2xl btn-accent shadow-lg cursor-pointer"
              title="Upload Avatar via ImgBB"
            >
              <Camera size={16} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          {/* User Details */}
          <div className="flex-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--primary-color)]/10 text-xs font-bold text-[var(--primary-color)] uppercase tracking-wider mb-2">
              <ShieldCheck size={13} className="text-[var(--success-color)]" /> Verified Arena Gladiator
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
                {userProfile.displayName}
              </h1>
              <button
                onClick={() => {
                  setNewIgn(userProfile.gameName || userProfile.displayName);
                  setEditingIgn(true);
                }}
                className="w-8 h-8 rounded-xl btn-theme-outline flex items-center justify-center cursor-pointer"
                title="Edit In-game Name"
              >
                <Edit2 size={14} />
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-[var(--text-muted)] mt-2">
              <span className="flex items-center gap-1">
                <Gamepad2 size={13} className="text-[var(--primary-color)]" />
                IGN: <strong className="text-[var(--text-primary)]">{userProfile.gameName || 'Gladiator'}</strong>
              </span>
              <span className="flex items-center gap-1">
                <Phone size={13} className="text-[var(--primary-color)]" />
                {userProfile.mobile || 'No Mobile'}
              </span>
              <span>
                Referral Code:{' '}
                <strong className="text-[var(--primary-color)] uppercase font-mono">
                  {userProfile.referralCode}
                </strong>
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-[var(--border-color)]">
          <div className="p-3 rounded-2xl bg-[var(--bg-main)]/60 border border-[var(--border-color)] text-center">
            <div className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Matches Played</div>
            <div className="text-xl font-black text-[var(--text-primary)] mt-0.5">
              {userProfile.totalMatches || 0}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[var(--bg-main)]/60 border border-[var(--border-color)] text-center">
            <div className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Victories (Wins)</div>
            <div className="text-xl font-black text-amber-400 mt-0.5">
              {userProfile.wonMatches || 0}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[var(--bg-main)]/60 border border-[var(--border-color)] text-center">
            <div className="text-[10px] uppercase font-bold text-[var(--text-muted)] flex items-center justify-center gap-1">
              <TrendingUp size={11} className="text-green-400" /> Win Rate
            </div>
            <div className="text-xl font-black text-green-400 mt-0.5">
              {userProfile.totalMatches
                ? Math.round(((userProfile.wonMatches || 0) / userProfile.totalMatches) * 100)
                : 0}%
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[var(--bg-main)]/60 border border-[var(--border-color)] text-center">
            <div className="text-[10px] uppercase font-bold text-[var(--text-muted)] flex items-center justify-center gap-1">
              <Flame size={11} className="text-orange-400" /> Win Streak
            </div>
            <div className="text-xl font-black text-orange-400 mt-0.5">
              {userProfile.winStreak || (userProfile.wonMatches ? Math.min(userProfile.wonMatches, 3) : 0)} 🔥
            </div>
          </div>
        </div>
      </div>

      {/* MVP BADGES & HONORS GALLERY */}
      <div className="rounded-3xl p-6 bg-[var(--surface-color)] border border-[var(--border-color)] mb-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Award size={20} className="text-[var(--primary-color)]" />
            <h2 className="text-lg font-bold text-[var(--text-primary)] uppercase tracking-wide">
              Esports MVP Badges & Honors
            </h2>
          </div>
          <span className="text-xs text-[var(--text-muted)] font-bold">
            Career Accolades
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            {
              id: 'apex',
              title: 'Apex Predator',
              desc: '5+ Tournament Victories',
              icon: Trophy,
              color: 'from-amber-500/20 to-yellow-500/10 border-amber-500/40 text-amber-400',
              unlocked: (userProfile.wonMatches || 0) >= 5,
            },
            {
              id: 'sniper',
              title: 'Headshot Legend',
              desc: 'Master of lethal precision',
              icon: Zap,
              color: 'from-sky-500/20 to-blue-500/10 border-sky-500/40 text-sky-400',
              unlocked: (userProfile.wonMatches || 0) >= 2,
            },
            {
              id: 'streak',
              title: 'On Fire Streak',
              desc: '2+ Consecutive match wins',
              icon: Flame,
              color: 'from-orange-500/20 to-red-500/10 border-orange-500/40 text-orange-400',
              unlocked: (userProfile.winStreak || userProfile.wonMatches || 0) >= 2,
            },
            {
              id: 'roller',
              title: 'High Roller',
              desc: '₹1,000+ Prize Winnings',
              icon: Coins,
              color: 'from-emerald-500/20 to-green-500/10 border-emerald-500/40 text-emerald-400',
              unlocked: (userProfile.totalEarnings || userProfile.winningCash || 0) >= 1000,
            },
            {
              id: 'scrim_vet',
              title: 'Scrim Veteran',
              desc: '3+ Competitive matches',
              icon: Shield,
              color: 'from-purple-500/20 to-indigo-500/10 border-purple-500/40 text-purple-400',
              unlocked: (userProfile.totalMatches || 0) >= 3,
            },
            {
              id: 'mvp',
              title: 'Gladiator Elite',
              desc: 'Complete account verification',
              icon: Award,
              color: 'from-rose-500/20 to-pink-500/10 border-rose-500/40 text-rose-400',
              unlocked: true,
            },
          ].map(badge => {
            const Icon = badge.icon;
            return (
              <div
                key={badge.id}
                className={`p-3.5 rounded-2xl border transition-all relative overflow-hidden ${
                  badge.unlocked
                    ? `bg-gradient-to-br ${badge.color} shadow-md`
                    : 'bg-[var(--bg-card)] border-[var(--border-color)] opacity-50 grayscale'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-xl bg-[var(--bg-main)]/70 flex items-center justify-center">
                    <Icon size={16} />
                  </div>
                  <span
                    className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                      badge.unlocked
                        ? 'bg-[var(--bg-main)]/80 text-[var(--text-primary)] border border-[var(--border-color)]'
                        : 'bg-[var(--bg-main)]/60 text-[var(--text-muted)]'
                    }`}
                  >
                    {badge.unlocked ? 'UNLOCKED' : 'LOCKED'}
                  </span>
                </div>
                <div className="text-xs font-bold text-[var(--text-primary)] truncate">{badge.title}</div>
                <div className="text-[10px] text-[var(--text-muted)] mt-0.5 truncate">{badge.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ADMIN-CONTROLLED PLATFORM THEME STATUS */}
      <div className="rounded-3xl p-5 bg-[var(--surface-color)] border border-[var(--border-color)] mb-6 shadow-lg">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--primary-color)]/10 text-[var(--primary-color)] border border-[var(--primary-color)]/30 flex items-center justify-center">
              <Palette size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wide">
                  Active Platform Theme
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-[var(--primary-color)]/15 text-[var(--primary-color)] border border-[var(--primary-color)]/30">
                  Admin Controlled
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                The visual theme and results graphics are managed globally by the platform administrator.
              </p>
            </div>
          </div>

          {/* Current Theme Pill */}
          {(() => {
            const currentObj = THEMES_LIST.find(t => t.id === activeTheme) || THEMES_LIST[0];
            return (
              <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)]">
                <div className="flex items-center -space-x-1">
                  {currentObj.previewColors.map((c, i) => (
                    <div
                      key={i}
                      className="w-3.5 h-3.5 rounded-full border border-black/40 shadow-sm"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <span className="text-xs font-black text-[var(--primary-color)] uppercase tracking-wider">
                  {currentObj.name.split(' (')[0]}
                </span>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Policy & Community Section */}
      <div className="rounded-3xl p-6 bg-[var(--surface-color)] border border-[var(--border-color)] mb-6 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <Shield size={20} className="text-[var(--primary-color)]" />
          <h2 className="text-lg font-bold text-[var(--text-primary)] uppercase tracking-wide">
            Policies & Fair Play
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { id: 'terms', label: 'Terms & Conditions', icon: FileText },
            { id: 'privacy', label: 'Privacy Policy', icon: Shield },
            { id: 'refund', label: 'Refund & Cancellation', icon: Coins },
            { id: 'fairplay', label: 'Fair Play & Anti-Cheat', icon: Swords },
            { id: 'refer', label: 'Refer & Earn (Win Cash)', icon: Share2 },
          ].map(p => {
            const Icon = p.icon;
            return (
              <button
                key={p.id}
                onClick={() => setPolicyType(p.id)}
                className="flex items-center justify-between p-3.5 min-h-[54px] rounded-2xl btn-theme-outline cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] flex items-center justify-center text-[var(--primary-color)] group-hover:scale-105 transition-transform">
                    <Icon size={16} />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                    {p.label}
                  </span>
                </div>
                <ChevronRight size={16} className="text-[var(--text-muted)] group-hover:translate-x-1 transition-transform" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Logout Action */}
      <div className="flex items-center justify-between pt-2">
        <div className="text-xs text-[var(--text-muted)]">
          Logged in as <strong className="text-[var(--text-primary)]">{currentUser.email}</strong>
        </div>
        <button
          onClick={logout}
          className="inline-flex items-center gap-2 px-4 min-h-[42px] rounded-xl btn-theme-danger text-xs font-bold uppercase tracking-wider cursor-pointer group"
        >
          <LogOut size={14} className="group-hover:-translate-x-0.5 transition-transform" /> Sign Out
        </button>
      </div>

      {/* Edit IGN Modal */}
      {editingIgn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-[var(--surface-color)] border border-[var(--border-color)] p-6 shadow-2xl animate-card-enter">
            <h3 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-wide mb-1">
              Update In-Game Name
            </h3>
            <p className="text-xs text-[var(--text-muted)] mb-4">
              Enter your exact IGN so tournament organizers can verify your kills and match results.
            </p>

            <form onSubmit={handleSaveIgn} className="space-y-4">
              <input
                type="text"
                value={newIgn}
                onChange={e => setNewIgn(e.target.value)}
                placeholder="e.g. Mortal_OP"
                required
                className="w-full px-4 py-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)]"
              />

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingIgn(false)}
                  className="flex-1 min-h-[42px] py-2.5 rounded-xl btn-theme-outline text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 min-h-[42px] py-2.5 rounded-xl btn-accent text-xs font-extrabold uppercase tracking-wider cursor-pointer"
                >
                  Save IGN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Policy Modal */}
      {policyType && (
        <PolicyModal
          policyType={policyType as any}
          onClose={() => setPolicyType(null)}
        />
      )}
    </div>
  );
};

export default ProfileView;
