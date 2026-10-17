import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Heart, Sparkles, LogOut, ArrowRight, BookOpen, ShieldCheck, 
  CheckCircle2, Download, Share2, Copy, Check, MapPin, IndianRupee,
  Users, Award, Phone, Calendar, Clock, QrCode, ArrowRightLeft, ExternalLink
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { institutesData } from "../data/institutes";
import SeatLockModal from "../component/SeatLockModal";
import StarBorder from "../component/reactbits/StarBorder";
import ShinyText from "../component/reactbits/ShinyText";
import BorderBeam from "../component/reactbits/BorderBeam";

export default function Dashboard() {
  const { user, logout, openAuthModal, toggleShortlist } = useAuth();
  const [activeTab, setActiveTab] = useState("vouchers"); // "vouchers" | "shortlist" | "counselling"
  const [copiedCode, setCopiedCode] = useState(false);
  const [seatLockTarget, setSeatLockTarget] = useState(null);

  // Default active admission voucher for demo/registered user
  const activeVoucher = useMemo(() => {
    return {
      voucherId: "FS-SEAT-7429",
      instituteName: "Aakash Institute (Janakpuri West)",
      batch: "2026 Regular Classroom Batch (NEET-UG)",
      discountAmount: "₹15,000 Flat Grant",
      status: "ACTIVE • PRESENT AT COUNTER",
      validTill: "Valid till 30 Nov 2025",
      escrowDays: "15-Day Escrow Protected",
      code: "FS-AAKASH-15K"
    };
  }, []);

  // Shortlisted institutes objects
  const shortlistedInstitutes = useMemo(() => {
    if (!user?.shortlisted || user.shortlisted.length === 0) {
      // Provide first 2 as default sample if none
      return [institutesData[0], institutesData[2]];
    }
    return institutesData.filter(inst => user.shortlisted.includes(inst.id));
  }, [user]);

  const handleCopyVoucher = () => {
    navigator.clipboard?.writeText(activeVoucher.voucherId);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const text = `🎓 *Official FutureSelector Admission Pass*\n` +
      `🎫 *Voucher ID:* ${activeVoucher.voucherId}\n` +
      `🏛️ *Center:* ${activeVoucher.instituteName}\n` +
      `💰 *Waiver Amount:* ${activeVoucher.discountAmount}\n` +
      `🛡️ *Security:* 15-Day 100% Supreme Court Refund Protection\n` +
      `📅 *Status:* ${activeVoucher.status}\n` +
      `Present this at the center cash counter during batch enrollment.`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const handlePrint = () => {
    window.print();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background pt-28 pb-20 px-4 sm:px-6 flex items-center justify-center">
        <div className="bg-surface border border-border rounded-3xl p-8 max-w-md w-full text-center shadow-card space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center mx-auto shadow-2xs">
            <User className="w-8 h-8 text-brand-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Student Dashboard</h2>
          <p className="text-xs sm:text-sm text-textMuted leading-relaxed">
            Please log in to access your verified admission pass, active ₹15,000 fee waiver vouchers, and saved coaching comparisons.
          </p>
          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={() => openAuthModal(null, "Log in to access your student dashboard.")}
              className="btn-primary text-xs py-3 w-full font-bold shadow-md"
            >
              Sign In to Your Account
            </button>
            <Link to="/" className="btn-secondary text-xs py-3 w-full text-center font-bold">
              Back to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 sm:pt-28 pb-20 px-4 sm:px-6 relative overflow-hidden">
      
      {/* Soft Ambient Glows */}
      <div className="absolute top-10 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-brand-600/8 via-emerald-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[450px] h-[450px] bg-gradient-to-bl from-gold-500/10 via-amber-400/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10 space-y-6 sm:space-y-8">
        
        {/* ============================================================ */}
        {/* 1. ASPIRANT COMMAND PROFILE HEADER */}
        {/* ============================================================ */}
        <div className="bg-surface border-2 border-border/80 rounded-3xl p-5 sm:p-7 shadow-[0_12px_36px_rgba(18,75,56,0.06)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-brand-700 to-brand-900 text-white font-black text-2xl flex items-center justify-center shadow-md shrink-0">
              {user.name?.charAt(0) || "A"}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 truncate">{user.name}</h1>
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-300 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified Aspirant Pass
                </span>
              </div>
              <p className="text-xs text-textMuted mt-1 font-medium">
                Target: <strong className="text-brand-900 font-bold">{user.exam || "JEE Advanced / NEET"}</strong> • Preferred Hub: <strong className="text-slate-900 font-bold">{user.city || "Kota / Delhi NCR"}</strong> • Pass Active
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
            <button
              onClick={handlePrint}
              className="btn-secondary text-xs py-2 px-3.5 gap-1.5 font-bold cursor-pointer hidden md:flex"
              title="Print dashboard report"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Print Pass</span>
            </button>

            <button
              onClick={logout}
              className="btn-secondary text-xs py-2 px-3.5 gap-1.5 font-bold text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 2. DASHBOARD SEGMENTED TABS */}
        {/* ============================================================ */}
        <div className="flex items-center gap-2 border-b border-border/80 pb-2 overflow-x-auto no-scrollbar">
          {[
            { id: "vouchers", label: "Admission Passes & Vouchers", icon: Sparkles, count: "1 Active" },
            { id: "shortlist", label: "Shortlisted Coachings", icon: Heart, count: `${shortlistedInstitutes.length}` },
            { id: "counselling", label: "1-on-1 Academic Advisory", icon: Phone, count: "Free" }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                  isActive
                    ? "bg-brand-600 text-white shadow-xs"
                    : "bg-surface hover:bg-surfaceWarm text-textMuted hover:text-textMain border border-border"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-gold-300" : "text-textMuted"}`} />
                <span>{tab.label}</span>
                <span className={`text-[10px] px-2 py-0.2 rounded-full font-extrabold ${
                  isActive ? "bg-white/20 text-white" : "bg-surfaceWarm text-textMuted"
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ============================================================ */}
        {/* 3. TAB 1: ADMISSION PASSES & COUNTER VOUCHERS */}
        {/* ============================================================ */}
        {activeTab === "vouchers" && (
          <div className="space-y-6">
            
            {/* The Official Digital Admission Voucher Card */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-surface border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-card relative overflow-hidden"
            >
              <BorderBeam size={280} duration={8} borderWidth={2} colorFrom="#10B981" colorTo="#F59E0B" />

              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
                
                {/* Left Pass Details */}
                <div className="space-y-3 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-gold-500/20 text-gold-800 border border-gold-400/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-gold-600" />
                      Official FutureSelector Admission Token
                    </span>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full">
                      {activeVoucher.status}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                    {activeVoucher.instituteName}
                  </h3>

                  <p className="text-xs text-textMuted font-medium">
                    Batch: <strong className="text-slate-900">{activeVoucher.batch}</strong> • {activeVoucher.validTill}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <div className="p-2.5 bg-brand-50 rounded-xl border border-brand-200">
                      <span className="text-[10px] font-bold text-brand-700 uppercase block">Grant Value:</span>
                      <span className="text-sm font-black text-brand-900 font-mono">{activeVoucher.discountAmount}</span>
                    </div>

                    <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200">
                      <span className="text-[10px] font-bold text-emerald-700 uppercase block">Refund Security:</span>
                      <span className="text-sm font-black text-emerald-900 font-mono">15-Day Escrow</span>
                    </div>

                    <div className="p-2.5 bg-surfaceWarm rounded-xl border border-border">
                      <span className="text-[10px] font-bold text-textMuted uppercase block">Voucher Pass ID:</span>
                      <button 
                        onClick={handleCopyVoucher} 
                        className="text-sm font-black text-slate-900 font-mono flex items-center gap-1 cursor-pointer hover:text-brand-700"
                        title="Click to copy ID"
                      >
                        <span>{activeVoucher.voucherId}</span>
                        {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-textMuted" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Actions & QR Code Stamp */}
                <div className="flex flex-col items-center lg:items-end gap-3 shrink-0 self-stretch lg:self-auto border-t lg:border-t-0 pt-4 lg:pt-0 border-border">
                  <div className="p-3 bg-white border border-border rounded-2xl shadow-xs text-center flex flex-col items-center">
                    <QrCode className="w-20 h-20 text-slate-900" />
                    <span className="text-[9px] font-mono font-bold text-textMuted mt-1">COUNTER SCAN READY</span>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={handleShareWhatsApp}
                      className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>WhatsApp to Parents</span>
                    </button>

                    <button
                      onClick={handlePrint}
                      className="px-3 py-2.5 rounded-xl bg-surface hover:bg-surfaceWarm text-textMain border border-border text-xs font-bold transition-all cursor-pointer"
                      title="Download printable slip"
                    >
                      <Download className="w-4 h-4 text-textMuted" />
                    </button>
                  </div>
                </div>

              </div>
            </motion.div>

            {/* Instruction Banner on How to Redeem */}
            <div className="bg-surfaceWarm border border-border rounded-2xl p-5 text-xs space-y-2">
              <span className="font-black text-slate-900 flex items-center gap-1.5 uppercase tracking-wide">
                <CheckCircle2 className="w-4 h-4 text-brand-600" />
                How to redeem your ₹15,000 Counter Waiver:
              </span>
              <ol className="list-decimal list-inside space-y-1 text-slate-700 pl-1">
                <li>Present your Voucher ID (<strong>{activeVoucher.voucherId}</strong>) or QR code directly at the official center accounts desk.</li>
                <li>The center verification system will immediately deduct ₹15,000 from the net annual tuition schedule.</li>
                <li>Your enrollment is backed by the <strong>15-Day 100% Escrow Refund Guarantee</strong> audited by FutureSelector.</li>
              </ol>
            </div>

          </div>
        )}

        {/* ============================================================ */}
        {/* 4. TAB 2: SHORTLISTED COACHINGS */}
        {/* ============================================================ */}
        {activeTab === "shortlist" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-textMuted font-semibold">
                Showing {shortlistedInstitutes.length} saved coaching institutes
              </span>
              <Link 
                to={`/compare?ids=${shortlistedInstitutes.map(i => i.id).join(",")}`}
                className="text-brand-700 font-bold hover:underline flex items-center gap-1"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>Compare All Saved Side-by-Side</span>
              </Link>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {shortlistedInstitutes.map((inst) => (
                <div 
                  key={inst.id}
                  className="bg-surface border border-border rounded-3xl p-5 shadow-card hover:border-brand-300 transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-200">
                          {inst.type}
                        </span>
                        <h4 className="font-black text-base text-slate-900 mt-1">
                          {inst.name}
                        </h4>
                        <div className="flex items-center gap-1 text-xs text-textMuted mt-0.5">
                          <MapPin className="w-3 h-3 text-brand-600" />
                          <span>{inst.location}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => toggleShortlist(inst.id)}
                        className="p-1.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                        title="Remove from saved"
                      >
                        <Heart className="w-4 h-4 fill-rose-500" />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                      <div className="p-2 bg-surfaceWarm rounded-xl border border-border">
                        <span className="text-[9px] uppercase font-bold text-textMuted block">Fees:</span>
                        <span className="text-xs font-black text-slate-900">{inst.fees}</span>
                      </div>
                      <div className="p-2 bg-surfaceWarm rounded-xl border border-border">
                        <span className="text-[9px] uppercase font-bold text-textMuted block">Batch Cap:</span>
                        <span className="text-xs font-black text-emerald-800">{inst.batchSize}</span>
                      </div>
                      <div className="p-2 bg-surfaceWarm rounded-xl border border-border">
                        <span className="text-[9px] uppercase font-bold text-textMuted block">Selection:</span>
                        <span className="text-xs font-black text-brand-900">{inst.selectionRate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-border">
                    <button
                      onClick={() => setSeatLockTarget(inst)}
                      className="flex-1 btn-primary text-xs py-2 px-3 font-bold flex items-center justify-center gap-1 shadow-xs cursor-pointer active:scale-95"
                    >
                      <Sparkles className="w-3 h-3 text-gold-300" />
                      <span>Lock ₹15k Waiver</span>
                    </button>

                    <Link
                      to={`/institute/${inst.id}`}
                      className="btn-secondary text-xs py-2 px-3 font-bold"
                    >
                      View Report
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* 5. TAB 3: 1-ON-1 ACADEMIC ADVISORY CALL */}
        {/* ============================================================ */}
        {activeTab === "counselling" && (
          <div className="bg-surface border border-border rounded-3xl p-6 sm:p-8 shadow-card space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center font-bold">
                <Phone className="w-6 h-6 text-brand-600" />
              </div>
              <div>
                <h3 className="font-black text-lg text-slate-900">
                  Personal Academic Mentorship
                </h3>
                <p className="text-xs text-textMuted">
                  Unbiased guidance from senior counselors who do not work on coaching commission
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-surfaceWarm border border-border space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">Assigned Counselor:</span>
                <span className="font-extrabold text-brand-800 bg-brand-50 px-2.5 py-0.5 rounded-md border border-brand-200">
                  Senior Kota Mentor Desk
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">Consultation Fee:</span>
                <span className="font-extrabold text-emerald-800">100% Free (Sponsored by FutureSelector)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">Preferred Target:</span>
                <span>{user.exam || "JEE Advanced & NEET"} in {user.city || "Kota"}</span>
              </div>
            </div>

            <Link
              to="/counselling"
              className="btn-primary text-xs py-3 px-5 font-bold flex items-center justify-center gap-2 w-full shadow-md text-center"
            >
              <Phone className="w-4 h-4" />
              <span>Schedule Free Callback via WhatsApp</span>
            </Link>
          </div>
        )}

      </div>

      {/* Seat Lock Modal */}
      {seatLockTarget && (
        <SeatLockModal
          institute={seatLockTarget}
          onClose={() => setSeatLockTarget(null)}
        />
      )}

    </div>
  );
}
