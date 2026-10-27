import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, MapPin, CheckCircle2, ChevronRight, Star, TrendingUp, Users, 
  ArrowRightLeft, MessageSquare, Plus, Minus, X, ShieldCheck, Sparkles, 
  Lock, Heart, IndianRupee, ArrowRight, Award, Compass, BookOpen 
} from "lucide-react";
import Lanyard from "../component/Lanyard";
import { useAuth } from "../context/AuthContext";
import AuthModal from "../component/AuthModal";
import InstituteDetailModal from "../component/InstituteDetailModal";
import { generateCardFront, generateCardBack } from "../utils/cardGenerator";
import { institutesData } from "../data/institutes";

// React Bits high-end animations
import SpotlightCard from "../component/reactbits/SpotlightCard";
import ShinyText from "../component/reactbits/ShinyText";
import CountUp from "../component/reactbits/CountUp";
import StarBorder from "../component/reactbits/StarBorder";
import SplitAndMarqueeTestimonials from "../component/SplitAndMarqueeTestimonials";
import HeroIITBackground from "../component/HeroIITBackground";
import logoImg from "../assets/logo.png";

const dummyInstitutes = institutesData;

const topLocations = [
  { 
    name: "Kota", 
    cityKey: "kota", 
    state: "Rajasthan",
    countNum: 120,
    count: "120+ Coaching Centers", 
    desc: "India's premier engineering & medical preparation hub",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=800&auto=format&fit=crop" 
  },
  { 
    name: "Delhi NCR", 
    cityKey: "delhi", 
    state: "National Capital",
    countNum: 350,
    count: "350+ Coaching Centers", 
    desc: "Top faculties, medical hubs, and prestigious repeat batches",
    image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=800&auto=format&fit=crop" 
  },
  { 
    name: "Hyderabad", 
    cityKey: "hyderabad", 
    state: "Telangana",
    countNum: 180,
    count: "180+ Coaching Centers", 
    desc: "Intensive training systems with proven top rank records",
    image: "https://images.unsplash.com/photo-1571504211935-1c936b327411?q=80&w=800&auto=format&fit=crop" 
  },
  { 
    name: "Jaipur", 
    cityKey: "jaipur", 
    state: "Rajasthan",
    countNum: 95,
    count: "95+ Coaching Centers", 
    desc: "Rapidly growing hub with top faculty branches and modern hostels",
    image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=800&auto=format&fit=crop" 
  }
];

const comparisonShowcases = {
  jee: {
    title: "Allen Career Institute vs Resonance Eduventures",
    exam: "JEE Advanced 2026",
    left: {
      name: "Allen Career Institute",
      hub: "Kota Hub (Rajasthan)",
      fees: "₹1,40,000 / Yr",
      batchSize: "45 students",
      selectionRate: "12.8%",
      topRank: "AIR 1, 4 (2025)",
      doubtSupport: "Dedicated Doubt Counters",
      testSeries: "All India CBT Benchmark",
      rating: 4.8
    },
    right: {
      name: "Resonance Eduventures",
      hub: "Kota Hub (Rajasthan)",
      fees: "₹1,30,000 / Yr",
      batchSize: "55 students",
      selectionRate: "10.4%",
      topRank: "AIR 6, 19 (2025)",
      doubtSupport: "Daily Faculty Doubt Desks",
      testSeries: "Periodic Ranker Mock Series",
      rating: 4.6
    }
  },
  neet: {
    title: "Allen Career Institute vs Aakash Institute",
    exam: "NEET Medical 2026",
    left: {
      name: "Allen Medical",
      hub: "Kota & Pan-India",
      fees: "₹1,40,000 / Yr",
      batchSize: "45 students",
      selectionRate: "12.8%",
      topRank: "AIR 1, 4 (2025)",
      doubtSupport: "Faculty Chambers & Counters",
      testSeries: "Major All India Test Series",
      rating: 4.8
    },
    right: {
      name: "Aakash Institute",
      hub: "Delhi NCR & Pan-India",
      fees: "₹1,45,000 / Yr",
      batchSize: "40 students",
      selectionRate: "14.2%",
      topRank: "AIR 2, 5 (2025)",
      doubtSupport: "Digital & Offline Desks",
      testSeries: "AIATS Benchmark Series",
      rating: 4.7
    }
  },
  mains: {
    title: "FIITJEE vs Motion Education",
    exam: "JEE Mains & Advanced",
    left: {
      name: "FIITJEE",
      hub: "Hyderabad & Delhi",
      fees: "₹1,50,000 / Yr",
      batchSize: "35 students",
      selectionRate: "11.5%",
      topRank: "AIR 3, 11 (2025)",
      doubtSupport: "Concept Clarification Cells",
      testSeries: "AITS Intensive Problem Series",
      rating: 4.5
    },
    right: {
      name: "Motion Education",
      hub: "Kota Hub (Rajasthan)",
      fees: "₹1,15,000 / Yr",
      batchSize: "50 students",
      selectionRate: "9.8%",
      topRank: "AIR 15, 48 (2025)",
      doubtSupport: "Personal NV Sir Doubt Desk",
      testSeries: "Brahmastra Test Series",
      rating: 4.6
    }
  }
};


const faqs = [
  { 
    q: "How does FutureSelector verify batch sizes and selection rates?", 
    a: "We conduct physical headcount audits at coaching campuses and cross-reference publicly advertised top ranks against official NTA roll lists. We report the true student-to-faculty ratio rather than marketing claims." 
  },
  { 
    q: "Can coaching institutes pay to delete or alter student reviews?", 
    a: "Strictly no. Reviews are verified through student admission passes and student ID verification. No sponsored rankings, paid removals, or promotional boost packages are accepted on FutureSelector." 
  },
  { 
    q: "Are the fee waiver vouchers real and honored by coaching centers?", 
    a: "Yes. Our registered student admission pass gives aspirants direct access to institutional fee waivers (up to ₹15,000) at accredited centers, verified directly at the time of admission desk registration." 
  },
  { 
    q: "Is FutureSelector 100% free for students and parents?", 
    a: "Yes, completely free. Finding coaching centers, comparing fees side-by-side, downloading audited reports, and booking 1-on-1 counseling calls is 100% free with zero hidden charges." 
  },
  { 
    q: "How does the free 1-on-1 student counselling work?", 
    a: "Our counsellors are senior academic mentors who do not work on coaching commission. You share your target exam, current preparation level, and preferred city, and we map out the top 3 best-fit options." 
  }
];

