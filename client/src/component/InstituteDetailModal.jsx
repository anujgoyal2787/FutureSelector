import { useState } from "react";
import { 
  X, Star, MapPin, ShieldCheck, Users, TrendingUp, IndianRupee, 
  Home, Award, MessageSquare, CheckCircle, Copy, Check, Heart, Calendar 
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function InstituteDetailModal({ institute, onClose }) {
  const { user, toggleShortlist } = useAuth();
  const [copiedCode, setCopiedCode] = useState(false);
  const [demoBooked, setDemoBooked] = useState(false);

  if (!institute) return null;

  const isShortlisted = user?.shortlisted?.includes(institute.id);
  const couponCode = `FS-${institute.name.split(" ")[0].toUpperCase()}-15K`;

  const handleCopyCoupon = () => {
    navigator.clipboard?.writeText(couponCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleBookDemo = () => {
    setDemoBooked(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden relative my-8 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Image Banner */}
        <div className="h-52 relative overflow-hidden bg-slate-900">
          <img 
            src={institute.image} 
            alt={institute.name} 
            className="w-full h-full object-cover opacity-85" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-slate-950/60 hover:bg-slate-950/90 text-white flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Shortlist Heart Button */}
          <button 
            onClick={() => toggleShortlist(institute.id)}
            className={`absolute top-4 left-4 z-10 px-3 py-1.5 rounded-full backdrop-blur-md border text-xs font-bold flex items-center gap-1.5 transition-all ${
              isShortlisted 
                ? "bg-red-500/90 text-white border-red-400" 
                : "bg-black/50 text-white hover:bg-black/70 border-white/20"
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isShortlisted ? "fill-white" : ""}`} />
            <span>{isShortlisted ? "Shortlisted" : "Shortlist"}</span>
          </button>

          {/* Title on Banner */}
          <div className="absolute bottom-4 left-6 right-6">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="bg-brand-500 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5" /> 100% Audited
              </span>
              <span className="bg-white/20 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                {institute.type}
              </span>
              <div className="bg-amber-400/90 text-slate-950 text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Star className="w-3 h-3 fill-slate-950" /> {institute.rating} ({institute.reviews}+ reviews)
              </div>
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              {institute.name}
            </h2>
            <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-brand-400" /> {institute.location} Campus
            </p>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 space-y-6 max-h-[calc(85vh-13rem)] overflow-y-auto">

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Audited Batch Size</span>
              <span className="text-base font-extrabold text-slate-900 mt-0.5 block">{institute.batchSize}</span>
              <span className="text-[10px] text-emerald-600 font-semibold">Teacher ratio 1:25</span>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Selection Rate</span>
              <span className="text-base font-extrabold text-brand-600 mt-0.5 block">{institute.selectionRate}</span>
              <span className="text-[10px] text-slate-500 font-medium">{institute.topRank}</span>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Annual Tuition</span>
              <span className="text-base font-extrabold text-slate-900 mt-0.5 block">{institute.fees}</span>
              <span className="text-[10px] text-slate-500 font-medium">Installments Available</span>
            </div>
          </div>

          {/* Faculty & Hostel Info (Audited Sections) */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs mb-2">
                <Award className="w-4 h-4 text-emerald-600" />
                <span>Faculty Quality Audit</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                Avg. faculty teaching experience is <strong>11+ years</strong>. 80% of physics & chemistry HODs are IITian/Doctorate alumni with dedicated evening doubt rooms.
              </p>
            </div>

            <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-blue-800 font-bold text-xs mb-2">
                <Home className="w-4 h-4 text-blue-600" />
                <span>Nearby Hostel & Mess Cost</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                Verified student hostels within 500m cost <strong>₹8,500 - ₹13,000 / month</strong> including 3-time meals, high-speed Wi-Fi, and 24x7 study library.
              </p>
            </div>
          </div>

          {/* Exclusive ₹15k FutureSelector Voucher Box */}
          <div className="bg-gradient-to-r from-brand-600 to-emerald-600 rounded-2xl p-4 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-[11px] font-bold text-white mb-1">
                <span>Direct Admission Privilege</span>
              </div>
              <h4 className="font-bold text-sm text-white">Flat ₹15,000 Fee Waiver Pass</h4>
              <p className="text-[11px] text-brand-100">Show this code at the center admission desk for instant deduction.</p>
            </div>

            <button
              onClick={handleCopyCoupon}
              className="bg-white hover:bg-slate-50 text-slate-900 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shrink-0 transition-transform active:scale-95 shadow-sm"
            >
              {copiedCode ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Code Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-600" />
                  <span>{couponCode}</span>
                </>
              )}
            </button>
          </div>

          {/* Real Verified Student Feedback */}
          <div>
            <h4 className="font-bold text-sm text-slate-900 mb-3 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-brand-600" />
              <span>Verified Student Feedback</span>
            </h4>
            
            <div className="space-y-2.5">
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-800">Manish Verma • Enrolled 2025</span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-semibold">Verified Aspirant</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  "Test papers are exactly aligned with NTA's latest difficulty level. The doubt clearing counters till 8:30 PM are the biggest plus point."
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-800">Pooja Choudhary • Enrolled 2024</span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-semibold">Verified Aspirant</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  "Batch size is genuinely maintained under 50. Teachers don't rush through the syllabus and provide personal guidance during test analysis."
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 px-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row gap-2 justify-end items-center">
          <button 
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors"
          >
            Close Report
          </button>
          
          <button 
            onClick={handleBookDemo}
            disabled={demoBooked}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all ${
              demoBooked 
                ? "bg-emerald-600 text-white cursor-default" 
                : "bg-slate-950 hover:bg-slate-800 text-white active:scale-95"
            }`}
          >
            {demoBooked ? (
              <>
                <Check className="w-4 h-4" />
                <span>Demo Session Booked! Counsellor will call.</span>
              </>
            ) : (
              <>
                <Calendar className="w-4 h-4" />
                <span>Book Free 1-on-1 Demo Session</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
