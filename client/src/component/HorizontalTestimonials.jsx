import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Star, ShieldCheck, MessageSquare, ChevronLeft, ChevronRight, Quote, ArrowRight, CheckCircle2 } from "lucide-react";
import SpotlightCard from "./reactbits/SpotlightCard";
import ShinyText from "./reactbits/ShinyText";

export const testimonials = [
  { 
    id: 1,
    author: "Aakash Verma", 
    exam: "JEE Advanced (AIR 840)",
    institute: "Allen Career Institute",
    hub: "Kota Hub (Rajasthan)",
    badge: "Verified Batch Audit",
    keyMetric: "Audited Classroom: 42 Students",
    quote: "Coaching sales reps in Kota claimed classroom sizes were capped at 40 students, but normal batches actually packed 85+. FutureSelector's physical audit directed me to the genuine repeat batch with strictly 42 students. That honesty saved my drop year.",
    rating: 5,
    tagColor: "brand"
  },
  { 
    id: 2,
    author: "Sneha Patel", 
    exam: "NEET UG (682/720 • AIR 412)",
    institute: "Aakash Institute",
    hub: "Delhi NCR Hub",
    badge: "Audited Fee Breakdown",
    keyMetric: "100% Itemized Schedule • Zero Hidden GST",
    quote: "The side-by-side fee comparison between Allen and Aakash showed exact itemized test fees, GST, and faculty credentials for medical biology. We locked our admission with complete transparency and zero surprise material costs.",
    rating: 5,
    tagColor: "gold"
  },
  { 
    id: 3,
    author: "Vikram Reddy", 
    exam: "JEE Mains (99.64%ile)",
    institute: "FIITJEE",
    hub: "Hyderabad Hub (Telangana)",
    badge: "Unbiased Mentorship",
    keyMetric: "Independent Non-Commission Advisory",
    quote: "The free counselling session was eye-opening. The mentor didn't push any sponsored institute—they analyzed my mock test percentiles, hostel budget, and gave an unbiased preference list for intensive problem-solving batches.",
    rating: 5,
    tagColor: "brand"
  },
  { 
    id: 4,
    author: "Tanvi Joshi", 
    exam: "NEET UG (665/720)",
    institute: "Allen Medical",
    hub: "Jaipur Hub (Rajasthan)",
    badge: "Hostel Safety Verified",
    keyMetric: "Biometric Verified Hostel (150m from gate)",
    quote: "Moving away from home for the first time was daunting for my family. FutureSelector's verified campus audits helped us choose a center with certified girl-hostels within 150 meters and 24/7 biometric security.",
    rating: 5,
    tagColor: "gold"
  },
  { 
    id: 5,
    author: "Rohan Sharma", 
    exam: "JEE Advanced (AIR 1,120)",
    institute: "Resonance Eduventures",
    hub: "Kota Hub (Rajasthan)",
    badge: "Faculty Stability Audit",
    keyMetric: "100% HOD Retention through 2-Yr Cycle",
    quote: "Faculty switching mid-session is every JEE aspirant's nightmare. FutureSelector's faculty retention track record showed whether HODs stayed through the full 2-year cycle. That transparency gave us total peace of mind.",
    rating: 5,
    tagColor: "brand"
  },
  { 
    id: 6,
    author: "Meera Iyer", 
    exam: "NEET UG (AIR 2,410)",
    institute: "Aakash Medical",
    hub: "Delhi NCR Hub",
    badge: "Doubt Desk Reality Check",
    keyMetric: "Daily Scheduled Personal Faculty Desks",
    quote: "Coaching brochures promise 24/7 one-on-one doubt clearing, but student passes showed the real queue time at counters was 45 mins. FutureSelector guided me to an institute with scheduled daily personal faculty doubt slots.",
    rating: 5,
    tagColor: "gold"
  },
  { 
    id: 7,
    author: "Arjun Deshmukh", 
    exam: "JEE Mains (99.2%ile)",
    institute: "Motion Education",
    hub: "Hyderabad Hub",
    badge: "Fee Refund Transparency",
    keyMetric: "15-Day Exit & Full Refund Clause Verified",
    quote: "We had a bad experience earlier losing non-refundable deposits. FutureSelector highlighted coaching centers with clear, compliant 15-day exit refund clauses. That financial transparency is priceless for middle-class parents.",
    rating: 5,
    tagColor: "brand"
  }
];

