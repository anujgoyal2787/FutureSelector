import { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRightLeft, ShieldCheck, ArrowRight, CheckCircle2, 
  Star, MapPin, Users, IndianRupee, Lock, ChevronRight, Plus, X,
  Sparkles, Share2, Printer, Trophy, Flame, Check, Copy, 
  Award, Zap, BookOpen, Building2, ThumbsUp, Scale
} from "lucide-react";
import { institutesData } from "../data/institutes";
import { useAuth } from "../context/AuthContext";
import AuthModal from "../component/AuthModal";
import SeatLockModal from "../component/SeatLockModal";
import StarBorder from "../component/reactbits/StarBorder";
import ShinyText from "../component/reactbits/ShinyText";
import BorderBeam from "../component/reactbits/BorderBeam";

// Legendary Matchup Presets for 1-Click Instant Comparison
const PRESETS = [
  { label: "Allen vs Resonance", subtitle: "Kota JEE Titans", ids: [1, 2], icon: "⚔️" },
  { label: "Aakash vs Allen", subtitle: "NEET Medical Battle", ids: [3, 1], icon: "🩺" },
  { label: "FIITJEE vs Motion", subtitle: "Advanced Problem Solving", ids: [4, 5], icon: "⚡" },
  { label: "Allen vs FIITJEE", subtitle: "Top Rankers Benchmark", ids: [1, 4], icon: "🏆" }
];

