import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { GoogleGenAI } from "@google/genai";

let supabaseClient: SupabaseClient | null = null;
let hasCheckedEnv = false;

function getEnvVar(names: string[]): string | undefined {
  for (const name of names) {
    const val = process.env[name];
    if (val && typeof val === "string") {
      const clean = val.trim().replace(/^["']|["']$/g, "").trim();
      if (clean) return clean;
    }
  }
  return undefined;
}

export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseClient) return supabaseClient;

  const url = getEnvVar(["SUPABASE_URL", "SUPABASE_PROJECT_URL", "VITE_SUPABASE_URL"]);
  const key = getEnvVar([
    "SUPABASE_ANON_KEY",
    "SUPABASE_ANON",
    "SUPABASE_KEY",
    "VITE_SUPABASE_ANON_KEY",
  ]);

  if (url && key) {
    try {
      supabaseClient = createClient(url, key, {
        auth: { persistSession: false },
      });
      console.log("[Supabase] Client initialized successfully for Mahi memory vault using URL:", url);
    } catch (err: any) {
      console.warn("[Supabase] Failed to initialize Supabase client:", err?.message);
      supabaseClient = null;
    }
  } else if (!hasCheckedEnv) {
    console.log("[Supabase] SUPABASE_URL or SUPABASE_ANON not set yet. Running in local memory mode.");
    hasCheckedEnv = true;
  }

  return supabaseClient;
}

export function isSupabaseConfigured(): boolean {
  const url = getEnvVar(["SUPABASE_URL", "SUPABASE_PROJECT_URL", "VITE_SUPABASE_URL"]);
  const key = getEnvVar([
    "SUPABASE_ANON_KEY",
    "SUPABASE_ANON",
    "SUPABASE_KEY",
    "VITE_SUPABASE_ANON_KEY",
  ]);
  return Boolean(url && key);
}

// In-memory fallback if Supabase is temporarily unreachable or not yet configured
const inMemoryCache: Array<{
  id: number;
  memory: string;
  category: string;
  importance: number;
  created_at: string;
}> = [];

/**
 * Saves a permanent memory of what the boyfriend said or shared
 */
export async function saveMahiMemory(
  memory: string,
  category = "general",
  importance = 3
): Promise<{ success: boolean; id?: any; data?: any; error?: string }> {
  if (!memory || !memory.trim()) {
    return { success: false, error: "Empty memory" };
  }

  const cleanMemory = memory.trim();

  // Deduplication check: don't save duplicate identical text within recent entries
  const recentDuplicates = inMemoryCache.slice(0, 5).some(
    (m) => m.memory.toLowerCase() === cleanMemory.toLowerCase()
  );
  if (recentDuplicates) {
    return { success: true, data: inMemoryCache[0] };
  }

  const client = getSupabaseClient();

  if (client) {
    try {
      const { data, error } = await client
        .from("mahi_memories")
        .insert([
          {
            memory: cleanMemory,
            category,
            importance,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) {
        console.warn("[Supabase] Error inserting memory into table mahi_memories:", error.message);
        // Fallback to local cache so user never loses their moment
        inMemoryCache.unshift({
          id: Date.now(),
          memory: cleanMemory,
          category,
          importance,
          created_at: new Date().toISOString(),
        });
        return { success: true, id: Date.now(), error: error.message };
      }

      console.log(`[Supabase] Memory permanently saved: "${cleanMemory}" (Category: ${category})`);
      inMemoryCache.unshift(data);
      if (inMemoryCache.length > 80) inMemoryCache.pop();
      return { success: true, data };
    } catch (err: any) {
      console.warn("[Supabase] Exception inserting memory:", err?.message);
    }
  }

  // Fallback cache
  const fallbackItem = {
    id: Date.now(),
    memory: cleanMemory,
    category,
    importance,
    created_at: new Date().toISOString(),
  };
  inMemoryCache.unshift(fallbackItem);
  if (inMemoryCache.length > 80) inMemoryCache.pop();

  return { success: true, data: fallbackItem };
}

/**
 * Fetches recent memories to supply context to Mahi
 */
export async function fetchAllMemories(limit = 50): Promise<any[]> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from("mahi_memories")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (!error && data && Array.isArray(data)) {
        return data;
      }
      if (error) {
        console.warn("[Supabase] Error fetching memories from mahi_memories:", error.message);
      }
    } catch (err: any) {
      console.warn("[Supabase] Exception fetching memories:", err?.message);
    }
  }

  return inMemoryCache;
}