// Individual Story Card in the 3D Stack that peels and slides to the side on scroll
function PeelingCard({ item, index, total, scrollYProgress, activeIndex, onSelect }) {
  const isLast = index === total - 1;
  const step = 1 / total;

  // Keyframes for this card's lifecycle
  const enterStart = Math.max(0, (index - 1) * step);
  const activeStart = index * step;
  const exitStart = activeStart + step * 0.7;
  const exitEnd = Math.min(1, (index + 1) * step);

  // Horizontal slide: card stays centered, then sweeps out to the left
  const x = useTransform(
    scrollYProgress,
    isLast 
      ? [enterStart, activeStart, 1] 
      : [enterStart, activeStart, exitStart, exitEnd],
    isLast 
      ? ["0%", "0%", "0%"] 
      : ["0%", "0%", "0%", "-130%"]
  );

  // Card rotation when sliding aside (peel effect)
  const rotate = useTransform(
    scrollYProgress,
    isLast 
      ? [enterStart, 1] 
      : [enterStart, exitStart, exitEnd],
    isLast 
      ? [0, 0] 
      : [0, 0, -8]
  );

  // Smooth scale: starts slightly smaller in the stack (0.94), scales up to 1.0 in focus
  const scale = useTransform(
    scrollYProgress,
    [enterStart, activeStart, exitStart, exitEnd],
    [0.94, 1, 1, 0.96]
  );

  // Fade out as it exits to the side
  const opacity = useTransform(
    scrollYProgress,
    isLast
      ? [enterStart, activeStart, 1]
      : [enterStart, activeStart, exitStart, exitEnd],
    isLast
      ? [index === 0 ? 1 : 0.85, 1, 1]
      : [index === 0 ? 1 : 0.85, 1, 1, 0]
  );

  // Stack vertical offset behind the active card
  const yOffset = useTransform(
    scrollYProgress,
    [enterStart, activeStart],
    [index > activeIndex ? (index - activeIndex) * 12 : 0, 0]
  );

  const isActive = activeIndex === index;

  return (
    <motion.div
      style={{
        x,
        rotate,
        scale,
        opacity,
        y: yOffset,
        zIndex: total - index,
      }}
      className="absolute inset-0 w-full will-change-transform will-change-filter"
    >
      <SpotlightCard
        spotlightColor="rgba(18, 75, 56, 0.12)"
        borderColor={isActive ? "rgba(197, 160, 89, 0.8)" : "rgba(197, 160, 89, 0.3)"}
        className={`w-full h-full p-7 sm:p-9 bg-surface rounded-3xl border shadow-2xl flex flex-col justify-between transition-shadow relative overflow-hidden ${
          isActive ? "ring-2 ring-gold-400/50 shadow-[0_20px_50px_rgba(18,75,56,0.15)]" : "border-border"
        }`}
      >
        {/* Giant Watermark Quote Icon */}
        <Quote className="absolute -bottom-6 -right-6 w-36 h-36 text-brand-900/[0.04] pointer-events-none" />

        {/* Card Header: Hub, Verified Badge, Rating */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-brand-800 bg-brand-50 border border-brand-200 px-3 py-1 rounded-xl">
                📍 {item.institute} • {item.hub}
              </span>
            </div>
            
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Verified Aspirant Pass</span>
            </span>
          </div>

          {/* Star Rating & Story Number */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-1 text-yellow-500">
              {[...Array(item.rating)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-yellow-500" />
              ))}
              <span className="ml-1 text-xs font-extrabold text-textMain">5.0</span>
            </div>
            <span className="text-xs font-bold text-textMuted bg-background border border-border px-2.5 py-0.5 rounded-lg">
              Verified Audit #{item.id} of {total}
            </span>
          </div>

          {/* Big Featured Quote */}
          <p className="text-base sm:text-lg text-textMain leading-relaxed font-semibold mb-6 tracking-tight">
            "{item.quote}"
          </p>
        </div>

        {/* Bottom Card Footer: Key Metric & Student Profile */}
        <div>
          {/* Key Audit Metric Pill */}
          <div className="mb-5 p-3 rounded-2xl bg-surfaceWarm/80 border border-border flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" />
            <span className="text-xs font-extrabold text-brand-900">
              {item.keyMetric}
            </span>
          </div>

          {/* Student Author Row */}
          <div className="pt-4 border-t border-border flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* Avatar Initial Circle */}
              <div className="w-11 h-11 rounded-2xl bg-brand-600 text-white font-extrabold text-sm flex items-center justify-center shadow-sm shrink-0 border border-gold-400/40">
                {item.author.split(" ").map(n => n[0]).join("")}
              </div>
              <div>
                <h4 className="font-extrabold text-sm sm:text-base text-textMain leading-snug">
                  {item.author}
                </h4>
                <p className="text-xs font-bold text-brand-700">
                  {item.exam}
                </p>
              </div>
            </div>

            <span className="text-xs font-extrabold text-gold-700 bg-gold-50 border border-gold-200 px-3 py-1.5 rounded-xl shrink-0">
              {item.badge}
            </span>
          </div>
        </div>

      </SpotlightCard>
    </motion.div>
  );
}

export default function HorizontalTestimonials() {
  const containerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Track vertical page scroll
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Smooth physics spring for silky responsive feel
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 20,
    restDelta: 0.001
  });

  // Calculate current active card index
  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      const idx = Math.min(
        Math.floor(latest * testimonials.length),
        testimonials.length - 1
      );
      setActiveIndex(idx);
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  // Click to jump to specific card
  const scrollToCard = (idx) => {
    if (!containerRef.current) return;
    const containerTop = containerRef.current.offsetTop;
    const containerHeight = containerRef.current.offsetHeight;
    const targetScroll = containerTop + (idx / testimonials.length) * (containerHeight - window.innerHeight);
    window.scrollTo({ top: targetScroll, behavior: "smooth" });
  };

  const handleNext = () => {
    if (activeIndex < testimonials.length - 1) {
      scrollToCard(activeIndex + 1);
    }
  };

  const handlePrev = () => {
    if (activeIndex > 0) {
      scrollToCard(activeIndex - 1);
    }
  };

  return (
    <section 
      ref={containerRef} 
      className="relative bg-background border-t border-border"
      style={{ height: "360vh" }} // Provides the vertical scroll runway for peeling cards
    >
      {/* Sticky Full-Viewport Stage */}
      <div className="sticky top-0 h-screen w-full flex flex-col justify-center overflow-hidden py-8 px-6 sm:px-10 lg:px-16">
        
        {/* Subtle Ambient Background Gradients */}
        <div className="absolute top-1/4 left-1/3 -translate-y-1/2 w-[500px] h-[500px] bg-brand-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-gold-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
          
          {/* Left Column (5 Cols): Editorial Index & Interactive Timeline */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            
            {/* Header Tag */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-brand-50 text-brand-800 text-xs font-bold border border-brand-200 mb-4 shadow-2xs">
                <MessageSquare className="w-3.5 h-3.5 text-brand-600" />
                <ShinyText text="Aspirant Perspectives • 7 Verified Audits" shimmerColor="rgba(197, 160, 89, 0.95)" speed={3.5} />
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-textMain tracking-tight mb-3 leading-[1.1]">
                Real Stories.<br />
                <span className="text-brand-600">Audited Facts.</span>
              </h2>

              <p className="text-xs sm:text-sm text-textMuted leading-relaxed mb-6 font-normal">
                Scroll down to peel through authentic classroom feedback from verified aspirants who made enrollment decisions using transparent batch audits.
              </p>
            </div>

            {/* Interactive Timeline List of 7 Verified Stories */}
            <div className="space-y-1.5 mb-6 max-h-[260px] overflow-y-auto pr-1">
              {testimonials.map((t, idx) => {
                const isSelected = activeIndex === idx;
                return (
                  <button
                    key={t.id}
                    onClick={() => scrollToCard(idx)}
                    className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer border ${
                      isSelected
                        ? "bg-brand-600 text-white border-brand-600 shadow-md translate-x-1"
                        : "bg-surface/80 hover:bg-white text-textMuted border-border hover:border-brand-200"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black ${
                        isSelected ? "bg-white/20 text-white" : "bg-surfaceWarm text-textMuted"
                      }`}>
                        0{t.id}
                      </span>
                      <span className="truncate">{t.author} • {t.exam.split(" ")[0]}</span>
                    </div>

                    <span className={`text-[10px] font-semibold shrink-0 ml-2 ${
                      isSelected ? "text-gold-300" : "text-textMuted"
                    }`}>
                      {t.hub.split(" ")[0]}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Bottom Progress Controls & Next/Prev */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="flex items-center gap-3">
                <span className="text-xs font-black text-brand-900">
                  {activeIndex + 1} / {testimonials.length}
                </span>
                <div className="w-24 h-1.5 bg-surfaceWarm rounded-full overflow-hidden border border-border">
                  <motion.div 
                    className="h-full bg-brand-600 rounded-full"
                    style={{ 
                      width: `${((activeIndex + 1) / testimonials.length) * 100}%` 
                    }}
                  />
                </div>
              </div>

              {/* Prev / Next Click Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handlePrev}
                  disabled={activeIndex === 0}
                  className="w-9 h-9 rounded-xl bg-surface border border-border text-textMain hover:bg-brand-50 disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                  title="Previous Story"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNext}
                  disabled={activeIndex === testimonials.length - 1}
                  className="w-9 h-9 rounded-xl bg-brand-600 border border-brand-600 text-white hover:bg-brand-700 disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center transition-all cursor-pointer shadow-sm"
                  title="Next Story"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scroll Hint */}
            <div className="mt-3 flex items-center gap-1.5 text-[11px] text-textMuted font-medium">
              <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse"></span>
              <span>Scroll down to slide the cards aside</span>
            </div>

          </div>

          {/* Right Column (7 Cols): 3D Card Peeling Stage */}
          <div className="lg:col-span-7 flex justify-center items-center">
            <div className="relative w-full max-w-lg h-[460px] sm:h-[480px]">
              {testimonials.map((t, idx) => (
                <PeelingCard
                  key={t.id}
                  item={t}
                  index={idx}
                  total={testimonials.length}
                  scrollYProgress={smoothProgress}
                  activeIndex={activeIndex}
                  onSelect={scrollToCard}
                />
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
