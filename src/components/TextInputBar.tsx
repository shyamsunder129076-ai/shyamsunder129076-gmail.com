import React, { useState, useRef, useEffect } from "react";
import { Send, MessageSquare, Sparkles, MessageCircle } from "lucide-react";
import { motion } from "motion/react";
import { AssistantState } from "../types";
import { ThemeConfig } from "../utils/theme";

interface TextInputBarProps {
  state: AssistantState;
  theme: ThemeConfig;
  onSendMessage: (text: string) => void;
  onTypingChange?: (isTyping: boolean) => void;
  onOpenDirectMessageModal?: () => void;
}

export const TextInputBar: React.FC<TextInputBarProps> = ({
  state,
  theme,
  onSendMessage,
  onTypingChange,
  onOpenDirectMessageModal,
}) => {
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const typingTimerRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setText(val);

    if (onTypingChange) {
      onTypingChange(val.trim().length > 0);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => {
        onTypingChange(false);
      }, 1200);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    setIsSubmitting(true);
    if (onTypingChange) onTypingChange(false);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);

    onSendMessage(trimmed);
    setText("");

    setTimeout(() => {
      setIsSubmitting(false);
    }, 400);

    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const isConnected = state === "listening" || state === "speaking";

  return (
    <div
      id="text-typing-panel"
      className="relative z-20 w-full max-w-md px-3 py-1 flex flex-col items-center"
    >
      <form
        onSubmit={handleSubmit}
        className="w-full flex items-center gap-1.5 p-1.5 pl-3 rounded-2xl bg-neutral-900/95 border border-neutral-800 shadow-2xl backdrop-blur-xl transition-all focus-within:border-pink-500/60 focus-within:ring-2 focus-within:ring-pink-500/20"
        style={{
          boxShadow: `0 8px 24px -2px rgba(0,0,0,0.6)`,
        }}
      >
        <div className="flex items-center gap-1.5 shrink-0 text-neutral-400">
          <MessageSquare
            className="w-4 h-4 transition-colors"
            style={{ color: theme.primaryHex }}
          />
        </div>

        <input
          id="mahi-chat-text-input"
          ref={inputRef}
          type="text"
          value={text}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={
            isConnected
              ? "Type message to Mahi... (e.g. Kaisi ho jaan?)"
              : "Type to chat with Mahi (e.g. Kaisi ho baby?)"
          }
          className="flex-1 bg-transparent text-xs sm:text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none min-w-0"
          autoComplete="off"
        />

        {/* Quick Send WhatsApp/DM Action Button */}
        {onOpenDirectMessageModal && (
          <button
            type="button"
            onClick={onOpenDirectMessageModal}
            className="flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 transition-all shrink-0 cursor-pointer"
            title="Compose & Send WhatsApp, Instagram, or Facebook message"
            aria-label="Send WhatsApp message"
          >
            <MessageCircle className="w-4 h-4" />
          </button>
        )}

        {/* Send Button */}
        <motion.button
          id="send-text-message-btn"
          type="submit"
          disabled={!text.trim() || isSubmitting}
          whileHover={text.trim() ? { scale: 1.05 } : {}}
          whileTap={text.trim() ? { scale: 0.95 } : {}}
          className={`flex items-center justify-center w-8 h-8 rounded-xl transition-all shrink-0 ${
            text.trim()
              ? "bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white shadow-md shadow-pink-500/30 cursor-pointer"
              : "bg-neutral-800/60 text-neutral-600 cursor-not-allowed opacity-40"
          }`}
          title={text.trim() ? "Send message to Mahi" : "Type a message first"}
          aria-label="Send message"
        >
          <Send className={`w-3.5 h-3.5 ml-0.5 ${isSubmitting ? "animate-pulse" : ""}`} />
        </motion.button>
      </form>

      {/* Helper caption */}
      <div className="flex items-center justify-between w-full px-2 mt-1 text-[10px] text-neutral-500">
        <span className="flex items-center gap-1">
          <Sparkles className="w-2.5 h-2.5 text-pink-400" />
          <span>Type or speak — Mahi will reply in real voice & chat</span>
        </span>
        <span className="text-neutral-400 font-medium">Press Enter ↵ to Send</span>
      </div>
    </div>
  );
};
