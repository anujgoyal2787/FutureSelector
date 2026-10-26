import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, ShieldCheck, CheckCircle2, ArrowRight, Phone, User, Mail,
  Calendar, MapPin, BookOpen, Clock, Star, MessageSquare, Video, 
  HelpCircle, ChevronDown, ChevronUp, Share2, Award, Zap, 
  HeartHandshake, Check, AlertCircle, PhoneCall, Lock, Loader2,
  QrCode, CreditCard, Smartphone, X, Building2
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { counsellingAPI } from "../services/api";
import BorderBeam from "../component/reactbits/BorderBeam";
import ShinyText from "../component/reactbits/ShinyText";
import StarBorder from "../component/reactbits/StarBorder";

// Verified Senior Academic Mentors
const MENTORS = [
  {
    id: "raghavendra",
    name: "Er. Raghavendra Singhal",
    title: "Ex-Allen Senior Physics Faculty",
    credentials: "IIT Bombay B.Tech (AIR 142)",
    experience: "11+ Years Kota Mentorship",
    specialty: "JEE Advanced Strategy & Dropper Guidance",
    rating: "4.96",
    sessionsCount: "2,140+",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    badge: "JEE Head Advisor"
  },
  {
    id: "priya",
    name: "Dr. Priya Nambiar",
    title: "Senior Medical Admissions Mentor",
    credentials: "AIIMS New Delhi (MBBS)",
    experience: "9+ Years NEET UG Advisory",
    specialty: "NEET Botany/Zoology & Government Seat Cutoffs",
    rating: "4.94",
    sessionsCount: "1,890+",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
    badge: "NEET Medical Head"
  },
  {
    id: "aman",
    name: "Er. Aman Verma",
    title: "Senior Mathematics Strategist",
    credentials: "IIT Delhi (B.Tech)",
    experience: "8+ Years National Guidance",
    specialty: "Foundation (9th-10th) & Coaching Comparison",
    rating: "4.91",
    sessionsCount: "1,420+",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
    badge: "Foundation & IITian"
  }
];

// Advisory Tracks
const ADVISORY_TRACKS = [
  {
    id: "coaching-reality",
    title: "Coaching & Batch Cap Reality Check",
    duration: "30 Mins",
    icon: "🏛️",
    desc: "Unbiased comparison of Allen, Resonance, Aakash, FIITJEE & Motion. Verify genuine batch sizes and faculty churn before paying."
  },
  {
    id: "kota-hostels",
    title: "Parent Consultation & Kota Hostel Safety",
    duration: "30 Mins",
    icon: "🛡️",
    desc: "Mess food hygiene audit, warden surveillance, distance to coaching, and safe PG recommendations for parents."
  },
  {
    id: "scholarship-fee",
    title: "Scholarship & Fee Negotiation Advisory",
    duration: "20 Mins",
    icon: "💰",
    desc: "How to maximize TALLENTEX/ANTHE waiver + combine the ₹15,000 FutureSelector Admission Voucher."
  }
];

// FAQs for Aspirants and Parents
const FAQS = [
  {
    q: "Why is there a nominal ₹11 commitment fee for 1-on-1 counselling?",
    a: "FutureSelector introduced a nominal ₹11 commitment token to eliminate automated bots, fake spam registrations, and casual slot-blocking. This ensures only genuine, committed JEE/NEET aspirants connect directly with our senior IIT & AIIMS mentors."
  },
  {
    q: "Will my contact number be shared with coaching telemarketers?",
    a: "Strictly NO. Under our Zero-Telemarketing policy, your contact information is protected under end-to-end encryption and is never sold or handed over to coaching call centers. You will only be contacted by your assigned mentor."
  },
  {
    q: "Can parents join the consultation call or conference?",
    a: "Absolutely! Over 80% of our calls are 3-way family conferences. We encourage parents to be on the call to ask critical questions regarding mess hygiene, fee refund policies, and hostel safety."
  },
  {
    q: "How does the ₹15,000 FutureSelector Seat Lock voucher work?",
    a: "When you lock your admission seat through FutureSelector after your counseling call, an instant ₹15,000 direct fee waiver is generated on your official admission receipt, backed by our 15-day refund escrow guarantee."
  }
];

