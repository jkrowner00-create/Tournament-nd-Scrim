import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';

export const SplashScreen: React.FC<{ onDismiss: () => void }> = ({ onDismiss }) => {
  const { settings, activeTheme } = useApp();
  const [isFading, setIsFading] = useState(false);

  const appName = settings?.appName?.trim() || 'Gaming Tournament';
  const logoUrl = settings?.logoUrl || 'https://i.ibb.co/LTd1KXk/IMG-20260904-WA0056-1.jpg';

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFading(true);
      setTimeout(onDismiss, 600);
    }, 2000);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      onClick={onDismiss}
      data-theme={activeTheme}
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center transition-opacity duration-600 cursor-pointer select-none ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        backgroundColor: 'var(--primary-bg, #000000)',
        backgroundImage: `radial-gradient(circle at 50% 40%, var(--glow-color-2, rgba(255, 215, 0, 0.25)) 0%, transparent 65%)`,
        color: 'var(--text-primary, #ffffff)',
      }}
    >
      <div className="flex flex-col items-center text-center p-6">
        {/* Pulsating Logo Container - Uncropped Whole Logo following active theme */}
        <div className="relative w-28 h-28 mb-5 flex items-center justify-center">
          <div
            className="absolute inset-0 rounded-full border-2 border-transparent animate-spin-ring"
            style={{
              borderTopColor: 'var(--glow-color-1, #FFD700)',
              borderRightColor: 'var(--warning-color, #FBBF24)',
              boxShadow: '0 0 25px var(--glow-color-2, rgba(255, 215, 0, 0.35))',
            }}
          />
          <div
            className="w-20 h-20 rounded-full p-1 flex items-center justify-center shadow-lg animate-pulse-glow overflow-hidden"
            style={{
              backgroundColor: 'var(--card-bg, #141414)',
              border: '2px solid var(--border-color, #996515)',
              boxShadow: '0 0 25px var(--glow-color-2, rgba(255, 215, 0, 0.4))',
            }}
          >
            <img
              src={logoUrl}
              alt={appName}
              className="w-full h-full object-contain rounded-full"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = 'https://i.ibb.co/LTd1KXk/IMG-20260904-WA0056-1.jpg';
              }}
            />
          </div>
        </div>

        {/* High-Contrast Visible App Title styled according to active theme */}
        <h1
          className="text-2xl sm:text-4xl font-extrabold tracking-wider uppercase max-w-md px-4 leading-tight"
          style={{
            background: 'var(--accent-gradient, linear-gradient(135deg, #FFFFFF 0%, #FFD700 50%, #F59E0B 100%))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            color: 'var(--glow-color-1, #FFD700)',
            textShadow: '0 0 25px var(--glow-color-2, rgba(255,215,0,0.5))',
          }}
        >
          {appName}
        </h1>

        <p
          className="text-[11px] font-bold tracking-[3px] uppercase mt-2 mb-6"
          style={{ color: 'var(--text-secondary, #BDBDBD)' }}
        >
          ULTIMATE ESPORTS & SCRIM ARENA
        </p>

        {/* Shimmer progress bar matching active theme gradient */}
        <div
          className="w-40 h-1.5 rounded-full overflow-hidden relative"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
        >
          <div
            className="w-full h-full rounded-full animate-shimmer"
            style={{
              background: 'var(--accent-gradient, linear-gradient(90deg, #FBBF24, #FFD700, #FFFFFF))',
            }}
          />
        </div>

        <div
          className="text-[10px] mt-4 uppercase tracking-wider font-semibold"
          style={{ color: 'var(--text-secondary, #888888)' }}
        >
          Tap anywhere to skip
        </div>
      </div>

      <div
        className="absolute bottom-6 text-[10px] tracking-widest font-semibold uppercase"
        style={{ color: 'var(--text-secondary, #666666)' }}
      >
        SECURED ESPORTS PLATFORM
      </div>
    </div>
  );
};

export default SplashScreen;
