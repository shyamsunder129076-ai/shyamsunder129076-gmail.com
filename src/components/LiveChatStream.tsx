import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { User, Heart, Send, CheckCheck, ChevronDown, ChevronUp, Trash2, MessageCircle } from "lucide-react";
import { TranscriptEntry } from "../types";
import { ThemeConfig } from "../utils/theme";

interface LiveChatStreamProps {
  messages: TranscriptEntry[];
  isUserTyping: boolean;
  isMahiTyping: boolean;
  theme: ThemeConfig;
  onClearMessages: () => void;
  onOpenDirectMessageModal?: () => void;
  mahiAvatarUrl?: string;
}

export const LiveChatStream: React.FC<LiveChatStreamProps> = ({
  messages,
  isUserTyping,
  isMahiTyping,
  theme,
  onClearMessages,
  onOpenDirectMessageModal,
  mahiAvatarUrl,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom whenever messages or typing state changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isMahiTyping, isUserTyping, isExpanded]);

  if (messages.length === 0 && !isMahiTyping && !isUserTyping) {
    return null;
  }

  return (
    <div
      id="mahi-live-chat-stream"
      className="relative z-20 w-full max-w-md px-2 my-1"
    >
      <div className="rounded-2xl border border-neutral-800/80 bg-neutral-950/85 backdrop-blur-xl shadow-2xl overflow-hidden transition-all">
        {/* Header bar with expand toggle & clear */}
        <div className="flex items-center justify-between px-3 py-1.5 bg-neutral-900/60 border-b border-neutral-800/60 text-xs">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 font-semibold text-neutral-300 text-[11px]">
              <Heart className="w-3 h-3 text-pink-400 fill-pink-400" />
              <span>Conversation ({messages.length})</span>
            </span>

            {isUserTyping && (
              <span className="flex items-center gap-1 text-[10px] text-sky-400 font-medium animate-pulse">
                <span>✍️ You are typing</span>
              </span>
            )}

            {isMahiTyping && (
              <span className="flex items-center gap-1 text-[10px] text-pink-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-ping" />
                <span>Mahi is typing... 💕</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {onOpenDirectMessageModal && (
              <button
                type="button"
                onClick={onOpenDirectMessageModal}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 transition-colors"
                title="Send WhatsApp or DM message"
              >
                <MessageCircle className="w-2.5 h-2.5" />
                <span>Send WhatsApp</span>
              </button>
            )}

            {messages.length > 0 && (
              <button
                type="button"
                onClick={onClearMessages}
                className="p-1 rounded-md text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
                title="Clear chat history"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded-md text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
              title={isExpanded ? "Collapse chat" : "Expand chat"}
            >
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Messages scroll area */}
        {isExpanded && (
          <div
            ref={scrollContainerRef}
            className="max-h-44 sm:max-h-52 overflow-y-auto p-2.5 space-y-2.5 scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent"
          >
            <AnimatePresence initial={false}>
              {messages.map((msg) => {
                const isUser = msg.role === "user";
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className={`flex items-end gap-2 ${isUser ? "justify-end" : "justify-start"}`}
                  >
                    {!isUser && (
                      <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 border border-pink-500/40 bg-pink-950/60 flex items-center justify-center">
                        {mahiAvatarUrl ? (
                          <img
                            src={mahiAvatarUrl}
                            alt="Mahi"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <Heart className="w-3 h-3 text-pink-400 fill-pink-400" />
                        )}
                      </div>
                    )}

                    <div
                      className={`max-w-[82%] rounded-2xl px-3 py-2 text-xs shadow-md backdrop-blur-sm transition-all ${
                        isUser
                          ? "bg-gradient-to-r from-neutral-800 to-neutral-900 border border-neutral-700/80 text-neutral-100 rounded-br-xs"
                          : "bg-pink-950/40 border border-pink-500/30 text-pink-100 rounded-bl-xs"
                      }`}
                      style={
                        !isUser
                          ? {
                              borderColor: `${theme.primaryHex}40`,
                              backgroundColor: `${theme.primaryHex}15`,
                            }
                          : {}
                      }
                    >
                      <div className="flex items-center justify-between gap-3 text-[10px] text-neutral-400 mb-0.5">
                        <span className="font-semibold" style={{ color: isUser ? "#60a5fa" : theme.primaryHex }}>
                          {isUser ? "You" : "Mahi"}
                        </span>
                        <div className="flex items-center gap-1 text-[9px] text-neutral-500">
                          <span>{msg.time}</span>
                          {isUser && (
                            <span title="Delivered">
                              <CheckCheck className="w-3 h-3 text-sky-400 inline" />
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="leading-relaxed whitespace-pre-wrap break-words font-sans selection:bg-pink-500/30">
                        {msg.text}
                      </p>
                    </div>

                    {isUser && (
                      <div className="w-6 h-6 rounded-full bg-blue-950/60 border border-blue-500/40 flex items-center justify-center shrink-0 text-blue-400">
                        <User className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </motion.div>
                );
              })}

              {/* Real-time Typing Bubble when Mahi is generating/speaking */}
              {isMahiTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  className="flex items-end gap-2 justify-start"
                >
                  <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 border border-pink-500/40 bg-pink-950/60 flex items-center justify-center">
                    {mahiAvatarUrl ? (
                      <img
                        src={mahiAvatarUrl}
                        alt="Mahi"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <Heart className="w-3 h-3 text-pink-400 fill-pink-400" />
                    )}
                  </div>
                  <div
                    className="rounded-2xl rounded-bl-xs px-3 py-2 bg-pink-950/40 border border-pink-500/30 text-xs text-pink-300 flex items-center gap-2 shadow-md"
                    style={{
                      borderColor: `${theme.primaryHex}40`,
                      backgroundColor: `${theme.primaryHex}15`,
                    }}
                  >
                    <span className="text-[11px] font-medium">Mahi is typing</span>
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-bounce" />
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};
