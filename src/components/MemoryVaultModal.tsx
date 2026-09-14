import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Brain,
  X,
  Sparkles,
  Search,
  Trash2,
  Plus,
  RefreshCw,
  Clock,
  Heart,
  Briefcase,
  CheckCircle2,
  Database,
  Flame,
  MessageSquare,
} from "lucide-react";
import { MahiMemory } from "../types";
import { ThemeConfig } from "../utils/theme";

interface MemoryVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeConfig;
}

export const MemoryVaultModal: React.FC<MemoryVaultModalProps> = ({
  isOpen,
  onClose,
  theme,
}) => {
  const [memories, setMemories] = useState<MahiMemory[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [newMemoryText, setNewMemoryText] = useState("");
  const [newCategory, setNewCategory] = useState<MahiMemory["category"]>("fact");
  const [isAdding, setIsAdding] = useState(false);
  const [supabaseConfigured, setSupabaseConfigured] = useState(true);

  const fetchMemories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/memories");
      if (res.ok) {
        const data = await res.json();
        setMemories(data.memories || []);
        setSupabaseConfigured(Boolean(data.configured));
      }
    } catch (err) {
      console.warn("Failed to fetch memories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMemories();
    }
  }, [isOpen]);

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemoryText.trim()) return;

    try {
      const res = await fetch("/api/memories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memory: newMemoryText.trim(),
          category: newCategory,
          importance: 3,
        }),
      });
      if (res.ok) {
        setNewMemoryText("");
        setIsAdding(false);
        fetchMemories();
      }
    } catch (err) {
      console.warn("Failed to save memory:", err);
    }
  };

  const handleDeleteMemory = async (id: string | number) => {
    try {
      const res = await fetch(`/api/memories/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMemories((prev) => prev.filter((m) => String(m.id) !== String(id)));
      }
    } catch (err) {
      console.warn("Failed to delete memory:", err);
    }
  };

  const filteredMemories = memories.filter((item) => {
    const matchesCategory =
      filterCategory === "all"
        ? true
        : filterCategory === "conversations"
        ? item.category === "conversation_log" ||
          item.memory.includes("[CONVERSATION") ||
          item.memory.includes("[Topic") ||
          item.memory.includes("[Kis Baare Me")
        : filterCategory === "facts"
        ? item.category === "fact" || item.category === "general"
        : filterCategory === "work"
        ? item.category === "work"
        : filterCategory === "promises"
        ? item.category === "promise"
        : item.category === filterCategory;

    const matchesSearch =
      searchQuery.trim() === ""
        ? true
        : item.memory.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const conversationCount = memories.filter(
    (m) =>
      m.category === "conversation_log" ||
      m.memory.includes("[CONVERSATION") ||
      m.memory.includes("[Topic")
  ).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          id="memory-vault-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            id="memory-vault-modal"
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 15 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-2xl max-h-[90vh] bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden relative"
          >
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${theme.primaryHex}, ${theme.secondaryHex})`,
                }}
              >
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white font-['Space_Grotesk']">
                    Mahi Memory Vault
                  </h2>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                      supabaseConfigured
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        : "bg-amber-500/10 border-amber-500/30 text-amber-400"
                    }`}
                  >
                    <Database className="w-3 h-3" />
                    {supabaseConfigured ? "Supabase Connected" : "Local Cache"}
                  </span>
                </div>
                <p className="text-xs text-neutral-400">
                  Total Recall: {memories.length} yaadein • {conversationCount} conversations recorded
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchMemories}
                disabled={loading}
                className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
                title="Refresh memories"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-pink-400" : ""}`} />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Subheader info banner */}
          <div className="px-5 py-2.5 bg-neutral-950/70 border-b border-neutral-800/80 flex items-center justify-between text-xs text-neutral-300">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-pink-400 shrink-0" />
              <span>
                Mahi remembers <strong>Kis baare me</strong>, <strong>Kyun</strong>, aur <strong>A-to-Z details</strong> of every call & chat!
              </span>
            </div>
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold text-white flex items-center gap-1 transition-all"
              style={{
                background: `linear-gradient(135deg, ${theme.primaryHex}, ${theme.secondaryHex})`,
              }}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Yaad Dilao</span>
            </button>
          </div>

          {/* Add Memory Form */}
          {isAdding && (
            <form onSubmit={handleAddMemory} className="p-4 bg-neutral-950/90 border-b border-neutral-800 space-y-3">
              <div className="flex items-center justify-between text-xs text-neutral-300">
                <span className="font-semibold text-white">Mahi ko kuch naya yaad karwao:</span>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="text-neutral-500 hover:text-neutral-300"
                >
                  Cancel
                </button>
              </div>
              <textarea
                value={newMemoryText}
                onChange={(e) => setNewMemoryText(e.target.value)}
                placeholder="Jaise: 'Mujhe raat me late coding karte waqt chilled coffee pasand hai' ya 'Kal subah 9 baje important meeting hai'..."
                className="w-full h-20 p-3 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-pink-500 resize-none"
              />
              <div className="flex items-center justify-between">
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-xs text-neutral-200 focus:outline-none"
                >
                  <option value="fact">Personal Fact</option>
                  <option value="work">Work & Project</option>
                  <option value="preference">Preference / Likes</option>
                  <option value="promise">Promise / Plan</option>
                  <option value="moment">Special Moment</option>
                </select>
                <button
                  type="submit"
                  disabled={!newMemoryText.trim()}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold text-white transition-opacity disabled:opacity-50"
                  style={{
                    background: `linear-gradient(135deg, ${theme.primaryHex}, ${theme.secondaryHex})`,
                  }}
                >
                  Save in Supabase
                </button>
              </div>
            </form>
          )}

          {/* Controls: Search & Category Filters */}
          <div className="p-4 border-b border-neutral-800 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Yaadein ya conversations search karo..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-700"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
              {[
                { id: "all", label: "Sabhi", icon: Brain },
                { id: "conversations", label: "Pichli Baatein (Calls/Chats)", icon: MessageSquare },
                { id: "facts", label: "Personal Facts", icon: Heart },
                { id: "work", label: "Work & Projects", icon: Briefcase },
                { id: "promises", label: "Promises & Plans", icon: CheckCircle2 },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = filterCategory === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setFilterCategory(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors ${
                      isActive
                        ? "bg-white text-neutral-950 font-bold"
                        : "bg-neutral-800/80 text-neutral-400 hover:text-white hover:bg-neutral-800"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Memory Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
            {loading && memories.length === 0 ? (
              <div className="py-12 text-center text-neutral-400 text-xs flex flex-col items-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-pink-400" />
                <span>Mahi ke memory vault se baatein load ho rahi hain...</span>
              </div>
            ) : filteredMemories.length === 0 ? (
              <div className="py-12 text-center text-neutral-400 text-xs flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-neutral-800 flex items-center justify-center text-neutral-500">
                  <Brain className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-semibold text-white">Abhi koi memory nahi mili</p>
                  <p className="text-neutral-500 mt-1 max-w-sm">
                    Mahi se baat karo ya upar &quot;Yaad Dilao&quot; button se koi baat save karo!
                  </p>
                </div>
              </div>
            ) : (
              filteredMemories.map((item) => {
                const isConversation =
                  item.category === "conversation_log" ||
                  item.memory.includes("[CONVERSATION") ||
                  item.memory.includes("[Topic");

                return (
                  <div
                    key={String(item.id || item.memory)}
                    className={`p-4 rounded-2xl border transition-all relative group ${
                      isConversation
                        ? "bg-neutral-950/80 border-pink-500/20 hover:border-pink-500/40"
                        : "bg-neutral-950/60 border-neutral-800/80 hover:border-neutral-700"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${
                            isConversation
                              ? "bg-pink-500/10 border-pink-500/30 text-pink-400"
                              : item.category === "work"
                              ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
                              : item.category === "promise"
                              ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                              : "bg-purple-500/10 border-purple-500/30 text-purple-400"
                          }`}
                        >
                          {isConversation ? "Conversation Topic" : item.category || "Fact"}
                        </span>
                        {item.created_at && (
                          <span className="text-[10px] text-neutral-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(item.created_at).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        )}
                      </div>

                      {item.id && (
                        <button
                          onClick={() => handleDeleteMemory(item.id!)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-neutral-500 hover:text-red-400 hover:bg-neutral-900 transition-all"
                          title="Delete memory"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-neutral-200 leading-relaxed whitespace-pre-wrap">
                      {item.memory}
                    </p>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer explanation */}
          <div className="p-4 border-t border-neutral-800/80 bg-neutral-950/80 text-[11px] text-neutral-400 flex items-center justify-between">
            <span>
              Har phone call aur chat khatam hone par Mahi automatic yahan yaadein add karti hai.
            </span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl font-bold text-xs text-white bg-neutral-800 hover:bg-neutral-700 transition-colors"
            >
              Theek Hai
            </button>
          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
};
