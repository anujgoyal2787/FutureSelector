import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Star, ShieldCheck, MessageSquare, ChevronLeft, ChevronRight, 
  Quote, CheckCircle2, MapPin, Sparkles, Award 
} from "lucide-react";
import SpotlightCard from "./reactbits/SpotlightCard";

// Detailed Deep-Dive Stories for Split-Screen Showcase
export const featuredStories = [
  { 
    id: 1,
    author: "Aakash Verma", 
    exam: "JEE Advanced (AIR 840)",
    institute: "Allen Career Institute",
    cityKey: "kota",
    hub: "Kota Hub (Rajasthan)",
    badge: "Verified Batch Audit",
    keyMetric: "Classroom Headcount: 42 Students (Audited)",
    headline: "Saved my drop year from an overcrowded 90-student lecture hall.",
    quote: "Coaching sales reps in Kota claimed all batches were capped at 40 students, but normal batches actually packed 85 to 90 students where doubt asking was impossible. FutureSelector's physical audit directed me to the genuine repeat batch with strictly 42 students. That transparency saved my entire preparation.",
    rating: 5,
    passId: "FS-KOT-2026-840"
  },
  { 
    id: 2,
    author: "Sneha Patel", 
    exam: "NEET UG (682/720 • AIR 412)",
    institute: "Aakash Institute",
    cityKey: "delhi",
    hub: "Delhi NCR Hub",
    badge: "Audited Fee Breakdown",
    keyMetric: "100% Itemized Receipt • Zero Surprise GST Charges",
    headline: "Every single rupee of test series fees was transparent upfront.",
    quote: "The side-by-side fee comparison between Allen and Aakash showed exact itemized test fees, GST, and faculty credentials for medical biology. We locked our admission with complete transparency and zero unexpected material charges at the counter.",
    rating: 5,
    passId: "FS-DEL-2026-412"
  },
  { 
    id: 3,
    author: "Vikram Reddy", 
    exam: "JEE Mains (99.64%ile)",
    institute: "FIITJEE",
    cityKey: "hyderabad",
    hub: "Hyderabad Hub (Telangana)",
    badge: "Unbiased Mentorship",
    keyMetric: "Independent Non-Commissioned Academic Counselling",
    headline: "Unbiased guidance that evaluated my actual mock score strengths.",
    quote: "The free counselling session was eye-opening. The mentor didn't push any sponsored institute—they analyzed my mock test percentiles, hostel budget, and gave an unbiased preference list for intensive problem-solving batches.",
    rating: 5,
    passId: "FS-HYD-2026-996"
  },
  { 
    id: 4,
    author: "Tanvi Joshi", 
    exam: "NEET UG (665/720)",
    institute: "Allen Medical",
    cityKey: "jaipur",
    hub: "Jaipur Hub (Rajasthan)",
    badge: "Hostel Safety Verified",
    keyMetric: "Biometric Verified Hostel (150m from Campus Gate)",
    headline: "Hostel safety and real walking distance verified for female students.",
    quote: "Moving away from home for the first time was daunting for my family. FutureSelector's verified campus audits helped us choose a center with certified girl-hostels within 150 meters and 24/7 biometric security.",
    rating: 5,
    passId: "FS-JAI-2026-665"
  },
  { 
    id: 5,
    author: "Rohan Sharma", 
    exam: "JEE Advanced (AIR 1,120)",
    institute: "Resonance Eduventures",
    cityKey: "kota",
    hub: "Kota Hub (Rajasthan)",
    badge: "Faculty Stability Audit",
    keyMetric: "100% Core HOD Retention through Full 2-Year Syllabus",
    headline: "Zero mid-session faculty switching across Physics & Maths.",
    quote: "Faculty switching mid-session is every JEE aspirant's nightmare. FutureSelector's faculty retention track record showed whether HODs stayed through the full 2-year cycle. That stability gave us total peace of mind.",
    rating: 5,
    passId: "FS-KOT-2026-112"
  },
  { 
    id: 6,
    author: "Meera Iyer", 
    exam: "NEET UG (AIR 2,410)",
    institute: "Aakash Medical",
    cityKey: "delhi",
    hub: "Delhi NCR Hub",
    badge: "Doubt Desk Reality Check",
    keyMetric: "Scheduled Daily 1-on-1 Personal Faculty Slots",
    headline: "True doubt counter availability instead of 45-minute queues.",
    quote: "Coaching brochures promise 24/7 one-on-one doubt clearing, but student passes showed the real queue time at counters was 45 mins. FutureSelector guided me to an institute with scheduled daily personal faculty doubt slots.",
    rating: 5,
    passId: "FS-DEL-2026-241"
  }
];

