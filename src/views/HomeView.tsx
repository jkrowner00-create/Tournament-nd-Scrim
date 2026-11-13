import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import type { Tournament } from '../types';
import {
  Trophy,
  Flame,
  Calendar,
  ArrowRight,
  Gamepad2,
} from 'lucide-react';

interface GameCategoryCardProps {
  game: { id: string; name: string; imageUrl: string };
  upcomingCount: number;
  index: number;
  onClick: () => void;
}

const GameCategoryCard: React.FC<GameCategoryCardProps> = ({
  game,
  upcomingCount,
  index,
  onClick,
}) => {
  const fallbackImage = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800';
  const [imgSrc, setImgSrc] = useState<string>(game.imageUrl || fallbackImage);
  const [hasError, setHasError] = useState(false);

  React.useEffect(() => {
    setImgSrc(game.imageUrl || fallbackImage);
    setHasError(false);
  }, [game.imageUrl]);

  const handleImgError = () => {
    if (imgSrc !== fallbackImage) {
      setImgSrc(fallbackImage);
    } else {
      setHasError(true);
    }
  };

  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 14, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.05, 0.25), ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -3 }}
      className="tournament-card-animated group overflow-hidden cursor-pointer flex flex-col rounded-2xl text-left w-full"
    >
      {/* Visual Header / Graphic */}
      <div className="h-32 sm:h-36 w-full relative overflow-hidden bg-black/75 flex items-center justify-center p-2">
        {!hasError ? (
          <>
            {/* Ambient Blurred Backdrop */}
            <img
              src={imgSrc}
              alt=""
              aria-hidden="true"
              onError={() => {}}
              className="absolute inset-0 w-full h-full object-cover blur-xl opacity-30 scale-125 pointer-events-none"
            />
            {/* Main Crisp Artwork (100% visible, uncropped) */}
            <img
              src={imgSrc}
              alt={game.name}
              referrerPolicy="no-referrer"
              onError={handleImgError}
              className="relative z-10 max-h-full max-w-full w-auto h-auto object-contain group-hover:scale-105 transition-transform duration-300"
            />
          </>
        ) : (
          /* Graceful Neon Fallback if image fails entirely */
          <div className="relative z-10 flex flex-col items-center justify-center text-center p-3 w-full h-full bg-gradient-to-br from-slate-900 via-black to-slate-950">
            <div className="w-12 h-12 rounded-2xl bg-[var(--warning-color)]/10 border border-[var(--warning-color)]/30 flex items-center justify-center text-[var(--warning-color)] mb-2 shadow-inner">
              <Gamepad2 size={24} />
            </div>
            <span className="text-xs font-black uppercase tracking-wider text-[var(--warning-color)] line-clamp-1">
              {game.name}
            </span>
          </div>
        )}

        {/* Clean status badge - only when matches exist */}
        {upcomingCount > 0 && (
          <div className="absolute top-2.5 right-2.5 z-20">
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-black/80 backdrop-blur-md text-emerald-400 border border-emerald-500/30 shadow-sm flex items-center gap-1.5 tabular-nums">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {upcomingCount} {upcomingCount === 1 ? 'Match Open' : 'Matches Open'}
            </span>
          </div>
        )}

        {/* Ambient Dark Gradient overlay for contrast */}
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />
      </div>

      {/* High-Contrast Game Info & Action */}
      <div className="w-full p-3.5 bg-[var(--surface-color)]/95 border-t border-[var(--border-color)]/40 flex items-center justify-between gap-2 mt-auto">
        <div className="min-w-0 flex-1">
          <h3 className="font-extrabold text-sm text-[var(--text-primary)] leading-tight truncate group-hover:text-[var(--glow-color-1)] transition-colors">
            {game.name}
          </h3>
          <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)] mt-1">
            {upcomingCount > 0 ? (
              <span className="text-[var(--success-color)] font-semibold">
                {upcomingCount} scheduled {upcomingCount === 1 ? 'tournament' : 'tournaments'}
              </span>
            ) : (
              <span>Lobbies open shortly</span>
            )}
          </div>
        </div>
        <div className="w-8 h-8 rounded-xl btn-theme-soft flex items-center justify-center flex-shrink-0 shadow-sm">
          <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </motion.button>
  );
};

