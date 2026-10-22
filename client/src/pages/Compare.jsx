import { useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRightLeft, ShieldCheck, ArrowRight, CheckCircle2, 
  Star, MapPin, Users, IndianRupee, ChevronRight, Plus, X,
  Sparkles, Share2, Printer, Trophy, Check, Copy, 
  Award, Zap, BookOpen, Building2, GraduationCap,
  Percent, TrendingUp, HelpCircle
} from "lucide-react";
import { institutesData } from "../data/institutes";
import { useAuth } from "../context/AuthContext";
import AuthModal from "../component/AuthModal";
import SeatLockModal from "../component/SeatLockModal";
import BorderBeam from "../component/reactbits/BorderBeam";

// Preset legendary rivalry comparisons
const PRESETS = [
  { label: "Allen vs Resonance", subtitle: "Kota JEE Titans", ids: [1, 2], icon: "⚔️" },
  { label: "Aakash vs Allen", subtitle: "NEET Medical Battle", ids: [3, 1], icon: "🩺" },
  { label: "FIITJEE vs Motion", subtitle: "Advanced Problem Solving", ids: [4, 5], icon: "⚡" },
  { label: "Allen vs FIITJEE", subtitle: "Top Rankers Benchmark", ids: [1, 4], icon: "🏆" }
];

// Color accents for each compared column to make separation 100% visible
const COLUMN_THEMES = [
  {
    name: "Emerald Primary",
    accentBorder: "border-t-4 border-t-emerald-600",
    badgeBg: "bg-emerald-600 text-white",
    badgeLabel: "Contender 1 • Primary",
    subtleBg: "bg-emerald-500/5",
    headerBg: "bg-gradient-to-b from-emerald-50/80 via-white to-white",
    pillBorder: "border-emerald-300 text-emerald-900 bg-emerald-50",
    winnerBg: "bg-emerald-50 border-emerald-400 shadow-sm",
    ringColor: "ring-emerald-500/30"
  },
  {
    name: "Indigo Challenger",
    accentBorder: "border-t-4 border-t-indigo-600",
    badgeBg: "bg-indigo-600 text-white",
    badgeLabel: "Contender 2 • Challenger",
    subtleBg: "bg-indigo-500/5",
    headerBg: "bg-gradient-to-b from-indigo-50/80 via-white to-white",
    pillBorder: "border-indigo-300 text-indigo-900 bg-indigo-50",
    winnerBg: "bg-indigo-50 border-indigo-400 shadow-sm",
    ringColor: "ring-indigo-500/30"
  },
  {
    name: "Amber Alternative",
    accentBorder: "border-t-4 border-t-amber-600",
    badgeBg: "bg-amber-600 text-white",
    badgeLabel: "Contender 3 • Alternative",
    subtleBg: "bg-amber-500/5",
    headerBg: "bg-gradient-to-b from-amber-50/80 via-white to-white",
    pillBorder: "border-amber-300 text-amber-900 bg-amber-50",
    winnerBg: "bg-amber-50 border-amber-400 shadow-sm",
    ringColor: "ring-amber-500/30"
  }
];

