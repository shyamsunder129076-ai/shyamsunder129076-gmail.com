import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AssistantState } from "../types";
import { ThemeConfig } from "../utils/theme";

interface HolographicVisualizerProps {
  state: AssistantState;
  theme: ThemeConfig;
  getVisualizerData: () => { volume: number; frequencies: number[]; waveform: number[] };
  avatarUrl?: string;
  avatarName?: string;
  onOpenAvatarCustomizer?: () => void;
}

export const HolographicVisualizer: React.FC<HolographicVisualizerProps> = ({
  state,
  theme,
  getVisualizerData,
  avatarUrl,
  avatarName,
  onOpenAvatarCustomizer,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const phaseRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let dpr = window.devicePixelRatio || 1;
    const setSize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    setSize();

    window.addEventListener("resize", setSize);

    const render = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      phaseRef.current += 0.03;
      const phase = phaseRef.current;
      const { volume, frequencies, waveform } = getVisualizerData();

      const baseRadius = Math.min(width, height) * 0.22;

      if (state === "disconnected") {
        // Subtle ambient breathing glow
        const breath = Math.sin(phase * 0.8) * 6;
        const radius = baseRadius + breath;

        // Outer glow
        const gradient = ctx.createRadialGradient(
          centerX,
          centerY,
          radius * 0.2,
          centerX,
          centerY,
          radius * 1.6
        );
        gradient.addColorStop(0, theme.primaryHex + "44");
        gradient.addColorStop(0.6, theme.secondaryHex + "15");
        gradient.addColorStop(1, "transparent");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 1.6, 0, Math.PI * 2);
        ctx.fill();

        // Delicate rotating dashed orbit
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(phase * 0.2);
        ctx.strokeStyle = theme.primaryHex + "33";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([8, 12]);
        ctx.beginPath();
        ctx.arc(0, 0, radius * 1.25, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // Inner glowing core
        const coreGrad = ctx.createRadialGradient(
          centerX - radius * 0.2,
          centerY - radius * 0.2,
          0,
          centerX,
          centerY,
          radius
        );
        coreGrad.addColorStop(0, "#ffffff");
        coreGrad.addColorStop(0.4, theme.primaryHex);
        coreGrad.addColorStop(1, theme.secondaryHex + "66");

        ctx.fillStyle = coreGrad;
        ctx.shadowColor = theme.glowColor;
        ctx.shadowBlur = 24;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.65, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      } else if (state === "connecting") {
        // Fast spinning crystalline radar rings
        const speed = phase * 2.5;

        // Scanning ring 1
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(speed);
        ctx.strokeStyle = theme.primaryHex + "aa";
        ctx.lineWidth = 2.5;
        ctx.setLineDash([20, 10, 4, 10]);
        ctx.beginPath();
        ctx.arc(0, 0, baseRadius * 1.2, 0, Math.PI * 2);
        ctx.stroke();

        // Counter rotating ring 2
        ctx.rotate(-speed * 1.7);
        ctx.strokeStyle = theme.secondaryHex + "dd";
        ctx.lineWidth = 2;
        ctx.setLineDash([30, 25]);
        ctx.beginPath();
        ctx.arc(0, 0, baseRadius * 0.9, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // Pulsing core
        const pulse = Math.abs(Math.sin(phase * 3)) * 14;
        const pulseGrad = ctx.createRadialGradient(
          centerX,
          centerY,
          0,
          centerX,
          centerY,
          baseRadius * 0.7 + pulse
        );
        pulseGrad.addColorStop(0, "#ffffff");
        pulseGrad.addColorStop(0.5, theme.primaryHex);
        pulseGrad.addColorStop(1, "transparent");

        ctx.fillStyle = pulseGrad;
        ctx.shadowColor = theme.glowColor;
        ctx.shadowBlur = 30;
        ctx.beginPath();
        ctx.arc(centerX, centerY, baseRadius * 0.7 + pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      } else if (state === "listening") {
        // Real-time audio-reactive ripples reacting to user's mic input
        const volBoost = volume * 45;
        const currentRadius = baseRadius + volBoost;

        // Dynamic concentric ripples
        for (let r = 1; r <= 3; r++) {
          const rippleRadius = currentRadius + r * 22 + Math.sin(phase * 2 + r) * 6;
          const alpha = Math.max(0.1, 0.45 - r * 0.12 + volume * 0.3);
          ctx.strokeStyle = theme.primaryHex + Math.floor(alpha * 255).toString(16).padStart(2, "0");
          ctx.lineWidth = 1.5 + volume * 2;
          ctx.beginPath();
          ctx.arc(centerX, centerY, rippleRadius, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Animated wave circle around center
        ctx.save();
        ctx.beginPath();
        const numPoints = 64;
        for (let i = 0; i <= numPoints; i++) {
          const angle = (i / numPoints) * Math.PI * 2;
          const waveSample = waveform[i % waveform.length] || 0;
          const offset = waveSample * (18 + volume * 40) + Math.sin(angle * 5 + phase * 2) * 5;
          const r = currentRadius + offset;
          const x = centerX + Math.cos(angle) * r;
          const y = centerY + Math.sin(angle) * r;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = theme.secondaryHex;
        ctx.lineWidth = 2.5;
        ctx.shadowColor = theme.glowColor;
        ctx.shadowBlur = 20;
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.restore();

        // Glowing Core
        const coreGrad = ctx.createRadialGradient(
          centerX,
          centerY,
          0,
          centerX,
          centerY,
          currentRadius * 0.65
        );
        coreGrad.addColorStop(0, "#ffffff");
        coreGrad.addColorStop(0.5, theme.primaryHex);
        coreGrad.addColorStop(1, theme.secondaryHex + "88");
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(centerX, centerY, currentRadius * 0.65, 0, Math.PI * 2);
        ctx.fill();
      } else if (state === "speaking") {
        // Vibrant neural audio spectrum dancing to Mahi's 24kHz voice output!
        const volBoost = volume * 55;
        const currentRadius = baseRadius + 8 + volBoost;

        // 3D-like radial frequency bars
        ctx.save();
        ctx.translate(centerX, centerY);
        const bars = 48;
        for (let b = 0; b < bars; b++) {
          const angle = (b / bars) * Math.PI * 2;
          const freqIndex = Math.floor((b / bars) * frequencies.length);
          const freqVal = frequencies[freqIndex] || 0.1;
          const barHeight = 8 + freqVal * (55 + volume * 70) + Math.sin(phase * 4 + b * 0.4) * 8;

          const x1 = Math.cos(angle) * (currentRadius * 0.85);
          const y1 = Math.sin(angle) * (currentRadius * 0.85);
          const x2 = Math.cos(angle) * (currentRadius * 0.85 + barHeight);
          const y2 = Math.sin(angle) * (currentRadius * 0.85 + barHeight);

          ctx.strokeStyle = b % 2 === 0 ? theme.primaryHex : theme.secondaryHex;
          ctx.lineWidth = 3;
          ctx.lineCap = "round";
          ctx.shadowColor = theme.glowColor;
          ctx.shadowBlur = 16;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
        ctx.shadowBlur = 0;
        ctx.restore();

        // Radiant central plasma core
        const plasmaGrad = ctx.createRadialGradient(
          centerX + Math.cos(phase * 2) * 12,
          centerY + Math.sin(phase * 2) * 12,
          0,
          centerX,
          centerY,
          currentRadius * 0.75
        );
        plasmaGrad.addColorStop(0, "#ffffff");
        plasmaGrad.addColorStop(0.3, theme.primaryHex);
        plasmaGrad.addColorStop(0.7, theme.secondaryHex);
        plasmaGrad.addColorStop(1, "transparent");

        ctx.fillStyle = plasmaGrad;
        ctx.beginPath();
        ctx.arc(centerX, centerY, currentRadius * 0.75, 0, Math.PI * 2);
        ctx.fill();
      }

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      window.removeEventListener("resize", setSize);
    };
  }, [state, theme, getVisualizerData]);

  // Status subtitle copy
  const getStatusText = () => {
    switch (state) {
      case "disconnected":
        return {
          title: "Mahi is sleeping",
          desc: "Tap the center orb to wake her up",
          badge: "IDLE",
        };
      case "connecting":
        return {
          title: "Syncing Neural Voice...",
          desc: "Connecting 24kHz audio channel",
          badge: "LINKING",
        };
      case "listening":
        return {
          title: "Listening to you...",
          desc: "Talk freely — Mahi's all ears",
          badge: "LISTENING",
        };
      case "speaking":
        return {
          title: "Mahi is speaking",
          desc: "Interrupt anytime you like, babe",
          badge: "SPEAKING",
        };
    }
  };

  const status = getStatusText();

  return (
    <div id="holographic-visualizer-container" className="relative w-full flex-1 flex flex-col items-center justify-center min-h-[340px] select-none">
      {/* Dynamic Background Glow */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-700 opacity-60"
        style={{
          background: theme.bgGlow,
        }}
      />

      {/* Holographic Interactive Canvas & Center Avatar Frame */}
      <div className="relative z-10 w-full max-w-[400px] aspect-square flex items-center justify-center">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />

        {/* Center Avatar Portrait with audio-reactive glow */}
        {avatarUrl && (
          <div
            onClick={onOpenAvatarCustomizer}
            className="relative z-20 group cursor-pointer"
            title="Click to customize Mahi's voice picture"
          >
            <div
              className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 transition-all duration-300 shadow-2xl ${
                state === "speaking"
                  ? "ring-4 scale-105"
                  : state === "listening"
                  ? "ring-2 scale-100"
                  : "opacity-90 hover:opacity-100 hover:scale-105"
              }`}
              style={{
                borderColor: theme.primaryHex,
                boxShadow: `0 0 25px ${theme.glowColor}`,
              }}
            >
              <img
                src={avatarUrl}
                alt={avatarName || "Mahi"}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-1.5">
                <span className="text-[9px] text-pink-200 font-semibold bg-black/60 px-2 py-0.5 rounded-full backdrop-blur-sm">
                  Change Photo
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* State Status Overlay */}
      <div className="relative z-20 flex flex-col items-center text-center mt-2 px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={state}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col items-center"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className={`text-[10px] tracking-widest font-bold uppercase px-2.5 py-0.5 rounded-full border backdrop-blur-md ${theme.badgeBg} ${theme.badgeBorder} ${theme.badgeText}`}
              >
                {status.badge}
              </span>
              {state !== "disconnected" && (
                <span className="relative flex h-2 w-2">
                  <span
                    className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                    style={{ backgroundColor: theme.primaryHex }}
                  />
                  <span
                    className="relative inline-flex rounded-full h-2 w-2"
                    style={{ backgroundColor: theme.primaryHex }}
                  />
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-['Space_Grotesk']">
              {status.title}
            </h2>
            <p className="text-sm text-neutral-400 mt-1 max-w-xs">
              {status.desc}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