function Home() {
  const { user, openAuthModal, toggleShortlist } = useAuth();
  const userDefaultExam = user?.exam?.toLowerCase().includes("neet") ? "neet" : user?.exam?.toLowerCase().includes("jee") ? "jee" : "";
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedExam, setSelectedExam] = useState(userDefaultExam); // "" | "jee" | "neet"
  const [selectedBudget, setSelectedBudget] = useState(""); // "" | "under100k" | "100k-150k" | "above150k"
  const [openFaq, setOpenFaq] = useState(0);
  const [selectedInstitute, setSelectedInstitute] = useState(null);
  const [activeCompareTab, setActiveCompareTab] = useState(userDefaultExam === "neet" ? "neet" : "jee");
  const [comparedIds, setComparedIds] = useState([]);

  useEffect(() => {
    if (user?.exam) {
      if (user.exam.toLowerCase().includes("neet")) {
        setSelectedExam("neet");
        setActiveCompareTab("neet");
      } else if (user.exam.toLowerCase().includes("jee")) {
        setSelectedExam("jee");
        setActiveCompareTab("jee");
      }
    }
    if (user?.city) {
      const cityLower = user.city.toLowerCase();
      if (cityLower.includes("delhi")) setSelectedLocation("delhi");
      else if (cityLower.includes("kota")) setSelectedLocation("kota");
      else if (cityLower.includes("hyderabad")) setSelectedLocation("hyderabad");
      else if (cityLower.includes("jaipur")) setSelectedLocation("jaipur");
    }
  }, [user]);

  const toggleCompare = (id, e) => {
    if (e) e.stopPropagation();
    setComparedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= 3) {
        alert("You can compare up to 3 institutes at a time. Remove one first.");
        return prev;
      }
      return [...prev, id];
    });
  };

  // Dynamic Aspirant Pass Card based on User Login Status
  const cardFrontImage = useMemo(() => generateCardFront(user), [user]);
  const cardBackImage = useMemo(() => generateCardBack(user), [user]);

  const handleInstituteClick = (inst) => {
    if (!user) {
      openAuthModal(inst, `Log in to unlock full audited reports, faculty background, and fee breakdowns for ${inst.name}.`);
    } else {
      setSelectedInstitute(inst);
    }
  };

  // Live multi-factor filter
  const filteredInstitutes = useMemo(() => {
    return dummyInstitutes.filter((inst) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || 
        inst.name.toLowerCase().includes(q) || 
        inst.location.toLowerCase().includes(q) || 
        inst.type.toLowerCase().includes(q);

      const loc = selectedLocation.toLowerCase().trim();
      const matchLocation = !loc || inst.cityKey === loc || inst.location.toLowerCase().includes(loc);

      const matchExam = !selectedExam || 
        (selectedExam === "jee" && (inst.type.toLowerCase().includes("jee") || inst.type.toLowerCase().includes("advanced"))) ||
        (selectedExam === "neet" && (inst.type.toLowerCase().includes("neet") || inst.type.toLowerCase().includes("medical")));

      let matchBudget = true;
      if (selectedBudget === "under100k") matchBudget = inst.numericFee < 100000;
      else if (selectedBudget === "100k-150k") matchBudget = inst.numericFee >= 100000 && inst.numericFee <= 150000;
      else if (selectedBudget === "above150k") matchBudget = inst.numericFee > 150000;

      return matchSearch && matchLocation && matchExam && matchBudget;
    });
  }, [searchQuery, selectedLocation, selectedExam, selectedBudget]);

  const scrollToInstitutes = () => {
    document.getElementById("institutes-section")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleCityClick = (cityKey) => {
    setSelectedLocation(cityKey);
    scrollToInstitutes();
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedLocation("");
    setSelectedExam("");
    setSelectedBudget("");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      
      {/* 1. HERO SECTION WITH ENHANCED VISIBILITY & 3D PASS */}
      <section className="relative pt-20 sm:pt-28 pb-10 sm:pb-16 px-4 sm:px-6 overflow-hidden">
        {/* IIT Aspirant Science, Formulas & Blueprint Background */}
        <HeroIITBackground />

        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* Left Column: Headline & Interactive Finder Bar (7 Cols) */}
          <div className="lg:col-span-7 text-center lg:text-left">
            
            {/* Animated Trust Tag - Crisp & High Contrast */}
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-900 text-[11px] sm:text-xs font-bold mb-4 sm:mb-6 shadow-2xs max-w-full"
            >
              <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse shrink-0"></span>
              <ShieldCheck className="w-3.5 h-3.5 text-brand-600 shrink-0" />
              <span className="truncate">
                {user 
                  ? `👋 Welcome, ${user.name} • ${user.exam || "Student"} Pass Ready`
                  : "Verified Coaching Discovery Platform • JEE & NEET Aspirants"}
              </span>
            </motion.div>

            {/* Main Headline - Razor-Sharp, High-Contrast Typography */}
            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 mb-4 sm:mb-6 tracking-tight leading-[1.14] sm:leading-[1.08]"
            >
              Find the Right Coaching <br className="hidden sm:block"/>
              <span className="text-brand-600 relative inline-block">
                for Your Future.
                <span className="absolute -bottom-1 left-0 right-0 h-1.5 bg-gold-400 rounded-full opacity-70"></span>
              </span>
            </motion.h1>
            
            {/* Subtitle - Crisp, High-Contrast Slate */}
            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="text-sm sm:text-lg text-slate-700 mb-6 sm:mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium"
            >
              Discover verified JEE & NEET coaching centers across India. Analyze genuine batch limits, audited fee schedules, and student experiences without misleading marketing.
            </motion.p>

            {/* High-Visibility Interactive Finder Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-surface border-2 border-border/90 rounded-3xl p-3.5 sm:p-5 shadow-[0_16px_40px_rgba(18,75,56,0.08)] max-w-xl mx-auto lg:mx-0"
            >
              {/* Exam Selection Pills */}
              <div className="flex items-center gap-1.5 mb-3.5 p-1 bg-surfaceWarm rounded-xl border border-border">
                {[
                  { label: "All Exams", value: "" },
                  { label: "JEE (Main / Adv)", value: "jee" },
                  { label: "NEET UG", value: "neet" }
                ].map((exam) => (
                  <button
                    key={exam.value}
                    onClick={() => setSelectedExam(exam.value)}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                      selectedExam === exam.value
                        ? "bg-brand-600 text-white shadow-xs"
                        : "text-textMuted hover:text-textMain hover:bg-white/60"
                    }`}
                  >
                    {exam.label}
                  </button>
                ))}
              </div>

              {/* City & Budget Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2.5">
                {/* City Selector */}
                <div className="flex items-center px-3.5 py-2.5 bg-background rounded-xl border border-border focus-within:border-brand-600 focus-within:bg-white transition-all">
                  <MapPin className="w-4 h-4 text-brand-600 mr-2 shrink-0" />
                  <div className="flex-1">
                    <span className="block text-[9px] uppercase font-bold text-textMuted tracking-wider">City</span>
                    <select
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="w-full bg-transparent outline-none text-textMain font-bold text-xs cursor-pointer"
                    >
                      <option value="">All Locations / Cities</option>
                      <option value="kota">Kota (Rajasthan)</option>
                      <option value="delhi">Delhi NCR</option>
                      <option value="hyderabad">Hyderabad (Telangana)</option>
                      <option value="jaipur">Jaipur (Rajasthan)</option>
                    </select>
                  </div>
                </div>

                {/* Budget Range */}
                <div className="flex items-center px-3.5 py-2.5 bg-background rounded-xl border border-border focus-within:border-brand-600 focus-within:bg-white transition-all">
                  <IndianRupee className="w-4 h-4 text-gold-500 mr-2 shrink-0" />
                  <div className="flex-1">
                    <span className="block text-[9px] uppercase font-bold text-textMuted tracking-wider">Annual Budget</span>
                    <select
                      value={selectedBudget}
                      onChange={(e) => setSelectedBudget(e.target.value)}
                      className="w-full bg-transparent outline-none text-textMain font-bold text-xs cursor-pointer"
                    >
                      <option value="">Any Budget</option>
                      <option value="under100k">Under ₹1,00,000</option>
                      <option value="100k-150k">₹1,00,000 – ₹1,50,000</option>
                      <option value="above150k">Above ₹1,50,000</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Institute Name Input */}
              <div className="flex items-center px-3.5 py-2.5 bg-background rounded-xl border border-border focus-within:border-brand-600 focus-within:bg-white transition-all mb-3.5">
                <Search className="w-4 h-4 text-textMuted mr-2.5 shrink-0" />
                <input 
                  type="text" 
                  placeholder="Search by institute name (Allen, Motion, Aakash)..." 
                  className="w-full bg-transparent outline-none text-textMain placeholder:text-textMuted font-medium text-xs"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') scrollToInstitutes(); }}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="text-textMuted hover:text-textMain p-1">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Dual Action CTAs */}
              <div className="flex flex-col sm:flex-row gap-2">
                <StarBorder
                  as="button"
                  onClick={scrollToInstitutes}
                  color="#C5A059"
                  speed="4s"
                  className="flex-1 shadow-sm"
                  innerClassName="bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 px-5 text-xs flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Find My Coaching ({filteredInstitutes.length} Available)</span>
                </StarBorder>

                <Link
                  to="/compare"
                  className="btn-secondary py-3 px-5 text-xs font-bold gap-2 text-center"
                >
                  <ArrowRightLeft className="w-4 h-4 text-brand-600" />
                  <span>Compare Institutes</span>
                </Link>
              </div>

            </motion.div>

            {/* Quick Hub Filter Shortcuts */}
            <div className="mt-4 flex flex-wrap items-center justify-center lg:justify-start gap-2 text-xs text-textMuted">
              <span className="font-bold text-textMain">Popular Hubs:</span>
              {[
                { label: "Kota", value: "kota" },
                { label: "Delhi NCR", value: "delhi" },
                { label: "Hyderabad", value: "hyderabad" },
                { label: "Jaipur", value: "jaipur" }
              ].map((hub) => (
                <button
                  key={hub.value}
                  onClick={() => { setSelectedLocation(hub.value); scrollToInstitutes(); }}
                  className={`px-3 py-1 rounded-lg border font-semibold transition-all ${
                    selectedLocation === hub.value
                      ? "bg-brand-600 text-white border-brand-600 shadow-2xs"
                      : "bg-surface border-border text-textMain hover:border-brand-300"
                  }`}
                >
                  📍 {hub.label}
                </button>
              ))}
              {(searchQuery || selectedLocation || selectedExam || selectedBudget) && (
                <button
                  onClick={handleResetFilters}
                  className="text-xs text-brand-700 hover:underline font-bold ml-1 flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Reset
                </button>
              )}
            </div>
          </div>

          {/* Right Column: High-Visibility 3D Lanyard Student ID Badge (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative mt-6 lg:mt-0">
            
            {/* Ambient Radiant Glow Spotlight */}
            <div className="absolute inset-0 bg-radial from-brand-600/15 via-gold-500/10 to-transparent blur-3xl pointer-events-none rounded-full transform scale-95"></div>

            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.7 }}
              className="w-full h-[360px] sm:h-[460px] lg:h-[540px] max-w-sm rounded-3xl overflow-hidden relative cursor-grab active:cursor-grabbing border border-border/80 bg-white/40 backdrop-blur-xs shadow-card touch-pan-y"
            >
              <Lanyard 
                frontImage={cardFrontImage} 
                backImage={cardBackImage} 
                strapImage={import.meta.env.BASE_URL + "band.png"}
                imageFit="cover"
                cardColor="#ffffff"
                orientation="portrait"
                finish="glossy"
                cornerRadius={0.3}
                size={0.65}
                anchor="center"
                strapLength={0.48}
                strapColor="#0D3A2C"
                strapWidth={0.65}
                metal="gold"
                gravity={1}
                damping={0.5}
                elasticity={0.5}
                breeze={0.5}
                interactive
                intro
              />
            </motion.div>
            
            {/* Interactive hint badge or Login CTA */}
            {!user ? (
              <StarBorder
                as="button"
                onClick={() => openAuthModal(null, "Verified Aspirant Pass activate karne ke liye login karein.")}
                color="#C5A059"
                speed="3.5s"
                className="mt-3 shadow-md"
                innerClassName="bg-brand-600 hover:bg-brand-700 text-white border border-brand-500 px-4 py-2 text-xs font-bold flex items-center gap-2 group cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-gold-300 group-hover:scale-110 transition-transform" />
                <ShinyText 
                  text="Verified Card Ke Liye Login Karein" 
                  shimmerColor="rgba(255, 255, 255, 0.9)" 
                  speed={3} 
                />
                <ArrowRight className="w-3.5 h-3.5 text-white/80 group-hover:translate-x-0.5 transition-transform" />
              </StarBorder>
            ) : (
              <motion.div 
                animate={{ y: [0, -3, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 shadow-xs text-xs font-bold text-emerald-800"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{user.name} • Verified Pass Active (Drag to swing, click to flip)</span>
              </motion.div>
            )}
          </div>

        </div>
      </section>

      {/* 2. SECTION 2: QUICK TRUST INDICATORS (100% GENUINE & SUPPORTABLE FACTS) */}
      <section className="py-8 px-6 bg-surface border-y border-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-4 md:gap-6">
            
            {/* Pillar 1 */}
            <SpotlightCard 
              spotlightColor="rgba(18, 75, 56, 0.09)"
              borderColor="rgba(197, 160, 89, 0.45)"
              className="p-5 bg-background border border-border flex items-start gap-4 shadow-card hover:border-brand-200 transition-all rounded-2xl"
            >
              <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center shrink-0 border border-brand-100 shadow-2xs">
                <Users className="w-5 h-5 text-brand-600" />
              </div>
              <div>
                <h4 className="font-bold text-textMain text-sm sm:text-base mb-1">
                  Verified Batch Sizes
                </h4>
                <p className="text-xs text-textMuted leading-relaxed">
                  Real classroom headcount audits. No overcrowded 200+ student lecture halls marketed as personal mentoring.
                </p>
              </div>
            </SpotlightCard>

            {/* Pillar 2 */}
            <SpotlightCard 
              spotlightColor="rgba(197, 160, 89, 0.12)"
              borderColor="rgba(197, 160, 89, 0.55)"
              className="p-5 bg-background border border-border flex items-start gap-4 shadow-card hover:border-brand-200 transition-all rounded-2xl"
            >
              <div className="w-11 h-11 rounded-xl bg-gold-50 text-gold-600 flex items-center justify-center shrink-0 border border-gold-200/60 shadow-2xs">
                <IndianRupee className="w-5 h-5 text-gold-500" />
              </div>
              <div>
                <h4 className="font-bold text-textMain text-sm sm:text-base mb-1">
                  Transparent Fee Details
                </h4>
                <p className="text-xs text-textMuted leading-relaxed">
                  Clear itemized tuition, test series charges, and nearby hostel/PG expenses so parents can plan with complete clarity.
                </p>
              </div>
            </SpotlightCard>

            {/* Pillar 3 */}
            <SpotlightCard 
              spotlightColor="rgba(18, 75, 56, 0.09)"
              borderColor="rgba(197, 160, 89, 0.45)"
              className="p-5 bg-background border border-border flex items-start gap-4 shadow-card hover:border-brand-200 transition-all rounded-2xl"
            >
              <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center shrink-0 border border-brand-100 shadow-2xs">
                <ArrowRightLeft className="w-5 h-5 text-brand-600" />
              </div>
              <div>
                <h4 className="font-bold text-textMain text-sm sm:text-base mb-1">
                  Easy Institute Comparison
                </h4>
                <p className="text-xs text-textMuted leading-relaxed">
                  Objective head-to-head analysis of past selection ratios, faculty experience, and batch sizes without biased sponsored ranks.
                </p>
              </div>
            </SpotlightCard>

          </div>
        </div>
      </section>

      {/* 3. EXPLORE PREMIER COACHING HUBS */}
      <section className="py-16 px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-2 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold border border-brand-100 mb-2">
                <Compass className="w-3.5 h-3.5 text-brand-600" />
                <span>Premier Destinations</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-textMain">Explore Top Coaching Hubs</h2>
              <p className="text-sm text-textMuted mt-1">Discover premier academic cities with proven high-selection track records.</p>
            </div>

            {selectedLocation && (
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="text-xs font-semibold text-brand-700 bg-brand-50 border border-brand-200 px-3 py-1 rounded-full flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-brand-600" />
                  Filtering: {topLocations.find(l => l.cityKey === selectedLocation)?.name || selectedLocation}
                </span>
                <button
                  onClick={() => setSelectedLocation("")}
                  className="text-xs font-bold text-textMuted hover:text-textMain underline cursor-pointer"
                >
                  View All Hubs
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {topLocations.map((loc) => {
              const isSelected = selectedLocation === loc.cityKey;
              return (
                <motion.div 
                  key={loc.cityKey} 
                  whileHover={{ y: -4, scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => handleCityClick(loc.cityKey)}
                  className={`group cursor-pointer relative h-64 rounded-3xl overflow-hidden shadow-card border transition-all ${
                    isSelected 
                      ? "ring-4 ring-brand-600 border-brand-600 shadow-xl" 
                      : "border-border hover:border-brand-300"
                  }`}
                >
                  <img src={loc.image} alt={loc.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                  
                  {/* Top State Badge & Selection Tag */}
                  <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                    <span className="text-[10px] font-extrabold tracking-wider text-white bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full uppercase border border-white/10">
                      {loc.state}
                    </span>
                    {isSelected && (
                      <span className="text-[10px] font-bold text-white bg-brand-600 px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Filtered
                      </span>
                    )}
                  </div>

                  {/* Bottom Hub Details */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-white font-extrabold text-xl group-hover:text-gold-300 transition-colors">
                        {loc.name} Hub
                      </h3>
                      <span className="text-[11px] font-bold text-white/90 bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full">
                        <CountUp to={loc.countNum} suffix="+ Centers" duration={1.8} />
                      </span>
                    </div>
                    <p className="text-white/75 text-xs line-clamp-2 mb-2 leading-relaxed">
                      {loc.desc}
                    </p>
                    <div className="flex items-center gap-1 text-[11px] font-bold text-gold-400 group-hover:translate-x-1 transition-transform">
                      <span>Explore Coaching Centers</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. COMPARISON SHOWCASE (INTERACTIVE TABS & AUDITED HEAD-TO-HEAD METRICS) */}
      <section className="py-20 px-6 bg-brand-900 text-white relative overflow-hidden">
        {/* Subtle decorative glow and radial backdrop */}
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-brand-700/40 blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gold-500/10 blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10 grid lg:grid-cols-12 gap-10 items-center">
          
          {/* Left: Heading & Value Proposition */}
          <div className="lg:col-span-5 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-brand-100 text-xs font-bold mb-6 border border-white/10">
              <ArrowRightLeft className="w-3.5 h-3.5 text-gold-400" />
              <span>Head-to-Head Comparison</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 leading-tight">
              Don't guess.<br />
              <span className="text-gold-400">
                <ShinyText text="Compare real facts" shimmerColor="rgba(255, 255, 255, 0.95)" speed={3.5} />
              </span> side-by-side.
            </h2>

            <p className="text-brand-100/90 text-sm sm:text-base mb-8 leading-relaxed">
              Put institutes head-to-head. Analyze itemized tuition fees, true classroom batch limits, faculty stability, and historical qualifying selection ratios on an uncompromised comparison matrix.
            </p>

            {/* Comparison Tab Switcher */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-2 mb-8">
              {[
                { key: "jee", label: "JEE: Allen vs Resonance" },
                { key: "neet", label: "NEET: Allen vs Aakash" },
                { key: "mains", label: "FIITJEE vs Motion" }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveCompareTab(tab.key)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeCompareTab === tab.key
                      ? "bg-white text-brand-900 shadow-md scale-105"
                      : "bg-white/10 text-white hover:bg-white/20 border border-white/10"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link 
                to="/compare"
                className="bg-gold-500 hover:bg-gold-400 text-brand-950 font-bold py-3 px-6 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]"
              >
                <span>Launch Full Comparison Tool</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button 
                onClick={scrollToInstitutes}
                className="bg-white/10 hover:bg-white/15 text-white font-bold py-3 px-6 rounded-xl text-xs border border-white/15 transition-all cursor-pointer"
              >
                Select From Cards Below
              </button>
            </div>
          </div>

          {/* Right: Live Interactive Comparison Showcase Card */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCompareTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="bg-surface rounded-3xl p-6 sm:p-7 shadow-2xl text-textMain border border-border relative overflow-hidden"
              >
                {/* Header with Exam Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border gap-2 mb-6">
                  <div>
                    <span className="text-[11px] font-bold text-textMuted uppercase tracking-wider block">Verified Audit Preview</span>
                    <h3 className="font-extrabold text-lg sm:text-xl text-textMain">
                      {comparisonShowcases[activeCompareTab].title}
                    </h3>
                  </div>
                  <span className="self-start sm:self-auto text-xs font-bold bg-brand-50 text-brand-700 px-3 py-1 rounded-full border border-brand-200">
                    {comparisonShowcases[activeCompareTab].exam}
                  </span>
                </div>

                {/* Institute Column Titles */}
                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-border text-center">
                  <div className="p-3 bg-brand-50/50 rounded-2xl border border-brand-100">
                    <span className="text-xs font-extrabold text-brand-800 block">
                      {comparisonShowcases[activeCompareTab].left.name}
                    </span>
                    <span className="text-[11px] text-textMuted font-medium">
                      {comparisonShowcases[activeCompareTab].left.hub}
                    </span>
                  </div>
                  <div className="p-3 bg-gold-50/50 rounded-2xl border border-gold-200/60">
                    <span className="text-xs font-extrabold text-brand-900 block">
                      {comparisonShowcases[activeCompareTab].right.name}
                    </span>
                    <span className="text-[11px] text-textMuted font-medium">
                      {comparisonShowcases[activeCompareTab].right.hub}
                    </span>
                  </div>
                </div>

                {/* Metrics Head-to-Head */}
                <div className="divide-y divide-border text-xs sm:text-sm">
                  
                  {/* Metric 1: Annual Tuition & Study Fees */}
                  <div className="py-3.5 flex items-center justify-between">
                    <span className="font-bold text-brand-900 w-1/3 text-left">
                      {comparisonShowcases[activeCompareTab].left.fees}
                    </span>
                    <span className="text-[11px] uppercase font-bold text-textMuted tracking-wider text-center w-1/3 bg-background py-1 px-2 rounded-lg border border-border">
                      Annual Fees
                    </span>
                    <span className="font-bold text-brand-900 w-1/3 text-right">
                      {comparisonShowcases[activeCompareTab].right.fees}
                    </span>
                  </div>

                  {/* Metric 2: Classroom Batch Size */}
                  <div className="py-3.5 flex items-center justify-between">
                    <div className="w-1/3 text-left">
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 text-xs">
                        {comparisonShowcases[activeCompareTab].left.batchSize}
                      </span>
                    </div>
                    <span className="text-[11px] uppercase font-bold text-textMuted tracking-wider text-center w-1/3 bg-background py-1 px-2 rounded-lg border border-border">
                      Audited Batch Size
                    </span>
                    <div className="w-1/3 text-right">
                      <span className="font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 text-xs">
                        {comparisonShowcases[activeCompareTab].right.batchSize}
                      </span>
                    </div>
                  </div>

                  {/* Metric 3: Selection Ratio */}
                  <div className="py-3.5 flex items-center justify-between">
                    <span className="font-extrabold text-brand-700 w-1/3 text-left">
                      <CountUp 
                        to={parseFloat(comparisonShowcases[activeCompareTab].left.selectionRate)} 
                        decimals={1} 
                        suffix="%" 
                        duration={1.5} 
                      />
                    </span>
                    <span className="text-[11px] uppercase font-bold text-textMuted tracking-wider text-center w-1/3 bg-background py-1 px-2 rounded-lg border border-border">
                      Selection Ratio
                    </span>
                    <span className="font-extrabold text-brand-700 w-1/3 text-right">
                      <CountUp 
                        to={parseFloat(comparisonShowcases[activeCompareTab].right.selectionRate)} 
                        decimals={1} 
                        suffix="%" 
                        duration={1.5} 
                      />
                    </span>
                  </div>

                  {/* Metric 4: Top Rankers */}
                  <div className="py-3.5 flex items-center justify-between">
                    <span className="font-semibold text-textMain w-1/3 text-left">
                      {comparisonShowcases[activeCompareTab].left.topRank}
                    </span>
                    <span className="text-[11px] uppercase font-bold text-textMuted tracking-wider text-center w-1/3 bg-background py-1 px-2 rounded-lg border border-border">
                      Top AIR Ranks
                    </span>
                    <span className="font-semibold text-textMain w-1/3 text-right">
                      {comparisonShowcases[activeCompareTab].right.topRank}
                    </span>
                  </div>

                  {/* Metric 5: Doubt Support */}
                  <div className="py-3.5 flex items-center justify-between">
                    <span className="text-textMuted text-[11px] font-medium w-1/3 text-left">
                      {comparisonShowcases[activeCompareTab].left.doubtSupport}
                    </span>
                    <span className="text-[11px] uppercase font-bold text-textMuted tracking-wider text-center w-1/3 bg-background py-1 px-2 rounded-lg border border-border">
                      Doubt Resolution
                    </span>
                    <span className="text-textMuted text-[11px] font-medium w-1/3 text-right">
                      {comparisonShowcases[activeCompareTab].right.doubtSupport}
                    </span>
                  </div>

                </div>

                {/* Bottom Card Footer */}
                <div className="mt-5 pt-4 border-t border-border flex items-center justify-between text-xs text-textMuted">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Audited from verified student enrolments</span>
                  </div>
                  <Link to="/compare" className="text-brand-700 font-bold hover:underline flex items-center gap-1">
                    <span>Full Comparison Matrix</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </section>

      {/* 5. LISTINGS (DIRECT COACHING CARDS - FILTERED LIVE & COMPARABLE) */}
      <section id="institutes-section" className="py-20 px-6 bg-surface border-b border-border scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 mb-10">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-textMain">Recommended Institutes</h2>
                <span className="text-xs font-bold bg-brand-50 text-brand-700 px-3 py-1 rounded-full border border-brand-200">
                  {filteredInstitutes.length} Verified
                </span>
              </div>
              <p className="text-textMuted text-sm mt-1">
                {selectedLocation 
                  ? `Showing verified coaching centers in ${
                      selectedLocation === 'kota' ? 'Kota' :
                      selectedLocation === 'delhi' ? 'Delhi NCR' :
                      selectedLocation === 'hyderabad' ? 'Hyderabad' :
                      selectedLocation === 'jaipur' ? 'Jaipur' : 'selected location'
                    }` 
                  : "Verified institutes across premier academic coaching hubs."}
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              {comparedIds.length > 0 && (
                <button
                  onClick={() => setComparedIds([])}
                  className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 border border-red-200 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                >
                  Clear Compare ({comparedIds.length})
                </button>
              )}

              {(searchQuery || selectedLocation || selectedExam || selectedBudget) && (
                <button 
                  onClick={handleResetFilters}
                  className="text-xs font-semibold text-brand-700 hover:text-brand-900 flex items-center gap-1 border border-brand-200 bg-brand-50 px-3.5 py-1.5 rounded-xl shadow-2xs transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" /> Clear All Filters
                </button>
              )}
            </div>
          </div>

          {filteredInstitutes.length === 0 ? (
            <div className="text-center py-16 bg-background border border-border rounded-3xl p-8 max-w-lg mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-textMain mb-2">No matching institutes found</h3>
              <p className="text-sm text-textMuted mb-6 leading-relaxed">
                No coaching centers matched your current filter criteria. Try expanding your budget range or clearing city filters.
              </p>
              <button onClick={handleResetFilters} className="btn-primary text-xs py-2.5 px-6 mx-auto">
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredInstitutes.map((inst) => {
                const isCompared = comparedIds.includes(inst.id);
                return (
                  <SpotlightCard 
                    key={inst.id} 
                    spotlightColor="rgba(18, 75, 56, 0.08)"
                    borderColor="rgba(197, 160, 89, 0.45)"
                    className={`edu-card group flex flex-col transition-all relative overflow-hidden rounded-2xl ${
                      isCompared ? "ring-2 ring-brand-600 border-brand-600 shadow-md" : "hover:border-brand-400"
                    }`}
                  >
                    {/* Top Image & Overlays */}
                    <div className="h-52 relative overflow-hidden">
                      <img 
                        src={inst.image} 
                        alt={inst.name} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                      
                      {/* Rating Badge */}
                      <div className="absolute top-3 right-3 bg-surface/95 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-bold text-textMain shadow-sm flex items-center gap-1 border border-border">
                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                        <span>{inst.rating}</span>
                        <span className="text-[10px] text-textMuted font-normal">({inst.reviews})</span>
                      </div>

                      {/* Verified Badge */}
                      <span className="absolute top-3 left-3 bg-brand-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <ShinyText text="Verified Center" shimmerColor="rgba(255, 255, 255, 0.95)" speed={3.5} />
                      </span>

                      {/* Quick Shortlist Heart Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleShortlist(inst.id);
                        }}
                        className={`absolute bottom-3 right-3 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md shadow-md transition-all cursor-pointer ${
                          user?.shortlisted?.includes(inst.id)
                            ? "bg-red-500 text-white"
                            : "bg-white/90 hover:bg-white text-slate-700"
                        }`}
                        title={user?.shortlisted?.includes(inst.id) ? "Shortlisted" : "Shortlist Coaching"}
                      >
                        <Heart className={`w-4 h-4 ${user?.shortlisted?.includes(inst.id) ? "fill-white" : ""}`} />
                      </button>

                      {/* Exam Tag on bottom-left of image */}
                      <span className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-0.5 rounded-md border border-white/20">
                        {inst.type}
                      </span>
                    </div>

                    {/* Card Body */}
                    <div className="p-5 flex-1 flex flex-col bg-surface">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-extrabold text-textMain text-lg line-clamp-1 group-hover:text-brand-700 transition-colors">
                          {inst.name}
                        </h3>
                      </div>
                      
                      {/* Location & Report Status */}
                      <div className="text-xs text-textMuted mb-4 flex items-center justify-between">
                        <span className="flex items-center font-medium">
                          <MapPin className="w-3.5 h-3.5 mr-1 text-brand-600 shrink-0" />
                          {inst.location}
                        </span>
                        {user ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Full Audit Ready
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200 flex items-center gap-1">
                            <Lock className="w-3 h-3 text-brand-600" /> Member Report
                          </span>
                        )}
                      </div>

                      {/* 2-Column Audited Metrics */}
                      <div className="grid grid-cols-2 gap-2 text-xs bg-background p-3 rounded-2xl border border-border mb-4">
                        <div className="border-r border-border/80 pr-2">
                          <span className="text-textMuted block text-[10px] font-bold uppercase tracking-wider">
                            Audited Batch
                          </span>
                          <span className="font-bold text-textMain text-xs sm:text-sm">
                            {inst.batchSize}
                          </span>
                        </div>
                        <div className="pl-2">
                          <span className="text-textMuted block text-[10px] font-bold uppercase tracking-wider">
                            Selection Rate
                          </span>
                          <span className="font-extrabold text-brand-600 text-xs sm:text-sm">
                            <CountUp 
                              to={parseFloat(inst.selectionRate)} 
                              decimals={1} 
                              suffix="%" 
                              duration={1.5} 
                            />
                          </span>
                        </div>
                        <div className="col-span-2 pt-2 border-t border-border/80 flex items-center justify-between">
                          <span className="text-textMuted text-[10px] font-bold uppercase">
                            Recent Milestone:
                          </span>
                          <span className="font-semibold text-textMain text-[11px]">
                            {inst.topRank}
                          </span>
                        </div>
                      </div>

                      {/* Description snippet */}
                      <p className="text-xs text-textMuted line-clamp-2 mb-4 leading-relaxed">
                        {inst.description}
                      </p>
                      
                      {/* Fees & Dual Action Buttons */}
                      <div className="mt-auto pt-4 border-t border-border">
                        <div className="flex items-baseline justify-between mb-3">
                          <div>
                            <span className="text-[10px] font-bold text-textMuted uppercase tracking-wider block">Tuition & Material</span>
                            <span className="text-base font-extrabold text-textMain">{inst.fees}</span>
                          </div>
                          
                          {/* Compare Checkbox Toggle */}
                          <button
                            onClick={(e) => toggleCompare(inst.id, e)}
                            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                              isCompared
                                ? "bg-brand-600 text-white border-brand-600 shadow-2xs"
                                : "bg-background text-textMain border-border hover:border-brand-400"
                            }`}
                            title="Add to side-by-side comparison"
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                            <span>{isCompared ? "Comparing" : "Compare"}</span>
                          </button>
                        </div>

                        {/* View Audited Report Full CTA */}
                        <button
                          onClick={() => handleInstituteClick(inst)}
                          className="w-full btn-primary py-2.5 px-4 text-xs font-bold justify-center gap-2 shadow-sm cursor-pointer"
                        >
                          {user ? (
                            <>
                              <span>View Audited Report</span>
                              <ChevronRight className="w-4 h-4" />
                            </>
                          ) : (
                            <>
                              <Lock className="w-3.5 h-3.5 text-gold-300" />
                              <span>Unlock Free Audited Report</span>
                              <ChevronRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </div>

                    </div>
                  </SpotlightCard>
                );
              })}
            </div>
          )}

        </div>
      </section>

      {/* FLOATING COMPARISON DOCK (Appears when 1 or more institutes are selected) */}
      <AnimatePresence>
        {comparedIds.length > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-2xl bg-brand-900/95 backdrop-blur-xl text-white rounded-2xl p-4 shadow-2xl border border-white/20 flex flex-col sm:flex-row items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gold-500 text-brand-950 flex items-center justify-center font-bold text-sm shrink-0">
                {comparedIds.length}
              </div>
              <div>
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <span>Selected for Comparison</span>
                  <span className="text-[10px] font-semibold bg-white/20 px-2 py-0.5 rounded-full">Max 3</span>
                </h4>
                <p className="text-xs text-brand-200 line-clamp-1">
                  {dummyInstitutes
                    .filter((inst) => comparedIds.includes(inst.id))
                    .map((inst) => inst.name)
                    .join(", ")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setComparedIds([])}
                className="text-xs text-brand-300 hover:text-white px-3 py-2 rounded-xl transition-colors font-medium cursor-pointer"
              >
                Clear
              </button>
              <Link
                to="/compare"
                className="bg-gold-500 hover:bg-gold-400 text-brand-950 text-xs font-bold py-2.5 px-5 rounded-xl shadow-md transition-all flex items-center gap-1.5 active:scale-95"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>Compare Now ({comparedIds.length})</span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 6. VERIFIED ASPIRANT REVIEWS & EXPERIENCES: SPLIT-SCREEN SHOWCASE (IDEA 2) + DUAL-ROW FLOATING MARQUEE (IDEA 3) */}
      <SplitAndMarqueeTestimonials />

      {/* 7. TRANSPARENT FAQS (EXPANDABLE ACCORDION) */}
      <section className="py-20 px-6 bg-surface border-t border-border">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold border border-brand-100 mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
              <span>Transparent Answers</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-textMain tracking-tight mb-3">
              Frequently Asked Questions
            </h2>
            <p className="text-sm sm:text-base text-textMuted">
              Direct, transparent answers regarding our auditing criteria, fee waivers, and independent review verification.
            </p>
          </div>
          
          <div className="space-y-3.5">
            {faqs.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div 
                  key={i} 
                  className={`border rounded-2xl overflow-hidden transition-all duration-200 ${
                    isOpen 
                      ? "bg-surfaceWarm/60 border-brand-300 shadow-xs" 
                      : "bg-background border-border hover:border-brand-200"
                  }`}
                >
                  <button 
                    className="w-full text-left p-5 flex justify-between items-center gap-4 font-bold text-textMain transition-colors cursor-pointer text-sm sm:text-base"
                    onClick={() => setOpenFaq(isOpen ? -1 : i)}
                  >
                    <span>{faq.q}</span>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                      isOpen ? "bg-brand-600 text-white" : "bg-surface text-textMuted border border-border"
                    }`}>
                      {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 pt-1 text-sm text-textMuted leading-relaxed border-t border-border/60">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 8. EDITORIAL PRACTICAL CTA */}
      <section className="relative py-20 px-6 bg-background border-t border-border overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="bg-gradient-to-br from-brand-900 via-brand-950 to-slate-950 rounded-3xl p-8 sm:p-12 text-center text-white shadow-2xl border border-brand-700/40 relative overflow-hidden">
            
            {/* Ambient Background Accents */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-brand-600/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-gold-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-gold-300 text-xs font-bold mb-6 border border-white/10">
                <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                <ShinyText text="Unbiased Advisory Desk" shimmerColor="rgba(255, 255, 255, 0.95)" speed={3.5} />
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 tracking-tight leading-tight">
                Take the stress out of your coaching decision.
              </h2>

              <p className="text-brand-100/90 text-sm sm:text-base mb-8 max-w-xl mx-auto leading-relaxed">
                No aggressive sales calls. Speak directly with experienced academic counsellors who evaluate real classroom batch limits, nearby hostel safety, and fee waivers tailored to your score.
              </p>

              <div className="flex flex-col sm:flex-row justify-center items-center gap-3.5">
                <StarBorder
                  as="div"
                  color="#F1E4C9"
                  speed="4s"
                  className="shadow-lg"
                  innerClassName="w-full"
                >
                  <Link 
                    to="/counselling"
                    className="bg-gold-500 hover:bg-gold-400 text-brand-950 font-bold py-3.5 px-8 rounded-[14px] text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                  >
                    <span>Schedule Free 1-on-1 Counselling</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </StarBorder>

                <button 
                  onClick={scrollToInstitutes}
                  className="bg-white/10 hover:bg-white/15 text-white font-bold py-3.5 px-8 rounded-xl text-xs sm:text-sm border border-white/20 transition-all cursor-pointer"
                >
                  Browse Coaching Centers
                </button>
              </div>

              <p className="text-[11px] text-white/50 mt-5">
                100% Free for students & parents • Zero sponsored rankings
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FOOTER */}
      <footer className="bg-surface border-t border-border pt-16 pb-8 px-6 mt-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <img src={logoImg} alt="FutureSelector" className="h-10 w-auto object-contain" />
            </Link>
            <p className="text-sm text-textMuted">Making educational choices transparent, data-driven, and perfectly suited for every student.</p>
          </div>
          
          <div>
            <h4 className="font-semibold text-textMain mb-4">Platform</h4>
            <ul className="space-y-3 text-sm text-textMuted">
              <li><button onClick={scrollToInstitutes} className="hover:text-brand-600 transition-colors">Browse Institutes</button></li>
              <li><a href="#compare" className="hover:text-brand-600 transition-colors">Compare Tool</a></li>
              <li><a href="#faq" className="hover:text-brand-600 transition-colors">Student FAQs</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-textMain mb-4">Legal & Policies</h4>
            <ul className="space-y-3 text-sm text-textMuted">
              <li><Link to="/terms" className="hover:text-brand-600 transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/privacy" className="hover:text-brand-600 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/refund-policy" className="hover:text-brand-600 transition-colors">Cancellation & Refund Policy</Link></li>
              <li><Link to="/contact" className="hover:text-brand-600 transition-colors">Contact Us</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-textMain mb-4">Support & Advisory</h4>
            <ul className="space-y-3 text-sm text-textMuted">
              <li><a href="mailto:support@futureselector.in" className="hover:text-brand-600 transition-colors">support@futureselector.in</a></li>
              <li><a href="tel:+917817035087" className="hover:text-brand-600 transition-colors">+91 78170 35087</a></li>
              <li>Kota, Rajasthan — Pan-India Advisory</li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto pt-8 border-t border-border text-center text-sm text-textMuted flex flex-col md:flex-row justify-between items-center">
          <p>© 2026 FutureSelector. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-textMain">Twitter</a>
            <a href="#" className="hover:text-textMain">LinkedIn</a>
            <a href="#" className="hover:text-textMain">Instagram</a>
          </div>
        </div>
      </footer>

      {/* 10. UNLOCKED AUDITED INSTITUTE DETAILS MODAL */}
      <InstituteDetailModal 
        institute={selectedInstitute} 
        onClose={() => setSelectedInstitute(null)} 
      />

      {/* 11. STUDENT LOGIN GATING MODAL */}
      <AuthModal onLoginSuccess={(inst) => setSelectedInstitute(inst)} />

    </div>
  );
}

export default Home;