export default function Compare() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  
  // Modals & options state
  const [seatLockTarget, setSeatLockTarget] = useState(null);
  const [highlightDifferences, setHighlightDifferences] = useState(true);
  const [copiedShare, setCopiedShare] = useState(false);

  // Parse IDs from URL query e.g. ?ids=1,2
  const initialIds = useMemo(() => {
    const raw = searchParams.get("ids");
    if (!raw) return [1, 2];
    const parsed = raw.split(",").map(Number).filter(Boolean);
    return parsed.length >= 2 ? parsed.slice(0, 3) : [1, 2];
  }, [searchParams]);

  const [selectedIds, setSelectedIds] = useState(initialIds);

  // Sync state with URL params
  const updateIds = (nextIds) => {
    setSelectedIds(nextIds);
    setSearchParams({ ids: nextIds.join(",") });
  };

  const selectedInstitutes = useMemo(() => {
    return selectedIds.map(id => institutesData.find(i => i.id === id)).filter(Boolean);
  }, [selectedIds]);

  const handleSelectChange = (slotIndex, newId) => {
    const next = [...selectedIds];
    next[slotIndex] = Number(newId);
    updateIds(next);
  };

  const addSlot = () => {
    if (selectedIds.length >= 3) return;
    const available = institutesData.find(i => !selectedIds.includes(i.id));
    if (available) {
      updateIds([...selectedIds, available.id]);
    }
  };

  const removeSlot = (slotIndex) => {
    if (selectedIds.length <= 2) return;
    const next = selectedIds.filter((_, idx) => idx !== slotIndex);
    updateIds(next);
  };

  const loadPreset = (ids) => {
    updateIds(ids);
  };

  // Helper to determine winner in key metrics
  const getWinnerInfo = useMemo(() => {
    if (selectedInstitutes.length < 2) return null;

    let minFee = Infinity;
    let feeWinner = null;

    let minBatch = Infinity;
    let batchWinner = null;

    let maxSelection = -1;
    let selectionWinner = null;

    let maxRating = -1;
    let ratingWinner = null;

    selectedInstitutes.forEach(inst => {
      const numFee = inst.numericFee || parseInt(inst.fees?.replace(/[^\d]/g, "") || "9999999");
      if (numFee < minFee) {
        minFee = numFee;
        feeWinner = inst.id;
      }

      const numBatch = parseInt(inst.batchSize?.replace(/[^\d]/g, "") || "999");
      if (numBatch < minBatch) {
        minBatch = numBatch;
        batchWinner = inst.id;
      }

      const numSel = parseFloat(inst.selectionRate?.replace(/[^\d.]/g, "") || "0");
      if (numSel > maxSelection) {
        maxSelection = numSel;
        selectionWinner = inst.id;
      }

      const numRate = parseFloat(inst.rating || "0");
      if (numRate > maxRating) {
        maxRating = numRate;
        ratingWinner = inst.id;
      }
    });

    return { feeWinner, batchWinner, selectionWinner, ratingWinner };
  }, [selectedInstitutes]);

  // WhatsApp share generator for parents
  const handleShareWithParents = () => {
    if (selectedInstitutes.length < 2) return;
    const inst1 = selectedInstitutes[0];
    const inst2 = selectedInstitutes[1];
    const inst3 = selectedInstitutes[2];

    let text = `📊 *FutureSelector Unbiased Coaching Comparison Report*\n\n`;
    text += `🏛️ *Option 1: ${inst1.name}* (${inst1.location})\n`;
    text += `• Annual Fees: ${inst1.fees} (Save ₹15,000 with FS Grant)\n`;
    text += `• Audited Batch Cap: ${inst1.batchSize}\n`;
    text += `• Selection Rate: ${inst1.selectionRate}\n`;
    text += `• Top Rank: ${inst1.topRank}\n\n`;

    text += `🏛️ *Option 2: ${inst2.name}* (${inst2.location})\n`;
    text += `• Annual Fees: ${inst2.fees} (Save ₹15,000 with FS Grant)\n`;
    text += `• Audited Batch Cap: ${inst2.batchSize}\n`;
    text += `• Selection Rate: ${inst2.selectionRate}\n`;
    text += `• Top Rank: ${inst2.topRank}\n\n`;

    if (inst3) {
      text += `🏛️ *Option 3: ${inst3.name}* (${inst3.location})\n`;
      text += `• Annual Fees: ${inst3.fees}\n`;
      text += `• Audited Batch Cap: ${inst3.batchSize}\n`;
      text += `• Selection Rate: ${inst3.selectionRate}\n\n`;
    }

    text += `🛡️ *Refund Protection:* 100% Supreme Court Refund Policy Audited.\n`;
    text += `🔗 *View Live Comparison:* ${window.location.href}`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pt-24 sm:pt-28 pb-20 px-3 sm:px-6 relative overflow-hidden text-slate-800">
      
      {/* Background Soft Glows */}
      <div className="absolute top-10 left-1/4 w-[550px] h-[550px] bg-gradient-to-br from-emerald-500/10 via-brand-600/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-gradient-to-bl from-indigo-500/10 via-amber-400/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-6 sm:space-y-8">
        
        {/* ============================================================ */}
        {/* TOP BAR: HEADER, BADGES & ACTIONS */}
        {/* ============================================================ */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200/90 shadow-md">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border-2 border-emerald-200 text-emerald-900 text-xs font-black shadow-2xs">
                <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-700" />
                <span>Head-to-Head Coaching Duel Matrix</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
                Compare Coaching <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-700">Side-by-Side</span>
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl font-medium leading-relaxed">
                Objective, classroom-verified comparison matrix. Each coaching institute is laid out with clear visual separation, audited fee structures, and strict batch limits.
              </p>
            </div>

            {/* Quick Actions Toolbar */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={handleShareWithParents}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center gap-2 shadow-sm cursor-pointer active:scale-95 transition-all"
                title="Send comparative report to parents on WhatsApp"
              >
                <Share2 className="w-4 h-4" />
                <span>WhatsApp to Parents</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border-2 border-slate-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
              >
                {copiedShare ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
                <span>{copiedShare ? "Link Copied!" : "Copy Link"}</span>
              </button>

              <button
                onClick={handlePrint}
                className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border-2 border-slate-300 text-xs font-bold hidden sm:flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                title="Print comparison table"
              >
                <Printer className="w-4 h-4 text-slate-600" />
                <span>Print</span>
              </button>

              {selectedIds.length < 3 && (
                <button
                  onClick={addSlot}
                  className="px-4 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border-2 border-indigo-200 text-xs font-black flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4 text-indigo-700" />
                  <span>Add 3rd Center</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Rivalry Presets & Highlight Differences Toggle */}
          <div className="mt-6 pt-5 border-t-2 border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              <span className="text-xs font-black text-slate-800 shrink-0 flex items-center gap-1.5 mr-1">
                <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>Popular Matchups:</span>
              </span>
              {PRESETS.map((preset, idx) => {
                const isMatch = preset.ids.every(id => selectedIds.includes(id));
                return (
                  <button
                    key={idx}
                    onClick={() => loadPreset(preset.ids)}
                    className={`px-3 py-1.5 rounded-xl border-2 text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                      isMatch 
                        ? "bg-emerald-50 border-emerald-400 text-emerald-950 shadow-xs ring-2 ring-emerald-500/20" 
                        : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <span>{preset.icon}</span>
                    <span className="font-extrabold">{preset.label}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setHighlightDifferences(!highlightDifferences)}
              className={`text-xs font-black px-4 py-1.5 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                highlightDifferences
                  ? "bg-amber-500 text-slate-950 border-amber-600 shadow-xs font-black"
                  : "bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-slate-950" />
              <span>{highlightDifferences ? "Highlight Best Metrics: ON" : "Highlight Best Metrics: OFF"}</span>
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* SMART VERDICT SUMMARY CARD */}
        {/* ============================================================ */}
        {selectedInstitutes.length >= 2 && (
          <div className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 text-white rounded-3xl p-5 sm:p-6 shadow-xl border-2 border-slate-800">
            <BorderBeam size={280} duration={8} borderWidth={2} colorFrom="#10B981" colorTo="#F59E0B" />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    Quick Decision Verdict
                  </span>
                  <span className="text-[10px] text-emerald-300 font-black bg-emerald-500/20 border border-emerald-400/40 px-2 py-0.5 rounded-full">
                    NTA Verified Data
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white">
                  Head-to-Head Key Takeaways
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
                  Comparing <strong className="text-emerald-400">{selectedInstitutes[0].name}</strong> vs <strong className="text-indigo-300">{selectedInstitutes[1].name}</strong>: 
                  {selectedInstitutes[0].numericFee < selectedInstitutes[1].numericFee ? (
                    ` ${selectedInstitutes[0].name} has a more cost-effective fee structure, while `
                  ) : (
                    ` ${selectedInstitutes[1].name} offers lower annual tuition, while `
                  )}
                  {parseInt(selectedInstitutes[0].batchSize) < parseInt(selectedInstitutes[1].batchSize) ? (
                    `${selectedInstitutes[0].name} has a smaller batch cap for personal mentor attention.`
                  ) : (
                    `${selectedInstitutes[1].name} maintains smaller batch limits.`
                  )}
                </p>
              </div>

              {/* Differentiating Winner Badges */}
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2.5 rounded-2xl text-center min-w-[100px]">
                  <span className="text-[10px] uppercase font-bold text-slate-300 block">Fee Winner</span>
                  <span className="text-xs font-black text-amber-300">
                    {selectedInstitutes.find(i => i.id === getWinnerInfo?.feeWinner)?.name.split(" ")[0]}
                  </span>
                </div>

                <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2.5 rounded-2xl text-center min-w-[100px]">
                  <span className="text-[10px] uppercase font-bold text-slate-300 block">Batch Cap</span>
                  <span className="text-xs font-black text-emerald-300">
                    {selectedInstitutes.find(i => i.id === getWinnerInfo?.batchWinner)?.name.split(" ")[0]}
                  </span>
                </div>

                <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2.5 rounded-2xl text-center min-w-[100px]">
                  <span className="text-[10px] uppercase font-bold text-slate-300 block">Selection %</span>
                  <span className="text-xs font-black text-teal-300">
                    {selectedInstitutes.find(i => i.id === getWinnerInfo?.selectionWinner)?.name.split(" ")[0]}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* MAIN COMPARISON MATRIX: HIGH VISIBILITY WITH CRISP BORDERS */}
        {/* ============================================================ */}
        <div className="bg-white rounded-3xl border-2 border-slate-300 shadow-xl overflow-hidden">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse table-fixed">
              
              {/* TABLE HEADER: DISTINCT COLUMN CARDS WITH VS BADGES */}
              <thead>
                <tr className="border-b-2 border-slate-300 bg-slate-100/90">
                  
                  {/* Left Column Header: Metric Category */}
                  <th className="p-5 w-60 sm:w-64 min-w-[220px] max-w-[260px] align-top bg-slate-100 border-r-2 border-slate-300">
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
                        Comparison Parameter
                      </span>
                      <span className="text-base font-black text-slate-900 block">
                        Audited Benchmarks
                      </span>
                      <p className="text-[11px] text-slate-600 font-medium leading-tight">
                        Side-by-side metric verification certified by FutureSelector.
                      </p>
                    </div>
                  </th>

                  {/* Dynamic Institute Headers */}
                  {selectedInstitutes.map((inst, idx) => {
                    const theme = COLUMN_THEMES[idx % COLUMN_THEMES.length];

                    return (
                      <th 
                        key={inst.id} 
                        style={{ position: "relative" }}
                        className={`p-5 min-w-[280px] sm:min-w-[320px] align-top ${theme.headerBg} ${theme.accentBorder} ${
                          idx < selectedInstitutes.length - 1 ? "border-r-2 border-slate-300" : ""
                        }`}
                      >
                        <div className="relative w-full">
                          
                          {/* VS BADGE DIVIDER ON THE EXACT COLUMN BOUNDARY */}
                          {idx === 0 && selectedInstitutes.length >= 2 && (
                            <div 
                              className="absolute -right-9 top-1/2 -translate-y-1/2 z-30 hidden lg:flex items-center justify-center w-8 h-8 rounded-full bg-slate-900 text-white font-black text-[11px] border-2 border-white shadow-lg pointer-events-none"
                            >
                              VS
                            </div>
                          )}

                          {/* Top Contender Badge & Remove Action */}
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-2xs ${theme.badgeBg}`}>
                              {theme.badgeLabel}
                            </span>
                            
                            {selectedInstitutes.length > 2 && (
                              <button
                                onClick={() => removeSlot(idx)}
                                className="w-7 h-7 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 border border-slate-200 flex items-center justify-center transition-colors cursor-pointer bg-white"
                                title="Remove center from comparison"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                        {/* Institute Card Header with Image and Details */}
                        <div className="bg-white rounded-2xl p-3.5 border-2 border-slate-200 shadow-xs mb-3 space-y-3">
                          <div className="flex items-center gap-3">
                            <img 
                              src={inst.image} 
                              alt={inst.name}
                              className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0" 
                            />
                            <div className="min-w-0">
                              <h3 className="font-black text-sm sm:text-base text-slate-900 leading-snug truncate">
                                {inst.name}
                              </h3>
                              <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold mt-0.5">
                                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span className="truncate">{inst.location}</span>
                              </div>
                            </div>
                          </div>

                          {/* Quick Selector Dropdown */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-extrabold uppercase tracking-wide text-slate-500 block">
                              Switch Center:
                            </label>
                            <select
                              value={inst.id}
                              onChange={(e) => handleSelectChange(idx, e.target.value)}
                              className="w-full bg-slate-50 hover:bg-white border-2 border-slate-300 hover:border-emerald-500 focus:border-emerald-600 rounded-xl px-3 py-2 text-xs font-black text-slate-900 shadow-2xs outline-none cursor-pointer transition-all"
                            >
                              {institutesData.map((item) => (
                                <option key={item.id} value={item.id}>
                                  {item.name} ({item.location.split(",")[0]})
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Quick Meta Badges */}
                          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                            <div className="flex items-center gap-1 text-slate-800 font-black">
                              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                              <span>{inst.rating}</span>
                              <span className="text-[10px] text-slate-400 font-normal">({inst.reviews})</span>
                            </div>

                            <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                              {inst.type}
                            </span>
                          </div>
                        </div>

                          {/* Quick Top Lock Seat CTA */}
                          <button
                            onClick={() => setSeatLockTarget(inst)}
                            className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                            <span>Lock ₹15k Waiver Pass</span>
                          </button>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              {/* TABLE BODY: DIVIDED INTO CLEAR CHAPTERS WITH HIGH CONTRAST */}
              <tbody className="divide-y-2 divide-slate-200 text-xs sm:text-sm">
                
                {/* -------------------------------------------------------- */}
                {/* CHAPTER 1: ACADEMICS & CLASSROOM AUDIT */}
                {/* -------------------------------------------------------- */}
                <tr className="bg-emerald-900 text-white">
                  <td colSpan={selectedInstitutes.length + 1} className="py-3 px-5">
                    <div className="flex items-center gap-2.5 font-black text-xs sm:text-sm uppercase tracking-wider">
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/30 flex items-center justify-center border border-emerald-400/30">
                        <BookOpen className="w-3.5 h-3.5 text-emerald-300" />
                      </div>
                      <span>Chapter 1: Academics, Batch Limits & Selection Results</span>
                    </div>
                  </td>
                </tr>

                {/* Metric 1: Verified Classroom Batch Size */}
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-5 font-black text-slate-900 bg-slate-50 border-r-2 border-slate-300">
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-white border-2 border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                        <Users className="w-4 h-4 text-emerald-700" />
                      </div>
                      <div>
                        <span className="block text-xs font-black uppercase text-slate-900">Classroom Batch Size</span>
                        <span className="block text-[11px] text-slate-500 font-semibold mt-0.5">Physical classroom headcount cap</span>
                      </div>
                    </div>
                  </td>

                  {selectedInstitutes.map((inst, idx) => {
                    const isWinner = getWinnerInfo?.batchWinner === inst.id;
                    const isHighlighted = highlightDifferences && isWinner;

                    return (
                      <td 
                        key={inst.id} 
                        className={`p-5 align-middle ${
                          idx < selectedInstitutes.length - 1 ? "border-r-2 border-slate-300" : ""
                        } ${isHighlighted ? "bg-emerald-50/60" : "bg-white"}`}
                      >
                        <div className={`p-3 rounded-2xl border-2 transition-all ${
                          isHighlighted ? "bg-emerald-50 border-emerald-400 shadow-xs" : "bg-slate-50/80 border-slate-200"
                        }`}>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-black text-slate-900">
                              {inst.batchSize}
                            </span>
                            {isWinner && (
                              <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Trophy className="w-3 h-3 text-amber-500 fill-amber-500" />
                                Tightest Cap
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500 font-medium block mt-1">
                            Audited physical desk limit (no overcrowding)
                          </span>
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* Metric 2: Qualifying Selection Rate */}
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-5 font-black text-slate-900 bg-slate-50 border-r-2 border-slate-300">
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-white border-2 border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                        <Percent className="w-4 h-4 text-brand-700" />
                      </div>
                      <div>
                        <span className="block text-xs font-black uppercase text-slate-900">Selection Ratio %</span>
                        <span className="block text-[11px] text-slate-500 font-semibold mt-0.5">JEE / NEET qualifying audit</span>
                      </div>
                    </div>
                  </td>

                  {selectedInstitutes.map((inst, idx) => {
                    const isWinner = getWinnerInfo?.selectionWinner === inst.id;
                    const isHighlighted = highlightDifferences && isWinner;

                    return (
                      <td 
                        key={inst.id} 
                        className={`p-5 align-middle ${
                          idx < selectedInstitutes.length - 1 ? "border-r-2 border-slate-300" : ""
                        } ${isHighlighted ? "bg-emerald-50/60" : "bg-white"}`}
                      >
                        <div className={`p-3 rounded-2xl border-2 transition-all ${
                          isHighlighted ? "bg-emerald-50 border-emerald-400 shadow-xs" : "bg-slate-50/80 border-slate-200"
                        }`}>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-base font-black text-emerald-700">
                              {inst.selectionRate}
                            </span>
                            {isWinner && (
                              <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Trophy className="w-3 h-3 text-amber-500 fill-amber-500" />
                                Highest Ratio
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500 font-medium block mt-1">
                            Verified from official NTA score register audits
                          </span>
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* Metric 3: Top AIR Milestone */}
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-5 font-black text-slate-900 bg-slate-50 border-r-2 border-slate-300">
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-white border-2 border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                        <Award className="w-4 h-4 text-amber-600" />
                      </div>
                      <div>
                        <span className="block text-xs font-black uppercase text-slate-900">Top AIR Milestones</span>
                        <span className="block text-[11px] text-slate-500 font-semibold mt-0.5">Classroom enrolled rankers only</span>
                      </div>
                    </div>
                  </td>

                  {selectedInstitutes.map((inst, idx) => (
                    <td 
                      key={inst.id} 
                      className={`p-5 align-middle bg-white ${
                        idx < selectedInstitutes.length - 1 ? "border-r-2 border-slate-300" : ""
                      }`}
                    >
                      <div className="p-3 rounded-2xl bg-slate-50/80 border-2 border-slate-200">
                        <div className="flex items-center gap-2 font-black text-slate-900 text-xs sm:text-sm">
                          <Award className="w-4 h-4 text-amber-500 shrink-0" />
                          <span>{inst.topRank}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-medium block mt-1">
                          Audited classroom enrollment (not postal/test series)
                        </span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Metric 4: Faculty Stability */}
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-5 font-black text-slate-900 bg-slate-50 border-r-2 border-slate-300">
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-white border-2 border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                        <GraduationCap className="w-4 h-4 text-indigo-700" />
                      </div>
                      <div>
                        <span className="block text-xs font-black uppercase text-slate-900">Faculty Stability</span>
                        <span className="block text-[11px] text-slate-500 font-semibold mt-0.5">Faculty retention & tenure</span>
                      </div>
                    </div>
                  </td>

                  {selectedInstitutes.map((inst, idx) => (
                    <td 
                      key={inst.id} 
                      className={`p-5 align-middle bg-white ${
                        idx < selectedInstitutes.length - 1 ? "border-r-2 border-slate-300" : ""
                      }`}
                    >
                      <div className="p-3 rounded-2xl bg-slate-50/80 border-2 border-slate-200 space-y-1">
                        <span className="text-xs font-black text-slate-900 block">
                          {inst.facultyHighlights || "Senior Subject Specialist Team"}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Zero Mid-Session Shuffling Guarantee
                        </span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Metric 5: Doubt Resolution Facilities */}
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-5 font-black text-slate-900 bg-slate-50 border-r-2 border-slate-300">
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-white border-2 border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                        <HelpCircle className="w-4 h-4 text-teal-700" />
                      </div>
                      <div>
                        <span className="block text-xs font-black uppercase text-slate-900">Doubt Counters</span>
                        <span className="block text-[11px] text-slate-500 font-semibold mt-0.5">Daily 1-on-1 problem desks</span>
                      </div>
                    </div>
                  </td>

                  {selectedInstitutes.map((inst, idx) => (
                    <td 
                      key={inst.id} 
                      className={`p-5 align-middle bg-white ${
                        idx < selectedInstitutes.length - 1 ? "border-r-2 border-slate-300" : ""
                      }`}
                    >
                      <div className="p-3 rounded-2xl bg-slate-50/80 border-2 border-slate-200">
                        <span className="text-xs font-black text-slate-900 block">
                          {inst.doubtSupport || "Dedicated Daily Faculty Desks"}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium block mt-1">
                          Afternoon 2:00 PM – 6:00 PM reserved for individual clearing
                        </span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* -------------------------------------------------------- */}
                {/* CHAPTER 2: FEES, VOUCHERS & REFUND ESCROW */}
                {/* -------------------------------------------------------- */}
                <tr className="bg-amber-900 text-white">
                  <td colSpan={selectedInstitutes.length + 1} className="py-3 px-5">
                    <div className="flex items-center gap-2.5 font-black text-xs sm:text-sm uppercase tracking-wider">
                      <div className="w-6 h-6 rounded-lg bg-amber-500/30 flex items-center justify-center border border-amber-400/30">
                        <IndianRupee className="w-3.5 h-3.5 text-amber-300" />
                      </div>
                      <span>Chapter 2: Financial Transparency, Grants & Refund Policy</span>
                    </div>
                  </td>
                </tr>

                {/* Metric 6: Official Annual Fees */}
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-5 font-black text-slate-900 bg-slate-50 border-r-2 border-slate-300">
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-white border-2 border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                        <IndianRupee className="w-4 h-4 text-slate-700" />
                      </div>
                      <div>
                        <span className="block text-xs font-black uppercase text-slate-900">Standard Annual Fees</span>
                        <span className="block text-[11px] text-slate-500 font-semibold mt-0.5">Counter published rate</span>
                      </div>
                    </div>
                  </td>

                  {selectedInstitutes.map((inst, idx) => {
                    const isWinner = getWinnerInfo?.feeWinner === inst.id;
                    const isHighlighted = highlightDifferences && isWinner;

                    return (
                      <td 
                        key={inst.id} 
                        className={`p-5 align-middle ${
                          idx < selectedInstitutes.length - 1 ? "border-r-2 border-slate-300" : ""
                        } ${isHighlighted ? "bg-emerald-50/60" : "bg-white"}`}
                      >
                        <div className={`p-3 rounded-2xl border-2 transition-all ${
                          isHighlighted ? "bg-emerald-50 border-emerald-400 shadow-xs" : "bg-slate-50/80 border-slate-200"
                        }`}>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-lg font-black text-slate-900">
                              {inst.fees}
                            </span>
                            {isWinner && (
                              <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Trophy className="w-3 h-3 text-amber-500 fill-amber-500" />
                                Best Price
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500 font-medium block mt-1">
                            Tuition + Modules Kit + CBT All-India Test Series
                          </span>
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* Metric 7: FutureSelector Counter Voucher Grant */}
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-5 font-black text-slate-900 bg-slate-50 border-r-2 border-slate-300">
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-white border-2 border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                      </div>
                      <div>
                        <span className="block text-xs font-black uppercase text-slate-900">FutureSelector Pass</span>
                        <span className="block text-[11px] text-slate-500 font-semibold mt-0.5">Counter fee concession</span>
                      </div>
                    </div>
                  </td>

                  {selectedInstitutes.map((inst, idx) => (
                    <td 
                      key={inst.id} 
                      className={`p-5 align-middle bg-white ${
                        idx < selectedInstitutes.length - 1 ? "border-r-2 border-slate-300" : ""
                      }`}
                    >
                      <div className="p-3 rounded-2xl bg-emerald-50 border-2 border-emerald-300">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-xl bg-emerald-600 text-white text-xs font-black tracking-wide">
                            Flat ₹15,000 Off
                          </span>
                        </div>
                        <span className="text-[10px] text-emerald-800 font-bold block mt-1.5 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Honored directly at official cash counter</span>
                        </span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Metric 8: Net Effective Payable Fee */}
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-5 font-black text-slate-900 bg-slate-50 border-r-2 border-slate-300">
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-white border-2 border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                        <TrendingUp className="w-4 h-4 text-emerald-700" />
                      </div>
                      <div>
                        <span className="block text-xs font-black uppercase text-slate-900">Effective Net Payable</span>
                        <span className="block text-[11px] text-slate-500 font-semibold mt-0.5">After FS Grant applied</span>
                      </div>
                    </div>
                  </td>

                  {selectedInstitutes.map((inst, idx) => {
                    const base = inst.numericFee || parseInt(inst.fees?.replace(/[^\d]/g, "") || "140000");
                    const net = Math.max(0, base - 15000);

                    return (
                      <td 
                        key={inst.id} 
                        className={`p-5 align-middle bg-white ${
                          idx < selectedInstitutes.length - 1 ? "border-r-2 border-slate-300" : ""
                        }`}
                      >
                        <div className="p-3 rounded-2xl bg-slate-900 text-white border-2 border-slate-800">
                          <span className="text-lg font-black text-emerald-400 block">
                            ₹{net.toLocaleString("en-IN")} / Yr
                          </span>
                          <span className="text-[10px] text-slate-300 font-semibold block mt-0.5">
                            Total payable during counter enrollment
                          </span>
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* Metric 9: Supreme Court Refund Policy Compliance */}
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-5 font-black text-slate-900 bg-slate-50 border-r-2 border-slate-300">
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-white border-2 border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                        <ShieldCheck className="w-4 h-4 text-emerald-700" />
                      </div>
                      <div>
                        <span className="block text-xs font-black uppercase text-slate-900">Refund Escrow</span>
                        <span className="block text-[11px] text-slate-500 font-semibold mt-0.5">15-day pro-rata refund law</span>
                      </div>
                    </div>
                  </td>

                  {selectedInstitutes.map((inst, idx) => (
                    <td 
                      key={inst.id} 
                      className={`p-5 align-middle bg-white ${
                        idx < selectedInstitutes.length - 1 ? "border-r-2 border-slate-300" : ""
                      }`}
                    >
                      <div className="p-3 rounded-2xl bg-slate-50/80 border-2 border-slate-200 space-y-1">
                        <div className="inline-flex items-center gap-1.5 font-bold text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 text-xs">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          <span>100% Supreme Court Audited</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-medium block">
                          Pro-rata refund legally guaranteed within 15 days of batch start
                        </span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* -------------------------------------------------------- */}
                {/* CHAPTER 3: CAMPUS LIVING & REPUTATION */}
                {/* -------------------------------------------------------- */}
                <tr className="bg-indigo-900 text-white">
                  <td colSpan={selectedInstitutes.length + 1} className="py-3 px-5">
                    <div className="flex items-center gap-2.5 font-black text-xs sm:text-sm uppercase tracking-wider">
                      <div className="w-6 h-6 rounded-lg bg-indigo-500/30 flex items-center justify-center border border-indigo-400/30">
                        <Building2 className="w-3.5 h-3.5 text-indigo-300" />
                      </div>
                      <span>Chapter 3: Campus Living, Hostels & Verified Student Reviews</span>
                    </div>
                  </td>
                </tr>

                {/* Metric 10: Verified Student Reviews */}
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-5 font-black text-slate-900 bg-slate-50 border-r-2 border-slate-300">
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-white border-2 border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      </div>
                      <div>
                        <span className="block text-xs font-black uppercase text-slate-900">Student Reviews</span>
                        <span className="block text-[11px] text-slate-500 font-semibold mt-0.5">Authentic enrolled batch ratings</span>
                      </div>
                    </div>
                  </td>

                  {selectedInstitutes.map((inst, idx) => {
                    const isWinner = getWinnerInfo?.ratingWinner === inst.id;

                    return (
                      <td 
                        key={inst.id} 
                        className={`p-5 align-middle bg-white ${
                          idx < selectedInstitutes.length - 1 ? "border-r-2 border-slate-300" : ""
                        }`}
                      >
                        <div className="p-3 rounded-2xl bg-slate-50/80 border-2 border-slate-200">
                          <div className="flex items-center gap-2 font-black text-slate-900 text-sm">
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                            <span>{inst.rating} / 5.0</span>
                            {isWinner && (
                              <span className="text-[10px] font-black text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full">
                                Top Rated
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500 font-medium block mt-1">
                            Based on {inst.reviews} verified alumni reviews
                          </span>
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* Metric 11: Hostel Proximity & Food */}
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-5 font-black text-slate-900 bg-slate-50 border-r-2 border-slate-300">
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-white border-2 border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                        <MapPin className="w-4 h-4 text-emerald-700" />
                      </div>
                      <div>
                        <span className="block text-xs font-black uppercase text-slate-900">Hostel Proximity</span>
                        <span className="block text-[11px] text-slate-500 font-semibold mt-0.5">Walking distance to classrooms</span>
                      </div>
                    </div>
                  </td>

                  {selectedInstitutes.map((inst, idx) => (
                    <td 
                      key={inst.id} 
                      className={`p-5 align-middle bg-white ${
                        idx < selectedInstitutes.length - 1 ? "border-r-2 border-slate-300" : ""
                      }`}
                    >
                      <div className="p-3 rounded-2xl bg-slate-50/80 border-2 border-slate-200">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs sm:text-sm">
                          <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{inst.hostelDistance || "Within 250m"}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-medium block mt-1">
                          FSSAI-certified canteens with biometric parental curfew
                        </span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* ============================================================ */}
                {/* BOTTOM CTAS: DIRECT ADMISSION ACTION ROW */}
                {/* ============================================================ */}
                <tr className="bg-slate-100/90 border-t-2 border-slate-300">
                  <td className="p-5 font-black text-slate-900 bg-slate-200/80 border-r-2 border-slate-300">
                    <span className="block text-xs font-black uppercase text-slate-900">Final Action</span>
                    <span className="block text-[11px] text-slate-600 font-medium mt-0.5">Direct seat reservation</span>
                  </td>

                  {selectedInstitutes.map((inst, idx) => (
                    <td 
                      key={inst.id} 
                      className={`p-5 align-middle bg-slate-50/80 ${
                        idx < selectedInstitutes.length - 1 ? "border-r-2 border-slate-300" : ""
                      }`}
                    >
                      <div className="space-y-2.5">
                        <button
                          onClick={() => setSeatLockTarget(inst)}
                          className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-95 transition-all"
                        >
                          <Sparkles className="w-4 h-4 text-amber-300" />
                          <span>Claim ₹15,000 Voucher</span>
                        </button>

                        <Link
                          to={`/institute/${inst.id}`}
                          className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border-2 border-slate-300 font-extrabold text-xs flex items-center justify-center gap-1.5 text-center shadow-2xs transition-all"
                        >
                          <span>View Institute Profile</span>
                          <ChevronRight className="w-4 h-4 text-slate-500" />
                        </Link>
                      </div>
                    </td>
                  ))}
                </tr>

              </tbody>
            </table>
          </div>
        </div>

        {/* ============================================================ */}
        {/* COUNSELLING / ASSISTANCE BANNER */}
        {/* ============================================================ */}
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 sm:p-8 shadow-md flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-black">
              <span>Unbiased Academic Mentorship</span>
            </div>
            <h4 className="font-black text-base sm:text-lg text-slate-900">
              Need personalized guidance before paying any coaching fee?
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl">
              Talk directly to an IIT/AIIMS alumnus counsellor who does not work on coaching commission. Free 15-minute 1-on-1 session.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link 
              to="/find-coaching" 
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border-2 border-slate-300 text-xs font-bold transition-all"
            >
              Browse All Hubs
            </Link>
            <Link 
              to="/counselling" 
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-2 shadow-sm transition-all"
            >
              <span>Book Free Mentor Call</span>
              <ArrowRight className="w-4 h-4 text-emerald-400" />
            </Link>
          </div>
        </div>

      </div>

      {/* Seat Lock Modal for Instant ₹15k Voucher Reservation */}
      {seatLockTarget && (
        <SeatLockModal
          institute={seatLockTarget}
          batches={[
            { name: "2026 Regular Classroom Batch", seatsLeft: "4 Seats Left", badgeColor: "bg-red-50 text-red-600 border-red-200" },
            { name: "2026 Rankers Repeaters Batch", seatsLeft: "7 Seats Left", badgeColor: "bg-amber-50 text-amber-600 border-amber-200" }
          ]}
          onClose={() => setSeatLockTarget(null)}
        />
      )}

      {/* Auth Modal if needed */}
      <AuthModal />
    </div>
  );
}
