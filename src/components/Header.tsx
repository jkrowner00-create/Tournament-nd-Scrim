import React from 'react';
import { useApp } from '../context/AppContext';
import { Headset, Bell, Wallet, ArrowLeft, Shield } from 'lucide-react';

interface HeaderProps {
  onOpenSupport: () => void;
  onOpenNotifications: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSupport, onOpenNotifications }) => {
  const {
    currentUser,
    userProfile,
    settings,
    currentView,
    navigate,
    unreadNotifCount,
    isAdmin,
  } = useApp();

  const isSubView = currentView !== 'home';
  const displayName = userProfile?.displayName?.split(' ')[0] || (currentUser ? currentUser.email?.split('@')[0] : 'Guest');
  const balance = Math.floor(userProfile?.balance || 0);

  return (
    <header className="fixed top-0 left-0 right-0 h-[64px] z-50 glass-panel border-b border-[var(--border-color)] px-4 flex items-center justify-between">
      {/* Left Slot: Back Button or Logo + User Greeting */}
      <div className="flex items-center gap-3">
        {isSubView ? (
          <button
            onClick={() => navigate('home')}
            className="w-10 h-10 rounded-full flex items-center justify-center btn-theme-outline group cursor-pointer"
            title="Back to Home"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          </button>
        ) : null}

        <div
          onClick={() => navigate('home')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-full bg-[var(--secondary-bg)] border border-[var(--warning-color)] p-0.5 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform overflow-hidden flex-shrink-0">
            <img
              src={settings.logoUrl || 'https://i.ibb.co/LTd1KXk/IMG-20260904-WA0056-1.jpg'}
              alt={settings.appName || 'Logo'}
              referrerPolicy="no-referrer"
              className="w-full h-full rounded-full object-contain"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = 'https://i.ibb.co/LTd1KXk/IMG-20260904-WA0056-1.jpg';
              }}
            />
          </div>
          <div className="leading-tight">
            <span className="text-xs sm:text-sm font-extrabold text-[var(--warning-color)] tracking-wide uppercase block truncate max-w-[140px] sm:max-w-[220px]">
              {settings?.appName?.trim() || 'Gaming Tournament'}
            </span>
            <span className="text-[10px] text-[var(--text-secondary)] font-medium block truncate">
              {currentUser ? `Player: ${displayName}` : 'Esports Arena'}
            </span>
          </div>
        </div>
      </div>

      {/* Right Slot: Admin Shortcut + Support + Notification + Wallet Chip */}
      <div className="flex items-center gap-2">
        {isAdmin && currentView !== 'admin' && (
          <button
            onClick={() => navigate('admin')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 min-h-[38px] text-xs font-bold rounded-xl btn-theme-danger group cursor-pointer"
            title="Open Admin Panel"
          >
            <Shield className="w-3.5 h-3.5 group-hover:rotate-6 transition-transform" />
            <span>Admin</span>
          </button>
        )}

        <button
          onClick={onOpenSupport}
          className="w-10 h-10 rounded-full flex items-center justify-center btn-theme-outline group cursor-pointer"
          title="Customer Live Support"
        >
          <Headset className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
        </button>

        <button
          onClick={onOpenNotifications}
          className="w-10 h-10 rounded-full flex items-center justify-center btn-theme-outline relative group cursor-pointer"
          title="Notifications"
        >
          <Bell className="w-4.5 h-4.5 group-hover:-rotate-12 transition-transform" />
          {unreadNotifCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--danger-color)] text-white text-[10px] font-extrabold flex items-center justify-center shadow-md tabular-nums">
              {unreadNotifCount > 99 ? '99+' : unreadNotifCount}
            </span>
          )}
        </button>

        {currentUser && (
          <button
            onClick={() => navigate('wallet')}
            className="flex items-center gap-1.5 px-3.5 min-h-[40px] rounded-full text-xs font-extrabold btn-accent tabular-nums group cursor-pointer"
          >
            <Wallet className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span>₹{balance}</span>
          </button>
        )}
      </div>
    </header>
  );
};