// Marquee Row 1 Snippets
const marqueeRow1 = [
  {
    name: "Sneha Patel",
    exam: "NEET 682/720",
    hub: "Delhi NCR",
    tag: "Fee Transparency",
    quote: "100% itemized fee schedule. What FutureSelector reported was the exact amount charged at admission."
  },
  {
    name: "Aakash Verma",
    exam: "JEE Adv AIR 840",
    hub: "Kota Hub",
    tag: "Batch Audit",
    quote: "Audited 42-student batch limit saved me from 90+ student overcrowded classrooms."
  },
  {
    name: "Vikram Reddy",
    exam: "JEE Mains 99.6%ile",
    hub: "Hyderabad",
    tag: "Unbiased Advisory",
    quote: "Free counselling call gave me an unbiased preference list without sponsored coaching push."
  },
  {
    name: "Tanvi Joshi",
    exam: "NEET 665/720",
    hub: "Jaipur Hub",
    tag: "Hostel Verified",
    quote: "Hostel distance of 150m and biometric security verified before we even traveled to Jaipur."
  },
  {
    name: "Rohan Sharma",
    exam: "JEE Adv AIR 1120",
    hub: "Kota Hub",
    tag: "Faculty Stability",
    quote: "Faculty retention audit ensured our core HOD teachers didn't switch mid-session."
  },
  {
    name: "Meera Iyer",
    exam: "NEET AIR 2410",
    hub: "Delhi NCR",
    tag: "Doubt Counters",
    quote: "Scheduled faculty doubt counters meant zero waiting time during mock test analysis."
  }
];

// Marquee Row 2 Snippets
const marqueeRow2 = [
  {
    name: "Harshit Bansal",
    exam: "JEE Adv AIR 540",
    hub: "Kota Hub",
    tag: "Batch Transparency",
    quote: "Physical batch audit proved classroom count was 45 instead of the brochure claim of 30."
  },
  {
    name: "Priya Nair",
    exam: "NEET UG 675/720",
    hub: "Delhi NCR",
    tag: "Lab Facility",
    quote: "Biology dissecting labs and daily mock rooms audited and verified before admission."
  },
  {
    name: "Karthik V.",
    exam: "JEE Mains 99.8%ile",
    hub: "Hyderabad",
    tag: "Intensive Practice",
    quote: "Objective comparison between FIITJEE and Sri Chaitanya helped pick the right test series."
  },
  {
    name: "Divya Choudhary",
    exam: "NEET 658/720",
    hub: "Jaipur Hub",
    tag: "Hostel Food & Hygiene",
    quote: "Nearby verified hostel mess hygiene audits gave my parents peace of mind."
  },
  {
    name: "Yash Singhal",
    exam: "JEE Adv AIR 1480",
    hub: "Kota Hub",
    tag: "Study Material",
    quote: "Detailed review of revision sheets and DPP solutions helped me pick the right coaching."
  },
  {
    name: "Arjun Deshmukh",
    exam: "JEE Mains 99.2%ile",
    hub: "Hyderabad",
    tag: "Refund Clause",
    quote: "15-day exit refund policy clearly highlighted so we had zero financial risk."
  }
];

