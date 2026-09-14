/**
 * AudioStreamer
 * Handles mic capture at native hardware rate and downsamples to 16kHz PCM16,
 * and handles response playback at 24kHz PCM16 via Web Audio API.
 */

import { InputLevelData } from "../types";

export class AudioStreamer {
  private inputAudioCtx: AudioContext | null = null;
  private outputAudioCtx: AudioContext | null = null;
  private micStream: MediaStream | null = null;
  private micSource: MediaStreamAudioSourceNode | null = null;
  private processor: ScriptProcessorNode | null = null;
  private silentGain: GainNode | null = null;
  private inputAnalyser: AnalyserNode | null = null;
  private outputAnalyser: AnalyserNode | null = null;

  private nextStartTime: number = 0;
  private activeSources: Set<AudioBufferSourceNode> = new Set();
  private isCapturing: boolean = false;
  private isMuted: boolean = false;

  // Microphone sensitivity threshold (0-100) and input gain (0.5-3.0)
  private micSensitivityThreshold: number = 20;
  private inputGain: number = 1.0;
  private voicePitch: number = 1.08; // Voice pitch tuning multiplier for sweet romantic melodic singing tone
  private lastVoiceDetectedTime: number = 0;
  private lastLevelEmitTime: number = 0;
  private lastMutedAlertTime: number = 0;

  private onAudioChunkCallback: ((base64Pcm: string) => void) | null = null;
  private onPlaybackStateCallback: ((isPlaying: boolean) => void) | null = null;
  private onInputLevelCallback: ((data: InputLevelData) => void) | null = null;
  private onSpeakWhileMutedCallback: (() => void) | null = null;

  constructor() {}

  public setCallbacks(
    onChunk: (base64Pcm: string) => void,
    onPlaybackState: (isPlaying: boolean) => void
  ) {
    this.onAudioChunkCallback = onChunk;
    this.onPlaybackStateCallback = onPlaybackState;
  }

  public setOnInputLevelCallback(cb: ((data: InputLevelData) => void) | null) {
    this.onInputLevelCallback = cb;
  }

  public setOnSpeakWhileMutedCallback(cb: (() => void) | null) {
    this.onSpeakWhileMutedCallback = cb;
  }

  public setMicSensitivity(threshold: number) {
    this.micSensitivityThreshold = Math.max(0, Math.min(100, threshold));
  }

  public getMicSensitivity(): number {
    return this.micSensitivityThreshold;
  }

  public setInputGain(gain: number) {
    this.inputGain = Math.max(0.5, Math.min(3.0, gain));
  }

  public getInputGain(): number {
    return this.inputGain;
  }

  public setVoicePitch(pitch: number) {
    this.voicePitch = Math.max(0.7, Math.min(1.4, pitch));
    // Dynamically adjust pitch for all currently playing sources if any
    for (const source of this.activeSources) {
      try {
        source.playbackRate.setValueAtTime(
          this.voicePitch,
          this.outputAudioCtx?.currentTime || 0
        );
      } catch (_) {}
    }
  }

  public getVoicePitch(): number {
    return this.voicePitch;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Unlocks Web Audio output on user gesture to prevent browser autoplay blocks
   */
  public async unlockAudio(): Promise<void> {
    await this.initOutputContext();
    if (this.outputAudioCtx && this.outputAudioCtx.state === "suspended") {
      try {
        await this.outputAudioCtx.resume();
      } catch (err) {
        console.warn("Could not resume output audio context:", err);
      }
    }
    if (this.inputAudioCtx && this.inputAudioCtx.state === "suspended") {
      try {
        await this.inputAudioCtx.resume();
      } catch (err) {
        console.warn("Could not resume input audio context:", err);
      }
    }
  }

  /**
   * Initializes microphone capture and streams 16kHz PCM chunks
   */
  public async startCapture(): Promise<void> {
    if (this.isCapturing) return;

    try {
      try {
        this.micStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            channelCount: 1,
          },
        });
      } catch (advancedErr: any) {
        // If permission was already explicitly denied, re-throw
        if (
          advancedErr?.name === "NotAllowedError" ||
          advancedErr?.name === "PermissionDeniedError" ||
          String(advancedErr?.message || "").toLowerCase().includes("permission")
        ) {
          throw advancedErr;
        }
        // Otherwise fallback to basic audio constraint in case advanced audio constraints fail
        this.micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }

