import React, { useState, useEffect } from "react";
import { X, Smartphone, Moon, Sun, ShieldCheck, Play, Radio, Volume2, Sparkles, Download, Check } from "lucide-react";
import { ThemeConfig } from "../utils/theme";

interface LockScreenRunnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeConfig;
  keepScreenAwake: boolean;
  backgroundAudioLock: boolean;
  onToggleKeepScreenAwake: () => void;
  onToggleBackgroundAudioLock: () => void;
}

export const LockScreenRunnerModal: React.FC<LockScreenRunnerModalProps> = ({
  isOpen,
  onClose,
  theme,
  keepScreenAwake,
  backgroundAudioLock,
  onToggleKeepScreenAwake,
  onToggleBackgroundAudioLock,
}) => {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [copiedNote, setCopiedNote] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setIsInstalled(true);
      }
      setInstallPrompt(null);
    } else {
      setCopiedNote(true);
      setTimeout(() => setCopiedNote(false), 3000);
    }
  };

  return (
    <div
      id="lockscreen-runner-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="lockscreen-runner-modal"
        className="relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-3xl bg-neutral-900/95 border border-neutral-800 shadow-2xl overflow-hidden text-neutral-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/60">
          <div className="flex items-center gap-3">
            <div
              className="p-2.5 rounded-2xl"
              style={{ background: `linear-gradient(135deg, ${theme.primaryHex}25, ${theme.secondaryHex}35)` }}
            >
              <Smartphone className="w-5 h-5" style={{ color: theme.primaryHex }} />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-tight flex items-center gap-2">
                Phone Screen & Lock-Screen Run
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                  Active
                </span>
              </h3>
              <p className="text-xs text-neutral-400">
                Phone lock hone par bhi Mahi ko chalu rakhne ki setting
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Feature 1: Background & Lock-Screen Audio */}
          <div className="p-4 rounded-2xl bg-neutral-950/60 border border-neutral-800 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 mt-0.5">
                  <Moon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">
                    Run on Phone Lock Screen (Background Audio)
                  </h4>
                  <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">
                    Jab phone ki screen band (lock) ho jayegi, tab bhi audio background me chalta rahega aur lock screen notification par Mahi ka picture aur controls dikhai denge.
                  </p>
                </div>
              </div>
              <button
                onClick={onToggleBackgroundAudioLock}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  backgroundAudioLock ? "bg-emerald-500" : "bg-neutral-700"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    backgroundAudioLock ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-neutral-800/80 text-[11px] text-neutral-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>MediaSession & Continuous Audio Engine activated</span>
            </div>
          </div>

          {/* Feature 2: Screen Wake Lock (Keep Screen On) */}
          <div className="p-4 rounded-2xl bg-neutral-950/60 border border-neutral-800 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mt-0.5">
                  <Sun className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">
                    Keep Phone Screen Awake (Wake Lock)
                  </h4>
                  <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">
                    Call ke dauran phone screen ko automatically sleep hone ya band hone se roke.
                  </p>
                </div>
              </div>
              <button
                onClick={onToggleKeepScreenAwake}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  keepScreenAwake ? "bg-amber-500" : "bg-neutral-700"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    keepScreenAwake ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Feature 3: Install App on Phone Home Screen */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-neutral-950 to-neutral-900 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">
                    Install to Phone Home Screen (PWA)
                  </h4>
                  <p className="text-xs text-neutral-400">
                    Phone par ek normal app ki tarah fullscreen open karein
                  </p>
                </div>
              </div>
              <button
                onClick={handleInstallClick}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white transition-all shadow-lg active:scale-95"
                style={{
                  background: `linear-gradient(135deg, ${theme.primaryHex}, ${theme.secondaryHex})`,
                }}
              >
                {isInstalled ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Installed
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" /> Install App
                  </>
                )}
              </button>
            </div>

            {copiedNote && (
              <p className="text-[11px] text-amber-300/90 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 leading-relaxed">
                Tip: Mobile browser menu (⋮ ya Share) me jakar <strong>"Add to Home Screen"</strong> ya <strong>"Install App"</strong> tap karein.
              </p>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-neutral-800 bg-neutral-950/80 flex items-center justify-between">
          <span className="text-xs text-neutral-400">
            Background audio & lock-screen runner enabled
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-white transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
