export type AssistantState =
  | "disconnected"
  | "connecting"
  | "listening"
  | "speaking";

export type ConnectivityMode = "auto" | "online" | "offline";
export type ActiveEngineMode = "online" | "offline";

export type GirlVoice = "Aoede" | "Kore";

export interface VoiceOption {
  id: GirlVoice;
  name: string;
  tagline: string;
  tone: string;
}

export type VibeTheme =
  | "neon-pink"
  | "cyber-cyan"
  | "electric-violet"
  | "sunset-amber"
  | "matrix-emerald"
  | "midnight-rose"
  | "cosmic-aurora"
  | "royal-gold"
  | "sakura-bloom"
  | "ocean-abyss"
  | "cyberpunk-neon"
  | "amoled-pure"
  | "lavender-dream"
  | "crimson-dragon"
  | "moonlight-waterfall";

export type WallpaperId =
  | "hologram-grid"
  | "stardust-galaxy"
  | "sakura-night"
  | "aurora-borealis"
  | "cyberpunk-city"
  | "velvet-romance"
  | "synthwave-sunset"
  | "minimal-carbon"
  | "amoled-minimal"
  | "moonlight-lake"
  | "sunset-drive"
  | "anime-bedroom";

export interface WallpaperConfig {
  id: WallpaperId;
  name: string;
  category: "Romance" | "Cyber" | "Cosmic" | "Minimal";
  description: string;
  previewGradient: string;
}

export type AvatarId =
  | "sweet-casual"
  | "cyber-neon"
  | "elegant-saree"
  | "anime-cozy"
  | "custom";

export interface AvatarOption {
  id: AvatarId;
  name: string;
  tagline: string;
  imageUrl: string;
  style: string;
}

export interface LockScreenRunnerSettings {
  keepScreenAwake: boolean;
  backgroundAudioLock: boolean;
  mediaSessionEnabled: boolean;
}

export interface ToolAction {
  id: string;
  name: string;
  args: Record<string, any>;
  timestamp: number;
  status: "executed" | "pending";
}

export interface AudioVisualizerData {
  volume: number;
  frequencies: number[];
  waveform: number[];
}

export interface TranscriptEntry {
  id?: string;
  role: "user" | "mahi";
  text: string;
  time: string;
  status?: "sending" | "sent" | "delivered";
}

export interface MicSettings {
  sensitivityThreshold: number; // 0 to 100
  inputGain: number; // 0.5 to 3.0
}

export interface InputLevelData {
  rms: number;
  peak: number;
  isVoiceActive: boolean;
  thresholdCutoff: number;
  thresholdPercent: number;
}

export type FileSafetyLevel = "critical" | "important" | "safe";

export interface FileSafetyAssessment {
  id: string;
  itemName: string;
  itemType: "document" | "profile" | "media" | "system" | "cache";
  safetyLevel: FileSafetyLevel;
  verdict: string;
  reason: string;
  recommendation: string;
  timestamp: number;
}

export type MessagePlatform = "whatsapp" | "instagram" | "facebook";

export interface SendMessageAction {
  id: string;
  platform: MessagePlatform;
  recipient: string;
  message: string;
  targetUrl: string;
  timestamp: number;
}

export interface YouTubePlaybackAction {
  id: string;
  query: string;
  embedUrl: string;
  webUrl: string;
  autoPlay: boolean;
  timestamp: number;
}

export interface MahiMemory {
  id?: string | number;
  created_at?: string;
  category: "fact" | "preference" | "promise" | "work" | "secret" | "moment" | "general" | "conversation_log" | "topic" | "emotion";
  memory: string;
  importance?: number;
}
