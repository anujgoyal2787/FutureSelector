import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  ShieldCheck, Sparkles, CheckCircle2, ArrowRight, 
  Lock, Phone, MapPin, User, ChevronRight, Check,
  ArrowLeft, RotateCcw, AlertCircle, Loader2, Sparkle
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../services/api";
import { triggerGoogleAuth } from "../services/googleAuth";
import logoImg from "../assets/logo.png";
import loginMarketingImg from "../assets/login-marketing.jpg";

function Login() {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();

  // Multi-step flow: 'details' (Enter phone + details) | 'otp' (Enter 4-digit OTP)
  const [step, setStep] = useState("details");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    exam: "",
    city: ""
  });

  const [errors, setErrors] = useState({
    name: "",
    phone: "",
    otp: ""
  });

  // OTP State: 4 individual boxes
  const [otpDigits, setOtpDigits] = useState(["", "", "", ""]);
  const [resendTimer, setResendTimer] = useState(30);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);
  const [smsNotice, setSmsNotice] = useState(null);

  const otpInputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  // Resend Countdown Timer
  useEffect(() => {
    if (step === "otp" && resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [step, resendTimer]);

  // If already logged in, show status or redirect to Dashboard
  if (user) {
    return (
      <div className="min-h-screen bg-background pt-28 pb-16 px-4 flex items-center justify-center">
        <div className="bg-surface border-2 border-border/80 rounded-3xl p-8 max-w-md w-full text-center shadow-card space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center mx-auto shadow-2xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Already Signed In!</h2>
          <p className="text-xs sm:text-sm text-textMuted leading-relaxed">
            Welcome back, <strong className="text-slate-900">{user.name}</strong>. Your verified admission passes and coaching comparisons are ready.
          </p>
          <div className="flex flex-col gap-2 pt-2">
            <button 
              onClick={() => navigate("/dashboard")}
              className="btn-primary text-xs py-3 w-full font-bold shadow-md cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Go to Student Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5 text-gold-300" />
            </button>
            <button 
              onClick={() => logout()}
              className="btn-secondary text-xs py-3 w-full font-bold text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
            >
              Sign Out & Switch Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 1. Google 1-Click Sign-In
  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    triggerGoogleAuth({
      onSuccess: async (googleProfile) => {
        try {
          const res = await authAPI.googleLogin({
            name: googleProfile.name || formData.name || "Student Aspirant",
            email: googleProfile.email,
            picture: googleProfile.picture || "",
            googleId: googleProfile.googleId || "",
            phone: formData.phone === "9876543210" ? "" : formData.phone,
            exam: formData.exam || "",
            city: formData.city || ""
          });
          if (res && res.user) {
            login(res.user, res.token);
            navigate("/dashboard");
          }
        } catch (err) {
          alert(err.message || "Google Sign-In failed on server");
        } finally {
          setIsGoogleLoading(false);
        }
      },
      onError: (err) => {
        setIsGoogleLoading(false);
        console.warn("Google Sign-In notice:", err);
        if (err.message && !err.message.toLowerCase().includes("cancel")) {
          alert(err.message || "Google authentication could not be completed.");
        }
      }
    });
  };

  // 2. Validate details and trigger OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    const newErrors = { name: "", phone: "", otp: "" };

    if (!formData.name.trim()) {
      newErrors.name = "Please enter your full name";
    }

    const cleanPhone = formData.phone.replace(/\D/g, "");
    if (cleanPhone.length !== 10) {
      newErrors.phone = "Enter a valid 10-digit mobile number";
    }

    if (newErrors.name || newErrors.phone) {
      setErrors(newErrors);
      return;
    }

    setErrors({ name: "", phone: "", otp: "" });
    setIsSendingOtp(true);

    try {
      const res = await authAPI.sendOtp(cleanPhone, formData.name);
      setStep("otp");
      setResendTimer(30);
      setOtpDigits(["", "", "", ""]);
      setSmsNotice({
        phone: cleanPhone,
        code: res.demoOtp || "2026"
      });
      setTimeout(() => {
        otpInputRefs[0].current?.focus();
      }, 100);
    } catch (err) {
      setErrors((prev) => ({ ...prev, phone: err.message || "Failed to send OTP" }));
    } finally {
      setIsSendingOtp(false);
    }
  };

  // OTP Input Box handling with auto-focus movement
  const handleOtpDigitChange = (index, value) => {
    // Only accept single digit
    const cleaned = value.replace(/\D/g, "");
    const updated = [...otpDigits];

    if (!cleaned) {
      updated[index] = "";
      setOtpDigits(updated);
      return;
    }

    updated[index] = cleaned[cleaned.length - 1]; // take last entered digit
    setOtpDigits(updated);
    setErrors((prev) => ({ ...prev, otp: "" }));

    // Auto-focus next box
    if (index < 3 && cleaned) {
      otpInputRefs[index + 1].current?.focus();
    }
  };

  // Handle Backspace navigation
  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs[index - 1].current?.focus();
    }
  };

  // Handle pasting full 4 digits
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (pasted.length === 4) {
      const arr = pasted.split("");
      setOtpDigits(arr);
      otpInputRefs[3].current?.focus();
    }
  };

  // Auto-fill demo OTP (for instant zero-friction testing)
  const handleAutoFillOtp = () => {
    setOtpDigits(["2", "0", "2", "6"]);
    setErrors((prev) => ({ ...prev, otp: "" }));
    otpInputRefs[3].current?.focus();
  };

  // Resend OTP
  const handleResendOtp = () => {
    if (resendTimer > 0) return;
    setResendTimer(30);
    setOtpDigits(["", "", "", ""]);
    setSmsNotice({
      phone: formData.phone,
      code: "2026"
    });
    otpInputRefs[0].current?.focus();
  };

  // 3. Verify OTP & Log In
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const enteredCode = otpDigits.join("");

    if (enteredCode.length < 4) {
      setErrors((prev) => ({ ...prev, otp: "Please enter all 4 digits" }));
      return;
    }

    setIsVerifyingOtp(true);
    setErrors((prev) => ({ ...prev, otp: "" }));

    try {
      const res = await authAPI.verifyOtp({
        phone: formData.phone,
        otp: enteredCode,
        name: formData.name,
        exam: formData.exam,
        city: formData.city
      });

      if (res && res.user) {
        setVerifiedSuccess(true);
        setTimeout(() => {
          login(res.user, res.token);
          navigate("/dashboard");
        }, 500);
      }
    } catch (err) {
      setErrors((prev) => ({ ...prev, otp: err.message || "Invalid OTP code" }));
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-24 sm:pt-28 pb-16 px-4 sm:px-6 flex items-center justify-center relative overflow-hidden">
      
      {/* Soft Ambient Background Glows */}
      <div className="absolute top-10 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-brand-600/8 via-emerald-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[450px] h-[450px] bg-gradient-to-bl from-gold-500/10 via-amber-400/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Main 50-50 Split Container */}
      <div className="max-w-5xl w-full bg-surface border-2 border-border/80 rounded-3xl shadow-card overflow-hidden grid lg:grid-cols-12 relative z-10">
        
        {/* ============================================================ */}
        {/* LEFT HALF: USER MARKETING POSTER (50% on Desktop - 6 cols) */}
        {/* ============================================================ */}
        <div className="lg:col-span-6 bg-slate-950 relative overflow-hidden flex items-center justify-center min-h-[380px] lg:min-h-[640px] lg:border-r border-border/80">
          <img 
            src={loginMarketingImg} 
            alt="FutureSelector — Better Information. Brighter Futures." 
            className="w-full h-full object-cover object-top select-none"
          />
          
          {/* Subtle bottom edge gradient to blend on mobile stacked view */}
          <div className="lg:hidden absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-950/70 to-transparent pointer-events-none" />

          {/* Desktop Right Edge Subtle Vertical Shadow & Crisp Separator Blend */}
          <div className="hidden lg:block absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black/25 via-black/5 to-transparent pointer-events-none" />
          <div className="hidden lg:block absolute inset-y-0 right-0 w-[1px] bg-gradient-to-b from-black/10 via-black/20 to-black/10 pointer-events-none" />
        </div>

        {/* ============================================================ */}
        {/* RIGHT HALF: DUAL LOGIN FORM (GOOGLE & FREE PHONE OTP) */}
        {/* ============================================================ */}
        <div className="lg:col-span-6 p-6 sm:p-10 flex flex-col justify-between bg-surface">
          <div className="space-y-5">
            
            {/* Top Brand Header */}
            <div className="flex items-center justify-between">
              <Link to="/" className="inline-block transition-transform duration-200 hover:scale-[1.02]" title="Back to FutureSelector Homepage">
                <img src={logoImg} alt="FutureSelector" className="h-8 w-auto object-contain" />
              </Link>
              <span className="text-[10px] font-black uppercase tracking-wider bg-gold-500/20 text-gold-800 border border-gold-400/30 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                <Sparkles className="w-3 h-3 text-gold-600" />
                Aspirant Command
              </span>
            </div>

            {/* -------------------------------------------------------- */}
            {/* STEP 1: MOBILE & DETAILS INPUT */}
            {/* -------------------------------------------------------- */}
            {step === "details" && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    Sign In to Your Account
                  </h2>
                  <p className="text-xs text-textMuted leading-relaxed">
                    Unlock active ₹15,000 admission passes, compare shortlisted coachings, and access free Kota mentor counseling.
                  </p>
                </div>

                {/* 1-Click Google Sign In (Option 1 - 100% Free) */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isGoogleLoading}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl border border-border hover:border-brand-300 bg-white hover:bg-surfaceWarm/80 text-slate-900 text-xs font-bold shadow-2xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 active:scale-[0.99] cursor-pointer disabled:opacity-60"
                >
                  {isGoogleLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
                      <span>Signing In with Google...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                      </svg>
                      <span>Continue with Google</span>
                    </>
                  )}
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-border"></div>
                  <span className="text-[10px] font-bold text-textMuted uppercase tracking-wider">
                    or sign in with mobile OTP
                  </span>
                  <div className="flex-1 h-px bg-border"></div>
                </div>

                {/* Step 1 Form (Option 3 - Phone OTP) */}
                <form onSubmit={handleRequestOtp} className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                        if (errors.name) setErrors({ ...errors, name: "" });
                      }}
                      placeholder="e.g. Aryan Sharma"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-slate-900 font-medium bg-white outline-none transition-all duration-200 hover:border-slate-300 focus:ring-4 focus:shadow-[0_0_16px_rgba(27,94,72,0.1)] ${
                        errors.name 
                          ? "border-red-400 focus:border-red-500 focus:ring-red-500/15" 
                          : "border-border focus:border-brand-600 focus:ring-brand-500/15"
                      }`}
                    />
                    {errors.name && (
                      <p className="text-[10px] text-red-600 font-medium mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.name}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                          Mobile Number
                        </label>
                        <span className="text-[9px] text-textMuted font-mono">
                          {formData.phone.length}/10
                        </span>
                      </div>
                      <div className={`flex items-center rounded-xl border overflow-hidden bg-white transition-all duration-200 hover:border-slate-300 focus-within:ring-4 focus-within:shadow-[0_0_16px_rgba(27,94,72,0.1)] ${
                        errors.phone 
                          ? "border-red-400 focus-within:border-red-500 focus-within:ring-red-500/15" 
                          : "border-border focus-within:border-brand-600 focus-within:ring-brand-500/15"
                      }`}>
                        <span className="px-2.5 py-2.5 text-xs font-bold text-textMuted bg-surfaceWarm border-r border-border shrink-0 font-mono select-none">
                          +91
                        </span>
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          value={formData.phone}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                            setFormData({ ...formData, phone: val });
                            if (errors.phone) setErrors({ ...errors, phone: "" });
                          }}
                          placeholder="9876543210"
                          className="w-full px-2.5 py-2.5 text-xs text-slate-900 font-medium outline-none bg-transparent"
                        />
                      </div>
                      {errors.phone && (
                        <p className="text-[10px] text-red-600 font-medium mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {errors.phone}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Target Exam
                      </label>
                      <select
                        value={formData.exam}
                        onChange={(e) => setFormData({ ...formData, exam: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl border border-border text-xs text-slate-900 font-medium bg-white outline-none transition-all duration-200 hover:border-slate-300 focus:border-brand-600 focus:ring-4 focus:ring-brand-500/15 focus:shadow-[0_0_16px_rgba(27,94,72,0.1)] cursor-pointer"
                      >
                        <option value="">Select Target Exam...</option>
                        <option value="JEE Advanced 2026">JEE Advanced 2026</option>
                        <option value="JEE Main 2026">JEE Main 2026</option>
                        <option value="NEET-UG 2026">NEET-UG 2026</option>
                        <option value="Foundation (9th-10th)">Foundation (9th-10th)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Preferred Coaching Hub
                    </label>
                    <select
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-border text-xs text-slate-900 font-medium bg-white outline-none transition-all duration-200 hover:border-slate-300 focus:border-brand-600 focus:ring-4 focus:ring-brand-500/15 focus:shadow-[0_0_16px_rgba(27,94,72,0.1)] cursor-pointer"
                    >
                      <option value="">Select Coaching Hub...</option>
                      <option value="Kota, Rajasthan">Kota, Rajasthan</option>
                      <option value="Delhi NCR">Delhi NCR</option>
                      <option value="Hyderabad">Hyderabad</option>
                      <option value="Bengaluru">Bengaluru</option>
                      <option value="Jaipur">Jaipur</option>
                      <option value="Lucknow">Lucknow</option>
                      <option value="Patna">Patna</option>
                      <option value="Agra">Agra</option>
                    </select>
                  </div>

                  {/* Send OTP Button with Magnetic Spring Lift */}
                  <button
                    type="submit"
                    disabled={isSendingOtp}
                    className="w-full btn-primary text-xs py-3 px-4 font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:shadow-brand-600/20 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all duration-200 cursor-pointer mt-1 disabled:opacity-60"
                  >
                    {isSendingOtp ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-gold-300" />
                        <span>Generating Free Verification OTP...</span>
                      </>
                    ) : (
                      <>
                        <span>Get Verification OTP via SMS</span>
                        <ArrowRight className="w-3.5 h-3.5 text-gold-300 transition-transform duration-200 group-hover:translate-x-1" />
                      </>
                    )}
                  </button>
                </form>

                {/* 1-Click Instant Demo Login shortcut */}
                <div className="text-center pt-0.5">
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-brand-50/70 hover:bg-brand-50 border border-brand-200/60 hover:border-brand-300 text-[11px] font-bold text-brand-700 hover:text-brand-800 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs active:translate-y-0 cursor-pointer"
                  >
                    <span>⚡ 1-Click Instant Demo Login (Aryan Sharma)</span>
                  </button>
                </div>
              </div>
            )}

            {/* -------------------------------------------------------- */}
            {/* STEP 2: 4-DIGIT OTP VERIFICATION SCREEN */}
            {/* -------------------------------------------------------- */}
            {step === "otp" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                
                {/* Back / Edit Navigation */}
                <button
                  type="button"
                  onClick={() => setStep("details")}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-textMuted hover:text-slate-900 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Change phone number</span>
                </button>

                <div className="space-y-1">
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <span>Verify Phone Number</span>
                    {verifiedSuccess && <CheckCircle2 className="w-6 h-6 text-emerald-600 animate-in zoom-in" />}
                  </h2>
                  <p className="text-xs text-textMuted leading-relaxed">
                    Enter the 4-digit verification code sent to <strong className="text-slate-900 font-mono">+91 {formData.phone}</strong>
                  </p>
                </div>

                {/* Free Quota Notice with 1-Click Auto Fill */}
                <div className="p-3 bg-emerald-50/80 border border-emerald-200/90 rounded-2xl flex items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                      OTP
                    </div>
                    <div>
                      <p className="text-[11px] font-extrabold text-emerald-950">Free Quota Verification Code</p>
                      <p className="text-[10px] text-emerald-700">Enter code <strong className="font-mono text-xs bg-emerald-100/90 px-1.5 py-0.5 rounded text-emerald-900">2026</strong> or auto-fill below</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleAutoFillOtp}
                    className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-all shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer shrink-0"
                  >
                    Auto Fill
                  </button>
                </div>

                {/* 4-Box OTP Input Form */}
                <form onSubmit={handleVerifyOtp} className="space-y-4 pt-1">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-2 text-center">
                      4-Digit OTP Code
                    </label>
                    
                    <div className="flex items-center justify-center gap-3">
                      {otpDigits.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={otpInputRefs[idx]}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          onPaste={handleOtpPaste}
                          className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-xl font-black rounded-2xl border bg-white outline-none transition-all duration-200 shadow-2xs ${
                            errors.otp
                              ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/15"
                              : digit
                              ? "border-brand-600 bg-brand-50/20 text-brand-900 focus:ring-4 focus:ring-brand-500/15"
                              : "border-border text-slate-900 hover:border-slate-300 focus:border-brand-600 focus:ring-4 focus:ring-brand-500/15"
                          }`}
                        />
                      ))}
                    </div>

                    {errors.otp && (
                      <p className="text-center text-[11px] text-red-600 font-medium mt-2 flex items-center justify-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> {errors.otp}
                      </p>
                    )}
                  </div>

                  {/* Resend OTP Timer & Button */}
                  <div className="flex items-center justify-between text-xs pt-1 px-1">
                    <span className="text-[11px] text-textMuted">
                      Didn't receive SMS?
                    </span>
                    {resendTimer > 0 ? (
                      <span className="text-[11px] font-bold text-slate-500 font-mono">
                        Resend in 0:{resendTimer < 10 ? `0${resendTimer}` : resendTimer}s
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        className="text-[11px] font-bold text-brand-700 hover:text-brand-900 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Resend OTP Now</span>
                      </button>
                    )}
                  </div>

                  {/* Verify Button */}
                  <button
                    type="submit"
                    disabled={isVerifyingOtp || verifiedSuccess}
                    className="w-full btn-primary text-xs py-3.5 px-4 font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:shadow-brand-600/20 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all duration-200 cursor-pointer disabled:opacity-70 mt-2"
                  >
                    {isVerifyingOtp ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-gold-300" />
                        <span>Verifying Credentials...</span>
                      </>
                    ) : verifiedSuccess ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                        <span>Phone Verified! Opening Dashboard...</span>
                      </>
                    ) : (
                      <>
                        <span>Verify & Open Student Dashboard</span>
                        <ArrowRight className="w-3.5 h-3.5 text-gold-300 transition-transform duration-200 group-hover:translate-x-1" />
                      </>
                    )}
                  </button>
                </form>

              </div>
            )}

          </div>

          {/* Bottom Trust Pledge */}
          <div className="pt-5 border-t border-border flex items-center justify-between text-[10px] text-textMuted">
            <span className="flex items-center gap-1 text-emerald-700 font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              15-Day Escrow Protected
            </span>
            <span>Zero Spam Calls • 100% Student First</span>
          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;