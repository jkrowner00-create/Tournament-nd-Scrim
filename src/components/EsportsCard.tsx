import React from 'react';
import type { TournamentResult } from '../types';
import { useApp } from '../context/AppContext';
import { Trophy, Share2, Copy } from 'lucide-react';

interface EsportsCardProps {
  title: string;
  results: TournamentResult[];
  onBack?: () => void;
}

export const EsportsCard: React.FC<EsportsCardProps> = ({ title, results, onBack }) => {
  const { settings, showToast } = useApp();

  const handleCopyStandings = () => {
    let text = `🏆 ${title.toUpperCase()} - FINAL STANDINGS 🏆\n\n`;
    results.forEach((r, idx) => {
      const pos = r.position === 1 ? '🥇 #1 (CHAMPION)' : r.position === 2 ? '🥈 #2' : r.position === 3 ? '🥉 #3' : `#${r.position || idx + 1}`;
      text += `${pos} - ${r.name} | Kills: ${r.kills} | Prize: ₹${r.winnings}\n`;
    });
    text += `\nHosted on ${settings.appName || 'Gaming Tournament'}`;

    navigator.clipboard.writeText(text);
    showToast('Standings copied to clipboard for WhatsApp/Discord!', 'success');
  };

  return (
    <div className="w-full max-w-2xl mx-auto my-4">
      {onBack && (
        <button
          onClick={onBack}
          className="mb-3 px-4 min-h-[38px] text-xs font-bold rounded-xl btn-theme-outline flex items-center gap-1.5 cursor-pointer"
        >
          ← Back to Tournaments
        </button>
      )}

      {/* Broadcast Graphics Frame - Dynamic Theme Styled */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-[var(--border-color)] shadow-[0_10px_40px_rgba(0,0,0,0.85)] bg-[var(--card-bg)] transition-colors">
        {/* Background Overlay */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--primary-bg)]/85 via-[var(--card-bg)]/90 to-[var(--primary-bg)] pointer-events-none" />

        <div className="relative z-10 p-4 sm:p-6">
          {/* Header Title */}
          <div className="text-center mb-5">
            <span className="text-[10px] font-extrabold tracking-[3px] text-[var(--warning-color)] uppercase block mb-1">
              {settings.appName || 'GAMING ARENA'} OFFICIAL RESULTS
            </span>
            <h2 className="text-2xl sm:text-3xl font-black italic tracking-wider text-[var(--text-primary)] uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] font-['Rajdhani']">
              {title}
            </h2>
          </div>

          {/* Standings Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-y-1.5">
              <thead>
                <tr>
                  <th
                    style={{ background: 'var(--accent-gradient)', color: '#000000' }}
                    className="text-center text-xs font-black py-2 px-2 uppercase rounded-l shadow-sm"
                  >
                    #
                  </th>
                  <th
                    style={{ background: 'var(--accent-gradient)', color: '#000000' }}
                    className="text-left text-xs font-black py-2 px-3 uppercase shadow-sm"
                  >
                    PLAYER / SQUAD NAME
                  </th>
                  <th
                    style={{ background: 'var(--accent-gradient)', color: '#000000' }}
                    className="text-center text-xs font-black py-2 px-2 uppercase w-16 shadow-sm"
                  >
                    KILLS
                  </th>
                  <th
                    style={{ background: 'var(--accent-gradient)', color: '#000000' }}
                    className="text-center text-xs font-black py-2 px-3 uppercase w-24 rounded-r shadow-sm"
                  >
                    PRIZE
                  </th>
                </tr>
              </thead>
              <tbody>
                {results.length > 0 ? (
                  results.map((r, index) => {
                    const isChampion = r.position === 1 || index === 0;
                    const posDisplay = isChampion ? 'T-1' : r.position < 10 ? `0${r.position}` : r.position;

                    return (
                      <tr
                        key={r.uid || index}
                        className={`transition-transform hover:scale-[1.01] ${
                          isChampion
                            ? 'font-black drop-shadow-[0_0_12px_var(--glow-color-2)]'
                            : 'font-bold'
                        }`}
                      >
                        {/* Rank Cell */}
                        <td
                          style={isChampion ? { background: 'var(--accent-gradient)', color: '#000000' } : undefined}
                          className={`text-center py-2 px-2 text-sm italic rounded-l ${
                            isChampion
                              ? 'font-black shadow-md'
                              : 'bg-[var(--secondary-bg)] border-y border-l border-[var(--border-color)] text-[var(--text-primary)]'
                          }`}
                        >
                          {posDisplay}
                        </td>

                        {/* Name Cell */}
                        <td
                          style={isChampion ? { background: 'var(--accent-gradient)', color: '#000000' } : undefined}
                          className={`py-2 px-3 text-sm italic uppercase truncate max-w-[200px] ${
                            isChampion
                              ? 'font-black'
                              : 'bg-[var(--secondary-bg)] border-y border-[var(--border-color)] text-[var(--text-primary)]'
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            {isChampion && <Trophy size={14} className="inline text-black fill-black" />}
                            <span>{r.name}</span>
                          </span>
                          {r.gameName && r.gameName !== r.name && (
                            <span className="text-[10px] block opacity-80 font-normal">
                              IGN: {r.gameName}
                            </span>
                          )}
                        </td>

                        {/* Kills Cell */}
                        <td
                          style={isChampion ? { background: 'var(--accent-gradient)', color: '#000000' } : undefined}
                          className={`text-center py-2 px-2 text-sm tabular-nums ${
                            isChampion
                              ? 'font-black'
                              : 'bg-[var(--secondary-bg)] border-y border-[var(--border-color)] text-[var(--text-secondary)]'
                          }`}
                        >
                          {r.kills || 0}
                        </td>

                        {/* Prize Cell */}
                        <td
                          style={isChampion ? { background: 'var(--accent-gradient)', color: '#000000' } : undefined}
                          className={`text-center py-2 px-3 text-sm tabular-nums rounded-r ${
                            isChampion
                              ? 'font-black shadow-sm'
                              : 'bg-[var(--secondary-bg)] border-y border-r border-[var(--border-color)] text-[var(--warning-color)] font-extrabold'
                          }`}
                        >
                          {r.winnings > 0 ? `₹${r.winnings.toLocaleString()}` : '-'}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center py-6 text-[var(--text-secondary)] text-sm">
                      Results have not been officially posted yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Bar */}
          <div className="mt-5 pt-3 border-t border-[var(--border-color)] flex flex-col sm:flex-row items-center justify-between text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider gap-2">
            <div>
              BY <span className="text-[var(--warning-color)] font-extrabold">{settings.appName || 'GAMING TOURNAMENT'}</span>
            </div>
            <div className="text-[var(--warning-color)] text-xs font-black font-['Rajdhani']">
              ESPORTS • OVERALL STANDINGS
            </div>
            <button
              onClick={handleCopyStandings}
              className="flex items-center gap-1.5 px-4 min-h-[38px] rounded-xl btn-accent text-xs font-extrabold cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Standings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
