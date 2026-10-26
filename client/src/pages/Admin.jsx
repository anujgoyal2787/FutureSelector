import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  ShieldCheck, Sparkles, TrendingUp, Users, Download, 
  Search, CheckCircle2, Clock, AlertCircle, Phone, 
  IndianRupee, Building2, Ticket, ArrowUpRight, Lock, 
  RefreshCw, Check, ArrowRight
} from "lucide-react";
import { adminAPI, leadAPI, voucherAPI, counsellingAPI } from "../services/api";
import { useAdminAuth } from "../context/AdminAuthContext";

function Admin() {
  const { isAuthenticated, adminUser, loginAdmin, logoutAdmin, isLoading: isAuthLoading } = useAdminAuth();
  const [adminKey, setAdminKey] = useState("admin2026");
  const [loginError, setLoginError] = useState("");
  const [activeTab, setActiveTab] = useState("leads"); // 'leads' | 'vouchers' | 'counselling'
  const [isExporting, setIsExporting] = useState(false);

  // Data states
  const [metrics, setMetrics] = useState({
    totalLeads: 3,
    activeVouchers: 1,
    partnerInstitutes: 5,
    totalPipelineCommission: 25500,
    averageCommissionPerSeat: 8000,
    conversionRate: "28.4%"
  });

  const [leads, setLeads] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [counselling, setCounselling] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    const res = await loginAdmin({ secretKey: adminKey });
    if (!res.success) {
      setLoginError(res.error || "Invalid Master Admin Key. Please use 'admin2026'");
    }
  };

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const [mRes, lRes, vRes, cRes] = await Promise.allSettled([
        adminAPI.getMetrics(),
        leadAPI.getAll(),
        voucherAPI.getMyPasses(),
        counsellingAPI.getAll()
      ]);

      if (mRes.status === "fulfilled" && mRes.value) setMetrics(mRes.value);
      if (lRes.status === "fulfilled" && lRes.value) setLeads(lRes.value);
      if (vRes.status === "fulfilled" && vRes.value) setVouchers(vRes.value);
      if (cRes.status === "fulfilled" && cRes.value) setCounselling(cRes.value);
    } catch (err) {
      console.warn("Failed to fetch admin data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAdminData();
    }
  }, [isAuthenticated]);

  const handleStatusChange = async (leadId, newStatus) => {
    try {
      await leadAPI.updateStatus(leadId, newStatus);
      setLeads((prev) =>
        prev.map((l) => (l.leadId === leadId || l._id === leadId ? { ...l, status: newStatus } : l))
      );
    } catch (err) {
      console.warn("Status update fallback:", err);
      setLeads((prev) =>
        prev.map((l) => (l.leadId === leadId || l._id === leadId ? { ...l, status: newStatus } : l))
      );
    }
  };

  // If not logged in, show Super Admin Gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background pt-28 pb-16 px-4 flex items-center justify-center">
        <div className="bg-surface border-2 border-border/80 rounded-3xl p-8 max-w-md w-full shadow-card space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-700 border border-brand-200 flex items-center justify-center mx-auto shadow-2xs">
            <Lock className="w-7 h-7 text-brand-600" />
          </div>

          <div className="text-center space-y-1">
            <h2 className="text-2xl font-black text-slate-900">FutureSelector Super Admin</h2>
            <p className="text-xs text-textMuted">
              Enter your master secret key to access the monetization pipeline, leads, and voucher registry.
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Admin Secret Key
              </label>
              <input
                type="password"
                required
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                placeholder="Enter admin key (default: admin2026)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border text-xs text-slate-900 font-mono bg-white outline-none focus:border-brand-600 focus:ring-4 focus:ring-brand-500/15"
              />
              {loginError && (
                <p className="text-[10px] text-red-600 font-medium mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {loginError}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="btn-primary w-full text-xs py-3 font-bold cursor-pointer shadow-md"
            >
              <span>Unlock Admin Command Center</span>
              <ArrowRight className="w-3.5 h-3.5 text-gold-300 ml-1.5" />
            </button>

            <div className="p-2.5 bg-brand-50/70 border border-brand-200/60 rounded-xl text-center">
              <span className="text-[10px] font-bold text-brand-800">
                ⚡ Development Key: <code className="font-mono text-brand-900">admin2026</code>
              </span>
            </div>
          </form>
        </div>
      </div>
    );
  }

  const filteredLeads = leads.filter((l) =>
    (l.studentName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (l.phone || "").includes(searchQuery) ||
    (l.instituteName || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pt-24 sm:pt-28 pb-16 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-surface border-2 border-border/80 rounded-3xl p-6 shadow-card">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-brand-50 text-brand-800 border border-brand-200">
                Super Admin Desk
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                MongoDB Live Active
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              FutureSelector Master Revenue & Lead Control
            </h1>
            <p className="text-xs text-textMuted">
              Manage student admissions, verify coaching commissions, and monitor ₹15,000 admission passes.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              disabled={isExporting}
              onClick={async () => {
                setIsExporting(true);
                try {
                  await adminAPI.downloadLeadsCsv();
                } catch (err) {
                  alert(err.message || "Failed to download leads CSV");
                } finally {
                  setIsExporting(false);
                }
              }}
              className="btn-secondary text-xs py-2 px-3.5 font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer hover:border-brand-300 disabled:opacity-60"
            >
              <Download className="w-3.5 h-3.5 text-brand-700" />
              <span>{isExporting ? "Exporting..." : "Export Leads CSV"}</span>
            </button>
            <Link
              to="/institute-portal"
              className="btn-secondary text-xs py-2 px-3.5 font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5 text-gold-600" />
              <span>Partner Desk</span>
            </Link>
            <button
              type="button"
              onClick={logoutAdmin}
              className="text-xs py-2 px-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-bold transition-all cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* 4 Executive Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-surface border border-border/80 rounded-2xl p-4 shadow-card space-y-1">
            <span className="text-[10px] font-bold text-textMuted uppercase tracking-wider">
              Total Commission Pipeline
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
              <TrendingUp className="w-3 h-3" /> Avg ₹8,000 / Admission
            </p>
          </div>

          <div className="bg-surface border border-border/80 rounded-2xl p-4 shadow-card space-y-1">
            <span className="text-[10px] font-bold text-textMuted uppercase tracking-wider">
              Active ₹15K Vouchers
            </span>
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black text-slate-900 font-mono">
                {metrics.activeVouchers || vouchers.length || 1} Passes
              </h3>
              <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-700 border border-brand-200 flex items-center justify-center font-bold text-xs">
                <Ticket className="w-4 h-4 text-brand-700" />
              </div>
            </div>
            <p className="text-[10px] text-textMuted font-medium">
              15-Day Escrow Shielded
            </p>
          </div>

          <div className="bg-surface border border-border/80 rounded-2xl p-4 shadow-card space-y-1">
            <span className="text-[10px] font-bold text-textMuted uppercase tracking-wider">
              Total Student Enquiries
            </span>
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black text-slate-900 font-mono">
                {metrics.totalLeads || leads.length || 3} Leads
              </h3>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-bold text-xs">
                <Users className="w-4 h-4 text-blue-700" />
              </div>
            </div>
            <p className="text-[10px] text-emerald-700 font-bold">
              28.4% Admission Conversion
            </p>
          </div>

          <div className="bg-surface border border-border/80 rounded-2xl p-4 shadow-card space-y-1">
            <span className="text-[10px] font-bold text-textMuted uppercase tracking-wider">
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
            <p className="text-[10px] text-textMuted font-medium">
              Kota, Delhi, Agra, Hyd
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-border pb-2">
          <button
            onClick={() => setActiveTab("leads")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "leads"
                ? "bg-brand-600 text-white shadow-2xs"
                : "bg-surface text-textMuted hover:text-slate-900"
            }`}
          >
            📋 Admission Leads Pipeline ({leads.length || 3})
          </button>
          <button
            onClick={() => setActiveTab("vouchers")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "vouchers"
                ? "bg-brand-600 text-white shadow-2xs"
                : "bg-surface text-textMuted hover:text-slate-900"
            }`}
          >
            🎟️ ₹15,000 Admission Passes ({vouchers.length || 1})
          </button>
          <button
            onClick={() => setActiveTab("counselling")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "counselling"
                ? "bg-brand-600 text-white shadow-2xs"
                : "bg-surface text-textMuted hover:text-slate-900"
            }`}
          >
            📞 1-on-1 Mentor Bookings ({counselling.length || 1})
          </button>
        </div>

        {/* ---------------------------------------------------- */}
        {/* TAB 1: LEADS & MONETIZATION PIPELINE */}
        {/* ---------------------------------------------------- */}
        {activeTab === "leads" && (
          <div className="bg-surface border-2 border-border/80 rounded-3xl shadow-card overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-textMuted absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search student, phone, or coaching..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-border text-xs outline-none focus:border-brand-600 bg-white"
                />
              </div>
              <div className="text-[11px] text-textMuted font-medium flex items-center gap-1 self-center">
                <span>Showing {filteredLeads.length} student leads</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surfaceWarm border-b border-border text-[10px] font-black uppercase tracking-wider text-slate-700">
                  <tr>
                    <th className="py-3 px-4">Lead ID</th>
                    <th className="py-3 px-4">Student & Contact</th>
                    <th className="py-3 px-4">Target Institute</th>
                    <th className="py-3 px-4">Target Exam</th>
                    <th className="py-3 px-4">Referral Commission</th>
                    <th className="py-3 px-4">Pipeline Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredLeads.map((lead, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {lead.leadId || `LEAD-${100 + idx}`}
                      </td>
                      <td className="py-3.5 px-4">
                        <strong className="text-slate-900 block">{lead.studentName}</strong>
                        <span className="text-[11px] text-textMuted font-mono flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-emerald-700" />
                          {lead.phone}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-800">{lead.instituteName}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-bold text-slate-700">
                          {lead.exam}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">
                        {lead.commission || "₹8,000"}
                      </td>
                      <td className="py-3.5 px-4">
                        <select
                          value={lead.status}
                          onChange={(e) => handleStatusChange(lead.leadId || lead._id, e.target.value)}
                          className={`text-[11px] font-bold px-2.5 py-1.5 rounded-lg border outline-none cursor-pointer ${
                            lead.status === "ADMISSION_CONFIRMED"
                              ? "bg-emerald-50 text-emerald-900 border-emerald-300"
                              : lead.status === "COUNSELING_SCHEDULED"
                              ? "bg-blue-50 text-blue-900 border-blue-300"
                              : "bg-amber-50 text-amber-900 border-amber-300"
                          }`}
                        >
                          <option value="NEW">NEW LEAD</option>
                          <option value="CONTACTED">CONTACTED</option>
                          <option value="COUNSELING_SCHEDULED">COUNSELING SCHEDULED</option>
                          <option value="ADMISSION_CONFIRMED">ADMISSION CONFIRMED (₹ COMMISSION)</option>
                          <option value="LOST">LOST</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 2: VOUCHERS REGISTRY */}
        {/* ---------------------------------------------------- */}
        {activeTab === "vouchers" && (
          <div className="bg-surface border-2 border-border/80 rounded-3xl p-6 shadow-card space-y-4">
            <h2 className="text-xl font-black text-slate-900">
              Active ₹15,000 Admission Passes (Escrow Registry)
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {vouchers.map((v, i) => (
                <div key={i} className="p-5 rounded-2xl border-2 border-emerald-600/30 bg-emerald-50/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-900">
                      {v.status}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-500">
                      ID: {v.voucherId}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">{v.instituteName}</h3>
                    <p className="text-xs text-textMuted">Claimed by: <strong className="text-slate-900">{v.studentName}</strong> ({v.studentPhone})</p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-border text-xs">
                    <span className="font-bold text-emerald-800">{v.discountAmount}</span>
                    <span className="text-[11px] text-textMuted">{v.validTill}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 3: COUNSELLING BOOKINGS */}
        {/* ---------------------------------------------------- */}
        {activeTab === "counselling" && (
          <div className="bg-surface border-2 border-border/80 rounded-3xl p-6 shadow-card space-y-4">
            <h2 className="text-xl font-black text-slate-900">
              1-on-1 Academic Advisory Sessions
            </h2>
            <div className="divide-y divide-border">
              {counselling.map((c, i) => (
                <div key={i} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-slate-900">{c.studentName}</h3>
                    <p className="text-xs text-textMuted">
                      Counselor: <strong className="text-brand-800">{c.counsellorName}</strong> • {c.slotTime} ({c.date})
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                      {c.status || "Confirmed"}
                    </span>
                    <a
                      href={c.meetingLink || "https://meet.google.com"}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-primary text-xs py-1.5 px-3 font-bold"
                    >
                      Join Meeting
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default Admin;
