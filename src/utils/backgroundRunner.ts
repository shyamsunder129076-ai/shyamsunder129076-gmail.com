/**
 * Background & Lock-Screen Audio Runner and Screen Wake Lock Manager
 * Ensures real-time voice session continues running even when the phone screen is locked or in the background.
 */

class BackgroundRunnerManager {
  private wakeLock: any = null;
  private silentAudio: HTMLAudioElement | null = null;
  private isWakeLockRequested = false;
  private isBackgroundAudioActive = false;

  constructor() {
    if (typeof window !== "undefined") {
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible" && this.isWakeLockRequested) {
          this.acquireWakeLock();
        }
      });
    }
  }

  /**
   * Request Screen Wake Lock to prevent the screen from dimming/sleeping
   */
  public async acquireWakeLock(): Promise<boolean> {
    if (typeof window === "undefined" || !("wakeLock" in navigator)) {
      return false;
    }
    try {
      this.isWakeLockRequested = true;
      this.wakeLock = await (navigator as any).wakeLock.request("screen");
      this.wakeLock.addEventListener("release", () => {
        this.wakeLock = null;
      });
      return true;
    } catch (err) {
      console.warn("Screen Wake Lock could not be acquired:", err);
      return false;
    }
  }

  /**
   * Release Screen Wake Lock
   */
  public async releaseWakeLock(): Promise<void> {
    this.isWakeLockRequested = false;
    if (this.wakeLock) {
      try {
        await this.wakeLock.release();
      } catch (_) {}
      this.wakeLock = null;
    }
  }

  /**
   * Start silent background audio carrier to prevent mobile browsers (Android/iOS)
   * from killing the WebSocket and WebAudio stream when the phone screen is locked.
   */
  public startBackgroundAudioKeepAlive(): void {
    if (typeof window === "undefined" || this.isBackgroundAudioActive) return;

    try {
      if (!this.silentAudio) {
        // Minimal 1-second silent WAV loop
        const silentWavBase64 =
          "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";
        this.silentAudio = new Audio(silentWavBase64);
        this.silentAudio.loop = true;
        this.silentAudio.volume = 0.01; // extremely low carrier volume
      }

      this.silentAudio
        .play()
        .then(() => {
          this.isBackgroundAudioActive = true;
        })
        .catch(() => {
          // Will succeed upon next user tap
        });
    } catch (e) {
      console.warn("Background audio keep-alive init warning:", e);
    }
  }

  /**
   * Stop silent background audio carrier
   */
  public stopBackgroundAudioKeepAlive(): void {
    if (this.silentAudio) {
      try {
        this.silentAudio.pause();
      } catch (_) {}
      this.isBackgroundAudioActive = false;
    }
  }

  /**
   * Register or update Lock-Screen MediaSession metadata and controls
   */
  public updateMediaSession(params: {
    title: string;
    artist: string;
    avatarUrl: string;
    isPlaying: boolean;
    onTogglePlay?: () => void;
    onStop?: () => void;
  }): void {
    if (typeof window === "undefined" || !("mediaSession" in navigator)) return;

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: params.title,
        artist: params.artist,
        album: "Mahi Live Voice Companion",
        artwork: [
          { src: params.avatarUrl, sizes: "192x192", type: "image/jpeg" },
          { src: params.avatarUrl, sizes: "512x512", type: "image/jpeg" },
        ],
      });

      navigator.mediaSession.playbackState = params.isPlaying ? "playing" : "paused";

      if (params.onTogglePlay) {
        navigator.mediaSession.setActionHandler("play", () => {
          params.onTogglePlay?.();
          navigator.mediaSession.playbackState = "playing";
        });
        navigator.mediaSession.setActionHandler("pause", () => {
          params.onTogglePlay?.();
          navigator.mediaSession.playbackState = "paused";
        });
      }

      if (params.onStop) {
        navigator.mediaSession.setActionHandler("stop", () => {
          params.onStop?.();
          navigator.mediaSession.playbackState = "none";
        });
      }
    } catch (err) {
      console.warn("MediaSession update error:", err);
    }
  }

  /**
   * Reset MediaSession when session ends
   */
  public clearMediaSession(): void {
    if (typeof window === "undefined" || !("mediaSession" in navigator)) return;
    try {
      navigator.mediaSession.playbackState = "none";
      navigator.mediaSession.metadata = null;
    } catch (_) {}
  }
}

export const backgroundRunner = new BackgroundRunnerManager();
