import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Award, ShieldCheck, ArrowRight, CheckCircle2, Sparkles, 
  IndianRupee, Calendar, Users, Percent, Download, Calculator, 
  ExternalLink, ChevronRight, AlertCircle, BookOpen, Clock, HeartHandshake
} from "lucide-react";
import { institutesData } from "../data/institutes";
import { useAuth } from "../context/AuthContext";
import SeatLockModal from "../component/SeatLockModal";
import StarBorder from "../component/reactbits/StarBorder";
import ShinyText from "../component/reactbits/ShinyText";
import BorderBeam from "../component/reactbits/BorderBeam";

// Real All-India National Scholarship Entrance Tests
const SCHOLARSHIP_EXAMS = [
  {
    id: "tallentex",
    institute: "Allen Career Institute",
    examName: "TALLENTEX 2026",
    tagline: "India's Most Prestigious Talent Encouragement Exam",
    badge: "Up to 90% Scholarship",
    scholarshipPool: "₹250+ Crores",
    cashAwards: "₹1.25 Crore Cash Prizes",
    eligibility: "Classes 5th to 10th & 11th Science",
    testDates: "October 2025 – November 2025 (Annual)",
    mode: "Online (CBT) & Offline at 350+ Centers",
    syllabus: "Physics, Chemistry, Maths/Bio & Mental Ability (NCERT)",
    logoBg: "bg-emerald-600",
    counterCode: "FS-ALLEN-15K"
  },
  {
    id: "anthe",
    institute: "Aakash Institute",
    examName: "ANTHE 2026",
    tagline: "Aakash National Talent Hunt Exam for NEET & JEE",
    badge: "100% Full Tuition Waiver",
    scholarshipPool: "100% Scholarship on Medical / Engg",
    cashAwards: "All-Expense Paid Science NASA Tour",
    eligibility: "Classes 7th to 12th & 12th Passed",
    testDates: "October 2025 – December 2025",
    mode: "Online (From Home) & Offline Centers",
    syllabus: "Class-appropriate Science, Maths & Mental Aptitude",
    logoBg: "bg-blue-600",
    counterCode: "FS-AAKASH-15K"
  },
  {
    id: "ftre",
    institute: "FIITJEE",
    examName: "FTRE 2026",
    tagline: "FIITJEE Talent Reward Exam for JEE Advanced",
    badge: "Up to 100% Tuition Waiver",
    scholarshipPool: "Merit-based Fee Waivers + Hostel Grants",
    cashAwards: "Cash Scholarships for Top 100 Rankers",
    eligibility: "Classes 5th, 6th, 7th, 8th, 9th, 10th & 11th",
    testDates: "December 2025 – January 2026",
    mode: "Offline Proctored Examination",
    syllabus: "Advanced IQ & Analytical Problem Solving",
    logoBg: "bg-amber-600",
    counterCode: "FS-FIITJEE-15K"
  },
  {
    id: "resofast",
    institute: "Resonance Eduventures",
    examName: "ResoFAST / ResoNET 2026",
    tagline: "Resonance Forward Admission & Scholarship Test",
    badge: "Up to 90% Scholarship",
    scholarshipPool: "Direct Kota Admission + Fee Concession",
    cashAwards: "Special Ranker Study Grants",
    eligibility: "Class 10th, 11th, 12th & Droppers",
    testDates: "Conducted Monthly (Next: Nov 2025)",
    mode: "Computer Based Test & Pen-Paper Mode",
    syllabus: "NCERT Science, Mathematics & Reasoning",
    logoBg: "bg-teal-600",
    counterCode: "FS-RESO-15K"
  }
];

// Statutory Category & Merit Concessions
const MERIT_SLABS = [
  {
    criteria: "Class 10th Board Exam Score ≥ 95%",
    waiver: "30% – 40% Direct Tuition Waiver",
    docs: "Original Board Marksheet / Digilocker Verified",
    category: "Board Merit"
  },
  {
    criteria: "Single Girl Child / Girl Aspirant Encouragement",
    waiver: "10% – 15% Additional Concession",
    docs: "Parent Affidavit / Identification Proof",
    category: "Girls Empowerment"
  },
  {
    criteria: "Armed Forces / Paramilitary & Police Wards",
    waiver: "20% – 25% Institutional Honor Waiver",
    docs: "Service Book / Dependent Card",
    category: "Defense Wards"
  },
  {
    criteria: "Sibling / Alumni Concession",
    waiver: "10% Concession on Tuition",
    docs: "Previous Student ID / Enrollment Receipt",
    category: "Sibling Loyalty"
  }
];

