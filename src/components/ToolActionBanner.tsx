import React, { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ExternalLink, Palette, CheckCircle, Sparkles, Smartphone, HeartHandshake } from "lucide-react";
import { ToolAction } from "../types";
import { ThemeConfig } from "../utils/theme";

interface ToolActionBannerProps {
  action: ToolAction | null;
  theme: ThemeConfig;
  onDismiss: () => void;
}

export const ToolActionBanner: React.FC<ToolActionBannerProps> = ({
  action,
  theme,
  onDismiss,
}) => {
  useEffect(() => {
    if (!action) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 2800);
    return () => clearTimeout(timer);
  }, [action, onDismiss]);

  if (!action) return null;

  const isAppOpen = action.name === "openApp" || action.name === "openWebsite";
  const appName = action.args?.name || action.args?.appName || "App";
  const isScreenControl = action.name === "manageScreen";
  const isSaveMemory = action.name === "saveMemory";

  return (
    <AnimatePresence>
      <motion.div
        id="tool-action-banner"
        initial={{ opacity: 0, y: -16, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -16, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="fixed top-18 left-1/2 -translate-x-1/2 z-40 px-4 pointer-events-none"
      >
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-neutral-900/90 border border-neutral-700/80 shadow-2xl backdrop-blur-xl text-white">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
            style={{
              backgroundColor: theme.primaryHex + "30",
              color: theme.primaryHex,
            }}
          >
            {isAppOpen ? (
              <ExternalLink className="w-3.5 h-3.5" />
            ) : isScreenControl ? (
              <Smartphone className="w-3.5 h-3.5" />
            ) : isSaveMemory ? (
              <HeartHandshake className="w-3.5 h-3.5 text-pink-400" />
            ) : action.name === "changeVibe" ? (
              <Palette className="w-3.5 h-3.5" />
            ) : (
              <CheckCircle className="w-3.5 h-3.5" />
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs font-medium">
            <Sparkles className="w-3 h-3 text-pink-400 shrink-0" />
            <span className="text-white font-semibold">
              {isAppOpen
                ? `${appName} opened directly`
                : isScreenControl
                ? action.args?.action === "wake"
                  ? "Screen Keep-Awake Activated"
                  : "Screen Sleep Timer Restored"
                : isSaveMemory
                ? `Yaad rakh liya: "${action.args?.memory?.slice(0, 32)}${action.args?.memory?.length > 32 ? "..." : ""}"`
                : action.name === "changeVibe"
                ? `Theme: ${action.args?.vibe}`
                : action.name}
            </span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

