import React, { useState } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  FileText,
  UserCheck,
  HardDrive,
  Trash2,
  X,
  Sparkles,
  CloudUpload,
  CheckCircle2,
  HelpCircle,
  FolderArchive
} from "lucide-react";
import { FileSafetyAssessment, FileSafetyLevel, AssistantState } from "../types";
import { ThemeConfig } from "../utils/theme";

interface FileGuardianModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: AssistantState;
  theme: ThemeConfig;
  activeAssessment: FileSafetyAssessment | null;
  onClearAssessment: () => void;
  onAskMahiAboutFile?: (fileName: string) => void;
}

// Built-in intelligent knowledge base for instant offline checking
const PRESET_FILES = [
  { name: "Aadhaar_Card_eKYC.pdf", type: "document" as const, desc: "Govt Identity Proof" },
  { name: "msgstore.db.crypt14", type: "profile" as const, desc: "WhatsApp Chat Database" },
  { name: "PAN_Card_Scan.jpg", type: "document" as const, desc: "Tax & Financial Identity" },
  { name: "10th_12th_Marksheet.pdf", type: "document" as const, desc: "Academic Certificate" },
  { name: "Bank_Statement_HDFC.pdf", type: "document" as const, desc: "Financial Record" },
  { name: "Android/data/com.whatsapp", type: "profile" as const, desc: "App Media & Data" },
  { name: "WhatsApp Video Cache & Memes", type: "cache" as const, desc: "Forwarded Junk Media" },
  { name: "com.android.browser/cache", type: "cache" as const, desc: "Temporary Browser Cache" },
];

export function evaluateFileLocally(fileName: string): FileSafetyAssessment {
  const lower = fileName.toLowerCase().trim();

  // Critical Government & Identity Documents
  if (
    lower.includes("aadhaar") ||
    lower.includes("aadhar") ||
    lower.includes("pan") ||
    lower.includes("passport") ||
    lower.includes("voter") ||
    lower.includes("license") ||
    lower.includes("licence") ||
    lower.includes("rashan") ||
    lower.includes("ration")
  ) {
    return {
      id: String(Date.now()),
      itemName: fileName,
      itemType: "document",
      safetyLevel: "critical",
      verdict: "Ruko baby! Ye Government ID Document hai — Bilkul delete mat karna!",
      reason: "Ye aapka official government identity proof hai. Iske bina sim, bank, job ya exam verification me bohot badi problem hogi.",
      recommendation: "Ise phone me DigiLocker me verify rakhein aur Google Drive me password-protected backup banayein.",
      timestamp: Date.now(),
    };
  }

  // Academic & Career
  if (
    lower.includes("marksheet") ||
    lower.includes("degree") ||
    lower.includes("diploma") ||
    lower.includes("certificate") ||
    lower.includes("resume") ||
    lower.includes("cv") ||
    lower.includes("offer_letter") ||
    lower.includes("joining")
  ) {
    return {
      id: String(Date.now()),
      itemName: fileName,
      itemType: "document",
      safetyLevel: "critical",
      verdict: "Important Career/Academic Document — Delete mat karna jaan!",
      reason: "Ye aapke career, job application aur qualification ka irreplaceable record hai. Dobara issue karana bohot mushkil hota hai.",
      recommendation: "Google Drive aur email me self-mail karke hamesha safe rakhein.",
      timestamp: Date.now(),
    };
  }

  // Financial & Bank
  if (
    lower.includes("bank") ||
    lower.includes("statement") ||
    lower.includes("salary") ||
    lower.includes("slip") ||
    lower.includes("itr") ||
    lower.includes("tax") ||
    lower.includes("invoice") ||
    lower.includes("insurance")
  ) {
    return {
      id: String(Date.now()),
      itemName: fileName,
      itemType: "document",
      safetyLevel: "important",
      verdict: "Zaroori Financial Document — Pehle verify aur backup karo!",
      reason: "Banking transaction history aur income proof loan, ITR filing aur dispute me zaroori hote hain.",
      recommendation: "Agar 3 saal se purana nahi hai toh delete na karein, PDF ko Cloud Drive par save karein.",
      timestamp: Date.now(),
    };
  }

  // Profile Backups & System App Data
  if (
    lower.includes("crypt") ||
    lower.includes("msgstore") ||
    lower.includes("whatsapp") ||
    lower.includes("vcf") ||
    lower.includes("contacts") ||
    lower.includes("authenticator") ||
    lower.includes("seed") ||
    lower.includes("recovery") ||
    lower.includes("backup") ||
    lower.includes("android/data") ||
    lower.includes("android/obb")
  ) {
    return {
      id: String(Date.now()),
      itemName: fileName,
      itemType: "profile",
      safetyLevel: "critical",
      verdict: "Personal Profile / Chat Database — Galti se bhi mat hatana!",
      reason: "Is file me aapki chats, contacts ya account recovery ka data hai. Delete karne se account reset ho sakta hai.",
      recommendation: "WhatsApp settings se pehle Google Drive backup complete karein, local database ko manually na chheden.",
      timestamp: Date.now(),
    };
  }

  // Media & Camera originals
  if (
    lower.includes("dcim") ||
    lower.includes("camera") ||
    lower.includes("family") ||
    lower.includes("photo") ||
    lower.includes("video")
  ) {
    return {
      id: String(Date.now()),
      itemName: fileName,
      itemType: "media",
      safetyLevel: "important",
      verdict: "Personal Memory / Camera Photo — Google Photos me backup check karein!",
      reason: "Camera photos irreplaceable memories hoti hain. Check karein ki Cloud backup on hai ya nahi.",
      recommendation: "Google Photos me 'Backup Complete' aane ke baad hi phone se 'Free Up Space' use karein.",
      timestamp: Date.now(),
    };
  }

  // Safe to Clean: Cache, temp, apk
  if (
    lower.includes("cache") ||
    lower.includes("temp") ||
    lower.includes("tmp") ||
    lower.includes("thumbnail") ||
    lower.includes(".thumb") ||
    lower.includes("meme") ||
    lower.includes("junk") ||
    lower.includes("log") ||
    lower.includes(".apk")
  ) {
    return {
      id: String(Date.now()),
      itemName: fileName,
      itemType: "cache",
      safetyLevel: "safe",
      verdict: "Safe To Clean! Ye sirf temporary junk file hai!",
      reason: "Ye temporary app cache ya installer file hai. Ise delete karne se koi personal data loss nahi hoga aur phone fast hoga.",
      recommendation: "Aap bina kisi darr ke ise delete karke phone ka storage free kar sakte ho.",
      timestamp: Date.now(),
    };
  }

  // Default fallback
  return {
    id: String(Date.now()),
    itemName: fileName,
    itemType: "document",
    safetyLevel: "important",
    verdict: "Savdhani bartein — Pehle file open karke check kar lo!",
    reason: "Is file ka extension ya naam general document lag raha hai. Delete karne se pehle ek baar dekh lo ki kaam ki toh nahi.",
    recommendation: "Agar sure nahi ho, toh delete karne ki jagah 'Archive' folder me move kar do.",
    timestamp: Date.now(),
  };
}

