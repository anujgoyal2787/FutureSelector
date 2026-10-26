import { useState } from "react";
import { X, Lock, CheckCircle2, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../services/api";
import logoImg from "../assets/logo.png";

export default function AuthModal({ onLoginSuccess }) {
  const { authModal, closeAuthModal, login } = useAuth();
  const [formData, setFormData] = useState({
    name: "Aryan Sharma",
    phone: "9876543210",
    exam: "JEE Advanced 2026",
    city: "Delhi NCR"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");

  if (!authModal.isOpen) return null;

  const target = authModal.targetInstitute;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setModalError("");
    try {
      const res = await authAPI.verifyOtp({
        name: formData.name || "Aryan Sharma",
        phone: formData.phone,
        otp: "2026",
        exam: formData.exam,
        city: formData.city
      });
      if (res && res.user) {
        login(res.user, res.token);
        closeAuthModal();
        if (onLoginSuccess && target) {
          onLoginSuccess(target);
        }
      }
    } catch (err) {
      setModalError(err.message || "Failed to verify student credentials");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    setModalError("");
    try {
      const email = `${(formData.name || "aspirant").toLowerCase().replace(/\s+/g, "")}.jee2026@gmail.com`;
      const res = await authAPI.googleLogin({
        name: formData.name || "Aryan Sharma",
        email,
        phone: formData.phone || "9876543210",
        exam: formData.exam,
        city: formData.city
      });
      if (res && res.user) {
        login(res.user, res.token);
        closeAuthModal();
        if (onLoginSuccess && target) {
          onLoginSuccess(target);
        }
      }
    } catch (err) {
      setModalError(err.message || "Google Sign-In failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden relative flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={closeAuthModal}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Header Banner */}
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-brand-950 text-white p-6 relative">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-white/95 px-2.5 py-1 rounded-xl shadow-xs">
              <img src={logoImg} alt="FutureSelector" className="h-6 w-auto object-contain" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 text-[11px] font-semibold">
              <Lock className="w-3 h-3 text-brand-400" />
              <span>Free Student Verification</span>
            </div>
          </div>

          <h3 className="text-xl font-bold tracking-tight text-white mb-1.5">
            {target ? (
              <>Unlock Full Report for <span className="text-brand-400">{target.name}</span></>
            ) : (
              "Login to FutureSelector"
            )}
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            {authModal.message || "Access audited batch sizes, faculty background, hostel fees, and 100% verified student reviews."}
          </p>
        </div>

        {/* Perks list */}
        <div className="px-6 pt-4 pb-2 bg-slate-50 border-b border-slate-100">
          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700 font-medium">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Real Batch Size Audit</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>₹15,000 Fee Waiver Code</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Verified Student Feedback</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>3D Digital Aspirant Pass</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          
          {/* 1-Click Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold shadow-xs transition-all active:scale-[0.98]"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200"></div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">or with mobile</span>
            <div className="flex-1 h-px bg-slate-200"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Your Full Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Aryan Sharma"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 font-medium focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="9876543210"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 font-medium focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Target Exam
                </label>
                <select
                  value={formData.exam}
                  onChange={(e) => setFormData({ ...formData, exam: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 font-medium focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all bg-white"
                >
                  <option value="JEE Advanced 2026">JEE Advanced 2026</option>
                  <option value="NEET 2026">NEET UG 2026</option>
                  <option value="JEE Mains 2025">JEE Mains 2025</option>
                  <option value="Foundation (9th-10th)">Foundation</option>
                </select>
              </div>
            </div>

            {modalError && (
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                {modalError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Verifying Student Account...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-brand-200" />
                  <span>Unlock Full Audited Report</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          <p className="text-[10px] text-center text-slate-400 mt-2">
            100% Free for students. No spam, ever.
          </p>
        </div>

      </div>
    </div>
  );
}
