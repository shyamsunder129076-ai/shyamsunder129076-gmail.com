import React, { useState, useEffect, useRef, useCallback } from "react";
import { LiveSession } from "./services/LiveSession";
import {
  AssistantState,
  ToolAction,
  VibeTheme,
  GirlVoice,
  TranscriptEntry,
  InputLevelData,
  FileSafetyAssessment,
  WallpaperId,
  AvatarId,
  ConnectivityMode,
  ActiveEngineMode,
  SendMessageAction,
  YouTubePlaybackAction,
} from "./types";
import { VIBE_THEMES } from "./utils/theme";
import { WALLPAPER_PRESETS } from "./utils/wallpapers";
import { AVATAR_OPTIONS, DEFAULT_AVATAR_ID } from "./utils/avatars";
import { backgroundRunner } from "./utils/backgroundRunner";
import { StatusHeader } from "./components/StatusHeader";
import { MicSettingsPanel } from "./components/MicSettingsPanel";
import { FileGuardianModal } from "./components/FileGuardianModal";
import { ThemeWallpaperModal } from "./components/ThemeWallpaperModal";
import { LockScreenRunnerModal } from "./components/LockScreenRunnerModal";
import { MemoryVaultModal } from "./components/MemoryVaultModal";
import { WallpaperBackdrop } from "./components/WallpaperBackdrop";
import { HolographicVisualizer } from "./components/HolographicVisualizer";
import { CenterPowerButton } from "./components/CenterPowerButton";
import { ToolActionBanner } from "./components/ToolActionBanner";
import { QuickPrompts } from "./components/QuickPrompts";
import { TextInputBar } from "./components/TextInputBar";
import { LiveTelemetryBar } from "./components/LiveTelemetryBar";
import { MutedSpeakReminder } from "./components/MutedSpeakReminder";
import { MessageActionModal } from "./components/MessageActionModal";
import { YouTubePlayerOverlay } from "./components/YouTubePlayerOverlay";
import { LiveChatStream } from "./components/LiveChatStream";
import { offlineEngine } from "./utils/offlineEngine";
import { Sparkles, User, HeartHandshake } from "lucide-react";

