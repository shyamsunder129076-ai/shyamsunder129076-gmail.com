import type { CSSProperties } from "react";
import { WallpaperConfig, WallpaperId } from "../types";

export interface WallpaperItem extends WallpaperConfig {
  backgroundCss: string;
  overlayStyle?: CSSProperties;
  patternType: "grid" | "stars" | "sakura" | "aurora" | "city" | "hearts" | "synthwave" | "carbon" | "amoled" | "moon" | "drive" | "bedroom";
}

export const WALLPAPER_PRESETS: Record<WallpaperId, WallpaperItem> = {
  "hologram-grid": {
    id: "hologram-grid",
    name: "Cyber Grid",
    category: "Cyber",
    description: "Futuristic digital matrix with isometric scanlines & depth glow",
    previewGradient: "from-cyan-900 via-neutral-950 to-blue-950",
    backgroundCss: "radial-gradient(ellipse 80% 60% at 50% -20%, rgba(6, 182, 212, 0.25), transparent 70%), linear-gradient(180deg, #050508 0%, #0a0a14 100%)",
    patternType: "grid",
  },
  "stardust-galaxy": {
    id: "stardust-galaxy",
    name: "Stardust Galaxy",
    category: "Cosmic",
    description: "Deep cosmic nebula with celestial starlight & floating galaxies",
    previewGradient: "from-purple-900 via-indigo-950 to-pink-950",
    backgroundCss: "radial-gradient(circle at 30% 25%, rgba(168, 85, 247, 0.25) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(236, 72, 153, 0.2) 0%, transparent 60%), radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 70%), linear-gradient(180deg, #06040d 0%, #030206 100%)",
    patternType: "stars",
  },
  "sakura-night": {
    id: "sakura-night",
    name: "Sakura Night",
    category: "Romance",
    description: "Romantic midnight Tokyo breeze with soft glowing cherry petals",
    previewGradient: "from-pink-900 via-rose-950 to-neutral-950",
    backgroundCss: "radial-gradient(circle at 50% 20%, rgba(244, 114, 182, 0.28) 0%, rgba(251, 113, 133, 0.12) 40%, transparent 75%), radial-gradient(ellipse at 80% 90%, rgba(219, 39, 119, 0.15), transparent 60%), linear-gradient(180deg, #0c050a 0%, #050204 100%)",
    patternType: "sakura",
  },
  "aurora-borealis": {
    id: "aurora-borealis",
    name: "Aurora Lights",
    category: "Cosmic",
    description: "Luminescent emerald & violet northern lights curtains over obsidian skies",
    previewGradient: "from-emerald-900 via-teal-950 to-indigo-950",
    backgroundCss: "radial-gradient(ellipse 90% 50% at 50% 10%, rgba(16, 185, 129, 0.3) 0%, rgba(20, 184, 166, 0.18) 35%, rgba(99, 102, 241, 0.12) 65%, transparent 85%), linear-gradient(180deg, #020907 0%, #030712 100%)",
    patternType: "aurora",
  },
  "cyberpunk-city": {
    id: "cyberpunk-city",
    name: "Neo Tokyo",
    category: "Cyber",
    description: "Electric cyberpunk midnight reflections, neon signage & wet asphalt vibe",
    previewGradient: "from-fuchsia-900 via-neutral-950 to-cyan-950",
    backgroundCss: "radial-gradient(circle at 85% 15%, rgba(217, 70, 239, 0.25) 0%, transparent 45%), radial-gradient(circle at 15% 85%, rgba(6, 182, 212, 0.22) 0%, transparent 55%), radial-gradient(ellipse at 50% 50%, rgba(244, 63, 94, 0.12), transparent 70%), linear-gradient(180deg, #08030c 0%, #02060c 100%)",
    patternType: "city",
  },
  "velvet-romance": {
    id: "velvet-romance",
    name: "Velvet Romance",
    category: "Romance",
    description: "Warm romantic atmosphere with floating constellation heart auras",
    previewGradient: "from-rose-950 via-red-950 to-neutral-950",
    backgroundCss: "radial-gradient(circle at 50% 40%, rgba(225, 29, 72, 0.28) 0%, rgba(159, 18, 57, 0.15) 45%, transparent 75%), radial-gradient(circle at 20% 80%, rgba(244, 63, 94, 0.18) 0%, transparent 55%), linear-gradient(180deg, #0f0408 0%, #050103 100%)",
    patternType: "hearts",
  },
  "synthwave-sunset": {
    id: "synthwave-sunset",
    name: "Synthwave Dusk",
    category: "Cyber",
    description: "Retro neon horizon glow with amber sun gradients & violet skies",
    previewGradient: "from-orange-950 via-purple-950 to-pink-950",
    backgroundCss: "radial-gradient(ellipse 100% 60% at 50% 80%, rgba(249, 115, 22, 0.25) 0%, rgba(236, 72, 153, 0.2) 35%, rgba(147, 51, 234, 0.15) 60%, transparent 85%), linear-gradient(180deg, #08020e 0%, #150608 100%)",
    patternType: "synthwave",
  },
  "minimal-carbon": {
    id: "minimal-carbon",
    name: "Stealth Carbon",
    category: "Minimal",
    description: "Ultra-sleek dark carbon weave for pure focus & high visual contrast",
    previewGradient: "from-neutral-900 via-neutral-950 to-black",
    backgroundCss: "radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.04) 0%, transparent 70%), linear-gradient(180deg, #0a0a0d 0%, #030304 100%)",
    patternType: "carbon",
  },
  "amoled-minimal": {
    id: "amoled-minimal",
    name: "AMOLED Infinite Dark",
    category: "Minimal",
    description: "Pure true pitch black background designed to save phone battery and maximize contrast",
    previewGradient: "from-black via-neutral-950 to-black",
    backgroundCss: "radial-gradient(circle at 50% 40%, rgba(56, 189, 248, 0.05) 0%, transparent 60%), linear-gradient(180deg, #000000 0%, #000000 100%)",
    patternType: "amoled",
  },
  "moonlight-lake": {
    id: "moonlight-lake",
    name: "Moonlight Lake",
    category: "Romance",
    description: "Calm nocturnal lake with silver full-moon reflections and serene stillness",
    previewGradient: "from-sky-950 via-indigo-950 to-slate-950",
    backgroundCss: "radial-gradient(circle at 50% 20%, rgba(186, 230, 253, 0.25) 0%, rgba(56, 189, 248, 0.1) 40%, transparent 70%), radial-gradient(ellipse 100% 40% at 50% 90%, rgba(14, 165, 233, 0.15) 0%, transparent 60%), linear-gradient(180deg, #030a16 0%, #010308 100%)",
    patternType: "moon",
  },
  "sunset-drive": {
    id: "sunset-drive",
    name: "Golden Sunset Coast",
    category: "Romance",
    description: "Warm tropical evening sky with glowing gold-crimson horizon glow",
    previewGradient: "from-amber-950 via-orange-950 to-neutral-950",
    backgroundCss: "radial-gradient(ellipse at 50% 80%, rgba(245, 158, 11, 0.28) 0%, rgba(239, 68, 68, 0.18) 40%, rgba(136, 19, 55, 0.1) 70%, transparent 90%), linear-gradient(180deg, #0f0506 0%, #050203 100%)",
    patternType: "drive",
  },
  "anime-bedroom": {
    id: "anime-bedroom",
    name: "Anime Room Lights",
    category: "Cosmic",
    description: "Cozy lo-fi bedroom ambience with warm pastel fairy light sparkles and city window glow",
    previewGradient: "from-purple-900 via-rose-950 to-neutral-950",
    backgroundCss: "radial-gradient(circle at 25% 30%, rgba(192, 132, 252, 0.25) 0%, transparent 45%), radial-gradient(circle at 75% 70%, rgba(244, 114, 182, 0.2) 0%, transparent 50%), linear-gradient(180deg, #0e0514 0%, #050208 100%)",
    patternType: "bedroom",
  },
};
