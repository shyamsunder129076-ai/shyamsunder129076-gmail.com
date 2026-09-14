import React from "react";
import { Mic, MicOff, Volume2, ShieldAlert, ExternalLink, RotateCw } from "lucide-react";
import { AssistantState } from "../types";
import { ThemeConfig } from "../utils/theme";

interface LiveTelemetryBarProps {
  state: AssistantState;
  theme: ThemeConfig;
  isMuted: boolean;
  isMicActive?: boolean;
  errorMessage: string | null;
  onClearError: () => void;
  onRetryMic?: () => void;
}

export const LiveTelemetryBar: React.FC<LiveTelemetryBarProps> = ({
  state,
  theme,
  isMuted,
  isMicActive = true,
  errorMessage,
  onClearError,
  onRetryMic,
}) => {
  if (errorMessage) {
    const isMicIssue =
      errorMessage.toLowerCase().includes("mic") ||
      errorMessage.toLowerCase().includes("permission");

    return (
      <div className="w-full max-w-md px-3 py-1">
        <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs shadow-xl backdrop-blur-md flex flex-col gap-2">
          <div className="flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <div className="flex-1 leading-relaxed">{errorMessage}</div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1 border-t border-rose-500/20">
            {isMicIssue && onRetryMic && (
              <button
                onClick={onRetryMic}
                className="px-2.5 py-1 rounded-xl bg-rose-500/30 hover:bg-rose-500/50 text-white text-[11px] font-semibold flex items-center gap-1.5 transition-all active:scale-95"
              >
                <RotateCw className="w-3 h-3" />
                Retry Mic
              </button>
            )}

            {isMicIssue && (
              <button
                onClick={() => window.open(window.location.href, "_blank")}
                className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold flex items-center gap-1.5 transition-all active:scale-95"
              >
                <ExternalLink className="w-3 h-3" />
                Open in Tab
              </button>
            )}

            <button
              onClick={onClearError}
              className="px-2 py-1 rounded-xl text-neutral-400 hover:text-white text-[11px] transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (state === "disconnected") return null;

  return (
    <div className="w-full max-w-sm px-4 py-1 flex items-center justify-between text-[11px] text-neutral-400 select-none">
      <div className="flex items-center gap-1.5">
        {!isMicActive ? (
          <div className="flex items-center gap-1 text-amber-400">
            <MicOff className="w-3.5 h-3.5" />
            <span>Mic Off (Mahi speaks)</span>
          </div>
        ) : (
          <>
            <Mic
              className={`w-3.5 h-3.5 ${
                isMuted
                  ? "text-rose-500"
                  : state === "listening"
                  ? "text-emerald-400 animate-pulse"
                  : "text-neutral-500"
              }`}
            />
            <span>{isMuted ? "Mic Muted" : state === "listening" ? "Mic Streaming 16kHz" : "Mic Standby"}</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <Volume2
          className={`w-3.5 h-3.5 ${
            state === "speaking" ? "text-pink-400 animate-pulse" : "text-neutral-500"
          }`}
          style={state === "speaking" ? { color: theme.primaryHex } : undefined}
        />
        <span>{state === "speaking" ? "Mahi Audio 24kHz" : "Output Ready"}</span>
      </div>
    </div>
  );
};
