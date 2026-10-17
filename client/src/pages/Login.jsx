import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Lock, Sparkles, CheckCircle2, ArrowRight, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "Aryan Sharma",
    phone: "9876543210",
    exam: "JEE Advanced 2026",
    city: "Delhi NCR"
  });

  // If already logged in, show status or redirect
  if (user) {
    return (
      <div className="min-h-screen bg-slate-50 pt-28 pb-16 px-4 flex items-center justify-center">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-md w-full text-center shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-1">Already Logged In!</h2>
          <p className="text-sm text-slate-600 mb-6">
            Welcome back, <span className="font-bold text-slate-900">{user.name}</span> ({user.exam}).
          </p>
          <button 
            onClick={() => navigate("/")}
            className="w-full bg-slate-950 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-xl text-xs transition-colors"
          >
            Go to Coaching Directory
          </button>
        </div>
      </div>
    );
  }

  const handleGoogleLogin = () => {
    login({
      name: "Aryan Sharma",
      email: "aryan.jee2026@gmail.com",
      exam: "JEE Advanced 2026",
      city: "Delhi NCR"
    });
    navigate("/");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    login({
      name: formData.name || "Aryan Sharma",
      phone: `+91 ${formData.phone}`,
      email: `${(formData.name || "aspirant").toLowerCase().replace(/\s+/g, "")}@gmail.com`,
      exam: formData.exam,
      city: formData.city
    });
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 pt-28 pb-16 px-4 flex items-center justify-center">
      <div className="max-w-4xl w-full grid md:grid-cols-12 bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
        
        {/* Left Side: Benefits & Trust (5 cols) */}
        <div className="md:col-span-5 bg-gradient-to-br from-slate-950 via-slate-900 to-brand-950 p-8 text-white flex flex-col justify-between">
          <div>
            <Link to="/" className="inline-block bg-white/95 px-3 py-1.5 rounded-2xl shadow-sm mb-6 hover:bg-white transition-colors">
              <img src="/logo.png" alt="FutureSelector" className="h-7 w-auto object-contain" />
            </Link>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 text-xs font-semibold mb-6">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              <span>Aspirant Portal</span>
            </div>

            <h2 className="text-2xl font-black tracking-tight text-white mb-3">
              One account. <br />
              All verified coachings.
            </h2>

            <p className="text-xs text-slate-300 leading-relaxed mb-8">
              Sign in to unlock genuine batch size metrics, audited faculty profiles, and direct ₹15,000 fee waiver passes.
            </p>

            <div className="space-y-4 text-xs font-medium text-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span>Audited batch sizes & selection ratios</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span>Direct ₹15,000 admission discount code</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span>3D interactive verified student badge</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span>Save & compare shortlists with parents</span>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Strictly student-first. No spam calls or agent harassment.</span>
          </div>
        </div>

        {/* Right Side: Form (7 cols) */}
        <div className="md:col-span-7 p-8 sm:p-10 flex flex-col justify-center">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Student Login</h3>
            <p className="text-xs text-slate-500 mt-1">Instant free access for competitive exam aspirants.</p>
          </div>

          {/* 1-Click Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold shadow-xs transition-all active:scale-[0.98] mb-4"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-slate-200"></div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">or sign in with mobile</span>
            <div className="flex-1 h-px bg-slate-200"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name
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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
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
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Target Exam
                </label>
                <select
                  value={formData.exam}
                  onChange={(e) => setFormData({ ...formData, exam: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 font-medium focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all bg-white"
                >
                  <option value="JEE Advanced 2026">JEE Advanced 2026</option>
                  <option value="NEET UG 2026">NEET UG 2026</option>
                  <option value="JEE Mains 2025">JEE Mains 2025</option>
                  <option value="Foundation (9th-10th)">Foundation</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-[0.98] mt-2"
            >
              <span>Continue to FutureSelector</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <p className="text-[11px] text-center text-slate-400 mt-4">
            By signing in, you agree to student integrity guidelines.
          </p>
        </div>

      </div>
    </div>
  );
}

export default Login;