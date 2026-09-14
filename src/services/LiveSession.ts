import { AssistantState, GirlVoice, ToolAction, VibeTheme, InputLevelData, FileSafetyAssessment, ConnectivityMode, ActiveEngineMode, SendMessageAction, YouTubePlaybackAction, MessagePlatform } from "../types";
import { AudioStreamer } from "./AudioStreamer";
import { offlineEngine } from "../utils/offlineEngine";

export interface LiveSessionListeners {
  onStateChange?: (state: AssistantState) => void;
  onToolAction?: (action: ToolAction) => void;
  onMicMuteChange?: (isMuted: boolean) => void;
  onSpeakWhileMuted?: () => void;
  onVibeChange?: (vibe: VibeTheme) => void;
  onError?: (errorMessage: string) => void;
  onTranscript?: (entry: { role: "user" | "mahi"; text: string }) => void;
  onAssistantTyping?: (isTyping: boolean) => void;
  onInputLevel?: (data: InputLevelData) => void;
  onFileAssessment?: (assessment: FileSafetyAssessment) => void;
  onActiveEngineChange?: (engine: ActiveEngineMode) => void;
  onSendMessage?: (action: SendMessageAction) => void;
  onPlayYouTube?: (action: YouTubePlaybackAction) => void;
}

export class LiveSession {
  private ws: WebSocket | null = null;
  private audioStreamer: AudioStreamer;
  private state: AssistantState = "disconnected";
  private voice: GirlVoice = "Kore";
  private listeners: LiveSessionListeners = {};
  private pendingPrompt: string | null = null;
  private connectivityMode: ConnectivityMode = "auto";
  private activeEngine: ActiveEngineMode = "online";
  private unsubscribeOnlineStatus: (() => void) | null = null;

  constructor(
    voiceOrListeners: GirlVoice | LiveSessionListeners = "Aoede",
    listenersOrVoice: LiveSessionListeners | GirlVoice = {}
  ) {
    if (typeof voiceOrListeners === "string") {
      this.voice = voiceOrListeners as GirlVoice;
      this.listeners = typeof listenersOrVoice === "object" ? listenersOrVoice : {};
    } else if (typeof voiceOrListeners === "object") {
      this.listeners = voiceOrListeners;
      this.voice = typeof listenersOrVoice === "string" ? (listenersOrVoice as GirlVoice) : "Aoede";
    }

    this.audioStreamer = new AudioStreamer();

    // Wire up audio streamer callbacks
    this.audioStreamer.setCallbacks(
      (base64Pcm: string) => {
        this.sendAudioChunk(base64Pcm);
      },
      (isPlaying: boolean) => {
        if (this.state === "disconnected") return;
        if (isPlaying) {
          this.setState("speaking");
        } else {
          this.setState("listening");
        }
      }
    );

    this.audioStreamer.setOnInputLevelCallback((data) => {
      if (this.listeners.onInputLevel) {
        this.listeners.onInputLevel(data);
      }
    });

    this.audioStreamer.setOnSpeakWhileMutedCallback(() => {
      if (this.listeners.onSpeakWhileMuted) {
        this.listeners.onSpeakWhileMuted();
      }
    });
  }

  public setMicSensitivity(threshold: number) {
    this.audioStreamer.setMicSensitivity(threshold);
  }

  public getMicSensitivity(): number {
    return this.audioStreamer.getMicSensitivity();
  }

  public setInputGain(gain: number) {
    this.audioStreamer.setInputGain(gain);
  }

  public getInputGain(): number {
    return this.audioStreamer.getInputGain();
  }

  public setVoicePitch(pitch: number) {
    this.audioStreamer.setVoicePitch(pitch);
  }

  public getVoicePitch(): number {
    return this.audioStreamer.getVoicePitch();
  }

  public toggleMute(): boolean {
    return this.toggleMicMute();
  }

  public setVoice(voice: GirlVoice) {
    this.voice = voice;
    if (this.isConnected()) {
      // Reconnect with the new girl voice
      this.reconnect();
    }
  }

  public setListeners(listeners: LiveSessionListeners) {
    this.listeners = { ...this.listeners, ...listeners };
  }