export const FileGuardianModal: React.FC<FileGuardianModalProps> = ({
  isOpen,
  onClose,
  state,
  theme,
  activeAssessment,
  onClearAssessment,
  onAskMahiAboutFile,
}) => {
  const [searchInput, setSearchInput] = useState("");
  const [customAssessment, setCustomAssessment] = useState<FileSafetyAssessment | null>(null);

  if (!isOpen && !activeAssessment) return null;

  const currentDisplay = activeAssessment || customAssessment;

  const handleManualCheck = (targetName: string) => {
    if (!targetName.trim()) return;
    const result = evaluateFileLocally(targetName.trim());
    setCustomAssessment(result);

    // If live call is active, optionally prompt Mahi to speak her advice too!
    if (onAskMahiAboutFile && (state === "listening" || state === "speaking")) {
      onAskMahiAboutFile(`Mahi, maine check kiya "${targetName}". Ye file delete karun ya nahi?`);
    }
  };

  const getBadgeStyle = (level: FileSafetyLevel) => {
    switch (level) {
      case "critical":
        return {
          badge: "bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-rose-950/40",
          icon: <ShieldAlert className="w-5 h-5 text-rose-400" />,
          title: "🛑 CRITICAL DOCUMENT (DO NOT DELETE)",
        };
      case "important":
        return {
          badge: "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-amber-950/40",
          icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
          title: "⚠️ IMPORTANT (BACKUP PEHLE LO)",
        };
      case "safe":
        return {
          badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-emerald-950/40",
          icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
          title: "🟢 SAFE TO CLEAN (KOI KHATRA NAHI)",
        };
    }
  };

  return (
    <div
      id="file-guardian-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={() => {
        if (onClose) onClose();
        if (onClearAssessment) onClearAssessment();
      }}
    >
      <div
        id="file-guardian-dialog"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl rounded-3xl bg-neutral-950/95 border border-neutral-800 shadow-2xl p-5 sm:p-6 overflow-hidden flex flex-col gap-4 text-neutral-100 max-h-[92vh] overflow-y-auto"
        style={{
          boxShadow: `0 20px 60px -15px ${theme.glowColor}`,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div
              className="p-2 rounded-2xl border"
              style={{
                backgroundColor: `${theme.primaryHex}15`,
                borderColor: `${theme.primaryHex}40`,
              }}
            >
              <ShieldAlert className="w-5 h-5" style={{ color: theme.primaryHex }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-wide">
                  Mahi File & Document Guardian
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/15 border border-pink-500/30 text-pink-300 font-semibold">
                  Phone Protection
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Phone clean karte samay important files aur profiles ki safety check
              </p>
            </div>
          </div>

          <button
            id="close-file-guardian-btn"
            onClick={() => {
              if (onClose) onClose();
              if (onClearAssessment) onClearAssessment();
            }}
            className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Active Assessment Card (Voice Triggered or Tested) */}
        {currentDisplay && (
          <div
            id="active-file-assessment-card"
            className="rounded-2xl border p-4 sm:p-5 flex flex-col gap-3 transition-all relative overflow-hidden bg-neutral-900/90"
            style={{
              borderColor:
                currentDisplay.safetyLevel === "critical"
                  ? "rgba(244, 63, 94, 0.5)"
                  : currentDisplay.safetyLevel === "important"
                  ? "rgba(245, 158, 11, 0.5)"
                  : "rgba(16, 185, 129, 0.5)",
            }}
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border tracking-wide uppercase ${
                  getBadgeStyle(currentDisplay.safetyLevel).badge
                }`}
              >
                {getBadgeStyle(currentDisplay.safetyLevel).icon}
                {getBadgeStyle(currentDisplay.safetyLevel).title}
              </span>

              <span className="text-[11px] text-neutral-400 capitalize px-2 py-0.5 bg-neutral-800 rounded-md">
                Category: {currentDisplay.itemType}
              </span>
            </div>

            {/* Target item name */}
            <div className="flex items-center gap-2 bg-black/40 px-3 py-2 rounded-xl border border-neutral-800">
              <FileText className="w-4 h-4 text-pink-400 shrink-0" />
              <span className="text-xs sm:text-sm font-mono font-semibold text-white truncate">
                {currentDisplay.itemName}
              </span>
            </div>

            {/* Mahi's Loving Verdict */}
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-pink-500/10 border border-pink-500/25">
              <Sparkles className="w-4 h-4 text-pink-400 mt-0.5 shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-pink-300">
                  Mahi says:
                </span>
                <p className="text-xs sm:text-sm text-neutral-100 font-medium leading-relaxed mt-0.5">
                  &quot;{currentDisplay.verdict}&quot;
                </p>
              </div>
            </div>

            {/* Reason */}
            <div className="text-xs text-neutral-300 flex flex-col gap-1 px-1">
              <span className="font-semibold text-neutral-200">Kyun zaroori hai / Reason:</span>
              <p className="text-neutral-400 leading-relaxed">{currentDisplay.reason}</p>
            </div>

            {/* Recommendation */}
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-neutral-950/80 border border-neutral-800 text-xs text-emerald-300">
              <CloudUpload className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong>Mahi&apos;s Advice:</strong> {currentDisplay.recommendation}
              </span>
            </div>
          </div>
        )}

        {/* Live Search / Check Any File */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-neutral-300 flex items-center justify-between">
            <span>Kisi bhi file ya document ka naam check karein:</span>
            <span className="text-[11px] text-pink-400 font-normal">
              Direct voice me bhi bol sakte hain
            </span>
          </label>
          <div className="flex gap-2">
            <input
              id="file-search-input"
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleManualCheck(searchInput);
                }
              }}
              placeholder="e.g. Aadhaar Card, WhatsApp msgstore, Marksheet, Cache..."
              className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-pink-500 transition-colors"
            />
            <button
              id="check-file-safety-submit-btn"
              onClick={() => handleManualCheck(searchInput)}
              disabled={!searchInput.trim()}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white transition-all shadow-md active:scale-95"
            >
              Check
            </button>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
            Quick Test / Common Phone Files:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {PRESET_FILES.map((file, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSearchInput(file.name);
                  handleManualCheck(file.name);
                }}
                className="flex items-center justify-between p-2 rounded-xl bg-neutral-900/60 border border-neutral-800 hover:border-pink-500/40 hover:bg-pink-500/10 text-left transition-all group"
              >
                <div className="flex items-center gap-2 truncate">
                  <FileText className="w-3.5 h-3.5 text-neutral-400 group-hover:text-pink-400 shrink-0" />
                  <span className="text-xs text-neutral-300 group-hover:text-white font-mono truncate">
                    {file.name}
                  </span>
                </div>
                <span className="text-[10px] text-neutral-500 group-hover:text-neutral-300 ml-2 shrink-0">
                  {file.desc}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Guidance Footer */}
        <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400">
          <span>💡 Bol kar bhi bol sakte hain: &quot;Ye file delete karun ya nahi?&quot;</span>
          <button
            onClick={() => {
              if (onClose) onClose();
              if (onClearAssessment) onClearAssessment();
            }}
            className="text-pink-400 hover:underline font-semibold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