export default function SplitAndMarqueeTestimonials() {
  const [selectedHub, setSelectedHub] = useState("");
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);

  // Filter stories by hub if selected
  const visibleStories = useMemo(() => {
    if (!selectedHub) return featuredStories;
    return featuredStories.filter(s => s.cityKey === selectedHub);
  }, [selectedHub]);

  // Ensure active index stays within bounds
  const currentStory = visibleStories[activeStoryIndex] || visibleStories[0] || featuredStories[0];

  const handleNext = () => {
    setActiveStoryIndex(prev => (prev + 1) % visibleStories.length);
  };

  const handlePrev = () => {
    setActiveStoryIndex(prev => (prev - 1 + visibleStories.length) % visibleStories.length);
  };

  return (
    <section className="py-20 px-6 bg-background border-t border-border overflow-hidden">
      <div className="max-w-7xl mx-auto">
        
        {/* =====================================================================
            PART 1: SPLIT-SCREEN STICKY SHOWCASE (IDEA 2)
            High-contrast, crystal-clear typography & focused side-by-side layout
           ===================================================================== */}
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-24">
          
          {/* Left Column (5 Cols): Clean Sticky Information & Story Selectors */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            
            {/* Trust Pill Header */}
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-900 text-xs font-bold mb-4 shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-brand-600" />
                <span>Verified Aspirant Perspectives • 4,800+ Admissions Audited</span>
              </div>

              {/* Big, Crisp Heading - ZERO BLUR, ZERO FADE */}
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-textMain tracking-tight mb-3 leading-[1.12]">
                Real Stories.<br />
                <span className="text-brand-600">Audited Truth.</span>
              </h2>

              <p className="text-sm sm:text-base text-textMuted leading-relaxed mb-6 font-normal">
                Honest classroom headcount audits, verified itemized fees, and faculty stability shared by verified students who enrolled through FutureSelector.
              </p>

              {/* Trust Score Summary Box */}
              <div className="p-4 rounded-2xl bg-surface border border-border shadow-2xs mb-6 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-yellow-500 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-500" />
                    ))}
                    <span className="ml-1 text-sm font-black text-textMain">4.9 / 5.0</span>
                  </div>
                  <p className="text-xs font-semibold text-textMuted">
                    Based on 4,800+ verified student passes
                  </p>
                </div>

                <div className="text-right border-l border-border pl-4">
                  <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 block mb-0.5">
                    100% Genuine
                  </span>
                  <span className="text-[10px] text-textMuted font-medium">Zero sponsored edits</span>
                </div>
              </div>

              {/* Hub Quick Filters */}
              <div className="mb-6">
                <span className="text-xs font-bold text-textMain block mb-2">Filter by Coaching Hub:</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: "All Hubs", value: "" },
                    { label: "Kota Hub", value: "kota" },
                    { label: "Delhi NCR", value: "delhi" },
                    { label: "Hyderabad", value: "hyderabad" },
                    { label: "Jaipur", value: "jaipur" },
                  ].map(hub => (
                    <button
                      key={hub.value}
                      onClick={() => {
                        setSelectedHub(hub.value);
                        setActiveStoryIndex(0);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        selectedHub === hub.value
                          ? "bg-brand-600 text-white border-brand-600 shadow-2xs"
                          : "bg-surface text-textMuted border-border hover:border-brand-300 hover:text-textMain"
                      }`}
                    >
                      {hub.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Story Selector List */}
            <div className="space-y-1.5 mb-6">
              {visibleStories.map((story, idx) => {
                const isSelected = activeStoryIndex === idx;
                return (
                  <button
                    key={story.id}
                    onClick={() => setActiveStoryIndex(idx)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer border ${
                      isSelected
                        ? "bg-brand-600 text-white border-brand-600 shadow-md translate-x-1"
                        : "bg-surface hover:bg-surfaceWarm text-textMuted border-border hover:border-brand-300 hover:text-textMain"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black shrink-0 ${
                        isSelected ? "bg-white/20 text-white" : "bg-surfaceWarm text-textMuted"
                      }`}>
                        0{idx + 1}
                      </span>
                      <span className="truncate">{story.author} • {story.exam.split(" ")[0]}</span>
                    </div>

                    <span className={`text-[10px] font-semibold shrink-0 ml-2 ${
                      isSelected ? "text-gold-300" : "text-textMuted"
                    }`}>
                      {story.hub.split(" ")[0]}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Navigation Buttons & Counter */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <span className="text-xs font-extrabold text-brand-900">
                Story {activeStoryIndex + 1} of {visibleStories.length}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  className="w-10 h-10 rounded-xl bg-surface border border-border text-textMain hover:bg-brand-50 hover:border-brand-300 flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95"
                  title="Previous Story"
                >
                  <ChevronLeft className="w-5 h-5 text-textMain" />
                </button>
                <button
                  onClick={handleNext}
                  className="w-10 h-10 rounded-xl bg-brand-600 border border-brand-600 text-white hover:bg-brand-700 flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95"
                  title="Next Story"
                >
                  <ChevronRight className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

          </div>

          {/* Right Column (7 Cols): Featured Story Card with Ultra-Clear Typography */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStory.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              >
                <SpotlightCard
                  spotlightColor="rgba(18, 75, 56, 0.08)"
                  borderColor="rgba(197, 160, 89, 0.45)"
                  className="p-8 sm:p-10 bg-surface rounded-3xl border border-border shadow-2xl relative overflow-hidden flex flex-col justify-between"
                >
                  {/* Subtle Background Watermark Quote */}
                  <Quote className="absolute -bottom-6 -right-6 w-36 h-36 text-brand-900/[0.03] pointer-events-none" />

                  {/* Top Bar: Hub & Verified Pass ID */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-5 border-b border-border mb-6">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-brand-900 bg-brand-50 border border-brand-200 px-3 py-1.5 rounded-xl">
                        📍 {currentStory.institute} • {currentStory.hub}
                      </span>
                    </div>

                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>{currentStory.passId}</span>
                    </span>
                  </div>

                  {/* 5 Yellow Stars */}
                  <div className="flex items-center gap-1 text-yellow-500 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-500" />
                    ))}
                    <span className="ml-2 text-xs font-black text-textMain">5.0 Star Verified Student Review</span>
                  </div>

                  {/* Big Headline */}
                  <h3 className="text-xl sm:text-2xl font-black text-textMain tracking-tight mb-4 leading-snug">
                    "{currentStory.headline}"
                  </h3>

                  {/* Big Readable Quote Text - 18px font, high contrast #0F172A, generous line-height */}
                  <p className="text-base sm:text-lg text-slate-800 leading-relaxed font-normal mb-8">
                    {currentStory.quote}
                  </p>

                  {/* Key Audit Takeaway Box */}
                  <div className="p-4 rounded-2xl bg-surfaceWarm border border-border/80 flex items-center gap-3 mb-8">
                    <div className="w-8 h-8 rounded-xl bg-brand-600 text-white flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-textMuted tracking-wider block">
                        Verified Audit Takeaway
                      </span>
                      <span className="text-sm font-extrabold text-brand-950">
                        {currentStory.keyMetric}
                      </span>
                    </div>
                  </div>

                  {/* Student Profile Row */}
                  <div className="pt-6 border-t border-border flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white font-black text-base flex items-center justify-center shadow-sm shrink-0 border border-gold-400/50">
                        {currentStory.author.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div>
                        <h4 className="font-black text-base text-textMain">
                          {currentStory.author}
                        </h4>
                        <p className="text-xs font-extrabold text-brand-700">
                          {currentStory.exam}
                        </p>
                      </div>
                    </div>

                    <span className="text-xs font-black text-gold-800 bg-gold-50 border border-gold-200 px-3.5 py-1.5 rounded-xl shrink-0">
                      {currentStory.badge}
                    </span>
                  </div>

                </SpotlightCard>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>

        {/* =====================================================================
            PART 2: DUAL-ROW INFINITE FLOATING MARQUEE WITH HOVER PAUSE (IDEA 3)
            Cards smoothly drift across; hover stops track & expands for reading
           ===================================================================== */}
        
        <div className="pt-10 border-t border-border">
          
          <div className="text-center max-w-xl mx-auto mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surfaceWarm text-brand-800 text-xs font-bold border border-border mb-2">
              <Sparkles className="w-3.5 h-3.5 text-gold-500" />
              <span>Live National Review Feed</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-textMain tracking-tight mb-2">
              Audited Aspirant Ticker Across India
            </h3>
            <p className="text-xs sm:text-sm text-textMuted">
              Hover over any review card to <span className="font-bold text-brand-700">instantly pause and read</span> with zero rush.
            </p>
          </div>

          {/* Row 1: Leftward Floating Marquee */}
          <div className="relative overflow-hidden mb-5 py-2 pause-on-hover">
            {/* Left/Right Edge Fades */}
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none"></div>

            <div className="flex gap-4 w-max animate-marquee-left">
              {[...marqueeRow1, ...marqueeRow1].map((item, idx) => (
                <div
                  key={idx}
                  className="w-80 sm:w-96 p-5 rounded-2xl bg-surface border border-border shadow-xs hover:shadow-card-hover hover:border-brand-400 hover:scale-[1.02] transition-all duration-200 shrink-0 cursor-pointer flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-extrabold text-brand-800 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded-md">
                      📍 {item.hub}
                    </span>
                    <div className="flex items-center gap-0.5 text-yellow-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-yellow-500" />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-slate-800 font-medium leading-relaxed mb-4">
                    "{item.quote}"
                  </p>

                  <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-textMain block">{item.name}</span>
                      <span className="text-[11px] text-brand-700 font-bold">{item.exam}</span>
                    </div>
                    <span className="text-[10px] font-bold text-textMuted bg-background px-2 py-0.5 rounded border border-border">
                      {item.tag}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Row 2: Rightward Floating Marquee */}
          <div className="relative overflow-hidden py-2 pause-on-hover">
            {/* Left/Right Edge Fades */}
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none"></div>

            <div className="flex gap-4 w-max animate-marquee-right">
              {[...marqueeRow2, ...marqueeRow2].map((item, idx) => (
                <div
                  key={idx}
                  className="w-80 sm:w-96 p-5 rounded-2xl bg-surface border border-border shadow-xs hover:shadow-card-hover hover:border-gold-400 hover:scale-[1.02] transition-all duration-200 shrink-0 cursor-pointer flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-extrabold text-gold-800 bg-gold-50 border border-gold-200 px-2 py-0.5 rounded-md">
                      📍 {item.hub}
                    </span>
                    <div className="flex items-center gap-0.5 text-yellow-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-yellow-500" />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-slate-800 font-medium leading-relaxed mb-4">
                    "{item.quote}"
                  </p>

                  <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-textMain block">{item.name}</span>
                      <span className="text-[11px] text-brand-700 font-bold">{item.exam}</span>
                    </div>
                    <span className="text-[10px] font-bold text-textMuted bg-background px-2 py-0.5 rounded border border-border">
                      {item.tag}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
