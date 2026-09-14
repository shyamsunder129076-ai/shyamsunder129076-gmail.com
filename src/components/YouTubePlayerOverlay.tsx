import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ExternalLink, Maximize2, Minimize2, X, Play, Music, Sparkles } from "lucide-react";
import { YouTubePlaybackAction } from "../types";
import { ThemeConfig } from "../utils/theme";

interface YouTubePlayerOverlayProps {
  video: YouTubePlaybackAction | null;
  theme: ThemeConfig;
  onClose: () => void;
}

export const YouTubePlayerOverlay: React.FC<YouTubePlayerOverlayProps> = ({
  video,
  theme,
  onClose,
}) => {
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  if (!video) return null;

  return (
    <AnimatePresence>
      <motion.div
        id="mahi-youtube-player"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 26, stiffness: 300 }}
        className="fixed bottom-24 right-4 sm:bottom-6 sm:right-6 z-45 max-w-[calc(100vw-2rem)] shadow-2xl"
      >
        <div className="overflow-hidden rounded-2xl border border-neutral-700/80 bg-neutral-950/95 backdrop-blur-xl shadow-2xl text-white">
          {/* Header Bar */}
          <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 bg-neutral-900/90 border-b border-neutral-800">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-lg bg-red-600 flex items-center justify-center shrink-0 shadow-sm">
                <Play className="w-3.5 h-3.5 text-white fill-white ml-0.5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-white truncate max-w-[170px] sm:max-w-[240px]">
                    {video.query}
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-500/20 text-red-400 border border-red-500/30 shrink-0">
                    Playing
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-neutral-400">
                  <Sparkles className="w-2.5 h-2.5 text-pink-400" />
                  <span>Mahi Audio & Video Player</span>
                </div>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-1 shrink-0">
              <a
                href={video.webUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Open in YouTube app / tab"
                className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                type="button"
                onClick={() => setIsMinimized((prev) => !prev)}
                title={isMinimized ? "Expand video" : "Minimize"}
                className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors"
              >
                {isMinimized ? (
                  <Maximize2 className="w-3.5 h-3.5" />
                ) : (
                  <Minimize2 className="w-3.5 h-3.5" />
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                title="Close player"
                className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-300 hover:text-red-400 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Player Body */}
          {!isMinimized && (
            <div className="relative w-[320px] sm:w-[380px] aspect-video bg-black">
              <iframe
                src={video.embedUrl}
                title={`YouTube player: ${video.query}`}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          )}

          {/* Minimized Pill Bar */}
          {isMinimized && (
            <div className="flex items-center justify-between gap-3 px-3 py-2 text-xs bg-neutral-900/50">
              <div className="flex items-center gap-2 text-neutral-300">
                <Music className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                <span className="truncate max-w-[200px]">{video.query}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsMinimized(false)}
                className="text-[11px] font-medium text-pink-400 hover:text-pink-300"
              >
                Show Video
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
