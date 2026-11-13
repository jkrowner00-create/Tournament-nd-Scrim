import React, { useState } from 'react';
import type { AdminSecurityConfig } from '../types';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  Key,
  KeyRound,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  User,
  Fingerprint,
} from 'lucide-react';

interface AdminSecurityGateProps {
  adminSecurity: AdminSecurityConfig | null;
  setupAdminSecurity: (config: {
    username: string;
    password: string;
    pin: string;
    adminName: string;
  }) => Promise<void>;
  loginAdminSecurity: (credential: string, isPin?: boolean) => Promise<boolean>;
  onBackToHome: () => void;
}

export const AdminSecurityGate: React.FC<AdminSecurityGateProps> = ({
  adminSecurity,
  setupAdminSecurity,
  loginAdminSecurity,
  onBackToHome,
}) => {
  const isFirstTimeSetup = !adminSecurity?.isConfigured;

  // --- Initial One-Time Setup Form State ---
  const [setupUsername, setSetupUsername] = useState('admin');
  const [setupPassword, setSetupPassword] = useState('');
  const [setupConfirmPassword, setSetupConfirmPassword] = useState('');
  const [setupPin, setSetupPin] = useState('');
  const [setupAdminName, setSetupAdminName] = useState('SS BATTLE Official');
  const [showSetupPassword, setShowSetupPassword] = useState(false);
  const [isSubmittingSetup, setIsSubmittingSetup] = useState(false);
  const [setupError, setSetupError] = useState('');

  // --- Login Form State ---
  const [loginMethod, setLoginMethod] = useState<'pin' | 'password'>('pin');
  const [loginPin, setLoginPin] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [isSubmittingLogin, setIsSubmittingLogin] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Handle Initial One-Time Signup / Setup
  const handleSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSetupError('');

    if (!setupUsername.trim()) {
      setSetupError('Please enter an admin username.');
      return;
    }
    if (setupPassword.length < 6) {
      setSetupError('Master password must be at least 6 characters long.');
      return;
    }
    if (setupPassword !== setupConfirmPassword) {
      setSetupError('Passwords do not match. Please re-enter.');
      return;
    }
    if (!/^\d{4}$/.test(setupPin.trim())) {
      setSetupError('Security PIN must be exactly 4 digits (e.g. 1234).');
      return;
    }

    try {
      setIsSubmittingSetup(true);
      await setupAdminSecurity({
        username: setupUsername.trim(),
        password: setupPassword,
        pin: setupPin.trim(),
        adminName: setupAdminName.trim() || 'SS BATTLE Official',
      });
    } catch (err: any) {
      setSetupError(err.message || 'Failed to initialize security key.');
    } finally {
      setIsSubmittingSetup(false);
    }
  };

  // Handle Login with PIN
  const handlePinSubmit = async (pinValue?: string) => {
    const targetPin = pinValue !== undefined ? pinValue : loginPin;
    setLoginError('');

    if (!targetPin || targetPin.length < 4) {
      setLoginError('Please enter your 4-digit security PIN.');
      return;
    }

    try {
      setIsSubmittingLogin(true);
      const ok = await loginAdminSecurity(targetPin, true);
      if (!ok) {
        setLoginError('Incorrect 4-digit PIN. Please try again.');
        setLoginPin('');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Login failed.');
      setLoginPin('');
    } finally {
      setIsSubmittingLogin(false);
    }
  };

  // Handle Login with Master Password
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginPassword) {
      setLoginError('Please enter your Master Admin Password.');
      return;
    }

    try {
      setIsSubmittingLogin(true);
      const ok = await loginAdminSecurity(loginPassword, false);
      if (!ok) {
        setLoginError('Invalid Master Password.');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Login failed.');
    } finally {
      setIsSubmittingLogin(false);
    }
  };

  // Numeric pad press for PIN
  const handleNumpadPress = (num: string) => {
    if (loginPin.length < 4) {
      const next = loginPin + num;
      setLoginPin(next);
      if (next.length === 4) {
        handlePinSubmit(next);
      }
    }
  };

  const handleNumpadBackspace = () => {
    setLoginPin(prev => prev.slice(0, -1));
    setLoginError('');
  };

  const handleNumpadClear = () => {
    setLoginPin('');
    setLoginError('');
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background Ambience Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10">
        {/* Top Branding Shield */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-red-500/20 via-amber-500/20 to-red-600/30 border-2 border-red-500/50 shadow-2xl shadow-red-500/20 mb-3 text-red-400">
            {isFirstTimeSetup ? <Key size={32} /> : <Lock size={32} />}
          </div>
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-500/20 border border-red-500/40 text-red-400 flex items-center gap-1">
              <ShieldAlert size={12} /> SECURE AREA
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 border border-amber-500/40 text-amber-400">
              {isFirstTimeSetup ? 'ONE-TIME INITIALIZATION' : 'LOCKED SESSION'}
            </span>
          </div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">
            {isFirstTimeSetup ? 'Setup Admin Security' : 'Esports Admin Console'}
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1 max-w-sm mx-auto">
            {isFirstTimeSetup
              ? 'Initialize permanent master security credentials for platform governance.'
              : `Authenticated access required for ${adminSecurity?.adminName || 'SS BATTLE APP'}.`}
          </p>
        </div>

        {/* ======================================================== */}
        {/* SCENARIO 1: ONE-TIME SIGNUP / INITIAL SETUP              */}
        {/* ======================================================== */}
        {isFirstTimeSetup ? (
          <div className="p-6 sm:p-7 rounded-3xl bg-[var(--surface-color)]/95 border border-[var(--border-color)] shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-2 pb-4 mb-4 border-b border-[var(--border-color)] text-xs text-amber-400 font-bold uppercase tracking-wider">
              <KeyRound size={16} /> One-Time Master Key Registration
            </div>

            {setupError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={16} className="flex-shrink-0" />
                <span>{setupError}</span>
              </div>
            )}

            <form onSubmit={handleSetupSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--text-primary)] uppercase tracking-wide mb-1">
                  Organizer / Admin Name *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-[var(--text-muted)]">
                    <User size={15} />
                  </span>
                  <input
                    type="text"
                    required
                    value={setupAdminName}
                    onChange={e => setSetupAdminName(e.target.value)}
                    placeholder="e.g. SS BATTLE Official or Shamroz Khan"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <span className="text-[10px] text-[var(--text-muted)] mt-0.5 block">
                  Displayed on official GFX payout receipts & broadcast credentials.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-primary)] uppercase tracking-wide mb-1">
                  Master Admin Username *
                </label>
                <input
                  type="text"
                  required
                  value={setupUsername}
                  onChange={e => setSetupUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-primary)] uppercase tracking-wide mb-1">
                  Master Password (Min 6 Characters) *
                </label>
                <div className="relative">
                  <input
                    type={showSetupPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={setupPassword}
                    onChange={e => setSetupPassword(e.target.value)}
                    placeholder="••••••••••"
                    className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSetupPassword(p => !p)}
                    className="absolute right-3 top-2.5 text-[var(--text-muted)] hover:text-white"
                  >
                    {showSetupPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-primary)] uppercase tracking-wide mb-1">
                  Confirm Master Password *
                </label>
                <input
                  type="password"
                  required
                  value={setupConfirmPassword}
                  onChange={e => setSetupConfirmPassword(e.target.value)}
                  placeholder="••••••••••"
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-amber-400 uppercase tracking-wide mb-1">
                  Quick 4-Digit Security PIN *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-amber-400">
                    <Fingerprint size={15} />
                  </span>
                  <input
                    type="password"
                    maxLength={4}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    required
                    value={setupPin}
                    onChange={e => setSetupPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="4 digits (e.g. 1234)"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-main)] border border-amber-500/40 text-xs text-amber-400 font-mono tracking-widest font-black placeholder-slate-600 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <span className="text-[10px] text-amber-400/80 mt-0.5 block">
                  Allows instant 1-tap unlocking in the future without typing long passwords.
                </span>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingSetup}
                  className="w-full min-h-[46px] py-3 rounded-2xl btn-accent font-black text-xs uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2"
                >
                  <ShieldCheck size={16} />
                  {isSubmittingSetup ? 'Creating Master Key...' : 'Create Master Key & Unlock Admin'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* ======================================================== */
          /* SCENARIO 2: SUBSEQUENT VISITS LOGIN GATE                 */
          /* ======================================================== */
          <div className="p-6 sm:p-7 rounded-3xl bg-[var(--surface-color)]/95 border border-[var(--border-color)] shadow-2xl backdrop-blur-xl">
            {/* Toggle Between PIN and Password */}
            <div className="grid grid-cols-2 gap-1.5 p-1.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] mb-5">
              <button
                type="button"
                onClick={() => {
                  setLoginMethod('pin');
                  setLoginError('');
                }}
                className={`min-h-[40px] rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5 ${
                  loginMethod === 'pin' ? 'btn-accent' : 'btn-theme-outline border-transparent'
                }`}
              >
                <Fingerprint size={14} /> Quick 4-Digit PIN
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginMethod('password');
                  setLoginError('');
                }}
                className={`min-h-[40px] rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5 ${
                  loginMethod === 'password' ? 'btn-theme-danger' : 'btn-theme-outline border-transparent'
                }`}
              >
                <KeyRound size={14} /> Master Password
              </button>
            </div>

            {loginError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold flex items-center gap-2 animate-shake">
                <AlertCircle size={16} className="flex-shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            {/* METHOD A: 4-DIGIT PIN */}
            {loginMethod === 'pin' ? (
              <div className="space-y-5">
                <div className="text-center">
                  <div className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">
                    Enter Security PIN
                  </div>
                  {/* 4 Dot Indicators */}
                  <div className="flex items-center justify-center gap-4 py-2">
                    {[0, 1, 2, 3].map(idx => {
                      const isFilled = loginPin.length > idx;
                      return (
                        <div
                          key={idx}
                          className={`w-4 h-4 rounded-full border-2 transition-all ${
                            isFilled
                              ? 'bg-amber-400 border-amber-400 scale-125 shadow-lg shadow-amber-400/50'
                              : 'bg-transparent border-[var(--border-color)]'
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Interactive On-Screen Numpad */}
                <div className="grid grid-cols-3 gap-2.5 max-w-[280px] mx-auto">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleNumpadPress(num)}
                      disabled={isSubmittingLogin || loginPin.length >= 4}
                      className="h-12 rounded-2xl btn-theme-outline text-base font-black cursor-pointer"
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={handleNumpadClear}
                    className="h-12 rounded-2xl btn-theme-danger text-xs font-bold cursor-pointer"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNumpadPress('0')}
                    disabled={isSubmittingLogin || loginPin.length >= 4}
                    className="h-12 rounded-2xl btn-theme-outline text-base font-black cursor-pointer"
                  >
                    0
                  </button>
                  <button
                    type="button"
                    onClick={handleNumpadBackspace}
                    className="h-12 rounded-2xl btn-theme-soft text-xs font-bold cursor-pointer"
                  >
                    ⌫
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handlePinSubmit()}
                  disabled={isSubmittingLogin || loginPin.length < 4}
                  className="w-full min-h-[46px] py-3 rounded-2xl btn-accent font-black text-xs uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Unlock size={16} />
                  {isSubmittingLogin ? 'Verifying PIN...' : 'Unlock Admin Console'}
                </button>
              </div>
            ) : (
              /* METHOD B: MASTER PASSWORD */
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-primary)] uppercase tracking-wide mb-1">
                    Master Admin Password
                  </label>
                  <div className="relative">
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      placeholder="••••••••••"
                      className="w-full pl-4 pr-10 py-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(p => !p)}
                      className="absolute right-3 top-3 text-[var(--text-muted)] hover:text-white"
                    >
                      {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmittingLogin}
                    className="w-full min-h-[46px] py-3 rounded-2xl btn-accent font-black text-xs uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Unlock size={16} />
                    {isSubmittingLogin ? 'Verifying Password...' : 'Unlock Admin Console'}
                  </button>
                </div>
              </form>
            )}

            <div className="mt-5 pt-4 border-t border-[var(--border-color)] text-center">
              <span className="text-[11px] text-[var(--text-muted)]">
                Admin credentials configured on {new Date(adminSecurity.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        )}

        {/* Back to Public Lobby Button */}
        <div className="text-center mt-5">
          <button
            type="button"
            onClick={onBackToHome}
            className="inline-flex items-center gap-1.5 px-4 min-h-[38px] rounded-xl btn-theme-outline text-xs font-bold cursor-pointer"
          >
            <ArrowLeft size={14} /> Back to Public Player Lobby
          </button>
        </div>
      </div>
    </div>
  );
};
