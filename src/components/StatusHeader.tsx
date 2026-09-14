import React, { useState } from "react";
import {
  Palette,
  Radio,
  Info,
  X,
  ExternalLink,
  Heart,
  Mic,
  SlidersHorizontal,
  Smartphone,
  Wifi,
  WifiOff,
  Zap,
  Brain,
} from "lucide-react";
import { AssistantState, VibeTheme, GirlVoice, WallpaperId, ConnectivityMode, ActiveEngineMode } from "../types";
import { ThemeConfig } from "../utils/theme";

interface StatusHeaderProps {
  state: AssistantState;
  theme: ThemeConfig;
  currentVibe: VibeTheme;
  currentWallpaper?: WallpaperId;
  selectedVoice: GirlVoice;
  isMuted?: boolean;
  connectivityMode?: ConnectivityMode;
  activeEngine?: ActiveEngineMode;
  onSelectVibe: (vibe: VibeTheme) => void;
  onSelectVoice: (voice: GirlVoice) => void;
  onSelectConnectivityMode?: (mode: ConnectivityMode) => void;
  onToggleMute?: () => void;
  onOpenMicSettings?: () => void;
  onOpenThemeWallpaperModal?: () => void;
  onOpenLockScreenModal?: () => void;
  onOpenMemoryVault?: () => void;
}

