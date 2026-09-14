import React, { useMemo } from "react";
import { WallpaperId } from "../types";
import { ThemeConfig } from "../utils/theme";
import { WALLPAPER_PRESETS } from "../utils/wallpapers";

interface WallpaperBackdropProps {
  wallpaper: WallpaperId;
  theme: ThemeConfig;
  dimLevel?: number; // 0 (bright) to 100 (extra dim), default ~20
}

export const WallpaperBackdrop: React.FC<WallpaperBackdropProps> = ({
  wallpaper,
  theme,
  dimLevel = 25,
}) => {
  const current = WALLPAPER_PRESETS[wallpaper] || WALLPAPER_PRESETS["hologram-grid"];

  // Pre-calculate randomized positions for stars/particles once
  const stars = useMemo(() => {
    return Array.from({ length: 24 }).map((_, i) => ({
      id: i,
      x: (i * 37) % 96 + 2,
      y: (i * 47) % 92 + 3,
      size: (i % 3) + 1.2,
      opacity: 0.25 + ((i % 5) * 0.15),
      delay: (i % 6) * 0.8,
    }));
  }, []);

  const petals = useMemo(() => {
    return Array.from({ length: 14 }).map((_, i) => ({
      id: i,
      x: (i * 29) % 90 + 5,
      y: (i * 33) % 85 + 5,
      size: 10 + (i % 8) * 2,
      rotate: (i * 45) % 360,
      opacity: 0.2 + ((i % 4) * 0.12),
      delay: (i % 5) * 1.2,
    }));
  }, []);

  return (
    <div
      id="dynamic-wallpaper-backdrop"
      className="absolute inset-0 pointer-events-none overflow-hidden transition-all duration-700 select-none"
      style={{
        background: current.backgroundCss,
      }}
    >
      {/* Pattern & Particle Layer */}
      {current.patternType === "grid" && (
        <div
          className="absolute inset-0 opacity-20 transition-opacity duration-700"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.06) 1px, transparent 1px)`,
            backgroundSize: "36px 36px",
          }}
        />
      )}

      {current.patternType === "stars" && (
        <div className="absolute inset-0">
          {stars.map((s) => (
            <div
              key={s.id}
              className="absolute rounded-full bg-white animate-pulse"
              style={{
                left: `${s.x}%`,
                top: `${s.y}%`,
                width: `${s.size}px`,
                height: `${s.size}px`,
                opacity: s.opacity,
                animationDuration: `${2.5 + (s.id % 3)}s`,
                animationDelay: `${s.delay}s`,
                boxShadow: `0 0 6px rgba(255,255,255,0.8)`,
              }}
            />
          ))}
        </div>
      )}

      {current.patternType === "sakura" && (
        <div className="absolute inset-0 overflow-hidden">
          {petals.map((p) => (
            <svg
              key={p.id}
              className="absolute animate-pulse"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                opacity: p.opacity,
                transform: `rotate(${p.rotate}deg)`,
                animationDuration: `${3.5 + (p.id % 3)}s`,
                animationDelay: `${p.delay}s`,
              }}
              viewBox="0 0 24 24"
              fill="rgba(244, 114, 182, 0.6)"
            >
              <path d="M12 2C9 7 4 10 4 14a8 8 0 0 0 16 0c0-4-5-7-8-12z" />
            </svg>
          ))}
        </div>
      )}

      {current.patternType === "aurora" && (
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage: `radial-gradient(ellipse 120% 40% at 50% 20%, rgba(45, 212, 191, 0.2), transparent 70%), radial-gradient(ellipse 90% 30% at 70% 30%, rgba(99, 102, 241, 0.2), transparent 60%)`,
            filter: "blur(40px)",
          }}
        />
      )}

      {current.patternType === "hearts" && (
        <div className="absolute inset-0">
          {petals.slice(0, 10).map((h) => (
            <svg
              key={h.id}
              className="absolute animate-pulse"
              style={{
                left: `${h.x}%`,
                top: `${h.y}%`,
                width: `${h.size + 2}px`,
                height: `${h.size + 2}px`,
                opacity: h.opacity * 0.9,
                animationDuration: `${3 + (h.id % 4)}s`,
                animationDelay: `${h.delay}s`,
              }}
              viewBox="0 0 24 24"
              fill="rgba(244, 63, 94, 0.45)"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          ))}
        </div>
      )}

      {current.patternType === "city" && (
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `linear-gradient(0deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(217, 70, 239, 0.1) 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
          }}
        />
      )}

      {current.patternType === "synthwave" && (
        <div
          className="absolute inset-x-0 bottom-0 h-1/2 opacity-30"
          style={{
            backgroundImage: `linear-gradient(to bottom, transparent, rgba(249, 115, 22, 0.2)), repeating-linear-gradient(0deg, rgba(244, 63, 94, 0.2) 0px, rgba(244, 63, 94, 0.2) 1px, transparent 1px, transparent 20px)`,
            perspective: "400px",
            transformOrigin: "bottom center",
          }}
        />
      )}

      {current.patternType === "carbon" && (
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle, #fff 10%, transparent 11%), radial-gradient(circle at bottom left, #fff 10%, transparent 11%), radial-gradient(circle at bottom right, #fff 10%, transparent 11%)`,
            backgroundSize: "16px 16px",
          }}
        />
      )}

      {current.patternType === "amoled" && (
        <div className="absolute inset-0">
          {stars.slice(0, 8).map((s) => (
            <div
              key={s.id}
              className="absolute rounded-full bg-white animate-pulse"
              style={{
                left: `${s.x}%`,
                top: `${s.y}%`,
                width: `${s.size}px`,
                height: `${s.size}px`,
                opacity: s.opacity * 0.4,
              }}
            />
          ))}
        </div>
      )}

      {current.patternType === "moon" && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Full Moon Glow */}
          <div
            className="absolute top-12 right-12 w-28 h-28 rounded-full bg-gradient-to-br from-sky-100 to-sky-300 opacity-60 blur-md"
            style={{ boxShadow: "0 0 50px rgba(186, 230, 253, 0.4)" }}
          />
          <div className="absolute top-12 right-12 w-28 h-28 rounded-full bg-slate-100/40" />
          {/* Water reflection horizon */}
          <div
            className="absolute inset-x-0 bottom-0 h-1/3 opacity-25"
            style={{
              backgroundImage: "repeating-linear-gradient(0deg, rgba(56, 189, 248, 0.25) 0px, rgba(56, 189, 248, 0.25) 1px, transparent 1px, transparent 12px)",
            }}
          />
        </div>
      )}

      {current.patternType === "drive" && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Sunset Horizon Sun */}
          <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-64 h-32 rounded-t-full bg-gradient-to-t from-orange-500 via-amber-400 to-transparent opacity-35 blur-lg" />
          {/* Road Perspective */}
          <div
            className="absolute inset-x-0 bottom-0 h-1/3 opacity-30"
            style={{
              backgroundImage: "repeating-linear-gradient(90deg, transparent 0px, transparent 40px, rgba(245, 158, 11, 0.15) 40px, rgba(245, 158, 11, 0.15) 42px)",
              perspective: "200px",
              transformOrigin: "bottom center",
            }}
          />
        </div>
      )}

      {current.patternType === "bedroom" && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Fairy Light Constellation */}
          {stars.slice(0, 16).map((star) => (
            <div
              key={star.id}
              className="absolute rounded-full bg-amber-200 animate-pulse"
              style={{
                left: `${star.x}%`,
                top: `${star.y * 0.5}%`,
                width: `${star.size + 1.5}px`,
                height: `${star.size + 1.5}px`,
                opacity: star.opacity * 0.85,
                boxShadow: "0 0 8px rgba(251, 191, 36, 0.6)",
                animationDuration: `${2.5 + (star.id % 3)}s`,
              }}
            />
          ))}
          {/* Soft Window Glow Blinds */}
          <div
            className="absolute right-0 inset-y-0 w-1/3 opacity-15"
            style={{
              backgroundImage: "repeating-linear-gradient(0deg, rgba(192, 132, 252, 0.2) 0px, rgba(192, 132, 252, 0.2) 18px, transparent 18px, transparent 36px)",
            }}
          />
        </div>
      )}

      {/* Dynamic Theme Radial Lighting Accent */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-700 opacity-80"
        style={{
          background: theme.bgGlow,
        }}
      />

      {/* User Configured Dim / Contrast Layer */}
      <div
        className="absolute inset-0 pointer-events-none bg-black transition-opacity duration-500"
        style={{
          opacity: Math.max(0.1, Math.min(0.85, dimLevel / 100)),
        }}
      />

      {/* Subtle edge vignette for focus */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/80 via-transparent to-black/60" />
    </div>
  );
};
