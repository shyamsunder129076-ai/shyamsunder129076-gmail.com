import React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  SlidersHorizontal,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  RotateCcw,
  Check,
  ShieldCheck,
  Zap,
  Music,
} from "lucide-react";
import { AssistantState, InputLevelData } from "../types";
import { ThemeConfig } from "../utils/theme";

interface MicSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  state: AssistantState;
  theme: ThemeConfig;
  isMuted: boolean;
  onToggleMute: () => void;
  sensitivityThreshold: number; // 0 - 100
  onSensitivityChange: (val: number) => void;
  inputGain: number; // 0.5 - 2.5
  onInputGainChange: (val: number) => void;
  voicePitch: number; // 0.80 - 1.30
  onVoicePitchChange: (val: number) => void;
  liveLevelData: InputLevelData | null;
  onResetDefaults: () => void;
}

export const MicSettingsPanel: React.FC<MicSettingsPanelProps> = ({
  isOpen,
  onClose,
  state,
  theme,
  isMuted,
  onToggleMute,
  sensitivityThreshold,
  onSensitivityChange,
  inputGain,
  onInputGainChange,
  voicePitch,
  onVoicePitchChange,
  liveLevelData,
  onResetDefaults,
}) => {
  if (!isOpen) return null;

  const isConnected = state === "listening" || state === "speaking";

  // Calculate visual volume percentage for the VU meter
  // RMS typically ranges from 0.000 to ~0.25+
  const rawRms = liveLevelData?.rms ?? 0;
  const meterPercent = isMuted || !isConnected
    ? 0
    : Math.min(100, Math.round((rawRms / 0.12) * 100));

  const isVoiceActive = liveLevelData?.isVoiceActive ?? false;

  const getThresholdLabel = (val: number) => {
    if (val <= 10) return "Ultra-Sensitive (Whispers / Quiet Room)";
    if (val <= 30) return "Balanced Voice (Recommended)";
    if (val <= 55) return "Noise Filtering (Typing / AC Hum blocked)";
    return "Heavy Gate (Only loud/close speech passes)";
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center sm:justify-end sm:pr-6 pt-16 sm:pt-20 px-3 bg-black/60 backdrop-blur-sm">
        {/* Backdrop click to dismiss */}
        <div className="absolute inset-0 -z-10" onClick={onClose} />

        <motion.div
          id="mic-settings-panel"
          initial={{ opacity: 0, y: -15, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -15, scale: 0.96 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative w-full max-w-sm rounded-3xl bg-neutral-900/95 border border-neutral-700/80 p-4 sm:p-5 shadow-2xl backdrop-blur-2xl text-white flex flex-col gap-4 overflow-hidden"
          style={{
            boxShadow: `0 20px 50px -10px ${theme.primaryHex}20, 0 0 0 1px ${theme.primaryHex}30`,
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800/80">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shadow"
                style={{
                  backgroundColor: theme.primaryHex + "25",
                  color: theme.primaryHex,
                  border: `1px solid ${theme.primaryHex}40`,
                }}
              >
                <SlidersHorizontal className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-wide text-white font-['Space_Grotesk'] flex items-center gap-1.5">
                  Audio & Voice Settings
                  {isConnected && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  )}
                </h3>
                <p className="text-[11px] text-neutral-400">
                  Mic threshold & Mahi voice pitch tuning
                </p>
              </div>
            </div>

            <button
              id="close-mic-settings-btn"
              onClick={onClose}
              className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              aria-label="Close settings"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Live Level VU Meter & Voice Status */}
          <div className="p-3 rounded-2xl bg-neutral-950/70 border border-neutral-800 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-neutral-400">
                <Volume2 className="w-3.5 h-3.5" />
                <span className="text-[11px] font-medium">Live Voice Meter</span>
              </div>

              {/* Real-time State Badge */}
              {isMuted ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center gap-1">
                  <MicOff className="w-3 h-3" /> Muted
                </span>
              ) : !isConnected ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-neutral-800 text-neutral-400 border border-neutral-700">
                  Standby (Start call)
                </span>
              ) : isVoiceActive ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center gap-1 animate-pulse">
                  <Zap className="w-3 h-3 fill-emerald-400" /> Voice Active
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/15 border border-amber-500/30 text-amber-300 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Noise Filtered
                </span>
              )}
            </div>

            {/* Visual Meter Bar with Threshold Cutoff Marker */}
            <div className="relative w-full h-3.5 rounded-full bg-neutral-900 border border-neutral-800 overflow-hidden">
              {/* Dynamic Level Fill */}
              <div
                className="h-full transition-all duration-75 rounded-full"
                style={{
                  width: `${meterPercent}%`,
                  background: isVoiceActive
                    ? `linear-gradient(90deg, #10b981, ${theme.primaryHex})`
                    : "#64748b",
                  opacity: meterPercent > 0 ? 1 : 0.2,
                }}
              />

              {/* Threshold Marker Needle */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-pink-400 shadow-[0_0_8px_#ec4899] z-10 pointer-events-none"
                style={{ left: `${Math.min(98, Math.max(2, sensitivityThreshold))}%` }}
                title={`Threshold Marker: ${sensitivityThreshold}%`}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] text-neutral-500 px-0.5">
              <span>0% (Whisper)</span>
              <span className="text-pink-400 font-semibold">
                ▲ Gate Cutoff: {sensitivityThreshold}%
              </span>
              <span>100% (Strict)</span>
            </div>
          </div>

          {/* Sensitivity Threshold Slider */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="mic-sensitivity-slider"
                className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                Detection Threshold
              </label>
              <span
                className="px-2 py-0.5 rounded-lg text-xs font-bold"
                style={{
                  backgroundColor: theme.primaryHex + "20",
                  color: theme.primaryHex,
                  border: `1px solid ${theme.primaryHex}40`,
                }}
              >
                {sensitivityThreshold}%
              </span>
            </div>

            <input
              id="mic-sensitivity-slider"
              type="range"
              min="0"
              max="100"
              step="1"
              value={sensitivityThreshold}
              onChange={(e) => onSensitivityChange(Number(e.target.value))}
              className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-pink-500 hover:accent-pink-400 transition-all"
            />

            <p className="text-[11px] text-neutral-400 leading-tight">
              {getThresholdLabel(sensitivityThreshold)}
            </p>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Quick Presets
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { label: "Whisper", val: 5, desc: "Quiet" },
                { label: "Balanced", val: 20, desc: "Default" },
                { label: "Noisy Room", val: 45, desc: "Filter" },
              ].map((p) => {
                const isActive = Math.abs(sensitivityThreshold - p.val) <= 3;
                return (
                  <button
                    key={p.label}
                    onClick={() => onSensitivityChange(p.val)}
                    className={`py-1.5 px-2 rounded-xl text-xs font-semibold flex flex-col items-center justify-center border transition-all ${
                      isActive
                        ? "bg-pink-500/25 border-pink-500/50 text-white shadow-sm"
                        : "bg-neutral-800/60 border-neutral-700/60 text-neutral-300 hover:bg-neutral-800 hover:text-white"
                    }`}
                  >
                    <span>{p.label}</span>
                    <span className="text-[9px] text-neutral-400 font-normal">
                      {p.val}%
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Microphone Boost / Input Gain */}
          <div className="flex flex-col gap-2 pt-2 border-t border-neutral-800/80">
            <div className="flex items-center justify-between">
              <label
                htmlFor="mic-gain-slider"
                className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5"
              >
                <Volume2 className="w-3.5 h-3.5 text-neutral-400" />
                Microphone Boost (Gain)
              </label>
              <span className="px-1.5 py-0.5 rounded text-xs font-bold text-neutral-300 bg-neutral-800">
                {inputGain.toFixed(1)}x
              </span>
            </div>

            <input
              id="mic-gain-slider"
              type="range"
              min="0.5"
              max="2.5"
              step="0.1"
              value={inputGain}
              onChange={(e) => onInputGainChange(Number(e.target.value))}
              className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-neutral-300 hover:accent-white transition-all"
            />
          </div>

          {/* Mahi Voice Pitch Slider (Allows adjusting pitch of generated responses) */}
          <div className="flex flex-col gap-2 pt-2 border-t border-neutral-800/80">
            <div className="flex items-center justify-between">
              <label
                htmlFor="voice-pitch-slider"
                className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5"
              >
                <Music className="w-3.5 h-3.5 text-pink-400" />
                Mahi Voice Pitch
              </label>
              <span
                className="px-2 py-0.5 rounded-lg text-xs font-bold transition-all"
                style={{
                  backgroundColor: theme.primaryHex + "20",
                  color: theme.primaryHex,
                  border: `1px solid ${theme.primaryHex}40`,
                }}
              >
                {voicePitch.toFixed(2)}x{" "}
                <span className="font-normal opacity-80">
                  {voicePitch === 1.0
                    ? "• Natural"
                    : voicePitch > 1.0
                    ? "• Cute"
                    : "• Deep"}
                </span>
              </span>
            </div>

            <input
              id="voice-pitch-slider"
              type="range"
              min="0.80"
              max="1.30"
              step="0.02"
              value={voicePitch}
              onChange={(e) => onVoicePitchChange(Number(e.target.value))}
              className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-pink-500 hover:accent-pink-400 transition-all"
            />

            <div className="flex items-center justify-between text-[10px] text-neutral-400 px-0.5">
              <span>0.80x (Warm & Deep)</span>
              <span className="text-white font-medium">1.00x (Natural)</span>
              <span>1.30x (Sweet & Cute)</span>
            </div>

            {/* Quick Pitch Presets */}
            <div className="grid grid-cols-4 gap-1.5 mt-0.5">
              {[
                { label: "Deep", val: 0.90, desc: "Warm" },
                { label: "Natural", val: 1.00, desc: "Default" },
                { label: "Sweet", val: 1.12, desc: "Soft" },
                { label: "Cute", val: 1.22, desc: "Kawaii" },
              ].map((p) => {
                const isActive = Math.abs(voicePitch - p.val) <= 0.03;
                return (
                  <button
                    key={p.label}
                    onClick={() => onVoicePitchChange(p.val)}
                    className={`py-1.5 px-1 rounded-xl text-xs font-semibold flex flex-col items-center justify-center border transition-all ${
                      isActive
                        ? "bg-pink-500/25 border-pink-500/50 text-white shadow-sm"
                        : "bg-neutral-800/60 border-neutral-700/60 text-neutral-300 hover:bg-neutral-800 hover:text-white"
                    }`}
                  >
                    <span>{p.label}</span>
                    <span className="text-[9px] text-neutral-400 font-normal">
                      {p.val.toFixed(2)}x
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Actions: Mic Mute & Reset */}
          <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80 text-xs">
            <button
              onClick={onToggleMute}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold border transition-all ${
                isMuted
                  ? "bg-rose-500/20 border-rose-500/40 text-rose-300 hover:bg-rose-500/30"
                  : "bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700 hover:text-white"
              }`}
            >
              {isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              <span>{isMuted ? "Unmute Mic" : "Mute Mic"}</span>
            </button>

            <button
              onClick={onResetDefaults}
              className="flex items-center gap-1 text-neutral-400 hover:text-white px-2 py-1 rounded-lg transition-colors text-[11px]"
              title="Reset threshold to 20%, gain to 1.0x, and voice pitch to 1.00x"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Defaults</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
