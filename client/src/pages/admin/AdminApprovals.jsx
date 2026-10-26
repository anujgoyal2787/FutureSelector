import { useState, useEffect } from "react";
import { 
  FileCheck, ShieldAlert, Check, X, Clock, AlertCircle, 
  ArrowRight, UserCheck, Eye, Sparkles, Building2, Plus, 
  RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck
} from "lucide-react";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { adminAPI } from "../../services/api";

export default function AdminApprovals() {
  const { adminUser } = useAdminAuth();
  const [filterType, setFilterType] = useState("all");
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [showNewModal, setShowNewModal] = useState(false);

  // New Request Form State
  const [newType, setNewType] = useState("FEE_STRUCTURE_UPDATE");
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [diffField, setDiffField] = useState("Tuition Fee");
  const [diffOld, setDiffOld] = useState("");
  const [diffNew, setDiffNew] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchApprovals = async () => {
    setIsLoading(true);
    setActionError("");
    try {
      const res = await adminAPI.getApprovals(filterType);
      if (res && res.requests) {
        setRequests(res.requests);
      }
    } catch (err) {
      console.warn("Could not load approvals from backend, using fallback:", err);
      // Fallback
      setRequests([
        {
          requestId: "REQ-2026-0041",
          changeType: "FEE_STRUCTURE_UPDATE",
          targetTitle: "Motion Education, Kota",
          requestedBy: "kunal.ops@futureselector.com",
          requestedByRole: "OPERATIONS_MANAGER",
          createdAt: new Date().toISOString(),
          description: "Request to decrease 1-Year JEE Repeat batch fee from ₹1,35,000 to ₹1,15,000 for early bird admission round.",
          diff: {
            field: "Tuition Fee",
            oldValue: "₹1,35,000",
            newValue: "₹1,15,000 (15% reduction)"
          },
          status: "PENDING"
        },
        {
          requestId: "REQ-2026-0038",
          changeType: "FACULTY_ROSTER_UPDATE",
          targetTitle: "Allen Career Institute, Kota",
          requestedBy: "partner.desk@allen.in",
          requestedByRole: "PARTNER_REP",
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          description: "Added 2 new Senior HOD Physics mentors (ex-IIT Kharagpur) to the JEE Advanced Classroom profile.",
          diff: {
            field: "Faculty Strength",
            oldValue: "42 Senior Educators",
            newValue: "44 Senior Educators"
          },
          status: "PENDING"
        },
        {
          requestId: "REQ-2026-0031",
          changeType: "COMMISSION_RATE_OVERRIDE",
          targetTitle: "Narayana IIT Academy, Hyderabad",
          requestedBy: "vikram.bd@futureselector.com",
          requestedByRole: "OPERATIONS_MANAGER",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          description: "Override default 10% partner commission to 14% for all Andhra/Telangana top 100 batch enrolments.",
          diff: {
            field: "Contract Commission",
            oldValue: "10.0%",
            newValue: "14.0%"
          },
          status: "APPROVED",
          reviewedBy: "admin@futureselector.com",
          reviewedAt: new Date(Date.now() - 43200000).toISOString(),
          reviewNote: "Approved per Q4 strategic expansion terms"
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, [filterType]);

  const handleApprove = async (id) => {
    setActionError("");
    setActionSuccess("");
    try {
      const res = await adminAPI.approveRequest(id, "Approved by Super Admin under Two-Person Compliance Rule");
      if (res.success) {
        setActionSuccess(`Request ${id} approved and applied successfully!`);
        fetchApprovals();
      }
    } catch (err) {
      const msg = err.message || "Failed to approve request";
      setActionError(msg);
    }
  };

  const handleReject = async (id) => {
    const reason = prompt("Enter required rejection reason for compliance audit log:");
    if (!reason) return;
    setActionError("");
    setActionSuccess("");
    try {
      const res = await adminAPI.rejectRequest(id, reason);
      if (res.success) {
        setActionSuccess(`Request ${id} has been rejected.`);
        fetchApprovals();
      }
    } catch (err) {
      setActionError(err.message || "Failed to reject request");
    }
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    if (!newTitle || !newDesc || !diffOld || !diffNew) {
      alert("Please fill in all fields.");
      return;
    }
    setIsSubmitting(true);
    setActionError("");
    try {
      await adminAPI.createApprovalRequest({
        changeType: newType,
        targetTitle: newTitle,
        description: newDesc,
        diff: {
          field: diffField,
          oldValue: diffOld,
          newValue: diffNew
        }
      });
      setShowNewModal(false);
      setActionSuccess("New sensitive change request logged. Awaiting second administrator approval.");
      // Reset form
      setNewTitle("");
      setNewDesc("");
      setDiffOld("");
      setDiffNew("");
      fetchApprovals();
    } catch (err) {
      setActionError(err.message || "Failed to create approval request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const pendingCount = requests.filter(r => r.status === "PENDING").length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="bg-white border-2 border-[#E8E4DA] rounded-3xl p-6 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-800 border border-rose-400/20">
            Dual-Authorization Governance
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2">
            Sensitive Change Approval Center
          </h1>
          <p className="text-xs text-[#5F6B64]">
            Enforce the Two-Person Rule. Sensitive mutations (fee updates, payout terms, banking changes) require dual-person verification before going live.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNewModal(true)}
            className="px-3.5 py-2 bg-[#124B38] hover:bg-[#0D3A2C] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Propose Change</span>
          </button>

          <button
            onClick={fetchApprovals}
            disabled={isLoading}
            className="px-3 py-2 bg-white border border-[#E8E4DA] text-slate-800 hover:border-slate-400 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Two-Person Rule Notice */}
      <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
        <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="block font-bold">Two-Person Rule Security Policy:</strong>
          <span>
            Self-approval is strictly forbidden by the security architecture. The administrator who initiates a change cannot approve it; approval requires review from a second authorized administrator.
          </span>
        </div>
      </div>

      {/* Alert Banners */}
      {actionError && (
        <div className="p-4 bg-rose-50 border border-rose-300 rounded-2xl flex items-start gap-3 text-xs text-rose-900 font-bold">
          <AlertCircle className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
          <div>
            <span className="block font-black uppercase text-[11px] text-rose-800">Action Blocked</span>
            <span>{actionError}</span>
          </div>
        </div>
      )}

      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-3 text-xs text-emerald-900 font-bold">
          <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-[#E8E4DA] pb-2 text-xs font-bold">
        <div className="flex items-center gap-2">
          {["all", "pending", "approved", "rejected"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterType(tab)}
              className={`px-3.5 py-1.5 rounded-xl capitalize transition-all cursor-pointer ${
                filterType === tab
                  ? "bg-[#124B38] text-white shadow-xs"
                  : "bg-white text-slate-600 hover:text-slate-900 border border-[#E8E4DA]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl">
          {pendingCount} Pending Verification
        </span>
      </div>

      {/* Requests Feed */}
      <div className="space-y-4">
        {requests.length === 0 ? (
          <div className="bg-white border border-[#E8E4DA] rounded-3xl p-12 text-center text-xs text-[#5F6B64]">
            No change requests found under current filter.
          </div>
        ) : (
          requests.map((req) => {
            const isPartnerSubmission = req.requestedByRole === "INSTITUTE_PARTNER" || 
              (req.requestedBy && !req.requestedBy.toLowerCase().endsWith("@futureselector.com"));
            const isRequester = !isPartnerSubmission && 
              adminUser?.role !== "SUPER_ADMIN" && 
              adminUser?.email && 
              req.requestedBy?.toLowerCase() === adminUser.email.toLowerCase();

            return (
              <div 
                key={req.requestId || req._id} 
                className="bg-white border border-[#E8E4DA] rounded-3xl p-5 shadow-card space-y-4 hover:border-slate-300 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8E4DA] pb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {req.requestId}
                    </span>
                    <span className="text-xs font-black text-[#124B38] flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5" />
                      {req.targetTitle}
                    </span>
                    {isPartnerSubmission && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-50 text-purple-800 border border-purple-200">
                        Coaching Partner Request
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#5F6B64]">
                      {new Date(req.createdAt || req.requestedAt).toLocaleString()}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase border ${
                      req.status === "PENDING"
                        ? "bg-amber-50 text-amber-800 border-amber-300"
                        : req.status === "APPROVED"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                        : "bg-rose-50 text-rose-800 border-rose-300"
                    }`}>
                      {req.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="md:col-span-2 space-y-2">
                    <p className="font-bold text-slate-900">{req.description}</p>
                    <div className="p-3 bg-[#FAF8F5] border border-[#E8E4DA] rounded-2xl flex items-center gap-4">
                      <div>
                        <span className="text-[10px] text-[#5F6B64] font-bold uppercase block">{req.diff?.field} (Current)</span>
                        <span className="font-mono font-bold text-rose-700 line-through">{req.diff?.oldValue}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                      <div>
                        <span className="text-[10px] text-[#124B38] font-bold uppercase block">{req.diff?.field} (Proposed)</span>
                        <span className="font-mono font-bold text-emerald-700">{req.diff?.newValue}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200">
                    <div className="text-[11px] space-y-1">
                      <span className="text-[#5F6B64] block">Requested by:</span>
                      <span className="font-bold text-slate-900 block">{req.requestedBy}</span>
                      <span className="font-mono text-[10px] text-purple-700 font-bold">{req.requestedByRole}</span>
                    </div>

                    {req.status === "PENDING" ? (
                      <div className="pt-2 space-y-1.5">
                        {isRequester && (
                          <div className="text-[10px] text-amber-800 bg-amber-50 p-1.5 rounded-lg border border-amber-200 flex items-center gap-1 font-bold">
                            <AlertTriangle className="w-3 h-3 shrink-0" />
                            <span>Internal Request: Another admin or Super Admin must review.</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApprove(req.requestId || req._id)}
                            className="flex-1 bg-[#124B38] hover:bg-[#0D3A2C] text-white py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleReject(req.requestId || req._id)}
                            className="px-3 py-2 bg-white hover:bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="pt-2 text-[10px] text-slate-600 font-medium">
                        {req.status === "APPROVED" ? (
                          <span>
                            Audited by <strong className="text-slate-900">{req.reviewedBy}</strong> on {new Date(req.reviewedAt).toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-rose-700">
                            Rejection Note: <em>{req.rejectionReason}</em>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Propose Change Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border-2 border-[#E8E4DA] rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8E4DA] pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">Propose Sensitive Mutation</h3>
                <p className="text-[11px] text-[#5F6B64]">Initiates two-person verification before changes take effect.</p>
              </div>
              <button 
                onClick={() => setShowNewModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Change Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl outline-none font-bold"
                >
                  <option value="FEE_STRUCTURE_UPDATE">Fee Structure Update</option>
                  <option value="COMMISSION_RATE_OVERRIDE">Commission Rate Override</option>
                  <option value="FACULTY_ROSTER_UPDATE">Faculty Roster Update</option>
                  <option value="INSTITUTE_STATUS_CHANGE">Institute Status Change</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Target Entity / Institute Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Allen Career Institute, Kota"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Change Justification & Description</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Explain reason for mutation..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-1">Field Name</label>
                  <input
                    type="text"
                    required
                    value={diffField}
                    onChange={(e) => setDiffField(e.target.value)}
                    className="w-full px-2.5 py-1.5 border rounded-xl outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-1">Old Value</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ₹1,40,000"
                    value={diffOld}
                    onChange={(e) => setDiffOld(e.target.value)}
                    className="w-full px-2.5 py-1.5 border rounded-xl outline-none font-mono text-rose-700"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-1">New Value</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ₹1,20,000"
                    value={diffNew}
                    onChange={(e) => setDiffNew(e.target.value)}
                    className="w-full px-2.5 py-1.5 border rounded-xl outline-none font-mono text-emerald-700"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#E8E4DA]">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 border border-[#E8E4DA] rounded-xl text-xs font-bold text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-[#124B38] text-white rounded-xl text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Submitting..." : "Submit for Approval"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
