import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Share2, MessageCircle, Copy, Check, ShieldCheck, 
  MapPin, Users, Award, IndianRupee, ExternalLink 
} from "lucide-react";

export default function ShareWithParentsModal({ institute, onClose }) {
  const [copied, setCopied] = useState(false);
  const [parentPhone, setParentPhone] = useState("");

  if (!institute) return null;

  const currentUrl = `${window.location.origin}/find-coaching?q=${encodeURIComponent(institute.name)}`;

  const shareText = `🎓 *FutureSelector Verified Coaching Report*
🏢 *${institute.name}*
📍 Location: ${institute.locality || institute.location}
🎯 Exam: ${institute.type}
👥 Audited Batch Size: ${institute.batchSize}
📈 Selection Rate: ${institute.selectionRate}
🏆 Top Milestone: ${institute.topRank}
💰 Tuition Fee: ${institute.fees}
🏠 Hostels: ${institute.hostelDistance}

🔗 *Full Audited Details & Fee Breakdown:*
${currentUrl}

_Shared via FutureSelector — Right Guidance. Brighter Tomorrows._`;

  const handleCopy = () => {
    navigator.clipboard?.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendWhatsApp = () => {
    let url = "";
    if (parentPhone.trim()) {
      const cleanPhone = parentPhone.replace(/[^0-9]/g, "");
      const formatted = cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`;
      url = `https://api.whatsapp.com/send?phone=${formatted}&text=${encodeURIComponent(shareText)}`;
    } else {
      url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    }
    window.open(url, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className="bg-surface rounded-3xl border border-border shadow-2xl max-w-lg w-full overflow-hidden relative my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-brand-900 to-emerald-950 text-white p-5 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Share2 className="w-3.5 h-3.5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              Parent Discussion Tool
            </span>
          </div>

          <h3 className="text-lg font-extrabold text-white">
            Share with Parents on WhatsApp
          </h3>
          <p className="text-xs text-emerald-100/80 mt-0.5">
            Send an audited, transparent summary directly to your parents without commercial hype.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          
          {/* WhatsApp Chat Preview Bubble */}
          <div>
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-textMuted block mb-2">
              WhatsApp Message Preview:
            </label>
            <div className="bg-[#E7F6EC] dark:bg-emerald-950/40 border border-emerald-300/80 dark:border-emerald-700/50 rounded-2xl p-4 text-xs font-mono text-slate-800 dark:text-emerald-100 leading-relaxed shadow-inner space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>FutureSelector Verified Coaching Report</span>
              </div>
              <div className="font-bold text-sm text-textMain pt-0.5">{institute.name}</div>
              <div className="text-[11px] text-textMuted">
                📍 {institute.locality || institute.location} • 🎯 {institute.type}
              </div>
              <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px]">
                <div>👥 <strong>Batch:</strong> {institute.batchSize}</div>
                <div>📈 <strong>Selection:</strong> {institute.selectionRate}</div>
                <div>🏆 <strong>Rank:</strong> {institute.topRank}</div>
                <div>💰 <strong>Fee:</strong> {institute.fees}</div>
              </div>
              <div className="pt-1 text-[10px] text-emerald-700 dark:text-emerald-400 font-sans italic border-t border-emerald-200/60 dark:border-emerald-800/60">
                ✓ Includes itemized tuition, real batch ceilings & hostel proximity
              </div>
            </div>
          </div>

          {/* Optional: Enter Parent Phone */}
          <div>
            <label className="text-xs font-extrabold uppercase tracking-wider text-textMuted block mb-1.5">
              Parent's WhatsApp Number (Optional)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-textMuted">
                +91
              </span>
              <input
                type="tel"
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value)}
                placeholder="Enter 10-digit mobile number"
                className="w-full pl-12 pr-4 py-2.5 bg-background border border-border rounded-xl text-xs font-semibold text-textMain placeholder:text-textMuted/60 focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-500/10"
              />
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleSendWhatsApp}
              className="flex-1 bg-[#25D366] hover:bg-[#20BD5A] text-white py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Send on WhatsApp</span>
            </button>

            <button
              onClick={handleCopy}
              className="flex-1 btn-secondary py-3 px-4 text-xs font-bold justify-center gap-2 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-textMuted" />
                  <span>Copy Summary</span>
                </>
              )}
            </button>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
