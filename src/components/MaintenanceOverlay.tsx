import React from 'react';
import { useApp } from '../context/AppContext';
import { Wrench, Shield } from 'lucide-react';

export const MaintenanceOverlay: React.FC = () => {
  const { settings, isAdmin, navigate } = useApp();

  if (!settings.maintenanceMode) return null;

  return (
    <div className="fixed inset-0 z-[99998] bg-black/95 flex flex-col items-center justify-center p-4 text-center backdrop-blur-lg animate-fade-in">
      <div className="glass-panel animate-card-enter p-6 sm:p-8 rounded-2xl max-w-md w-full border border-[var(--border-color)] space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-[color-mix(in_srgb,var(--warning-color)_12%,var(--card-bg))] border border-[var(--warning-color)] flex items-center justify-center text-[var(--warning-color)]">
          <Wrench className="w-8 h-8 animate-spin-ring" />
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] uppercase tracking-wider">
          Under Scheduled Maintenance
        </h2>

        <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
          {settings.maintenanceNotice ||
            'We are currently performing scheduled system updates. The tournament lobby will be back online shortly!'}
        </p>

        <div className="pt-3 flex flex-col sm:flex-row gap-2.5 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2.5 min-h-[40px] rounded-xl btn-accent text-xs font-black uppercase tracking-wider cursor-pointer"
          >
            Check Again / Refresh
          </button>

          {isAdmin && (
            <button
              onClick={() => navigate('admin')}
              className="px-4 py-2.5 min-h-[40px] rounded-xl btn-theme-danger font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Panel Bypass</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