export default function Counselling() {
  const { user } = useAuth();
  
  // Form State
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone ? user.phone.replace("+91 ", "") : "",
    email: user?.email || "",
    exam: user?.exam || "JEE Advanced",
    city: "Kota",
    track: "coaching-reality",
    preferredDate: "Today (Fast-Track)",
    preferredTime: "Evening (6:00 PM - 9:00 PM)",
    callMode: "Direct Phone Call",
    notes: ""
  });

  const [submitted, setSubmitted] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [assignedMentor, setAssignedMentor] = useState(MENTORS[0]);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (typeof window !== "undefined" && window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      const timeout = setTimeout(() => {
        resolve(false);
      }, 5000);
      script.onload = () => {
        clearTimeout(timeout);
        resolve(true);
      };
      script.onerror = () => {
        clearTimeout(timeout);
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      setPaymentError("Please enter your student name and contact number to continue.");
      return;
    }

    setIsProcessingPayment(true);
    setPaymentError("");

    let mentor = MENTORS[0];
    if (formData.exam.includes("NEET")) {
      mentor = MENTORS[1];
    } else if (formData.exam.includes("Foundation")) {
      mentor = MENTORS[2];
    }
    setAssignedMentor(mentor);

    try {
      // Step 1: Create Order on Backend
      const orderRes = await counsellingAPI.createPaymentOrder({
        studentName: formData.name,
        phone: formData.phone,
        email: formData.email,
        city: formData.city,
        callMode: formData.callMode,
        targetExam: formData.exam,
        counsellorName: mentor.name,
        counsellorId: mentor.id,
        slotTime: formData.preferredTime,
        date: formData.preferredDate,
        trackTitle: ADVISORY_TRACKS.find(t => t.id === formData.track)?.title || "Coaching & Batch Cap Reality Check",
        notes: formData.notes
      });

      // Step 2: Load Official Razorpay Checkout Script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || !window.Razorpay) {
        throw new Error("Unable to load Razorpay Checkout SDK. Please check your internet connection.");
      }

      const options = {
        key: orderRes.keyId || "rzp_test_TrRRT8J3Vu7Lun",
        amount: orderRes.amount || 1100,
        currency: orderRes.currency || "INR",
        name: "FutureSelector",
        description: "₹11 Commitment Token Fee • 1-on-1 Academic Advisory",
        prefill: {
          name: formData.name,
          contact: formData.phone,
          email: formData.email || undefined
        },
        theme: {
          color: "#124B38"
        },
        handler: async function (response) {
          try {
            const verifyRes = await counsellingAPI.verifyPayment({
              bookingId: orderRes.bookingId,
              razorpay_order_id: response.razorpay_order_id || orderRes.orderId,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            setConfirmedBooking(verifyRes.booking);
            setSubmitted(true);
            window.scrollTo({ top: 0, behavior: "smooth" });
          } catch (verifyErr) {
            setPaymentError(verifyErr.message || "Payment verification failed on server");
          } finally {
            setIsProcessingPayment(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsProcessingPayment(false);
          }
        }
      };

      // Only attach order_id if it's a genuine live Razorpay order ID
      if (orderRes.orderId && orderRes.orderId.startsWith("order_") && !orderRes.orderId.startsWith("order_cns_") && !orderRes.orderId.startsWith("order_pending_")) {
        options.order_id = orderRes.orderId;
      }

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (resp) {
        setPaymentError(resp.error?.description || "Payment failed or was cancelled by user");
        setIsProcessingPayment(false);
      });
      rzp.open();
      console.log("💳 [RAZORPAY OPENED]: Order ID:", orderRes.orderId);
    } catch (err) {
      setPaymentError(err.message || "Failed to initiate counseling order. Please check inputs.");
      setIsProcessingPayment(false);
    }
  };

  const handleInstantWhatsApp = () => {
    const text = `Hi FutureSelector Mentor! 👋\nI am preparing for *${formData.exam}* and need urgent unbiased guidance regarding coaching centers, batch caps, and scholarships in *${formData.city}*.\nName: ${formData.name || "Aspirant"}`;
    window.open(`https://api.whatsapp.com/send?phone=919876543210&text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-background pt-24 sm:pt-28 pb-20 px-4 sm:px-6 relative overflow-hidden">
      
      {/* Background Soft Glow Accents */}
      <div className="absolute top-10 left-1/3 w-[500px] h-[500px] bg-gradient-to-br from-brand-600/8 via-emerald-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-10 w-[450px] h-[450px] bg-gradient-to-bl from-gold-500/10 via-amber-400/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10 space-y-12">
        
        {/* ============================================================ */}
        {/* HEADER SECTION */}
        {/* ============================================================ */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-900 text-xs font-bold shadow-2xs"
          >
            <ShieldCheck className="w-4 h-4 text-brand-600" />
            <span>100% Non-Commissioned Senior Academic Mentorship</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight"
          >
            Talk to Senior IIT & AIIMS Mentors <br />
            <span className="text-brand-600">Before You Pay Any Coaching ₹2 Lakhs</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-sm sm:text-base text-slate-700 leading-relaxed font-medium"
          >
            Get unvarnished facts on actual classroom batch sizes, faculty churn, Kota hostel safety, and fee negotiation. No aggressive sales pitches, zero spam telemarketers.
          </motion.p>
        </div>

        {/* ============================================================ */}
        {/* SUBMITTED SUCCESS STATE: DIGITAL APPOINTMENT PASS */}
        {/* ============================================================ */}
        {submitted ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto bg-surface border-2 border-emerald-400/80 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden"
          >
            <BorderBeam size={220} duration={6} borderWidth={2} colorFrom="#10B981" colorTo="#F59E0B" />

            <div className="text-center space-y-3 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-black uppercase tracking-wider">
                Consultation Confirmed • Booking #{confirmedBooking?.bookingId || "CNS-2026"} • ₹11 Paid
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                1-on-1 Mentorship Advisory Confirmed!
              </h2>

              <p className="text-xs sm:text-sm text-slate-700 max-w-lg mx-auto">
                Thank you, <strong>{formData.name || "Aspirant"}</strong>. Your ₹11 token commitment fee was verified via Razorpay ({confirmedBooking?.razorpayPaymentId || "pay_verified"}). Consultation is confirmed for <strong>{formData.preferredDate}</strong> ({formData.preferredTime}).
              </p>
            </div>

            {/* Assigned Mentor Card */}
            <div className="mt-8 bg-surfaceWarm/80 border border-border rounded-2xl p-4 sm:p-5 flex items-center gap-4 relative z-10">
              <img 
                src={assignedMentor.avatar} 
                alt={assignedMentor.name} 
                className="w-16 h-16 rounded-2xl object-cover border-2 border-brand-500 shadow-sm shrink-0" 
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-200">
                    Assigned Senior Mentor
                  </span>
                  <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    {assignedMentor.rating}
                  </span>
                </div>
                <h4 className="text-base font-extrabold text-slate-900">{assignedMentor.name}</h4>
                <p className="text-xs text-slate-600 font-semibold">{assignedMentor.title} • {assignedMentor.credentials}</p>
              </div>
            </div>

            {/* Session Highlights Pill Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4 text-xs font-semibold relative z-10">
              <div className="p-3 bg-white rounded-xl border border-border">
                <span className="text-[10px] text-textMuted uppercase font-bold block">Target Exam</span>
                <span className="font-extrabold text-slate-900">{formData.exam}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-border">
                <span className="text-[10px] text-textMuted uppercase font-bold block">Preferred City</span>
                <span className="font-extrabold text-slate-900">{formData.city}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-border col-span-2 sm:col-span-1">
                <span className="text-[10px] text-textMuted uppercase font-bold block">Session Mode</span>
                <span className="font-extrabold text-brand-700">{formData.callMode}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3 relative z-10">
              <button
                onClick={handleInstantWhatsApp}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Connect with Mentor on WhatsApp</span>
              </button>
              <Link 
                to="/compare" 
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-surface hover:bg-surfaceWarm border border-border text-slate-900 font-bold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <span>Compare Coachings Now</span>
                <ArrowRight className="w-4 h-4 text-brand-600" />
              </Link>
            </div>
          </motion.div>
        ) : (
          /* ============================================================ */
          /* MAIN TWO-COLUMN BOOKING INTERFACE */
          /* ============================================================ */
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN (FORM): 7 COLS */}
            <div className="lg:col-span-7 bg-surface rounded-3xl border border-border p-6 sm:p-8 shadow-card space-y-6">
              
              <div className="border-b border-border pb-4">
                <h3 className="text-xl font-black text-slate-900">
                  Book Your Free 1-on-1 Guidance Session
                </h3>
                <p className="text-xs text-textMuted font-medium mt-1">
                  Average callback time: within 30 minutes during working hours (9:00 AM - 9:00 PM).
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Advisory Track Selector */}
                <div>
                  <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-2">
                    Select Your Consultation Focus *
                  </label>
                  <div className="grid sm:grid-cols-3 gap-2.5">
                    {ADVISORY_TRACKS.map((trk) => {
                      const isSelected = formData.track === trk.id;
                      return (
                        <div
                          key={trk.id}
                          onClick={() => setFormData({ ...formData, track: trk.id })}
                          className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected 
                              ? "bg-brand-50/80 border-brand-500 shadow-xs" 
                              : "bg-surfaceWarm/50 border-border hover:border-brand-200"
                          }`}
                        >
                          <div>
                            <span className="text-xl block mb-1">{trk.icon}</span>
                            <h4 className="text-xs font-extrabold text-slate-900 leading-snug">{trk.title}</h4>
                          </div>
                          <span className="text-[10px] font-bold text-brand-700 bg-brand-100/60 px-2 py-0.5 rounded-md mt-2 inline-block w-fit">
                            {trk.duration}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Personal Inputs: Name & Phone */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                      Student / Parent Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-textMuted absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Aryan Sharma"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-border bg-background text-xs font-bold text-slate-900 focus:border-brand-600 focus:bg-white outline-none transition-all shadow-2xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                      WhatsApp / Mobile Number *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-textMuted absolute left-3.5 top-3" />
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="e.g. 9876543210"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-border bg-background text-xs font-bold text-slate-900 focus:border-brand-600 focus:bg-white outline-none transition-all shadow-2xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Email Address for Confirmation Pass & Meet Invite */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>Email Address (For Google Meet Link & Confirmation)</span>
                    <span className="text-[10px] text-textMuted font-medium lowercase">optional</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-textMuted absolute left-3.5 top-3" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. student@gmail.com (Receive official appointment pass)"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-border bg-background text-xs font-bold text-slate-900 focus:border-brand-600 focus:bg-white outline-none transition-all shadow-2xs"
                    />
                  </div>
                </div>

                {/* Exam & City Selectors */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                      Target Exam *
                    </label>
                    <select
                      value={formData.exam}
                      onChange={(e) => setFormData({ ...formData, exam: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-xs font-bold text-slate-900 focus:border-brand-600 focus:bg-white outline-none transition-all shadow-2xs cursor-pointer"
                    >
                      <option value="JEE Advanced">JEE Advanced (IIT Target)</option>
                      <option value="JEE Mains">JEE Mains (NITs / IIITs)</option>
                      <option value="NEET UG">NEET UG (Govt Medical Colleges)</option>
                      <option value="Foundation">Foundation (Class 8th to 10th)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                      Target Coaching City *
                    </label>
                    <select
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-xs font-bold text-slate-900 focus:border-brand-600 focus:bg-white outline-none transition-all shadow-2xs cursor-pointer"
                    >
                      <option value="Kota">Kota (Rajasthan)</option>
                      <option value="Delhi NCR">Delhi NCR (Kalu Sarai / Janakpuri)</option>
                      <option value="Hyderabad">Hyderabad</option>
                      <option value="Jaipur">Jaipur</option>
                      <option value="Lucknow">Lucknow</option>
                      <option value="Patna">Patna</option>
                      <option value="Pan-India / Online">Pan-India / Online Hybrid</option>
                    </select>
                  </div>
                </div>

                {/* Preferred Date & Time Window */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                      Preferred Day *
                    </label>
                    <select
                      value={formData.preferredDate}
                      onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-xs font-bold text-slate-900 focus:border-brand-600 focus:bg-white outline-none transition-all shadow-2xs cursor-pointer"
                    >
                      <option value="Today (Fast-Track)">Today (Within 30 mins)</option>
                      <option value="Tomorrow Morning">Tomorrow Morning</option>
                      <option value="Tomorrow Evening">Tomorrow Evening</option>
                      <option value="This Coming Weekend">This Coming Weekend</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                      Preferred Time Window *
                    </label>
                    <select
                      value={formData.preferredTime}
                      onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-xs font-bold text-slate-900 focus:border-brand-600 focus:bg-white outline-none transition-all shadow-2xs cursor-pointer"
                    >
                      <option value="Evening (6:00 PM - 9:00 PM)">Evening (6:00 PM - 9:00 PM)</option>
                      <option value="Afternoon (2:00 PM - 5:00 PM)">Afternoon (2:00 PM - 5:00 PM)</option>
                      <option value="Morning (10:00 AM - 1:00 PM)">Morning (10:00 AM - 1:00 PM)</option>
                    </select>
                  </div>
                </div>

                {/* Mode of Consultation */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                    Consultation Mode
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Direct Phone Call", "WhatsApp Audio", "Google Meet Link"].map((mode) => (
                      <button
                        type="button"
                        key={mode}
                        onClick={() => setFormData({ ...formData, callMode: mode })}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          formData.callMode === mode
                            ? "bg-brand-600 text-white border-brand-600 shadow-2xs"
                            : "bg-surfaceWarm/50 text-slate-700 border-border hover:border-brand-300"
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Specific Queries / Notes */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                    Specific Coaching Centers or Questions (Optional)
                  </label>
                  <textarea
                    rows="2"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="e.g. Confused between Allen Leader batch vs Resonance, need hostel near CP Tower."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-xs font-medium text-slate-900 focus:border-brand-600 focus:bg-white outline-none transition-all shadow-2xs"
                  />
                </div>

                {/* Payment Breakdown Card */}
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 text-xs space-y-2">
                  <div className="flex items-center justify-between font-bold text-slate-700">
                    <span>1-on-1 Senior Advisory Session Value:</span>
                    <span className="line-through text-slate-400">₹999</span>
                  </div>
                  <div className="flex items-center justify-between font-bold text-emerald-800">
                    <span>FutureSelector Educational Subsidy:</span>
                    <span>-₹988</span>
                  </div>
                  <div className="border-t border-emerald-200/80 pt-2 flex items-center justify-between text-sm font-black text-slate-900">
                    <span className="flex items-center gap-1.5">
                      <Lock className="w-4 h-4 text-emerald-700" />
                      Commitment Token Fee:
                    </span>
                    <span className="text-emerald-800 font-mono text-base font-extrabold bg-emerald-100 px-2.5 py-0.5 rounded-lg border border-emerald-300">
                      ₹11 Only
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 pt-0.5">
                    100% refundable token fee to filter spam telemarketers and secure dedicated time with senior IIT/AIIMS faculty.
                  </p>
                </div>

                {paymentError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{paymentError}</span>
                  </div>
                )}

                {/* Submit / Pay Button */}
                <button
                  type="submit"
                  id="counselling-pay-btn"
                  data-testid="pay-counselling-btn"
                  disabled={isProcessingPayment}
                  className="w-full py-3.5 px-6 rounded-2xl bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-[0.99]"
                >
                  {isProcessingPayment ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Opening Secure Razorpay Gateway (₹11)...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-gold-300" />
                      <span>Pay ₹11 & Book 1-on-1 Advisory Session</span>
                    </>
                  )}
                </button>

                {/* Privacy & Anti-Spam Guarantee */}
                <div className="flex items-center justify-center gap-4 text-[11px] text-textMuted font-medium pt-1">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Zero Spam Guarantee
                  </span>
                  <span>•</span>
                  <span>No Coaching Commission</span>
                  <span>•</span>
                  <span>End-to-End Encrypted</span>
                </div>
              </form>
            </div>

            {/* RIGHT COLUMN: 5 COLS - MENTOR SHOWCASE & INSTANT WHATSAPP */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Instant WhatsApp Card */}
              <div className="bg-gradient-to-br from-emerald-900 to-brand-950 text-white rounded-3xl p-6 shadow-xl border border-emerald-700/40 relative overflow-hidden">
                <BorderBeam size={200} duration={8} borderWidth={2} colorFrom="#10B981" colorTo="#F59E0B" />

                <div className="space-y-3 relative z-10">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[11px] font-black uppercase tracking-wider text-emerald-300">
                      Counselors On-Duty Now
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-white">
                    Need Answers in Next 5 Minutes?
                  </h3>

                  <p className="text-xs text-white/80 leading-relaxed font-medium">
                    Skip the waiting queue. Chat directly with a senior Kota academic coordinator via official WhatsApp hotline.
                  </p>

                  <button
                    onClick={handleInstantWhatsApp}
                    className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-brand-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 fill-brand-950" />
                    <span>Open Live WhatsApp Desk</span>
                  </button>
                </div>
              </div>

              {/* Verified Mentor Cards */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-gold-500" />
                    <span>Meet Our Senior Academic Panel</span>
                  </h4>
                  <span className="text-[11px] text-textMuted font-semibold">100% Salaried</span>
                </div>

                {MENTORS.map((m) => (
                  <div 
                    key={m.id}
                    className="bg-surface rounded-2xl border border-border p-4 shadow-2xs hover:shadow-card transition-all flex items-start gap-3.5"
                  >
                    <img 
                      src={m.avatar} 
                      alt={m.name} 
                      className="w-13 h-13 rounded-xl object-cover border border-border shrink-0" 
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <h5 className="text-xs font-black text-slate-900 truncate">{m.name}</h5>
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 shrink-0 flex items-center gap-0.5">
                          ★ {m.rating}
                        </span>
                      </div>
                      <p className="text-[11px] font-bold text-brand-700">{m.credentials}</p>
                      <p className="text-[10px] text-slate-600 mt-0.5">{m.title} • {m.experience}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* 3-Step Guidance Journey */}
              <div className="bg-surface rounded-2xl border border-border p-4.5 space-y-3">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  How FutureSelector Guidance Works:
                </h4>
                <div className="space-y-2.5 text-xs text-slate-700">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-brand-100 text-brand-800 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">1</span>
                    <span><strong>Submit Your Goal:</strong> Tell us your target exam, score in mock tests, and budget limits.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-brand-100 text-brand-800 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">2</span>
                    <span><strong>Unbiased 30-Min Call:</strong> Senior mentor audits your chosen institutes with zero sales pressure.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-brand-100 text-brand-800 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">3</span>
                    <span><strong>Unlock ₹15,000 Voucher:</strong> Once satisfied, lock seat with direct fee discount + escrow protection.</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* INTERACTIVE PARENT & ASPIRANT FAQ ACCORDION */}
        {/* ============================================================ */}
        <div className="bg-surface rounded-3xl border border-border p-6 sm:p-8 space-y-4 max-w-4xl mx-auto shadow-2xs">
          <div className="text-center space-y-1 mb-6">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">
              Frequently Asked Questions by Parents
            </h3>
            <p className="text-xs text-textMuted font-medium">
              Everything you need to know about our advisory ethics, fee vouchers, and privacy guarantee.
            </p>
          </div>

          <div className="space-y-2.5">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div 
                  key={idx}
                  className="rounded-2xl border border-border overflow-hidden transition-all bg-surfaceWarm/30"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                    className="w-full py-3.5 px-4 sm:px-5 flex items-center justify-between text-left font-bold text-xs sm:text-sm text-slate-900 cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-brand-600 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-textMuted shrink-0" />
                    )}
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-4 sm:px-5 pb-4 text-xs text-slate-700 leading-relaxed font-medium border-t border-border/50 pt-2"
                      >
                        {faq.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
