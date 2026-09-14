import React from "react";
import { motion } from "motion/react";
import { Mic, MicOff, Power, Loader2, Sparkles } from "lucide-react";
import { AssistantState } from "../types";
import { ThemeConfig } from "../utils/theme";

interface CenterPowerButtonProps {
  state: AssistantState;
  theme: ThemeConfig;
  isMuted: boolean;
  isMutedSpeaking?: boolean;
  onToggleConnect: () => void;
  onToggleMute: () => void;
  onInterrupt: () => void;
}

export const CenterPowerButton: React.FC<CenterPowerButtonProps> = ({
  state,
  theme,
  isMuted,
  isMutedSpeaking = false,
  onToggleConnect,
  onToggleMute,
  onInterrupt,
}) => {
  const isConnected = state === "listening" || state === "speaking";
  const isConnecting = state === "connecting";

  return (
    <div id="controls-panel" className="relative z-30 flex flex-col items-center pb-8 pt-2 px-6 w-full max-w-sm mx-auto">
      {/* Action Row - Three options always visible */}
      <div className="flex items-center justify-center gap-6 sm:gap-8 w-full">
        {/* 1. Mute / Mic Button (Always Visible) */}
        <div className="flex flex-col items-center">
          <motion.button
            id="mic-on-off-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            animate={
              isMutedSpeaking
                ? {
                    x: [-3, 3, -3, 3, 0],
                    scale: [1, 1.1, 1],
                  }
                : {}
            }
            transition={{ duration: 0.35, ease: "easeInOut" }}
            onClick={onToggleMute}
            aria-label={isMuted ? "Activate Mic" : "Mute Mic"}
            className={`flex items-center justify-center w-13 h-13 sm:w-14 sm:h-14 rounded-full border backdrop-blur-xl transition-all shadow-lg ${
              isMutedSpeaking
                ? "bg-rose-500/30 border-rose-400 text-rose-300 ring-4 ring-rose-500/60 shadow-xl shadow-rose-500/40"
                : isMuted
                ? "bg-rose-500/20 border-rose-500/60 text-rose-400 shadow-rose-500/20"
                : "bg-neutral-900/80 border-neutral-700 text-neutral-200 hover:text-white hover:border-neutral-500"
            }`}
          >
            {isMuted ? (
              <MicOff
                className={`w-5 h-5 text-rose-400 ${
                  isMutedSpeaking ? "animate-bounce" : ""
                }`}
              />
            ) : (
              <Mic className="w-5 h-5 text-emerald-400" />
            )}
          </motion.button>
          <span
            className={`text-[10px] mt-1 font-semibold transition-colors ${
              isMutedSpeaking
                ? "text-rose-400 font-bold animate-pulse"
                : "text-neutral-400"
            }`}
          >
            {isMutedSpeaking ? "Tap to Unmute!" : isMuted ? "Unmute" : "Mute"}
          </span>
        </div>

        {/* 2. Primary Central Power / Call Button (Always Visible) */}
        <div className="relative flex flex-col items-center">
          {/* Animated Ambient Outer Pulse Rings */}
          {(isConnected || isConnecting) && (
            <>
              <motion.div
                className="absolute inset-0 rounded-full pointer-events-none"
                animate={{
                  scale: [1, 1.45, 1],
                  opacity: [0.4, 0, 0.4],
                }}
                transition={{
                  duration: state === "speaking" ? 1.4 : 2.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{
                  border: `2px solid ${theme.primaryHex}`,
                }}
              />
              <motion.div
                className="absolute inset-0 rounded-full pointer-events-none"
                animate={{
                  scale: [1, 1.25, 1],
                  opacity: [0.5, 0.1, 0.5],
                }}
                transition={{
                  duration: state === "speaking" ? 1.0 : 1.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.3,
                }}
                style={{
                  boxShadow: `0 0 35px ${theme.glowColor}`,
                }}
              />
            </>
          )}

          <motion.button
            id="main-power-action-btn"
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => {
              if (state === "speaking") {
                onInterrupt();
              }
              onToggleConnect();
            }}
            disabled={isConnecting}
            className={`relative flex items-center justify-center w-20 h-20 sm:w-22 sm:h-22 rounded-full font-semibold shadow-2xl transition-all focus:outline-none ${
              !isConnected
                ? `bg-gradient-to-tr ${theme.primary} text-white shadow-lg ${theme.buttonRing}`
                : "bg-neutral-900/95 border-2 border-rose-500/60 text-rose-400 hover:bg-rose-500/15 shadow-rose-900/30"
            }`}
          >
            {isConnecting ? (
              <Loader2 className="w-8 h-8 animate-spin text-white" />
            ) : !isConnected ? (
              <div className="flex flex-col items-center">
                <Mic className="w-8 h-8 text-white drop-shadow-md" />
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Power className="w-8 h-8 text-rose-400 drop-shadow-md" />
              </div>
            )}
          </motion.button>
          <span className="text-[10px] text-neutral-400 mt-1 font-semibold">
            {!isConnected ? "Call Mahi" : "End Call"}
          </span>
        </div>

        {/* 3. Secondary Action: Interrupt / Sparkle Button (Always Visible) */}
        <div className="flex flex-col items-center">
          <motion.button
            id="interrupt-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            onClick={onInterrupt}
            title={
              state === "speaking"
                ? "Interrupt Mahi while speaking"
                : isConnected
                ? "Tease Mahi"
                : "Call & Tease Mahi"
            }
            aria-label="Tease or interrupt speech"
            className={`flex items-center justify-center w-13 h-13 sm:w-14 sm:h-14 rounded-full border backdrop-blur-xl transition-all shadow-lg ${
              state === "speaking"
                ? "bg-pink-500/20 border-pink-500/60 text-pink-300 shadow-pink-500/20 animate-pulse cursor-pointer"
                : "bg-neutral-900/80 border-neutral-700 text-neutral-300 hover:text-white hover:border-pink-500/50 hover:bg-pink-500/10 cursor-pointer"
            }`}
          >
            <Sparkles className="w-5 h-5 text-pink-400" />
          </motion.button>
          <span className="text-[10px] text-neutral-400 mt-1 font-semibold">
            {state === "speaking" ? "Interrupt" : "Tease"}
          </span>
        </div>
      </div>

      {/* Status helper copy */}
      <div className="mt-3 text-center">
        <p className="text-xs tracking-wider font-medium text-neutral-400">
          {!isConnected
            ? isConnecting
              ? "Connecting with Mahi..."
              : "Tap central button to start talking with Mahi"
            : state === "speaking"
            ? "Mahi is speaking • Tap Tease or speak to interrupt"
            : isMuted
            ? "Microphone is MUTED"
            : "Listening to you... Speak freely baby!"}
        </p>
      </div>
    </div>
  );
};
