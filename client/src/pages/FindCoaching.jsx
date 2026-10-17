import { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, SlidersHorizontal, ArrowRightLeft, ShieldCheck, CheckCircle2, 
  Star, MapPin, Users, IndianRupee, Lock, ChevronDown, RotateCcw, 
  Heart, Sparkles, Filter, X, Grid, List, Building2, PhoneCall, 
  ArrowUpRight, BookOpen, Compass, Check, ArrowRight, Share2, 
  GraduationCap, Calendar, Compass as CompassIcon
} from "lucide-react";
import { institutesData, localitiesByCity } from "../data/institutes";
import { useAuth } from "../context/AuthContext";
import SpotlightCard from "../component/reactbits/SpotlightCard";
import ShinyText from "../component/reactbits/ShinyText";
import CountUp from "../component/reactbits/CountUp";
import InstituteDetailModal from "../component/InstituteDetailModal";
import ShareWithParentsModal from "../component/ShareWithParentsModal";
import AuthModal from "../component/AuthModal";

export default function FindCoaching() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, toggleShortlist, authModal, closeAuthModal, openAuthModal } = useAuth();

  // URL Query Sync
  const initialSearch = searchParams.get("q") || "";
  const initialExam = searchParams.get("exam") || "all";
  const initialCity = searchParams.get("city") || "all";
  const initialBatch = searchParams.get("batch") || "all";

  // Filter States
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedExam, setSelectedExam] = useState(initialExam);
  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [selectedLocality, setSelectedLocality] = useState("all");
  const [selectedBatch, setSelectedBatch] = useState(initialBatch); // all | 11th | 12th | dropper
  const [budgetMax, setBudgetMax] = useState(200000);
  const [batchSizeFilter, setBatchSizeFilter] = useState("all");
  const [minRating, setMinRating] = useState("all");
  const [hostelOnly, setHostelOnly] = useState(false);
  const [sortBy, setSortBy] = useState("recommended");
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "list"
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Interaction States
  const [selectedModalInst, setSelectedModalInst] = useState(null);
  const [selectedShareInst, setSelectedShareInst] = useState(null);
  const [comparedIds, setComparedIds] = useState(() => {
    try {
      const saved = localStorage.getItem("fs_compared_ids");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Reset Locality when City changes
  useEffect(() => {
    setSelectedLocality("all");
  }, [selectedCity]);

  // Sync compare state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("fs_compared_ids", JSON.stringify(comparedIds));
    } catch (e) {
      console.error(e);
    }
  }, [comparedIds]);

  // Update URL search parameters when primary filters change
  useEffect(() => {
    const params = {};
    if (searchQuery) params.q = searchQuery;
    if (selectedExam !== "all") params.exam = selectedExam;
    if (selectedCity !== "all") params.city = selectedCity;
    if (selectedBatch !== "all") params.batch = selectedBatch;
    setSearchParams(params, { replace: true });
  }, [searchQuery, selectedExam, selectedCity, selectedBatch, setSearchParams]);

  // Toggle Compare
  const toggleCompare = (id, e) => {
    if (e) e.stopPropagation();
    if (comparedIds.includes(id)) {
      setComparedIds(prev => prev.filter(item => item !== id));
    } else {
      if (comparedIds.length >= 3) {
        alert("You can compare up to 3 institutes at once. Remove one first.");
        return;
      }
      setComparedIds(prev => [...prev, id]);
    }
  };

  // Check if any filter is active
  const isAnyFilterActive = useMemo(() => {
    return (
      searchQuery.trim() !== "" ||
      selectedExam !== "all" ||
      selectedCity !== "all" ||
      selectedLocality !== "all" ||
      selectedBatch !== "all" ||
      budgetMax < 200000 ||
      batchSizeFilter !== "all" ||
      minRating !== "all" ||
      hostelOnly
    );
  }, [searchQuery, selectedExam, selectedCity, selectedLocality, selectedBatch, budgetMax, batchSizeFilter, minRating, hostelOnly]);

  // Reset Filters
  const resetFilters = () => {
    setSearchQuery("");
    setSelectedExam("all");
    setSelectedCity("all");
    setSelectedLocality("all");
    setSelectedBatch("all");
    setBudgetMax(200000);
    setBatchSizeFilter("all");
    setMinRating("all");
    setHostelOnly(false);
    setSortBy("recommended");
  };

  // Filter & Sort Calculation
  const filteredInstitutes = useMemo(() => {
    return institutesData
      .filter((inst) => {
        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = inst.name.toLowerCase().includes(q);
          const matchLoc = inst.location.toLowerCase().includes(q);
          const matchLocality = (inst.locality || "").toLowerCase().includes(q);
          const matchDesc = inst.description.toLowerCase().includes(q);
          const matchType = inst.type.toLowerCase().includes(q);
          if (!matchName && !matchLoc && !matchLocality && !matchDesc && !matchType) return false;
        }

        // Exam Filter
        if (selectedExam !== "all") {
          if (selectedExam === "jee" && !inst.type.toLowerCase().includes("jee")) return false;
          if (selectedExam === "neet" && !inst.type.toLowerCase().includes("neet")) return false;
        }

        // City Filter
        if (selectedCity !== "all") {
          if (inst.cityKey !== selectedCity && !inst.location.toLowerCase().includes(selectedCity)) {
            return false;
          }
        }

        // Locality Filter
        if (selectedLocality !== "all") {
          if (inst.localityKey !== selectedLocality) {
            return false;
          }
        }

        // Batch Stage Filter (11th / 12th / dropper)
        if (selectedBatch !== "all") {
          if (!inst.batches || !inst.batches.includes(selectedBatch)) {
            return false;
          }
        }

        // Budget Filter
        if (inst.numericFee && inst.numericFee > budgetMax) {
          return false;
        }

        // Batch Size Filter
        if (batchSizeFilter !== "all") {
          const sizeNum = parseInt(inst.batchSize, 10);
          if (batchSizeFilter === "small" && sizeNum > 40) return false;
          if (batchSizeFilter === "medium" && (sizeNum < 40 || sizeNum > 50)) return false;
        }

        // Minimum Rating Filter
        if (minRating !== "all") {
          if (inst.rating < parseFloat(minRating)) return false;
        }

        // Hostel Filter
        if (hostelOnly) {
          const dist = (inst.hostelDistance || "").toLowerCase();
          const hasHostel = dist.includes("within") || dist.includes("in-campus") || dist.includes("campus");
          if (!hasHostel) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "recommended") {
          return parseFloat(b.selectionRate) - parseFloat(a.selectionRate);
        }
        if (sortBy === "rating") {
          return b.rating - a.rating;
        }
        if (sortBy === "fee-asc") {
          return (a.numericFee || 0) - (b.numericFee || 0);
        }
        if (sortBy === "fee-desc") {
          return (b.numericFee || 0) - (a.numericFee || 0);
        }
        if (sortBy === "batch") {
          return parseInt(a.batchSize, 10) - parseInt(b.batchSize, 10);
        }
        return 0;
      });
  }, [searchQuery, selectedExam, selectedCity, selectedLocality, selectedBatch, budgetMax, batchSizeFilter, minRating, hostelOnly, sortBy]);

  // Cities List for Quick Pills
  const cities = [
    { key: "all", label: "All Hubs" },
    { key: "kota", label: "Kota" },
    { key: "delhi", label: "Delhi NCR" },
    { key: "agra", label: "Agra" },
    { key: "hyderabad", label: "Hyderabad" }
  ];

  // Preparation Stage Segments
  const batchStages = [
    { key: "all", label: "All Preparation Stages", icon: Sparkles },
    { key: "11th", label: "Class 11th (Two-Year Target)", icon: GraduationCap },
    { key: "12th", label: "Class 12th (One-Year Focus)", icon: BookOpen },
    { key: "dropper", label: "Dropper / Repeater 2026", icon: Calendar }
  ];

  // Dynamic Localities for Selected City
  const currentLocalities = selectedCity !== "all" && localitiesByCity[selectedCity] 
    ? localitiesByCity[selectedCity] 
    : null;

  return (
    <div className="min-h-screen bg-background pt-24 pb-28 text-textMain selection:bg-brand-500/20 selection:text-brand-900">
      
      {/* 1. DIRECTORY HERO & SEARCH HEADER */}
      <section className="bg-gradient-to-b from-brand-900/10 via-surface to-background border-b border-border/80 pt-8 pb-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          
          {/* Breadcrumb Tag */}
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-xs font-bold shadow-2xs">
              <Compass className="w-3.5 h-3.5 text-brand-600 animate-pulse" />
              <span>National Coaching Discovery</span>
            </span>
            <span className="text-xs text-textMuted font-medium hidden sm:inline">•</span>
            <span className="text-xs text-textMuted font-semibold hidden sm:inline">
              Audited 2026 Batch Limits & Transparent Tuition
            </span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-textMain tracking-tight mb-3">
                Find Verified <span className="text-brand-700">Coaching Centers</span>
              </h1>
              <p className="text-sm sm:text-base text-textMuted max-w-2xl leading-relaxed">
                Filter by verified Kota & metro faculties, true batch ceilings, transparent tuition fees, and hostel proximity without marketing noise.
              </p>
            </div>

            {/* Quick Stats Banner */}
            <div className="flex items-center gap-4 bg-surface border border-border p-3.5 rounded-2xl shadow-2xs shrink-0">
              <div className="flex -space-x-2 overflow-hidden">
                {institutesData.slice(0, 4).map((inst) => (
                  <img
                    key={inst.id}
                    className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                    src={inst.image}
                    alt={inst.name}
                  />
                ))}
              </div>
              <div className="text-xs border-l border-border pl-3">
                <span className="font-extrabold text-textMain block">
                  {filteredInstitutes.length} Centers Verified
                </span>
                <span className="text-textMuted text-[11px]">Kota • Delhi • Agra • Hyd</span>
              </div>
            </div>
          </div>

          {/* Unified Search Input Bar */}
          <div className="relative max-w-3xl mb-5">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-brand-600 absolute left-4 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by institute name (e.g. Allen, Resonance, VMC), area, or exam..."
                className="w-full pl-12 pr-12 py-3.5 bg-surface border-2 border-border/90 rounded-2xl text-sm font-semibold text-textMain placeholder:text-textMuted/70 shadow-sm focus:outline-none focus:border-brand-600 focus:ring-4 focus:ring-brand-500/10 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 text-textMuted hover:text-textMain p-1 rounded-lg transition-colors cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* ELASTIC GLIDER: PREPARATION STAGE SELECTOR (11th, 12th, Dropper) */}
          <div className="bg-surface/80 border border-border rounded-2xl p-1.5 shadow-2xs flex items-center gap-1 overflow-x-auto no-scrollbar max-w-3xl mb-4">
            {batchStages.map((stage) => {
              const Icon = stage.icon;
              const isSelected = selectedBatch === stage.key;
              return (
                <button
                  key={stage.key}
                  onClick={() => setSelectedBatch(stage.key)}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors shrink-0 cursor-pointer ${
                    isSelected ? "text-brand-900 font-extrabold" : "text-textMuted hover:text-textMain"
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="batch_stage_glider"
                      className="absolute inset-0 bg-brand-50 border border-brand-300/80 rounded-xl shadow-xs"
                      transition={{ type: "spring", stiffness: 450, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-brand-600" : "text-textMuted"}`} />
                    <span>{stage.label}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick City Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pt-1 no-scrollbar">
            <span className="text-xs font-bold text-textMuted uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-brand-600" /> Hub:
            </span>
            {cities.map((city) => (
              <button
                key={city.key}
                onClick={() => setSelectedCity(city.key)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedCity === city.key
                    ? "bg-brand-700 text-white shadow-xs"
                    : "bg-surface border border-border text-textMuted hover:text-textMain hover:border-brand-300"
                }`}
              >
                {city.label}
              </button>
            ))}

            <div className="h-4 w-[1px] bg-border mx-1 shrink-0" />

            {/* Quick Exam Pills */}
            {[
              { key: "all", label: "All Exams" },
              { key: "jee", label: "JEE Advanced" },
              { key: "neet", label: "NEET UG" }
            ].map((exam) => (
              <button
                key={exam.key}
                onClick={() => setSelectedExam(exam.key)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedExam === exam.key
                    ? "bg-gold-500 text-slate-950 font-extrabold shadow-xs"
                    : "bg-surface border border-border text-textMuted hover:text-textMain hover:border-gold-300"
                }`}
              >
                {exam.label}
              </button>
            ))}
          </div>

          {/* DYNAMIC LOCALITY SUB-FILTERS (Appears when City is Kota, Delhi, Agra, or Hyd) */}
          <AnimatePresence>
            {currentLocalities && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="pt-3 overflow-hidden"
              >
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar bg-surface/60 border border-border/80 p-2 rounded-2xl">
                  <span className="text-[11px] font-extrabold text-brand-800 uppercase tracking-wider shrink-0 px-2 flex items-center gap-1">
                    📍 {cities.find(c => c.key === selectedCity)?.label} Localities:
                  </span>
                  {currentLocalities.map((loc) => (
                    <button
                      key={loc.key}
                      onClick={() => setSelectedLocality(loc.key)}
                      className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                        selectedLocality === loc.key
                          ? "bg-emerald-700 text-white shadow-2xs font-bold"
                          : "bg-background border border-border/80 text-textMuted hover:text-textMain"
                      }`}
                    >
                      {loc.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </section>

      {/* 2. MAIN DIRECTORY LAYOUT (FILTERS + RESULTS) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ============================================================== */}
          {/* LEFT SIDEBAR: FILTERS PANEL (Desktop Sticky)                    */}
          {/* ============================================================== */}
          <aside className="hidden lg:block lg:col-span-4 xl:col-span-3 sticky top-28 space-y-6">
            <div className="bg-surface border border-border rounded-3xl p-6 shadow-card space-y-6">
              
              {/* Header with Active Filters / Reset */}
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-brand-600" />
                  <h3 className="font-extrabold text-base text-textMain tracking-tight">Filter Engine</h3>
                </div>
                {isAnyFilterActive && (
                  <button
                    onClick={resetFilters}
                    className="text-xs font-bold text-brand-700 hover:text-brand-900 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                )}
              </div>

              {/* Filter 1: Target Exam */}
              <div>
                <label className="text-xs font-extrabold uppercase tracking-wider text-textMuted block mb-2.5">
                  Target Exam
                </label>
                <div className="space-y-1.5">
                  {[
                    { key: "all", label: "All Competitive Exams" },
                    { key: "jee", label: "JEE Main & Advanced" },
                    { key: "neet", label: "NEET-UG (Medical)" }
                  ].map((item) => (
                    <label
                      key={item.key}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                        selectedExam === item.key
                          ? "bg-brand-50/80 border-brand-500 text-brand-900"
                          : "bg-background border-border/70 text-textMuted hover:border-brand-300"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="exam_filter_desktop"
                          checked={selectedExam === item.key}
                          onChange={() => setSelectedExam(item.key)}
                          className="text-brand-600 focus:ring-brand-500"
                        />
                        <span>{item.label}</span>
                      </div>
                      {selectedExam === item.key && (
                        <Check className="w-3.5 h-3.5 text-brand-600" />
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* Filter 2: Coaching Hub / City */}
              <div>
                <label className="text-xs font-extrabold uppercase tracking-wider text-textMuted block mb-2.5">
                  Coaching Hub / City
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs font-bold text-textMain focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-500/10 cursor-pointer"
                >
                  <option value="all">All Hubs (Nationwide)</option>
                  <option value="kota">Kota, Rajasthan</option>
                  <option value="delhi">New Delhi & NCR</option>
                  <option value="agra">Agra, Uttar Pradesh</option>
                  <option value="hyderabad">Hyderabad, Telangana</option>
                </select>
              </div>

              {/* Filter 3: Maximum Annual Budget Slider */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-textMuted">
                    Max Annual Tuition
                  </label>
                  <span className="text-xs font-extrabold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-lg border border-brand-200">
                    {budgetMax >= 200000 ? "Any Budget" : `≤ ₹${(budgetMax / 1000).toFixed(0)}k / Yr`}
                  </span>
                </div>
                <input
                  type="range"
                  min={100000}
                  max={200000}
                  step={5000}
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(Number(e.target.value))}
                  className="w-full accent-brand-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-textMuted font-bold mt-1">
                  <span>₹1.0 Lakh</span>
                  <span>₹1.5 Lakh</span>
                  <span>₹2.0 Lakh+</span>
                </div>
              </div>

              {/* Filter 4: Batch Size Transparency */}
              <div>
                <label className="text-xs font-extrabold uppercase tracking-wider text-textMuted block mb-2.5">
                  Audited Batch Size
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: "all", label: "Any Size" },
                    { key: "small", label: "≤ 40 Students" },
                    { key: "medium", label: "40–50 Students" }
                  ].map((item) => (
                    <button
                      key={item.key}
                      onClick={() => setBatchSizeFilter(item.key)}
                      className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                        batchSizeFilter === item.key
                          ? "bg-brand-600 text-white border-brand-600 shadow-2xs"
                          : "bg-background border-border text-textMuted hover:border-brand-300"
                      } ${item.key === "all" ? "col-span-2" : ""}`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter 5: Minimum Student Rating */}
              <div>
                <label className="text-xs font-extrabold uppercase tracking-wider text-textMuted block mb-2.5">
                  Verified Rating
                </label>
                <div className="flex gap-2">
                  {[
                    { key: "all", label: "All" },
                    { key: "4.5", label: "4.5+ ★" },
                    { key: "4.7", label: "4.7+ ★" }
                  ].map((item) => (
                    <button
                      key={item.key}
                      onClick={() => setMinRating(item.key)}
                      className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        minRating === item.key
                          ? "bg-gold-500 text-slate-950 border-gold-500 font-extrabold"
                          : "bg-background border-border text-textMuted hover:border-gold-300"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter 6: Verified Hostels Toggle */}
              <div className="pt-2 border-t border-border">
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-brand-600" />
                    <div>
                      <span className="text-xs font-bold text-textMain block">
                        Nearby / In-Campus Hostels
                      </span>
                      <span className="text-[10px] text-textMuted block">
                        Verified mess & security within 300m
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={hostelOnly}
                    onChange={(e) => setHostelOnly(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 accent-brand-600 cursor-pointer"
                  />
                </label>
              </div>

              {/* Guidance Box */}
              <div className="bg-brand-50/60 border border-brand-200/80 rounded-2xl p-4 text-xs">
                <div className="flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-gold-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-extrabold text-brand-900 mb-1">
                      Unsure which batch suits you?
                    </h5>
                    <p className="text-textMuted leading-relaxed mb-2 text-[11px]">
                      Our academic mentors help you evaluate faculty continuity and dropper vs regular batches for free.
                    </p>
                    <Link
                      to="/counselling"
                      className="inline-flex items-center gap-1 font-extrabold text-brand-700 hover:text-brand-900 text-xs"
                    >
                      <span>Request Free Guidance</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>

            </div>
          </aside>

          {/* ============================================================== */}
          {/* RIGHT COLUMN: TOOLBAR & INSTITUTE CARDS GRID                   */}
          {/* ============================================================== */}
          <main className="lg:col-span-8 xl:col-span-9 space-y-6">
            
            {/* Toolbar: Counter, Sort, View Toggle, Mobile Filter Trigger */}
            <div className="bg-surface border border-border rounded-2xl p-4 shadow-2xs flex flex-wrap items-center justify-between gap-4">
              
              {/* Left: Result Counter & Active Pill */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="lg:hidden btn-secondary py-2 px-3 text-xs font-bold flex items-center gap-2 cursor-pointer"
                >
                  <Filter className="w-3.5 h-3.5 text-brand-600" />
                  <span>Filters</span>
                  {isAnyFilterActive && (
                    <span className="w-2 h-2 rounded-full bg-brand-600"></span>
                  )}
                </button>

                <div className="text-xs sm:text-sm">
                  <span className="font-extrabold text-textMain">
                    {filteredInstitutes.length}
                  </span>{" "}
                  <span className="text-textMuted">
                    {filteredInstitutes.length === 1 ? "Coaching Center" : "Coaching Centers"} Found
                  </span>
                </div>
              </div>

              {/* Right: Sort By & View Toggle */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-textMuted font-bold hidden sm:inline">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-background border border-border rounded-xl px-3 py-1.5 text-xs font-bold text-textMain focus:outline-none focus:border-brand-600 cursor-pointer"
                  >
                    <option value="recommended">Recommended (Selection %)</option>
                    <option value="rating">Student Rating (Highest)</option>
                    <option value="fee-asc">Tuition: Low to High</option>
                    <option value="fee-desc">Tuition: High to Low</option>
                    <option value="batch">Smallest Batch Size</option>
                  </select>
                </div>

                {/* Grid / List Switcher */}
                <div className="hidden sm:flex items-center border border-border rounded-xl p-0.5 bg-background">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      viewMode === "grid" ? "bg-surface shadow-2xs text-brand-700" : "text-textMuted hover:text-textMain"
                    }`}
                    title="Grid View"
                  >
                    <Grid className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      viewMode === "list" ? "bg-surface shadow-2xs text-brand-700" : "text-textMuted hover:text-textMain"
                    }`}
                    title="List View"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>

            {/* Active Filters Bar (When filters are applied) */}
            {isAnyFilterActive && (
              <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
                <span className="text-textMuted font-bold text-[11px] uppercase tracking-wider">Active:</span>
                
                {searchQuery && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface border border-border font-semibold text-textMain text-xs">
                    "{searchQuery}"
                    <button onClick={() => setSearchQuery("")} className="hover:text-red-500 cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {selectedBatch !== "all" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-50 border border-brand-200 font-bold text-brand-900 text-xs">
                    Batch: {batchStages.find(s => s.key === selectedBatch)?.label.split(" (")[0]}
                    <button onClick={() => setSelectedBatch("all")} className="hover:text-red-500 cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {selectedExam !== "all" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-50 border border-brand-200 font-bold text-brand-900 text-xs">
                    Exam: {selectedExam.toUpperCase()}
                    <button onClick={() => setSelectedExam("all")} className="hover:text-red-500 cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {selectedCity !== "all" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface border border-border font-bold text-textMain text-xs">
                    City: {selectedCity.toUpperCase()}
                    <button onClick={() => setSelectedCity("all")} className="hover:text-red-500 cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {selectedLocality !== "all" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-300 font-bold text-emerald-900 text-xs">
                    Area: {selectedLocality}
                    <button onClick={() => setSelectedLocality("all")} className="hover:text-red-500 cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {budgetMax < 200000 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface border border-border font-bold text-textMain text-xs">
                    ≤ ₹{(budgetMax / 1000).toFixed(0)}k
                    <button onClick={() => setBudgetMax(200000)} className="hover:text-red-500 cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {batchSizeFilter !== "all" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface border border-border font-bold text-textMain text-xs">
                    Batch: {batchSizeFilter}
                    <button onClick={() => setBatchSizeFilter("all")} className="hover:text-red-500 cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {hostelOnly && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface border border-border font-bold text-textMain text-xs">
                    Hostel Required
                    <button onClick={() => setHostelOnly(false)} className="hover:text-red-500 cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                <button
                  onClick={resetFilters}
                  className="text-xs font-bold text-red-600 hover:text-red-700 ml-auto cursor-pointer"
                >
                  Clear All
                </button>
              </div>
            )}

            {/* Empty State */}
            {filteredInstitutes.length === 0 ? (
              <div className="bg-surface border border-border rounded-3xl p-12 text-center shadow-card space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-700 mx-auto flex items-center justify-center">
                  <Search className="w-8 h-8 opacity-70" />
                </div>
                <h3 className="font-extrabold text-xl text-textMain">No Coaching Institutes Match Your Filters</h3>
                <p className="text-sm text-textMuted max-w-md mx-auto leading-relaxed">
                  Try relaxing your budget ceiling, changing your preparation stage, or search for another coaching center.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={resetFilters}
                    className="btn-primary py-2.5 px-5 text-xs font-bold cursor-pointer"
                  >
                    Reset All Filters
                  </button>
                  <Link
                    to="/counselling"
                    className="btn-secondary py-2.5 px-5 text-xs font-bold"
                  >
                    Ask Academic Counsellor
                  </Link>
                </div>
              </div>
            ) : (
              /* RESULTS GRID OR LIST */
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 gap-6"
                    : "space-y-4"
                }
              >
                {filteredInstitutes.map((inst) => {
                  const isCompared = comparedIds.includes(inst.id);
                  const isShortlisted = user?.shortlisted?.includes(inst.id);

                  if (viewMode === "list") {
                    // COMPACT LIST VIEW CARD
                    return (
                      <div
                        key={inst.id}
                        className={`bg-surface border rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-5 ${
                          isCompared ? "border-brand-600 ring-2 ring-brand-600/30" : "border-border hover:border-brand-300"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <Link to={`/institute/${inst.id}`}>
                            <img
                              src={inst.image}
                              alt={inst.name}
                              className="w-16 h-16 rounded-xl object-cover shrink-0 hover:opacity-90 transition-opacity"
                            />
                          </Link>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Link 
                                to={`/institute/${inst.id}`}
                                className="font-extrabold text-base text-textMain hover:text-brand-700 transition-colors"
                              >
                                {inst.name}
                              </Link>
                              <span className="text-[10px] font-bold text-brand-800 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded-full">
                                {inst.type}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-textMuted">
                              <span className="flex items-center font-medium">
                                <MapPin className="w-3 h-3 mr-1 text-brand-600" />
                                {inst.locality ? `${inst.locality}` : inst.location}
                              </span>
                              <span>•</span>
                              <span className="font-bold text-textMain">Batch: {inst.batchSize}</span>
                              <span>•</span>
                              <span className="font-extrabold text-brand-700">Selection: {inst.selectionRate}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-border">
                          <div className="text-left md:text-right">
                            <span className="text-[10px] text-textMuted font-bold uppercase block">Tuition</span>
                            <span className="font-extrabold text-textMain text-sm sm:text-base">{inst.fees}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedShareInst(inst)}
                              className="p-2.5 rounded-xl border border-border bg-background hover:bg-emerald-50 hover:border-emerald-300 text-emerald-700 text-xs font-bold transition-all cursor-pointer"
                              title="Share with Parents on WhatsApp"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={(e) => toggleCompare(inst.id, e)}
                              className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                isCompared
                                  ? "bg-brand-600 text-white border-brand-600"
                                  : "bg-background border-border text-textMain hover:border-brand-400"
                              }`}
                              title="Compare"
                            >
                              <ArrowRightLeft className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">{isCompared ? "Added" : "Compare"}</span>
                            </button>

                            <Link
                              to={`/institute/${inst.id}`}
                              className="btn-primary py-2.5 px-4 text-xs font-bold cursor-pointer"
                            >
                              Full Profile
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // RICH GRID CARD
                  return (
                    <SpotlightCard
                      key={inst.id}
                      spotlightColor="rgba(18, 75, 56, 0.08)"
                      borderColor="rgba(197, 160, 89, 0.45)"
                      className={`edu-card group flex flex-col transition-all relative overflow-hidden rounded-3xl bg-surface border ${
                        isCompared
                          ? "ring-2 ring-brand-600 border-brand-600 shadow-md"
                          : "border-border hover:border-brand-400 shadow-card"
                      }`}
                    >
                      {/* Top Image Banner & Badges */}
                      <div className="h-52 relative overflow-hidden bg-slate-900">
                        <Link to={`/institute/${inst.id}`}>
                          <img
                            src={inst.image}
                            alt={inst.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 cursor-pointer"
                          />
                        </Link>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>

                        {/* Top Rating Badge */}
                        <div className="absolute top-3 right-3 bg-surface/95 backdrop-blur-md px-2.5 py-1 rounded-xl text-xs font-bold text-textMain shadow-sm flex items-center gap-1 border border-border">
                          <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                          <span>{inst.rating}</span>
                          <span className="text-[10px] text-textMuted font-normal">({inst.reviews})</span>
                        </div>

                        {/* Verified Center Tag */}
                        <span className="absolute top-3 left-3 bg-brand-700 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                          <ShieldCheck className="w-3.5 h-3.5 text-gold-400" />
                          <ShinyText text="Verified Center" shimmerColor="rgba(255, 255, 255, 0.95)" speed={3.5} />
                        </span>

                        {/* Top Action Buttons (Shortlist + WhatsApp Share) */}
                        <div className="absolute bottom-3 right-3 flex items-center gap-2">
                          <button
                            onClick={() => setSelectedShareInst(inst)}
                            className="w-8 h-8 rounded-full flex items-center justify-center bg-white/90 hover:bg-emerald-500 hover:text-white text-emerald-700 backdrop-blur-md shadow-md transition-all cursor-pointer"
                            title="Share with Parents on WhatsApp"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleShortlist(inst.id);
                            }}
                            className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md shadow-md transition-all cursor-pointer ${
                              isShortlisted
                                ? "bg-red-500 text-white"
                                : "bg-white/90 hover:bg-white text-slate-700"
                            }`}
                            title={isShortlisted ? "Shortlisted" : "Save to Shortlist"}
                          >
                            <Heart className={`w-4 h-4 ${isShortlisted ? "fill-white" : ""}`} />
                          </button>
                        </div>

                        {/* Exam Pill on Image */}
                        <span className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-0.5 rounded-lg border border-white/20">
                          {inst.type}
                        </span>
                      </div>

                      {/* Card Body */}
                      <div className="p-5 flex-1 flex flex-col">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <Link 
                            to={`/institute/${inst.id}`}
                            className="font-extrabold text-textMain text-lg line-clamp-1 group-hover:text-brand-700 transition-colors"
                          >
                            {inst.name}
                          </Link>
                        </div>

                        {/* Location & Locality Tag with animated pulse */}
                        <div className="text-xs text-textMuted mb-4 flex items-center justify-between">
                          <span className="flex items-center font-medium">
                            <MapPin className="w-3.5 h-3.5 mr-1 text-brand-600 shrink-0" />
                            {inst.locality ? (
                              <span className="text-brand-900 font-semibold">{inst.locality}, {inst.location.split(",")[0]}</span>
                            ) : (
                              inst.location
                            )}
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

                        {/* Target Batches Chips */}
                        {inst.batches && (
                          <div className="flex items-center gap-1.5 mb-3">
                            <span className="text-[10px] font-bold text-textMuted uppercase tracking-wider">Batches:</span>
                            {inst.batches.map(b => (
                              <span key={b} className="text-[10px] font-bold text-brand-800 bg-brand-50/80 border border-brand-200/80 px-2 py-0.5 rounded-md">
                                {b === "11th" ? "Class 11" : b === "12th" ? "Class 12" : "Droppers 2026"}
                              </span>
                            ))}
                          </div>
                        )}

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
                            <span className="font-extrabold text-brand-700 text-xs sm:text-sm">
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
                              <span className="text-[10px] font-bold text-textMuted uppercase tracking-wider block">
                                Tuition & Material
                              </span>
                              <span className="text-base font-extrabold text-textMain">
                                {inst.fees}
                              </span>
                            </div>

                            {/* Compare Checkbox Toggle */}
                            <button
                              onClick={(e) => toggleCompare(inst.id, e)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
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

                          {/* Dual Bottom CTA: Audit Modal & Full Profile Page */}
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => setSelectedModalInst(inst)}
                              className="btn-secondary py-2.5 px-3 text-xs font-bold justify-center cursor-pointer"
                            >
                              Audit Report
                            </button>
                            <Link
                              to={`/institute/${inst.id}`}
                              className="btn-primary py-2.5 px-3 text-xs font-bold justify-center gap-1.5 shadow-sm cursor-pointer"
                            >
                              <span>Full Profile</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </SpotlightCard>
                  );
                })}
              </div>
            )}

          </main>

        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. FLOATING COMPARISON DOCK (When 1+ institutes selected)       */}
      {/* ============================================================== */}
      <AnimatePresence>
        {comparedIds.length > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="fixed bottom-6 inset-x-4 sm:inset-x-auto sm:right-8 sm:max-w-md z-40"
          >
            <div className="bg-slate-950/95 backdrop-blur-xl border border-gold-500/40 text-white p-4 rounded-3xl shadow-2xl flex items-center justify-between gap-4">
              
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {comparedIds.map((id) => {
                    const inst = institutesData.find(i => i.id === id);
                    if (!inst) return null;
                    return (
                      <img
                        key={id}
                        src={inst.image}
                        alt={inst.name}
                        className="w-9 h-9 rounded-full ring-2 ring-gold-500 object-cover"
                        title={inst.name}
                      />
                    );
                  })}
                </div>
                <div>
                  <div className="text-xs font-bold text-gold-400 flex items-center gap-1">
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    <span>{comparedIds.length}/3 Selected</span>
                  </div>
                  <span className="text-[11px] text-slate-300">Ready for head-to-head</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setComparedIds([])}
                  className="text-xs text-slate-400 hover:text-white px-2 py-1 transition-colors cursor-pointer"
                  title="Clear compare tray"
                >
                  Clear
                </button>
                <Link
                  to={`/compare?ids=${comparedIds.join(",")}`}
                  className="bg-gold-500 hover:bg-gold-400 text-slate-950 font-extrabold text-xs px-4 py-2.5 rounded-2xl flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                >
                  <span>Compare</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================================== */}
      {/* 4. MOBILE SLIDE-OVER FILTER DRAWER                             */}
      {/* ============================================================== */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFilterOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 lg:hidden"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="fixed inset-x-0 bottom-0 max-h-[85vh] bg-surface rounded-t-3xl border-t border-border z-50 p-6 overflow-y-auto lg:hidden shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-brand-600" />
                  <h3 className="font-extrabold text-lg text-textMain">Filter Coaching Centers</h3>
                </div>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center text-textMuted hover:text-textMain cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Mobile Target Exam */}
              <div>
                <label className="text-xs font-extrabold uppercase tracking-wider text-textMuted block mb-2">
                  Target Exam
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: "all", label: "All" },
                    { key: "jee", label: "JEE" },
                    { key: "neet", label: "NEET" }
                  ].map((item) => (
                    <button
                      key={item.key}
                      onClick={() => setSelectedExam(item.key)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        selectedExam === item.key
                          ? "bg-brand-600 text-white border-brand-600"
                          : "bg-background border-border text-textMuted"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile City */}
              <div>
                <label className="text-xs font-extrabold uppercase tracking-wider text-textMuted block mb-2">
                  City / Coaching Hub
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs font-bold text-textMain"
                >
                  <option value="all">All Hubs (Nationwide)</option>
                  <option value="kota">Kota, Rajasthan</option>
                  <option value="delhi">New Delhi & NCR</option>
                  <option value="agra">Agra, Uttar Pradesh</option>
                  <option value="hyderabad">Hyderabad, Telangana</option>
                </select>
              </div>

              {/* Mobile Budget */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-textMuted">
                    Max Annual Tuition
                  </label>
                  <span className="text-xs font-extrabold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-lg border border-brand-200">
                    ≤ ₹{(budgetMax / 1000).toFixed(0)}k
                  </span>
                </div>
                <input
                  type="range"
                  min={100000}
                  max={200000}
                  step={5000}
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(Number(e.target.value))}
                  className="w-full accent-brand-600 cursor-pointer"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <button
                  onClick={resetFilters}
                  className="flex-1 btn-secondary py-3 text-xs font-bold cursor-pointer"
                >
                  Reset All
                </button>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="flex-1 btn-primary py-3 text-xs font-bold justify-center cursor-pointer"
                >
                  Show {filteredInstitutes.length} Centers
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ============================================================== */}
      {/* 5. AUDIT DETAIL MODAL, WHATSAPP SHARE MODAL & AUTH MODAL       */}
      {/* ============================================================== */}
      {selectedModalInst && (
        <InstituteDetailModal
          institute={selectedModalInst}
          onClose={() => setSelectedModalInst(null)}
        />
      )}

      {selectedShareInst && (
        <ShareWithParentsModal
          institute={selectedShareInst}
          onClose={() => setSelectedShareInst(null)}
        />
      )}

      {authModal.isOpen && (
        <AuthModal
          targetInstitute={authModal.targetInstitute}
          onClose={closeAuthModal}
        />
      )}

    </div>
  );
}

