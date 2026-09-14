import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, Check, Copy, ExternalLink, X, MessageSquare, Sparkles, MessageCircle, Phone, ArrowUpRight } from "lucide-react";
import { SendMessageAction, MessagePlatform } from "../types";
import { ThemeConfig } from "../utils/theme";

interface MessageActionModalProps {
  action: SendMessageAction | null;
  isOpen?: boolean;
  theme: ThemeConfig;
  onDismiss: () => void;
  onSendCustomMessage?: (platform: MessagePlatform, recipient: string, message: string) => void;
}

export const MessageActionModal: React.FC<MessageActionModalProps> = ({
  action,
  isOpen = false,
  theme,
  onDismiss,
  onSendCustomMessage,
}) => {
  const [platform, setPlatform] = useState<MessagePlatform>("whatsapp");
  const [recipient, setRecipient] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [sentNotice, setSentNotice] = useState<boolean>(false);

  useEffect(() => {
    if (action) {
      setPlatform(action.platform || "whatsapp");
      setRecipient(action.recipient || "");
      setMessage(action.message || "");
      setCopied(false);
      setSentNotice(false);
    }
  }, [action]);

  const isModalVisible = Boolean(action || isOpen);

  if (!isModalVisible) return null;

  const handleCopy = () => {
    if (!message) return;
    navigator.clipboard?.writeText(message).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }).catch(() => {});
  };

  const getTargetUrl = () => {
    const trimmedMsg = encodeURIComponent(message);
    if (platform === "whatsapp") {
      const digits = recipient.replace(/\D/g, "");
      if (digits.length >= 10) {
        return `https://api.whatsapp.com/send?phone=${digits}&text=${trimmedMsg}`;
      }
      return `https://api.whatsapp.com/send?text=${trimmedMsg}`;
    }
    if (platform === "instagram") {
      const cleanHandle = recipient.replace(/^@/, "").trim();
      return cleanHandle
        ? `https://ig.me/m/${encodeURIComponent(cleanHandle)}`
        : "https://www.instagram.com/direct/inbox/";
    }
    const cleanUser = recipient.trim();
    return cleanUser
      ? `https://m.me/${encodeURIComponent(cleanUser)}`
      : "https://www.facebook.com/messages";
  };

  const handleDirectSend = () => {
    setSentNotice(true);
    const targetUrl = getTargetUrl();
    window.open(targetUrl, "_blank", "noopener,noreferrer");
    if (onSendCustomMessage) {
      onSendCustomMessage(platform, recipient, message);
    }
    setTimeout(() => {
      setSentNotice(false);
      onDismiss();
    }, 2000);
  };

  const getPlatformDetails = () => {
    switch (platform) {
      case "whatsapp":
        return {
          name: "WhatsApp",
          color: "#25D366",
          badgeBg: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
          iconBg: "bg-[#25D366]",
          label: "WhatsApp Direct",
        };
      case "instagram":
        return {
          name: "Instagram",
          color: "#E1306C",
          badgeBg: "bg-pink-500/20 text-pink-400 border-pink-500/30",
          iconBg: "bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600",
          label: "Instagram DM",
        };
      case "facebook":
        return {
          name: "Facebook",
          color: "#1877F2",
          badgeBg: "bg-blue-500/20 text-blue-400 border-blue-500/30",
          iconBg: "bg-[#1877F2]",
          label: "Messenger",
        };
      default:
        return {
          name: "WhatsApp",
          color: "#25D366",
          badgeBg: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
          iconBg: "bg-[#25D366]",
          label: "Message",
        };
    }
  };

  const platformInfo = getPlatformDetails();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-sm">
        <motion.div
          id="mahi-message-action-modal"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
          className="w-full max-w-md shadow-2xl"
        >
          <div className="overflow-hidden rounded-2xl border border-neutral-700/80 bg-neutral-950/95 backdrop-blur-2xl shadow-2xl text-white">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-neutral-900/90 border-b border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md ${platformInfo.iconBg}`}>
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-white">
                      Send Message
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${platformInfo.badgeBg}`}>
                      {platformInfo.name}
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-400 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-pink-400" />
                    <span>Mahi instant message sender & dispatcher</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onDismiss}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Platform switcher */}
            <div className="flex items-center gap-1 px-4 pt-3 pb-1 border-b border-neutral-900">
              {(["whatsapp", "instagram", "facebook"] as MessagePlatform[]).map((p) => {
                const isActive = platform === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPlatform(p)}
                    className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold capitalize transition-all ${
                      isActive
                        ? p === "whatsapp"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                          : p === "instagram"
                          ? "bg-pink-500/20 text-pink-300 border border-pink-500/40"
                          : "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                        : "text-neutral-400 hover:bg-neutral-900"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>

            {/* Form Fields */}
            <div className="p-4 space-y-3">
              {/* Recipient */}
              <div>
                <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                  Recipient (Name, Number, or Username):
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder={
                      platform === "whatsapp"
                        ? "e.g. Papa, Mummy, or 919876543210"
                        : "e.g. Username or handle"
                    }
                    className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-emerald-500/60"
                  />
                  {platform === "whatsapp" && (
                    <Phone className="w-3.5 h-3.5 absolute right-3 top-2.5 text-neutral-500 pointer-events-none" />
                  )}
                </div>
              </div>

              {/* Message Content */}
              <div>
                <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                  Message Content:
                </label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message here..."
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-emerald-500/60 resize-none leading-relaxed"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleDirectSend}
                  disabled={!message.trim()}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-white shadow-lg transition-all active:scale-[0.98] ${
                    !message.trim()
                      ? "opacity-50 cursor-not-allowed bg-neutral-800"
                      : "cursor-pointer"
                  }`}
                  style={{
                    backgroundColor: message.trim() ? platformInfo.color : undefined,
                  }}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {sentNotice ? "Opening & Sending..." : `Send via ${platformInfo.name} Now`}
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-80" />
                </button>

                <button
                  type="button"
                  onClick={handleCopy}
                  disabled={!message.trim()}
                  className="flex items-center gap-1 px-3 py-2.5 rounded-xl text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition-colors"
                  title="Copy text to clipboard"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 text-[11px]">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span className="text-[11px]">Copy</span>
                    </>
                  )}
                </button>
              </div>

              {sentNotice && (
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] text-center font-medium animate-pulse">
                  ✓ Message sent! Opening {platformInfo.name}...
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
