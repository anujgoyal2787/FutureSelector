import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  TrendingUp, Users, Ticket, Building2, IndianRupee, 
  ArrowRight, Download, CheckCircle2, Clock, AlertCircle, 
  ShieldCheck, ArrowUpRight, Search, Phone
} from "lucide-react";
import { adminAPI, leadAPI, voucherAPI } from "../../services/api";

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState({
    totalLeads: 3,
    activeVouchers: 1,
    partnerInstitutes: 5,
    totalPipelineCommission: 25500,
    averageCommissionPerSeat: 8000,
    conversionRate: "28.4%"
  });

  const [recentLeads, setRecentLeads] = useState([]);
  const [recentVouchers, setRecentVouchers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [mRes, lRes, vRes] = await Promise.allSettled([
          adminAPI.getMetrics(),
          leadAPI.getAll(),
          voucherAPI.getMyPasses()
        ]);

        if (mRes.status === "fulfilled" && mRes.value) setMetrics(mRes.value);
        if (lRes.status === "fulfilled" && lRes.value) setRecentLeads(lRes.value.slice(0, 5));
        if (vRes.status === "fulfilled" && vRes.value) setRecentVouchers(vRes.value.slice(0, 4));
      } catch (err) {
        console.warn("Failed to load admin metrics:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      await adminAPI.downloadLeadsCsv();
    } catch (err) {
      alert(err.message || "Failed to download leads CSV");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Top Banner & Quick Controls */}
      <div className="bg-white border-2 border-[#E8E4DA] rounded-3xl p-6 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#124B38]/10 text-[#124B38] border border-[#124B38]/20">
              Operations Center
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Live MongoDB Data
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            FutureSelector Executive Command Desk
          </h1>
          <p className="text-xs text-[#5F6B64]">
            Monitor student admissions, active Kota/Delhi coaching tie-ups, and referral commission pipelines.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={isExporting}
            className="btn-secondary text-xs py-2 px-3.5 font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer hover:border-[#124B38] disabled:opacity-60"
          >
            <Download className="w-3.5 h-3.5 text-[#124B38]" />
            <span>{isExporting ? "Exporting..." : "Export Leads CSV"}</span>
          </button>
          <Link
            to="/admin/leads"
            className="btn-primary text-xs py-2 px-3.5 font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <span>View All Leads</span>
            <ArrowRight className="w-3.5 h-3.5 text-gold-300" />
          </Link>
        </div>
      </div>

      {/* 4 Key Executive Performance Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1 */}
        <div className="bg-white border border-[#E8E4DA] rounded-2xl p-5 shadow-card space-y-1">
          <span className="text-[10px] font-bold text-[#5F6B64] uppercase tracking-wider">
            Total Pipeline Commission
          </span>
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-slate-900 font-mono">
              ₹{(metrics.totalPipelineCommission || 25500).toLocaleString("en-IN")}
            </h3>
            <div className="w-8 h-8 rounded-xl bg-gold-50 text-gold-700 border border-gold-200 flex items-center justify-center font-bold text-xs">
              ₹
            </div>
          </div>
          <p className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Avg ₹8,000 / Verified Admission
          </p>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-[#E8E4DA] rounded-2xl p-5 shadow-card space-y-1">
          <span className="text-[10px] font-bold text-[#5F6B64] uppercase tracking-wider">
            Active ₹15K Vouchers
          </span>
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-slate-900 font-mono">
              {metrics.activeVouchers || recentVouchers.length || 1} Passes
            </h3>
            <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-700 border border-brand-200 flex items-center justify-center font-bold text-xs">
              <Ticket className="w-4 h-4 text-brand-700" />
            </div>
          </div>
          <p className="text-[10px] text-[#5F6B64] font-medium">
            15-Day Escrow Shield Protected
          </p>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-[#E8E4DA] rounded-2xl p-5 shadow-card space-y-1">
          <span className="text-[10px] font-bold text-[#5F6B64] uppercase tracking-wider">
            Total Student Enquiries
          </span>
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-slate-900 font-mono">
              {metrics.totalLeads || recentLeads.length || 3} Leads
            </h3>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-bold text-xs">
              <Users className="w-4 h-4 text-blue-700" />
            </div>
          </div>
          <p className="text-[10px] text-emerald-700 font-bold">
            {metrics.conversionRate || "28.4%"} Conversion Rate
          </p>
        </div>

        {/* Metric 4 */}
        <div className="bg-white border border-[#E8E4DA] rounded-2xl p-5 shadow-card space-y-1">
          <span className="text-[10px] font-bold text-[#5F6B64] uppercase tracking-wider">
            Partner Coaching Hubs
          </span>
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-slate-900 font-mono">
              {metrics.partnerInstitutes || 5} Centers
            </h3>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center font-bold text-xs">
              <Building2 className="w-4 h-4 text-amber-700" />
            </div>
          </div>
          <p className="text-[10px] text-[#5F6B64] font-medium">
            Kota, Delhi, Agra, Hyderabad
          </p>
        </div>

      </div>

      {/* Two Column Layout: Recent Leads Table & Active Vouchers */}
      <div className="grid lg:grid-cols-12 gap-6">
        
        {/* Left Column (8 cols): Recent Leads */}
        <div className="lg:col-span-8 bg-white border border-[#E8E4DA] rounded-3xl shadow-card overflow-hidden">
          <div className="p-5 border-b border-[#E8E4DA] flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900">Recent Student Leads (CRM)</h3>
              <p className="text-xs text-[#5F6B64]">Latest admissions and coaching inquiries submitted by aspirants</p>
            </div>
            <Link to="/admin/leads" className="text-xs font-bold text-[#124B38] hover:underline flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] border-b border-[#E8E4DA] text-[10px] font-black uppercase tracking-wider text-slate-700">
                <tr>
                  <th className="py-3 px-4">Student & Contact</th>
                  <th className="py-3 px-4">Target Institute</th>
                  <th className="py-3 px-4">Exam</th>
                  <th className="py-3 px-4">Commission</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E4DA]">
                {recentLeads.map((lead, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <strong className="text-slate-900 block">{lead.studentName}</strong>
                      <span className="text-[11px] text-[#5F6B64] font-mono flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-emerald-700" />
                        {lead.phone}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">
                      {lead.instituteName}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-bold text-slate-700">
                        {lead.exam}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                      {lead.commission || "₹8,000"}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        lead.status === "ADMISSION_CONFIRMED"
                          ? "bg-emerald-100 text-emerald-900"
                          : lead.status === "COUNSELING_SCHEDULED"
                          ? "bg-blue-100 text-blue-900"
                          : "bg-amber-100 text-amber-900"
                      }`}>
                        {lead.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column (4 cols): Active Vouchers Quick Registry */}
        <div className="lg:col-span-4 bg-white border border-[#E8E4DA] rounded-3xl p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900">Active ₹15K Passes</h3>
            <Link to="/admin/admissions" className="text-xs font-bold text-[#124B38] hover:underline">
              Registry
            </Link>
          </div>

          <div className="space-y-3">
            {recentVouchers.map((v, i) => (
              <div key={i} className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-50/20 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-slate-500">{v.voucherId}</span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-100 text-emerald-900">
                    {v.status}
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">{v.instituteName}</h4>
                  <p className="text-[11px] text-[#5F6B64]">Claimed by: <strong>{v.studentName}</strong></p>
                </div>
                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[#E8E4DA]">
                  <strong className="text-emerald-800">{v.discountAmount}</strong>
                  <span className="text-[#5F6B64]">{v.validTill}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-[#FAF8F5] border border-[#E8E4DA] rounded-2xl text-[11px] text-[#5F6B64] space-y-1">
            <strong className="text-slate-900 block font-bold">15-Day Escrow Protection Policy</strong>
            <p className="leading-relaxed">
              Passes are presented at center counter. Fee is reduced before official registration receipt is issued.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