  public setConnectivityMode(mode: ConnectivityMode) {
    this.connectivityMode = mode;
    if (this.isConnected()) {
      if (mode === "offline" && this.activeEngine === "online") {
        this.disconnect();
        setTimeout(() => {
          this.connectOffline("Switched to Offline Mode — Mahi Local AI is active.");
        }, 150);
      } else if ((mode === "online" || mode === "auto") && this.activeEngine === "offline") {
        this.disconnect();
        setTimeout(() => {
          this.connect();
        }, 150);
      }
    }
  }

  public getConnectivityMode(): ConnectivityMode {
    return this.connectivityMode;
  }

  public getActiveEngine(): ActiveEngineMode {
    return this.activeEngine;
  }

  public getState(): AssistantState {
    return this.state;
  }

  public isConnected(): boolean {
    if (this.state === "disconnected" || this.state === "connecting") return false;
    if (this.activeEngine === "offline") return true;
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  public isMicMuted(): boolean {
    return this.audioStreamer.getIsMuted();
  }

  public toggleMicMute(): boolean {
    const nextMuted = !this.audioStreamer.getIsMuted();
    this.setMicMuted(nextMuted);
    return nextMuted;
  }

  public setMicMuted(muted: boolean) {
    this.audioStreamer.setMuted(muted);
    if (this.activeEngine === "offline") {
      if (muted) {
        offlineEngine.stopListening();
      } else if (this.state === "listening") {
        offlineEngine.startListening({
          onTranscript: (userText: string) => {
            this.sendUserPrompt(userText);
          },
          onError: () => {},
        });
      }
    }
    if (this.listeners.onMicMuteChange) {
      this.listeners.onMicMuteChange(muted);
    }
  }

  public getAudioStreamer(): AudioStreamer {
    return this.audioStreamer;
  }

  public getVisualizerData(type?: "mic" | "output"): {
    volume: number;
    frequencies: number[];
    waveform: number[];
  } {
    if (this.activeEngine === "offline" && this.state === "speaking") {
      return offlineEngine.getVisualizerData();
    }
    const defaultType = this.state === "speaking" ? "output" : "mic";
    return this.audioStreamer.getVisualizerData(type || defaultType);
  }

  /**
   * Connects via Offline Mode (on-device AI + Web Speech)
   */
  public async connectOffline(reasonMessage?: string): Promise<void> {
    this.activeEngine = "offline";
    if (this.listeners.onActiveEngineChange) {
      this.listeners.onActiveEngineChange("offline");
    }

    await this.audioStreamer.unlockAudio();

    // CRITICAL: Stop AudioStreamer getUserMedia capture in offline mode!
    // Multiple active mic streams on mobile devices cause OS audio hardware locks that silence SpeechSynthesis!
    try {
      this.audioStreamer.stopCapture();
      this.audioStreamer.stopPlayback();
    } catch (_) {}

    // Unlock speech synthesis and play wake-up chime
    offlineEngine.unlockSpeech();

    this.setState("listening");

    // Start offline speech recognition for voice capture
    offlineEngine.startListening({
      onTranscript: (userText: string) => {
        this.sendUserPrompt(userText);
      },
      onError: (err) => {
        console.warn("[LiveSession] Offline recognition note:", err);
      },
    });

    if (reasonMessage) {
      if (this.listeners.onTranscript) {
        this.listeners.onTranscript({ role: "mahi", text: reasonMessage });
      }
      setTimeout(() => {
        offlineEngine.speak(reasonMessage, {
          girlVoice: this.voice,
          pitch: this.getVoicePitch(),
          onStart: () => {
            this.setState("speaking");
          },
          onEnd: () => {
            if (this.state !== "disconnected") {
              this.setState("listening");
            }
          },
        });
      }, 300);
    }

    if (this.pendingPrompt) {
      const p = this.pendingPrompt;
      this.pendingPrompt = null;
      setTimeout(() => {
        this.sendUserPrompt(p);
      }, 400);
    }
  }

  /**
   * Connects to the backend WebSocket (Online) or switches to Offline Mode
   */
  public async connect(): Promise<void> {
    if (this.state === "connecting" || this.isConnected()) return;

    // Check if user forced offline or if device is offline
    const isNetworkOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
    if (this.connectivityMode === "offline" || (!isNetworkOnline && this.connectivityMode === "auto")) {
      await this.connectOffline("⚡ Offline Mode Active — Mahi Local AI is ready!");
      return;
    }

    this.setState("connecting");
    this.activeEngine = "online";
    if (this.listeners.onActiveEngineChange) {
      this.listeners.onActiveEngineChange("online");
    }

    try {
      // 1. Ensure audio output context is unlocked so user can hear Mahi right away
      await this.audioStreamer.unlockAudio();

      // 2. Attempt to start microphone capture, but allow session to continue if mic is blocked
      try {
        await this.audioStreamer.startCapture();
      } catch (micErr: any) {
        console.warn("[LiveSession] Mic capture not granted:", micErr?.message || micErr);
        const inIframe = typeof window !== "undefined" && window.self !== window.top;
        const msg = inIframe
          ? "Microphone is blocked in preview iframe. Open the app in a new tab to talk, or use prompts below."
          : "Microphone access was denied. Allow mic access in browser settings to speak.";
        if (this.listeners.onError) {
          this.listeners.onError(msg);
        }
      }

      // 3. Connect WebSocket to server with voice parameter
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/live-ws?voice=${encodeURIComponent(this.voice)}`;

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log("[LiveSession] WebSocket connection established");
      };

      this.ws.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === "ready") {
            console.log("[LiveSession] Gemini Live session is ready");
            this.setState("listening");
            if (this.pendingPrompt) {
              const p = this.pendingPrompt;
              this.pendingPrompt = null;
              setTimeout(() => {
                this.sendUserPrompt(p);
              }, 350);
            }
          } else if (data.type === "audio" && data.audio) {
            // Play response audio (24kHz)
            await this.audioStreamer.playChunk(data.audio);
          } else if (data.type === "interrupted") {
            // Proper interruption handling: stop audio playback immediately
            console.log("[LiveSession] Interrupted: stopping audio immediately");
            this.audioStreamer.stopPlayback();
            this.setState("listening");
          } else if (data.type === "turnComplete") {
            // Model finished turn; if audio is done playing, transition to listening
            if (this.listeners.onAssistantTyping) {
              this.listeners.onAssistantTyping(false);
            }
            if (!this.audioStreamer.isPlaybackActive()) {
              this.setState("listening");
            }
          } else if (data.type === "assistantTyping") {
            if (this.listeners.onAssistantTyping) {
              this.listeners.onAssistantTyping(Boolean(data.isTyping));
            }
          } else if (data.type === "toolCall" && Array.isArray(data.calls)) {
            // Execute browser action directly via toolCall
            this.handleToolCalls(data.calls);
          } else if (data.type === "userTranscript" && data.text) {
            if (this.listeners.onTranscript) {
              this.listeners.onTranscript({ role: "user", text: data.text });
            }
          } else if (data.type === "modelTranscript" && data.text) {
            if (this.listeners.onAssistantTyping) {
              this.listeners.onAssistantTyping(false);
            }
            if (this.listeners.onTranscript) {
              this.listeners.onTranscript({ role: "mahi", text: data.text });
            }
          } else if (data.type === "error") {
            console.warn("[LiveSession] Server error:", data.message);
            if (this.listeners.onError) {
              this.listeners.onError(data.message);
            }
          } else if (data.type === "sessionClosed") {
            console.log("[LiveSession] Backend session closed:", data.reason);
            this.disconnect();
          }
        } catch (err) {
          console.warn("[LiveSession] Error parsing message:", err);
        }
      };

      this.ws.onerror = () => {
        console.warn("[LiveSession] WebSocket connection error");
        if (this.connectivityMode === "auto") {
          console.log("[LiveSession] Auto-falling back to Offline Mode");
          this.connectOffline("⚡ Switched to Mahi Offline AI (server connection unavailable).");
        } else {
          if (this.listeners.onError) {
            this.listeners.onError("Live connection encountered an issue.");
          }
          this.disconnect();
        }
      };

      this.ws.onclose = () => {
        console.log("[LiveSession] WebSocket disconnected");
        if (this.state !== "disconnected" && this.connectivityMode === "auto") {
          this.connectOffline("⚡ Auto-switched to Offline Mode.");
        } else {
          this.disconnect();
        }
      };
    } catch (err: any) {
      console.warn("[LiveSession] Connect failed:", err?.message || err);
      if (this.connectivityMode === "auto") {
        await this.connectOffline("⚡ Switched to Mahi Offline AI.");
      } else {
        if (this.listeners.onError) {
          this.listeners.onError("Could not connect to Mahi Live voice server.");
        }
        this.disconnect();
      }
    }
  }

  /**
   * Attempts to enable or retry microphone permission while call is active
   */
  public async enableMic(): Promise<boolean> {
    try {
      await this.audioStreamer.startCapture();
      if (this.listeners.onError) {
        this.listeners.onError("");
      }
      return true;
    } catch (err: any) {
      console.warn("[LiveSession] Enable mic failed:", err?.message || err);
      return false;
    }
  }

  public isMicCapturing(): boolean {
    return this.audioStreamer.getIsCapturing();
  }

  /**
   * Sends 16kHz PCM audio chunk to backend
   */
  private sendAudioChunk(base64Pcm: string) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    try {
      this.ws.send(
        JSON.stringify({
          type: "audio",
          audio: base64Pcm,
        })
      );
    } catch (_) {}
  }

  /**
   * Sends user prompt text to the session (e.g. for text chat or quick interactive chips).
   * If disconnected, automatically connects and sends once ready.
   */
  public async sendUserPrompt(text: string): Promise<void> {
    const trimmed = text.trim();
    if (!trimmed) return;

    if (this.listeners.onTranscript) {
      this.listeners.onTranscript({ role: "user", text: trimmed });
    }

    if (!this.isConnected()) {
      this.pendingPrompt = trimmed;
      await this.connect();
      return;
    }

    // If in Offline Mode, process through Mahi's local brain and on-device SpeechSynthesis
    if (this.activeEngine === "offline") {
      this.setState("speaking");
      const offlineRes = offlineEngine.processOfflinePrompt(trimmed);

      if (offlineRes.toolAction) {
        this.handleToolCalls([offlineRes.toolAction as any]);
      }

      if (this.listeners.onTranscript) {
        this.listeners.onTranscript({ role: "mahi", text: offlineRes.reply });
      }

      await offlineEngine.speak(offlineRes.reply, {
        girlVoice: this.voice,
        pitch: this.getVoicePitch(),
        onStart: () => {
          this.setState("speaking");
        },
        onEnd: () => {
          if (this.state !== "disconnected") {
            this.setState("listening");
          }
        },
      });
      return;
    }

    try {
      this.ws?.send(
        JSON.stringify({
          type: "userPrompt",
          text: trimmed,
        })
      );
    } catch (_) {}
  }

  public sendPrompt(text: string) {
    this.sendUserPrompt(text);
  }

  /**
   * Interrupts current speech immediately
   */
  public interrupt(): void {
    if (this.activeEngine === "offline") {
      offlineEngine.stopSpeaking();
      offlineEngine.resumeListeningAfterSpeech();
      this.setState("listening");
      return;
    }
    this.audioStreamer.stopPlayback();
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify({ type: "interrupted" }));
      } catch (_) {}
    }
    this.setState("listening");
  }

  private wakeLockSentinel: any = null;

  /**
   * Handles Tool Call execution on the client (Directly opening apps, theme shifts)
   */
  private handleToolCalls(calls: Array<{ id: string; name: string; args: any }>) {
    for (const call of calls) {
      console.log("[LiveSession] Executing tool call directly:", call.name, call.args);

      if (call.name === "openApp" || call.name === "openWebsite") {
        let appName = (call.args?.appName || call.args?.name || "app").toString();
        let url = call.args?.url || "";
        const searchQuery = (call.args?.searchQuery || call.args?.query || "").toString().trim();

        // Standardize app destination URLs
        const lowerName = appName.toLowerCase().trim();
        if (!url) {
          if (lowerName.includes("youtube") || lowerName.includes("yt")) {
            url = searchQuery
              ? `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`
              : "https://www.youtube.com";
            appName = searchQuery ? `YouTube: ${searchQuery}` : "YouTube";
          } else if (lowerName.includes("instagram") || lowerName.includes("insta")) {
            if (searchQuery) {
              const cleanHandle = searchQuery.replace(/^@/, "").trim();
              url = `https://www.instagram.com/${encodeURIComponent(cleanHandle)}/`;
              appName = `Instagram: @${cleanHandle}`;
            } else {
              url = "https://www.instagram.com";
              appName = "Instagram";
            }
          } else if (lowerName.includes("whatsapp")) {
            url = searchQuery
              ? `https://api.whatsapp.com/send?text=${encodeURIComponent(searchQuery)}`
              : "https://web.whatsapp.com";
            appName = "WhatsApp";
          } else if (lowerName.includes("spotify")) {
            url = searchQuery
              ? `https://open.spotify.com/search/${encodeURIComponent(searchQuery)}`
              : "https://open.spotify.com";
            appName = searchQuery ? `Spotify: ${searchQuery}` : "Spotify";
          } else if (lowerName.includes("google")) {
            url = searchQuery
              ? `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`
              : "https://www.google.com";
            appName = searchQuery ? `Google: ${searchQuery}` : "Google";
          } else if (lowerName.includes("twitter") || lowerName.includes("x")) {
            url = searchQuery
              ? `https://x.com/search?q=${encodeURIComponent(searchQuery)}`
              : "https://x.com";
            appName = searchQuery ? `Twitter: ${searchQuery}` : "Twitter (X)";
          } else if (lowerName.includes("facebook") || lowerName.includes("fb")) {
            url = "https://www.facebook.com";
            appName = "Facebook";
          } else if (lowerName.includes("netflix")) {
            url = "https://www.netflix.com";
            appName = "Netflix";
          } else {
            const queryToSearch = searchQuery || appName;
            url = `https://www.google.com/search?q=${encodeURIComponent(queryToSearch)}`;
          }
        } else if (!/^https?:\/\//i.test(url)) {
          url = `https://${url}`;
        }

