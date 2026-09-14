import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Palette, Image as ImageIcon, Check, Sparkles, Sliders, RotateCcw, User, Heart, Upload, Link } from "lucide-react";
import { VibeTheme, WallpaperId, AvatarId } from "../types";
import { ThemeConfig, VIBE_THEMES } from "../utils/theme";
import { WALLPAPER_PRESETS, WallpaperItem } from "../utils/wallpapers";
import { AVATAR_OPTIONS } from "../utils/avatars";

interface ThemeWallpaperModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ThemeConfig;
  currentVibe: VibeTheme;
  currentWallpaper: WallpaperId;
  dimLevel: number;
  currentAvatarId: AvatarId;
  customAvatarUrl: string;
  onSelectVibe: (vibe: VibeTheme) => void;
  onSelectWallpaper: (wallpaper: WallpaperId) => void;
  onDimLevelChange: (level: number) => void;
  onSelectAvatar: (avatarId: AvatarId) => void;
  onSetCustomAvatarUrl: (url: string) => void;
  onResetDefaults: () => void;
}

export const ThemeWallpaperModal: React.FC<ThemeWallpaperModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  currentVibe,
  currentWallpaper,
  dimLevel,
  currentAvatarId,
  customAvatarUrl,
  onSelectVibe,
  onSelectWallpaper,
  onDimLevelChange,
  onSelectAvatar,
  onSetCustomAvatarUrl,
  onResetDefaults,
}) => {
  const [activeTab, setActiveTab] = useState<"themes" | "wallpapers" | "avatars">("themes");
  const [wallpaperFilter, setWallpaperFilter] = useState<string>("all");
  const [customInputUrl, setCustomInputUrl] = useState(customAvatarUrl);

  if (!isOpen) return null;

  const wallpaperList = Object.values(WALLPAPER_PRESETS) as WallpaperItem[];
  const filteredWallpapers =
    wallpaperFilter === "all"
      ? wallpaperList
      : wallpaperList.filter((w) => w.category.toLowerCase() === wallpaperFilter);

  return (
    <AnimatePresence>
      <div
        id="theme-wallpaper-modal-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          id="theme-wallpaper-modal-content"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative w-full max-w-xl max-h-[90vh] flex flex-col rounded-3xl bg-neutral-900/95 border border-neutral-800 shadow-2xl overflow-hidden backdrop-blur-2xl"
          style={{
            boxShadow: `0 25px 50px -12px rgba(0,0,0,0.8), 0 0 30px ${currentTheme.glowColor}`,
          }}
        >
          {/* Top Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800/80 bg-neutral-950/40">
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${currentTheme.primaryHex}, ${currentTheme.secondaryHex})`,
                }}
              >
                <Palette className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <span>Themes & Wallpapers</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/15 border border-pink-500/30 text-pink-300 font-medium">
                    Aesthetics
                  </span>
                </h2>
                <p className="text-[11px] text-neutral-400">
                  Personalize Mahi&apos;s holographic look, colors, and background scene
                </p>
              </div>
            </div>

            <button
              id="close-theme-wallpaper-modal"
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-neutral-800/60 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center justify-between px-5 py-2.5 border-b border-neutral-800/60 bg-neutral-950/20">
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-neutral-950/80 border border-neutral-800 text-xs font-semibold">
              <button
                id="tab-btn-themes"
                onClick={() => setActiveTab("themes")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === "themes"
                    ? "bg-gradient-to-r from-pink-500/20 to-rose-500/20 text-white border border-pink-500/40 shadow-sm"
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                <Palette className="w-3.5 h-3.5" style={{ color: currentTheme.primaryHex }} />
                <span>Color Themes ({Object.keys(VIBE_THEMES).length})</span>
              </button>

              <button
                id="tab-btn-wallpapers"
                onClick={() => setActiveTab("wallpapers")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === "wallpapers"
                    ? "bg-gradient-to-r from-pink-500/20 to-rose-500/20 text-white border border-pink-500/40 shadow-sm"
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                <span>Wallpapers ({wallpaperList.length})</span>
              </button>

              <button
                id="tab-btn-avatars"
                onClick={() => setActiveTab("avatars")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === "avatars"
                    ? "bg-gradient-to-r from-pink-500/20 to-rose-500/20 text-white border border-pink-500/40 shadow-sm"
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                <User className="w-3.5 h-3.5 text-pink-400" />
                <span>Voice Picture</span>
              </button>
            </div>

            <button
              onClick={onResetDefaults}
              className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-neutral-200 px-2 py-1 rounded-lg hover:bg-neutral-800/60 transition-colors"
              title="Reset theme and wallpaper to default"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">Reset Default</span>
            </button>
          </div>

          {/* Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 max-h-[60vh] custom-scrollbar">
            {/* TAB 1: THEMES */}
            {activeTab === "themes" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px] text-neutral-400 px-1">
                  <span>Select an accent color & holographic energy vibe:</span>
                  <span className="font-semibold text-white">Active: {currentTheme.label}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(Object.keys(VIBE_THEMES) as VibeTheme[]).map((vibeKey) => {
                    const t = VIBE_THEMES[vibeKey];
                    const isActive = currentVibe === vibeKey;

                    return (
                      <button
                        key={vibeKey}
                        id={`theme-option-${vibeKey}`}
                        onClick={() => onSelectVibe(vibeKey)}
                        className={`flex items-center justify-between p-3 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                          isActive
                            ? "bg-white/10 border-white/40 shadow-lg text-white ring-1 ring-white/30"
                            : "bg-neutral-900/60 border-neutral-800/80 hover:border-neutral-700 hover:bg-neutral-800/40 text-neutral-300"
                        }`}
                        style={{
                          boxShadow: isActive ? `0 4px 20px ${t.glowColor}` : undefined,
                        }}
                      >
                        <div className="flex items-center gap-3">
                          {/* Multi-dot Color Preview */}
                          <div className="relative w-8 h-8 rounded-xl flex items-center justify-center p-0.5 border border-white/10 shrink-0 overflow-hidden shadow-md">
                            <div
                              className="w-full h-full rounded-[10px]"
                              style={{
                                background: `linear-gradient(135deg, ${t.primaryHex}, ${t.secondaryHex})`,
                              }}
                            />
                            {isActive && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[1px]">
                                <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                              </div>
                            )}
                          </div>

                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs sm:text-sm font-bold text-white">
                                {t.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: t.primaryHex }}
                              />
                              <span className="text-[10px] text-neutral-400 capitalize">
                                {t.name.replace("-", " ")}
                              </span>
                            </div>
                          </div>
                        </div>

                        {isActive ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">
                            Selected
                          </span>
                        ) : (
                          <span className="text-[10px] text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            Apply
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: WALLPAPERS */}
            {activeTab === "wallpapers" && (
              <div className="space-y-4">
                {/* Category filter pills */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1">
                    {["all", "romance", "cyber", "cosmic", "minimal"].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setWallpaperFilter(cat)}
                        className={`text-[11px] px-2.5 py-1 rounded-full capitalize font-medium transition-all ${
                          wallpaperFilter === cat
                            ? "bg-pink-500/20 text-pink-300 border border-pink-500/40"
                            : "bg-neutral-800/60 text-neutral-400 hover:text-neutral-200 border border-transparent"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  <span className="text-[11px] text-neutral-400">
                    Active: <strong className="text-white">{WALLPAPER_PRESETS[currentWallpaper]?.name}</strong>
                  </span>
                </div>

                {/* Wallpapers Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredWallpapers.map((wp) => {
                    const isSelected = currentWallpaper === wp.id;

                    return (
                      <button
                        key={wp.id}
                        id={`wallpaper-option-${wp.id}`}
                        onClick={() => onSelectWallpaper(wp.id)}
                        className={`relative flex flex-col p-3 rounded-2xl border text-left transition-all overflow-hidden group ${
                          isSelected
                            ? "border-pink-500/60 bg-neutral-800/80 ring-2 ring-pink-500/30 shadow-xl"
                            : "border-neutral-800 bg-neutral-900/50 hover:border-neutral-700 hover:bg-neutral-800/30"
                        }`}
                      >
                        {/* Wallpaper Graphic Thumbnail */}
                        <div
                          className="w-full h-24 rounded-xl relative overflow-hidden border border-white/10 mb-2.5 transition-transform group-hover:scale-[1.01]"
                          style={{
                            background: wp.backgroundCss,
                          }}
                        >
                          {/* Inner preview elements */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                          <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[9px] font-bold tracking-wider uppercase text-neutral-300 border border-white/10">
                            {wp.category}
                          </div>

                          {isSelected && (
                            <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-pink-500 text-white text-[10px] font-bold flex items-center gap-1 shadow-lg shadow-pink-500/50">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                              <span>Active</span>
                            </div>
                          )}

                          <div className="absolute bottom-2 left-2.5 right-2.5">
                            <span className="text-xs font-bold text-white block drop-shadow-md">
                              {wp.name}
                            </span>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
                          {wp.description}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {/* Brightness / Dim Level Slider */}
                <div className="p-3.5 rounded-2xl bg-neutral-950/60 border border-neutral-800 space-y-2 mt-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-neutral-300 font-semibold">
                      <Sliders className="w-3.5 h-3.5 text-pink-400" />
                      <span>Wallpaper Dim Level (Focus Mode)</span>
                    </span>
                    <span className="text-neutral-400 font-mono text-[11px]">{dimLevel}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="75"
                    step="5"
                    value={dimLevel}
                    onChange={(e) => onDimLevelChange(Number(e.target.value))}
                    className="w-full accent-pink-500 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-neutral-500">
                    <span>Vibrant & Bright (5%)</span>
                    <span>Standard (25%)</span>
                    <span>Deep Stealth Focus (75%)</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: VOICE PICTURE / AVATAR */}
            {activeTab === "avatars" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-pink-400" />
                      <span>Mahi Voice Girlfriend Picture</span>
                    </h3>
                    <p className="text-[11px] text-neutral-400">
                      Apni pasand ka portrait photo select karein jo call, visualizer aur lock screen par dikhai dega
                    </p>
                  </div>
                </div>

                {/* Preset Avatars Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.values(AVATAR_OPTIONS).map((opt) => {
                    const active = currentAvatarId === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => onSelectAvatar(opt.id)}
                        className={`group relative flex flex-col p-2.5 rounded-2xl border text-left transition-all duration-200 overflow-hidden ${
                          active
                            ? "bg-neutral-800/90 border-pink-500/80 shadow-lg shadow-pink-500/20"
                            : "bg-neutral-950/60 border-neutral-800/80 hover:border-neutral-700 hover:bg-neutral-900/60"
                        }`}
                      >
                        {/* Image Preview */}
                        <div className="relative w-full h-44 rounded-xl overflow-hidden bg-neutral-900 mb-2.5">
                          <img
                            src={opt.imageUrl}
                            alt={opt.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-pink-300 border border-pink-500/30">
                              {opt.style}
                            </span>
                            {active && (
                              <span className="w-5 h-5 rounded-full bg-pink-500 flex items-center justify-center text-white shadow-md">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Title & Tagline */}
                        <div className="px-1">
                          <h4 className="text-xs font-bold text-white group-hover:text-pink-300 transition-colors">
                            {opt.name}
                          </h4>
                          <p className="text-[11px] text-neutral-400 mt-0.5 leading-snug">
                            {opt.tagline}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Photo URL Option */}
                <div className="p-3.5 rounded-2xl bg-neutral-950/70 border border-neutral-800 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <Link className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-xs font-semibold text-white">Custom Picture URL</span>
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    Aap apna pasandida picture ka direct image link paste karke bhi Mahi ka photo set kar sakte hain:
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      placeholder="https://example.com/photo.jpg"
                      value={customInputUrl}
                      onChange={(e) => setCustomInputUrl(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-pink-500"
                    />
                    <button
                      onClick={() => {
                        if (customInputUrl.trim()) {
                          onSetCustomAvatarUrl(customInputUrl.trim());
                          onSelectAvatar("custom");
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-pink-500 hover:bg-pink-600 text-white transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="px-5 py-3 border-t border-neutral-800/80 bg-neutral-950/60 flex items-center justify-between text-[11px] text-neutral-400">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              <span>Theme and wallpaper selections are automatically saved</span>
            </span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold transition-colors"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
