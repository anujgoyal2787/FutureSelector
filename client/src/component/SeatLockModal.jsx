import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, ShieldCheck, Check, Sparkles, Building2, Calendar, 
  Clock, Users, Award, Share2, Copy, Download, CheckCircle2,
  AlertCircle, ChevronRight, Lock
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { voucherAPI } from "../services/api";
import { generateAdmissionPassPDF } from "../utils/pdfGenerator";

export default function SeatLockModal({ 
  institute, 
  batches = [], 
  initialBatch = null, 
  onClose,
  couponCode = "" 
}) {
  const { user, addLockedSeat } = useAuth();
  const [selectedBatch, setSelectedBatch] = useState(
    initialBatch || (batches[0]?.name || "Nurture Foundation Batch")
  );
  const [studentName, setStudentName] = useState(user?.name || "");
  const [studentPhone, setStudentPhone] = useState(user?.phone?.replace("+91 ", "") || "");
  const [parentName, setParentName] = useState("");
  const [targetStream, setTargetStream] = useState(user?.exam || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [voucherId, setVoucherId] = useState("");
  const [copiedVoucher, setCopiedVoucher] = useState(false);

  if (!institute) return null;

  const codeToUse = couponCode || `FS-${institute.name.split(" ")[0].toUpperCase()}-15K`;

  const [consentAgreed, setConsentAgreed] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!consentAgreed) {
      alert("Please confirm data-sharing consent to lock your pass with this center.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await voucherAPI.claimPass({
        studentName: studentName || user?.name || "Student Aspirant",
        studentPhone: studentPhone || user?.phone || "",
        studentEmail: user?.email || "aspirant@futureselector.in",
        instituteId: institute.numericId || institute.id || 1,
        instituteName: institute.name,
        batch: selectedBatch,
        discountAmount: "₹15,000 Flat Grant"
      });

      const generatedId = res.voucher?.voucherId || `FS-SEAT-${Math.floor(1000 + Math.random() * 9000)}`;
      setVoucherId(generatedId);

      if (addLockedSeat) {
        addLockedSeat({
          voucherId: generatedId,
          instituteId: institute.numericId || institute.id,
          instituteName: institute.name,
          batch: selectedBatch,
          discountAmount: "₹15,000 Flat Grant",
          code: res.voucher?.code || codeToUse,
          studentName: studentName || user?.name || "Student Aspirant"
        });
      }
      setIsConfirmed(true);
    } catch (err) {
      alert(err.message || "Failed to lock pass. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShareWhatsApp = () => {
    const text = `🎓 *Official FutureSelector Admission Voucher*
🏢 *${institute.name}*
🎫 *Voucher Pass ID:* ${voucherId}
🎟️ *Grant Discount:* Flat ₹15,000 Off at Counter
📚 *Batch:* ${selectedBatch}
👤 *Student:* ${studentName} (${studentPhone})
🛡️ *Refund Guarantee:* 15-Day 100% Escrow Protection by FutureSelector
🏛️ *Present at official accounts desk during admission.*`;
    
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const handleCopyVoucher = () => {
    navigator.clipboard?.writeText(voucherId);
    setCopiedVoucher(true);
    setTimeout(() => setCopiedVoucher(false), 2500);
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 380, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-surface rounded-3xl border border-border shadow-2xl max-w-xl w-full overflow-hidden relative my-6 max-h-[92vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-brand-900 via-brand-800 to-emerald-950 text-white p-5 sm:p-6 relative shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-gold-500/20 text-gold-300 border border-gold-400/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-gold-400" />
                  Official Admission Voucher
                </span>
                <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-400/30 px-2 py-0.5 rounded-full">
                  100% Free Booking
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-white">
                {isConfirmed ? "Seat Locked Successfully!" : `Lock 2026 Seat at ${institute.name}`}
              </h3>
              <p className="text-xs text-white/80">
                {isConfirmed ? "Your official voucher pass is ready to present at the center counter." : "Guaranteed ₹15,000 fee waiver & 15-day Supreme Court refund protection."}
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {!isConfirmed ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Grant Banner Card */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-brand-500/10 to-gold-500/10 border border-emerald-500/30 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                    <Sparkles className="w-4 h-4 text-gold-300" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <span>₹15,000 Admission Grant Applied</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <span className="text-[11px] text-textMuted font-medium block">
                      Code: <code className="font-mono font-bold text-brand-700 bg-white px-1.5 py-0.5 rounded border border-brand-200">{codeToUse}</code>
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-md shrink-0">
                  Direct Counter Off
                </span>
              </div>

              {/* Batch Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-900 block">
                  Select Target 2026 Batch:
                </label>
                <div className="space-y-2">
                  {(batches.length > 0 ? batches : [
                    { name: "Nurture Foundation Batch", seatsLeft: "4 Seats Left", timings: "08:00 AM – 01:30 PM", startDate: "15 April 2026" },
                    { name: "Enthusiast Core Batch", seatsLeft: "8 Seats Left", timings: "08:30 AM – 02:00 PM", startDate: "22 April 2026" },
                    { name: "Leader Dropper Batch (Phase 1)", seatsLeft: "6 Seats Left", timings: "07:30 AM – 01:00 PM", startDate: "06 May 2026" }
                  ]).map((b, idx) => {
                    const isSelected = selectedBatch === b.name;
                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedBatch(b.name)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2 text-xs ${
                          isSelected
                            ? "bg-brand-500/10 border-brand-600 shadow-xs"
                            : "bg-background border-border hover:border-brand-300"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            isSelected ? "border-brand-600 bg-brand-600" : "border-textMuted/40 bg-surface"
                          }`}>
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{b.name}</span>
                            <span className="text-[11px] text-textMuted">Starts {b.startDate} • {b.timings}</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-extrabold text-rose-700 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-md shrink-0">
                          {b.seatsLeft}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Student Details Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-900 block">Student Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter student's name"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2.5 font-semibold text-slate-900 placeholder:text-textMuted focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-900 block">WhatsApp Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    placeholder="10-digit phone number"
                    value={studentPhone}
                    onChange={(e) => setStudentPhone(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2.5 font-semibold text-slate-900 placeholder:text-textMuted focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-900 block">Parent / Guardian Name</label>
                  <input
                    type="text"
                    placeholder="Parent's name"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2.5 font-semibold text-slate-900 placeholder:text-textMuted focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-900 block">Target Stream</label>
                  <select
                    value={targetStream}
                    onChange={(e) => setTargetStream(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2.5 font-bold text-slate-900 focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
                  >
                    <option>2026 JEE Advanced</option>
                    <option>2026 NEET-UG</option>
                    <option>2-Year Foundation (JEE/NEET)</option>
                    <option>12th Dropper Batch (JEE/NEET)</option>
                  </select>
                </div>
              </div>

              {/* Fee Transparency Box */}
              <div className="p-3.5 rounded-2xl bg-surface border border-border space-y-2 text-xs">
                <div className="flex items-center justify-between text-textMuted">
                  <span>Official Center Tuition:</span>
                  <span className="line-through">{institute.fees}</span>
                </div>
                <div className="flex items-center justify-between font-bold text-emerald-700">
                  <span className="flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    FutureSelector Admission Grant:
                  </span>
                  <span>-₹15,000 Flat Off</span>
                </div>
                <div className="flex items-center justify-between font-bold text-textMuted">
                  <span>15-Day Escrow Protection:</span>
                  <span className="text-emerald-700">Included Free</span>
                </div>
                <div className="pt-2 border-t border-border flex items-center justify-between font-extrabold text-sm text-slate-900">
                  <span>Payable at Center Counter:</span>
                  <span className="text-brand-800">
                    {institute.numericFee ? `₹${(institute.numericFee - 15000).toLocaleString("en-IN")}` : "Fee - ₹15,000"}
                  </span>
                </div>
                <div className="text-[10px] text-textMuted text-right">
                  Reservation Fee Today: <span className="font-bold text-emerald-700">₹0 (100% Free Booking)</span>
                </div>
              </div>

              {/* Trust Badges Row */}
              <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                <div className="p-2 rounded-xl bg-background border border-border/80">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                  <span className="text-[10px] font-bold text-slate-900 block leading-tight">15-Day Refund</span>
                  <span className="text-[9px] text-textMuted">Supreme Court</span>
                </div>
                <div className="p-2 rounded-xl bg-background border border-border/80">
                  <Users className="w-4 h-4 text-brand-600 mx-auto mb-1" />
                  <span className="text-[10px] font-bold text-slate-900 block leading-tight">Max 40 Cap</span>
                  <span className="text-[9px] text-textMuted">Audited Limit</span>
                </div>
                <div className="p-2 rounded-xl bg-background border border-border/80">
                  <Award className="w-4 h-4 text-gold-600 mx-auto mb-1" />
                  <span className="text-[10px] font-bold text-slate-900 block leading-tight">Student Mentor</span>
                  <span className="text-[9px] text-textMuted">1-Yr Neutral</span>
                </div>
              </div>

              {/* Explicit Student Consent & Data-Sharing Notice */}
              <label className="flex items-start gap-2.5 p-3 rounded-2xl bg-brand-50/60 border border-brand-200/80 cursor-pointer text-left">
                <input
                  type="checkbox"
                  required
                  checked={consentAgreed}
                  onChange={(e) => setConsentAgreed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-[#124B38] shrink-0"
                />
                <span className="text-[11px] text-slate-700 leading-tight">
                  I explicitly confirm interest in <strong>{institute.name}</strong> and authorize FutureSelector to release my verified contact details and ₹15,000 Seat Lock Pass to the center desk under FutureSelector Data Protection Policy (v1.0).
                </span>
              </label>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !consentAgreed}
                className="w-full btn-primary py-3 text-xs sm:text-sm font-extrabold justify-center cursor-pointer shadow-md active:scale-95 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <span>Generating Official Voucher...</span>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Confirm Seat Lock & Generate Official Voucher</span>
                  </>
                )}
              </button>

            </form>
          ) : (
            /* Step 2: Official Verified Admission Voucher */
            <div className="space-y-4">
              
              {/* Success Notification */}
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-1">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="font-extrabold text-sm text-emerald-950">
                  Seat Successfully Locked & Protected!
                </h4>
                <p className="text-xs text-textMuted">
                  Your official admission voucher has been dispatched to {studentPhone || "your phone"} via SMS.
                </p>
              </div>

              {/* Boarding Pass / Voucher Certificate Card */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-surface via-surface to-brand-500/5 border-2 border-brand-500/40 shadow-xl space-y-4 relative overflow-hidden">
                <div className="flex items-center justify-between pb-3 border-b-2 border-dashed border-border">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-brand-700 text-white flex items-center justify-center font-bold shadow-xs">
                      <Building2 className="w-5 h-5 text-gold-300" />
                    </div>
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-wider text-brand-700">FutureSelector Verified Voucher</div>
                      <h4 className="font-extrabold text-sm text-slate-900">{institute.name}</h4>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs font-black text-brand-900 bg-brand-500/15 px-2.5 py-1 rounded-lg border border-brand-500/30 block">
                      {voucherId}
                    </span>
                    <span className="text-[9px] text-emerald-700 font-bold">VERIFIED ACTIVE</span>
                  </div>
                </div>

                {/* Voucher Meta Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-textMuted font-bold uppercase block">Student Name:</span>
                    <span className="font-bold text-slate-900">{studentName || "Verified Aspirant"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-textMuted font-bold uppercase block">Mobile Number:</span>
                    <span className="font-bold text-slate-900 font-mono">+91 {studentPhone || "9876543210"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-textMuted font-bold uppercase block">Target Batch:</span>
                    <span className="font-bold text-brand-800">{selectedBatch}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-textMuted font-bold uppercase block">Admission Discount:</span>
                    <span className="font-extrabold text-emerald-700">₹15,000 Flat Off</span>
                  </div>
                </div>

                {/* Escrow Seal Banner */}
                <div className="p-2.5 rounded-xl bg-background border border-border text-[11px] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-textMuted">
                    <strong className="text-slate-900">15-Day Escrow Guarantee:</strong> Full refund protected under Supreme Court guidelines if claimed within 15 days of class start.
                  </span>
                </div>

                {/* Barcode & Verification Footer */}
                <div className="pt-2 border-t border-border flex items-center justify-between text-[10px] text-textMuted font-mono">
                  <span>VALIDITY: 7 DAYS AT COUNTER</span>
                  <span className="tracking-widest font-black text-slate-600">||||| | |||| ||||| ||</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
                <button
                  onClick={handleShareWhatsApp}
                  className="w-full sm:flex-1 bg-[#25D366] hover:bg-[#20BD5A] text-white py-2.5 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share Voucher to Parents</span>
                </button>

                <button
                  onClick={() => {
                    generateAdmissionPassPDF(
                      {
                        voucherId,
                        instituteName: institute.name,
                        batch: selectedBatch,
                        discountAmount: "₹15,000 Flat Grant",
                        code: codeToUse,
                        validTill: "Valid till 30 Nov 2026"
                      },
                      {
                        name: studentName || user?.name || "Student Aspirant",
                        phone: studentPhone || user?.phone || "Verified Student",
                        exam: targetStream || user?.exam || "Competitive Exam",
                        city: institute.location
                      }
                    );
                  }}
                  className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  title="Download printable official vector PDF pass"
                >
                  <Download className="w-4 h-4 text-emerald-700" />
                  <span>Download PDF Pass</span>
                </button>

                <button
                  onClick={handleCopyVoucher}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-border bg-background hover:bg-surface text-slate-900 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedVoucher ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedVoucher ? "Code Copied" : "Copy Code"}</span>
                </button>

                <button
                  onClick={onClose}
                  className="w-full sm:w-auto btn-primary py-2.5 px-5 text-xs font-bold justify-center cursor-pointer"
                >
                  Done
                </button>
              </div>

            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