interface HomeViewProps {
  onSelectGame?: (gameId: string) => void;
  onOpenSoloJoin?: (t: Tournament) => void;
  onOpenSlotlist?: (t: Tournament) => void;
  onOpenRoomIdPass?: (t: Tournament) => void;
  onOpenResults?: (t: Tournament) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onSelectGame,
  onOpenSoloJoin,
  onOpenSlotlist,
  onOpenRoomIdPass,
  onOpenResults,
}) => {
  const {
    currentUser,
    userProfile,
    games,
    promotions,
    tournaments,
    settings,
    setSelectedGameFilter,
    loginWithMobile,
    registerWithMobile,
    navigate,
    showToast,
  } = useApp();

  // Auth Tabs (Login vs Register)
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [loginMobile, setLoginMobile] = useState('');
  const [loginPass, setLoginPass] = useState('');

  const [regMobile, setRegMobile] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regConfirmPass, setRegConfirmPass] = useState('');
  const [regName, setRegName] = useState('');
  const [regGameName, setRegGameName] = useState('');
  const [regGameUid, setRegGameUid] = useState('');
  const [regReferCode, setRegReferCode] = useState('');
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active Promo Index
  const [activePromoIndex, setActivePromoIndex] = useState(0);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginMobile.trim() || !loginPass.trim()) {
      showToast('Enter mobile number and password.', 'warning');
      return;
    }
    setIsSubmitting(true);
    try {
      await loginWithMobile(loginMobile, loginPass);
    } catch (err: any) {
      showToast(err.message || 'Login failed.', 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regPass !== regConfirmPass) {
      showToast('Passwords do not match.', 'warning');
      return;
    }
    if (!agreePrivacy) {
      showToast('You must agree to the privacy policy.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      await registerWithMobile(
        regMobile,
        regPass,
        regName,
        regGameName,
        regGameUid,
        regReferCode.trim() || undefined
      );
    } catch (err: any) {
      showToast(err.message || 'Registration failed.', 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter My Joined Contests
  const myJoinedTournaments = tournaments.filter(
    t => userProfile?.joinedTournaments?.[t.id] && (t.status === 'upcoming' || t.status === 'ongoing')
  );

  return (
    <div className="pb-24 pt-20 px-3 sm:px-4 max-w-4xl mx-auto space-y-5">

      {/* 1. AUTH CARD (When logged out) */}
      {!currentUser && (
        <div className="glass-card p-5 sm:p-7 border border-[var(--border-color)]">
          <div className="flex gap-2 border-b border-[var(--border-color)] pb-3 mb-5">
            <button
              type="button"
              onClick={() => setAuthTab('login')}
              className={`flex-1 min-h-[42px] rounded-xl text-sm font-bold cursor-pointer ${
                authTab === 'login' ? 'btn-accent' : 'btn-theme-outline'
              }`}
            >
              Player Login
            </button>
            <button
              type="button"
              onClick={() => setAuthTab('register')}
              className={`flex-1 min-h-[42px] rounded-xl text-sm font-bold cursor-pointer ${
                authTab === 'register' ? 'btn-accent' : 'btn-theme-outline'
              }`}
            >
              Create Account
            </button>
          </div>

          {authTab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  value={loginMobile}
                  onChange={e => setLoginMobile(e.target.value)}
                  placeholder="e.g. 03001234567"
                  required
                  className="w-full px-3 py-2.5 app-input text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={loginPass}
                  onChange={e => setLoginPass(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-3 py-2.5 app-input text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full min-h-[44px] py-2.5 rounded-xl btn-accent text-xs font-extrabold uppercase tracking-wider cursor-pointer"
              >
                {isSubmitting ? 'Logging in...' : 'Sign In to Arena'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={regName}
                    onChange={e => setRegName(e.target.value)}
                    placeholder="John Doe"
                    required
                    className="w-full px-3 py-2 app-input text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    value={regMobile}
                    onChange={e => setRegMobile(e.target.value)}
                    placeholder="03001234567"
                    required
                    className="w-full px-3 py-2 app-input text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                    In-Game Name (IGN) *
                  </label>
                  <input
                    type="text"
                    value={regGameName}
                    onChange={e => setRegGameName(e.target.value)}
                    placeholder="MortalOP"
                    required
                    className="w-full px-3 py-2 app-input text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                    In-Game Character UID *
                  </label>
                  <input
                    type="text"
                    value={regGameUid}
                    onChange={e => setRegGameUid(e.target.value)}
                    placeholder="512345678"
                    required
                    className="w-full px-3 py-2 app-input text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                    Password (min 6 chars) *
                  </label>
                  <input
                    type="password"
                    value={regPass}
                    onChange={e => setRegPass(e.target.value)}
                    placeholder="••••••"
                    minLength={6}
                    required
                    className="w-full px-3 py-2 app-input text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    value={regConfirmPass}
                    onChange={e => setRegConfirmPass(e.target.value)}
                    placeholder="••••••"
                    required
                    className="w-full px-3 py-2 app-input text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                  Referral Code (Optional)
                </label>
                <input
                  type="text"
                  value={regReferCode}
                  onChange={e => setRegReferCode(e.target.value)}
                  placeholder="Enter friend's refer code"
                  className="w-full px-3 py-2 app-input text-xs font-mono uppercase"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="privacyAgree"
                  checked={agreePrivacy}
                  onChange={e => setAgreePrivacy(e.target.checked)}
                  required
                  className="rounded border-[var(--border-color)] bg-[var(--secondary-bg)] text-[var(--warning-color)]"
                />
                <label htmlFor="privacyAgree" className="text-[11px] text-[var(--text-secondary)]">
                  I agree to fair-play rules & privacy policies.
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full min-h-[44px] py-2.5 rounded-xl btn-accent text-xs font-extrabold uppercase tracking-wider cursor-pointer"
              >
                {isSubmitting ? 'Creating Profile...' : 'Complete Registration (Get ₹5 Bonus)'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* 2. PROMOTIONS CAROUSEL */}
      {promotions.length > 0 && (
        <div className="relative rounded-2xl overflow-hidden glass-card border border-[var(--border-color)] group">
          <div className="relative h-44 sm:h-56 w-full overflow-hidden bg-black/90 flex items-center justify-center">
            {promotions.map((p, idx) => (
              <div
                key={p.id}
                className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${
                  idx === activePromoIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
              >
                {/* Ambient Blurred Backdrop */}
                <img
                  src={p.imageUrl}
                  alt=""
                  aria-hidden="true"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200';
                  }}
                  className="absolute inset-0 w-full h-full object-cover blur-xl opacity-25 scale-110 pointer-events-none"
                />
                {/* Whole Uncropped Promo Banner */}
                <img
                  src={p.imageUrl}
                  alt="Promotion"
                  className="relative z-10 max-h-full max-w-full w-auto h-auto object-contain p-1"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4 pointer-events-none">
                  <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-[var(--warning-color)] text-[var(--btn-accent-text)] shadow">
                    Featured Event
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Dots Indicator */}
          {promotions.length > 1 && (
            <div className="absolute bottom-2.5 right-4 z-20 flex gap-1.5">
              {promotions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePromoIndex(idx)}
                  aria-label={`View promo ${idx + 1}`}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    idx === activePromoIndex ? 'w-6 bg-[var(--glow-color-1)] shadow-[0_0_8px_var(--glow-color-2)]' : 'w-2 bg-white/45 hover:bg-white/75'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. ESPORT GAMES SHOWCASE */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-[var(--warning-color)]" />
            <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
              Esport Titles
            </h2>
          </div>
          <span className="text-xs text-[var(--text-secondary)]">Tap a game to see its matches & results</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {games.map((game, idx) => {
            const upcomingCount = tournaments.filter(
              t => t.gameId === game.id && (t.status || '').toLowerCase() === 'upcoming'
            ).length;

            return (
              <GameCategoryCard
                key={game.id}
                game={game}
                upcomingCount={upcomingCount}
                index={idx}
                onClick={() => {
                  if (onSelectGame) onSelectGame(game.id);
                  setSelectedGameFilter(game.id);
                  navigate('tournaments');
                }}
              />
            );
          })}
        </div>
      </div>

      {/* 4. MY REGISTERED CONTESTS */}
      {currentUser && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[var(--warning-color)]" />
              <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                My Contests ({myJoinedTournaments.length})
              </h2>
            </div>
            {myJoinedTournaments.length > 0 && (
              <button
                onClick={() => navigate('tournaments')}
                className="px-3 min-h-[34px] rounded-xl text-xs font-bold btn-theme-soft flex items-center gap-1 group cursor-pointer"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}
          </div>

          {myJoinedTournaments.length > 0 ? (
            <div className="space-y-3">
              {myJoinedTournaments.map((t, idx) => {
                const isOngoing = t.status === 'ongoing';
                return (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.24, delay: Math.min(idx * 0.05, 0.2), ease: [0.16, 1, 0.3, 1] }}
                    whileHover={{ y: -2 }}
                    className="tournament-card-animated rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                            isOngoing
                              ? 'bg-[var(--danger-color)]/15 text-[var(--danger-color)] border border-[var(--danger-color)]/40'
                              : 'bg-[var(--glow-color-1)]/15 text-[var(--glow-color-1)] border border-[var(--glow-color-1)]/35'
                          }`}
                        >
                          {isOngoing ? 'LIVE MATCH' : t.mode}
                        </span>
                        <strong className="text-sm text-[var(--text-primary)]">{t.name}</strong>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)] tabular-nums">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-[var(--glow-color-1)]" />
                          {new Date(t.startTime).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <span>Prize Pool: ₹{t.prizePool}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {t.isScrim ? (
                        <button
                          onClick={() => {
                            if (onOpenSlotlist) onOpenSlotlist(t);
                            else navigate('tournaments');
                          }}
                          className="px-3.5 min-h-[38px] rounded-xl btn-theme-outline text-xs font-bold cursor-pointer whitespace-nowrap"
                        >
                          View Slotlist
                        </button>
                      ) : null}

                      {(isOngoing || t.showIdPass) && (
                        <button
                          onClick={() => {
                            if (onOpenRoomIdPass) onOpenRoomIdPass(t);
                            else navigate('tournaments');
                          }}
                          className="px-3.5 min-h-[38px] rounded-xl btn-accent text-xs font-extrabold flex items-center gap-1 cursor-pointer whitespace-nowrap"
                        >
                          <span>Room ID & Pass</span>
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-[var(--secondary-bg)] border border-[var(--border-color)] text-center text-xs text-[var(--text-secondary)]">
              <p>You haven't joined any active tournament or scrim yet.</p>
              <button
                onClick={() => navigate('tournaments')}
                className="mt-3 px-5 min-h-[42px] rounded-xl btn-accent text-xs font-extrabold uppercase tracking-wider cursor-pointer"
              >
                Explore Upcoming Scrims
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HomeView;
