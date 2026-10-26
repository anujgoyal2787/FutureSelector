import { useState, useEffect } from "react";
import { 
  Building2, Search, Plus, MapPin, Star, Users, CheckCircle2, 
  AlertCircle, Shield, Key, Eye, EyeOff, Lock, UserCheck, 
  Send, ExternalLink, ChevronRight, FileText, Ban, RefreshCw
} from "lucide-react";
import { adminAPI } from "../../services/api";

export default function AdminInstitutes() {
  const [institutes, setInstitutes] = useState([]);
  const [partnerApps, setPartnerApps] = useState([]);
  const [activeTab, setActiveTab] = useState("INSTITUTES"); // "INSTITUTES" | "APPLICATIONS"
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showProvisionModal, setShowProvisionModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedInstitute, setSelectedInstitute] = useState(null);

  // Add Institute Form
  const [formData, setFormData] = useState({
    name: "",
    displayName: "",
    location: "Kota, Rajasthan",
    locality: "Indraprastha (IPIA)",
    cityKey: "kota",
    type: "JEE & NEET",
    fees: "₹1,35,000 / Yr",
    numericFee: 135000,
    contactPerson: {
      name: "",
      designation: "Center Director",
      email: "",
      phone: ""
    },
    agreementTerms: {
      commissionType: "FIXED",
      commissionRate: 7500,
      escrowDays: 15
    },
    adminNotes: ""
  });

  // Provision Partner Form
  const [provisionData, setProvisionData] = useState({
    name: "",
    email: "",
    phone: "",
    designation: "Center Director",
    temporaryPassword: "partner2026"
  });
  const [provisionResult, setProvisionResult] = useState(null);

  // Permissions Form
  const [permissionsData, setPermissionsData] = useState({
    canEditProfile: true,
    canSubmitForApproval: true,
    canAccessLeads: true,
    canReportAdmissions: true,
    canRespondRMS: true,
    canViewAnalytics: true
  });

  const [actionMessage, setActionMessage] = useState(null);

  const fetchInstitutes = async () => {
    setIsLoading(true);
    try {
      const data = await adminAPI.getAllInstitutes({ 
        status: statusFilter !== "ALL" ? statusFilter : undefined,
        search 
      });
      setInstitutes(data);
    } catch (err) {
      console.warn("Failed to load institutes:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const apps = await adminAPI.getPartnerApplications();
      setPartnerApps(apps);
    } catch (err) {
      console.warn("Failed to load partner applications:", err);
    }
  };

  useEffect(() => {
    fetchInstitutes();
  }, [statusFilter, search]);

  useEffect(() => {
    if (activeTab === "APPLICATIONS") {
      fetchApplications();
    }
  }, [activeTab]);

  const handleManualAdd = async (e) => {
    e.preventDefault();
    try {
      const res = await adminAPI.manualAddInstitute(formData);
      setActionMessage({ type: "success", text: res.message });
      setShowAddModal(false);
      fetchInstitutes();
      // Reset form
      setFormData({
        name: "",
        displayName: "",
        location: "Kota, Rajasthan",
        locality: "Indraprastha (IPIA)",
        cityKey: "kota",
        type: "JEE & NEET",
        fees: "₹1,35,000 / Yr",
        numericFee: 135000,
        contactPerson: { name: "", designation: "Center Director", email: "", phone: "" },
        agreementTerms: { commissionType: "FIXED", commissionRate: 7500, escrowDays: 15 },
        adminNotes: ""
      });
    } catch (err) {
      setActionMessage({ type: "error", text: err.message });
    }
  };

  const handleProvisionPartner = async (e) => {
    e.preventDefault();
    if (!selectedInstitute) return;
    try {
      const res = await adminAPI.provisionPartner(selectedInstitute.numericId || selectedInstitute._id, provisionData);
      setProvisionResult(res);
      setActionMessage({ type: "success", text: res.message });
      fetchInstitutes();
    } catch (err) {
      setActionMessage({ type: "error", text: err.message });
    }
  };

  const handleUpdatePermissions = async (e) => {
    e.preventDefault();
    if (!selectedInstitute) return;
    try {
      const res = await adminAPI.updatePartnerPermissions(selectedInstitute.numericId || selectedInstitute._id, {
        permissions: permissionsData
      });
      setActionMessage({ type: "success", text: res.message });
      setShowPermissionsModal(false);
      fetchInstitutes();
    } catch (err) {
      setActionMessage({ type: "error", text: err.message });
    }
  };

  const handlePublish = async (inst) => {
    if (!confirm(`Are you sure you want to approve and PUBLISH '${inst.name}' to FutureSelector live student search?`)) return;
    try {
      const res = await adminAPI.publishInstitute(inst.numericId || inst._id);
      setActionMessage({ type: "success", text: res.message });
      fetchInstitutes();
    } catch (err) {
      setActionMessage({ type: "error", text: err.message });
    }
  };

  const handleSuspend = async (inst) => {
    const reason = prompt(`Enter mandatory suspension reason for '${inst.name}':`, "Compliance investigation");
    if (!reason) return;
    try {
      const res = await adminAPI.suspendInstitute(inst.numericId || inst._id, reason);
      setActionMessage({ type: "success", text: res.message });
      fetchInstitutes();
    } catch (err) {
      setActionMessage({ type: "error", text: err.message });
    }
  };

  const handleApproveApplication = async (appId) => {
    try {
      const res = await adminAPI.approvePartnerApplication(appId);
      setActionMessage({ type: "success", text: res.message });
      fetchApplications();
    } catch (err) {
      setActionMessage({ type: "error", text: err.message });
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      
      {/* Alert Banner */}
      {actionMessage && (
        <div className={`p-4 rounded-2xl flex items-center justify-between text-xs font-bold ${
          actionMessage.type === "success" 
            ? "bg-emerald-50 text-emerald-900 border border-emerald-200" 
            : "bg-red-50 text-red-900 border border-red-200"
        }`}>
          <span>{actionMessage.text}</span>
          <button onClick={() => setActionMessage(null)} className="cursor-pointer text-slate-500 hover:text-slate-800">Dismiss</button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-2 border-[#E8E4DA] rounded-3xl p-6 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#124B38]/10 text-[#124B38] border border-[#124B38]/20">
            Enterprise Governance Suite
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Manual Institute Onboarding & Partner Access Desk
          </h1>
          <p className="text-xs text-[#5F6B64] mt-1">
            Super Admin manual control for institute records, partner invitations, fine-grained RBAC permissions, and publication approval.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setActiveTab("APPLICATIONS");
            }}
            className={`text-xs py-2.5 px-4 rounded-xl font-bold border transition-colors cursor-pointer ${
              activeTab === "APPLICATIONS" 
                ? "bg-slate-900 text-white border-slate-900" 
                : "bg-white text-slate-700 border-[#E8E4DA] hover:bg-slate-50"
            }`}
          >
            Prospective Applications ({partnerApps.length})
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("INSTITUTES");
              setShowAddModal(true);
            }}
            className="btn-primary text-xs py-2.5 px-4 font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Plus className="w-4 h-4 text-gold-300" />
            <span>Add Institute Manually</span>
          </button>
        </div>
      </div>

      {/* Tab Selector & Status Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {["INSTITUTES", "APPLICATIONS"].map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer ${
                activeTab === t
                  ? "bg-[#124B38] text-white shadow-sm"
                  : "bg-white text-slate-600 border border-[#E8E4DA] hover:bg-slate-50"
              }`}
            >
              {t === "INSTITUTES" ? "Managed Coaching Centers" : "Prospective Inbound Applications"}
            </button>
          ))}
        </div>

        {activeTab === "INSTITUTES" && (
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-[#E8E4DA] text-xs font-bold">
            {["ALL", "PUBLISHED", "DRAFT", "SUBMITTED", "SUSPENDED"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                  statusFilter === st 
                    ? "bg-slate-900 text-white" 
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main View: Institutes Catalog */}
      {activeTab === "INSTITUTES" && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="bg-white border border-[#E8E4DA] rounded-2xl p-4 shadow-card flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-[#5F6B64] absolute left-3.5 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search coaching name, authorized director, locality..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#E8E4DA] text-xs outline-none focus:border-[#124B38] bg-white"
              />
            </div>
            <button 
              onClick={fetchInstitutes}
              className="p-2 rounded-xl border border-[#E8E4DA] hover:bg-slate-50 cursor-pointer text-slate-600"
              title="Refresh list"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Table */}
          <div className="bg-white border border-[#E8E4DA] rounded-3xl shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8F5] border-b border-[#E8E4DA] text-[10px] font-black uppercase tracking-wider text-slate-700">
                  <tr>
                    <th className="py-3.5 px-4">Institute & Location</th>
                    <th className="py-3.5 px-4">Contact Director</th>
                    <th className="py-3.5 px-4">Fee & Commission</th>
                    <th className="py-3.5 px-4">Publication State</th>
                    <th className="py-3.5 px-4">Verification</th>
                    <th className="py-3.5 px-4">Partner Login</th>
                    <th className="py-3.5 px-4 text-right">Super Admin Governance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E4DA]">
                  {institutes.map((inst) => {
                    const isPub = inst.publicationStatus === "PUBLISHED";
                    const isSusp = inst.publicationStatus === "SUSPENDED" || inst.accountStatus === "SUSPENDED";
                    const isDraft = inst.publicationStatus === "DRAFT";

                    return (
                      <tr key={inst._id || inst.numericId} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-start gap-2">
                            <span className="font-mono text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                              #{inst.numericId}
                            </span>
                            <div>
                              <strong className="text-slate-900 block font-bold text-sm">
                                {inst.name}
                              </strong>
                              <span className="text-[11px] text-[#5F6B64] flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3 text-emerald-700" />
                                {inst.locality || inst.location}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <div className="text-slate-800 font-bold">
                            {inst.contactPerson?.name || "Unassigned"}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {inst.contactPerson?.email || "No email on file"}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {inst.contactPerson?.phone || ""}
                          </div>
                        </td>

                        <td className="py-4 px-4 font-mono">
                          <div className="font-bold text-slate-900">{inst.fees}</div>
                          <div className="text-[10px] text-emerald-700 font-bold">
                            ₹{(inst.referralCommissionRate || inst.agreementTerms?.commissionRate || 7500).toLocaleString()} Comm.
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          {isPub && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-300">
                              <CheckCircle2 className="w-3 h-3" /> Live (Published)
                            </span>
                          )}
                          {isDraft && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-300">
                              <Lock className="w-3 h-3" /> Draft (Hidden)
                            </span>
                          )}
                          {inst.publicationStatus === "SUBMITTED" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-800 border border-blue-300">
                              In Review
                            </span>
                          )}
                          {isSusp && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-50 text-red-800 border border-red-300">
                              <Ban className="w-3 h-3" /> Suspended
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            inst.verificationStatus === "VERIFIED"
                              ? "bg-emerald-100 text-emerald-900"
                              : "bg-slate-100 text-slate-600"
                          }`}>
                            {inst.verificationStatus || "UNVERIFIED"}
                          </span>
                        </td>

                        <td className="py-4 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            inst.accountStatus === "ACTIVE"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : inst.accountStatus === "INVITED"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-red-50 text-red-700 border border-red-200"
                          }`}>
                            {inst.accountStatus || "INVITED"}
                          </span>
                        </td>

                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            <button
                              onClick={() => {
                                setSelectedInstitute(inst);
                                setProvisionData({
                                  name: inst.contactPerson?.name || "Center Director",
                                  email: inst.contactPerson?.email || `partner@${inst.slug}.in`,
                                  phone: inst.contactPerson?.phone || "",
                                  designation: inst.contactPerson?.designation || "Center Director",
                                  temporaryPassword: "partner2026"
                                });
                                setProvisionResult(null);
                                setShowProvisionModal(true);
                              }}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 cursor-pointer"
                              title="Provision or resend partner credentials"
                            >
                              <Key className="w-3 h-3 inline mr-1" />
                              Partner Account
                            </button>

                            <button
                              onClick={() => {
                                setSelectedInstitute(inst);
                                setShowPermissionsModal(true);
                              }}
                              className="px-2 py-1 rounded-lg text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 cursor-pointer"
                              title="Set fine-grained partner permissions"
                            >
                              <Shield className="w-3 h-3 inline mr-1" />
                              Permissions
                            </button>

                            {!isPub && (
                              <button
                                onClick={() => handlePublish(inst)}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#124B38] hover:bg-[#0E3B2C] text-white cursor-pointer"
                              >
                                Publish Live
                              </button>
                            )}

                            {!isSusp && (
                              <button
                                onClick={() => handleSuspend(inst)}
                                className="px-2 py-1 rounded-lg text-[11px] font-bold bg-red-100 hover:bg-red-200 text-red-800 cursor-pointer"
                              >
                                Suspend
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Applications View */}
      {activeTab === "APPLICATIONS" && (
        <div className="bg-white border border-[#E8E4DA] rounded-3xl shadow-card overflow-hidden">
          <div className="p-4 border-b border-[#E8E4DA] bg-[#FAF8F5]">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Prospective Inbound Partner Submissions
            </h2>
            <p className="text-xs text-[#5F6B64]">
              Institutes applying through the public portal for verification. Approving creates a draft institute record for manual review.
            </p>
          </div>

          <div className="divide-y divide-[#E8E4DA]">
            {partnerApps.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No prospective partner applications pending review.
              </div>
            ) : (
              partnerApps.map((app) => (
                <div key={app._id} className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                        {app.applicationId}
                      </span>
                      <strong className="text-sm font-bold text-slate-900">{app.instituteName}</strong>
                      <span className="text-xs text-slate-500">({app.city})</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        app.status === "PENDING_REVIEW" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                      }`}>
                        {app.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600">
                      <strong>Contact:</strong> {app.contactPerson?.name} ({app.contactPerson?.email}, {app.contactPerson?.phone})
                    </div>
                    <div className="text-xs text-slate-500">
                      <strong>Enrollment:</strong> {app.currentEnrollment} | <strong>Branches:</strong> {app.branchesCount}
                    </div>
                    {app.message && (
                      <p className="text-xs text-slate-500 italic mt-1 bg-slate-50 p-2 rounded-lg">
                        "{app.message}"
                      </p>
                    )}
                  </div>

                  {app.status === "PENDING_REVIEW" && (
                    <button
                      onClick={() => handleApproveApplication(app._id)}
                      className="btn-primary text-xs py-2 px-4 font-bold shrink-0 cursor-pointer"
                    >
                      Approve & Authorize Onboarding
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: ADD INSTITUTE MANUALLY */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border-2 border-[#E8E4DA] rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-[#E8E4DA] pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900">Manually Add Institute (Draft)</h3>
                <p className="text-xs text-[#5F6B64]">Draft institutes will NOT appear on the student website until approved.</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700 font-bold text-lg cursor-pointer">×</button>
            </div>

            <form onSubmit={handleManualAdd} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Official Institute Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Nucleus Education"
                    className="w-full px-3 py-2 rounded-xl border border-[#E8E4DA] outline-none focus:border-[#124B38]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Public Display Name</label>
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    placeholder="e.g. Nucleus Education, Kota"
                    className="w-full px-3 py-2 rounded-xl border border-[#E8E4DA] outline-none focus:border-[#124B38]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Education Hub / City *</label>
                  <select
                    value={formData.cityKey}
                    onChange={(e) => setFormData({ ...formData, cityKey: e.target.value, location: `${e.target.value.toUpperCase()}, India` })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8E4DA] outline-none focus:border-[#124B38] bg-white"
                  >
                    <option value="kota">Kota, Rajasthan</option>
                    <option value="delhi">Delhi NCR</option>
                    <option value="agra">Agra</option>
                    <option value="hyderabad">Hyderabad</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Locality</label>
                  <input
                    type="text"
                    value={formData.locality}
                    onChange={(e) => setFormData({ ...formData, locality: e.target.value })}
                    placeholder="e.g. Vigyan Nagar"
                    className="w-full px-3 py-2 rounded-xl border border-[#E8E4DA] outline-none focus:border-[#124B38]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Exam Focus</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8E4DA] outline-none focus:border-[#124B38] bg-white"
                  >
                    <option value="JEE & NEET">JEE & NEET</option>
                    <option value="JEE Advanced">JEE Advanced Specialist</option>
                    <option value="NEET Specialist">NEET Specialist</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tuition Fee Display *</label>
                  <input
                    type="text"
                    value={formData.fees}
                    onChange={(e) => setFormData({ ...formData, fees: e.target.value })}
                    placeholder="e.g. ₹1,40,000 / Yr"
                    className="w-full px-3 py-2 rounded-xl border border-[#E8E4DA] outline-none focus:border-[#124B38]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Agreed Referral Commission (INR)</label>
                  <input
                    type="number"
                    value={formData.agreementTerms.commissionRate}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      agreementTerms: { ...formData.agreementTerms, commissionRate: Number(e.target.value) } 
                    })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8E4DA] outline-none focus:border-[#124B38]"
                  />
                </div>
              </div>

              {/* Contact Person */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-[#E8E4DA] space-y-2">
                <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider">
                  Authorized Director / Contact Person
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Director Name *"
                    value={formData.contactPerson.name}
                    onChange={(e) => setFormData({
                      ...formData,
                      contactPerson: { ...formData.contactPerson, name: e.target.value }
                    })}
                    className="px-2.5 py-1.5 rounded-lg border border-[#E8E4DA] bg-white"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Director Email *"
                    value={formData.contactPerson.email}
                    onChange={(e) => setFormData({
                      ...formData,
                      contactPerson: { ...formData.contactPerson, email: e.target.value }
                    })}
                    className="px-2.5 py-1.5 rounded-lg border border-[#E8E4DA] bg-white"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Phone Number *"
                    value={formData.contactPerson.phone}
                    onChange={(e) => setFormData({
                      ...formData,
                      contactPerson: { ...formData.contactPerson, phone: e.target.value }
                    })}
                    className="px-2.5 py-1.5 rounded-lg border border-[#E8E4DA] bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Super Admin Internal Notes</label>
                <textarea
                  rows={2}
                  value={formData.adminNotes}
                  onChange={(e) => setFormData({ ...formData, adminNotes: e.target.value })}
                  placeholder="Audit history, campus verification remarks..."
                  className="w-full px-3 py-2 rounded-xl border border-[#E8E4DA] outline-none focus:border-[#124B38]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E8E4DA]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary px-5 py-2 font-bold cursor-pointer"
                >
                  Save Draft Institute
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: PROVISION PARTNER ACCOUNT */}
      {showProvisionModal && selectedInstitute && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-2 border-[#E8E4DA] rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8E4DA] pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900">Provision Partner Account</h3>
                <p className="text-xs text-[#5F6B64]">For: {selectedInstitute.name}</p>
              </div>
              <button onClick={() => setShowProvisionModal(false)} className="text-slate-400 hover:text-slate-700 font-bold text-lg cursor-pointer">×</button>
            </div>

            {provisionResult ? (
              <div className="space-y-3 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs">
                <div className="font-bold text-emerald-900 text-sm">✓ Partner Account Provisioned!</div>
                <div className="space-y-1 text-slate-700">
                  <p><strong>Partner Email:</strong> {provisionResult.partner.email}</p>
                  <p><strong>Temporary Key:</strong> {provisionResult.temporaryPasswordNote}</p>
                  <p><strong>Setup URL:</strong></p>
                  <input
                    type="text"
                    readOnly
                    value={provisionResult.setupUrl}
                    className="w-full font-mono text-[11px] p-2 bg-white rounded border border-emerald-300 select-all"
                  />
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(provisionResult.setupUrl);
                    alert("Setup URL copied to clipboard!");
                  }}
                  className="btn-primary text-xs py-2 px-3 font-bold w-full"
                >
                  Copy Invitation Link
                </button>
              </div>
            ) : (
              <form onSubmit={handleProvisionPartner} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Director / Authorized Staff Name</label>
                  <input
                    type="text"
                    required
                    value={provisionData.name}
                    onChange={(e) => setProvisionData({ ...provisionData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8E4DA]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Login Email *</label>
                  <input
                    type="email"
                    required
                    value={provisionData.email}
                    onChange={(e) => setProvisionData({ ...provisionData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8E4DA]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Initial / Temporary Password</label>
                  <input
                    type="text"
                    value={provisionData.temporaryPassword}
                    onChange={(e) => setProvisionData({ ...provisionData, temporaryPassword: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8E4DA] font-mono"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[#E8E4DA]">
                  <button
                    type="button"
                    onClick={() => setShowProvisionModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-300 font-bold hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary px-5 py-2 font-bold cursor-pointer"
                  >
                    Generate Credentials
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL 3: PERMISSIONS DESK */}
      {showPermissionsModal && selectedInstitute && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-2 border-[#E8E4DA] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8E4DA] pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900">Fine-Grained Permissions</h3>
                <p className="text-xs text-[#5F6B64]">{selectedInstitute.name}</p>
              </div>
              <button onClick={() => setShowPermissionsModal(false)} className="text-slate-400 hover:text-slate-700 font-bold text-lg cursor-pointer">×</button>
            </div>

            <form onSubmit={handleUpdatePermissions} className="space-y-3 text-xs">
              {[
                { key: "canEditProfile", label: "Edit Profile Studio (Media & Gallery)" },
                { key: "canSubmitForApproval", label: "Submit Sensitive Fee/Batch Changes" },
                { key: "canAccessLeads", label: "Access Released Confirmed Student Leads" },
                { key: "canReportAdmissions", label: "Report Offline Counter Admissions" },
                { key: "canRespondRMS", label: "Respond to Assigned Student RMS Disputes" },
                { key: "canViewAnalytics", label: "View Performance Analytics" }
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center justify-between p-2.5 rounded-xl border border-[#E8E4DA] bg-slate-50 cursor-pointer">
                  <span className="font-bold text-slate-800">{label}</span>
                  <input
                    type="checkbox"
                    checked={permissionsData[key]}
                    onChange={(e) => setPermissionsData({ ...permissionsData, [key]: e.target.checked })}
                    className="w-4 h-4 accent-[#124B38]"
                  />
                </label>
              ))}

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E8E4DA]">
                <button
                  type="button"
                  onClick={() => setShowPermissionsModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary px-5 py-2 font-bold cursor-pointer"
                >
                  Save Permissions
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