export default function Scholarships() {
  const { user } = useAuth();
  
  // Calculator State
  const [targetExam, setTargetExam] = useState("jee");
  const [boardScore, setBoardScore] = useState(92);
  const [hasDiagnosticScore, setHasDiagnosticScore] = useState(true);
  const [diagnosticPercentile, setDiagnosticPercentile] = useState(85);
  const [seatLockInstitute, setSeatLockInstitute] = useState(null);

  // Dynamic Scholarship Calculation
  const estimatedDiscountPercent = useMemo(() => {
    let pct = 0;
    if (boardScore >= 95) pct += 35;
    else if (boardScore >= 90) pct += 25;
    else if (boardScore >= 80) pct += 15;
    else pct += 10;

    if (hasDiagnosticScore) {
      if (diagnosticPercentile >= 95) pct += 25;
      else if (diagnosticPercentile >= 85) pct += 15;
      else if (diagnosticPercentile >= 70) pct += 10;
    }

    return Math.min(75, pct);
  }, [boardScore, hasDiagnosticScore, diagnosticPercentile]);

  return (
    <div className="min-h-screen bg-background pt-24 sm:pt-28 pb-20 px-4 sm:px-6 relative overflow-hidden">
      
      {/* Background Soft Ambient Lights */}
      <div className="absolute top-10 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-gold-600/10 via-amber-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[450px] h-[450px] bg-gradient-to-bl from-brand-500/10 via-emerald-400/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10 space-y-8 sm:space-y-12">
        
        {/* ============================================================ */}
        {/* 1. TOP HEADER SECTION */}
        {/* ============================================================ */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold-50 border border-gold-200 text-gold-900 text-xs font-bold shadow-2xs"
          >
            <Award className="w-3.5 h-3.5 text-gold-600" />
            <span>Audited Scholarship Registry & Fee Concession Portal</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight"
          >
            Verified Scholarships & <br className="hidden sm:block" />
            <span className="text-gold-600 relative inline-block">
              Fee Concessions
              <span className="absolute -bottom-1 left-0 right-0 h-1.5 bg-brand-500 rounded-full opacity-60"></span>
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-sm sm:text-base text-slate-700 leading-relaxed font-medium"
          >
            Calculate eligible tuition waivers based on Class 10th/12th board marks and official talent hunt exams (TALLENTEX, ANTHE, FTRE). Stack with the <strong className="text-brand-900">₹15,000 FutureSelector Cash Grant</strong>.
          </motion.p>
        </div>

        {/* ============================================================ */}
        {/* 2. INTERACTIVE SCHOLARSHIP & FEE WAIVER CALCULATOR */}
        {/* ============================================================ */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-surface border-2 border-border/90 rounded-3xl p-6 sm:p-8 shadow-[0_16px_40px_rgba(18,75,56,0.08)] relative overflow-hidden"
        >
          <BorderBeam size={280} duration={8} borderWidth={2} colorFrom="#F59E0B" colorTo="#10B981" />

          <div className="flex flex-col lg:flex-row items-stretch gap-8 relative z-10">
            
            {/* Left: Input Controls */}
            <div className="lg:w-7/12 space-y-6">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-gold-500/20 text-gold-700 flex items-center justify-center font-bold">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900">
                    Live Fee Waiver Calculator
                  </h3>
                  <p className="text-xs text-textMuted">
                    Simulate your scholarship tier based on academic performance
                  </p>
                </div>
              </div>

              {/* Target Stream Toggle */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Target Competitive Stream
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-surfaceWarm rounded-2xl border border-border">
                  <button
                    onClick={() => setTargetExam("jee")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                      targetExam === "jee"
                        ? "bg-brand-600 text-white shadow-xs"
                        : "text-textMuted hover:text-textMain"
                    }`}
                  >
                    JEE (Main &amp; Advanced)
                  </button>
                  <button
                    onClick={() => setTargetExam("neet")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                      targetExam === "neet"
                        ? "bg-brand-600 text-white shadow-xs"
                        : "text-textMuted hover:text-textMain"
                    }`}
                  >
                    NEET-UG (Medical)
                  </button>
                </div>
              </div>

              {/* Class 10th / 12th Board Score Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">Class 10th / 12th Board Percentage:</span>
                  <span className="font-black text-brand-700 font-mono text-sm bg-brand-50 border border-brand-200 px-2.5 py-0.5 rounded-lg">
                    {boardScore}%
                  </span>
                </div>
                <input 
                  type="range"
                  min="60"
                  max="99"
                  value={boardScore}
                  onChange={(e) => setBoardScore(Number(e.target.value))}
                  className="w-full accent-brand-600 cursor-pointer h-2 bg-border rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-textMuted font-bold">
                  <span>60% (Base Tier)</span>
                  <span>80% (Silver Slab)</span>
                  <span>90% (Gold Slab)</span>
                  <span>95%+ (Diamond Slab)</span>
                </div>
              </div>

              {/* Diagnostic Exam Score Toggle */}
              <div className="space-y-3 pt-2 border-t border-border/80">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    Appeared in Diagnostic Test (TALLENTEX / ANTHE / FTRE)?
                  </span>
                  <button
                    onClick={() => setHasDiagnosticScore(!hasDiagnosticScore)}
                    className={`text-xs font-bold px-3 py-1 rounded-full border transition-all ${
                      hasDiagnosticScore
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-surface border-border text-textMuted"
                    }`}
                  >
                    {hasDiagnosticScore ? "Yes, I have score" : "No, Skip"}
                  </button>
                </div>

                {hasDiagnosticScore && (
                  <div className="space-y-2 p-3.5 bg-surfaceWarm rounded-2xl border border-border">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-textMain">Test Score Percentile:</span>
                      <span className="font-black text-amber-700 font-mono text-sm bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-lg">
                        {diagnosticPercentile}%ile
                      </span>
                    </div>
                    <input 
                      type="range"
                      min="50"
                      max="99"
                      value={diagnosticPercentile}
                      onChange={(e) => setDiagnosticPercentile(Number(e.target.value))}
                      className="w-full accent-amber-600 cursor-pointer h-2 bg-border rounded-lg"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Right: Realtime Savings Breakdown Card */}
            <div className="lg:w-5/12 bg-gradient-to-b from-brand-900 via-brand-800 to-emerald-950 text-white rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-xl">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/15 pb-3">
                  <span className="text-xs font-bold text-white/80 uppercase tracking-wider">
                    Calculated Scholarship Tier
                  </span>
                  <span className="bg-gold-500 text-slate-950 font-black text-xs px-2.5 py-0.5 rounded-full shadow-xs">
                    Verified Slab
                  </span>
                </div>

                <div className="text-center py-2">
                  <span className="text-[11px] font-bold text-gold-300 block uppercase tracking-wider">
                    Estimated Institutional Tuition Waiver
                  </span>
                  <div className="text-4xl sm:text-5xl font-black text-white mt-1">
                    Up to <span className="text-gold-400 font-mono">{estimatedDiscountPercent}%</span>
                  </div>
                  <span className="text-xs text-emerald-300 font-semibold mt-1 block">
                    + Flat ₹15,000 FutureSelector Admission Pass
                  </span>
                </div>

                {/* Sample Savings at Major Coaching */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-white/90">
                    <span>Average Annual Tuition:</span>
                    <span className="font-mono font-bold">₹1,40,000</span>
                  </div>
                  <div className="flex justify-between items-center text-gold-300 font-bold">
                    <span>{estimatedDiscountPercent}% Scholarship Discount:</span>
                    <span className="font-mono">-₹{((140000 * estimatedDiscountPercent) / 100).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between items-center text-emerald-300 font-bold">
                    <span>FutureSelector Admission Voucher:</span>
                    <span className="font-mono">-₹15,000</span>
                  </div>
                  <div className="pt-2 border-t border-white/20 flex justify-between items-center text-sm font-black text-white">
                    <span>Estimated Net Payable:</span>
                    <span className="text-gold-400 font-mono text-base">
                      ₹{Math.max(25000, 140000 - ((140000 * estimatedDiscountPercent) / 100) - 15000).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-5 space-y-2">
                <Link
                  to="/compare"
                  className="w-full bg-gold-500 hover:bg-gold-600 text-slate-950 text-xs font-black py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-95 text-center"
                >
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>Compare Centers With This Slabs</span>
                </Link>

                <Link
                  to="/counselling"
                  className="w-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-2.5 px-4 rounded-xl border border-white/20 transition-all flex items-center justify-center gap-1.5 text-center"
                >
                  <span>Talk to Counsellor About Slabs</span>
                </Link>
              </div>
            </div>

          </div>
        </motion.div>

        {/* ============================================================ */}
        {/* 3. NATIONAL ALL-INDIA TALENT ENTRANCE EXAMS (AUDITED REGISTRY) */}
        {/* ============================================================ */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold border border-brand-200 mb-1.5">
                <Calendar className="w-3.5 h-3.5 text-brand-600" />
                <span>Audited 2026 Examination Schedule</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Official National Talent Hunt Tests
              </h2>
              <p className="text-xs sm:text-sm text-textMuted mt-1">
                Verified annual diagnostic exams conducted by top institutes with substantiated cash awards and fee waivers.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {SCHOLARSHIP_EXAMS.map((exam) => (
              <div 
                key={exam.id}
                className="bg-surface border border-border rounded-3xl p-6 shadow-card hover:border-brand-300 transition-all flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-2xl ${exam.logoBg} text-white font-extrabold text-base flex items-center justify-center shadow-xs shrink-0`}>
                        {exam.examName.charAt(0)}
                      </div>
                      <div>
                        <div className="text-xs text-brand-700 font-bold">{exam.institute}</div>
                        <h3 className="font-extrabold text-lg text-slate-900 leading-tight">
                          {exam.examName}
                        </h3>
                      </div>
                    </div>
                    <span className="text-xs font-black text-emerald-800 bg-emerald-50 border border-emerald-300 px-3 py-1 rounded-full shrink-0 shadow-2xs">
                      {exam.badge}
                    </span>
                  </div>

                  <p className="text-xs text-textMuted leading-relaxed">
                    {exam.tagline}
                  </p>

                  <div className="grid grid-cols-2 gap-2.5 pt-2 text-xs">
                    <div className="p-3 bg-surfaceWarm rounded-xl border border-border/80">
                      <span className="text-[10px] uppercase font-bold text-textMuted block">Scholarship Pool:</span>
                      <span className="font-bold text-slate-900 text-[11px] mt-0.5 block">{exam.scholarshipPool}</span>
                    </div>
                    <div className="p-3 bg-surfaceWarm rounded-xl border border-border/80">
                      <span className="text-[10px] uppercase font-bold text-textMuted block">Cash Awards:</span>
                      <span className="font-bold text-amber-700 text-[11px] mt-0.5 block">{exam.cashAwards}</span>
                    </div>
                    <div className="p-3 bg-surfaceWarm rounded-xl border border-border/80">
                      <span className="text-[10px] uppercase font-bold text-textMuted block">Test Dates:</span>
                      <span className="font-bold text-slate-900 text-[11px] mt-0.5 block">{exam.testDates}</span>
                    </div>
                    <div className="p-3 bg-surfaceWarm rounded-xl border border-border/80">
                      <span className="text-[10px] uppercase font-bold text-textMuted block">Examination Mode:</span>
                      <span className="font-bold text-brand-800 text-[11px] mt-0.5 block">{exam.mode}</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-textMuted flex items-center gap-1.5 pt-1">
                    <BookOpen className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                    <span><strong>Syllabus:</strong> {exam.syllabus}</span>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-border">
                  <button
                    onClick={() => {
                      const matchedInst = institutesData.find(i => i.name.toLowerCase().includes(exam.institute.toLowerCase().split(" ")[0]));
                      if (matchedInst) {
                        setSeatLockInstitute(matchedInst);
                      } else {
                        setSeatLockInstitute(institutesData[0]);
                      }
                    }}
                    className="flex-1 btn-primary text-xs py-2.5 px-3 font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-gold-300" />
                    <span>Lock Seat with ₹15k Waiver</span>
                  </button>

                  <Link
                    to="/counselling"
                    className="btn-secondary text-xs py-2.5 px-3 font-bold"
                  >
                    Ask Counsellor
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ============================================================ */}
        {/* 4. STATUTORY MERIT & SPECIAL CATEGORY SLABS */}
        {/* ============================================================ */}
        <div className="bg-surface border border-border rounded-3xl p-6 sm:p-8 shadow-card space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-50 text-gold-800 text-xs font-bold border border-gold-200 mb-1">
                <HeartHandshake className="w-3.5 h-3.5 text-gold-600" />
                <span>Special Category Concessions</span>
              </div>
              <h3 className="font-extrabold text-xl text-slate-900">
                Institutional Category &amp; Girls Empowerment Waivers
              </h3>
              <p className="text-xs text-textMuted mt-0.5">
                Standard documented tuition concessions honored across coaching centers in India
              </p>
            </div>
            <span className="text-xs font-bold text-brand-800 bg-brand-50 border border-brand-200 px-3 py-1.5 rounded-full shrink-0">
              ✓ Direct Counter Application
            </span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {MERIT_SLABS.map((slab, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-background border border-border space-y-2 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-100">
                    {slab.category}
                  </span>
                  <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 mt-2">
                    {slab.criteria}
                  </h4>
                  <div className="font-black text-sm text-emerald-800 mt-1 font-mono">
                    {slab.waiver}
                  </div>
                </div>
                <div className="text-[10px] text-textMuted font-medium pt-2 border-t border-border">
                  <strong>Verification:</strong> {slab.docs}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Seat Lock Modal for Direct Scholarship Booking */}
      {seatLockInstitute && (
        <SeatLockModal
          institute={seatLockInstitute}
          batches={[
            { name: "2026 Scholarship Merit Classroom Batch", seatsLeft: "5 Seats Left", badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-300" }
          ]}
          onClose={() => setSeatLockInstitute(null)}
        />
      )}

    </div>
  );
}