        // Cleanly launch app directly without triggering intrusive in-app popup modals
        let opened = false;
        try {
          const win = window.open(url, "_blank", "noopener,noreferrer");
          if (win) {
            opened = true;
          }
        } catch (e) {
          console.warn("[LiveSession] Direct window.open blocked:", e);
        }

        if (!opened) {
          try {
            const anchor = document.createElement("a");
            anchor.href = url;
            anchor.target = "_blank";
            anchor.rel = "noopener noreferrer";
            document.body.appendChild(anchor);
            anchor.click();
            setTimeout(() => {
              if (document.body.contains(anchor)) {
                document.body.removeChild(anchor);
              }
            }, 200);
          } catch (err) {
            console.warn("[LiveSession] Anchor click fallback error:", err);
          }
        }

        const action: ToolAction = {
          id: call.id || String(Date.now()),
          name: "openApp",
          args: {
            url,
            name: appName,
          },
          timestamp: Date.now(),
          status: "executed",
        };

        if (this.listeners.onToolAction) {
          this.listeners.onToolAction(action);
        }

        // If YouTube app opened with a search query, also trigger embedded player
        if (lowerName.includes("youtube") || lowerName.includes("yt")) {
          if (searchQuery && this.listeners.onPlayYouTube) {
            this.listeners.onPlayYouTube({
              id: call.id || String(Date.now()),
              query: searchQuery,
              embedUrl: `https://www.youtube-nocookie.com/embed?listType=search&list=${encodeURIComponent(searchQuery)}&autoplay=1`,
              webUrl: url,
              autoPlay: true,
              timestamp: Date.now(),
            });
          }
        }
      } else if (call.name === "sendMessage") {
        const rawPlatform = String(call.args?.platform || "whatsapp").toLowerCase().trim();
        const platform: MessagePlatform =
          rawPlatform.includes("insta")
            ? "instagram"
            : rawPlatform.includes("face") || rawPlatform.includes("fb") || rawPlatform.includes("messenger")
            ? "facebook"
            : "whatsapp";
        const recipient = String(call.args?.recipient || "").trim();
        const message = String(call.args?.message || call.args?.text || "").trim();

        // Build target URL
        let targetUrl = String(call.args?.targetUrl || call.args?.url || "").trim();
        if (!targetUrl) {
          if (platform === "whatsapp") {
            const digits = recipient.replace(/\D/g, "");
            if (digits.length >= 10) {
              targetUrl = `https://api.whatsapp.com/send?phone=${digits}&text=${encodeURIComponent(message)}`;
            } else {
              targetUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
            }
          } else if (platform === "instagram") {
            const cleanHandle = recipient.replace(/^@/, "").trim();
            targetUrl = cleanHandle
              ? `https://ig.me/m/${encodeURIComponent(cleanHandle)}`
              : "https://www.instagram.com/direct/inbox/";
          } else {
            const cleanUser = recipient.trim();
            targetUrl = cleanUser
              ? `https://m.me/${encodeURIComponent(cleanUser)}`
              : "https://www.facebook.com/messages";
          }
        }

        // Auto copy message to clipboard for rapid pasting
        if (message && typeof navigator !== "undefined" && navigator.clipboard) {
          navigator.clipboard.writeText(message).catch(() => {});
        }

        // Direct launch in new tab / app protocol
        try {
          const win = window.open(targetUrl, "_blank", "noopener,noreferrer");
          if (!win) {
            const anchor = document.createElement("a");
            anchor.href = targetUrl;
            anchor.target = "_blank";
            anchor.rel = "noopener noreferrer";
            document.body.appendChild(anchor);
            anchor.click();
            setTimeout(() => {
              if (document.body.contains(anchor)) {
                document.body.removeChild(anchor);
              }
            }, 200);
          }
        } catch (e) {
          console.warn("[LiveSession] sendMessage launch blocked:", e);
        }

        const sendAction: SendMessageAction = {
          id: call.id || String(Date.now()),
          platform,
          recipient: recipient || (platform === "whatsapp" ? "WhatsApp Contact" : "Contact"),
          message,
          targetUrl,
          timestamp: Date.now(),
        };

        if (this.listeners.onSendMessage) {
          this.listeners.onSendMessage(sendAction);
        }

        if (this.listeners.onToolAction) {
          this.listeners.onToolAction({
            id: sendAction.id,
            name: "sendMessage",
            args: {
              platform,
              recipient: sendAction.recipient,
              message,
              targetUrl,
            },
            timestamp: Date.now(),
            status: "executed",
          });
        }
      } else if (call.name === "playYouTube") {
        const query = String(call.args?.query || call.args?.searchQuery || call.args?.title || "").trim();
        const autoPlay = call.args?.autoPlay !== false;
        const embedUrl = String(call.args?.embedUrl || `https://www.youtube-nocookie.com/embed?listType=search&list=${encodeURIComponent(query)}&autoplay=1`);
        const webUrl = String(call.args?.url || `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`);

        // Also launch external YouTube window for full experience if desired
        try {
          window.open(webUrl, "_blank", "noopener,noreferrer");
        } catch (_) {}

        const ytAction: YouTubePlaybackAction = {
          id: call.id || String(Date.now()),
          query: query || "YouTube Music",
          embedUrl,
          webUrl,
          autoPlay,
          timestamp: Date.now(),
        };

        if (this.listeners.onPlayYouTube) {
          this.listeners.onPlayYouTube(ytAction);
        }

        if (this.listeners.onToolAction) {
          this.listeners.onToolAction({
            id: ytAction.id,
            name: "playYouTube",
            args: {
              query: ytAction.query,
              embedUrl,
              webUrl,
            },
            timestamp: Date.now(),
            status: "executed",
          });
        }
      } else if (call.name === "manageScreen") {
        const actionType = (call.args?.action || "wake").toString().toLowerCase();
        if (actionType === "wake" || actionType === "on") {
          try {
            if (typeof navigator !== "undefined" && "wakeLock" in navigator) {
              (navigator as any).wakeLock.request("screen").then((lock: any) => {
                this.wakeLockSentinel = lock;
                console.log("[LiveSession] Screen Wake Lock activated");
              }).catch((e: any) => {
                console.warn("[LiveSession] WakeLock request error:", e);
              });
            }
          } catch (_) {}
        } else if (actionType === "release" || actionType === "off") {
          try {
            if (this.wakeLockSentinel) {
              this.wakeLockSentinel.release();
              this.wakeLockSentinel = null;
              console.log("[LiveSession] Screen Wake Lock released");
            }
          } catch (_) {}
        }

        const action: ToolAction = {
          id: call.id || String(Date.now()),
          name: "manageScreen",
          args: {
            action: actionType,
          },
          timestamp: Date.now(),
          status: "executed",
        };

        if (this.listeners.onToolAction) {
          this.listeners.onToolAction(action);
        }
      } else if (call.name === "assessFileOrDocument") {
        const args = call.args || {};
        const assessment: FileSafetyAssessment = {
          id: call.id || String(Date.now()),
          itemName: String(args.itemName || "Unknown File / Document"),
          itemType: (args.itemType || "document") as any,
          safetyLevel: (args.safetyLevel || "critical") as any,
          verdict: String(args.verdict || "Important File / Document Detected"),
          reason: String(args.reason || "This item contains valuable personal or identity data."),
          recommendation: String(args.recommendation || "Backup to Google Drive or DigiLocker before proceeding."),
          timestamp: Date.now(),
        };

        if (this.listeners.onFileAssessment) {
          this.listeners.onFileAssessment(assessment);
        }

        const action: ToolAction = {
          id: call.id || String(Date.now()),
          name: "assessFileOrDocument",
          args: {
            itemName: assessment.itemName,
            safetyLevel: assessment.safetyLevel,
            verdict: assessment.verdict,
          },
          timestamp: Date.now(),
          status: "executed",
        };

        if (this.listeners.onToolAction) {
          this.listeners.onToolAction(action);
        }
      } else if (call.name === "changeVibe" && call.args?.vibe) {
        const allowedVibes: VibeTheme[] = [
          "neon-pink",
          "cyber-cyan",
          "electric-violet",
          "sunset-amber",
          "matrix-emerald",
          "midnight-rose",
          "cosmic-aurora",
          "royal-gold",
          "sakura-bloom",
          "ocean-abyss",
          "cyberpunk-neon",
        ];
        const requestedVibe = call.args.vibe as VibeTheme;
        if (allowedVibes.includes(requestedVibe)) {
          if (this.listeners.onVibeChange) {
            this.listeners.onVibeChange(requestedVibe);
          }
        }
      } else if (call.name === "saveMemory") {
        const args = call.args || {};
        const action: ToolAction = {
          id: call.id || String(Date.now()),
          name: "saveMemory",
          args: {
            memory: args.memory || args.text || "Memory saved",
            category: args.category || "general",
          },
          timestamp: Date.now(),
          status: "executed",
        };
        if (this.listeners.onToolAction) {
          this.listeners.onToolAction(action);
        }
      }
    }
  }

  public disconnect(): void {
    this.pendingPrompt = null;
    const activeWs = this.ws;
    this.ws = null;

    if (activeWs) {
      try {
        activeWs.onopen = null;
        activeWs.onmessage = null;
        activeWs.onerror = null;
        activeWs.onclose = null;
        if (activeWs.readyState === WebSocket.OPEN) {
          activeWs.send(JSON.stringify({ type: "stop" }));
        }
        activeWs.close();
      } catch (_) {}
    }

    this.audioStreamer.cleanup();
    offlineEngine.stopSpeaking();
    offlineEngine.stopListening();
    this.setState("disconnected");
  }

  public async reconnect(): Promise<void> {
    this.disconnect();
    await new Promise((r) => setTimeout(r, 200));
    await this.connect();
  }

  private setState(newState: AssistantState) {
    if (this.state === newState) return;
    this.state = newState;
    if (this.listeners.onStateChange) {
      this.listeners.onStateChange(newState);
    }
  }
}
