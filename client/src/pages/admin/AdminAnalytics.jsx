import { useState } from "react";
import { 
  BarChart3, TrendingUp, Users, Target, CheckCircle2, 
  ArrowUpRight, Download, Filter, MapPin, Building2, Calendar
} from "lucide-react";

export default function AdminAnalytics() {
  const [timeRange, setTimeRange] = useState("30d");

  const funnelData = [
    { step: "Visitor Discovery (Unique Searchers)", count: 24500, pct: "100%" },
    { step: "Coaching Comparisons Executed", count: 8200, pct: "33.4%" },
    { step: "Lead Inquiry Submitted", count: 1840, pct: "7.5%" },
    { step: "Counsellor Discovery Call Connected", count: 1220, pct: "4.9%" },
    { step: "Admission Pass Generated (₹15,000 Grant)", count: 480, pct: "1.9%" },
    { step: "Verified Coaching Admission Confirmed", count: 184, pct: "0.75%" }
  ];

  const cityDemand = [
    { city: "Kota, Rajasthan", jeeShare: "68%", neetShare: "32%", totalInquiries: 740 },
    { city: "Delhi NCR", jeeShare: "54%", neetShare: "46%", totalInquiries: 480 },
    { city: "Hyderabad", jeeShare: "62%", neetShare: "38%", totalInquiries: 310 },
    { city: "Patna", jeeShare: "48%", neetShare: "52%", totalInquiries: 220 },
  ];

  const topInstitutes = [
    { name: "Allen Career Institute, Kota", admissions: 68, gmv: "₹98,60,000", commission: "₹11,83,200" },
    { name: "Aakash Institute, Delhi South Ex", admissions: 44, gmv: "₹59,40,000", commission: "₹5,94,000" },
    { name: "Motion Education, Kota", admissions: 38, gmv: "₹43,70,000", commission: "₹5,24,400" },
    { name: "Resonance Eduventures, Kota", admissions: 34, gmv: "₹40,80,000", commission: "₹6,12,000" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="bg-white border-2 border-[#E8E4DA] rounded-3xl p-6 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#124B38]/10 text-[#124B38] border border-[#124B38]/20">
            Business Intelligence
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2">
            Analytics & Conversion Intelligence
          </h1>
          <p className="text-xs text-[#5F6B64]">
            Track the end-to-end student admission funnel, JEE vs NEET market appetite, and institutional partner ROI.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="text-xs px-3 py-2 border border-[#E8E4DA] rounded-xl bg-white text-slate-700 outline-none font-bold cursor-pointer"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Current Academic Quarter</option>
          </select>

          <button
            onClick={() => alert("Downloading executive analytics report")}
            className="px-3.5 py-2 bg-[#124B38] hover:bg-[#0D3A2C] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* High-level KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E8E4DA] rounded-2xl p-5 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Total Inquiries Handled
          </span>
          <p className="text-2xl font-black text-slate-900">1,840</p>
          <span className="text-[11px] font-bold text-emerald-700 mt-1 inline-flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +24% vs last period
          </span>
        </div>

        <div className="bg-white border border-[#E8E4DA] rounded-2xl p-5 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Lead to Call Connect
          </span>
          <p className="text-2xl font-black text-[#124B38]">66.3%</p>
          <span className="text-[10px] text-[#5F6B64] font-medium block mt-1">Avg turnaround: 14 mins</span>
        </div>

        <div className="bg-white border border-[#E8E4DA] rounded-2xl p-5 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Pass to Admission Ratio
          </span>
          <p className="text-2xl font-black text-gold-900">38.3%</p>
          <span className="text-[10px] text-[#5F6B64] font-medium block mt-1">184 of 480 passes redeemed</span>
        </div>

        <div className="bg-white border border-[#E8E4DA] rounded-2xl p-5 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Blended Conversion (Funnel)
          </span>
          <p className="text-2xl font-black text-slate-900">10.0%</p>
          <span className="text-[10px] text-emerald-700 font-bold block mt-1">Industry standard: 4.2%</span>
        </div>
      </div>

      {/* Admission Funnel Graph */}
      <div className="bg-white border border-[#E8E4DA] rounded-3xl p-6 shadow-card space-y-4">
        <div>
          <h3 className="text-sm font-black text-slate-900">Student Journey Conversion Funnel</h3>
          <p className="text-xs text-[#5F6B64]">Drop-off analysis from initial directory exploration to physical classroom seat confirmation.</p>
        </div>

        <div className="space-y-3 pt-2">
          {funnelData.map((stage, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-slate-800">
                <span>{stage.step}</span>
                <span className="font-mono">{stage.count.toLocaleString()} ({stage.pct})</span>
              </div>
              <div className="h-3 w-full bg-[#FAF8F5] rounded-full overflow-hidden border border-[#E8E4DA]">
                <div
                  className="h-full bg-gradient-to-r from-[#124B38] to-[#C5A059] rounded-full transition-all duration-500"
                  style={{ width: stage.pct }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two-Column Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* City Demand Breakdown */}
        <div className="bg-white border border-[#E8E4DA] rounded-3xl p-6 shadow-card space-y-4">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#124B38]" />
            <span>City Hub Appetite: JEE vs NEET</span>
          </h3>

          <div className="space-y-3">
            {cityDemand.map((city, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl border border-[#E8E4DA] bg-[#FAF8F5] space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-900">
                  <span>{city.city}</span>
                  <span className="text-[11px] text-[#5F6B64] font-medium">{city.totalInquiries} inquiries</span>
                </div>
                <div className="flex h-2.5 rounded-full overflow-hidden">
                  <div style={{ width: city.jeeShare }} className="bg-[#124B38]" title={`JEE: ${city.jeeShare}`} />
                  <div style={{ width: city.neetShare }} className="bg-[#C5A059]" title={`NEET: ${city.neetShare}`} />
                </div>
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-[#124B38]">JEE: {city.jeeShare}</span>
                  <span className="text-gold-900">NEET: {city.neetShare}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Partner Performance */}
        <div className="bg-white border border-[#E8E4DA] rounded-3xl p-6 shadow-card space-y-4">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#124B38]" />
            <span>Top Performing Partner Institutes</span>
          </h3>

          <div className="space-y-3">
            {topInstitutes.map((inst, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl border border-[#E8E4DA] bg-[#FAF8F5] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{inst.name}</h4>
                  <div className="flex items-center gap-2 text-[10px] text-[#5F6B64] mt-0.5">
                    <span>{inst.admissions} Admissions</span>
                    <span>•</span>
                    <span>GMV: {inst.gmv}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#5F6B64] block font-bold uppercase">Commission</span>
                  <span className="text-xs font-black text-[#124B38]">{inst.commission}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
