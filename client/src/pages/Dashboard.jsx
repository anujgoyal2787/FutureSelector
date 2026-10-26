import { useState, useMemo, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, Sparkles, Heart, Phone, Download, Share2, 
  Copy, Check, MapPin, ArrowRightLeft, Trash2, Plus, Edit3, 
  CheckCircle2, X, MessageSquare, ExternalLink, LifeBuoy, 
  ShieldAlert, AlertCircle, Clock, RefreshCw, Loader2, ArrowRight
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { institutesData } from "../data/institutes";
import { rmsAPI, voucherAPI, authAPI } from "../services/api";
import SeatLockModal from "../component/SeatLockModal";
import BorderBeam from "../component/reactbits/BorderBeam";
import { generateAdmissionPassPDF } from "../utils/pdfGenerator";

export default function Dashboard() {
  const { 
    user, 
    login, 
    logout, 
    updateProfile, 
    openAuthModal, 
    toggleShortlist,
    lockedSeats = [], 
    removeLockedSeat 
  } = useAuth();

  // Active view tab: "passes" | "shortlist" | "counselling"
  const [activeTab, setActiveTab] = useState("passes");
  const [copiedVoucherId, setCopiedVoucherId] = useState(false);
  const [selectedSeatIndex, setSelectedSeatIndex] = useState(0);
  const [seatLockTarget, setSeatLockTarget] = useState(null);

  // Profile Edit Modal State
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
    exam: "",
    city: "",
    standard: "",
    dreamCollege: ""
  });
  const [editSuccessMsg, setEditSuccessMsg] = useState("");

  // Advisory callback form state
  const [advisoryTopic, setAdvisoryTopic] = useState("Batch Size & Real Desk Limit");
  const [advisoryPhone, setAdvisoryPhone] = useState("");
  const [advisoryBooked, setAdvisoryBooked] = useState(false);

  // Student Grievance / RMS State
  const [studentTickets, setStudentTickets] = useState([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  const [grievanceInst, setGrievanceInst] = useState("Allen Career Institute (Kota)");
  const [grievanceCategory, setGrievanceCategory] = useState("PASS_DISCOUNT_DISPUTE");
  const [grievancePriority, setGrievancePriority] = useState("CRITICAL");
  const [grievanceSubject, setGrievanceSubject] = useState("");
  const [grievanceDesc, setGrievanceDesc] = useState("");
  const [grievancePhone, setGrievancePhone] = useState(user?.phone || "+91 98765 43210");
  const [isSubmittingGrievance, setIsSubmittingGrievance] = useState(false);
  const [grievanceSuccess, setGrievanceSuccess] = useState(null);
  const [grievanceError, setGrievanceError] = useState("");

  const [apiPasses, setApiPasses] = useState([]);

  const fetchStudentPasses = async () => {
    if (!user) return;
    const phone = user.phone ? user.phone.replace("+91 ", "").trim() : "";
    const email = user.email || "";
    if (!phone && !email) return;

    try {
      const passes = await voucherAPI.getMyPasses({ phone, email });
      if (passes && passes.length > 0) {
        setApiPasses(passes);
      }
    } catch (err) {
      console.warn("Could not fetch passes:", err);
    }
  };

  const fetchStudentTickets = async () => {
    if (!user) return;
    const phone = user.phone ? user.phone.replace("+91 ", "").trim() : "";
    const email = user.email || "";
    if (!phone && !email) {
      setStudentTickets([]);
      return;
    }

    setIsLoadingTickets(true);
    try {
      const res = await rmsAPI.getMyTickets({ phone, email });
      if (res && res.tickets) {
        setStudentTickets(res.tickets);
      }
    } catch (err) {
      console.warn("Could not fetch student tickets:", err);
    } finally {
      setIsLoadingTickets(false);
    }
  };

  useEffect(() => {
    fetchStudentTickets();
    fetchStudentPasses();
  }, [user?.phone, user?.email]);

  const handleConfirmResolution = async (ticketId) => {
    const feedback = prompt("Optional: Confirmation remarks before closing dispute:", "Satisfied with resolution");
    try {
      const res = await rmsAPI.confirmResolution(ticketId, feedback || "Satisfied with resolution");
      alert(res.message);
      fetchStudentTickets();
    } catch (err) {
      alert(err.message || "Failed to confirm resolution");
    }
  };

  const handleReopenTicket = async (ticketId) => {
    const reason = prompt("Enter reason for reopening the dispute with Super Admin Desk:", "The center has not honored the agreed waiver terms");
    if (!reason) return;
    try {
      const res = await rmsAPI.reopenTicket(ticketId, reason);
      alert(res.message);
      fetchStudentTickets();
    } catch (err) {
      alert(err.message || "Failed to reopen dispute");
    }
  };

  const handleSubmitGrievance = async (e) => {
    e?.preventDefault();
    if (!grievanceSubject.trim() || !grievanceInst.trim()) {
      alert("Please enter target coaching institute and grievance subject");
      return;
    }

    setIsSubmittingGrievance(true);
    setGrievanceError("");
    setGrievanceSuccess(null);

    try {
      const res = await rmsAPI.submitStudentTicket({
        studentName: user?.name || "Aryan Sharma",
        studentPhone: grievancePhone || user?.phone || "+91 98765 43210",
        studentEmail: user?.email || "aryan.jee2026@gmail.com",
        instituteName: grievanceInst,
        category: grievanceCategory,
        subject: grievanceSubject,
        description: grievanceDesc,
        priority: grievancePriority
      });

      if (res && res.ticket) {
        setGrievanceSuccess(res.ticket);
        setStudentTickets(prev => [res.ticket, ...prev]);
        setGrievanceSubject("");
        setGrievanceDesc("");
      } else {
        const dummy = {
          ticketId: `RMS-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          studentName: user?.name || "Aryan Sharma",
          instituteName: grievanceInst,
          category: grievanceCategory,
          subject: grievanceSubject,
          description: grievanceDesc,
          priority: grievancePriority,
          status: "OPEN",
          createdAt: new Date().toISOString()
        };
        setGrievanceSuccess(dummy);
        setStudentTickets(prev => [dummy, ...prev]);
        setGrievanceSubject("");
        setGrievanceDesc("");
      }
    } catch (err) {
      setGrievanceError(err.message || "Failed to submit grievance to central support");
    } finally {
      setIsSubmittingGrievance(false);
    }
  };

  // Auto-prompt student to select preferences if freshly logged in and not yet configured
  const hasAutoPromptedRef = useRef(false);

  // Sync profile form when opening modal
  const handleOpenEditProfile = () => {
    if (user) {
      setProfileForm({
        name: user.name || "",
        phone: user.phone ? user.phone.replace("+91 ", "") : "",
        exam: user.exam || "",
        city: user.city || "",
        standard: user.standard || "",
        dreamCollege: user.dreamCollege || ""
      });
    }
    setIsEditProfileOpen(true);
  };

  useEffect(() => {
    if (user && (!user.exam || !user.city) && !hasAutoPromptedRef.current) {
      hasAutoPromptedRef.current = true;
      handleOpenEditProfile();
    }
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (updateProfile) {
      await updateProfile({
        name: profileForm.name,
        exam: profileForm.exam,
        city: profileForm.city,
        standard: profileForm.standard,
        dreamCollege: profileForm.dreamCollege
      });
      setEditSuccessMsg("Preferences updated successfully in database!");
      setTimeout(() => {
        setEditSuccessMsg("");
        setIsEditProfileOpen(false);
      }, 1000);
    }
  };

  // Active locked passes (Prefers database passes from backend)
  const activePasses = useMemo(() => {
    if (apiPasses && apiPasses.length > 0) {
      return apiPasses;
    }
    if (lockedSeats && lockedSeats.length > 0) {
      return lockedSeats;
    }
    return [];
  }, [apiPasses, lockedSeats]);

  const currentPass = activePasses[selectedSeatIndex] || activePasses[0] || null;

  // Shortlisted institutes objects
  const shortlistedInstitutes = useMemo(() => {
    const list = user?.shortlisted || user?.shortlistedInstitutes || [];
    if (!list || list.length === 0) {
      return [];
    }
    return institutesData.filter(inst => list.includes(inst.id));
  }, [user]);

  // Dynamic personalized recommended institutes for the logged-in student
  const personalizedRecommendations = useMemo(() => {
    let pool = [...institutesData];
    if (!pool.length) return [];

    if (user?.exam) {
      const isNeet = user.exam.toLowerCase().includes("neet");
      const isJee = user.exam.toLowerCase().includes("jee");
      if (isNeet) {
        pool = pool.filter(i => (i.type || "").toLowerCase().includes("neet") || (i.name || "").toLowerCase().includes("aakash") || (i.name || "").toLowerCase().includes("allen"));
      } else if (isJee) {
        pool = pool.filter(i => (i.type || "").toLowerCase().includes("jee") || (i.type || "").toLowerCase().includes("advanced"));
      }
    }

    if (user?.city) {
      const cityKey = user.city.toLowerCase().split(",")[0].trim();
      pool.sort((a, b) => {
        const aMatches = (a.location || "").toLowerCase().includes(cityKey) || (a.cityKey || "").toLowerCase().includes(cityKey);
        const bMatches = (b.location || "").toLowerCase().includes(cityKey) || (b.cityKey || "").toLowerCase().includes(cityKey);
        if (aMatches && !bMatches) return -1;
        if (!aMatches && bMatches) return 1;
        return (b.rating || 0) - (a.rating || 0);
      });
    }

    return pool.slice(0, 4);
  }, [user?.exam, user?.city]);

  // Render Personalized Recommendations Block
  const renderPersonalizedRecommendations = () => {
    if (!personalizedRecommendations.length) return null;

    return (
      <div className="pt-6 space-y-3.5 border-t border-border/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-gold-500/20 text-gold-900 border border-gold-400/40 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-gold-600" />
                Tailored for {user?.name || "You"}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 mt-1">
              Top Coaching Centers for {user?.exam || "Competitive Exams"} {user?.city ? `• ${user.city}` : ""}
            </h3>
            <p className="text-xs text-textMuted font-medium">
              Claim an official ₹15,000 admission fee grant or save centers to your shortlist for side-by-side comparison.
            </p>
          </div>
          <Link
            to="/find-coaching"
            className="btn-secondary text-xs py-2 px-3.5 font-bold shrink-0 self-start sm:self-auto flex items-center gap-1.5"
          >
            <span>Explore All Centers</span>
            <ArrowRight className="w-3.5 h-3.5 text-brand-700" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {personalizedRecommendations.map((inst) => {
            const isSaved = (user?.shortlisted || user?.shortlistedInstitutes || []).includes(inst.id);
            return (
              <div
                key={inst.id}
                className="bg-surface rounded-2xl border border-border hover:border-brand-300 p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-3 relative group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shrink-0 bg-slate-100 border border-border">
                    <img
                      src={inst.image}
                      alt={inst.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider bg-brand-50 text-brand-800 border border-brand-200 px-2 py-0.5 rounded-md truncate">
                        {inst.type}
                      </span>
                      <button
                        onClick={() => toggleShortlist(inst.id)}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                          isSaved
                            ? "bg-rose-50 border-rose-300 text-rose-600"
                            : "bg-surfaceWarm border-border text-slate-400 hover:text-rose-500 hover:bg-rose-50"
                        }`}
                        title={isSaved ? "Saved in Shortlist" : "Save to Shortlist"}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isSaved ? "fill-rose-500" : ""}`} />
                      </button>
                    </div>
                    <h4 className="text-sm font-black text-slate-900 mt-1 truncate">
                      {inst.name}
                    </h4>
                    <p className="text-[11px] text-textMuted flex items-center gap-1 mt-0.5 truncate">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{inst.location} ({inst.locality || "Main Campus"})</span>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/70 text-xs">
                  <div className="p-2 bg-surfaceWarm rounded-xl border border-border">
                    <span className="text-[9px] text-textMuted uppercase font-bold block">Annual Tuition:</span>
                    <span className="font-black text-slate-900 text-xs">{inst.fees}</span>
                  </div>
                  <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-200 text-right">
                    <span className="text-[9px] text-emerald-700 font-extrabold uppercase block">FS Waiver Pass:</span>
                    <span className="font-black text-emerald-800 text-xs font-mono">Flat ₹15,000 Off</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => setSeatLockTarget(inst)}
                    className="flex-1 btn-primary text-xs py-2 px-3 font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-gold-300" />
                    <span>Lock ₹15K Pass</span>
                  </button>
                  <Link
                    to={`/institute/${inst.slug || inst.id}`}
                    className="btn-secondary text-xs py-2 px-3 font-bold text-slate-700 hover:text-slate-900"
                  >
                    Audited Profile
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Copy Voucher ID
  const handleCopyVoucher = () => {
    if (!currentPass) return;
    navigator.clipboard?.writeText(currentPass.voucherId);
    setCopiedVoucherId(true);
    setTimeout(() => setCopiedVoucherId(false), 2500);
  };

  // Share Admission Pass on WhatsApp
  const handleSharePassWhatsApp = (pass = currentPass) => {
    if (!pass) return;
    const text = `🎓 *Official FutureSelector Admission Pass*\n` +
      `🎫 *Voucher ID:* ${pass.voucherId}\n` +
      `🏛️ *Center:* ${pass.instituteName}\n` +
      `💰 *Waiver Amount:* ${pass.discountAmount}\n` +
      `📚 *Batch:* ${pass.batch}\n` +
      `🛡️ *Escrow Guarantee:* 15-Day 100% Supreme Court Refund Window Audited by FutureSelector\n` +
      `📅 *Status:* ${pass.status}\n` +
      `Present this at the coaching accounts counter during batch admission.`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  // Instant vector PDF download
  const handleDownloadPDF = (pass = currentPass) => {
    if (!pass) return;
    generateAdmissionPassPDF(pass, user || {
      name: "Student Aspirant",
      phone: "Verified Student",
      exam: "Competitive Exam",
      city: "Coaching Hub"
    });
  };

  // Handle instant demo login if logged out - Persists to MongoDB
  const handleDemoLogin = async () => {
    try {
      const res = await authAPI.verifyOtp({
        name: "Demo Aspirant",
        phone: "9876543210",
        otp: "2026",
        exam: "JEE Advanced 2026",
        city: "Kota, Rajasthan"
      });
      if (res && res.user) {
        login(res.user, res.token);
      }
    } catch {
      login({
        name: "Demo Aspirant",
        phone: "+91 98765 43210",
        email: "demo@futureselector.in",
        exam: "JEE Advanced 2026",
        city: "Kota, Rajasthan",
        standard: "12th Science / Dropper",
        dreamCollege: "IIT Bombay",
        shortlisted: [1, 2]
      });
    }
  };

  // Handle Advisory Booking
  const handleBookAdvisory = (e) => {
    e.preventDefault();
    setAdvisoryBooked(true);
    setTimeout(() => {
      const name = user?.name || "Student Aspirant";
      const exam = user?.exam || "Competitive Exam";
      const phone = advisoryPhone || user?.phone || "";
      const text = `Hello FutureSelector Senior Counselor! I am ${name} (${exam}, Mobile: ${phone}). I need guidance on: ${advisoryTopic}.`;
      window.open(`https://api.whatsapp.com/send?phone=919876543210&text=${encodeURIComponent(text)}`, "_blank");
    }, 600);
  };

  // =========================================================================
  // GUEST / LOGGED-OUT VIEW
  // =========================================================================
  if (!user) {
    return (
      <div className="min-h-screen bg-background pt-28 pb-20 px-4 sm:px-6 flex items-center justify-center relative overflow-hidden">
        <div className="max-w-xl w-full bg-surface border-2 border-border/80 rounded-3xl p-6 sm:p-8 text-center shadow-card relative space-y-5">
          <BorderBeam size={260} duration={8} borderWidth={2} colorFrom="#10B981" colorTo="#F59E0B" />

          <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center mx-auto shadow-2xs">
            <ShieldCheck className="w-8 h-8 text-brand-600" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900">Student Dashboard</h2>
            <p className="text-xs sm:text-sm text-textMuted max-w-md mx-auto leading-relaxed">
              Log in to view your active ₹15,000 admission vouchers, compare saved coaching institutes, and access 1-on-1 mentorship.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-left pt-2">
            <div className="p-3 bg-surfaceWarm rounded-2xl border border-border">
              <Sparkles className="w-4 h-4 text-brand-700 mb-1" />
              <span className="font-bold text-xs text-slate-900 block">₹15,000 Fee Vouchers</span>
              <span className="text-[10px] text-textMuted">Present at center cash counter</span>
            </div>
            <div className="p-3 bg-surfaceWarm rounded-2xl border border-border">
              <ShieldCheck className="w-4 h-4 text-emerald-600 mb-1" />
              <span className="font-bold text-xs text-slate-900 block">15-Day Escrow Shield</span>
              <span className="text-[10px] text-textMuted">Supreme Court refund guarantee</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
            <button
              onClick={handleDemoLogin}
              className="btn-primary text-xs py-3 w-full font-bold shadow-md cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-gold-300" />
              <span>Explore Instant Demo Account</span>
            </button>
            <button
              onClick={() => openAuthModal(null, "Log in to view your verified admission pass.")}
              className="btn-secondary text-xs py-3 w-full font-bold cursor-pointer"
            >
              Sign In to Your Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // LOGGED-IN STUDENT DASHBOARD
  // =========================================================================
  return (
    <div className="min-h-screen bg-background pt-24 sm:pt-28 pb-20 px-4 sm:px-6 relative overflow-hidden">
      
      {/* Ambient background glows */}
      <div className="absolute top-10 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-brand-600/8 via-emerald-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[450px] h-[450px] bg-gradient-to-bl from-gold-500/10 via-amber-400/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10 space-y-6">

        {/* ============================================================ */}
        {/* 1. STUDENT IDENTITY & PREFERENCES BAR */}
        {/* ============================================================ */}
        <div className="bg-surface border border-border rounded-3xl p-5 sm:p-6 shadow-card space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            
            {/* Identity info */}
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-700 to-brand-900 text-white font-black text-2xl flex items-center justify-center shadow-md shrink-0 overflow-hidden">
                {user.picture ? (
                  <img src={user.picture} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user.name?.charAt(0) || "A"
                )}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 truncate">
                    {user.name}
                  </h1>
                  <span className="bg-emerald-50 text-emerald-800 border border-emerald-300 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Verified Student Pass
                  </span>
                </div>
                <div className="text-xs text-textMuted mt-0.5 font-medium flex flex-wrap items-center gap-x-2">
                  <span>
                    Target:{" "}
                    {user.exam ? (
                      <strong className="text-brand-900 font-bold">{user.exam}</strong>
                    ) : (
                      <button
                        onClick={handleOpenEditProfile}
                        className="text-brand-700 underline font-bold hover:text-brand-900 cursor-pointer"
                      >
                        + Set Target Exam
                      </button>
                    )}
                  </span>
                  <span>•</span>
                  <span>
                    Hub:{" "}
                    {user.city ? (
                      <strong className="text-slate-900 font-bold">{user.city}</strong>
                    ) : (
                      <button
                        onClick={handleOpenEditProfile}
                        className="text-brand-700 underline font-bold hover:text-brand-900 cursor-pointer"
                      >
                        + Set Hub
                      </button>
                    )}
                  </span>
                  <span>•</span>
                  <span>
                    Class:{" "}
                    {user.standard ? (
                      <strong className="text-slate-900 font-bold">{user.standard}</strong>
                    ) : (
                      <button
                        onClick={handleOpenEditProfile}
                        className="text-brand-700 underline font-bold hover:text-brand-900 cursor-pointer"
                      >
                        + Set Class
                      </button>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
              <button
                onClick={handleOpenEditProfile}
                className="btn-secondary text-xs py-2 px-3 gap-1.5 font-bold cursor-pointer"
                title="Edit Target Exam, Hub or Class"
              >
                <Edit3 className="w-3.5 h-3.5 text-brand-700" />
                <span>Edit Preferences</span>
              </button>

              <button
                onClick={logout}
                className="btn-secondary text-xs py-2 px-3 gap-1.5 font-bold text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200 cursor-pointer"
                title="Sign out of student account"
              >
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Preferences prompt alert if not set */}
          {(!user.exam || !user.city) && (
            <div className="p-3 sm:p-4 rounded-2xl bg-amber-50/90 border border-amber-300 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-200/80 text-amber-900 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-amber-800" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-amber-950">Set Your Aspirant Preferences</h4>
                  <p className="text-[11px] sm:text-xs text-amber-900/90">Please specify your Target Exam (JEE/NEET) and Coaching Hub to get personalized admission passes.</p>
                </div>
              </div>
              <button
                onClick={handleOpenEditProfile}
                className="btn-primary text-xs py-2 px-3.5 font-bold shrink-0 self-start sm:self-auto cursor-pointer shadow-xs"
              >
                Set Preferences Now
              </button>
            </div>
          )}

          {/* Quick 4 Clean Metric Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            <button
              onClick={() => setActiveTab("passes")}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                activeTab === "passes" ? "bg-brand-50 border-brand-300 shadow-2xs" : "bg-surfaceWarm border-border hover:border-brand-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-textMuted uppercase">Active Admission Passes</span>
                <Sparkles className="w-3.5 h-3.5 text-brand-700" />
              </div>
              <span className="text-sm font-black text-slate-900 font-mono mt-0.5 block">
                {activePasses.length} Active Voucher
              </span>
              <span className="text-[10px] text-emerald-700 font-bold block">₹15,000 Off Locked</span>
            </button>

            <button
              onClick={() => setActiveTab("shortlist")}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                activeTab === "shortlist" ? "bg-brand-50 border-brand-300 shadow-2xs" : "bg-surfaceWarm border-border hover:border-brand-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-textMuted uppercase">Shortlisted Coachings</span>
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              </div>
              <span className="text-sm font-black text-slate-900 font-mono mt-0.5 block">
                {shortlistedInstitutes.length} Saved Centers
              </span>
              <span className="text-[10px] text-brand-700 font-bold block">Compare Ready</span>
            </button>

            <button
              onClick={() => setActiveTab("counselling")}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                activeTab === "counselling" ? "bg-brand-50 border-brand-300 shadow-2xs" : "bg-surfaceWarm border-border hover:border-brand-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-textMuted uppercase">1-on-1 Mentor Advisory</span>
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <span className="text-sm font-black text-slate-900 font-mono mt-0.5 block">
                Free Guidance
              </span>
              <span className="text-[10px] text-emerald-700 font-bold block">
                {user?.city ? `${user.city.split(',')[0]} Desk` : "Mentor Desk"}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("grievances")}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                activeTab === "grievances" ? "bg-amber-50 border-amber-300 shadow-2xs" : "bg-surfaceWarm border-border hover:border-amber-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-amber-900 uppercase">Support & Disputes (RMS)</span>
                <LifeBuoy className="w-3.5 h-3.5 text-amber-700" />
              </div>
              <span className="text-sm font-black text-slate-900 font-mono mt-0.5 block">
                {studentTickets.length > 0 ? `${studentTickets.length} Active Ticket` : "Lodge Dispute"}
              </span>
              <span className="text-[10px] text-amber-700 font-bold block">₹15K Escrow Shield</span>
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 2. TAB CONTENT 1: ADMISSION PASSES & COUNTER VOUCHERS */}
        {/* ============================================================ */}
        {activeTab === "passes" && (
          <div className="space-y-4">
            {activePasses.length === 0 || !currentPass ? (
              <div className="bg-surface border-2 border-dashed border-border rounded-3xl p-8 sm:p-12 text-center space-y-4 shadow-card">
                <div className="w-16 h-16 rounded-3xl bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center mx-auto shadow-sm">
                  <Sparkles className="w-8 h-8 text-brand-700" />
                </div>
                <div className="max-w-md mx-auto space-y-1.5">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">
                    No Active Admission Passes Yet
                  </h3>
                  <p className="text-sm text-textMuted font-medium">
                    You haven't claimed an admission pass yet. Search verified JEE & NEET coaching centers across India to lock in your flat ₹15,000 fee grant waiver.
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    to="/find-coaching"
                    className="btn-primary inline-flex items-center gap-2 text-sm font-bold px-6 py-3 shadow-md"
                  >
                    <span>Browse Coaching Centers</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {/* Multi-voucher selector if user has locked multiple */}
                {activePasses.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    <span className="text-xs font-bold text-textMuted shrink-0">Switch Pass:</span>
                    {activePasses.map((pass, idx) => (
                      <button
                        key={pass.voucherId}
                        onClick={() => setSelectedSeatIndex(idx)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                          selectedSeatIndex === idx
                            ? "bg-emerald-600 text-white shadow-xs"
                            : "bg-surface border border-border text-slate-700 hover:bg-surfaceWarm"
                        }`}
                      >
                        <span>{pass.instituteName.split(" ")[0]}</span>
                        <span className="font-mono text-[10px] opacity-80">({pass.voucherId})</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* The Official Pass Card */}
                <motion.div 
                  key={currentPass.voucherId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-surface border-2 border-emerald-500/40 rounded-3xl p-5 sm:p-7 shadow-card relative overflow-hidden"
                >
              <BorderBeam size={260} duration={8} borderWidth={2} colorFrom="#10B981" colorTo="#F59E0B" />

              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
                
                {/* Left Pass Details */}
                <div className="space-y-3 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-gold-500/20 text-gold-800 border border-gold-400/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-gold-600" />
                      Official FutureSelector Admission Pass
                    </span>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      {currentPass.status}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                    {currentPass.instituteName}
                  </h3>

                  <p className="text-xs text-textMuted font-medium">
                    Allocated Batch: <strong className="text-slate-900">{currentPass.batch}</strong> • {currentPass.validTill}
                  </p>

                  <div className="flex flex-wrap items-center gap-2.5 pt-1">
                    <div className="p-2.5 bg-brand-50 rounded-xl border border-brand-200">
                      <span className="text-[9px] font-bold text-brand-700 uppercase block">Fee Grant Value:</span>
                      <span className="text-sm font-black text-brand-900 font-mono">{currentPass.discountAmount}</span>
                    </div>

                    <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200">
                      <span className="text-[9px] font-bold text-emerald-700 uppercase block">Refund Security:</span>
                      <span className="text-sm font-black text-emerald-900 font-mono">15-Day Escrow Shield</span>
                    </div>

                    <div className="p-2.5 bg-surfaceWarm rounded-xl border border-border">
                      <span className="text-[9px] font-bold text-textMuted uppercase block">Voucher Pass ID:</span>
                      <button 
                        onClick={handleCopyVoucher} 
                        className="text-sm font-black text-slate-900 font-mono flex items-center gap-1.5 cursor-pointer hover:text-brand-700"
                        title="Click to copy voucher ID"
                      >
                        <span>{currentPass.voucherId}</span>
                        {copiedVoucherId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-textMuted" />}
                      </button>
                    </div>

                    <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200">
                      <span className="text-[9px] font-bold text-amber-700 uppercase block">Counter Promo Code:</span>
                      <span className="text-sm font-black text-amber-900 font-mono">{currentPass.code || "FS-PASS-15K"}</span>
                    </div>
                  </div>
                </div>

                {/* Right Action buttons */}
                <div className="flex flex-col items-center lg:items-end gap-3 shrink-0 self-stretch lg:self-auto border-t lg:border-t-0 pt-4 lg:pt-0 border-border">
                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => handleDownloadPDF(currentPass)}
                      className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
                    >
                      <Download className="w-3.5 h-3.5 text-gold-300" />
                      <span>Download PDF Pass</span>
                    </button>

                    <button
                      onClick={() => handleSharePassWhatsApp(currentPass)}
                      className="px-3.5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20BD5A] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>WhatsApp to Parents</span>
                    </button>

                    {activePasses.length > 1 && (
                      <button
                        onClick={() => removeLockedSeat(currentPass.voucherId)}
                        className="p-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold transition-all cursor-pointer"
                        title="Release this seat reservation"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="text-[10px] text-textMuted font-mono">
                    VALID AT OFFICIAL CENTER DESK • AUDITED BY FUTURESELECTOR
                  </div>
                </div>

              </div>

              {/* 3-Step Counter Redemption Guide */}
              <div className="mt-5 pt-4 border-t border-border/80">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 block mb-2.5">
                  How to Redeem Your ₹15,000 Waiver at Center Counter:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-surfaceWarm border border-border">
                    <span className="font-extrabold text-slate-900 block text-xs">1. Show Voucher ID</span>
                    <span className="text-[11px] text-textMuted">Present <strong>{currentPass.voucherId}</strong> at cash counter.</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-surfaceWarm border border-border">
                    <span className="font-extrabold text-slate-900 block text-xs">2. ₹15,000 Deducted</span>
                    <span className="text-[11px] text-textMuted">Center deducts ₹15,000 before generating official fee invoice.</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-surfaceWarm border border-border">
                    <span className="font-extrabold text-slate-900 block text-xs">3. 15-Day Escrow Shield</span>
                    <span className="text-[11px] text-textMuted">100% refund compliance if withdrawn within 15 days of batch start.</span>
                  </div>
                </div>
              </div>

              {/* Counter Dispute Prompt */}
              <div className="mt-4 pt-3 border-t border-border/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200">
                <div className="flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                  <span className="text-xs text-amber-950 font-medium">
                    Facing issues at counter or denied the ₹15,000 FutureSelector fee discount?
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setGrievanceInst(currentPass.instituteName);
                    setGrievanceSubject(`Counter desk refused to apply ₹15,000 voucher ${currentPass.voucherId}`);
                    setGrievanceDesc(`When presenting voucher ${currentPass.voucherId} at ${currentPass.instituteName}, the accounts staff refused to deduct the ₹15,000 grant.`);
                    setActiveTab("grievances");
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold transition-all shrink-0 cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-200" />
                  <span>Report Grievance (RMS)</span>
                </button>
              </div>
            </motion.div>
          </>
        )}

        {renderPersonalizedRecommendations()}
      </div>
    )}

        {/* ============================================================ */}
        {/* 3. TAB CONTENT 2: SHORTLISTED COACHINGS */}
        {/* ============================================================ */}
        {activeTab === "shortlist" && (
          <div className="space-y-4">
            {shortlistedInstitutes.length === 0 ? (
              <div className="bg-surface border-2 border-dashed border-border rounded-3xl p-8 sm:p-12 text-center space-y-4 shadow-card">
                <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-200 text-rose-500 flex items-center justify-center mx-auto shadow-sm">
                  <Heart className="w-8 h-8 fill-rose-100 text-rose-500" />
                </div>
                <div className="max-w-md mx-auto space-y-1.5">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">
                    Your Shortlist is Empty
                  </h3>
                  <p className="text-sm text-textMuted font-medium">
                    You haven't saved any coaching centers yet. Explore verified institutes across India and click the heart icon to save and compare them side-by-side.
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    to="/find-coaching"
                    className="btn-primary inline-flex items-center gap-2 text-sm font-bold px-6 py-3 shadow-md"
                  >
                    <span>Find Coaching Centers</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <span className="text-textMuted font-semibold">
                    You have saved {shortlistedInstitutes.length} coaching centers to compare
                  </span>
                  <div className="flex items-center gap-2">
                    <Link 
                      to={`/compare?ids=${shortlistedInstitutes.map(i => i.id).join(",")}`}
                      className="btn-primary text-xs py-2 px-3.5 font-bold flex items-center gap-1.5 shadow-xs"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                      <span>Open Side-by-Side Comparison Matrix</span>
                    </Link>
                    <Link 
                      to="/find-coaching"
                      className="btn-secondary text-xs py-2 px-3 font-bold"
                    >
                      <Plus className="w-3.5 h-3.5 text-brand-700" />
                      <span>Add More</span>
                    </Link>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
              {shortlistedInstitutes.map((inst) => (
                <div 
                  key={inst.id}
                  className="bg-surface border border-border rounded-3xl p-5 shadow-card hover:border-brand-300 transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
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
                          <span>{inst.location} ({inst.locality || "Main Campus"})</span>
                        </div>
                      </div>

                      <button
                        onClick={() => toggleShortlist(inst.id)}
                        className="p-1.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                        title="Remove from saved shortlist"
                      >
                        <Heart className="w-4 h-4 fill-rose-500" />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                      <div className="p-2 bg-surfaceWarm rounded-xl border border-border">
                        <span className="text-[9px] uppercase font-bold text-textMuted block">Annual Tuition:</span>
                        <span className="text-xs font-black text-slate-900">{inst.fees}</span>
                      </div>
                      <div className="p-2 bg-surfaceWarm rounded-xl border border-border">
                        <span className="text-[9px] uppercase font-bold text-textMuted block">Batch Cap:</span>
                        <span className="text-xs font-black text-emerald-800">{inst.batchSize}</span>
                      </div>
                      <div className="p-2 bg-surfaceWarm rounded-xl border border-border">
                        <span className="text-[9px] uppercase font-bold text-textMuted block">Selection %:</span>
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
                      <span>Lock ₹15k Waiver Pass</span>
                    </button>

                    <Link
                      to={`/institute/${inst.id}`}
                      className="btn-secondary text-xs py-2 px-3 font-bold"
                    >
                      Audited Report
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {renderPersonalizedRecommendations()}
      </div>
    )}

        {/* ============================================================ */}
        {/* 4. TAB CONTENT 3: 1-ON-1 ACADEMIC ADVISORY */}
        {/* ============================================================ */}
        {activeTab === "counselling" && (
          <div className="bg-surface border border-border rounded-3xl p-6 sm:p-8 shadow-card space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-700 to-brand-900 text-gold-300 flex items-center justify-center font-bold shadow-md shrink-0">
                  <Phone className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full inline-block mb-1">
                    Senior Kota Mentor Desk
                  </span>
                  <h3 className="font-black text-xl text-slate-900">
                    Er. Rajiv Singhal (ex-IIT Roorkee)
                  </h3>
                  <p className="text-xs text-textMuted">
                    18+ years mentoring JEE & NEET aspirants. Unbiased advice with zero coaching commissions.
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] uppercase font-bold text-textMuted block">Advisory Fee:</span>
                <span className="text-sm font-black text-emerald-700">100% Free (Sponsored by FS)</span>
              </div>
            </div>

            {/* Quick Request Callback Form */}
            <div className="p-5 rounded-2xl bg-surfaceWarm border border-border space-y-3">
              <span className="text-xs font-black text-slate-900 block">
                Schedule a Free WhatsApp / Phone Callback with Kota Counselor:
              </span>

              <form onSubmit={handleBookAdvisory} className="grid sm:grid-cols-12 gap-2.5">
                <div className="sm:col-span-5">
                  <label className="text-[10px] font-bold uppercase text-textMuted block mb-1">Topic to Discuss</label>
                  <select
                    value={advisoryTopic}
                    onChange={(e) => setAdvisoryTopic(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-border bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  >
                    <option value="Batch Size & Real Desk Limit">Batch Size & Physical Desk Cap Audit</option>
                    <option value="Faculty Stability & Mid-Session Resignations">Faculty Stability & Resignation Risk</option>
                    <option value="Hostel Proximity & Food Quality in Kota">Hostel Proximity & Mess Quality</option>
                    <option value="Fee Negotiation & Scholarship Concessions">Fee Negotiation & Scholarship Audit</option>
                  </select>
                </div>

                <div className="sm:col-span-4">
                  <label className="text-[10px] font-bold uppercase text-textMuted block mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    defaultValue={user?.phone || "+91 98765 43210"}
                    className="w-full text-xs p-2.5 rounded-xl border border-border bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                <div className="sm:col-span-3 flex items-end">
                  <button
                    type="submit"
                    className="w-full btn-primary text-xs py-2.5 font-bold justify-center cursor-pointer shadow-sm"
                  >
                    <Phone className="w-3.5 h-3.5 mr-1" />
                    <span>Request Callback</span>
                  </button>
                </div>
              </form>

              {advisoryBooked && (
                <div className="p-3 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold text-center flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Callback requested! Opening WhatsApp counselor desk...</span>
                </div>
              )}
            </div>

            {/* Direct Connect Link */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-textMuted">
              <span>Need immediate assistance? Talk to Kota advisory desk directly on WhatsApp.</span>
              <a
                href={`https://api.whatsapp.com/send?phone=919876543210&text=${encodeURIComponent(
                  `Hello FutureSelector Mentor! I am ${user.name} (${user.exam}). My voucher ID is ${currentPass.voucherId}. I need advice on choosing between shortlisted coachings.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary text-xs py-2 px-4 font-bold flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Open Direct WhatsApp Chat</span>
              </a>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* 4. TAB CONTENT 4: SUPPORT & GRIEVANCE RESOLUTION (RMS) */}
        {/* ============================================================ */}
        {activeTab === "grievances" && (
          <div className="space-y-6">
            
            {/* Form Box: Lodge Grievance */}
            <div className="bg-surface border-2 border-border/80 rounded-3xl p-6 sm:p-8 shadow-card space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center font-bold">
                    <LifeBuoy className="w-5 h-5 text-amber-700" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900">
                      Resolution Management System (RMS) — Grievance Desk
                    </h2>
                    <p className="text-xs text-textMuted">
                      Protected under 15-Day Escrow & ₹15,000 Flat Fee Grant Guarantee. Our Super Admin Central Desk intervenes directly.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setGrievanceInst(currentPass?.instituteName || "Allen Career Institute (Kota)");
                    setGrievanceCategory("PASS_DISCOUNT_DISPUTE");
                    setGrievancePriority("CRITICAL");
                    setGrievanceSubject(`Counter desk refused to honor ₹15,000 voucher ${currentPass?.voucherId || "FS-SEAT-7429"}`);
                    setGrievanceDesc(`Center accounts desk claimed voucher token was not recognized despite active pass. Required to pay full ₹1,45,000 tuition without deduction.`);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-bold border border-amber-200 cursor-pointer transition-colors"
                >
                  ⚡ Quick Demo Prefill Dispute
                </button>
              </div>

              {grievanceSuccess && (
                <div className="p-4 bg-emerald-50 border-2 border-emerald-400 rounded-2xl text-xs space-y-1 text-emerald-950 animate-in zoom-in">
                  <div className="flex items-center gap-2 font-black text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Grievance Lodged: {grievanceSuccess.ticketId}</span>
                  </div>
                  <p>
                    Your dispute has been transmitted directly to the <strong>FutureSelector Super Admin RMS panel</strong>.
                    Our Kota Operations Lead has been alerted and will reconcile your admission pass within 6 hours.
                  </p>
                </div>
              )}

              {grievanceError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span>{grievanceError}</span>
                </div>
              )}

              <form onSubmit={handleSubmitGrievance} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-textMuted uppercase tracking-wider block mb-1">
                      Target Coaching Center *
                    </label>
                    <input
                      type="text"
                      required
                      value={grievanceInst}
                      onChange={(e) => setGrievanceInst(e.target.value)}
                      placeholder="e.g. Allen Career Institute (Kota)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border text-xs font-bold text-slate-800 bg-white outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-textMuted uppercase tracking-wider block mb-1">
                      Dispute Category *
                    </label>
                    <select
                      value={grievanceCategory}
                      onChange={(e) => setGrievanceCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border text-xs font-bold text-slate-800 bg-white outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                    >
                      <option value="PASS_DISCOUNT_DISPUTE">Counter Desk Refused ₹15,000 Waiver Grant</option>
                      <option value="BATCH_ALLOTMENT">Wrong Shift / Shift Refusal against Seat Reservation</option>
                      <option value="HOSTEL_COMPLAINT">Partner Hostel Hygiene or Security Non-Compliance</option>
                      <option value="FEE_REFUND_DELAY">15-Day Escrow Refund Delayed by Institute</option>
                      <option value="OTHER">General Platform Assistance</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-textMuted uppercase tracking-wider block mb-1">
                      Urgency / Priority *
                    </label>
                    <select
                      value={grievancePriority}
                      onChange={(e) => setGrievancePriority(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border text-xs font-bold text-slate-800 bg-white outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                    >
                      <option value="CRITICAL">CRITICAL (Counter Issue — 6h SLA)</option>
                      <option value="HIGH">HIGH (Admissions Window Closing)</option>
                      <option value="MEDIUM">MEDIUM (Standard Escalation)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-textMuted uppercase tracking-wider block mb-1">
                    Subject / Headline *
                  </label>
                  <input
                    type="text"
                    required
                    value={grievanceSubject}
                    onChange={(e) => setGrievanceSubject(e.target.value)}
                    placeholder="e.g. Counter clerk at CP Tower refused to apply ₹15,000 voucher"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border text-xs font-medium text-slate-800 bg-white outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-textMuted uppercase tracking-wider block mb-1">
                    Detailed Explanation of What Happened *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={grievanceDesc}
                    onChange={(e) => setGrievanceDesc(e.target.value)}
                    placeholder="Describe staff names, counter number, amount demanded, or exact reason given for denial..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border text-xs text-slate-800 bg-white outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 resize-none"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-textMuted">Contact Phone:</span>
                    <input
                      type="text"
                      value={grievancePhone}
                      onChange={(e) => setGrievancePhone(e.target.value)}
                      className="px-2.5 py-1 rounded-lg border border-border text-xs font-mono font-bold text-slate-800 bg-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingGrievance}
                    className="btn-primary text-xs py-3 px-6 font-bold shadow-md cursor-pointer flex items-center gap-2 bg-amber-700 hover:bg-amber-800 text-white"
                  >
                    {isSubmittingGrievance ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Transmitting to Central Operations...</span>
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-200" />
                        <span>Lodge Dispute with Super Admin</span>
                        <ArrowRight className="w-3.5 h-3.5 text-amber-200" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Live Grievance Tracking Feed */}
            <div className="bg-surface border-2 border-border/80 rounded-3xl p-6 shadow-card space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>My Lodged Grievance Tickets & Live Resolutions</span>
                  </h3>
                  <p className="text-[11px] text-textMuted">
                    Tickets sync live with the FutureSelector Super Admin Resolution Center.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={fetchStudentTickets}
                  disabled={isLoadingTickets}
                  className="px-3 py-1.5 rounded-xl border border-border bg-white hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  title="Refresh status"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingTickets ? "animate-spin" : ""}`} />
                  <span>Refresh</span>
                </button>
              </div>

              {studentTickets.length === 0 ? (
                <div className="p-8 text-center bg-surfaceWarm rounded-2xl border border-dashed border-border space-y-2">
                  <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-800">No active grievances on record</h4>
                  <p className="text-xs text-textMuted max-w-md mx-auto">
                    Your admission voucher is in good standing. If you ever face counter resistance, submit a ticket above for immediate Super Admin intervention.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {studentTickets.map((ticket, idx) => (
                    <div
                      key={ticket.ticketId || idx}
                      className="p-5 rounded-2xl bg-white border-2 border-border shadow-2xs space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-border">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-slate-900 text-xs bg-slate-100 px-2.5 py-0.5 rounded-lg">
                            {ticket.ticketId}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
                            {ticket.category}
                          </span>
                          <span className="text-textMuted text-xs">•</span>
                          <strong className="text-xs text-slate-900">{ticket.instituteName}</strong>
                        </div>

                        <div>
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            ticket.status === "RESOLVED"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : ticket.status === "IN_PROGRESS"
                              ? "bg-blue-100 text-blue-800 border border-blue-300"
                              : "bg-amber-100 text-amber-800 border border-amber-300"
                          }`}>
                            {ticket.status === "RESOLVED"
                              ? "✅ RESOLVED BY SUPER ADMIN"
                              : ticket.status === "IN_PROGRESS"
                              ? "⚙️ IN PROGRESS (Operations Investigating)"
                              : "⏳ OPEN (Under Review)"}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-xs font-black text-slate-900">{ticket.subject}</h4>
                        <p className="text-xs text-slate-600 leading-relaxed">{ticket.description}</p>
                      </div>

                      {/* Display Institute Official Response if present */}
                      {ticket.instituteResponse && (
                        <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs space-y-1 text-blue-950">
                          <div className="flex items-center gap-1.5 font-black text-blue-800">
                            <span>Official Response from {ticket.instituteName}:</span>
                          </div>
                          <p className="font-medium text-slate-800 text-xs pl-2">
                            "{ticket.instituteResponse}"
                          </p>
                          <div className="text-[10px] text-blue-700 pl-2 pt-0.5">
                            Dispatched by {ticket.instituteRespondedBy || "Center Admissions In-Charge"}
                          </div>
                        </div>
                      )}

                      {/* Display Super Admin Resolution Box if Resolved */}
                      {ticket.status === "RESOLVED" && ticket.resolutionNotes && (
                        <div className="p-3.5 rounded-xl bg-emerald-50 border-2 border-emerald-500/40 text-xs space-y-1 text-emerald-950">
                          <div className="flex items-center gap-1.5 font-black text-emerald-800">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Official Resolution from FutureSelector Super Admin:</span>
                          </div>
                          <p className="font-medium text-emerald-900 text-xs pl-5.5">
                            "{ticket.resolutionNotes}"
                          </p>
                          <div className="text-[10px] text-emerald-700 pl-5.5 pt-0.5 font-mono">
                            Verified by Central Operations Desk • Student Voucher Reconciled
                          </div>
                        </div>
                      )}

                      {/* 3-Way Student Actions: Confirm Resolution or Reopen Dispute */}
                      {ticket.status !== "CLOSED" && (ticket.status === "RESOLVED" || ticket.status === "INSTITUTE_RESPONDED") && (
                        <div className="pt-2 flex items-center gap-2 border-t border-border">
                          <button
                            type="button"
                            onClick={() => handleConfirmResolution(ticket.ticketId)}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
                            <span>Confirm Resolution & Close</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleReopenTicket(ticket.ticketId)}
                            className="px-3.5 py-1.5 rounded-xl bg-red-100 hover:bg-red-200 text-red-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                          >
                            <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                            <span>Reopen Dispute</span>
                          </button>
                        </div>
                      )}

                      {ticket.status === "CLOSED" && (
                        <div className="text-emerald-800 font-bold text-xs flex items-center gap-1 pt-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Dispute closed with student resolution confirmation</span>
                        </div>
                      )}

                      {ticket.status === "REOPENED" && (
                        <div className="text-red-700 font-bold text-xs flex items-center gap-1 pt-1">
                          <AlertCircle className="w-4 h-4 text-red-600" />
                          <span>Dispute escalated & reopened by student — under executive review</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[10px] text-textMuted pt-1">
                        <span>Assigned Officer: <strong className="text-slate-700">{ticket.assignedTo || "Operations Lead"}</strong></span>
                        <span>Lodged: {new Date(ticket.createdAt || Date.now()).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

      </div>

      {/* ============================================================ */}
      {/* 5. EDIT ASPIRANT PREFERENCES MODAL */}
      {/* ============================================================ */}
      <AnimatePresence>
        {isEditProfileOpen && (
          <div 
            onClick={() => setIsEditProfileOpen(false)}
            className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface rounded-3xl border border-border shadow-2xl max-w-lg w-full overflow-hidden relative my-6 flex flex-col"
            >
              <div className="bg-gradient-to-r from-brand-900 to-emerald-950 text-white p-5 shrink-0 flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-black text-white">
                    {(!user.exam || !user.city) ? "Welcome! Set Your Study Preferences" : "Edit Aspirant Preferences"}
                  </h3>
                  <p className="text-xs text-white/80">
                    {(!user.exam || !user.city) 
                      ? "Choose your Target Exam, Hub, and Class to personalize your admissions."
                      : "Customize your target exam, class, and coaching location."}
                  </p>
                </div>
                <button
                  onClick={() => setIsEditProfileOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="p-5 space-y-3.5">
                {editSuccessMsg && (
                  <div className="p-2.5 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold text-center">
                    {editSuccessMsg}
                  </div>
                )}

                <div>
                  <label className="text-[10px] font-bold uppercase text-textMuted block mb-1">Student Name</label>
                  <input
                    type="text"
                    required
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-border bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-textMuted block mb-1">Target Exam</label>
                    <select
                      value={profileForm.exam}
                      onChange={(e) => setProfileForm({ ...profileForm, exam: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl border border-border bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    >
                      <option value="">-- Select Target Exam --</option>
                      <option value="JEE Advanced 2026">JEE Advanced 2026</option>
                      <option value="JEE Main 2026">JEE Main 2026</option>
                      <option value="NEET-UG 2026">NEET-UG 2026</option>
                      <option value="Foundation (Class 9-10)">Foundation (Class 9-10)</option>
                      <option value="CUET / Other">CUET / Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-textMuted block mb-1">Class / Standard</label>
                    <select
                      value={profileForm.standard}
                      onChange={(e) => setProfileForm({ ...profileForm, standard: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl border border-border bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    >
                      <option value="">-- Select Class --</option>
                      <option value="11th Science">11th Science (Fresh Batch)</option>
                      <option value="12th Science">12th Science (Target 2026)</option>
                      <option value="Dropper / Repeater">Dropper / Repeater Batch</option>
                      <option value="Foundation">Foundation (9th / 10th)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-textMuted block mb-1">Target Hub / City</label>
                    <input
                      type="text"
                      list="hub-city-options"
                      placeholder="e.g. Kota, Rajasthan"
                      value={profileForm.city}
                      onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl border border-border bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                    <datalist id="hub-city-options">
                      <option value="Kota, Rajasthan" />
                      <option value="Delhi NCR" />
                      <option value="Hyderabad" />
                      <option value="Bengaluru" />
                      <option value="Jaipur" />
                      <option value="Lucknow" />
                      <option value="Patna" />
                      <option value="Agra" />
                      <option value="Pune" />
                      <option value="Online / Remote" />
                    </datalist>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-textMuted block mb-1">Dream College Aim</label>
                    <input
                      type="text"
                      placeholder="e.g. IIT Bombay / AIIMS"
                      value={profileForm.dreamCollege}
                      onChange={(e) => setProfileForm({ ...profileForm, dreamCollege: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl border border-border bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setIsEditProfileOpen(false)}
                    className="btn-secondary text-xs py-2.5 px-4 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary text-xs py-2.5 px-5 font-bold shadow-sm"
                  >
                    {(!user.exam || !user.city) ? "Save & Continue" : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
