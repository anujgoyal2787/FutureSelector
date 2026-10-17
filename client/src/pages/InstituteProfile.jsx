import { useState, useMemo, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Star, MapPin, ShieldCheck, Users, IndianRupee, 
  Building2, Award, CheckCircle2, Heart, Share2, PhoneCall, 
  Calendar, Clock, Check, Copy, ArrowRight, MessageSquare, 
  ExternalLink, Sparkles, BookOpen, AlertCircle, FileText, 
  GraduationCap, Download, CheckSquare, Eye, ChevronRight, 
  Briefcase, Coffee, BedDouble, Utensils, Shield, KeyRound, Info,
  Trophy, HeartHandshake, Lock, Unlock, HelpCircle, Flame, CheckCheck,
  ChevronDown, Layers, Compass, CheckCircle, BarChart3, Camera, 
  Images, ChevronLeft, X, Maximize2, Sun, Moon, Zap, Smartphone
} from "lucide-react";
import { institutesData } from "../data/institutes";
import { useAuth } from "../context/AuthContext";
import CountUp from "../component/reactbits/CountUp";
import ShinyText from "../component/reactbits/ShinyText";
import ShareWithParentsModal from "../component/ShareWithParentsModal";
import AuthModal from "../component/AuthModal";
import SeatLockModal from "../component/SeatLockModal";

