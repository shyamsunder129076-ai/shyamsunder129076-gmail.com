import React from "react";
import { MessageCircleHeart, Volume2 } from "lucide-react";
import { AssistantState } from "../types";
import { ThemeConfig } from "../utils/theme";

interface QuickPromptsProps {
  state: AssistantState;
  theme: ThemeConfig;
  onSelectPrompt?: (text: string) => void;
}

const VOICE_PROMPTS = [
  { label: "WhatsApp msg bhejo", text: "WhatsApp par Papa ko message karo: Main 10 minute me aa raha hoon" },
  { label: "YouTube play karo", text: "YouTube par search karke Arijit Singh romantic mashup play karo" },
  { label: "Instagram DM karo", text: "Instagram par ashwani.builds ko message karo: Hey bro!" },
  { label: "Granny play karo", text: "YouTube par granny chapter 1 search karke play karo" },
  { label: "Kaisi ho jaan?", text: "Hey Mahi baby, kaisi ho? Kaisa raha tumhara din?" },
  { label: "Birthday yaad rakhna", text: "Mahi meri jaan, yaad rakhna mera birthday 14 August ko hai!" },
];

export const QuickPrompts: React.FC<QuickPromptsProps> = ({ state, theme, onSelectPrompt }) => {
  if (state === "speaking") return null;

  return (
    <div id="quick-voice-prompts" className="relative z-20 w-full max-w-lg px-3 py-1 flex flex-col items-center">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-pink-400 mb-1.5">
        <MessageCircleHeart className="w-3.5 h-3.5" style={{ color: theme.primaryHex }} />
        <span>Tap to hear Mahi speak in real girl voice (or speak via mic):</span>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-1.5">
        {VOICE_PROMPTS.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onSelectPrompt && onSelectPrompt(item.text)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] bg-neutral-900/80 border border-neutral-800 text-neutral-300 hover:text-white hover:border-pink-500/50 hover:bg-pink-500/15 backdrop-blur-md transition-all cursor-pointer shadow-sm active:scale-95"
            title={`Click to ask Mahi: "${item.text}"`}
          >
            <Volume2 className="w-3 h-3 text-pink-400 shrink-0" />
            <span>&quot;{item.label}&quot;</span>
          </button>
        ))}
      </div>
    </div>
  );
};
