import React, { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MicOff, Volume2 } from "lucide-react";

interface MutedSpeakReminderProps {
  visible: boolean;
  onUnmute: () => void;
}

export const MutedSpeakReminder: React.FC<MutedSpeakReminderProps> = ({
  visible,
  onUnmute,
}) => {
  // Trigger physical haptic vibration on supported devices
  useEffect(() => {
    if (visible && typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      try {
        navigator.vibrate([45, 60, 45]);
      } catch (_) {}
    }
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <div id="muted-speech-alert-container" className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {/* 1. Full-Screen Edge Glow (Subtle Perimeter Vignette) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0.75, 1, 0.85, 1, 0.9],
              scale: [1, 1.004, 0.998, 1.002, 1],
            }}
            exit={{ opacity: 0 }}
            transition={{
              opacity: { duration: 0.28 },
              scale: { duration: 0.35, ease: "easeInOut" },
            }}
            className="absolute inset-0 pointer-events-none"
          >
            {/* Top Screen-Edge Glow */}
            <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-b from-rose-500/40 via-rose-500/15 to-transparent" />

            {/* Bottom Screen-Edge Glow */}
            <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-rose-500/45 via-rose-500/15 to-transparent" />

            {/* Left Screen-Edge Glow */}
            <div className="absolute left-0 inset-y-0 w-20 bg-gradient-to-r from-rose-500/35 via-rose-500/10 to-transparent" />

            {/* Right Screen-Edge Glow */}
            <div className="absolute right-0 inset-y-0 w-20 bg-gradient-to-l from-rose-500/35 via-rose-500/10 to-transparent" />

            {/* Inset perimeter shadow for crisp neon rim */}
            <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(244,63,94,0.45),inset_0_0_120px_rgba(225,29,72,0.18)]" />

            {/* Haptic Visual Pulse Border */}
            <div className="absolute inset-0 border border-rose-500/50 rounded-none pointer-events-none animate-pulse" />
          </motion.div>

          {/* 2. Interactive Haptic-Style Floating Pill */}
          <div className="absolute top-20 sm:top-24 left-1/2 -translate-x-1/2 pointer-events-auto px-4 w-full max-w-sm flex justify-center">
            <motion.button
              id="muted-speech-unmute-pill"
              initial={{ opacity: 0, y: -16, scale: 0.92 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: [1, 1.03, 0.98, 1.02, 1],
              }}
              exit={{ opacity: 0, y: -12, scale: 0.92 }}
              transition={{
                duration: 0.3,
                scale: { duration: 0.45, ease: "easeOut" },
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onUnmute}
              className="group flex items-center gap-2.5 px-4 py-2 rounded-full bg-neutral-950/90 border border-rose-500/70 shadow-2xl shadow-rose-500/30 text-rose-100 backdrop-blur-xl cursor-pointer hover:bg-rose-950/80 hover:border-rose-400 transition-all select-none"
              title="Click to unmute microphone"
              aria-label="Microphone is muted. Tap to unmute"
            >
              {/* Pulsing indicator dot */}
              <span className="relative flex h-3 w-3 items-center justify-center">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
              </span>

              <MicOff className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />

              <span className="text-xs font-semibold text-white tracking-wide">
                You are muted <span className="text-rose-400 font-bold">• Tap to unmute</span>
              </span>

              <Volume2 className="w-3.5 h-3.5 text-rose-300 opacity-80 ml-0.5 group-hover:text-white transition-colors" />
            </motion.button>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