export default function InstituteProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, toggleShortlist, authModal, closeAuthModal } = useAuth();

  // Instant scroll to top on load or id change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [id]);

  const [activeSection, setActiveSection] = useState("sec-overview");
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [activeGalleryCategory, setActiveGalleryCategory] = useState("all");
  const [selectedPhotoIdx, setSelectedPhotoIdx] = useState(0);
  const [copiedCoupon, setCopiedCoupon] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [claimSubmitted, setClaimSubmitted] = useState(false);
  const [enquirySubmitted, setEnquirySubmitted] = useState(false);
  const [activeInstallmentView, setActiveInstallmentView] = useState("lum-sum"); // lum-sum | installments
  const [reviewFilter, setReviewFilter] = useState("all"); // all | jee | neet | parents
  const [isStickyBarDismissed, setIsStickyBarDismissed] = useState(false);
  const [isSeatLockModalOpen, setIsSeatLockModalOpen] = useState(false);
  const [lockTargetBatch, setLockTargetBatch] = useState(null);

  // Find institute by id or slug
  const institute = useMemo(() => {
    return institutesData.find(i => String(i.id) === id || i.slug === id) || institutesData[0];
  }, [id]);

  const isShortlisted = user?.shortlisted?.includes(institute.id);
  const couponCode = `FS-${institute.name.split(" ")[0].toUpperCase()}-15K`;

  const handleCopyCoupon = () => {
    navigator.clipboard?.writeText(couponCode);
    setCopiedCoupon(true);
    setTimeout(() => setCopiedCoupon(false), 2500);
  };

  const handleEnquirySubmit = (e) => {
    e.preventDefault();
    setEnquirySubmitted(true);
  };

  const handleClaimSubmit = (e) => {
    e.preventDefault();
    setClaimSubmitted(true);
  };

  // Scroll Spy for in-page navigation
  useEffect(() => {
    const sectionIds = [
      "sec-overview", 
      "sec-batches", 
      "sec-fees", 
      "sec-faculty", 
      "sec-hostels", 
      "sec-rankers", 
      "sec-reviews"
    ];

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 180;
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(sectionIds[i]);
        if (el) {
          const top = el.offsetTop;
          if (scrollPosition >= top) {
            setActiveSection(sectionIds[i]);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (secId) => {
    setActiveSection(secId);
    const element = document.getElementById(secId);
    if (element) {
      const yOffset = -130;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  // Comprehensive 8-Photo Campus Infrastructure Gallery (Opened directly from hero background)
  const campusGalleryPhotos = useMemo(() => [
    {
      id: 1,
      title: "Tiered Acoustic Smart Lecture Hall",
      category: "classrooms",
      categoryLabel: "Classrooms & Tech",
      desc: "Acoustically calibrated 45-seat tiered lecture hall with dual 86-inch interactive 4K smart panels and ambient noise-dampening panels.",
      url: institute.image,
      auditBadge: "Audited 45-Cap Seating",
      locationTag: `${institute.name} Main Academic Wing`
    },
    {
      id: 2,
      title: "One-on-One Dedicated Doubt Counters",
      category: "doubts",
      categoryLabel: "Doubt Desks",
      desc: "Daily post-class concept clarification counters where full-time subject HODs sit from 2:30 PM to 6:00 PM to resolve questions individually.",
      url: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1200&auto=format&fit=crop",
      auditBadge: "Daily 3.5 Doubt Hours",
      locationTag: "Faculty Consultation Wing"
    },
    {
      id: 3,
      title: "Air-Conditioned Central Self-Study Library",
      category: "library",
      categoryLabel: "Library & Labs",
      desc: "Soundproof individual study carrels open daily 7:00 AM to 10:30 PM with physical reference archives and digital practice terminals.",
      url: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=1200&auto=format&fit=crop",
      auditBadge: "Open Till 10:30 PM",
      locationTag: "Library Block - Level 2"
    },
    {
      id: 4,
      title: "120-Terminal Computer Based Test (CBT) Center",
      category: "library",
      categoryLabel: "Library & Labs",
      desc: "Calibrated terminals strictly simulating the official NTA JEE Main and NEET computer interface with timed mock simulations.",
      url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1200&auto=format&fit=crop",
      auditBadge: "NTA Test Simulator",
      locationTag: "Digital Examination Lab"
    },
    {
      id: 5,
      title: "Verified Student Quarters & AC Hostel Rooms",
      category: "hostels",
      categoryLabel: "Hostels & Living",
      desc: "Ergonomic study desks, orthopedic mattresses, 24x7 security wardens, and parent biometric SMS curfew entry system.",
      url: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=1200&auto=format&fit=crop",
      auditBadge: "Within 200m Walk",
      locationTag: "Affiliated Resident Hostels"
    },
    {
      id: 6,
      title: "FSSAI Grade-A Certified Dining Hall & Mess",
      category: "mess",
      categoryLabel: "Mess & Dining",
      desc: "Nutritious 4-meal daily catering audited for high cleanliness standards, RO alkaline water stations, and dietitian-approved menu.",
      url: "https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=1200&auto=format&fit=crop",
      auditBadge: "FSSAI Grade A",
      locationTag: "Central Aspirant Dining Area"
    },
    {
      id: 7,
      title: "Experimental Demonstration & Science Lab",
      category: "classrooms",
      categoryLabel: "Classrooms & Tech",
      desc: "Hands-on physical setups for optics, electromagnetism, and organic chemistry reaction mechanisms to strengthen intuitive learning.",
      url: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=1200&auto=format&fit=crop",
      auditBadge: "Practical Visuals",
      locationTag: "Experimental Concept Lab"
    },
    {
      id: 8,
      title: "Student Medical Well-being & Stress Care Desk",
      category: "hostels",
      categoryLabel: "Hostels & Living",
      desc: "On-site certified nurse, doctor on-call, and dedicated student psychologist available weekly for academic pressure management.",
      url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=1200&auto=format&fit=crop",
      auditBadge: "24x7 Doctor On Call",
      locationTag: "Student Care Center"
    }
  ], [institute]);

  const filteredGalleryPhotos = useMemo(() => {
    if (activeGalleryCategory === "all") return campusGalleryPhotos;
    return campusGalleryPhotos.filter(p => p.category === activeGalleryCategory);
  }, [campusGalleryPhotos, activeGalleryCategory]);

  const currentPhoto = filteredGalleryPhotos[selectedPhotoIdx] || filteredGalleryPhotos[0];

  const handleNextPhoto = () => {
    setSelectedPhotoIdx((prev) => (prev + 1) % filteredGalleryPhotos.length);
  };

  const handlePrevPhoto = () => {
    setSelectedPhotoIdx((prev) => (prev - 1 + filteredGalleryPhotos.length) % filteredGalleryPhotos.length);
  };

  // Keyboard navigation for gallery modal
  useEffect(() => {
    if (!isGalleryModalOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsGalleryModalOpen(false);
      if (e.key === "ArrowRight") handleNextPhoto();
      if (e.key === "ArrowLeft") handlePrevPhoto();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isGalleryModalOpen, filteredGalleryPhotos]);

  // Upcoming Batch Schedules
  const upcomingBatches = [
    {
      name: "Nurture Foundation Batch",
      target: "Class 10th to 11th Moving",
      exam: "2-Year JEE / NEET Target 2028",
      startDate: "15 April 2026",
      timings: "08:00 AM – 01:30 PM",
      auditedLimit: institute.batchSize,
      seatsLeft: "4 Seats Left",
      badgeColor: "bg-red-500/10 text-red-600 border-red-200"
    },
    {
      name: "Enthusiast Core Batch",
      target: "Class 11th to 12th Moving",
      exam: "1-Year JEE / NEET Target 2027",
      startDate: "22 April 2026",
      timings: "08:30 AM – 02:00 PM",
      auditedLimit: institute.batchSize,
      seatsLeft: "8 Seats Left",
      badgeColor: "bg-amber-500/10 text-amber-600 border-amber-200"
    },
    {
      name: "Leader Dropper Batch (Phase 1)",
      target: "12th Passed / Repeaters",
      exam: "Target JEE / NEET 2027",
      startDate: "06 May 2026",
      timings: "07:30 AM – 01:00 PM",
      auditedLimit: institute.batchSize,
      seatsLeft: "6 Seats Left",
      badgeColor: "bg-red-500/10 text-red-600 border-red-200"
    },
    {
      name: "Target Super-30 Intensive Batch",
      target: "Top Diagnostic Scorers",
      exam: "Special High-Yield Mentorship",
      startDate: "20 May 2026",
      timings: "08:00 AM – 03:00 PM",
      auditedLimit: "Strictly 30 Students",
      seatsLeft: "Admission via FS Test",
      badgeColor: "bg-purple-500/10 text-purple-600 border-purple-200"
    }
  ];

  // Verified Senior Faculty Roster
  const facultyRoster = [
    {
      name: "Er. Arvind K. Saxena",
      subject: "HOD Physics & Mechanics",
      degrees: "B.Tech IIT Delhi (Ex-HOD)",
      experience: "16+ Years Experience",
      highlight: "Mentored 18 Top 50 AIR ranks in JEE Advanced",
      retention: "9+ Years at this Campus",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop"
    },
    {
      name: "Dr. Manish Bhargava",
      subject: "HOD Chemistry & Reaction Kinetics",
      degrees: "Ph.D IIT Roorkee, M.Sc Gold Medalist",
      experience: "14+ Years Experience",
      highlight: "Specialist in Reaction Mechanisms & Organic Synthesis",
      retention: "8+ Years at this Campus",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop"
    },
    {
      name: "Prof. Sandeep R. Verma",
      subject: "HOD Mathematics & Advanced Calculus",
      degrees: "M.Sc Mathematics (DU), CSIR-NET",
      experience: "17+ Years Experience",
      highlight: "Trained 40+ Top 100 AIR rankers in Kota hubs",
      retention: "11+ Years at this Campus",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop"
    },
    {
      name: "Dr. Priyanka Sengupta",
      subject: "HOD Zoology & Human Physiology",
      degrees: "MBBS (KGMU Lucknow), MD Physiology",
      experience: "12+ Years Medical Coaching",
      highlight: "Authored 3 widely used NCERT biology reference guides",
      retention: "7+ Years at this Campus",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=300&auto=format&fit=crop"
    }
  ];

  // Verified Rankers Data
  const verifiedRankers = [
    {
      name: "Kartik Singhal",
      rank: "AIR 24",
      exam: "JEE Advanced 2025",
      type: "2-Year Regular Classroom (Audited)",
      roll: "FS-VER-24901",
      city: "Kota Campus",
      college: "IIT Bombay (Computer Science)",
      photo: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=300&auto=format&fit=crop"
    },
    {
      name: "Ananya Deshmukh",
      rank: "AIR 67",
      exam: "NEET-UG 2025 (Score: 712/720)",
      type: "2-Year Regular Classroom (Audited)",
      roll: "FS-VER-88210",
      city: "Classroom Center",
      college: "AIIMS New Delhi (MBBS)",
      photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=300&auto=format&fit=crop"
    },
    {
      name: "Rohan V. Nair",
      rank: "AIR 112",
      exam: "JEE Advanced 2025",
      type: "Leader Dropper Batch (Audited)",
      roll: "FS-VER-55104",
      city: "Kota Center",
      college: "IIT Delhi (Electrical Engg)",
      photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=300&auto=format&fit=crop"
    }
  ];

  // Day in the Life Student Schedule (Connected Vertical Timeline with Icons & Doubt Golden Hour)
  const dailySchedule = [
    { 
      time: "07:30 AM – 08:00 AM", 
      title: "Study Hall Check-In & Doubt Token Allotment", 
      tag: "Prep Phase", 
      icon: "Sun",
      desc: "Biometric arrival, morning desk allotment, and collecting 1-on-1 faculty doubt tokens." 
    },
    { 
      time: "08:00 AM – 10:30 AM", 
      title: "Physics / Chemistry Lecture & Concept Derivation", 
      tag: "Core Lecture 1", 
      icon: "BookOpen",
      desc: "Deep concept derivation, NCERT synchronization, and micro-concept problem walkthroughs." 
    },
    { 
      time: "10:30 AM – 11:00 AM", 
      title: "Nutrition Break, Hydration & Mind Refresh", 
      tag: "Break", 
      icon: "Coffee",
      desc: "Fresh fruit juice, hot tea/sprouts at campus canteen to prevent mental fatigue." 
    },
    { 
      time: "11:00 AM – 01:30 PM", 
      title: "Mathematics / Biology Problem Drills & Speed Traps", 
      tag: "Core Lecture 2", 
      icon: "Zap",
      desc: "High-intensity calculation speed drills, alternate solution methods, and past 10-year trap questions." 
    },
    { 
      time: "01:30 PM – 02:30 PM", 
      title: "Hostel Lunch & Power Rest Period", 
      tag: "Lunch & Rest", 
      icon: "Utensils",
      desc: "Hygienic FSSAI dining followed by a mandatory 20-minute power nap before afternoon labs." 
    },
    { 
      time: "02:30 PM – 05:30 PM", 
      title: "Daily Practice Problem (DPP) Lab & 1-on-1 Faculty Doubt Desks", 
      tag: "Doubt Clearing Desk", 
      icon: "Sparkles",
      isHighlight: true,
      desc: "⭐ The Kota Differentiator: Full-time faculty sit face-to-face across desks to clear every pending question line-by-line." 
    },
    { 
      time: "05:30 PM – 08:00 PM", 
      title: "Supervised Library Revision & Mock OMR Practice", 
      tag: "Self Study", 
      icon: "BookOpen",
      desc: "Silent AC study cubes with proctored OMR bubble sheet practice under exam timing." 
    },
    { 
      time: "08:30 PM", 
      title: "Hostel Biometric In-Curfew & Parent Attendance SMS Dispatch", 
      tag: "Security Curfew", 
      icon: "Moon",
      desc: "Warden biometric check-in. Automated confirmation SMS dispatched immediately to registered parents." 
    }
  ];

  // 3-Phase Academic Curriculum
  const academicPhases = [
    {
      phase: "Phase 1: Concept Foundation & NCERT Deep Dive",
      duration: "Months 1 to 5",
      topics: "Micro-concept fundamentals, daily 25-question DPPs, and chapter-wise baseline diagnostics.",
      objective: "100% conceptual mastery with zero doubt backlog."
    },
    {
      phase: "Phase 2: Advanced Integration & Multi-Concept Drills",
      duration: "Months 6 to 9",
      topics: "Olympiad level questions, previous 15-year archive practice, and Board exam synchronization.",
      objective: "Speed, accuracy, and elimination of negative marking habits."
    },
    {
      phase: "Phase 3: Rank Booster CBT Test Series & Error Rectification",
      duration: "Months 10 to 12",
      topics: "Full-syllabus NTA-simulated CBT mocks, AI error log analysis, and rank-refinement crash review.",
      objective: "Exam temperament readiness and top 1% percentile conversion."
    }
  ];

  // Audited Study Materials Kit Inventory (Vibrant Bento Data)
  const studyMaterialsKit = [
    { 
      title: "28 Hardcopy Theory Modules", 
      stat: "28 Printed Modules",
      substat: "Level 1 to Adv. Graded",
      tag: "Hardcopy Kit",
      theme: "emerald",
      bgClass: "bg-emerald-500/5 hover:bg-emerald-500/10 border-emerald-500/25 hover:border-emerald-500/40",
      accentText: "text-emerald-700 dark:text-emerald-400",
      pillClass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-300/50",
      icon: BookOpen,
      desc: "Exhaustive theory booklets with graded problem sets (Level 1, Level 2, Advanced) and formula compendiums." 
    },
    { 
      title: "10,000+ Graded Question Bank", 
      stat: "10,000+ MCQs",
      substat: "Past 15-Yr Archives",
      tag: "Archive Bank",
      theme: "indigo",
      bgClass: "bg-indigo-500/5 hover:bg-indigo-500/10 border-indigo-500/25 hover:border-indigo-500/40",
      accentText: "text-indigo-700 dark:text-indigo-400",
      pillClass: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300 border-indigo-300/50",
      icon: Layers,
      desc: "Exhaustive question archive covering JEE & NEET with step-by-step video solutions and error traps." 
    },
    { 
      title: "Daily Practice Problem (DPP) Sets", 
      stat: "365 DPPs",
      substat: "Daily Faculty Evaluated",
      tag: "Daily Evaluation",
      theme: "amber",
      bgClass: "bg-amber-500/5 hover:bg-amber-500/10 border-amber-500/25 hover:border-amber-500/40",
      accentText: "text-amber-700 dark:text-amber-400",
      pillClass: "bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-300/50",
      icon: CheckSquare,
      desc: "Printed daily problem sheets checked and graded by faculty every afternoon with weak-topic tracking." 
    },
    { 
      title: "AI-Powered Mobile Practice App", 
      stat: "24x7 Digital App",
      substat: "Realtime Doubts & Reports",
      tag: "Parent Synced",
      theme: "purple",
      bgClass: "bg-purple-500/5 hover:bg-purple-500/10 border-purple-500/25 hover:border-purple-500/40",
      accentText: "text-purple-700 dark:text-purple-400",
      pillClass: "bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300 border-purple-300/50",
      icon: Smartphone,
      desc: "Real-time AI doubt camera scanner, formula flashcards, and live parent performance tracking dashboard." 
    }
  ];

  // Weekly FSSAI Grade-A Mess Diet Chart
  const weeklyMessDiet = [
    { meal: "Breakfast (07:00 AM - 08:00 AM)", items: "Poha, Sprouts, Boiled Eggs / Paneer Cutlet, Fresh Milk / Tea, Banana / Seasonal Fruit" },
    { meal: "Lunch (01:30 PM - 02:30 PM)", items: "Paneer Butter Masala / Dal Tadka, Seasonal Green Veg, Steamed Rice, Tawa Rotis, Fresh Curd & Green Salad" },
    { meal: "Evening Snacks (05:00 PM - 05:45 PM)", items: "Roasted Chana / Vegetable Upma / Sandwich, Lemonade / Hot Tea" },
    { meal: "Dinner (08:00 PM - 09:30 PM)", items: "Dal Makhani / Rajma, Mixed Veggie, Fresh Phulkas, Rice, Kheer / Fruit Custard (Alternate days)" }
  ];

  // Reviews Data
  const studentReviews = [
    {
      author: "Aditya Verma (Aspirant)",
      exam: "jee",
      batch: "Class 12th Dropper Batch",
      rating: 5,
      comment: "Doubt counters are genuinely active. Teachers sit till evening and explain every question in study sheets without rushing.",
      verifiedTag: "Enrolled Student (Verified Roll #2024)"
    },
    {
      author: "Dr. Rajesh Sharma (Parent)",
      exam: "parents",
      batch: "Parent of NEET-UG Aspirant",
      rating: 4.9,
      comment: "Hostel within walking distance saved a lot of travel fatigue for my daughter. Biometric SMS alert every evening gives total peace of mind.",
      verifiedTag: "Parent Audit (Verified Hostel Registration)"
    },
    {
      author: "Pooja Choudhary (Ex-Student)",
      exam: "jee",
      batch: "Two-Year JEE Classroom",
      rating: 4.7,
      comment: "Classroom batch size was strictly capped at 45 students. Physics and Chemistry faculty did not change mid-session, which was a huge blessing.",
      verifiedTag: "AIR 184 (JEE Advanced 2025)"
    },
    {
      author: "Sneha Reddy (NEET Aspirant)",
      exam: "neet",
      batch: "Target NEET Repeaters Batch",
      rating: 4.8,
      comment: "Weekly NCERT line-by-line bio tests and Sunday full syllabus CBT mocks helped me jump my score from 580 in mock 1 to 685 in final mock.",
      verifiedTag: "Enrolled Student (Class of 2025)"
    }
  ];

  const filteredReviews = reviewFilter === "all" 
    ? studentReviews 
    : studentReviews.filter(r => r.exam === reviewFilter);

  // In-Page Quick Navigation Items
  const quickNavItems = [
    { id: "sec-overview", num: "01", label: "Overview & Pedagogy", icon: FileText },
    { id: "sec-batches", num: "02", label: "Batches & Seats", icon: Calendar },
    { id: "sec-fees", num: "03", label: "Fees & Refund", icon: IndianRupee },
    { id: "sec-faculty", num: "04", label: "Faculty Stability", icon: Users },
    { id: "sec-hostels", num: "05", label: "Hostels & Mess", icon: Building2 },
    { id: "sec-rankers", num: "06", label: "Verified Rankers", icon: Trophy },
    { id: "sec-reviews", num: "07", label: "Student Audits", icon: MessageSquare }
  ];

  return (
    <div className="relative min-h-screen bg-background text-textMain selection:bg-brand-500/20 selection:text-brand-900">
      
      {/* 0. HIGH-END PAGE ENTRANCE GLOW LASER BEAM */}
      <motion.div
        initial={{ scaleX: 0, opacity: 1 }}
        animate={{ scaleX: 1, opacity: [1, 1, 0] }}
        transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-500 via-gold-400 to-brand-500 origin-left z-50 pointer-events-none shadow-[0_0_12px_rgba(16,185,129,0.8)]"
      />

      {/* 0.1 PAGE WRAPPER WITH CINEMATIC ENTRANCE ANIMATION */}
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="pt-24 pb-28"
      >
        
        {/* 1. TOP BREADCRUMBS & ACTION HEADER */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-4">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.4 }}
            className="flex items-center justify-between text-xs font-semibold text-textMuted"
          >
            <div className="flex items-center gap-2">
              <Link to="/find-coaching" className="hover:text-brand-700 transition-colors flex items-center gap-1 font-bold group">
                <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
                <span>Back to Directory</span>
              </Link>
              <span>/</span>
              <span>{institute.location.split(",")[0]}</span>
              <span>/</span>
              <span className="text-textMain font-bold truncate max-w-[200px] sm:max-w-none">
                {institute.name}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50/80 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-95"
              >
                <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Share with Parents</span>
              </button>
              <button
                onClick={() => toggleShortlist(institute.id)}
                className={`p-1.5 sm:px-3 sm:py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
                  isShortlisted 
                    ? "bg-red-500 text-white border-red-500 shadow-sm" 
                    : "bg-surface border-border hover:border-red-300 text-textMain"
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${isShortlisted ? "fill-white" : ""}`} />
                <span className="hidden sm:inline">{isShortlisted ? "Shortlisted" : "Shortlist"}</span>
              </button>
            </div>
          </motion.div>
        </div>

        {/* 2. INSTITUTE PROFILE HERO (Interactive Background Launches Campus Photo Gallery) */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="bg-surface border border-border rounded-3xl overflow-hidden shadow-card relative"
          >
            
            {/* Cover Photo with Dark Gradient & Direct Click to Open Gallery */}
            <div 
              onClick={() => setIsGalleryModalOpen(true)}
              className="h-72 sm:h-96 relative overflow-hidden bg-slate-950 group cursor-pointer"
              title="Click anywhere to explore all 8 campus facility photos"
            >
              <motion.img
                initial={{ scale: 1.08 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                src={institute.image}
                alt={institute.name}
                className="w-full h-full object-cover opacity-85 transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent"></div>

              {/* Verified Badge & Rating Header */}
              <div className="absolute top-3 left-3 right-3 sm:top-4 sm:left-4 sm:right-4 flex items-start justify-between gap-2 z-10">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 max-w-[70%] sm:max-w-none">
                  <span className="bg-brand-700 text-white text-[10px] sm:text-xs font-bold px-2.5 py-1 sm:px-3 sm:py-1 rounded-full flex items-center gap-1.5 shadow-md border border-brand-500/30 shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold-400 shrink-0" />
                    <ShinyText text="Verified Center" shimmerColor="rgba(255, 255, 255, 0.95)" speed={3.5} />
                  </span>
                  <span className="bg-black/60 backdrop-blur-md text-white text-[10px] sm:text-xs font-bold px-2.5 py-1 sm:px-3 sm:py-1 rounded-full border border-white/20 items-center gap-1.5 hidden xs:inline-flex">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                    <span>2026 Admissions Open</span>
                  </span>
                </div>

                {/* Rating Box */}
                <div className="bg-surface/95 backdrop-blur-md px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-2xl text-[11px] sm:text-xs font-extrabold text-textMain shadow-md flex items-center gap-1 sm:gap-1.5 border border-border shrink-0">
                  <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-500 fill-yellow-500 shrink-0" />
                  <span className="text-xs sm:text-sm">{institute.rating}</span>
                  <span className="text-textMuted font-normal hidden sm:inline">({institute.reviews} reviews)</span>
                </div>
              </div>

              {/* Center Hover Hint for Photo Gallery */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                <div className="bg-black/70 backdrop-blur-md border border-white/30 text-white text-xs font-extrabold px-5 py-2.5 rounded-full flex items-center gap-2 shadow-2xl">
                  <Camera className="w-4 h-4 text-emerald-400" />
                  <span>Click to Explore 8 Campus Facility Photos</span>
                </div>
              </div>

              {/* Bottom Title Bar & Gallery Trigger Button */}
              <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-white z-10">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-block bg-brand-500/30 backdrop-blur-md text-brand-200 text-xs font-bold px-2.5 py-0.5 rounded-md border border-brand-400/30">
                      {institute.type}
                    </span>
                    {institute.locality && (
                      <span className="inline-block bg-emerald-500/20 backdrop-blur-md text-emerald-200 text-xs font-semibold px-2.5 py-0.5 rounded-md border border-emerald-400/30">
                        📍 {institute.locality}
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight drop-shadow-sm">
                    {institute.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 mt-2">
                    <span className="flex items-center gap-1 font-semibold text-slate-200">
                      <MapPin className="w-3.5 h-3.5 text-brand-400" />
                      {institute.location}
                    </span>
                    <span>•</span>
                    <span>Audited Cap: <strong className="text-white">{institute.batchSize}</strong></span>
                    <span>•</span>
                    <span>Selection Rate: <strong className="text-white">{institute.selectionRate}</strong></span>
                    <span>•</span>
                    <span>Milestone: <strong className="text-gold-300">{institute.topRank}</strong></span>
                  </div>
                </div>

                {/* Hero Actions: View Campus Gallery + Head-to-Head Compare */}
                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsGalleryModalOpen(true);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-2xl flex items-center gap-2 transition-all cursor-pointer shadow-lg hover:scale-105 active:scale-95 border border-emerald-400/30"
                  >
                    <Images className="w-4 h-4 text-gold-300" />
                    <span>View Campus Photos (8)</span>
                  </button>

                  <Link
                    to={`/compare?ids=${institute.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/30 text-xs font-bold px-4 py-2.5 rounded-2xl flex items-center gap-2 transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Compare</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Key Metrics Strip (Under Photo) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border bg-surface border-t border-border">
              <div className="p-4 sm:p-5 text-center">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-textMuted block">
                  Audited Batch Limit
                </span>
                <span className="text-base sm:text-xl font-extrabold text-textMain mt-0.5 block">
                  {institute.batchSize}
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold flex items-center justify-center gap-1">
                  <CheckCheck className="w-3 h-3" /> Strict Classroom Cap
                </span>
              </div>
              
              <div className="p-4 sm:p-5 text-center">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-textMuted block">
                  Selection Ratio
                </span>
                <span className="text-base sm:text-xl font-extrabold text-brand-700 mt-0.5 block">
                  <CountUp to={parseFloat(institute.selectionRate)} decimals={1} suffix="%" duration={1.5} />
                </span>
                <span className="text-[10px] text-textMuted font-semibold">Qualified JEE / NEET</span>
              </div>

              <div className="p-4 sm:p-5 text-center">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-textMuted block">
                  Net Annual Tuition
                </span>
                <span className="text-base sm:text-xl font-extrabold text-textMain mt-0.5 block">
                  {institute.fees}
                </span>
                <span className="text-[10px] text-gold-600 font-semibold">Installment Option Available</span>
              </div>

              <div className="p-4 sm:p-5 text-center">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-textMuted block">
                  Hostel Proximity
                </span>
                <span className="text-base sm:text-xl font-extrabold text-textMain mt-0.5 block">
                  {institute.hostelDistance}
                </span>
                <span className="text-[10px] text-textMuted font-semibold">FSSAI Mess & Biometrics</span>
              </div>
            </div>

          </motion.div>
        </section>

        {/* 2.5 STICKY IN-PAGE QUICK-NAV BAR */}
        <div className="sticky top-[72px] sm:top-20 z-30 max-w-7xl mx-auto px-2 sm:px-6 mb-6 sm:mb-10">
          <div className="bg-surface/95 backdrop-blur-md border border-border rounded-2xl p-1 sm:p-1.5 shadow-md flex items-center justify-between gap-1 overflow-x-auto no-scrollbar scroll-smooth">
            <div className="flex items-center gap-1 sm:gap-1.5 min-w-max">
              {quickNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`relative flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                      isActive 
                        ? "text-brand-900 font-extrabold shadow-2xs" 
                        : "text-textMuted hover:text-textMain hover:bg-background/80"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="active_section_pill"
                        className="absolute inset-0 bg-brand-50 border border-brand-300 rounded-xl"
                        transition={{ type: "spring", stiffness: 450, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-1 sm:gap-1.5">
                      <span className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full text-[9px] flex items-center justify-center font-extrabold ${
                        isActive ? "bg-brand-700 text-white" : "bg-border text-textMuted"
                      }`}>
                        {item.num}
                      </span>
                      <Icon className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isActive ? "text-brand-600" : "text-textMuted"}`} />
                      <span>{item.label}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-border/80 text-[11px] text-textMuted font-semibold shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>Full Audit Dossier</span>
            </div>
          </div>
        </div>

        {/* 3. MAIN CONTINUOUS DOSSIER WITH PERSISTENT STICKY AUDIT SIDEBAR */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT 8 COLUMNS: ALL AUDIT SECTIONS SEQUENTIALLY WITH CLEAR HEADINGS */}
            <div className="lg:col-span-8 space-y-16">
              
              {/* SECTION 1: AUDITED OVERVIEW & PEDAGOGY */}
              <section id="sec-overview" className="scroll-mt-36 space-y-6">
                
                {/* Section Big Headline Banner */}
                <div className="flex items-center gap-3.5 pb-3 border-b-2 border-brand-500/30">
                  <div className="w-11 h-11 rounded-2xl bg-brand-700 text-white font-extrabold text-base flex items-center justify-center shadow-md shrink-0">
                    01
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-700 bg-brand-50 border border-brand-200 px-2.5 py-0.5 rounded-md">
                        Chapter 01 • Academic System
                      </span>
                      <span className="text-xs text-textMuted font-semibold">100% Syllabus Coverage Guarantee</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-textMain mt-1">
                      Academic Architecture & Pedagogy System
                    </h2>
                  </div>
                </div>

                {/* Academic Highlights & Summary */}
                <div className="bg-surface border border-border rounded-3xl p-6 sm:p-8 shadow-card space-y-4">
                  <h4 className="text-base font-extrabold text-textMain">Teaching Philosophy & Pedagogy</h4>
                  <p className="text-sm text-textMuted leading-relaxed">
                    {institute.description}
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="p-4 rounded-2xl bg-background border border-border space-y-1">
                      <span className="text-xs font-bold text-brand-700 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Doubt Resolution Architecture
                      </span>
                      <p className="text-xs text-textMuted">
                        {institute.doubtSupport}. Dedicated full-time faculty desk available every afternoon from 2:30 PM to 6:00 PM.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-background border border-border space-y-1">
                      <span className="text-xs font-bold text-brand-700 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Faculty Stability & Mentorship
                      </span>
                      <p className="text-xs text-textMuted">
                        {institute.facultyHighlights || "Senior Ex-IITian and Medical Doctor mentors"}. Average faculty tenure exceeds 8+ years.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3-Phase Academic Curriculum Milestone Roadmap */}
                <div className="bg-surface border border-border rounded-3xl p-6 sm:p-8 shadow-card space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-extrabold text-textMain">3-Phase Academic Curriculum Roadmap</h4>
                      <p className="text-xs text-textMuted mt-0.5">
                        Structured course delivery ensuring 100% syllabus coverage 3 months before final exams
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                      Audited Pedagogy
                    </span>
                  </div>

                  <div className="space-y-3 pt-2">
                    {academicPhases.map((phase, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-background border border-border space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <h5 className="font-extrabold text-sm text-textMain flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-brand-700 text-white text-[10px] flex items-center justify-center font-bold">
                              {idx + 1}
                            </span>
                            {phase.phase}
                          </h5>
                          <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-md border border-brand-200 shrink-0">
                            {phase.duration}
                          </span>
                        </div>
                        <p className="text-xs text-textMuted">{phase.topics}</p>
                        <div className="text-[11px] font-bold text-emerald-700 pt-1 flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-600" />
                          Objective: {phase.objective}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Study Materials & Modules Kit Inventory (Colored Bento Cards & Stat Chips) */}
                <div className="bg-surface border border-border rounded-3xl p-6 sm:p-8 shadow-card space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border/60">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-600 bg-brand-500/10 px-2.5 py-0.5 rounded-full border border-brand-500/20">
                          Complete Academic Kit
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          Included in Fees
                        </span>
                      </div>
                      <h4 className="text-lg font-extrabold text-textMain mt-1">Study Material & Academic Kits</h4>
                      <p className="text-xs text-textMuted mt-0.5">
                        Physical curriculum modules and digital question banks dispatched at enrollment
                      </p>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 bg-background px-3 py-2 rounded-2xl border border-border text-xs text-textMuted">
                      <BookOpen className="w-4 h-4 text-brand-600" />
                      <span className="font-bold text-textMain">4-Tier Resource Stack</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {studyMaterialsKit.map((item, idx) => {
                      const IconComponent = item.icon || BookOpen;
                      return (
                        <div 
                          key={idx} 
                          className={`relative group p-5 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${item.bgClass}`}
                        >
                          {/* Top stat callout row */}
                          <div className="flex items-center justify-between mb-3">
                            <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg border ${item.pillClass}`}>
                              {item.tag}
                            </span>
                            <div className="text-right">
                              <span className={`text-sm font-black tracking-tight ${item.accentText}`}>
                                {item.stat}
                              </span>
                              <span className="block text-[10px] text-textMuted font-medium">
                                {item.substat}
                              </span>
                            </div>
                          </div>

                          {/* Icon and title */}
                          <div className="flex items-start gap-3 mt-2">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                              item.theme === 'emerald' ? 'bg-emerald-600 text-white' :
                              item.theme === 'indigo' ? 'bg-indigo-600 text-white' :
                              item.theme === 'amber' ? 'bg-amber-600 text-white' :
                              'bg-purple-600 text-white'
                            }`}>
                              <IconComponent className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="font-extrabold text-sm text-textMain group-hover:text-brand-600 transition-colors">
                                {item.title}
                              </h5>
                              <p className="text-xs text-textMuted leading-relaxed mt-1">
                                {item.desc}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Student Daily Routine Timeline (Connected Vertical Timeline with Glowing Nodes) */}
                <div className="bg-surface border border-border rounded-3xl p-6 sm:p-8 shadow-card space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                          Structured Routine
                        </span>
                        <span className="text-[10px] font-bold text-textMuted bg-background px-2 py-0.5 rounded-full border border-border">
                          13.5 Hours Academic Immersion
                        </span>
                      </div>
                      <h4 className="text-lg font-extrabold text-textMain mt-1">A Day in the Life of an Aspirant</h4>
                      <p className="text-xs text-textMuted mt-0.5">
                        Disciplined, science-backed Kota routine followed strictly at {institute.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-brand-700 bg-brand-500/10 px-3 py-1.5 rounded-xl border border-brand-500/20 shrink-0 self-start sm:self-auto">
                      <Clock className="w-3.5 h-3.5 text-brand-600" />
                      <span>07:30 AM – 08:30 PM</span>
                    </div>
                  </div>

                  {/* Connected Vertical Timeline Track */}
                  <div className="relative pl-7 sm:pl-9 space-y-4 before:absolute before:left-[17px] sm:before:left-[21px] before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-amber-400 before:via-brand-500 before:to-slate-400">
                    {dailySchedule.map((slot, idx) => {
                      const isHighlight = slot.isHighlight;
                      const IconComponent = 
                        slot.icon === "Sun" ? Sun :
                        slot.icon === "Coffee" ? Coffee :
                        slot.icon === "Zap" ? Zap :
                        slot.icon === "Utensils" ? Utensils :
                        slot.icon === "Sparkles" ? Sparkles :
                        slot.icon === "Moon" ? Moon : BookOpen;

                      return (
                        <div key={idx} className="relative group">
                          {/* Glowing Timeline Node */}
                          <div className={`absolute -left-[27px] sm:-left-[31px] top-3.5 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                            isHighlight
                              ? "bg-amber-500 text-white shadow-lg shadow-amber-500/40 ring-4 ring-amber-500/20 scale-110 z-10"
                              : "bg-surface border-2 border-brand-500 text-brand-600 group-hover:scale-110 group-hover:border-brand-600 z-10"
                          }`}>
                            <IconComponent className="w-3 h-3" />
                          </div>

                          {/* Timeline Card */}
                          <div className={`p-4 rounded-2xl transition-all duration-200 ${
                            isHighlight
                              ? "bg-amber-50/95 border-2 border-amber-500 shadow-md ring-2 ring-amber-500/30"
                              : "bg-background border border-border/80 hover:border-brand-500/30 hover:bg-surface/80"
                          }`}>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-4">
                              <div className="flex items-center gap-2">
                                <span className={`text-xs font-black font-mono tracking-tight ${
                                  isHighlight ? "text-amber-950 font-extrabold" : "text-brand-700"
                                }`}>
                                  {slot.time}
                                </span>
                                {isHighlight && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-950 bg-amber-200 px-2.5 py-0.5 rounded-full border border-amber-400">
                                    <Sparkles className="w-2.5 h-2.5 text-amber-700" />
                                    Golden Hour
                                  </span>
                                )}
                              </div>
                              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-md border shrink-0 w-fit ${
                                isHighlight 
                                  ? "bg-amber-200 text-amber-950 border-amber-400"
                                  : "text-textMuted bg-surface border-border"
                              }`}>
                                {slot.tag}
                              </span>
                            </div>

                            <h5 className={`font-black text-sm sm:text-base mt-2 ${
                              isHighlight ? "text-slate-950" : "text-textMain"
                            }`}>
                              {slot.title}
                            </h5>

                            <p className={`text-xs leading-relaxed mt-1.5 ${
                              isHighlight ? "text-slate-800 font-semibold" : "text-textMuted"
                            }`}>
                              {slot.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </section>

              {/* SECTION 2: 2026 BATCH SCHEDULES & SEATS */}
              <section id="sec-batches" className="scroll-mt-36 space-y-6">
                
                {/* Section Big Headline Banner */}
                <div className="flex items-center gap-3.5 pb-3 border-b-2 border-amber-500/40">
                  <div className="w-11 h-11 rounded-2xl bg-amber-600 text-white font-extrabold text-base flex items-center justify-center shadow-md shrink-0">
                    02
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-md">
                        Chapter 02 • Real-Time Admissions
                      </span>
                      <span className="text-xs text-textMuted font-semibold">Strict 45-Student Cap</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-textMain mt-1">
                      Upcoming 2026 Batches & Live Seat Urgency
                    </h2>
                  </div>
                </div>

                <div className="bg-surface border border-border rounded-3xl p-6 sm:p-8 shadow-card space-y-6">
                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <div>
                      <h4 className="text-base font-extrabold text-textMain">Active Batches Open for Enrollment</h4>
                      <p className="text-xs text-textMuted mt-0.5">
                        Start dates, classroom timings & real-time seat availability
                      </p>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                      ✓ Verified Schedules
                    </span>
                  </div>

                  <div className="space-y-4">
                    {upcomingBatches.map((batch, idx) => (
                      <div
                        key={idx}
                        className="p-5 rounded-2xl bg-background border border-border space-y-3 relative overflow-hidden"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h5 className="font-extrabold text-base text-textMain">{batch.name}</h5>
                              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${batch.badgeColor}`}>
                                {batch.seatsLeft}
                              </span>
                            </div>
                            <div className="text-xs text-textMuted flex items-center gap-3">
                              <span className="font-semibold text-brand-700">{batch.target}</span>
                              <span>•</span>
                              <span>{batch.exam}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              setLockTargetBatch(batch.name);
                              setIsSeatLockModalOpen(true);
                            }}
                            className="btn-primary py-2 px-4 text-xs font-bold shrink-0 cursor-pointer shadow-sm active:scale-95"
                          >
                            Reserve Seat
                          </button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs border-t border-border/80">
                          <div>
                            <span className="text-[10px] text-textMuted font-bold uppercase block">Start Date:</span>
                            <span className="font-bold text-textMain">{batch.startDate}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-textMuted font-bold uppercase block">Timings:</span>
                            <span className="font-bold text-textMain">{batch.timings}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-textMuted font-bold uppercase block">Audited Cap:</span>
                            <span className="font-bold text-textMain">{batch.auditedLimit}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Diagnostic Admission Test & Scholarship Cutoff Details */}
                <div className="bg-surface border border-border rounded-3xl p-6 sm:p-8 shadow-card space-y-4">
                  <h4 className="text-base font-extrabold text-textMain flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-brand-600" />
                    Admission Diagnostic Test & Scholarship Slabs
                  </h4>
                  <p className="text-xs text-textMuted">
                    Students can appear for the center admission diagnostic exam to avail up to 90% tuition fee waiver.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
                    <div className="p-3.5 rounded-2xl bg-background border border-border space-y-1">
                      <span className="text-[10px] text-textMuted font-bold uppercase block">Next Test Date:</span>
                      <span className="font-extrabold text-brand-800 text-sm">26 April 2026</span>
                      <span className="text-[10px] text-textMuted block">Online CBT or Offline at Center</span>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-background border border-border space-y-1">
                      <span className="text-[10px] text-textMuted font-bold uppercase block">Test Syllabus:</span>
                      <span className="font-extrabold text-textMain text-sm">Class 10th / 11th</span>
                      <span className="text-[10px] text-textMuted block">Science, Maths & Mental Ability</span>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-background border border-border space-y-1">
                      <span className="text-[10px] text-textMuted font-bold uppercase block">Top Slab Waiver:</span>
                      <span className="font-extrabold text-emerald-700 text-sm">Up to 90% Waiver</span>
                      <span className="text-[10px] text-textMuted block">Score above 95th Percentile</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* SECTION 3: FEES, INSTALLMENTS & LEGAL REFUND */}
              <section id="sec-fees" className="scroll-mt-36 space-y-6">
                
                {/* Section Big Headline Banner */}
                <div className="flex items-center gap-3.5 pb-3 border-b-2 border-emerald-500/40">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-700 text-white font-extrabold text-base flex items-center justify-center shadow-md shrink-0">
                    03
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md">
                        Chapter 03 • Financial Transparency
                      </span>
                      <span className="text-xs text-textMuted font-semibold">Zero Hidden Charges Audited</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-textMain mt-1">
                      Transparent Fee Schedules & Legal Refund Protection
                    </h2>
                  </div>
                </div>

                <div className="bg-surface border border-border rounded-3xl p-6 sm:p-8 shadow-card space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
                    <div>
                      <h4 className="text-base font-extrabold text-textMain">Itemized Net Annual Tuition</h4>
                      <p className="text-xs text-textMuted mt-0.5">
                        Breakdown verified by FutureSelector field auditors
                      </p>
                    </div>

                    {/* Installment / Lum Sum Switcher */}
                    <div className="flex items-center border border-border rounded-xl p-0.5 bg-background text-xs font-bold shrink-0">
                      <button
                        onClick={() => setActiveInstallmentView("lum-sum")}
                        className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                          activeInstallmentView === "lum-sum"
                            ? "bg-surface shadow-2xs text-brand-900 font-extrabold"
                            : "text-textMuted"
                        }`}
                      >
                        Lum-Sum
                      </button>
                      <button
                        onClick={() => setActiveInstallmentView("installments")}
                        className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                          activeInstallmentView === "installments"
                            ? "bg-surface shadow-2xs text-brand-900 font-extrabold"
                            : "text-textMuted"
                        }`}
                      >
                        3-Part Installments
                      </button>
                    </div>
                  </div>

                  {activeInstallmentView === "lum-sum" ? (
                    <div className="space-y-3">
                      {[
                        { title: "Classroom Tuition & Live Lectures", amount: `₹${(institute.numericFee * 0.75).toLocaleString("en-IN")}` },
                        { title: "National Study Material & Modules Kit", amount: `₹${(institute.numericFee * 0.15).toLocaleString("en-IN")}` },
                        { title: "All India Computer Based Test (CBT) Series", amount: `₹${(institute.numericFee * 0.10).toLocaleString("en-IN")}` },
                        { title: "Applicable Taxes (GST 18%)", amount: "Included / As per Govt Norms" }
                      ].map((row, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3.5 rounded-2xl bg-background border border-border text-xs">
                          <span className="font-semibold text-textMain">{row.title}</span>
                          <span className="font-extrabold text-brand-800">{row.amount}</span>
                        </div>
                      ))}

                      <div className="flex items-center justify-between p-4 rounded-2xl bg-brand-50 border border-brand-200 text-sm font-extrabold">
                        <span className="text-brand-900">Total Net Annual Fee:</span>
                        <span className="text-base text-brand-800">{institute.fees}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {[
                        { inst: "Installment 1 (At Admission)", amount: `₹${(institute.numericFee * 0.5).toLocaleString("en-IN")}`, note: "Includes study material & admission kit" },
                        { inst: "Installment 2 (After 60 Days)", amount: `₹${(institute.numericFee * 0.3).toLocaleString("en-IN")}`, note: "Classroom tuition & phase 2 modules" },
                        { inst: "Installment 3 (After 120 Days)", amount: `₹${(institute.numericFee * 0.2).toLocaleString("en-IN")}`, note: "Final test series & revision phase" }
                      ].map((row, idx) => (
                        <div key={idx} className="p-4 rounded-2xl bg-background border border-border text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-textMain">{row.inst}</span>
                            <span className="font-extrabold text-brand-800 text-sm">{row.amount}</span>
                          </div>
                          <span className="text-[11px] text-textMuted block">{row.note}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Scholarship Waiver Box */}
                  <div className="p-4 rounded-2xl bg-gold-50/60 border border-gold-200/80 flex items-start gap-3">
                    <Award className="w-5 h-5 text-gold-600 shrink-0 mt-0.5" />
                    <div className="text-xs space-y-1">
                      <h5 className="font-extrabold text-slate-900">Board Exam & National Scholarship Slabs</h5>
                      <p className="text-textMuted leading-relaxed">
                        Direct tuition waivers up to 40% for students scoring above 95% in Class 10th/12th Boards, or up to 90% via institute diagnostic entrance tests.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Supreme Court & Consumer Protection Refund Policy Audit */}
                <div className="bg-surface border border-border rounded-3xl p-6 sm:p-8 shadow-card space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-extrabold text-textMain flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                      Legal Fee Refund Compliance Audit
                    </h4>
                    <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      100% Policy Compliant
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 rounded-2xl bg-background border border-border space-y-1">
                      <span className="font-bold text-textMain block">100% Refund (within 15 Days)</span>
                      <p className="text-textMuted leading-relaxed text-[11px]">
                        Full tuition refund within 15 calendar days of batch start (less token ₹2,500 registration charge).
                      </p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-background border border-border space-y-1">
                      <span className="font-bold text-textMain block">80% Refund (within 30 Days)</span>
                      <p className="text-textMuted leading-relaxed text-[11px]">
                        80% refund of unutilized course fee between 16 to 30 days of classroom attendance.
                      </p>
                    </div>
                  </div>

                  <p className="text-[11px] text-textMuted flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                    FutureSelector provides free grievance escalation for parents facing refund delays at partner centers.
                  </p>
                </div>

                {/* FUTURESELECTOR VALUE PROPOSITION: DIRECT VS BOOKING VIA FS */}
                <div className="bg-gradient-to-br from-surface via-surface to-brand-500/5 border-2 border-brand-500/30 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 relative overflow-hidden">
                  {/* Subtle decorative glow */}
                  <div className="absolute top-0 right-0 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/80 relative z-10">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-brand-700 bg-brand-500/15 px-2.5 py-0.5 rounded-full border border-brand-500/30">
                          Why FutureSelector Matters
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          100% Free Parent Protection
                        </span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black text-textMain mt-1.5">
                        Direct Center Walk-In vs. Booking via FutureSelector
                      </h3>
                      <p className="text-xs text-textMuted mt-0.5">
                        Coaching centers won't tell you this, but booking through FutureSelector gives you legal & financial immunity.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-2 rounded-2xl shrink-0 self-start sm:self-auto">
                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                      <div>
                        <div className="text-[11px] font-black text-emerald-900 leading-tight">FS Escrow Protection</div>
                        <div className="text-[9px] text-emerald-700 font-semibold">Zero Commission from Parents</div>
                      </div>
                    </div>
                  </div>

                  {/* 2-Column Comparison Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10">
                    
                    {/* Left: Direct Center Walk-in */}
                    <div className="p-5 sm:p-6 rounded-2xl bg-background/80 border border-border space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-border">
                        <div>
                          <div className="text-xs font-bold text-textMuted uppercase tracking-wider">Option 1</div>
                          <h4 className="font-extrabold text-base text-textMain">Direct Center Walk-In</h4>
                        </div>
                        <span className="text-[11px] font-bold text-rose-700 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-lg">
                          High Risk • Full MRP
                        </span>
                      </div>

                      <div className="space-y-3 text-xs">
                        <div className="flex items-start gap-2.5 text-textMuted">
                          <X className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-textMain block">Full MRP Fee Charged:</span>
                            <span>Centers rarely give fee concessions to individual walk-in parents.</span>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5 text-textMuted">
                          <X className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-textMain block">Tedious Refund Process:</span>
                            <span>If child cannot cope in 15 days, centers delay refund checks for months.</span>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5 text-textMuted">
                          <X className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-textMain block">Overflow Batch Risk:</span>
                            <span>No batch size limit guarantee; easily pushed into 70-100 student back benches.</span>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5 text-textMuted">
                          <X className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-textMain block">Zero Neutral Grievance Officer:</span>
                            <span>Parents have to personally fight center admin desks with no third-party backing.</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Booking via FutureSelector */}
                    <div className="p-5 sm:p-6 rounded-2xl bg-brand-500/5 border-2 border-brand-500/40 shadow-lg space-y-4 relative">
                      <div className="absolute -top-3 right-6 bg-gradient-to-r from-brand-600 to-brand-700 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                        ⭐ Recommended for All Aspirants
                      </div>

                      <div className="flex items-center justify-between pb-3 border-brand-500/20 border-b">
                        <div>
                          <div className="text-xs font-bold text-brand-700 uppercase tracking-wider">Option 2</div>
                          <h4 className="font-extrabold text-base text-brand-950 dark:text-white flex items-center gap-1.5">
                            Booking via FutureSelector
                          </h4>
                        </div>
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
                          Save ₹15,000 + Insured
                        </span>
                      </div>

                      <div className="space-y-3 text-xs">
                        <div className="flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-textMain block">Instant ₹15,000 Fee Waiver:</span>
                            <span className="text-textMuted">Direct deduction at counter using official voucher code <code className="font-mono font-bold text-brand-700 bg-brand-500/10 px-1 py-0.5 rounded">{couponCode}</code>.</span>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-textMain block">15-Day 100% Escrow Refund Guarantee:</span>
                            <span className="text-textMuted">FutureSelector Legal Escrow enforces Supreme Court compliance—zero fee deduction dispute.</span>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-textMain block">Audited 40-Student Batch Cap:</span>
                            <span className="text-textMuted">Guaranteed seat strictly in audited batch with active faculty doubt counters.</span>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-textMain block">Dedicated FS Student Mentor for 1 Year:</span>
                            <span className="text-textMuted">Neutral quarterly progress check-in & parent grievance escalation helpline.</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                        <button
                          onClick={() => {
                            setIsSeatLockModalOpen(true);
                          }}
                          className="w-full sm:w-auto flex-1 btn-primary py-2.5 px-4 text-xs font-bold justify-center cursor-pointer shadow-md active:scale-95 flex items-center gap-2"
                        >
                          <Sparkles className="w-4 h-4 text-gold-300" />
                          <span>Claim ₹15,000 Admission Voucher</span>
                        </button>
                        <button
                          onClick={() => {
                            const el = document.getElementById("profile-enquiry-form");
                            if (el) el.scrollIntoView({ behavior: "smooth" });
                          }}
                          className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-brand-500/30 bg-background text-brand-800 text-xs font-extrabold hover:bg-brand-500/10 transition-colors cursor-pointer text-center"
                        >
                          Book Free Advisor
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              </section>

              {/* SECTION 4: FACULTY STABILITY */}
              <section id="sec-faculty" className="scroll-mt-36 space-y-6">
                
                {/* Section Big Headline Banner */}
                <div className="flex items-center gap-3.5 pb-3 border-b-2 border-blue-500/40">
                  <div className="w-11 h-11 rounded-2xl bg-blue-700 text-white font-extrabold text-base flex items-center justify-center shadow-md shrink-0">
                    04
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-800 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-md">
                        Chapter 04 • Educator Retention
                      </span>
                      <span className="text-xs text-textMuted font-semibold">94.2% Stability Record</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-textMain mt-1">
                      Faculty Credentials & Stability Roster
                    </h2>
                  </div>
                </div>

                <div className="bg-surface border border-border rounded-3xl p-6 sm:p-8 shadow-card space-y-6">
                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <div>
                      <h4 className="text-base font-extrabold text-textMain">Permanent Subject HODs & Mentors</h4>
                      <p className="text-xs text-textMuted mt-0.5">
                        Audited faculty retention index — avoiding mid-session teacher departures
                      </p>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                      94.2% Retention Rate
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {facultyRoster.map((fac, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-background border border-border flex items-start gap-3.5">
                        <img
                          src={fac.avatar}
                          alt={fac.name}
                          className="w-12 h-12 rounded-xl object-cover ring-2 ring-brand-500/20 shrink-0"
                        />
                        <div className="space-y-1">
                          <span className="text-[11px] font-bold text-brand-700 block">{fac.subject}</span>
                          <div className="font-extrabold text-sm text-textMain">{fac.name}</div>
                          <span className="text-[11px] font-semibold text-textMuted block">{fac.degrees}</span>
                          <p className="text-[11px] text-emerald-700 font-semibold">{fac.highlight}</p>
                          <span className="text-[10px] text-textMuted block pt-0.5">Tenure: {fac.retention}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Teacher-to-Student Ratio & Doubt Counter Audit */}
                <div className="bg-surface border border-border rounded-3xl p-6 sm:p-8 shadow-card space-y-3">
                  <h4 className="text-base font-extrabold text-textMain">Teaching Ratio & Doubt Accessibility</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3.5 rounded-2xl bg-background border border-border text-center">
                      <span className="text-[10px] text-textMuted font-bold uppercase block">Faculty Ratio:</span>
                      <span className="text-lg font-extrabold text-brand-800">1 : 28</span>
                      <span className="text-[10px] text-textMuted block">Optimal classroom attention</span>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-background border border-border text-center">
                      <span className="text-[10px] text-textMuted font-bold uppercase block">Daily Doubt Hours:</span>
                      <span className="text-lg font-extrabold text-brand-800">3.5 Hours</span>
                      <span className="text-[10px] text-textMuted block">02:30 PM to 06:00 PM Daily</span>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-background border border-border text-center">
                      <span className="text-[10px] text-textMuted font-bold uppercase block">Teacher Mid-Drop:</span>
                      <span className="text-lg font-extrabold text-emerald-700">0 Reported</span>
                      <span className="text-[10px] text-textMuted block">Complete session commitment</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* SECTION 5: HOSTELS & LIVING */}
              <section id="sec-hostels" className="scroll-mt-36 space-y-6">
                
                {/* Section Big Headline Banner */}
                <div className="flex items-center gap-3.5 pb-3 border-b-2 border-purple-500/40">
                  <div className="w-11 h-11 rounded-2xl bg-purple-700 text-white font-extrabold text-base flex items-center justify-center shadow-md shrink-0">
                    05
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-800 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-md">
                        Chapter 05 • Accommodation & Nutrition
                      </span>
                      <span className="text-xs text-textMuted font-semibold">FSSAI Grade-A Certified</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-textMain mt-1">
                      Hostels, Security & FSSAI Mess Audit
                    </h2>
                  </div>
                </div>

                <div className="bg-surface border border-border rounded-3xl p-6 sm:p-8 shadow-card space-y-6">
                  <div className="border-b border-border/60 pb-3">
                    <h4 className="text-base font-extrabold text-textMain">Audited Living Quarters</h4>
                    <p className="text-xs text-textMuted mt-0.5">
                      Field-verified accommodations around {institute.locality || institute.location}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-4 rounded-2xl bg-background border border-border space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-textMain">
                        <MapPin className="w-4 h-4 text-brand-600" />
                        Distance to Classroom
                      </div>
                      <p className="text-brand-800 font-extrabold text-sm">{institute.hostelDistance}</p>
                      <span className="text-[10px] text-textMuted">Walking distance, zero travel fatigue</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-background border border-border space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-textMain">
                        <IndianRupee className="w-4 h-4 text-brand-600" />
                        Monthly Living Cost
                      </div>
                      <p className="text-textMain font-extrabold text-sm">₹9,000 – ₹14,000 / Mo</p>
                      <span className="text-[10px] text-textMuted">Includes AC room, mess food & laundry</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-background border border-border space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-textMain">
                        <Shield className="w-4 h-4 text-brand-600" />
                        Biometrics & Security
                      </div>
                      <p className="text-emerald-700 font-bold">24x7 Wardens & Parent SMS</p>
                      <span className="text-[10px] text-textMuted">Strict 8:30 PM curfew & daily attendance</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-background border border-border space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-textMain">
                        <Utensils className="w-4 h-4 text-brand-600" />
                        Mess Hygiene Standard
                      </div>
                      <p className="text-brand-800 font-bold">FSSAI Grade A Certified</p>
                      <span className="text-[10px] text-textMuted">4 meals daily: Breakfast, Lunch, Snacks, Dinner</span>
                    </div>
                  </div>
                </div>

                {/* FSSAI Mess Weekly Diet Chart */}
                <div className="bg-surface border border-border rounded-3xl p-6 sm:p-8 shadow-card space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-extrabold text-textMain flex items-center gap-2">
                      <Utensils className="w-5 h-5 text-brand-600" />
                      Weekly FSSAI Grade-A Mess Diet Schedule
                    </h4>
                    <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
                      Nutritional Audit
                    </span>
                  </div>

                  <div className="space-y-2.5 pt-1">
                    {weeklyMessDiet.map((slot, idx) => (
                      <div key={idx} className="p-3 rounded-2xl bg-background border border-border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <span className="font-bold text-brand-900 sm:w-48 shrink-0">{slot.meal}:</span>
                        <span className="text-textMuted text-[11px] flex-1">{slot.items}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* SECTION 6: VERIFIED RANKERS HALL OF FAME */}
              <section id="sec-rankers" className="scroll-mt-36 space-y-6">
                
                {/* Section Big Headline Banner */}
                <div className="flex items-center gap-3.5 pb-3 border-b-2 border-gold-500/50">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 text-slate-950 font-extrabold text-base flex items-center justify-center shadow-md shrink-0">
                    06
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-gold-800 bg-gold-50 border border-gold-200 px-2.5 py-0.5 rounded-md">
                        Chapter 06 • Authentic Merit
                      </span>
                      <span className="text-xs text-textMuted font-semibold">2-Year Classroom Enrolled</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-textMain mt-1">
                      Verified Rankers Hall of Fame
                    </h2>
                  </div>
                </div>

                <div className="bg-surface border border-border rounded-3xl p-6 sm:p-8 shadow-card space-y-6">
                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <div>
                      <h4 className="text-base font-extrabold text-textMain">Top Percentile Scorers (No Postal Claims)</h4>
                      <p className="text-xs text-textMuted mt-0.5">
                        Students from regular classroom batches authenticated by FutureSelector
                      </p>
                    </div>
                    <span className="text-xs font-bold text-gold-700 bg-gold-50 border border-gold-200 px-3 py-1 rounded-full">
                      AIR Authenticated
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {verifiedRankers.map((ranker, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-background border border-border text-center space-y-3 relative overflow-hidden group">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden mx-auto ring-2 ring-gold-400/40 relative">
                          <img
                            src={ranker.photo}
                            alt={ranker.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div>
                          <span className="text-sm font-extrabold text-gold-600 block">{ranker.rank}</span>
                          <h5 className="font-extrabold text-sm text-textMain">{ranker.name}</h5>
                          <span className="text-[11px] font-bold text-brand-700 block">{ranker.exam}</span>
                          <span className="text-[10px] text-textMuted block mt-0.5">{ranker.college}</span>
                        </div>
                        <div className="pt-2 border-t border-border text-[10px] space-y-0.5">
                          <span className="text-emerald-700 font-bold block">✓ {ranker.type}</span>
                          <span className="text-textMuted block font-mono">{ranker.roll}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 rounded-2xl bg-background border border-dashed border-border text-center text-xs text-textMuted">
                    FutureSelector independently cross-checks roll numbers with official NTA merit lists to eliminate inflated rank claims.
                  </div>
                </div>
              </section>

              {/* SECTION 7: STUDENT REVIEWS */}
              <section id="sec-reviews" className="scroll-mt-36 space-y-6">
                
                {/* Section Big Headline Banner */}
                <div className="flex items-center gap-3.5 pb-3 border-b-2 border-slate-400">
                  <div className="w-11 h-11 rounded-2xl bg-slate-800 text-white font-extrabold text-base flex items-center justify-center shadow-md shrink-0">
                    07
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-textMuted bg-surface border border-border px-2.5 py-0.5 rounded-md">
                        Chapter 07 • Ground Feedback
                      </span>
                      <span className="text-xs text-textMuted font-semibold">Parent & Aspirant Audits</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-textMain mt-1">
                      Audited Student & Parent Experiences
                    </h2>
                  </div>
                </div>

                <div className="bg-surface border border-border rounded-3xl p-6 sm:p-8 shadow-card space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
                    <div>
                      <h4 className="text-base font-extrabold text-textMain">Verified Student Reviews</h4>
                      <p className="text-xs text-textMuted mt-0.5">
                        Substantiated reviews without fake marketing testimonials
                      </p>
                    </div>

                    {/* Filter Chips */}
                    <div className="flex items-center gap-1.5 overflow-x-auto text-xs no-scrollbar">
                      {["all", "jee", "neet", "parents"].map((f) => (
                        <button
                          key={f}
                          onClick={() => setReviewFilter(f)}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer capitalize ${
                            reviewFilter === f
                              ? "bg-brand-700 text-white shadow-2xs"
                              : "bg-background border border-border text-textMuted hover:text-textMain"
                          }`}
                        >
                          {f === "all" ? "All Reviews" : f}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3.5">
                    {filteredReviews.map((rev, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-background border border-border space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-bold text-textMain block">{rev.author}</span>
                            <span className="text-[10px] text-emerald-700 font-semibold">{rev.verifiedTag}</span>
                          </div>
                          <span className="text-yellow-600 font-bold bg-yellow-500/10 px-2 py-0.5 rounded-md border border-yellow-500/20">
                            ★ {rev.rating}
                          </span>
                        </div>
                        <span className="text-[10px] text-textMuted block">{rev.batch}</span>
                        <p className="text-textMuted leading-relaxed pt-1">"{rev.comment}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* 4. INSTITUTE PARTNER PORTAL GATEWAY CARD */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-surface via-surface to-brand-50/40 border border-brand-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-5 text-xs">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-brand-700 text-white flex items-center justify-center shrink-0 shadow-md">
                    <Briefcase className="w-6 h-6 text-gold-300" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-extrabold text-sm text-textMain">Are you the Official Administrator of {institute.name}?</h5>
                      <span className="text-[10px] font-bold text-brand-800 bg-brand-100/70 border border-brand-300 px-2 py-0.5 rounded-md">
                        B2B Partner Suite
                      </span>
                    </div>
                    <p className="text-textMuted leading-relaxed">
                      FutureSelector allows verified coaching administrations to update upcoming batch seats, hostel wardens, and scholarship dates.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsPartnerModalOpen(true)}
                  className="btn-primary py-2.5 px-4 text-xs font-bold shrink-0 cursor-pointer shadow-sm hover:scale-[1.02] active:scale-95 flex items-center gap-2"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Preview Partner Panel</span>
                </button>
              </div>

            </div>

            {/* RIGHT 4 COLUMNS: PERSISTENT STICKY AUDIT SIDEBAR (NEVER RUNS OUT OF CONTENT!) */}
            <div className="lg:col-span-4 space-y-5 sticky top-24 self-start">
              
              {/* 1. ₹15,000 Fee Waiver Voucher Card */}
              <div className="bg-gradient-to-br from-brand-900 via-brand-950 to-slate-950 text-white rounded-3xl p-5 shadow-xl border border-gold-500/30 relative overflow-hidden">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-gold-400 bg-gold-400/10 px-2 py-0.5 rounded-md border border-gold-400/20">
                    FutureSelector Grant
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Guaranteed
                  </span>
                </div>

                <h4 className="text-lg font-extrabold text-white mb-0.5">
                  Save ₹15,000 on Admission
                </h4>
                <p className="text-[11px] text-slate-300 leading-relaxed mb-3">
                  Verified student admission code for {institute.name}.
                </p>

                {/* Coupon Box */}
                <div className="flex items-center justify-between bg-black/50 border border-gold-500/40 rounded-xl p-2.5 mb-3">
                  <span className="font-mono font-extrabold text-xs text-gold-300 tracking-wider">
                    {couponCode}
                  </span>
                  <button
                    onClick={handleCopyCoupon}
                    className="p-1 rounded-lg bg-gold-500/20 hover:bg-gold-500/30 text-gold-300 text-xs font-bold transition-colors cursor-pointer"
                    title="Copy coupon"
                  >
                    {copiedCoupon ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <button
                  onClick={() => setIsSeatLockModalOpen(true)}
                  className="w-full btn-primary py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer active:scale-95 mb-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-gold-300" />
                  <span>Lock Seat & Claim ₹15k Waiver</span>
                </button>

                <button
                  onClick={() => setIsShareModalOpen(true)}
                  className="w-full bg-[#25D366] hover:bg-[#20BD5A] text-white py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share with Parents on WhatsApp</span>
                </button>
              </div>

              {/* 2. LIVE AUDIT SCORECARD SUMMARY (High-Contrast Institutional Scorecard) */}
              <div className="bg-surface border border-border rounded-3xl p-5 shadow-card space-y-3.5">
                {/* Header with Verified Seal Badge */}
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-brand-500/10 text-brand-600 flex items-center justify-center shrink-0 border border-brand-500/20">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-extrabold text-xs text-textMain leading-tight">Institutional Audit</div>
                      <div className="text-[10px] text-textMuted font-medium">Verified by FS Ground Cell</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-800 dark:text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30 shadow-xs">
                      <Award className="w-3 h-3 text-emerald-600" />
                      98.4 / 100
                    </span>
                    <span className="block text-[9px] font-bold text-emerald-600 mt-0.5">Grade A+ Center</span>
                  </div>
                </div>

                {/* Scorecard items with high-contrast status chips */}
                <div className="space-y-2 text-xs">
                  {/* Batch Cap */}
                  <div className="flex items-center justify-between p-2.5 rounded-2xl bg-background border border-border/70 hover:border-brand-500/30 transition-all">
                    <div>
                      <span className="text-[11px] text-textMuted font-semibold block">Audited Batch Cap</span>
                      <span className="font-extrabold text-textMain text-xs">{institute.batchSize}</span>
                    </div>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
                      Strict Cap
                    </span>
                  </div>

                  {/* Selection Ratio */}
                  <div className="flex items-center justify-between p-2.5 rounded-2xl bg-background border border-border/70 hover:border-brand-500/30 transition-all">
                    <div>
                      <span className="text-[11px] text-textMuted font-semibold block">True Selection Ratio</span>
                      <span className="font-extrabold text-brand-700 text-xs">{institute.selectionRate}</span>
                    </div>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                      Top 5% India
                    </span>
                  </div>

                  {/* Faculty Retention */}
                  <div className="flex items-center justify-between p-2.5 rounded-2xl bg-background border border-border/70 hover:border-brand-500/30 transition-all">
                    <div>
                      <span className="text-[11px] text-textMuted font-semibold block">Faculty Retention Index</span>
                      <span className="font-extrabold text-emerald-700 text-xs">94.2%</span>
                    </div>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                      Zero Mid-Drop
                    </span>
                  </div>

                  {/* Hostel Distance */}
                  <div className="flex items-center justify-between p-2.5 rounded-2xl bg-background border border-border/70 hover:border-brand-500/30 transition-all">
                    <div>
                      <span className="text-[11px] text-textMuted font-semibold block">Hostel Proximity</span>
                      <span className="font-extrabold text-textMain text-xs">{institute.hostelDistance}</span>
                    </div>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
                      Inside Campus
                    </span>
                  </div>

                  {/* Mess Hygiene */}
                  <div className="flex items-center justify-between p-2.5 rounded-2xl bg-background border border-border/70 hover:border-brand-500/30 transition-all">
                    <div>
                      <span className="text-[11px] text-textMuted font-semibold block">Mess Hygiene Grade</span>
                      <span className="font-extrabold text-brand-800 dark:text-brand-300 text-xs">FSSAI Certified</span>
                    </div>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20">
                      Grade-A Audited
                    </span>
                  </div>

                  {/* Supreme Court Refund */}
                  <div className="flex items-center justify-between p-2.5 rounded-2xl bg-background border border-border/70 hover:border-brand-500/30 transition-all">
                    <div>
                      <span className="text-[11px] text-textMuted font-semibold block">Supreme Court Refund</span>
                      <span className="font-extrabold text-emerald-700 text-xs">100% (15 Days)</span>
                    </div>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                      Govt Compliant
                    </span>
                  </div>
                </div>

                {/* Audit Seal Micro-Footer */}
                <div className="pt-1 flex items-center justify-between text-[10px] text-textMuted border-t border-border/50">
                  <span className="flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Physical audit verified Oct 2024
                  </span>
                  <span className="font-mono text-[9px] text-brand-600 font-bold">FS-CERT-904</span>
                </div>
              </div>

              {/* 3. QUICK CHAPTER PROGRESS JUMP */}
              <div className="bg-surface border border-border rounded-3xl p-5 shadow-card space-y-2.5">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-textMuted block">
                  Dossier Chapters
                </span>
                <div className="space-y-1 text-xs">
                  {quickNavItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className={`w-full flex items-center justify-between p-1.5 px-2.5 rounded-xl transition-all text-left cursor-pointer ${
                        activeSection === item.id 
                          ? "bg-brand-50 text-brand-900 font-extrabold border border-brand-200" 
                          : "text-textMuted hover:text-textMain hover:bg-background"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-brand-600 font-bold">{item.num}</span>
                        <span className="text-xs">{item.label}</span>
                      </span>
                      <ChevronRight className="w-3 h-3 text-textMuted" />
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. B2B PARTNER ACCESS CARD FOR DIRECTORS */}
              <div className="bg-gradient-to-br from-surface to-brand-500/5 border border-brand-500/30 rounded-3xl p-5 shadow-card space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-brand-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-700 bg-brand-500/10 px-2 py-0.5 rounded-md border border-brand-500/20">
                      Institute Director Portal
                    </span>
                    <h5 className="font-extrabold text-xs text-textMain mt-0.5">Are you the Center Head?</h5>
                  </div>
                </div>

                <p className="text-[11px] text-textMuted leading-relaxed">
                  Claim this profile to update upcoming batch seats, manage direct student applications, and access the FS Institutional CRM.
                </p>

                <button
                  onClick={() => setIsPartnerModalOpen(true)}
                  className="w-full bg-brand-50 hover:bg-brand-100 border border-brand-200 text-brand-900 py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-xs"
                >
                  <Unlock className="w-3.5 h-3.5 text-brand-600" />
                  <span>Claim Listing & Open Partner Suite</span>
                </button>
              </div>

              {/* 5. VIP ON-GROUND KOTA PARENT ESCORT TOUR */}
              <div className="bg-gradient-to-br from-amber-500/10 via-surface to-surface border border-amber-500/30 rounded-3xl p-5 shadow-card space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 bg-amber-500/15 px-2 py-0.5 rounded-md border border-amber-500/30">
                    VIP Ground Assistance
                  </span>
                  <span className="text-xs font-black text-amber-800 font-mono">₹999 Only</span>
                </div>

                <div>
                  <h5 className="font-extrabold text-xs text-textMain">Kota Parent Escort & Campus Tour</h5>
                  <p className="text-[11px] text-textMuted mt-1 leading-relaxed">
                    Visiting Kota with your child? An independent FS Education Auditor will escort you, inspect hostel food & safety, and ensure unbiased batch enrollment.
                  </p>
                </div>

                <div className="space-y-1 text-[11px] text-textMain font-medium">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Station pickup & guided hostel inspection</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>100% Fee refundable upon coaching admission</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const el = document.getElementById("profile-enquiry-form");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Book FS On-Ground Counselor</span>
                </button>
              </div>

              {/* 6. Instant Free Callback Form */}
              <div id="profile-enquiry-form" className="bg-surface border border-border rounded-3xl p-5 shadow-card space-y-3 scroll-mt-28">
                <div className="flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-brand-600" />
                  <h5 className="font-extrabold text-sm text-textMain">Request Free Guidance Call</h5>
                </div>
                <p className="text-[11px] text-textMuted leading-relaxed">
                  Connect with our senior advisor for genuine fee concession and batch allotment.
                </p>

                {enquirySubmitted ? (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                    <div className="text-xs font-bold text-emerald-900">Enquiry Received!</div>
                    <p className="text-[10px] text-textMuted">An advisor will call you within 24 hours.</p>
                  </div>
                ) : (
                  <form onSubmit={handleEnquirySubmit} className="space-y-2.5">
                    <input
                      type="text"
                      required
                      placeholder="Student / Parent Name"
                      defaultValue={user?.name || ""}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-semibold text-textMain placeholder:text-textMuted focus:outline-none focus:border-brand-600"
                    />
                    <input
                      type="tel"
                      required
                      placeholder="10-digit Mobile Number"
                      defaultValue={user?.phone || ""}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-semibold text-textMain placeholder:text-textMuted focus:outline-none focus:border-brand-600"
                    />
                    <select className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-bold text-textMain focus:outline-none focus:border-brand-600">
                      <option>Target: 2026 JEE Advanced</option>
                      <option>Target: 2026 NEET-UG</option>
                      <option>Target: Class 11th Program</option>
                      <option>Target: Class 12th Dropper Batch</option>
                    </select>
                    <button
                      type="submit"
                      className="w-full btn-primary py-2.5 text-xs font-bold justify-center cursor-pointer shadow-sm active:scale-95"
                    >
                      Get Free Advisor Call
                    </button>
                  </form>
                )}
              </div>

            </div>

          </div>
        </div>

      </motion.div>

      {/* 5. FULLSCREEN CAMPUS PHOTO GALLERY MODAL (Opened from Background Image) */}
      <AnimatePresence>
        {isGalleryModalOpen && (
          <div
            onClick={() => setIsGalleryModalOpen(false)}
            className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-lg flex items-center justify-center p-3 sm:p-6"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface rounded-3xl overflow-hidden max-w-5xl w-full border border-border shadow-2xl flex flex-col max-h-[92vh]"
            >
              
              {/* Gallery Header Bar */}
              <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between gap-4 shrink-0 bg-background/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-brand-700 text-white flex items-center justify-center font-bold shadow-md">
                    <Camera className="w-5 h-5 text-gold-300" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-base sm:text-lg text-textMain">
                        {institute.name} — Campus Infrastructure
                      </h3>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md hidden sm:inline">
                        Verified Facility Photos
                      </span>
                    </div>
                    <p className="text-xs text-textMuted">
                      Photo {selectedPhotoIdx + 1} of {filteredGalleryPhotos.length} • {currentPhoto?.locationTag}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsGalleryModalOpen(false)}
                    className="w-9 h-9 rounded-xl border border-border hover:bg-background text-textMuted hover:text-textMain flex items-center justify-center transition-colors cursor-pointer"
                    title="Close Gallery (Esc)"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Category Filter Chips Bar */}
              <div className="px-4 py-2.5 border-b border-border/80 bg-background/30 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                {[
                  { key: "all", label: "All Photos (8)" },
                  { key: "classrooms", label: "Classrooms & Labs" },
                  { key: "doubts", label: "Doubt Desks" },
                  { key: "library", label: "Library & CBT Lab" },
                  { key: "hostels", label: "Hostels & Living" },
                  { key: "mess", label: "Dining & Mess" }
                ].map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => {
                      setActiveGalleryCategory(cat.key);
                      setSelectedPhotoIdx(0);
                    }}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      activeGalleryCategory === cat.key
                        ? "bg-brand-700 text-white shadow-2xs"
                        : "bg-surface border border-border text-textMuted hover:text-textMain"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Main Photo Viewer Stage */}
              <div className="relative flex-1 min-h-[300px] sm:min-h-[460px] bg-slate-950 flex items-center justify-center overflow-hidden group">
                <img
                  src={currentPhoto?.url}
                  alt={currentPhoto?.title}
                  className="w-full h-full object-contain max-h-[55vh] select-none"
                />

                {/* Left / Right Carousel Controls */}
                <button
                  onClick={handlePrevPhoto}
                  className="absolute left-3 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md flex items-center justify-center border border-white/20 transition-all cursor-pointer shadow-lg active:scale-90"
                  title="Previous Photo (Left Arrow)"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <button
                  onClick={handleNextPhoto}
                  className="absolute right-3 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md flex items-center justify-center border border-white/20 transition-all cursor-pointer shadow-lg active:scale-90"
                  title="Next Photo (Right Arrow)"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Audit Badge Floating on Photo */}
                <div className="absolute top-4 left-4 z-10">
                  <span className="bg-brand-700/90 backdrop-blur-md text-white text-xs font-extrabold px-3 py-1.5 rounded-full border border-brand-400/40 shadow-md flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-gold-300" />
                    <span>{currentPhoto?.auditBadge}</span>
                  </span>
                </div>
              </div>

              {/* Photo Caption & Info Box */}
              <div className="p-4 sm:p-5 bg-surface border-t border-border shrink-0 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h4 className="font-extrabold text-base text-textMain flex items-center gap-2">
                    {currentPhoto?.title}
                  </h4>
                  <span className="text-[11px] font-semibold text-brand-700 bg-brand-50 border border-brand-200 px-2.5 py-0.5 rounded-md self-start sm:self-auto">
                    {currentPhoto?.categoryLabel}
                  </span>
                </div>
                <p className="text-xs text-textMuted leading-relaxed">
                  {currentPhoto?.desc}
                </p>

                {/* Thumbnail Strip Below */}
                <div className="pt-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
                  {filteredGalleryPhotos.map((photo, idx) => (
                    <button
                      key={photo.id}
                      onClick={() => setSelectedPhotoIdx(idx)}
                      className={`w-14 h-12 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                        selectedPhotoIdx === idx
                          ? "border-brand-600 scale-105 shadow-md ring-2 ring-brand-400/30"
                          : "border-border opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img src={photo.url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. INSTITUTE PARTNER ACCESS PREVIEW & CLAIM MODAL */}
      <AnimatePresence>
        {isPartnerModalOpen && (
          <div
            onClick={() => setIsPartnerModalOpen(false)}
            className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface rounded-3xl border border-border shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-5 my-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-brand-700 text-white flex items-center justify-center font-bold">
                    <Briefcase className="w-5 h-5 text-gold-300" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg text-textMain">FutureSelector Institute Partner Suite</h3>
                    <p className="text-xs text-textMuted">Official Administrator Access Preview for {institute.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsPartnerModalOpen(false)}
                  className="text-textMuted hover:text-textMain p-1.5 rounded-lg border border-border text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Two Column Feature Comparison */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                
                {/* Editable Features */}
                <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-2.5">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                    <Unlock className="w-4 h-4 text-emerald-600" />
                    <span>Editable via Institute Panel</span>
                  </div>
                  <ul className="space-y-1.5 text-textMuted text-[11px]">
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Update Upcoming 2026 Batch Dates</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Live Seat Counters ("Only 5 Seats Left")</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Hostel Warden & Direct Helpline Phones</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Announce Open-House Demo Sessions</span>
                    </li>
                  </ul>
                </div>

                {/* Locked Audited Features */}
                <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-2.5">
                  <div className="flex items-center gap-1.5 font-bold text-amber-800">
                    <Lock className="w-4 h-4 text-amber-600" />
                    <span>Permanently Locked & Audited</span>
                  </div>
                  <ul className="space-y-1.5 text-textMuted text-[11px]">
                    <li className="flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Classroom Batch Size Cap (On-site visit)</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Selection Ratio & Classroom Rankers</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Student & Parent Reviews (Un-editable)</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Statutory Refund Compliance Grade</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Claim Listing Form */}
              {claimSubmitted ? (
                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <h4 className="font-bold text-sm text-emerald-900">Partner Access Request #FS-ADM-2026 Received!</h4>
                  <p className="text-xs text-textMuted">Our Institutional Verification Team will verify your email domain and contact your center head within 4 hours.</p>
                  <button
                    onClick={() => {
                      setIsPartnerModalOpen(false);
                      setClaimSubmitted(false);
                    }}
                    className="btn-primary py-2 px-5 text-xs font-bold mt-2"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleClaimSubmit} className="space-y-3 text-xs pt-2 border-t border-border">
                  <h4 className="font-bold text-textMain text-sm">Request Director / Center Head Credentials</h4>
                  <p className="text-textMuted text-[11px]">
                    Please provide official institutional contact details to verify authorization.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-textMuted block mb-1">Director / Officer Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Dr. Rajesh K. Sharma"
                        className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 font-semibold text-textMain focus:outline-none focus:border-brand-600"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-textMuted block mb-1">Institutional Work Email</label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. director@center.edu.in"
                        className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 font-semibold text-textMain focus:outline-none focus:border-brand-600"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="font-bold text-textMuted block mb-1">Official Mobile / Landline</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 Contact number with extension"
                      className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 font-semibold text-textMain focus:outline-none focus:border-brand-600"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full btn-primary py-3 text-xs font-bold justify-center cursor-pointer mt-1 shadow-sm"
                  >
                    Submit Verification & Request Access
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Share With Parents Modal */}
      {isShareModalOpen && (
        <ShareWithParentsModal
          institute={institute}
          onClose={() => setIsShareModalOpen(false)}
        />
      )}

      {/* Auth Modal */}
      {authModal.isOpen && (
        <AuthModal
          targetInstitute={authModal.targetInstitute}
          onClose={closeAuthModal}
        />
      )}

      {/* 7. PERSISTENT BOTTOM FLOATING FS TRUST & SEAT-LOCK BAR (Responsive & Compact) */}
      {!isStickyBarDismissed && (
        <div className="fixed bottom-0 inset-x-0 z-40 bg-surface/95 backdrop-blur-md border-t border-border shadow-[0_-4px_25px_rgba(0,0,0,0.12)] py-2 sm:py-2.5 px-3 sm:px-8 transition-transform duration-300">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
            
            {/* Left: Branding & Grant */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xs sm:text-sm text-textMain truncate">
                    {institute.name}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md shrink-0 hidden md:inline">
                    100% Supreme Court Refund Protected
                  </span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-textMuted truncate">
                  <span className="hidden sm:inline">Save ₹15,000 with Code:</span>
                  <button 
                    onClick={handleCopyCoupon} 
                    className="font-mono font-bold text-brand-700 hover:text-brand-900 bg-brand-500/10 px-1.5 py-0.5 rounded border border-brand-500/20 cursor-pointer flex items-center gap-1 shrink-0"
                    title="Click to copy voucher code"
                  >
                    <span>{couponCode}</span>
                    {copiedCoupon ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  </button>
                  <span className="text-[10px] text-amber-700 font-bold shrink-0">
                    • ₹15k Off
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-background text-xs font-bold text-textMain hover:bg-surface transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Share with Parents</span>
              </button>

              <button
                onClick={() => setIsSeatLockModalOpen(true)}
                className="btn-primary py-2 px-3 sm:px-4 text-xs font-bold shadow-md cursor-pointer active:scale-95 flex items-center gap-1.5 shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5 text-gold-300" />
                <span className="hidden xs:inline">Lock Seat &amp; Claim ₹15k Waiver</span>
                <span className="xs:hidden">Lock Seat (₹15k Off)</span>
              </button>

              <button
                onClick={() => setIsStickyBarDismissed(true)}
                className="text-textMuted hover:text-textMain p-1 sm:p-1.5 rounded-lg border border-border text-xs cursor-pointer shrink-0"
                title="Dismiss Bar"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 8. SEAT LOCK & ADMISSION VOUCHER MODAL */}
      {isSeatLockModalOpen && (
        <SeatLockModal
          institute={institute}
          batches={upcomingBatches}
          initialBatch={lockTargetBatch}
          couponCode={couponCode}
          onClose={() => {
            setIsSeatLockModalOpen(false);
            setLockTargetBatch(null);
          }}
        />
      )}

    </div>
  );
}