      // ALWAYS initialize Input AudioContext with native hardware sample rate.
      // Setting sampleRate: 16000 directly triggers Chromium Bug 1114407 (silent stream on MediaStreamAudioSourceNode).
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.inputAudioCtx = new AudioCtx();

      if (this.inputAudioCtx.state === "suspended") {
        await this.inputAudioCtx.resume();
      }

      const actualSampleRate = this.inputAudioCtx.sampleRate;
      console.log(`[AudioStreamer] Mic capture initialized at native ${actualSampleRate}Hz (will downsample to 16kHz)`);

      // Input analyser for responsive UI visualizer
      this.inputAnalyser = this.inputAudioCtx.createAnalyser();
      this.inputAnalyser.fftSize = 256;
      this.inputAnalyser.smoothingTimeConstant = 0.5;

      this.micSource = this.inputAudioCtx.createMediaStreamSource(this.micStream);
      this.processor = this.inputAudioCtx.createScriptProcessor(4096, 1, 1);

      // Route processor through silent gain (gain=0) to destination.
      // This prevents microphone acoustic feedback loop into speakers while keeping onaudioprocess alive in Chrome.
      this.silentGain = this.inputAudioCtx.createGain();
      this.silentGain.gain.value = 0;

      this.micSource.connect(this.inputAnalyser);
      this.micSource.connect(this.processor);
      this.processor.connect(this.silentGain);
      this.silentGain.connect(this.inputAudioCtx.destination);

      this.processor.onaudioprocess = (e: AudioProcessingEvent) => {
        if (!this.isCapturing) return;

        const inputChannel = e.inputBuffer.getChannelData(0);

        // 1. Calculate input RMS level and Peak
        let sumSq = 0;
        let peak = 0;
        for (let i = 0; i < inputChannel.length; i++) {
          const val = inputChannel[i];
          sumSq += val * val;
          const abs = Math.abs(val);
          if (abs > peak) peak = abs;
        }
        const rms = Math.sqrt(sumSq / inputChannel.length);

        // Calculate dynamic cutoff from threshold (0 to 100)
        // At 0%: 0 (everything passes)
        // At 20%: ~0.008 (standard voice threshold)
        // At 50%: ~0.045
        // At 100%: 0.150
        const normalizedThreshold = Math.max(0, Math.min(100, this.micSensitivityThreshold));
        const cutoffRms =
          normalizedThreshold === 0
            ? 0
            : Math.pow(normalizedThreshold / 100, 1.6) * 0.15;

        const now = Date.now();
        const speechTriggerThreshold = Math.max(cutoffRms, 0.008);
        const isVoiceThresholdMet = (rms >= speechTriggerThreshold && peak >= 0.02) || rms >= 0.016;

        if (isVoiceThresholdMet) {
          this.lastVoiceDetectedTime = now;
        }

        // Keep a 350ms hangover so trailing words don't get abruptly cut off
        const isVoiceActive =
          normalizedThreshold === 0 || (now - this.lastVoiceDetectedTime < 350);

        // Emit real-time telemetry throttled to ~40ms for responsive UI VU meter
        if (this.onInputLevelCallback && now - this.lastLevelEmitTime > 40) {
          this.lastLevelEmitTime = now;
          this.onInputLevelCallback({
            rms,
            peak,
            isVoiceActive: this.isMuted ? false : isVoiceActive,
            thresholdCutoff: cutoffRms,
            thresholdPercent: normalizedThreshold,
          });
        }

        // When MUTED:
        if (this.isMuted) {
          // If the user attempts to speak into the microphone while muted,
          // trigger the alert callback to notify the UI to pulse / glow
          if (isVoiceThresholdMet && now - this.lastMutedAlertTime > 1200) {
            this.lastMutedAlertTime = now;
            if (this.onSpeakWhileMutedCallback) {
              this.onSpeakWhileMutedCallback();
            }
          }
          // Do NOT send any audio chunks to Gemini while muted
          return;
        }

        // Downsample to 16000 if native rate differs
        let samples =
          actualSampleRate !== 16000
            ? this.downsampleTo16k(inputChannel, actualSampleRate, 16000)
            : inputChannel;

        // Apply input gain
        if (this.inputGain !== 1.0) {
          const gained = new Float32Array(samples.length);
          for (let i = 0; i < samples.length; i++) {
            gained[i] = Math.max(-1.0, Math.min(1.0, samples[i] * this.inputGain));
          }
          samples = gained;
        }

        // If below threshold (noise gated), stream digital silence (all zeros)
        // This keeps the PCM stream timing intact without triggering Gemini's VAD!
        let finalSamples = samples;
        if (!isVoiceActive) {
          finalSamples = new Float32Array(samples.length);
        }

        // Convert Float32 to 16-bit PCM little-endian
        const pcm16 = this.floatTo16BitPCM(finalSamples);
        const base64Audio = this.arrayBufferToBase64(pcm16.buffer);

        if (this.onAudioChunkCallback) {
          this.onAudioChunkCallback(base64Audio);
        }
      };

