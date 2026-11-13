import React, { useState, useEffect, useRef } from 'react';
import type { Game, GameGfxTheme } from '../types';
import {
  GAME_GFX_PRESETS,
  generateGameGfxBannerCanvas,
  downloadDataUrl,
  type GameGfxPreset,
} from '../services/gfxGenerator';
import {
  Download,
  Palette,
  Check,
  X,
  Type,
  Sliders,
  Layers,
  Flame,
  Shield,
  Eye,
  RefreshCw,
} from 'lucide-react';

interface GameGfxModalProps {
  game: Partial<Game>;
  platformName?: string;
  onSave: (gameData: Partial<Game>) => Promise<void>;
  onClose: () => void;
}

export const GameGfxModal: React.FC<GameGfxModalProps> = ({
  game,
  platformName = 'SS BATTLE APP',
  onSave,
  onClose,
}) => {
  const [gameName, setGameName] = useState(game.name || 'Esports Title');
  const [imageUrl, setImageUrl] = useState(game.imageUrl || '');

  // Active GFX Theme state
  const initialTheme: GameGfxTheme = game.gfxTheme || {
    presetId: 'freefire_inferno',
    themeColor: '#FF5722',
    secondaryColor: '#EF4444',
    fontStyle: 'inferno',
    tagline: 'BOOYAH BATTLE ROYALE SURVIVAL',
    bgGradient: 'from-orange-950/60 via-red-950/40 to-black',
    glowColor: 'rgba(255, 87, 34, 0.45)',
    overlayPattern: 'sparks',
    badgeStyle: 'flame',
  };

  const [selectedPresetId, setSelectedPresetId] = useState<string>(
    initialTheme.presetId || 'freefire_inferno'
  );
  const [themeColor, setThemeColor] = useState(initialTheme.themeColor || '#FF5722');
  const [secondaryColor, setSecondaryColor] = useState(initialTheme.secondaryColor || '#EF4444');
  const [fontStyle, setFontStyle] = useState<GameGfxTheme['fontStyle']>(
    initialTheme.fontStyle || 'inferno'
  );
  const [tagline, setTagline] = useState(
    initialTheme.tagline || 'BOOYAH BATTLE ROYALE SURVIVAL'
  );
  const [overlayPattern, setOverlayPattern] = useState<GameGfxTheme['overlayPattern']>(
    initialTheme.overlayPattern || 'sparks'
  );
  const [badgeStyle, setBadgeStyle] = useState<GameGfxTheme['badgeStyle']>(
    initialTheme.badgeStyle || 'flame'
  );

  const [previewDataUrl, setPreviewDataUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [tab, setTab] = useState<'presets' | 'customize'>('presets');

  // Regenerate Canvas Live Preview whenever properties change
  const refreshPreview = () => {
    try {
      setIsGenerating(true);
      const dataUrl = generateGameGfxBannerCanvas({
        gameName,
        themeColor,
        secondaryColor,
        fontStyle,
        tagline,
        overlayPattern,
        badgeStyle,
        platformName,
      });
      setPreviewDataUrl(dataUrl);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    refreshPreview();
  }, [gameName, themeColor, secondaryColor, fontStyle, tagline, overlayPattern, badgeStyle]);

  // Apply a preset
  const handleSelectPreset = (preset: GameGfxPreset) => {
    setSelectedPresetId(preset.id);
    setThemeColor(preset.themeColor);
    setSecondaryColor(preset.secondaryColor);
    setFontStyle(preset.fontStyle);
    setTagline(preset.tagline);
    setOverlayPattern(preset.overlayPattern);
    setBadgeStyle(preset.badgeStyle);
  };

  // Download GFX Banner image
  const handleDownloadBanner = () => {
    if (!previewDataUrl) return;
    const cleanName = gameName.replace(/[^a-zA-Z0-9]/g, '_');
    downloadDataUrl(previewDataUrl, `${cleanName}_GFX_BANNER.png`);
  };

  // Save game with updated GFX theme
  const handleSaveTheme = async (useCanvasAsBanner = false) => {
    setIsSaving(true);
    try {
      const gfxTheme: GameGfxTheme = {
        presetId: selectedPresetId,
        themeColor,
        secondaryColor,
        fontStyle,
        tagline,
        overlayPattern,
        badgeStyle,
        glowColor: `${themeColor}66`,
      };

      const updatedGame: Partial<Game> = {
        ...game,
        name: gameName.trim(),
        imageUrl: useCanvasAsBanner && previewDataUrl ? previewDataUrl : (imageUrl || previewDataUrl || game.imageUrl),
        bannerUrl: previewDataUrl || game.bannerUrl,
        gfxTheme,
      };

      await onSave(updatedGame);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="glass-panel animate-card-enter w-full max-w-4xl rounded-3xl border border-[var(--border-color)] overflow-hidden flex flex-col max-h-[94vh] shadow-2xl bg-[var(--surface-color)]">
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--secondary-bg)]">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-black font-black shadow-lg"
              style={{ backgroundColor: themeColor, boxShadow: `0 0 20px ${themeColor}66` }}
            >
              <Palette size={20} />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2 flex-wrap">
                <span>Esports GFX Creation Studio</span>
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-bold text-black uppercase"
                  style={{ backgroundColor: themeColor }}
                >
                  Live Theme Engine
                </span>
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Design custom GFX artwork & theme for <strong>{gameName}</strong>. Matches, cards & texts adopt this theme!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full btn-theme-outline flex items-center justify-center cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* 1. LIVE INTERACTIVE GFX BANNER PREVIEW */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[var(--text-secondary)] uppercase">
              <span className="flex items-center gap-1.5">
                <Eye size={14} style={{ color: themeColor }} /> Live Generated GFX Artwork Preview (1200×520 High-DPI)
              </span>
              <button
                type="button"
                onClick={refreshPreview}
                className="px-2.5 py-1 rounded-lg btn-theme-outline text-[11px] flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw size={12} className={isGenerating ? 'animate-spin' : ''} /> Refresh Preview
              </button>
            </div>

            <div
              className="relative rounded-2xl overflow-hidden border border-[var(--border-color)] shadow-2xl transition-all"
              style={{ boxShadow: `0 0 35px ${themeColor}33` }}
            >
              {previewDataUrl ? (
                <img
                  src={previewDataUrl}
                  alt="Game GFX Banner"
                  className="w-full h-auto max-h-64 sm:max-h-72 object-cover block"
                />
              ) : (
                <div className="w-full h-56 flex items-center justify-center bg-[var(--bg-main)] text-[var(--text-muted)] text-xs">
                  Rendering GFX Canvas...
                </div>
              )}

              {/* Action overlay strip on preview */}
              <div className="absolute bottom-2 right-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadBanner}
                  className="px-3 py-1.5 rounded-xl btn-theme-outline text-xs font-bold flex items-center gap-1.5 backdrop-blur-md cursor-pointer shadow-md"
                  title="Download High-Resolution PNG"
                >
                  <Download size={13} style={{ color: themeColor }} /> Download PNG
                </button>
              </div>
            </div>
          </div>

          {/* 2. GAME BASIC METADATA INPUTS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)]">
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">
                Esports Game Name *
              </label>
              <input
                type="text"
                value={gameName}
                onChange={e => setGameName(e.target.value)}
                placeholder="e.g. Free Fire Max, BGMI, COD Mobile"
                className="w-full px-3 py-2 rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)] text-xs font-bold text-[var(--text-primary)] focus:outline-none"
                style={{ borderColor: `${themeColor}88` }}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">
                Custom Tagline / Battle Cry *
              </label>
              <input
                type="text"
                value={tagline}
                onChange={e => setTagline(e.target.value)}
                placeholder="e.g. BOOYAH BATTLE ROYALE SURVIVAL"
                className="w-full px-3 py-2 rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)] text-xs font-bold text-[var(--text-primary)] focus:outline-none"
                style={{ borderColor: `${themeColor}88` }}
              />
            </div>
          </div>

          {/* 3. TABS: PRESETS VS CUSTOM FINE-TUNING */}
          <div className="flex items-center gap-2 border-b border-[var(--border-color)] pb-3 flex-wrap">
            <button
              type="button"
              onClick={() => setTab('presets')}
              className={`px-4 py-2 min-h-[38px] rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer flex items-center gap-1.5 ${
                tab === 'presets'
                  ? 'text-black shadow-md'
                  : 'btn-theme-outline'
              }`}
              style={tab === 'presets' ? { backgroundColor: themeColor } : {}}
            >
              <Palette size={14} /> Esports GFX Themes ({GAME_GFX_PRESETS.length})
            </button>

            <button
              type="button"
              onClick={() => setTab('customize')}
              className={`px-4 py-2 min-h-[38px] rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer flex items-center gap-1.5 ${
                tab === 'customize'
                  ? 'text-black shadow-md'
                  : 'btn-theme-outline'
              }`}
              style={tab === 'customize' ? { backgroundColor: themeColor } : {}}
            >
              <Sliders size={14} /> Custom Palette & Typography
            </button>
          </div>

          {/* TAB 1: CURATED GFX PRESETS */}
          {tab === 'presets' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {GAME_GFX_PRESETS.map(preset => {
                const isSelected = selectedPresetId === preset.id;
                return (
                  <div
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative group flex flex-col justify-between ${
                      isSelected
                        ? 'border-2 shadow-lg bg-[var(--card-bg)]'
                        : 'bg-[var(--bg-main)] border-[var(--border-color)] hover:border-[var(--glow-color-1)]'
                    }`}
                    style={isSelected ? { borderColor: preset.themeColor, boxShadow: `0 0 20px ${preset.themeColor}44` } : {}}
                  >
                    <div>
                      {/* Top icon and theme badge */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xl">{preset.badgeIcon}</span>
                        <div className="flex items-center gap-1">
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/50"
                            style={{ backgroundColor: preset.themeColor }}
                            title="Primary Theme Color"
                          />
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/50"
                            style={{ backgroundColor: preset.secondaryColor }}
                            title="Secondary Accent"
                          />
                        </div>
                      </div>

                      <div className="font-black text-xs text-[var(--text-primary)] uppercase tracking-wide">
                        {preset.name}
                      </div>
                      <p className="text-[10px] text-[var(--text-muted)] line-clamp-2 mt-1">
                        {preset.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-[var(--border-color)]/40 flex items-center justify-between">
                      <span className="text-[9px] font-mono text-[var(--text-muted)] uppercase">
                        {preset.fontStyle} • {preset.overlayPattern}
                      </span>
                      {isSelected && (
                        <div
                          className="w-4 h-4 rounded-full flex items-center justify-center text-black"
                          style={{ backgroundColor: preset.themeColor }}
                        >
                          <Check size={10} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: CUSTOM COLOR & FONT FINE-TUNING */}
          {tab === 'customize' && (
            <div className="space-y-4 p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Theme Primary Color */}
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">
                    Primary Theme Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={themeColor}
                      onChange={e => {
                        setThemeColor(e.target.value);
                        setSelectedPresetId('custom');
                      }}
                      className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={themeColor}
                      onChange={e => {
                        setThemeColor(e.target.value);
                        setSelectedPresetId('custom');
                      }}
                      className="flex-1 px-3 py-2 rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)] text-xs font-mono font-bold text-[var(--text-primary)] uppercase"
                    />
                  </div>
                </div>

                {/* Secondary Accent */}
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">
                    Secondary Accent Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={e => {
                        setSecondaryColor(e.target.value);
                        setSelectedPresetId('custom');
                      }}
                      className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={secondaryColor}
                      onChange={e => {
                        setSecondaryColor(e.target.value);
                        setSelectedPresetId('custom');
                      }}
                      className="flex-1 px-3 py-2 rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)] text-xs font-mono font-bold text-[var(--text-primary)] uppercase"
                    />
                  </div>
                </div>

                {/* Font Style */}
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">
                    Typography & Title Style
                  </label>
                  <select
                    value={fontStyle}
                    onChange={e => {
                      setFontStyle(e.target.value as any);
                      setSelectedPresetId('custom');
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)] text-xs font-bold text-[var(--text-primary)]"
                  >
                    <option value="inferno">Inferno Slant (Aggressive Heat / Impact)</option>
                    <option value="military">Military Stencil (Tactical Hazard / Warzone)</option>
                    <option value="cyber">Cyberpunk Mono (High-Tech Monospace)</option>
                    <option value="royal">Royal Luxury (Grand Masters Serif)</option>
                    <option value="glacier">Glacier Tech (Sub-Zero Clean)</option>
                    <option value="crimson">Samurai Crimson (Hardcore Elimination)</option>
                    <option value="standard">Standard Esports Bold</option>
                  </select>
                </div>

                {/* Overlay Texture Pattern */}
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">
                    Background Mesh & Texture
                  </label>
                  <select
                    value={overlayPattern}
                    onChange={e => {
                      setOverlayPattern(e.target.value as any);
                      setSelectedPresetId('custom');
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)] text-xs font-bold text-[var(--text-primary)]"
                  >
                    <option value="sparks">Glowing Embers & Sparks</option>
                    <option value="hazard">Tactical Hazard Stripes</option>
                    <option value="grid">Cyber Laser Wireframe Grid</option>
                    <option value="hexagons">Honeycomb Carbon Mesh</option>
                    <option value="lines">High-Velocity Speed Lines</option>
                    <option value="none">Smooth Atmospheric Glow (No Mesh)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 border-t border-[var(--border-color)] flex flex-col sm:flex-row items-center justify-between gap-3 bg-[var(--secondary-bg)]">
          <div className="text-xs text-[var(--text-muted)] flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: themeColor }}
            />
            <span>
              Theme: <strong className="text-[var(--text-primary)] capitalize">{selectedPresetId.replace('_', ' ')}</strong> ({themeColor})
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleDownloadBanner}
              className="px-3.5 py-2.5 min-h-[40px] rounded-xl btn-theme-outline text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Download size={14} /> Download Banner PNG
            </button>

            <button
              type="button"
              onClick={() => handleSaveTheme(true)}
              disabled={isSaving}
              className="flex-1 sm:flex-none px-5 py-2.5 min-h-[40px] rounded-xl font-black text-xs uppercase tracking-wider text-black flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
              style={{
                backgroundColor: themeColor,
                boxShadow: `0 0 20px ${themeColor}66`,
              }}
            >
              {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} strokeWidth={3} />}
              {isSaving ? 'Applying GFX Theme...' : 'Save & Apply Game GFX Theme'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