export default function App() {
  const [state, setState] = useState<AssistantState>("disconnected");
  const [vibe, setVibe] = useState<VibeTheme>(() => {
    const saved = localStorage.getItem("mahi_vibe_theme") as VibeTheme | null;
    return saved && VIBE_THEMES[saved] ? saved : "neon-pink";
  });
  const [wallpaper, setWallpaper] = useState<WallpaperId>(() => {
    const saved = localStorage.getItem("mahi_wallpaper") as WallpaperId | null;
    return saved && WALLPAPER_PRESETS[saved] ? saved : "hologram-grid";
  });
  const [wallpaperDim, setWallpaperDim] = useState<number>(() => {
    const saved = localStorage.getItem("mahi_wallpaper_dim");
    return saved !== null ? Math.max(5, Math.min(75, Number(saved))) : 25;
  });
  const [isThemeWallpaperModalOpen, setIsThemeWallpaperModalOpen] = useState<boolean>(false);

  // Avatar / Voice Customize Picture States
  const [avatarId, setAvatarId] = useState<AvatarId>(() => {
    const saved = localStorage.getItem("mahi_avatar_id") as AvatarId | null;
    return saved ? saved : DEFAULT_AVATAR_ID;
  });
  const [customAvatarUrl, setCustomAvatarUrl] = useState<string>(() => {
    return localStorage.getItem("mahi_custom_avatar_url") || "";
  });

  // Phone Screen Wake Lock & Lock-Screen Run States
  const [isLockScreenModalOpen, setIsLockScreenModalOpen] = useState<boolean>(false);
  const [isMemoryVaultOpen, setIsMemoryVaultOpen] = useState<boolean>(false);
  const [keepScreenAwake, setKeepScreenAwake] = useState<boolean>(() => {
    return localStorage.getItem("mahi_keep_screen_awake") === "true";
  });
  const [backgroundAudioLock, setBackgroundAudioLock] = useState<boolean>(() => {
    const saved = localStorage.getItem("mahi_background_audio_lock");
    return saved !== null ? saved === "true" : true;
  });

  // Online & Offline Dual Engine Modes
  const [connectivityMode, setConnectivityMode] = useState<ConnectivityMode>(() => {
    const saved = localStorage.getItem("mahi_connectivity_mode") as ConnectivityMode | null;
    return saved === "online" || saved === "offline" || saved === "auto" ? saved : "auto";
  });
  const [activeEngine, setActiveEngine] = useState<ActiveEngineMode>("online");

  const [voice, setVoice] = useState<GirlVoice>(() => {
    const saved = localStorage.getItem("mahi_voice") as GirlVoice | null;
    return saved === "Aoede" || saved === "Kore" ? saved : "Kore";
  });
  const [isMuted, setIsMuted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<ToolAction | null>(null);
  const [transcript, setTranscript] = useState<TranscriptEntry | null>(null);

  // Live Back-and-Forth Chat Conversation & Real-Time Typing States
  const [conversation, setConversation] = useState<TranscriptEntry[]>([
    {
      id: "welcome-1",
      role: "mahi",
      text: "Hii baby! ❤️ Main Mahi hu tumhari girlfriend. Kaisa chal raha hai tumhara din? Mujhse baatein karo na!",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "delivered",
    },
  ]);
  const [isUserTyping, setIsUserTyping] = useState<boolean>(false);
  const [isMahiTyping, setIsMahiTyping] = useState<boolean>(false);
  const [isDirectMessageModalOpen, setIsDirectMessageModalOpen] = useState<boolean>(false);

  // Microphone sensitivity threshold (0-100) & Input Gain (0.5-2.5) & Voice Pitch (0.8-1.3)
  const [sensitivityThreshold, setSensitivityThreshold] = useState<number>(() => {
    const saved = localStorage.getItem("mahi_mic_sensitivity");
    return saved !== null ? Math.max(0, Math.min(100, Number(saved))) : 20;
  });
  const [inputGain, setInputGain] = useState<number>(() => {
    const saved = localStorage.getItem("mahi_input_gain");
    return saved !== null ? Math.max(0.5, Math.min(2.5, Number(saved))) : 1.0;
  });
  const [voicePitch, setVoicePitch] = useState<number>(() => {
    const saved = localStorage.getItem("mahi_voice_pitch");
    return saved !== null ? Math.max(0.75, Math.min(1.35, Number(saved))) : 1.08;
  });
  const [isMicSettingsOpen, setIsMicSettingsOpen] = useState<boolean>(false);
  const [liveLevelData, setLiveLevelData] = useState<InputLevelData | null>(null);

  // Muted speech reminder pulse state
  const [isMutedSpeaking, setIsMutedSpeaking] = useState<boolean>(false);
  const mutedAlertTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // File & Document Deletion Protection Guardian State
  const [activeFileAssessment, setActiveFileAssessment] = useState<FileSafetyAssessment | null>(null);
  const [isFileGuardianOpen, setIsFileGuardianOpen] = useState<boolean>(false);

  // Social Messaging & Direct YouTube Playback States
  const [activeMessageAction, setActiveMessageAction] = useState<SendMessageAction | null>(null);
  const [activeYouTubeVideo, setActiveYouTubeVideo] = useState<YouTubePlaybackAction | null>(null);

  const sessionRef = useRef<LiveSession | null>(null);

  // Initialize LiveSession
  useEffect(() => {
    const session = new LiveSession(
      voice,
      {
        onStateChange: (newState) => {
          setState(newState);
        },
        onToolAction: (action) => {
          setLastAction(action);
        },
        onTranscript: (entry) => {
          const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          setTranscript({
            role: entry.role,
            text: entry.text,
            time: timestamp,
          });

          if (entry.role === "user") {
            setIsMahiTyping(true);
            setConversation((prev) => {
              const last = prev[prev.length - 1];
              if (last && last.role === "user" && last.text === entry.text) {
                return prev;
              }
              return [
                ...prev,
                {
                  id: "user-" + Date.now(),
                  role: "user",
                  text: entry.text,
                  time: timestamp,
                  status: "sent",
                },
              ];
            });
          } else {
            setIsMahiTyping(false);
            setConversation((prev) => {
              const last = prev[prev.length - 1];
              if (last && last.role === "mahi") {
                if (last.text === entry.text) return prev;
                return [
                  ...prev.slice(0, -1),
                  {
                    ...last,
                    text: entry.text.startsWith(last.text) ? entry.text : `${last.text} ${entry.text}`,
                  },
                ];
              }
              return [
                ...prev,
                {
                  id: "mahi-" + Date.now(),
                  role: "mahi",
                  text: entry.text,
                  time: timestamp,
                  status: "delivered",
                },
              ];
            });
          }
        },
        onAssistantTyping: (isTyping) => {
          setIsMahiTyping(isTyping);
        },
        onVibeChange: (newVibe) => {
          setVibe(newVibe);
          try {
            localStorage.setItem("mahi_vibe_theme", newVibe);
          } catch (_) {}
        },
        onError: (err) => {
          setErrorMessage(err);
        },
        onMicMuteChange: (muted) => {
          setIsMuted(muted);
          if (!muted) {
            setIsMutedSpeaking(false);
            if (mutedAlertTimeoutRef.current) {
              clearTimeout(mutedAlertTimeoutRef.current);
            }
          }
        },
        onSpeakWhileMuted: () => {
          setIsMutedSpeaking(true);
          if (mutedAlertTimeoutRef.current) {
            clearTimeout(mutedAlertTimeoutRef.current);
          }
          mutedAlertTimeoutRef.current = setTimeout(() => {
            setIsMutedSpeaking(false);
          }, 2800);
        },
        onInputLevel: (data) => {
          setLiveLevelData(data);
        },
        onFileAssessment: (assessment) => {
          setActiveFileAssessment(assessment);
          setIsFileGuardianOpen(true);
        },
        onActiveEngineChange: (engine) => {
          setActiveEngine(engine);
        },
        onSendMessage: (action) => {
          setActiveMessageAction(action);
        },
        onPlayYouTube: (video) => {
          setActiveYouTubeVideo(video);
        },
      }
    );

    session.setConnectivityMode(connectivityMode);
    session.setMicSensitivity(sensitivityThreshold);
    session.setInputGain(inputGain);
    session.setVoicePitch(voicePitch);

    sessionRef.current = session;

    return () => {
      if (mutedAlertTimeoutRef.current) {
        clearTimeout(mutedAlertTimeoutRef.current);
      }
      session.disconnect();
    };
  }, []);

  // Keyboard shortcut listener: 'm' or 'M' to toggle mic
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        if (sessionRef.current) {
          sessionRef.current.toggleMute();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Auto-dismiss action banner after 8 seconds
  useEffect(() => {
    if (!lastAction) return;
    const timer = setTimeout(() => {
      setLastAction(null);
    }, 8000);
    return () => clearTimeout(timer);
  }, [lastAction]);

  const handleToggleConnect = useCallback(() => {
    if (!sessionRef.current) return;
    setErrorMessage(null);
    offlineEngine.unlockSpeech();
    sessionRef.current.getAudioStreamer().unlockAudio();

    if (state === "disconnected") {
      sessionRef.current.connect().catch((err) => {
        console.warn("[App] Connect catch:", err?.message || err);
      });
    } else {
      sessionRef.current.disconnect();
    }
  }, [state]);

  const handleRetryMic = useCallback(async () => {
    if (!sessionRef.current) return;
    setErrorMessage(null);
    offlineEngine.unlockSpeech();
    const success = await sessionRef.current.enableMic();
    if (!success) {
      const inIframe = typeof window !== "undefined" && window.self !== window.top;
      setErrorMessage(
        inIframe
          ? "Microphone access blocked in preview iframe. Click 'Open in Tab' to allow your mic."
          : "Microphone permission denied. Please allow microphone access in browser settings."
      );
    }
  }, []);

  const handleSendTextMessage = useCallback((text: string) => {
    if (!text.trim()) return;
    const trimmed = text.trim();

    offlineEngine.unlockSpeech();

    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg: TranscriptEntry = {
      id: "user-" + Date.now(),
      role: "user",
      text: trimmed,
      time: timestamp,
      status: "sent",
    };

    setConversation((prev) => [...prev, userMsg]);
    setIsUserTyping(false);
    setIsMahiTyping(true);

    setTranscript({
      role: "user",
      text: trimmed,
      time: timestamp,
    });

    // Check if user is asking to send a message on WhatsApp / Instagram / Facebook
    const lower = trimmed.toLowerCase();
    const isMsgIntent =
      lower.includes("whatsapp") ||
      lower.includes("instagram") ||
      lower.includes("insta") ||
      lower.includes("facebook") ||
      lower.includes("massage send") ||
      lower.includes("message send") ||
      lower.includes("message bhejo") ||
      lower.includes("massage bhejo") ||
      lower.includes("dm bhejo");

    if (isMsgIntent) {
      const platform: "whatsapp" | "instagram" | "facebook" =
        lower.includes("instagram") || lower.includes("insta")
          ? "instagram"
          : lower.includes("facebook")
          ? "facebook"
          : "whatsapp";

      const recipientMatch = trimmed.match(/(?:par|pe|to)?\s*([a-zA-Z0-9_+]+)?\s*(?:ko)?\s*(?:message|massage|bolo|bhejo|dm)?[:\s]*(.*)/i);
      const recipient = (recipientMatch?.[1] || "Contact").trim();
      const cleanMessage = (recipientMatch?.[2] || trimmed).replace(/^(message|massage|bolo|bhejo)[:\s]*/i, "").trim() || trimmed;

      const action: SendMessageAction = {
        id: "msg-" + Date.now(),
        platform,
        recipient,
        message: cleanMessage,
        targetUrl:
          platform === "whatsapp"
            ? `https://api.whatsapp.com/send?text=${encodeURIComponent(cleanMessage)}`
            : platform === "instagram"
            ? "https://www.instagram.com/direct/inbox/"
            : "https://www.facebook.com/messages",
        timestamp: Date.now(),
      };
      setActiveMessageAction(action);
    }

    if (sessionRef.current) {
      sessionRef.current.getAudioStreamer().unlockAudio();
      sessionRef.current.sendUserPrompt(trimmed);
    }
  }, []);

  const handleSelectPrompt = useCallback((promptText: string) => {
    handleSendTextMessage(promptText);
  }, [handleSendTextMessage]);

  const handleToggleMute = useCallback(() => {
    if (!sessionRef.current) return;
    const nextMuted = sessionRef.current.toggleMute();
    if (!nextMuted) {
      setIsMutedSpeaking(false);
      if (mutedAlertTimeoutRef.current) {
        clearTimeout(mutedAlertTimeoutRef.current);
      }
    }
  }, []);

  const handleUnmute = useCallback(() => {
    if (!sessionRef.current) return;
    sessionRef.current.setMicMuted(false);
    setIsMuted(false);
    setIsMutedSpeaking(false);
    if (mutedAlertTimeoutRef.current) {
      clearTimeout(mutedAlertTimeoutRef.current);
    }
  }, []);

  const handleSensitivityChange = useCallback((newVal: number) => {
    setSensitivityThreshold(newVal);
    sessionRef.current?.setMicSensitivity(newVal);
    localStorage.setItem("mahi_mic_sensitivity", String(newVal));
  }, []);

  const handleInputGainChange = useCallback((newVal: number) => {
    setInputGain(newVal);
    sessionRef.current?.setInputGain(newVal);
    localStorage.setItem("mahi_input_gain", String(newVal));
  }, []);

  const handleVoicePitchChange = useCallback((newPitch: number) => {
    setVoicePitch(newPitch);
    sessionRef.current?.setVoicePitch(newPitch);
    localStorage.setItem("mahi_voice_pitch", String(newPitch));
  }, []);

  const handleResetDefaults = useCallback(() => {
    setSensitivityThreshold(20);
    setInputGain(1.0);
    setVoicePitch(1.0);
    sessionRef.current?.setMicSensitivity(20);
    sessionRef.current?.setInputGain(1.0);
    sessionRef.current?.setVoicePitch(1.0);
    localStorage.setItem("mahi_mic_sensitivity", "20");
    localStorage.setItem("mahi_input_gain", "1.0");
    localStorage.setItem("mahi_voice_pitch", "1.0");
  }, []);

  const handleSelectVoice = useCallback(
    (newVoice: GirlVoice) => {
      setVoice(newVoice);
      if (sessionRef.current) {
        sessionRef.current.setVoice(newVoice);
        // If currently live, reconnect seamlessly to switch the voice on Gemini Live
        if (state === "listening" || state === "speaking") {
          sessionRef.current.disconnect();
          setTimeout(() => {
            sessionRef.current?.connect();
          }, 300);
        }
      }
    },
    [state]
  );

  const handleSelectConnectivityMode = useCallback((newMode: ConnectivityMode) => {
    setConnectivityMode(newMode);
    try {
      localStorage.setItem("mahi_connectivity_mode", newMode);
    } catch (_) {}
    if (sessionRef.current) {
      sessionRef.current.setConnectivityMode(newMode);
      setActiveEngine(sessionRef.current.getActiveEngine());
    }
  }, []);

  const handleInterrupt = useCallback(() => {
    if (state === "disconnected") {
      handleToggleConnect();
      return;
    }
    if (!sessionRef.current) return;
    sessionRef.current.interrupt();
    setState("listening");
  }, [state, handleToggleConnect]);

  const handleSelectVibe = useCallback((newVibe: VibeTheme) => {
    setVibe(newVibe);
    try {
      localStorage.setItem("mahi_vibe_theme", newVibe);
    } catch (_) {}
  }, []);

  const handleSelectWallpaper = useCallback((newWallpaper: WallpaperId) => {
    setWallpaper(newWallpaper);
    try {
      localStorage.setItem("mahi_wallpaper", newWallpaper);
    } catch (_) {}
  }, []);

  const handleDimLevelChange = useCallback((level: number) => {
    setWallpaperDim(level);
    try {
      localStorage.setItem("mahi_wallpaper_dim", String(level));
    } catch (_) {}
  }, []);

  const handleResetThemeDefaults = useCallback(() => {
    handleSelectVibe("neon-pink");
    handleSelectWallpaper("hologram-grid");
    handleDimLevelChange(25);
  }, [handleSelectVibe, handleSelectWallpaper, handleDimLevelChange]);

  const handleSelectAvatar = useCallback((newAvatarId: AvatarId) => {
    setAvatarId(newAvatarId);
    try {
      localStorage.setItem("mahi_avatar_id", newAvatarId);
    } catch (_) {}
  }, []);

  const handleSetCustomAvatarUrl = useCallback((url: string) => {
    setCustomAvatarUrl(url);
    try {
      localStorage.setItem("mahi_custom_avatar_url", url);
    } catch (_) {}
  }, []);

  const handleToggleKeepScreenAwake = useCallback(() => {
    setKeepScreenAwake((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("mahi_keep_screen_awake", String(next));
      } catch (_) {}
      return next;
    });
  }, []);

  const handleToggleBackgroundAudioLock = useCallback(() => {
    setBackgroundAudioLock((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("mahi_background_audio_lock", String(next));
      } catch (_) {}
      return next;
    });
  }, []);

  // Compute active avatar photo URL & style label
  const activeAvatarUrl =
    avatarId === "custom" && customAvatarUrl.trim()
      ? customAvatarUrl.trim()
      : AVATAR_OPTIONS[avatarId as keyof typeof AVATAR_OPTIONS]?.imageUrl ||
        AVATAR_OPTIONS["sweet-casual"].imageUrl;
  const activeAvatarName =
    avatarId === "custom"
      ? "Custom Mahi"
      : AVATAR_OPTIONS[avatarId as keyof typeof AVATAR_OPTIONS]?.name || "Mahi";

  // Phone Screen Wake Lock Sync
  useEffect(() => {
    const isConnected = state === "listening" || state === "speaking";
    if (keepScreenAwake && isConnected) {
      backgroundRunner.acquireWakeLock();
    } else {
      backgroundRunner.releaseWakeLock();
    }
  }, [keepScreenAwake, state]);

  // Phone Lock-Screen Background Audio & MediaSession Sync
  useEffect(() => {
    const isConnected = state === "listening" || state === "speaking";
    if (isConnected && backgroundAudioLock) {
      backgroundRunner.startBackgroundAudioKeepAlive();
      backgroundRunner.updateMediaSession({
        title: `Mahi — ${state === "speaking" ? "Speaking..." : "Listening..."}`,
        artist: `Your Girlfriend (${voice} Voice)`,
        avatarUrl: activeAvatarUrl,
        isPlaying: true,
        onTogglePlay: () => {
          if (sessionRef.current) {
            sessionRef.current.toggleMute();
          }
        },
        onStop: () => {
          sessionRef.current?.disconnect();
        },
      });
    } else {
      backgroundRunner.stopBackgroundAudioKeepAlive();
      backgroundRunner.clearMediaSession();
    }
  }, [state, backgroundAudioLock, voice, activeAvatarUrl]);

  const getVisualizerData = useCallback(() => {
    if (!sessionRef.current) {
      return { volume: 0, frequencies: new Array(16).fill(0), waveform: new Array(32).fill(0) };
    }
    return sessionRef.current.getVisualizerData();
  }, []);

  const currentTheme = VIBE_THEMES[vibe];

  return (
    <div
      id="mahi-assistant-app"
      className="relative w-full h-screen min-h-[600px] overflow-hidden bg-neutral-950 text-neutral-100 flex flex-col justify-between font-['Plus_Jakarta_Sans',sans-serif] select-none"
    >
      {/* Dynamic Animated Wallpaper & Atmospheric Backdrop */}
      <WallpaperBackdrop
        wallpaper={wallpaper}
        theme={currentTheme}
        dimLevel={wallpaperDim}
      />

      {/* Top Header with Voice Selection, Vibe Theme, Online/Offline & Info */}
      <StatusHeader
        state={state}
        theme={currentTheme}
        currentVibe={vibe}
        currentWallpaper={wallpaper}
        selectedVoice={voice}
        connectivityMode={connectivityMode}
        activeEngine={activeEngine}
        onSelectVibe={handleSelectVibe}
        onSelectVoice={handleSelectVoice}
        onSelectConnectivityMode={handleSelectConnectivityMode}
        onOpenMicSettings={() => setIsMicSettingsOpen((prev) => !prev)}
        onOpenThemeWallpaperModal={() => setIsThemeWallpaperModalOpen(true)}
        onOpenLockScreenModal={() => setIsLockScreenModalOpen(true)}
        onOpenMemoryVault={() => setIsMemoryVaultOpen(true)}
      />

      {/* Real-time Action Feedback Toast (Auto-dismisses in 2.5s) */}
      <ToolActionBanner
        action={lastAction}
        theme={currentTheme}
        onDismiss={() => setLastAction(null)}
      />

      {/* Microphone Sensitivity & Noise Gate Tuning Settings Panel */}
      <MicSettingsPanel
        isOpen={isMicSettingsOpen}
        onClose={() => setIsMicSettingsOpen(false)}
        state={state}
        theme={currentTheme}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        sensitivityThreshold={sensitivityThreshold}
        onSensitivityChange={handleSensitivityChange}
        inputGain={inputGain}
        onInputGainChange={handleInputGainChange}
        voicePitch={voicePitch}
        onVoicePitchChange={handleVoicePitchChange}
        liveLevelData={liveLevelData}
        onResetDefaults={handleResetDefaults}
      />

      {/* File & Document Deletion Protection Guardian Modal */}
      <FileGuardianModal
        isOpen={isFileGuardianOpen}
        onClose={() => setIsFileGuardianOpen(false)}
        state={state}
        theme={currentTheme}
        activeAssessment={activeFileAssessment}
        onClearAssessment={() => setActiveFileAssessment(null)}
        onAskMahiAboutFile={(text) => {
          if (sessionRef.current && (state === "listening" || state === "speaking")) {
            sessionRef.current.sendUserPrompt(text);
          }
        }}
      />

      {/* Phone Screen & Lock-Screen Audio Runner Modal */}
      <LockScreenRunnerModal
        isOpen={isLockScreenModalOpen}
        onClose={() => setIsLockScreenModalOpen(false)}
        theme={currentTheme}
        keepScreenAwake={keepScreenAwake}
        backgroundAudioLock={backgroundAudioLock}
        onToggleKeepScreenAwake={handleToggleKeepScreenAwake}
        onToggleBackgroundAudioLock={handleToggleBackgroundAudioLock}
      />

      {/* Main Center Area: Holographic Visualizer */}
      <main className="relative flex-1 flex flex-col items-center justify-center w-full max-w-xl mx-auto px-4 z-10">
        <HolographicVisualizer
          state={state}
          theme={currentTheme}
          getVisualizerData={getVisualizerData}
          avatarUrl={activeAvatarUrl}
          avatarName={activeAvatarName}
          onOpenAvatarCustomizer={() => setIsThemeWallpaperModalOpen(true)}
        />

        {/* Live Subtitle / Voice Recognition & Text Response Indicator */}
        {transcript && (
          <div className="w-full max-w-md px-3 my-1">
            <div
              className={`p-2.5 rounded-2xl border text-xs flex items-center gap-2.5 shadow-lg backdrop-blur-xl transition-all ${
                transcript.role === "user"
                  ? "bg-neutral-900/90 border-neutral-700 text-neutral-200"
                  : "bg-pink-950/40 border-pink-500/40 text-pink-200"
              }`}
            >
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                style={{
                  backgroundColor:
                    transcript.role === "user" ? "#3b82f620" : currentTheme.primaryHex + "30",
                  color: transcript.role === "user" ? "#60a5fa" : currentTheme.primaryHex,
                }}
              >
                {transcript.role === "user" ? (
                  <User className="w-3.5 h-3.5" />
                ) : (
                  <HeartHandshake className="w-3.5 h-3.5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                    {transcript.role === "user" ? "You" : "Mahi"}
                  </span>
                  {transcript.time && (
                    <span className="text-[9px] text-neutral-500">{transcript.time}</span>
                  )}
                </div>
                <p className="text-xs font-medium line-clamp-2 break-words mt-0.5">&quot;{transcript.text}&quot;</p>
              </div>
            </div>
          </div>
        )}

        {/* Live Audio Telemetry, Prompts & Text Typing */}
        <div className="w-full flex flex-col items-center mt-1 gap-1.5 z-20">
          <LiveTelemetryBar
            state={state}
            theme={currentTheme}
            isMuted={isMuted}
            isMicActive={sessionRef.current?.isMicCapturing() ?? false}
            errorMessage={errorMessage}
            onClearError={() => setErrorMessage(null)}
            onRetryMic={handleRetryMic}
          />

          <QuickPrompts
            state={state}
            theme={currentTheme}
            onSelectPrompt={handleSelectPrompt}
          />

          {/* Text Typing Input Option */}
          <TextInputBar
            state={state}
            theme={currentTheme}
            onSendMessage={handleSendTextMessage}
          />
        </div>
      </main>

      {/* Central Mic & Power Action Hub with Dedicated Mic ON/OFF Toggle */}
      <CenterPowerButton
        state={state}
        theme={currentTheme}
        isMuted={isMuted}
        isMutedSpeaking={isMutedSpeaking}
        onToggleConnect={handleToggleConnect}
        onToggleMute={handleToggleMute}
        onInterrupt={handleInterrupt}
      />

      {/* Subtle Screen-Edge Glow & Haptic Visual Pulse when Speaking while Muted */}
      <MutedSpeakReminder
        visible={isMutedSpeaking}
        onUnmute={handleUnmute}
      />

      {/* Comprehensive Themes & Wallpapers Customization Modal */}
      <ThemeWallpaperModal
        isOpen={isThemeWallpaperModalOpen}
        onClose={() => setIsThemeWallpaperModalOpen(false)}
        currentTheme={currentTheme}
        currentVibe={vibe}
        currentWallpaper={wallpaper}
        dimLevel={wallpaperDim}
        currentAvatarId={avatarId}
        customAvatarUrl={customAvatarUrl}
        onSelectVibe={handleSelectVibe}
        onSelectWallpaper={handleSelectWallpaper}
        onDimLevelChange={handleDimLevelChange}
        onSelectAvatar={handleSelectAvatar}
        onSetCustomAvatarUrl={handleSetCustomAvatarUrl}
        onResetDefaults={handleResetThemeDefaults}
      />

      {/* Mahi Memory Vault Modal (A-Z Conversations & Facts) */}
      <MemoryVaultModal
        isOpen={isMemoryVaultOpen}
        onClose={() => setIsMemoryVaultOpen(false)}
        theme={currentTheme}
      />

      {/* Outgoing Message Dispatch Modal for WhatsApp, Instagram, Facebook */}
      <MessageActionModal
        action={activeMessageAction}
        theme={currentTheme}
        onDismiss={() => setActiveMessageAction(null)}
      />

      {/* Floating & Docked In-App YouTube Audio/Video Player */}
      <YouTubePlayerOverlay
        video={activeYouTubeVideo}
        theme={currentTheme}
        onClose={() => setActiveYouTubeVideo(null)}
      />
    </div>
  );
}