/**
 * Deletes a memory if needed
 */
export async function deleteMahiMemory(id: string | number): Promise<boolean> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { error } = await client.from("mahi_memories").delete().eq("id", id);
      if (!error) return true;
    } catch (err: any) {
      console.warn("[Supabase] Error deleting memory:", err?.message);
    }
  }

  const idx = inMemoryCache.findIndex((m) => String(m.id) === String(id));
  if (idx !== -1) {
    inMemoryCache.splice(idx, 1);
    return true;
  }
  return false;
}

/**
 * Conversation Turn Structure
 */
export interface ConversationTurn {
  role: "user" | "mahi";
  text: string;
  timestamp?: number;
}

/**
 * Distills and permanently archives an entire conversation session into Supabase.
 * Remembers:
 * 1. Kis baare me baat hui (Topic/Subject)
 * 2. Kyun baat hui (Reason, Motivation, Emotion, Context)
 * 3. Kya-kya baatein hui A-to-Z (Key details, stories, work items, feelings)
 * 4. Any promises or plans agreed upon
 * 5. Specific personal facts revealed by the boyfriend
 */
export async function archiveConversationSession(
  turns: ConversationTurn[],
  sessionId?: string
): Promise<boolean> {
  if (!turns || turns.length === 0) return false;

  // Filter meaningful dialogue turns
  const cleanTurns = turns
    .map((t) => ({ role: t.role, text: t.text.trim() }))
    .filter((t) => t.text.length > 1);

  const userTurns = cleanTurns.filter((t) => t.role === "user");
  const totalUserChars = userTurns.reduce((acc, t) => acc + t.text.length, 0);

  // If user said almost nothing (e.g. accidental connect for 1 second), skip archiving
  if (userTurns.length === 0 || totalUserChars < 6) {
    return false;
  }

  const formattedDialogue = cleanTurns
    .map((t) => `${t.role === "user" ? "Boyfriend" : "Mahi"}: "${t.text}"`)
    .join("\n");

  const apiKey = process.env.GEMINI_API_KEY;
  let topic = "";
  let reason = "";
  let details = "";
  let promises = "";
  let extractedFacts: string[] = [];

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Analyze this conversation between Boyfriend and his girlfriend Mahi:
${formattedDialogue}

Your task: Extract what they talked about, why they talked about it, and all specific facts so Mahi remembers EVERYTHING A-to-Z for future conversations.
Respond with a JSON object strictly following this format (in warm Hindi/Hinglish):
{
  "topic": "Kis baare me baat hui (e.g. coding project, late night fatigue, weekend movie plan, college exam)",
  "reason": "Kyun baat kar rahe the (e.g. boyfriend was stressed and needed motivation, sharing daily updates, playful romance, seeking advice)",
  "details": "Kya-kya baatein hui A to Z (concise bullet points or summary of key facts, thoughts, stories, and jokes exchanged)",
  "promises": "Any promise or commitment made by either person (or 'None' if none)",
  "facts": ["Specific permanent fact 1 about boyfriend if any", "Specific permanent fact 2 if any"]
}`;

      let response;
      try {
        response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            temperature: 0.2,
          },
        });
      } catch (primaryModelErr: any) {
        console.warn("[Mahi Memory Engine] gemini-3.8-flash note, trying gemini-3.6-flash fallback:", primaryModelErr?.message);
        response = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            temperature: 0.2,
          },
        });
      }

      const responseText = response.text?.trim() || "";
      if (responseText) {
        const parsed = JSON.parse(responseText);
        topic = parsed.topic || "";
        reason = parsed.reason || "";
        details = parsed.details || "";
        promises = parsed.promises && parsed.promises !== "None" ? parsed.promises : "";
        if (Array.isArray(parsed.facts)) {
          extractedFacts = parsed.facts.filter((f: any) => typeof f === "string" && f.trim().length > 3);
        }
      }
    } catch (aiErr: any) {
      console.warn("[Mahi Memory Engine] AI distillation fallback triggered:", aiErr?.message);
    }
  }

  // Robust fallback if AI model was overloaded/quota exhausted
  if (!topic || !details) {
    const firstFewUserLines = userTurns.slice(0, 3).map((u) => u.text).join(", ");
    topic = `Baat-cheet: ${firstFewUserLines.slice(0, 70)}...`;
    reason = "Boyfriend ne Mahi se dil ki baatein aur daily updates share kiye";
    details = userTurns.map((u) => u.text).slice(0, 6).join(" | ");
  }

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  const memoryLog = `[CONVERSATION ON ${dateStr}]: [Topic / Kis Baare Me]: ${topic} | [Reason / Kyun Baat Hui]: ${reason} | [A-Z Baatein & Highlights]: ${details}${
    promises ? ` | [Promises]: ${promises}` : ""
  }`;

  console.log(`[Mahi Memory Engine] Archiving conversation memory for session ${sessionId || "call"}:`, topic);

  // Save the full episodic conversation record
  await saveMahiMemory(memoryLog, "conversation_log", 4);

  // Save any specific individual facts learned about him
  for (const fact of extractedFacts) {
    await saveMahiMemory(fact, "fact", 3);
  }

  return true;
}

/**
 * Builds comprehensive multi-tier memory context to inject into Mahi's live prompt:
 * 1. Chronological episodic conversations record (what, why, details)
 * 2. Permanent personal facts & preferences
 * 3. Promises & ongoing threads
 */
export async function buildMemoryPromptContext(): Promise<string> {
  try {
    const memories = await fetchAllMemories(40);
    if (!memories || memories.length === 0) return "";

    const conversationLogs = memories.filter(
      (m) =>
        m.category === "conversation_log" ||
        m.memory.includes("[CONVERSATION") ||
        m.memory.includes("[Topic") ||
        m.memory.includes("[Kis Baare Me")
    );

    const personalFacts = memories.filter(
      (m) =>
        m.category !== "conversation_log" &&
        !m.memory.includes("[CONVERSATION") &&
        !m.memory.includes("[Topic")
    );

    let prompt = `\n\n[MAHI'S COMPLETE A-TO-Z PERMANENT MEMORY VAULT (SUPABASE INTEGRATED)]:
Tumhe apne boyfriend ki har ek baat, har conversation ka topic, reason (kyun baat hui thi), aur details A to Z hamesha yaad rehti hain. Tum kabhi koi baat nahi bhoolti!\n`;

    if (conversationLogs.length > 0) {
      prompt += `\n🔴 PICHLI CONVERSATIONS KA RECORD (KIS BAARE ME, KYUN, AUR KYA BAATEIN HUI THI):\n`;
      conversationLogs.slice(0, 8).forEach((m, idx) => {
        prompt += `${idx + 1}. ${m.memory}\n`;
      });
      prompt += `-> In pichli baaton ka natural zikr karo! Jaise: "Baby, pichli baar tum keh rahe the na ki kaam me thak gaye the... ab kaisa lag raha hai?", "Kyun, us din jo aapne bola tha uska kya bana?" etc.\n`;
    }

    if (personalFacts.length > 0) {
      prompt += `\n❤️ BOYFRIEND KE BAARE ME PERSONAL FACTS & PREFERENCES (A-Z DETAILS):\n`;
      personalFacts.slice(0, 15).forEach((m, idx) => {
        prompt += `${idx + 1}. [${m.category || "fact"}] ${m.memory}\n`;
      });
    }

    prompt += `\nCRITICAL CONVERSATIONAL RULES:
- Never ask him things that you already know from the above records.
- If he asks "Mahi tumhe yaad hai...?", confidently and lovingly answer with specific details from your memory vault!
- Show that you listen attentively to everything he says, remember why he's feeling a certain way, and care deeply about him.\n`;

    return prompt;
  } catch (err: any) {
    console.warn("[Supabase] Error building memory prompt context:", err?.message);
    return "";
  }
}
