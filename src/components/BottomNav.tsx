import React from 'react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { Home, Wallet, Trophy, BarChart3, User, Shield } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { currentView, navigate, isAdmin } = useApp();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'tournaments', label: 'Matches', icon: Trophy },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'leaderboard', label: 'Ranks', icon: BarChart3 },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  if (isAdmin) {
    navItems.push({ id: 'admin', label: 'Admin', icon: Shield });
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-[68px] z-40 glass-panel border-t border-[var(--border-color)] flex items-center justify-around px-2">
      {navItems.map(item => {
        const Icon = item.icon;
        const isActive = currentView === item.id;

        return (
          <button
            key={item.id}
            onClick={() => navigate(item.id)}
            className={`relative flex flex-col items-center justify-center flex-1 h-[54px] rounded-2xl py-1 transition-colors duration-200 cursor-pointer group ${
              isActive
                ? 'text-[var(--glow-color-1)] font-bold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium'
            }`}
          >
            {isActive && (
              <motion.span
                layoutId="bottomNavActivePill"
                transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                className="absolute inset-x-1.5 inset-y-0.5 rounded-2xl bg-[color-mix(in_srgb,var(--glow-color-1)_14%,transparent)] border border-[color-mix(in_srgb,var(--glow-color-1)_35%,transparent)] shadow-[0_0_16px_-4px_var(--glow-color-2)] pointer-events-none"
              />
            )}
            <Icon
              className={`relative z-10 w-5 h-5 transition-transform duration-200 ${
                isActive
                  ? 'scale-110 drop-shadow-[0_0_8px_var(--glow-color-1)]'
                  : 'group-hover:scale-110'
              }`}
            />
            <span className="relative z-10 text-[11px] mt-1 tracking-tight whitespace-nowrap">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