export default function Compare() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, openAuthModal } = useAuth();
  
  // Modals state
  const [seatLockTarget, setSeatLockTarget] = useState(null);
  const [highlightDifferences, setHighlightDifferences] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  // Parse IDs from URL query e.g. ?ids=1,2
  const initialIds = useMemo(() => {
    const raw = searchParams.get("ids");
    if (!raw) return [1, 2];
    const parsed = raw.split(",").map(Number).filter(Boolean);
    return parsed.length >= 2 ? parsed.slice(0, 3) : [1, 2];
  }, [searchParams]);

  const [selectedIds, setSelectedIds] = useState(initialIds);

  // Sync state with URL params when changed
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

    // Lowest numeric fee
    let minFee = Infinity;
    let feeWinner = null;

    // Smallest batch size
    let minBatch = Infinity;
    let batchWinner = null;

    // Highest selection rate
    let maxSelection = -1;
    let selectionWinner = null;

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
    });

    return { feeWinner, batchWinner, selectionWinner };
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
    text += `🔗 *View Live Interactive Comparison:* ${window.location.href}`;

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
    <div className="min-h-screen bg-background pt-24 sm:pt-28 pb-20 px-4 sm:px-6 relative overflow-hidden">
      
      {/* Background Soft Ambient Lights */}
      <div className="absolute top-10 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-brand-600/8 via-emerald-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[450px] h-[450px] bg-gradient-to-bl from-gold-500/10 via-amber-400/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-6 sm:space-y-8">
        
        {/* ============================================================ */}
        {/* TOP SECTION: TITLE, BADGE, AND ACTION TOOLBAR */}
        {/* ============================================================ */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/80 pb-6">
          <div>
            {/* Header Tag */}
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-900 text-xs font-bold mb-3 shadow-2xs"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-brand-600" />
              <span>Side-by-Side Audited Comparison Matrix</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight"
            >
              Compare Coaching <span className="text-brand-600">Head-to-Head</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xs sm:text-sm text-slate-700 max-w-2xl mt-2 font-medium leading-relaxed"
            >
              Objective, uncompromised analysis of verified classroom batch limits, itemized tuition schedules, and audited JEE/NEET selection percentages.
            </motion.p>
          </div>

          {/* Quick Actions: Share, Print & 3rd Slot */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleShareWithParents}
              className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95 transition-all"
              title="Share comparison summary directly to WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Share with Parents</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="px-3 py-2 rounded-xl bg-surface hover:bg-surfaceWarm text-textMain border border-border text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95 transition-all"
              title="Copy shareable link"
            >
              {copiedShare ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-textMuted" />}
              <span>{copiedShare ? "Link Copied!" : "Copy Link"}</span>
            </button>

            <button
              onClick={handlePrint}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-surface hover:bg-surfaceWarm text-textMain border border-border text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95 transition-all hidden sm:flex"
              title="Print comparison table"
            >
              <Printer className="w-3.5 h-3.5 text-textMuted" />
              <span>Print</span>
            </button>

            {selectedIds.length < 3 && (
              <button
                onClick={addSlot}
                className="btn-secondary text-xs py-2 px-3.5 gap-1.5 cursor-pointer shadow-xs active:scale-95"
              >
                <Plus className="w-3.5 h-3.5 text-brand-600" />
                <span>Add 3rd Center</span>
              </button>
            )}
          </div>
        </div>

        {/* ============================================================ */}
        {/* 1-CLICK LEGENDARY MATCHUP PRESETS BAR */}
        {/* ============================================================ */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>Popular Rivalry Presets:</span>
            </span>
            <button
              onClick={() => setHighlightDifferences(!highlightDifferences)}
              className={`text-[11px] font-bold px-3 py-1 rounded-full border transition-all cursor-pointer flex items-center gap-1.5 ${
                highlightDifferences
                  ? "bg-brand-600 text-white border-brand-600 shadow-xs"
                  : "bg-surface border-border text-textMuted hover:text-textMain"
              }`}
            >
              <Trophy className="w-3 h-3 text-gold-300" />
              <span>{highlightDifferences ? "Highlighting Best Metrics ON" : "Highlight Best Metrics"}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth pb-1">
            {PRESETS.map((preset, idx) => {
              const isMatch = preset.ids.every(id => selectedIds.includes(id));
              return (
                <button
                  key={idx}
                  onClick={() => loadPreset(preset.ids)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-2 ${
                    isMatch 
                      ? "bg-brand-50 border-brand-300 text-brand-900 shadow-2xs ring-2 ring-brand-500/20" 
                      : "bg-surface hover:bg-surfaceWarm border-border text-textMain hover:border-brand-200"
                  }`}
                >
                  <span className="text-sm">{preset.icon}</span>
                  <div className="text-left">
                    <span className="block leading-tight">{preset.label}</span>
                    <span className="text-[10px] text-textMuted font-medium block">{preset.subtitle}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ============================================================ */}
        {/* FUTURESELECTOR SMART VERDICT BANNER (AI-POWERED RECOMMENDATION) */}
        {/* ============================================================ */}
        {selectedInstitutes.length >= 2 && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden bg-gradient-to-r from-brand-900 via-brand-800 to-emerald-950 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-brand-700/40"
          >
            <BorderBeam size={250} duration={7} borderWidth={2} colorFrom="#10B981" colorTo="#F59E0B" />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="bg-gold-500/20 text-gold-300 border border-gold-400/30 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-gold-400" />
                    FutureSelector Decision Analysis
                  </span>
                  <span className="text-[10px] text-emerald-300 font-bold bg-emerald-500/20 border border-emerald-400/30 px-2 py-0.5 rounded-full">
                    Audited Data Match
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white">
                  Which one is the best fit for your 2026 goal?
                </h3>
                <p className="text-xs text-white/85 max-w-3xl leading-relaxed">
                  Comparing <strong className="text-gold-300">{selectedInstitutes[0].name}</strong> vs <strong className="text-gold-300">{selectedInstitutes[1].name}</strong>: 
                  {selectedInstitutes[0].numericFee < selectedInstitutes[1].numericFee ? (
                    ` ${selectedInstitutes[0].name} offers lower annual tuition, while `
                  ) : (
                    ` ${selectedInstitutes[1].name} offers a more budget-friendly fee structure, while `
                  )}
                  {parseInt(selectedInstitutes[0].batchSize) < parseInt(selectedInstitutes[1].batchSize) ? (
                    `${selectedInstitutes[0].name} provides a tighter classroom cap for personal faculty attention.`
                  ) : (
                    `${selectedInstitutes[1].name} provides tighter classroom caps.`
                  )}
                </p>
              </div>

              {/* Differentiating Winner Badges */}
              <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 shrink-0">
                <div className="bg-white/10 backdrop-blur-md border border-white/15 px-3 py-2 rounded-2xl text-center">
                  <span className="text-[9px] uppercase font-bold text-white/70 block">Fee Winner</span>
                  <span className="text-xs font-black text-gold-300">
                    {selectedInstitutes.find(i => i.id === getWinnerInfo?.feeWinner)?.name.split(" ")[0]}
                  </span>
                </div>

                <div className="bg-white/10 backdrop-blur-md border border-white/15 px-3 py-2 rounded-2xl text-center">
                  <span className="text-[9px] uppercase font-bold text-white/70 block">Batch Cap Winner</span>
                  <span className="text-xs font-black text-emerald-300">
                    {selectedInstitutes.find(i => i.id === getWinnerInfo?.batchWinner)?.name.split(" ")[0]}
                  </span>
                </div>

                <div className="bg-white/10 backdrop-blur-md border border-white/15 px-3 py-2 rounded-2xl text-center">
                  <span className="text-[9px] uppercase font-bold text-white/70 block">Selection % Winner</span>
                  <span className="text-xs font-black text-amber-300">
                    {selectedInstitutes.find(i => i.id === getWinnerInfo?.selectionWinner)?.name.split(" ")[0]}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ============================================================ */}
        {/* MAIN COMPARISON MATRIX TABLE (ENHANCED VISIBILITY & DESIGN) */}
        {/* ============================================================ */}
        <div className="bg-surface rounded-3xl border border-border shadow-[0_16px_40px_rgba(18,75,56,0.06)] overflow-hidden">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse">
              
              {/* TABLE HEADER: INSTITUTE CARDS WITH LIVE DROPDOWN SELECTORS */}
              <thead>
                <tr className="border-b border-border bg-surfaceWarm/60">
                  <th className="p-4 sm:p-5 text-xs font-bold uppercase tracking-wider text-textMuted w-48 min-w-[160px] align-top">
                    <div className="space-y-1">
                      <span className="text-textMain font-extrabold text-sm block">Audited Metrics</span>
                      <span className="text-[10px] text-textMuted font-semibold block">Classroom & Fees Audit</span>
                    </div>
                  </th>

                  {selectedInstitutes.map((inst, idx) => (
                    <th key={inst.id} className="p-4 sm:p-5 min-w-[240px] max-w-[340px] align-top bg-white/40">
                      
                      {/* Top Slot Pill & Remove Action */}
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-brand-800 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
                          Option {idx + 1} • {inst.location.split(",")[0]}
                        </span>
                        {selectedInstitutes.length > 2 && (
                          <button
                            onClick={() => removeSlot(idx)}
                            className="w-6 h-6 rounded-full text-textMuted hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer"
                            title="Remove from comparison"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      
                      {/* Interactive Dropdown Selector */}
                      <select
                        value={inst.id}
                        onChange={(e) => handleSelectChange(idx, e.target.value)}
                        className="w-full bg-surface border-2 border-border hover:border-brand-400 focus:border-brand-600 rounded-xl px-3 py-2 text-xs font-black text-slate-900 shadow-2xs outline-none cursor-pointer mb-2 transition-all"
                      >
                        {institutesData.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name} ({item.location.split(",")[0]})
                          </option>
                        ))}
                      </select>

                      {/* Micro location and target tag */}
                      <div className="flex items-center gap-2 text-xs text-textMuted font-semibold">
                        <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                        <span className="truncate">{inst.location}</span>
                        <span>•</span>
                        <span className="text-brand-700 font-bold">{inst.type}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              {/* TABLE BODY: GROUPED BY CLEAR CHAPTERS */}
              <tbody className="divide-y divide-border text-xs sm:text-sm">
                
                {/* -------------------------------------------------------- */}
                {/* CHAPTER 1: ACADEMICS & SELECTION AUDIT */}
                {/* -------------------------------------------------------- */}
                <tr className="bg-brand-50/60 border-t border-b border-brand-100">
                  <td colSpan={selectedInstitutes.length + 1} className="py-2.5 px-4 sm:px-5">
                    <div className="flex items-center gap-2 text-brand-900 font-extrabold text-xs uppercase tracking-wider">
                      <BookOpen className="w-3.5 h-3.5 text-brand-700" />
                      <span>Chapter 1: Academics, Batch Limits & Selection Track</span>
                    </div>
                  </td>
                </tr>

                {/* Metric 1: Verified Classroom Batch Size */}
                <tr>
                  <td className="p-4 sm:p-5 font-bold text-slate-800 text-xs uppercase bg-surfaceWarm/30">
                    <div className="space-y-0.5">
                      <span>Classroom Batch Size</span>
                      <span className="block text-[10px] text-textMuted font-normal lowercase">physical headcount cap</span>
                    </div>
                  </td>
                  {selectedInstitutes.map((inst) => {
                    const isWinner = getWinnerInfo?.batchWinner === inst.id;
                    return (
                      <td key={inst.id} className={`p-4 sm:p-5 transition-colors ${
                        highlightDifferences && isWinner ? "bg-emerald-500/10" : ""
                      }`}>
                        <div className="flex items-center gap-2">
                          <div className="inline-flex items-center gap-1.5 font-black text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-300 text-xs shadow-2xs">
                            <Users className="w-3.5 h-3.5 text-emerald-700" />
                            <span>{inst.batchSize} (Audited)</span>
                          </div>
                          {isWinner && (
                            <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-0.5">
                              <Trophy className="w-2.5 h-2.5 text-gold-500 fill-gold-500" />
                              Tightest Cap
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* Metric 2: Qualifying Selection Rate */}
                <tr>
                  <td className="p-4 sm:p-5 font-bold text-slate-800 text-xs uppercase bg-surfaceWarm/30">
                    <div className="space-y-0.5">
                      <span>Selection Ratio %</span>
                      <span className="block text-[10px] text-textMuted font-normal lowercase">jee/neet qualifying audit</span>
                    </div>
                  </td>
                  {selectedInstitutes.map((inst) => {
                    const isWinner = getWinnerInfo?.selectionWinner === inst.id;
                    return (
                      <td key={inst.id} className={`p-4 sm:p-5 transition-colors ${
                        highlightDifferences && isWinner ? "bg-emerald-500/10" : ""
                      }`}>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-brand-900 text-base">
                            {inst.selectionRate}
                          </span>
                          {isWinner && (
                            <span className="text-[10px] font-bold text-brand-800 bg-brand-100 px-2 py-0.5 rounded-md flex items-center gap-0.5">
                              <Trophy className="w-2.5 h-2.5 text-gold-500 fill-gold-500" />
                              Highest %
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-textMuted font-medium block mt-0.5">
                          Verified against NTA roll registers
                        </span>
                      </td>
                    );
                  })}
                </tr>

                {/* Metric 3: Top AIR Milestone */}
                <tr>
                  <td className="p-4 sm:p-5 font-bold text-slate-800 text-xs uppercase bg-surfaceWarm/30">
                    Top AIR Milestones
                  </td>
                  {selectedInstitutes.map((inst) => (
                    <td key={inst.id} className="p-4 sm:p-5">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900">
                        <Award className="w-4 h-4 text-gold-500 shrink-0" />
                        <span>{inst.topRank}</span>
                      </div>
                      <span className="text-[10px] text-textMuted font-medium block mt-0.5">
                        Classroom rankers (not test-series only)
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Metric 4: Faculty Stability & Mentorship */}
                <tr>
                  <td className="p-4 sm:p-5 font-bold text-slate-800 text-xs uppercase bg-surfaceWarm/30">
                    Faculty Stability
                  </td>
                  {selectedInstitutes.map((inst) => (
                    <td key={inst.id} className="p-4 sm:p-5 text-slate-900 font-semibold">
                      <span>{inst.facultyHighlights || "Senior Ex-IITian Subject Mentors"}</span>
                      <span className="text-[10px] text-emerald-700 font-bold block mt-0.5 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Zero Mid-Session Faculty Shifting
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Metric 5: Doubt Clearing Architecture */}
                <tr>
                  <td className="p-4 sm:p-5 font-bold text-slate-800 text-xs uppercase bg-surfaceWarm/30">
                    Doubt Resolution
                  </td>
                  {selectedInstitutes.map((inst) => (
                    <td key={inst.id} className="p-4 sm:p-5 text-slate-900 font-medium">
                      <div className="inline-block bg-surfaceWarm px-2.5 py-1 rounded-lg border border-border text-xs font-bold text-slate-900">
                        {inst.doubtSupport || "Daily 1-on-1 Faculty Counters"}
                      </div>
                      <span className="text-[10px] text-textMuted font-medium block mt-1">
                        Daily afternoon hours reserved strictly for doubts
                      </span>
                    </td>
                  ))}
                </tr>

                {/* -------------------------------------------------------- */}
                {/* CHAPTER 2: FEES, VOUCHERS & REFUND COMPLIANCE */}
                {/* -------------------------------------------------------- */}
                <tr className="bg-amber-50/60 border-t border-b border-amber-100">
                  <td colSpan={selectedInstitutes.length + 1} className="py-2.5 px-4 sm:px-5">
                    <div className="flex items-center gap-2 text-amber-950 font-extrabold text-xs uppercase tracking-wider">
                      <IndianRupee className="w-3.5 h-3.5 text-amber-700" />
                      <span>Chapter 2: Financials, FS ₹15k Vouchers & Refund Escrow</span>
                    </div>
                  </td>
                </tr>

                {/* Metric 6: Annual Tuition */}
                <tr>
                  <td className="p-4 sm:p-5 font-bold text-slate-800 text-xs uppercase bg-surfaceWarm/30">
                    Standard Annual Fees
                  </td>
                  {selectedInstitutes.map((inst) => {
                    const isWinner = getWinnerInfo?.feeWinner === inst.id;
                    return (
                      <td key={inst.id} className={`p-4 sm:p-5 transition-colors ${
                        highlightDifferences && isWinner ? "bg-emerald-500/10" : ""
                      }`}>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-lg text-slate-900 block">
                            {inst.fees}
                          </span>
                          {isWinner && (
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-0.5">
                              <Trophy className="w-2.5 h-2.5 text-gold-500 fill-gold-500" />
                              Best Value
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-textMuted font-medium">
                          Tuition + Modules Kit + CBT Test Series
                        </span>
                      </td>
                    );
                  })}
                </tr>

                {/* Metric 7: FutureSelector Counter Voucher Grant */}
                <tr>
                  <td className="p-4 sm:p-5 font-bold text-slate-800 text-xs uppercase bg-surfaceWarm/30">
                    FutureSelector Grant
                  </td>
                  {selectedInstitutes.map((inst) => (
                    <td key={inst.id} className="p-4 sm:p-5">
                      <div className="inline-flex items-center gap-1.5 font-mono font-bold text-brand-900 bg-brand-50 px-2.5 py-1 rounded-xl border border-brand-300 text-xs shadow-2xs">
                        <Sparkles className="w-3.5 h-3.5 text-gold-500" />
                        <span>Flat ₹15,000 Off</span>
                      </div>
                      <span className="text-[10px] text-emerald-700 font-bold block mt-1">
                        ✓ Honored directly at official cash counter
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Metric 8: Effective Net Price */}
                <tr>
                  <td className="p-4 sm:p-5 font-bold text-slate-800 text-xs uppercase bg-surfaceWarm/30">
                    Effective Net Payable
                  </td>
                  {selectedInstitutes.map((inst) => {
                    const base = inst.numericFee || parseInt(inst.fees?.replace(/[^\d]/g, "") || "140000");
                    const net = Math.max(0, base - 15000);
                    return (
                      <td key={inst.id} className="p-4 sm:p-5">
                        <span className="font-black text-lg text-emerald-800 block">
                          ₹{net.toLocaleString("en-IN")} / Yr
                        </span>
                        <span className="text-[10px] text-slate-600 font-medium">
                          After applying ₹15k admission pass
                        </span>
                      </td>
                    );
                  })}
                </tr>

                {/* Metric 9: Supreme Court Refund Policy Compliance */}
                <tr>
                  <td className="p-4 sm:p-5 font-bold text-slate-800 text-xs uppercase bg-surfaceWarm/30">
                    Refund Protection
                  </td>
                  {selectedInstitutes.map((inst) => (
                    <td key={inst.id} className="p-4 sm:p-5">
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-300 text-xs">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>100% Policy Compliant</span>
                      </span>
                      <span className="text-[10px] text-textMuted font-medium block mt-1">
                        15-day pro-rata refund verified by FutureSelector
                      </span>
                    </td>
                  ))}
                </tr>

                {/* -------------------------------------------------------- */}
                {/* CHAPTER 3: LIVING ENVIRONMENT, HOSTELS & REPUTATION */}
                {/* -------------------------------------------------------- */}
                <tr className="bg-emerald-50/60 border-t border-b border-emerald-100">
                  <td colSpan={selectedInstitutes.length + 1} className="py-2.5 px-4 sm:px-5">
                    <div className="flex items-center gap-2 text-emerald-950 font-extrabold text-xs uppercase tracking-wider">
                      <Building2 className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Chapter 3: Campus Living, Hostels & Student Trust</span>
                    </div>
                  </td>
                </tr>

                {/* Metric 10: Verified Student Rating */}
                <tr>
                  <td className="p-4 sm:p-5 font-bold text-slate-800 text-xs uppercase bg-surfaceWarm/30">
                    Student Reviews
                  </td>
                  {selectedInstitutes.map((inst) => (
                    <td key={inst.id} className="p-4 sm:p-5">
                      <div className="flex items-center gap-1.5 font-black text-slate-900">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span>{inst.rating} / 5.0</span>
                        <span className="text-xs text-textMuted font-normal">
                          ({inst.reviews} verified reviews)
                        </span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Metric 11: Hostel Proximity & Food */}
                <tr>
                  <td className="p-4 sm:p-5 font-bold text-slate-800 text-xs uppercase bg-surfaceWarm/30">
                    Hostel & Food
                  </td>
                  {selectedInstitutes.map((inst) => (
                    <td key={inst.id} className="p-4 sm:p-5 text-slate-900 font-semibold">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                        <span>{inst.hostelDistance || "Within 250m"}</span>
                      </div>
                      <span className="text-[10px] text-textMuted font-medium block mt-0.5">
                        FSSAI-audited canteen & parent biometric curfew
                      </span>
                    </td>
                  ))}
                </tr>

                {/* ============================================================ */}
                {/* BOTTOM CTAS: LOCK SEAT WITH ₹15K WAIVER DIRECTLY */}
                {/* ============================================================ */}
                <tr className="bg-surfaceWarm/70">
                  <td className="p-4 sm:p-5 font-bold text-slate-800 text-xs uppercase">
                    Take Action
                  </td>
                  {selectedInstitutes.map((inst) => (
                    <td key={inst.id} className="p-4 sm:p-5">
                      <div className="space-y-2">
                        {/* Lock Seat CTA */}
                        <button
                          onClick={() => setSeatLockTarget(inst)}
                          className="w-full btn-primary text-xs py-2.5 px-3 font-bold shadow-md cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-gold-300" />
                          <span>Lock Seat & Claim ₹15k Waiver</span>
                        </button>

                        {/* View Full Dossier */}
                        <Link
                          to={`/institute/${inst.id}`}
                          className="w-full btn-secondary text-xs py-2 px-3 font-bold flex items-center justify-center gap-1 text-center"
                        >
                          <span>View Full Profile</span>
                          <ChevronRight className="w-3.5 h-3.5 text-brand-600" />
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
        {/* BOTTOM HELPFUL NAVIGATION & PARENT ASSIST */}
        {/* ============================================================ */}
        <div className="bg-surface border border-border rounded-3xl p-6 shadow-card flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="font-extrabold text-sm sm:text-base text-slate-900">
              Still confused which coaching center fits your learning style?
            </h4>
            <p className="text-xs text-textMuted">
              Book a 100% free 15-minute counseling session with an academic mentor who does not work on coaching commission.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link to="/" className="btn-secondary text-xs py-2.5 px-4 font-bold">
              ← Back to Hubs
            </Link>
            <Link to="/counselling" className="btn-primary text-xs py-2.5 px-5 font-bold flex items-center gap-1.5">
              <span>Talk to Mentor</span>
              <ArrowRight className="w-3.5 h-3.5" />
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
