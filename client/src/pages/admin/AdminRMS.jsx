import { useState, useEffect } from "react";
import { 
  LifeBuoy, AlertCircle, Clock, CheckCircle2, MessageSquare, 
  Search, Filter, ChevronRight, User, Phone, ShieldAlert, 
  Plus, RefreshCw, X, Check, ArrowRight, Building2, Tag, ShieldCheck
} from "lucide-react";
import { adminAPI } from "../../services/api";

export default function AdminRMS() {
  const [activeTab, setActiveTab] = useState("OPEN");
  const [search, setSearch] = useState("");
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState("");
  const [actionError, setActionError] = useState("");

  // Inspect / Resolve Drawer
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [assignee, setAssignee] = useState("");

  // New Ticket Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newStudent, setNewStudent] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newInstitute, setNewInstitute] = useState("");
  const [newCategory, setNewCategory] = useState("PASS_DISCOUNT_DISPUTE");
  const [newPriority, setNewPriority] = useState("CRITICAL");
  const [newSubject, setNewSubject] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTickets = async () => {
    setIsLoading(true);
    setActionError("");
    try {
      const res = await adminAPI.getRMSTickets(activeTab, search);
      if (res && res.tickets) {
        setTickets(res.tickets);
      }
    } catch (err) {
      console.warn("Could not load tickets from backend, using fallback:", err);
      setTickets([
        {
          ticketId: "RMS-2026-0104",
          studentName: "Aditya Verma",
          studentPhone: "+91 98765 43210",
          instituteName: "Allen Career Institute, Kota",
          category: "PASS_DISCOUNT_DISPUTE",
          subject: "Counter desk refused to apply ₹15,000 FutureSelector fee waiver voucher",
          description: "Student reported that admissions counter claimed they had not received authorization token despite active pass in student dashboard.",
          priority: "CRITICAL",
          status: "OPEN",
          slaHoursLeft: 4,
          assignedTo: "Kunal Verma (Support Lead)",
          assignedOfficerEmail: "kunal.ops@futureselector.com",
          createdAt: new Date().toISOString()
        },
        {
          ticketId: "RMS-2026-0098",
          studentName: "Sanya Gupta",
          studentPhone: "+91 98112 33445",
          instituteName: "Aakash Institute, Delhi",
          category: "BATCH_ALLOTMENT",
          subject: "Enrolled in NEET Morning Batch but allotted Evening Shift instead",
          description: "Parent requested shift adjustment to match school timing.",
          priority: "MEDIUM",
          status: "IN_PROGRESS",
          slaHoursLeft: 16,
          assignedTo: "Pooja Hegde (Counsellor)",
          assignedOfficerEmail: "pooja.counsellor@futureselector.com",
          createdAt: new Date(Date.now() - 36000000).toISOString()
        },
        {
          ticketId: "RMS-2026-0085",
          studentName: "Rohan Das",
          studentPhone: "+91 97766 55443",
          instituteName: "Resonance Eduventures, Kota",
          category: "HOSTEL_COMPLAINT",
          subject: "Attached partner hostel facility not honoring promised Wi-Fi/Mess standards",
          description: "Warden changed mess schedule. Escalated to coaching management.",
          priority: "LOW",
          status: "RESOLVED",
          slaHoursLeft: 0,
          assignedTo: "Kunal Verma (Support Lead)",
          assignedOfficerEmail: "kunal.ops@futureselector.com",
          resolvedBy: "admin@futureselector.com",
          resolvedAt: new Date(Date.now() - 86400000).toISOString(),
          resolutionNotes: "Coaching center manager inspected hostel; mess schedule and food hygiene corrected.",
          createdAt: new Date(Date.now() - 172800000).toISOString()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [activeTab]);

  const handleResolveTicket = async (id, notes) => {
    if (!notes) {
      alert("Please provide resolution details before marking ticket as resolved.");
      return;
    }
    setActionError("");
    setActionSuccess("");
    try {
      const res = await adminAPI.resolveRMSTicket(id, notes);
      if (res.success) {
        setActionSuccess(`Ticket ${id} marked as RESOLVED and student reconciled.`);
        setSelectedTicket(null);
        setResolutionNotes("");
        fetchTickets();
      }
    } catch (err) {
      setActionError(err.message || "Failed to resolve ticket");
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    setActionError("");
    setActionSuccess("");
    try {
      const res = await adminAPI.updateRMSTicketStatus(id, newStatus);
      if (res.success) {
        setActionSuccess(`Ticket ${id} status updated to ${newStatus}.`);
        if (selectedTicket) {
          setSelectedTicket({ ...selectedTicket, status: newStatus });
        }
        fetchTickets();
      }
    } catch (err) {
      setActionError(err.message || "Failed to update status");
    }
  };

  const handleAssignTicket = async (id, officerName) => {
    try {
      const res = await adminAPI.updateRMSTicketStatus(id, undefined, officerName);
      if (res.success) {
        setActionSuccess(`Ticket assigned to ${officerName}.`);
        if (selectedTicket) {
          setSelectedTicket({ ...selectedTicket, assignedTo: officerName });
        }
        fetchTickets();
      }
    } catch (err) {
      setActionError(err.message || "Failed to assign ticket");
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setActionError("");
    try {
      const res = await adminAPI.createRMSTicket({
        studentName: newStudent,
        studentPhone: newPhone,
        instituteName: newInstitute,
        category: newCategory,
        priority: newPriority,
        subject: newSubject,
        description: newDesc
      });
      if (res.success) {
        setActionSuccess(`New ticket ${res.ticket?.ticketId || ""} logged successfully.`);
        setShowCreateModal(false);
        // Reset form
        setNewStudent("");
        setNewPhone("");
        setNewInstitute("");
        setNewSubject("");
        setNewDesc("");
        fetchTickets();
      }
    } catch (err) {
      setActionError(err.message || "Failed to create support ticket");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityStyle = (p) => {
    switch (p) {
      case "CRITICAL": return "bg-rose-100 text-rose-800 border-rose-300";
      case "MEDIUM": return "bg-amber-100 text-amber-800 border-amber-300";
      default: return "bg-blue-100 text-blue-800 border-blue-300";
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="bg-white border-2 border-[#E8E4DA] rounded-3xl p-6 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-500/10 text-red-800 border border-red-400/20">
            Student Advocacy & Escalations
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2">
            Resolution Management System (RMS)
          </h1>
          <p className="text-xs text-[#5F6B64]">
            Enforce SLA resolution on student admission grievances, fee waiver honor compliance, and hostel disputes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3.5 py-2 bg-[#124B38] hover:bg-[#0D3A2C] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 text-gold-300" />
            <span>Log Dispute Ticket</span>
          </button>

          <button
            onClick={fetchTickets}
            disabled={isLoading}
            className="px-3 py-2 bg-white border border-[#E8E4DA] text-slate-800 hover:border-slate-400 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
            title="Refresh Tickets"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* SLA Policy Banner */}
      <div className="p-4 bg-rose-50/60 border border-rose-200 rounded-2xl flex items-start gap-3 text-xs text-rose-950">
        <ShieldAlert className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="block font-bold">Guaranteed Student Resolution Policy:</strong>
          <span>
            Critical fee waiver disputes must be addressed within 6 hours. Coaching partners are contractually required to honor verified ₹15,000 FutureSelector fee grants upon counter presentation.
          </span>
        </div>
      </div>

      {/* Alert Banners */}
      {actionError && (
        <div className="p-4 bg-rose-50 border border-rose-300 rounded-2xl flex items-center gap-3 text-xs text-rose-900 font-bold">
          <AlertCircle className="w-5 h-5 text-rose-700 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-3 text-xs text-emerald-900 font-bold">
          <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 border-b sm:border-b-0 border-[#E8E4DA] pb-2 sm:pb-0 text-xs font-bold">
          {["OPEN", "IN_PROGRESS", "RESOLVED", "ALL"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-xl capitalize transition-all cursor-pointer ${
                activeTab === tab
                  ? "bg-[#124B38] text-white shadow-xs"
                  : "bg-white text-slate-600 hover:text-slate-900 border border-[#E8E4DA]"
              }`}
            >
              {tab.replace("_", " ")}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchTickets()}
            placeholder="Search tickets by student or institute..."
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-[#E8E4DA] rounded-xl text-xs outline-none focus:border-[#124B38]"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {tickets.length === 0 ? (
          <div className="bg-white border border-[#E8E4DA] rounded-3xl p-12 text-center text-xs text-[#5F6B64]">
            No support tickets found in this queue.
          </div>
        ) : (
          tickets.map(ticket => (
            <div
              key={ticket.ticketId || ticket._id}
              className="bg-white border border-[#E8E4DA] rounded-3xl p-5 shadow-card space-y-4 hover:border-slate-300 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8E4DA] pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                    {ticket.ticketId}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getPriorityStyle(ticket.priority)}`}>
                    {ticket.priority} PRIORITY
                  </span>
                  <span className="text-xs font-bold text-slate-600">
                    {ticket.category.replace(/_/g, " ")}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  {ticket.status !== "RESOLVED" && ticket.status !== "CLOSED" && (
                    <span className="flex items-center gap-1 font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-lg text-[11px]">
                      <Clock className="w-3 h-3" />
                      SLA: {ticket.slaHoursLeft}h remaining
                    </span>
                  )}
                  <span className="text-[10px] text-[#5F6B64]">
                    Logged: {new Date(ticket.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                <div className="md:col-span-3 space-y-2">
                  <h4 className="font-bold text-slate-900 text-sm">{ticket.subject}</h4>
                  {ticket.description && (
                    <p className="text-slate-600 text-xs leading-relaxed">{ticket.description}</p>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-4 text-slate-600 pt-1">
                    <span className="font-medium flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {ticket.studentName}
                    </span>
                    <span className="font-mono text-[11px] flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {ticket.studentPhone}
                    </span>
                    <span className="font-bold text-[#124B38] flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" />
                      {ticket.instituteName}
                    </span>
                  </div>

                  {ticket.resolutionNotes && (
                    <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-emerald-950 mt-2">
                      <strong className="block text-[10px] uppercase font-bold text-emerald-900">Official Resolution Note:</strong>
                      <span className="text-xs">{ticket.resolutionNotes}</span>
                      <span className="block text-[10px] text-emerald-800 mt-1">
                        Resolved by {ticket.resolvedBy} on {new Date(ticket.resolvedAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="bg-[#FAF8F5] border border-[#E8E4DA] rounded-2xl p-3 flex flex-col justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-[#5F6B64] uppercase block">Assigned Officer</span>
                    <span className="font-bold text-slate-900 text-xs">{ticket.assignedTo}</span>
                  </div>

                  <div className="space-y-1.5">
                    <button
                      onClick={() => {
                        setSelectedTicket(ticket);
                        setAssignee(ticket.assignedTo || "Kunal Verma (Support Lead)");
                      }}
                      className="w-full bg-white hover:bg-slate-100 border border-[#E8E4DA] text-slate-800 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                      <span>Manage & Resolve</span>
                    </button>

                    {ticket.status !== "RESOLVED" && (
                      <button
                        onClick={() => {
                          const note = prompt("Enter resolution summary:");
                          if (note) handleResolveTicket(ticket.ticketId, note);
                        }}
                        className="w-full bg-[#124B38] hover:bg-[#0D3A2C] text-white py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-gold-300" />
                        <span>Quick Resolve</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Ticket Details & Resolution Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border-2 border-[#E8E4DA] rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8E4DA] pb-3">
              <div>
                <span className="text-[10px] font-mono text-[#5F6B64] font-bold uppercase">
                  {selectedTicket.ticketId} • {selectedTicket.category}
                </span>
                <h3 className="text-base font-black text-slate-900">{selectedTicket.subject}</h3>
              </div>
              <button 
                onClick={() => setSelectedTicket(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-[#FAF8F5] border border-[#E8E4DA] rounded-2xl space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[#5F6B64] block">Student:</span>
                  <strong className="text-slate-900">{selectedTicket.studentName}</strong> ({selectedTicket.studentPhone})
                </div>
                <div>
                  <span className="text-[#5F6B64] block">Target Institute:</span>
                  <strong className="text-slate-900">{selectedTicket.instituteName}</strong>
                </div>
              </div>

              {selectedTicket.description && (
                <div className="pt-2 border-t border-[#E8E4DA] text-slate-700">
                  {selectedTicket.description}
                </div>
              )}
            </div>

            {/* Officer Assignment */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Assigned Officer</label>
                <select
                  value={assignee}
                  onChange={(e) => {
                    setAssignee(e.target.value);
                    handleAssignTicket(selectedTicket.ticketId, e.target.value);
                  }}
                  className="w-full px-3 py-2 border rounded-xl outline-none font-bold"
                >
                  <option value="Kunal Verma (Support Lead)">Kunal Verma (Support Lead)</option>
                  <option value="Pooja Hegde (Counsellor)">Pooja Hegde (Counsellor)</option>
                  <option value="Siddharth Mehra (Finance)">Siddharth Mehra (Finance)</option>
                  <option value="Super Administrator">Super Administrator</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Ticket Status</label>
                <select
                  value={selectedTicket.status}
                  onChange={(e) => handleStatusChange(selectedTicket.ticketId, e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl outline-none font-bold"
                >
                  <option value="OPEN">OPEN</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="RESOLVED">RESOLVED</option>
                </select>
              </div>
            </div>

            {/* Resolution Form */}
            {selectedTicket.status !== "RESOLVED" && (
              <div className="space-y-2 border-t border-[#E8E4DA] pt-3">
                <label className="block text-xs font-bold text-slate-900">
                  Official Settlement / Resolution Note
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Detail actions taken with coaching center management or student..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-[#124B38]"
                />
              </div>
            )}

            <div className="pt-2 flex justify-end gap-2 border-t border-[#E8E4DA]">
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-2 border border-[#E8E4DA] rounded-xl text-xs font-bold text-slate-600 cursor-pointer"
              >
                Close
              </button>

              {selectedTicket.status !== "RESOLVED" && (
                <button
                  type="button"
                  onClick={() => handleResolveTicket(selectedTicket.ticketId, resolutionNotes)}
                  className="px-4 py-2 bg-[#124B38] hover:bg-[#0D3A2C] text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Confirm Resolution
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Log Dispute Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border-2 border-[#E8E4DA] rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8E4DA] pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">Log Student Grievance / Dispute</h3>
                <p className="text-[11px] text-[#5F6B64]">Initiates 24h SLA escalation tracking.</p>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Student Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sen"
                    value={newStudent}
                    onChange={(e) => setNewStudent(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Student Phone</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 00000"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Coaching Center Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Allen Career Institute, Kota"
                  value={newInstitute}
                  onChange={(e) => setNewInstitute(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Grievance Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl outline-none font-bold"
                  >
                    <option value="PASS_DISCOUNT_DISPUTE">Pass Discount Dispute</option>
                    <option value="BATCH_ALLOTMENT">Batch Allotment Shift</option>
                    <option value="HOSTEL_COMPLAINT">Hostel / Food Complaint</option>
                    <option value="FACULTY_FEEDBACK">Faculty Feedback</option>
                    <option value="REFUND_REQUEST">Refund / Escrow Request</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Severity / Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl outline-none font-bold"
                  >
                    <option value="CRITICAL">CRITICAL (6h SLA)</option>
                    <option value="MEDIUM">MEDIUM (24h SLA)</option>
                    <option value="LOW">LOW (48h SLA)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Complaint Headline / Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Counter refused ₹15,000 fee grant waiver voucher"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Details & Context</label>
                <textarea
                  rows={2}
                  placeholder="Enter details reported by student..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-[#E8E4DA]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-[#E8E4DA] rounded-xl text-xs font-bold text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-[#124B38] text-white rounded-xl text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Logging Ticket..." : "Submit Grievance Ticket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
