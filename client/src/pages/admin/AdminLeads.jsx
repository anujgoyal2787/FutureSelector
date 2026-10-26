import { useState, useEffect } from "react";
import { Users, Search, Download, Phone, CheckCircle2, AlertCircle, Clock, Filter } from "lucide-react";
import { leadAPI, adminAPI } from "../../services/api";

export default function AdminLeads() {
  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isExporting, setIsExporting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLeads = async () => {
    try {
      const data = await leadAPI.getAll();
      setLeads(data);
    } catch (err) {
      console.warn("Failed to load leads:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleStatusChange = async (leadId, newStatus) => {
    try {
      await leadAPI.updateStatus(leadId, newStatus);
      setLeads(prev => prev.map(l => (l.leadId === leadId || l._id === leadId ? { ...l, status: newStatus } : l)));
    } catch (err) {
      alert("Failed to update status: " + err.message);
    }
  };

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

  const filtered = leads.filter(l => {
    const matchesSearch = (l.studentName || "").toLowerCase().includes(search.toLowerCase()) ||
                          (l.phone || "").includes(search) ||
                          (l.instituteName || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="bg-white border-2 border-[#E8E4DA] rounded-3xl p-6 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#124B38]/10 text-[#124B38] border border-[#124B38]/20">
            Aspirant Pipeline
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Students & Lead Management (CRM)
          </h1>
          <p className="text-xs text-[#5F6B64]">
            Track student applications, counselor follow-ups, and referral commission attributions.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCsv}
          disabled={isExporting}
          className="btn-secondary text-xs py-2.5 px-4 font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer hover:border-[#124B38] disabled:opacity-60"
        >
          <Download className="w-3.5 h-3.5 text-[#124B38]" />
          <span>{isExporting ? "Exporting..." : "Download Full Leads CSV"}</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-[#E8E4DA] rounded-2xl p-4 shadow-card flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#5F6B64] absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name, mobile, or coaching center..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#E8E4DA] text-xs outline-none focus:border-[#124B38] bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 rounded-xl border border-[#E8E4DA] text-xs font-bold text-slate-800 outline-none bg-white cursor-pointer"
          >
            <option value="all">All Stages ({leads.length})</option>
            <option value="NEW">New Leads</option>
            <option value="CONTACTED">Contacted</option>
            <option value="COUNSELING_SCHEDULED">Counseling Scheduled</option>
            <option value="ADMISSION_CONFIRMED">Admission Confirmed (₹ Commission)</option>
            <option value="LOST">Lost</option>
          </select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white border border-[#E8E4DA] rounded-3xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] border-b border-[#E8E4DA] text-[10px] font-black uppercase tracking-wider text-slate-700">
              <tr>
                <th className="py-3 px-4">Lead ID</th>
                <th className="py-3 px-4">Student & Contact</th>
                <th className="py-3 px-4">Target Coaching</th>
                <th className="py-3 px-4">Exam / Year</th>
                <th className="py-3 px-4">Commission</th>
                <th className="py-3 px-4">Lead Stage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E4DA]">
              {filtered.map((lead, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    {lead.leadId || `LEAD-${100 + idx}`}
                  </td>
                  <td className="py-3.5 px-4">
                    <strong className="text-slate-900 block font-bold text-sm">{lead.studentName}</strong>
                    <span className="text-[11px] text-[#5F6B64] font-mono flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-emerald-700" />
                      {lead.phone}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-800">
                    {lead.instituteName}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-bold text-slate-700">
                      {lead.exam} ({lead.targetYear || "2026"})
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

    </div>
  );
}