      // Ensure output AudioContext is unlocked and primed
      await this.unlockAudio();

      this.isCapturing = true;
    } catch (err: any) {
      console.warn("[AudioStreamer] Microphone capture not available:", err?.message || err);
      this.cleanup();
      throw err;
    }
  }

  /**
   * Initializes the output AudioContext for Gemini Live response playback
   */
  private async initOutputContext(): Promise<void> {
    if (!this.outputAudioCtx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      try {
        this.outputAudioCtx = new AudioCtx();
      } catch (_) {
        this.outputAudioCtx = new AudioCtx({ sampleRate: 24000 });
      }

      this.outputAnalyser = this.outputAudioCtx.createAnalyser();
      this.outputAnalyser.fftSize = 256;
      this.outputAnalyser.smoothingTimeConstant = 0.85;

      this.outputAnalyser.connect(this.outputAudioCtx.destination);
    }

    if (this.outputAudioCtx.state === "suspended") {
      try {
        await this.outputAudioCtx.resume();
      } catch (err) {
        console.warn("Could not resume outputAudioCtx:", err);
      }
    }
  }

  /**
   * Plays a 24kHz PCM16 base64 audio chunk received from Gemini Live API
   */
  public async playChunk(base64Pcm: string): Promise<void> {
    await this.unlockAudio();
    if (!this.outputAudioCtx || !this.outputAnalyser) return;

    try {
      const pcmBytes = this.base64ToArrayBuffer(base64Pcm);
      const int16View = new Int16Array(pcmBytes);
      const float32Samples = new Float32Array(int16View.length);

      for (let i = 0; i < int16View.length; i++) {
        // Convert signed 16-bit int to float [-1.0, 1.0]
        float32Samples[i] = int16View[i] / (int16View[i] < 0 ? 32768 : 32767);
      }

      // AudioBuffer sample rate is 24000; the AudioContext resamples automatically to hardware rate
      const audioBuffer = this.outputAudioCtx.createBuffer(
        1,
        float32Samples.length,
        24000
      );
      audioBuffer.getChannelData(0).set(float32Samples);

      const source = this.outputAudioCtx.createBufferSource();
      source.buffer = audioBuffer;

      // Apply dynamic voice pitch if customized
      if (this.voicePitch !== 1.0) {
        source.playbackRate.value = this.voicePitch;
      }

      source.connect(this.outputAnalyser);

      const currentTime = this.outputAudioCtx.currentTime;
      if (this.nextStartTime < currentTime) {
        this.nextStartTime = currentTime + 0.05; // 50ms initial jitter buffer
      }

      source.start(this.nextStartTime);
      // Effective playback duration scales inversely with pitch
      const effectiveDuration = audioBuffer.duration / this.voicePitch;
      this.nextStartTime += effectiveDuration;

      this.activeSources.add(source);
      if (this.onPlaybackStateCallback) {
        this.onPlaybackStateCallback(true);
      }

      source.onended = () => {
        this.activeSources.delete(source);
        if (this.activeSources.size === 0) {
          if (this.onPlaybackStateCallback) {
            this.onPlaybackStateCallback(false);
          }
        }
      };
    } catch (err) {
      console.error("Error playing audio chunk:", err);
    }
  }

  /**
   * Returns true if there are audio sources currently scheduled or playing
   */
  public isPlaybackActive(): boolean {
    return this.activeSources.size > 0;
  }

  /**
   * Stops playback immediately (Crucial for handling interruptions)
   */
  public stopPlayback(): void {
    for (const source of this.activeSources) {
      try {
        source.stop();
        source.disconnect();
      } catch (_) {}
    }
    this.activeSources.clear();

    if (this.outputAudioCtx) {
      this.nextStartTime = this.outputAudioCtx.currentTime;
    } else {
      this.nextStartTime = 0;
    }

    if (this.onPlaybackStateCallback) {
      this.onPlaybackStateCallback(false);
    }
  }

  /**
   * Returns visualizer frequency and waveform data for UI animations
   */
  public getVisualizerData(type: "mic" | "output" = "output"): {
    volume: number;
    frequencies: number[];
    waveform: number[];
  } {
    const analyser = type === "mic" ? this.inputAnalyser : this.outputAnalyser;

    if (!analyser) {
      return { volume: 0, frequencies: new Array(16).fill(0), waveform: new Array(32).fill(0) };
    }

    const freqData = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(freqData);

    const timeData = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteTimeDomainData(timeData);

    // Calculate volume
    let sum = 0;
    for (let i = 0; i < freqData.length; i++) {
      sum += freqData[i];
    }
    const volume = sum / (freqData.length * 255);

    // 16 condensed frequency bands
    const bands = 16;
    const step = Math.floor(freqData.length / bands);
    const frequencies: number[] = [];
    for (let i = 0; i < bands; i++) {
      let bSum = 0;
      for (let j = 0; j < step; j++) {
        bSum += freqData[i * step + j] || 0;
      }
      frequencies.push(bSum / (step * 255));
    }

    // 32 waveform points normalized [-1, 1]
    const wavePoints = 32;
    const wStep = Math.floor(timeData.length / wavePoints);
    const waveform: number[] = [];
    for (let i = 0; i < wavePoints; i++) {
      const val = (timeData[i * wStep] - 128) / 128;
      waveform.push(val);
    }

    return { volume, frequencies, waveform };
  }

  public stopCapture(): void {
    this.isCapturing = false;

    if (this.processor) {
      this.processor.disconnect();
      this.processor.onaudioprocess = null;
      this.processor = null;
    }

    if (this.silentGain) {
      this.silentGain.disconnect();
      this.silentGain = null;
    }

    if (this.micSource) {
      this.micSource.disconnect();
      this.micSource = null;
    }

    if (this.micStream) {
      this.micStream.getTracks().forEach((track) => track.stop());
      this.micStream = null;
    }

    if (this.inputAudioCtx && this.inputAudioCtx.state !== "closed") {
      this.inputAudioCtx.close().catch(() => {});
      this.inputAudioCtx = null;
    }
  }

  public cleanup(): void {
    this.stopCapture();
    this.stopPlayback();

    if (this.outputAudioCtx && this.outputAudioCtx.state !== "closed") {
      this.outputAudioCtx.close().catch(() => {});
      this.outputAudioCtx = null;
    }
  }

  // --- Audio Conversion Helpers ---

  private downsampleTo16k(
    buffer: Float32Array,
    fromRate: number,
    toRate: number = 16000
  ): Float32Array {
    if (fromRate === toRate) return buffer;
    const ratio = fromRate / toRate;
    const newLength = Math.round(buffer.length / ratio);
    const result = new Float32Array(newLength);

    for (let i = 0; i < newLength; i++) {
      const startIdx = Math.floor(i * ratio);
      const endIdx = Math.min(buffer.length, Math.floor((i + 1) * ratio));
      let sum = 0;
      let count = 0;
      for (let j = startIdx; j < endIdx; j++) {
        sum += buffer[j];
        count++;
      }
      result[i] = count > 0 ? sum / count : buffer[startIdx] || 0;
    }

    return result;
  }

  private floatTo16BitPCM(input: Float32Array): Int16Array {
    const output = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, input[i]));
      output[i] = s < 0 ? Math.round(s * 0x8000) : Math.round(s * 0x7fff);
    }
    return output;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    const len = bytes.byteLength;
    const chunkSize = 0x8000;
    for (let i = 0; i < len; i += chunkSize) {
      binary += String.fromCharCode.apply(
        null,
        bytes.subarray(i, Math.min(i + chunkSize, len)) as any
      );
    }
    return window.btoa(binary);
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  public getIsCapturing(): boolean {
    return this.isCapturing;
  }
}