export const StatusHeader: React.FC<StatusHeaderProps> = ({
  state,
  theme,
  currentVibe,
  currentWallpaper,
  selectedVoice,
  connectivityMode = "auto",
  activeEngine = "online",
  onSelectVibe,
  onSelectVoice,
  onSelectConnectivityMode,
  onOpenMicSettings,
  onOpenThemeWallpaperModal,
  onOpenLockScreenModal,
  onOpenMemoryVault,
}) => {
  const [showVibeMenu, setShowVibeMenu] = useState(false);
  const [showVoiceMenu, setShowVoiceMenu] = useState(false);
  const [showModeMenu, setShowModeMenu] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  const isConnected = state === "listening" || state === "speaking";

  return (
    <header id="status-header" className="relative z-40 w-full px-4 sm:px-6 py-3.5 flex items-center justify-between border-b border-white/5 backdrop-blur-md bg-neutral-950/60">
      {/* Brand & Girlfriend Identity */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm tracking-widest text-white shadow-lg font-['Space_Grotesk']"
          style={{
            background: `linear-gradient(135deg, ${theme.primaryHex}, ${theme.secondaryHex})`,
          }}
        >
          <Heart className="w-4 h-4 fill-white text-white" />
        </div>
        <div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <h1 className="text-base font-bold text-white tracking-wide font-['Space_Grotesk']">
              MAHI
            </h1>
            <span className="text-[10px] text-pink-400 font-medium hidden xs:inline">
              (Your Girlfriend)
            </span>
            <span
              className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border transition-all ${
                isConnected
                  ? activeEngine === "offline"
                    ? "bg-amber-500/10 border-amber-500/40 text-amber-400"
                    : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : state === "connecting"
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                  : "bg-neutral-800 border-neutral-700 text-neutral-400"
              }`}
            >
              {isConnected
                ? activeEngine === "offline"
                  ? "OFFLINE AI"
                  : "ONLINE LIVE"
                : state === "connecting"
                ? "SYNC"
                : "STANDBY"}
            </span>
          </div>
          <p className="text-[11px] text-neutral-400 font-medium">
            Voice: {selectedVoice === "Kore" ? "Kore (Melodic Song Match)" : "Aoede (Sassy & Sweet)"}
          </p>
        </div>
      </div>

      {/* Right Controls: Online/Offline Mode, Voice Picker, Vibe, Audio, LockScreen, Info */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Online / Offline Mode Dropdown */}
        {onSelectConnectivityMode && (
          <div className="relative">
            <button
              id="connectivity-mode-btn"
              onClick={() => {
                setShowModeMenu(!showModeMenu);
                setShowVoiceMenu(false);
                setShowVibeMenu(false);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-xs transition-colors ${
                activeEngine === "offline"
                  ? "bg-amber-500/10 border-amber-500/40 text-amber-300 hover:border-amber-400"
                  : "bg-neutral-900/80 border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700"
              }`}
              title="Switch Online / Offline Mode"
            >
              {activeEngine === "offline" ? (
                <WifiOff className="w-3 h-3 text-amber-400" />
              ) : (
                <Wifi className="w-3 h-3 text-emerald-400" />
              )}
              <span className="text-[11px] font-semibold">
                {connectivityMode === "offline"
                  ? "Offline"
                  : connectivityMode === "online"
                  ? "Online"
                  : activeEngine === "offline"
                  ? "Auto (Offline)"
                  : "Auto (Online)"}
              </span>
            </button>

            {showModeMenu && (
              <div
                id="connectivity-menu-dropdown"
                className="absolute right-0 mt-2 w-64 rounded-2xl bg-neutral-900/95 border border-neutral-800 p-2 shadow-2xl backdrop-blur-xl z-50 flex flex-col gap-1.5"
              >
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Connection Mode
                </div>

                <button
                  onClick={() => {
                    onSelectConnectivityMode("auto");
                    setShowModeMenu(false);
                  }}
                  className={`flex flex-col px-3 py-2 rounded-xl text-left transition-all ${
                    connectivityMode === "auto"
                      ? "bg-pink-500/20 text-white font-semibold border border-pink-500/40"
                      : "text-neutral-400 hover:text-white hover:bg-neutral-800/60"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white font-bold flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-pink-400" />
                      Auto Hybrid (Recommended)
                    </span>
                    {connectivityMode === "auto" && <span className="text-pink-400">✓</span>}
                  </div>
                  <span className="text-[10px] text-neutral-400 mt-0.5">
                    Online with Gemini Live, auto-switches to Offline AI if net drops
                  </span>
                </button>

                <button
                  onClick={() => {
                    onSelectConnectivityMode("offline");
                    setShowModeMenu(false);
                  }}
                  className={`flex flex-col px-3 py-2 rounded-xl text-left transition-all ${
                    connectivityMode === "offline"
                      ? "bg-amber-500/20 text-white font-semibold border border-amber-500/40"
                      : "text-neutral-400 hover:text-white hover:bg-neutral-800/60"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white font-bold flex items-center gap-1.5">
                      <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                      Offline Mode (Bina Internet)
                    </span>
                    {connectivityMode === "offline" && <span className="text-amber-400">✓</span>}
                  </div>
                  <span className="text-[10px] text-neutral-400 mt-0.5">
                    100% on-device AI voice & speech without internet or mobile data
                  </span>
                </button>

                <button
                  onClick={() => {
                    onSelectConnectivityMode("online");
                    setShowModeMenu(false);
                  }}
                  className={`flex flex-col px-3 py-2 rounded-xl text-left transition-all ${
                    connectivityMode === "online"
                      ? "bg-emerald-500/20 text-white font-semibold border border-emerald-500/40"
                      : "text-neutral-400 hover:text-white hover:bg-neutral-800/60"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white font-bold flex items-center gap-1.5">
                      <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                      Online Only
                    </span>
                    {connectivityMode === "online" && <span className="text-emerald-400">✓</span>}
                  </div>
                  <span className="text-[10px] text-neutral-400 mt-0.5">
                    Full Gemini 2.5 Live stream with zero local fallback
                  </span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Real Girl Voice Selector */}
        <div className="relative">
          <button
            id="voice-picker-btn"
            onClick={() => {
              setShowVoiceMenu(!showVoiceMenu);
              setShowModeMenu(false);
              setShowVibeMenu(false);
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-neutral-900/80 border border-neutral-800 text-xs text-neutral-300 hover:text-white hover:border-neutral-700 transition-colors"
            title="Choose Girl Voice"
          >
            <Radio className="w-3 h-3 text-pink-400" />
            <span className="text-[11px] font-semibold">
              {selectedVoice === "Kore" ? "Kore ♀ (Song Match)" : "Aoede ♀"}
            </span>
          </button>

          {showVoiceMenu && (
            <div
              id="voice-menu-dropdown"
              className="absolute right-0 mt-2 w-56 rounded-2xl bg-neutral-900/95 border border-neutral-800 p-2 shadow-2xl backdrop-blur-xl z-50 flex flex-col gap-1"
            >
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Choose Girl Voice
              </div>
              <button
                onClick={() => {
                  onSelectVoice("Kore");
                  setShowVoiceMenu(false);
                }}
                className={`flex flex-col px-3 py-2 rounded-xl text-left transition-all ${
                  selectedVoice === "Kore"
                    ? "bg-pink-500/20 text-white font-semibold border border-pink-500/40"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800/60"
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white font-bold">Kore (100% Song Tone Match)</span>
                  {selectedVoice === "Kore" && <span className="text-pink-400">✓ Active</span>}
                </div>
                <span className="text-[10px] text-pink-300/90 font-medium mt-0.5">
                  Soft, sweet, romantic melodic singing voice matching "Bol Do Na Zara"
                </span>
              </button>

              <button
                onClick={() => {
                  onSelectVoice("Aoede");
                  setShowVoiceMenu(false);
                }}
                className={`flex flex-col px-3 py-2 rounded-xl text-left transition-all ${
                  selectedVoice === "Aoede"
                    ? "bg-pink-500/20 text-white font-semibold border border-pink-500/40"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800/60"
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white font-bold">Aoede</span>
                  {selectedVoice === "Aoede" && <span className="text-pink-400">✓ Active</span>}
                </div>
                <span className="text-[10px] text-neutral-400">
                  Sweet, vibrant, expressive & playful girlfriend voice
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Themes & Wallpapers Selector Trigger */}
        <button
          id="theme-wallpaper-picker-btn"
          onClick={() => {
            setShowVoiceMenu(false);
            setShowModeMenu(false);
            if (onOpenThemeWallpaperModal) {
              onOpenThemeWallpaperModal();
            } else {
              setShowVibeMenu(!showVibeMenu);
            }
          }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-neutral-900/80 border border-neutral-800 text-xs text-neutral-300 hover:text-white hover:border-neutral-700 transition-colors"
          title="Change Themes & Wallpapers"
        >
          <Palette className="w-3.5 h-3.5" style={{ color: theme.primaryHex }} />
          <span className="hidden sm:inline text-[11px] font-semibold">Themes & Wallpapers</span>
          <span className="sm:hidden text-[11px] font-semibold">Themes</span>
        </button>

        {/* Voice & Audio Tuning Settings Trigger */}
        {onOpenMicSettings && (
          <button
            id="header-audio-settings-btn"
            onClick={() => {
              setShowVoiceMenu(false);
              setShowModeMenu(false);
              onOpenMicSettings();
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-neutral-900/80 border border-neutral-800 text-xs text-neutral-300 hover:text-white hover:border-pink-500/40 transition-colors"
            title="Mahi Voice & Mic Settings"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-pink-400" />
            <span className="hidden sm:inline text-[11px] font-semibold">Audio</span>
          </button>
        )}

        {/* Phone Lock Screen & Background Run Trigger */}
        {onOpenLockScreenModal && (
          <button
            id="header-lockscreen-btn"
            onClick={() => {
              setShowVoiceMenu(false);
              setShowModeMenu(false);
              onOpenLockScreenModal();
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-neutral-900/80 border border-neutral-800 text-xs text-neutral-300 hover:text-white hover:border-emerald-500/40 transition-colors"
            title="Phone Screen & Lock-Screen Run"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline text-[11px] font-semibold">Lock Screen</span>
          </button>
        )}

        {/* Memory Vault Trigger (A-Z Conversations & Facts) */}
        {onOpenMemoryVault && (
          <button
            id="header-memory-vault-btn"
            onClick={() => {
              setShowVoiceMenu(false);
              setShowModeMenu(false);
              onOpenMemoryVault();
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-neutral-900/80 border border-neutral-800 text-xs text-neutral-300 hover:text-white hover:border-pink-500/40 transition-colors"
            title="Mahi Memory Vault (A-Z Yaadein & Conversations)"
          >
            <Brain className="w-3.5 h-3.5 text-pink-400" />
            <span className="hidden sm:inline text-[11px] font-semibold">Memories</span>
          </button>
        )}

        {/* Info / Guide Modal Trigger */}
        <button
          id="info-modal-btn"
          onClick={() => {
            setShowVoiceMenu(false);
            setShowModeMenu(false);
            setShowInfoModal(true);
          }}
          className="p-1.5 rounded-full bg-neutral-900/80 border border-neutral-800 text-neutral-400 hover:text-white transition-colors"
          title="About Mahi"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>

      {/* Info Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div
            id="info-dialog"
            className="w-full max-w-md rounded-3xl bg-neutral-900 border border-neutral-800 p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={() => setShowInfoModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${theme.primaryHex}, ${theme.secondaryHex})`,
                }}
              >
                <Heart className="w-5 h-5 fill-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-['Space_Grotesk']">
                  Mahi — Your Girlfriend
                </h3>
                <p className="text-xs text-pink-400">
                  Online & Offline AI • Phone Lock Screen • Custom Avatars & Themes
                </p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs text-neutral-300 leading-relaxed">
              <p>
                <strong className="text-white">Girlfriend Persona:</strong> Mahi talks like your real girlfriend — sweet, emotional, playful, caring, and sassy. She speaks Hindi, Hinglish, and English naturally and calls you &quot;baby&quot;, &quot;jaan&quot;, &quot;shona&quot;!
              </p>

              <div className="p-3 rounded-xl bg-neutral-800/60 border border-neutral-700/60 space-y-1.5">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Online & Offline Dual Operation
                </div>
                <p className="text-[11px] text-neutral-400">
                  Mahi works both <strong>Online</strong> (powered by Gemini Live WebSocket) and <strong>Offline</strong> (100% on-device speech & conversational AI without internet). If your data or WiFi drops, she automatically keeps talking without interruption!
                </p>
              </div>

              <div className="p-3 rounded-xl bg-neutral-800/60 border border-neutral-700/60 space-y-1.5">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                  Phone Lock Screen & Background Mode
                </div>
                <p className="text-[11px] text-neutral-400">
                  Use the <strong>Lock Screen</strong> button to keep your screen on or enable Background Audio so Mahi keeps listening and speaking even when your phone is locked or in your pocket!
                </p>
              </div>

              <div className="p-3 rounded-xl bg-neutral-800/60 border border-neutral-700/60 space-y-1.5">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                  Direct App Launcher
                </div>
                <p className="text-[11px] text-neutral-400">
                  Mahi never gives you annoying links or URLs. Ask her: <em>&quot;YouTube open karo&quot;</em>, <em>&quot;Instagram kholo&quot;</em>, or <em>&quot;Play a romantic song on Spotify&quot;</em>, and she opens it directly!
                </p>
              </div>

              <div className="p-3 rounded-xl bg-neutral-800/60 border border-neutral-700/60 space-y-1.5">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-pink-400" />
                  Real Girl Voice Selection
                </div>
                <p className="text-[11px] text-neutral-400">
                  Switch between <strong>Aoede</strong> (sweet, vibrant & sassy) and <strong>Kore</strong> (warm, soothing & loving) from the top bar anytime.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-neutral-800/60 border border-neutral-700/60 space-y-1.5">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5 text-cyan-400" />
                  Dedicated Mic ON/OFF Control
                </div>
                <p className="text-[11px] text-neutral-400">
                  Quickly mute or unmute your mic anytime using the button or by pressing the <strong>M</strong> key on your keyboard.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowInfoModal(false)}
              className="mt-6 w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-white transition-all shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${theme.primaryHex}, ${theme.secondaryHex})`,
              }}
            >
              Start Talking with Mahi
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
