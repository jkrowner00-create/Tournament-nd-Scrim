import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Skull, Swords, ArrowLeft, ShieldAlert } from 'lucide-react';

export const NotFoundView: React.FC = () => {
  const { navigate } = useAppContext();

  return (
    <div className="min-w-0 max-w-lg mx-auto px-4 py-20 text-center">
      <div className="relative mb-6">
        <div className="w-24 h-24 mx-auto rounded-3xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 shadow-2xl">
          <Skull size={48} className="animate-pulse" />
        </div>
        <div className="absolute top-0 right-1/4 w-32 h-32 bg-red-600 rounded-full blur-3xl opacity-20 pointer-events-none" />
      </div>

      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-black uppercase tracking-widest mb-3 border border-red-500/30">
        <ShieldAlert size={14} /> Zone Eliminated • Error 404
      </div>

      <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] uppercase tracking-tight mb-2">
        Lost Outside Safe Zone
      </h1>

      <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-md mx-auto mb-8">
        The coordinate or battle arena you are attempting to breach does not exist or has already collapsed into the blue zone.
      </p>

      <button
        onClick={() => navigate('home')}
        className="inline-flex items-center gap-2 min-h-[46px] py-3.5 px-8 rounded-2xl btn-accent font-black text-sm uppercase tracking-wider cursor-pointer"
      >
        <ArrowLeft size={16} /> Return to Home Base
      </button>
    </div>
  );
};

export default NotFoundView;
