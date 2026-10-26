import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { 
  Building2, ShieldCheck, CheckCircle2, Search, ArrowRight, 
  Ticket, Check, AlertCircle, Phone, Lock, Sparkles, Loader2, 
  Clock, Image, Megaphone, UserPlus, FileCheck, LogOut, 
  MessageSquare, Award, Plus, Trash2, Camera, Eye, UploadCloud,
  Send, ExternalLink, ShieldAlert, Users
} from "lucide-react";
import { partnerAPI } from "../services/api";

export default function InstitutePortal() {
  const [searchParams] = useSearchParams();
  const setupToken = searchParams.get("setupToken");
  const initialEmail = searchParams.get("email") || "";

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [partnerUser, setPartnerUser] = useState(null);
  const [instituteData, setInstituteData] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Login Form
  const [loginEmail, setLoginEmail] = useState(initialEmail || "partner@allen.in");
  const [loginPassword, setLoginPassword] = useState("partner2026");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Setup Password Form (For invited partners)
  const [isSetupMode, setIsSetupMode] = useState(!!setupToken);
  const [setupPassword, setSetupPassword] = useState("");
  const [setupConfirm, setSetupConfirm] = useState("");
  const [setupName, setSetupName] = useState("");
  const [setupPhone, setSetupPhone] = useState("");
  const [setupSuccess, setSetupSuccess] = useState(false);
  const [setupError, setSetupError] = useState("");

  // Portal Main Navigation Tabs
  // "STUDIO" | "LEADS" | "VERIFIER" | "ADMISSIONS" | "RMS" | "APPROVALS"
  const [activeTab, setActiveTab] = useState("STUDIO");

  // --- TAB 1: PROFILE STUDIO STATE ---
  const [studioData, setStudioData] = useState({
    tagline: "",
    socialLinks: { website: "", youtube: "", instagram: "" },
    gallery: [],
    announcements: [],
    facultyRoster: [],
    hallOfFame: []
  });
  const [isSavingStudio, setIsSavingStudio] = useState(false);
  const [studioFeedback, setStudioFeedback] = useState(null);

  // New Studio Item Inputs
  const [newGalleryUrl, setNewGalleryUrl] = useState("");
  const [newGalleryCaption, setNewGalleryCaption] = useState("");
  const [newGalleryCategory, setNewGalleryCategory] = useState("CAMPUS");

  const [newAnnouncementTitle, setNewAnnouncementTitle] = useState("");
  const [newAnnouncementContent, setNewAnnouncementContent] = useState("");
  const [newAnnouncementBadge, setNewAnnouncementBadge] = useState("Admissions 2026");

  const [newFacultyName, setNewFacultyName] = useState("");
  const [newFacultySubject, setNewFacultySubject] = useState("");
  const [newFacultyExp, setNewFacultyExp] = useState("");

  // --- TAB 2: RELEASED LEADS STATE ---
  const [leads, setLeads] = useState([]);
  const [leadsLoading, setLeadsLoading] = useState(false);

  // --- TAB 3: COUNTER VOUCHER VERIFIER ---
  const [voucherCodeInput, setVoucherCodeInput] = useState("FS-SEAT-7429");
  const [verificationResult, setVerificationResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // --- TAB 4: ADMISSION REPORTING STATE ---
  const [admissionForm, setAdmissionForm] = useState({
    voucherCode: "",
    studentName: "",
    studentPhone: "",
    batchName: "2026 Regular Classroom Batch",
    receiptNumber: "",
    receiptAmount: 125000,
    receiptDate: new Date().toISOString().split("T")[0],
    receiptFileUrl: "",
    counterNotes: "Cash/Card receipt issued at center admissions desk."
  });
  const [isReportingAdmission, setIsReportingAdmission] = useState(false);
  const [admissionReportResult, setAdmissionReportResult] = useState(null);
  const [reportedAdmissions, setReportedAdmissions] = useState([]);

  // --- TAB 5: RMS GRIEVANCES STATE ---
  const [rmsTickets, setRmsTickets] = useState([]);
  const [rmsLoading, setRmsLoading] = useState(false);
  const [selectedRmsTicket, setSelectedRmsTicket] = useState(null);
  const [rmsResponseText, setRmsResponseText] = useState("");
  const [isSubmittingRmsResponse, setIsSubmittingRmsResponse] = useState(false);

  // --- TAB 6: SENSITIVE CHANGE REQUEST STATE ---
  const [changeType, setChangeType] = useState("FEE_STRUCTURE_UPDATE");
  const [changeDesc, setChangeDesc] = useState("");
  const [changeField, setChangeField] = useState("Tuition Fee");
  const [changeOldVal, setChangeOldVal] = useState("₹1,40,000 / Yr");
  const [changeNewVal, setChangeNewVal] = useState("");
  const [isSubmittingChange, setIsSubmittingChange] = useState(false);
  const [changeResult, setChangeResult] = useState(null);

  // Check existing session
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("fs_partner_token");
      if (!token) {
        setAuthLoading(false);
        return;
      }
      try {
        const me = await partnerAPI.getMe();
        setPartnerUser(me.partner);
        setInstituteData(me.institute);
        setIsAuthenticated(true);
        loadPortalData();
      } catch {
        localStorage.removeItem("fs_partner_token");
      } finally {
        setAuthLoading(false);
      }
    };
    checkAuth();
  }, []);

  const loadPortalData = async () => {
    try {
      // Load Profile & Studio
      const prof = await partnerAPI.getProfile();
      setInstituteData(prof);
      if (prof.profileStudio) {
        setStudioData({
          tagline: prof.profileStudio.tagline || "",
          socialLinks: prof.profileStudio.socialLinks || { website: "", youtube: "", instagram: "" },
          gallery: prof.profileStudio.gallery || [],
          announcements: prof.profileStudio.announcements || [],
          facultyRoster: prof.profileStudio.facultyRoster || [],
          hallOfFame: prof.profileStudio.hallOfFame || []
        });
      }

      // Load Confirmed Leads
      const leadsRes = await partnerAPI.getLeads();
      setLeads(leadsRes.leads || []);

      // Load Reported Admissions
      const admRes = await partnerAPI.getAdmissions();
      setReportedAdmissions(admRes || []);

      // Load RMS Tickets
      const rmsRes = await partnerAPI.getRMSTickets();
      setRmsTickets(rmsRes.tickets || []);
    } catch (err) {
      console.warn("Failed to load portal data:", err);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError("");
    try {
      const res = await partnerAPI.login({ email: loginEmail, password: loginPassword });
      localStorage.setItem("fs_partner_token", res.token);
      setPartnerUser(res.partner);
      setInstituteData(res.institute);
      setIsAuthenticated(true);
      loadPortalData();
    } catch (err) {
      setLoginError(err.message || "Failed to sign in. Verify email and password.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSetupPassword = async (e) => {
    e.preventDefault();
    if (setupPassword !== setupConfirm) {
      setSetupError("Passwords do not match.");
      return;
    }
    setSetupError("");
    try {
      await partnerAPI.setupPassword({
        invitationToken: setupToken,
        password: setupPassword,
        name: setupName,
        phone: setupPhone
      });
      setSetupSuccess(true);
    } catch (err) {
      setSetupError(err.message || "Failed to set password. Token may be expired.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("fs_partner_token");
    setIsAuthenticated(false);
    setPartnerUser(null);
    setInstituteData(null);
  };

  // Profile Studio Actions
  const handleSaveStudio = async () => {
    setIsSavingStudio(true);
    setStudioFeedback(null);
    try {
      await partnerAPI.updateProfileStudio(studioData);
      setStudioFeedback({ type: "success", text: "Profile Studio showcase updated live!" });
    } catch (err) {
      setStudioFeedback({ type: "error", text: err.message || "Failed to save updates." });
    } finally {
      setIsSavingStudio(false);
    }
  };

  const handleAddGalleryItem = () => {
    if (!newGalleryUrl) return;
    const item = {
      id: `GAL-${Date.now()}`,
      url: newGalleryUrl.trim(),
      caption: newGalleryCaption.trim() || "Campus Photo",
      category: newGalleryCategory,
      uploadedAt: new Date()
    };
    setStudioData({ ...studioData, gallery: [item, ...studioData.gallery] });
    setNewGalleryUrl("");
    setNewGalleryCaption("");
  };

  const handleAddAnnouncement = () => {
    if (!newAnnouncementTitle || !newAnnouncementContent) return;
    const item = {
      id: `ANN-${Date.now()}`,
      title: newAnnouncementTitle.trim(),
      content: newAnnouncementContent.trim(),
      badge: newAnnouncementBadge,
      createdAt: new Date()
    };
    setStudioData({ ...studioData, announcements: [item, ...studioData.announcements] });
    setNewAnnouncementTitle("");
    setNewAnnouncementContent("");
  };

  const handleAddFaculty = () => {
    if (!newFacultyName || !newFacultySubject) return;
    const item = {
      name: newFacultyName.trim(),
      subject: newFacultySubject.trim(),
      experience: newFacultyExp.trim() || "10+ Years",
      qualification: "Senior Faculty",
      highlight: "Kota Expert"
    };
    setStudioData({ ...studioData, facultyRoster: [...studioData.facultyRoster, item] });
    setNewFacultyName("");
    setNewFacultySubject("");
    setNewFacultyExp("");
  };

  // Voucher Verification & Redemption
  const handleVerifyVoucher = async (e) => {
    e?.preventDefault();
    if (!voucherCodeInput.trim()) return;
    setIsVerifying(true);
    setVerificationResult(null);
    try {
      const res = await partnerAPI.verifyCounterVoucher(voucherCodeInput);
      setVerificationResult(res);
      // Pre-fill admission report if active
      if (res.valid && res.voucher) {
        setAdmissionForm({
          ...admissionForm,
          voucherCode: res.voucher.voucherId,
          studentName: res.voucher.studentName,
          studentPhone: res.voucher.studentPhone,
          batchName: res.voucher.batch
        });
      }
    } catch (err) {
      setVerificationResult({ valid: false, error: err.message });
    } finally {
      setIsVerifying(false);
    }
  };

  // Report Offline Admission
  const handleReportAdmission = async (e) => {
    e.preventDefault();
    setIsReportingAdmission(true);
    setAdmissionReportResult(null);
    try {
      const res = await partnerAPI.reportAdmission(admissionForm);
      setAdmissionReportResult({ type: "success", text: res.message });
      // Refresh admissions list
      const admRes = await partnerAPI.getAdmissions();
      setReportedAdmissions(admRes || []);
    } catch (err) {
      setAdmissionReportResult({ type: "error", text: err.message || "Failed to report admission." });
    } finally {
      setIsReportingAdmission(false);
    }
  };

  // Submit Official Response to RMS Dispute
  const handleRespondRms = async (e) => {
    e.preventDefault();
    if (!selectedRmsTicket || !rmsResponseText.trim()) return;
    setIsSubmittingRmsResponse(true);
    try {
      const res = await partnerAPI.respondRMSTicket(selectedRmsTicket.ticketId, rmsResponseText);
      alert(res.message);
      setRmsResponseText("");
      setSelectedRmsTicket(null);
      // Refresh tickets
      const rmsRes = await partnerAPI.getRMSTickets();
      setRmsTickets(rmsRes.tickets || []);
    } catch (err) {
      alert(err.message || "Failed to submit response.");
    } finally {
      setIsSubmittingRmsResponse(false);
    }
  };

  // Submit Sensitive Change Request (Dual Governance)
  const handleSubmitChangeRequest = async (e) => {
    e.preventDefault();
    setIsSubmittingChange(true);
    setChangeResult(null);
    try {
      const res = await partnerAPI.submitForApproval({
        changeType,
        description: changeDesc,
        diff: {
          field: changeField,
          oldValue: changeOldVal,
          newValue: changeNewVal
        }
      });
      setChangeResult({ type: "success", text: res.message });
      setChangeDesc("");
      setChangeNewVal("");
    } catch (err) {
      setChangeResult({ type: "error", text: err.message || "Submission failed." });
    } finally {
      setIsSubmittingChange(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4">
        <Loader2 className="w-8 h-8 animate-spin text-[#124B38]" />
      </div>
    );
  }

  // --- UN-AUTHENTICATED: INVITATION PASSWORD SETUP WIZARD ---
  if (!isAuthenticated && isSetupMode) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] pt-24 pb-16 px-4 flex items-center justify-center">
        <div className="bg-white border-2 border-[#E8E4DA] rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-5">
          <div className="text-center space-y-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gold-500/20 text-gold-900 border border-gold-400/30">
              FutureSelector Partner Onboarding
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-2">
              Activate Partner Portal
            </h1>
            <p className="text-xs text-[#5F6B64]">
              You have been invited by FutureSelector Super Admin to manage your institute's profile and admissions.
            </p>
          </div>

          {setupSuccess ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <div className="font-bold text-emerald-900 text-sm">Account Activated Successfully!</div>
              <p className="text-xs text-slate-600">Your password has been securely registered. You may now sign in.</p>
              <button
                onClick={() => {
                  setIsSetupMode(false);
                  setLoginPassword(setupPassword);
                }}
                className="btn-primary text-xs py-2 px-4 font-bold w-full"
              >
                Proceed to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleSetupPassword} className="space-y-3 text-xs">
              {setupError && (
                <div className="p-3 rounded-xl bg-red-50 text-red-900 border border-red-200 font-bold">
                  {setupError}
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Director / Authorized Contact Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Rajesh Maheshwari"
                  value={setupName}
                  onChange={(e) => setSetupName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8E4DA] outline-none focus:border-[#124B38]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Official Mobile Number</label>
                <input
                  type="text"
                  required
                  placeholder="+91 94141 22334"
                  value={setupPhone}
                  onChange={(e) => setSetupPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8E4DA] outline-none focus:border-[#124B38]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Set Secure Password (min 8 chars) *</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  placeholder="••••••••"
                  value={setupPassword}
                  onChange={(e) => setSetupPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8E4DA] outline-none focus:border-[#124B38]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Confirm Password *</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  placeholder="••••••••"
                  value={setupConfirm}
                  onChange={(e) => setSetupConfirm(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8E4DA] outline-none focus:border-[#124B38]"
                />
              </div>

              <button
                type="submit"
                className="btn-primary text-xs py-2.5 px-4 font-bold w-full mt-2 cursor-pointer"
              >
                Save Password & Activate Portal
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setIsSetupMode(false)}
                  className="text-xs text-[#124B38] font-bold hover:underline cursor-pointer"
                >
                  Already set up? Sign in here
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  // --- UN-AUTHENTICATED: PARTNER LOGIN SCREEN ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] pt-24 pb-16 px-4 flex items-center justify-center">
        <div className="bg-white border-2 border-[#E8E4DA] rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#124B38]/10 text-[#124B38] border border-[#124B38]/20">
              Coaching Partner Studio
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Partner Portal Login
            </h1>
            <p className="text-xs text-[#5F6B64]">
              Access restricted to authorized center directors and admissions in-charge accounts provisioned by FutureSelector.
            </p>
          </div>

          {loginError && (
            <div className="p-3 rounded-xl bg-red-50 text-red-900 border border-red-200 text-xs font-bold">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Director / Authorized Email *</label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="partner@allen.in"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E4DA] outline-none focus:border-[#124B38] bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Password *</label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E4DA] outline-none focus:border-[#124B38] bg-white font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Default demo key: partner2026</span>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="btn-primary text-xs py-3 px-4 font-bold w-full flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              {isLoggingIn ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4 text-gold-300" />}
              <span>Sign In to Partner Portal</span>
            </button>
          </form>

          <div className="pt-4 border-t border-[#E8E4DA] text-center space-y-2">
            <p className="text-[11px] text-[#5F6B64]">
              Are you an educational institute wanting to partner with FutureSelector?
            </p>
            <Link
              to="/find-coaching"
              className="text-xs font-bold text-[#124B38] hover:underline block"
            >
              Learn about Partner Verification →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // --- AUTHENTICATED PARTNER STUDIO DASHBOARD ---
  const isPublished = instituteData?.publicationStatus === "PUBLISHED";
  const isVerified = instituteData?.verificationStatus === "VERIFIED" || instituteData?.verified;

  return (
    <div className="min-h-screen bg-[#FAF8F5] pt-24 sm:pt-28 pb-16 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Portal Header Card */}
        <div className="bg-white border-2 border-[#E8E4DA] rounded-3xl p-6 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gold-500/20 text-gold-900 border border-gold-400/30">
                Partner Studio
              </span>
              {isPublished ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Publicly Live
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-600" /> Draft / Awaiting Publication
                </span>
              )}
              {isVerified && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                  ✓ Verified Badge
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {instituteData?.name}
            </h1>
            <p className="text-xs text-[#5F6B64]">
              Center Desk: <strong>{partnerUser?.name}</strong> ({partnerUser?.email}) | {instituteData?.location}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              to={`/institute/${instituteData?.slug || instituteData?.numericId}`}
              className="px-3 py-2 rounded-xl border border-[#E8E4DA] hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5"
              target="_blank"
            >
              <span>View Public Page</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            <button
              onClick={handleLogout}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Studio Navigation Bar */}
        <div className="bg-white border border-[#E8E4DA] rounded-2xl p-2 shadow-xs flex flex-wrap gap-2 text-xs font-bold">
          {[
            { id: "STUDIO", label: "Profile Studio & Media", icon: Image },
            { id: "LEADS", label: `Released Leads (${leads.length})`, icon: Users },
            { id: "VERIFIER", label: "Admission Pass Verifier", icon: Ticket },
            { id: "ADMISSIONS", label: `Report Admission (${reportedAdmissions.length})`, icon: FileCheck },
            { id: "RMS", label: `Assigned Grievances (${rmsTickets.length})`, icon: MessageSquare },
            { id: "APPROVALS", label: "Request Sensitive Edit", icon: ShieldAlert }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`px-3.5 py-2 rounded-xl flex items-center gap-2 cursor-pointer transition-all ${
                activeTab === id 
                  ? "bg-[#124B38] text-white shadow-xs" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* ==================================================== */}
        {/* TAB 1: INSTAGRAM-STYLE PROFILE STUDIO & SHOWCASE     */}
        {/* ==================================================== */}
        {activeTab === "STUDIO" && (
          <div className="space-y-6">
            {studioFeedback && (
              <div className={`p-4 rounded-2xl text-xs font-bold ${
                studioFeedback.type === "success" 
                  ? "bg-emerald-50 text-emerald-900 border border-emerald-200" 
                  : "bg-red-50 text-red-900 border border-red-200"
              }`}>
                {studioFeedback.text}
              </div>
            )}

            {/* Banner & Tagline */}
            <div className="bg-white border border-[#E8E4DA] rounded-3xl p-6 shadow-card space-y-4">
              <div className="flex items-center justify-between border-b border-[#E8E4DA] pb-3">
                <div>
                  <h2 className="text-base font-black text-slate-900">Institute Brand Showcase</h2>
                  <p className="text-xs text-[#5F6B64]">Direct permitted edits. Changes reflect live on your public profile.</p>
                </div>
                <button
                  onClick={handleSaveStudio}
                  disabled={isSavingStudio}
                  className="btn-primary text-xs py-2 px-4 font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  {isSavingStudio ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5 text-gold-300" />}
                  <span>Save Live Changes</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Center Tagline</label>
                  <input
                    type="text"
                    value={studioData.tagline}
                    onChange={(e) => setStudioData({ ...studioData, tagline: e.target.value })}
                    placeholder="e.g. Kota's Pioneer in JEE Advanced Mentorship"
                    className="w-full px-3 py-2 rounded-xl border border-[#E8E4DA]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Official Website Link</label>
                  <input
                    type="url"
                    value={studioData.socialLinks?.website || ""}
                    onChange={(e) => setStudioData({
                      ...studioData,
                      socialLinks: { ...studioData.socialLinks, website: e.target.value }
                    })}
                    placeholder="https://allen.ac.in"
                    className="w-full px-3 py-2 rounded-xl border border-[#E8E4DA]"
                  />
                </div>
              </div>
            </div>

            {/* Announcements Feed */}
            <div className="bg-white border border-[#E8E4DA] rounded-3xl p-6 shadow-card space-y-4">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-emerald-700" />
                Latest Announcements & Batch Updates
              </h3>

              <div className="p-4 bg-slate-50 rounded-2xl border border-[#E8E4DA] space-y-3 text-xs">
                <span className="font-bold text-slate-800 block">Post New Center Announcement</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Title (e.g. Dropper Batch 2026 Orientation)"
                    value={newAnnouncementTitle}
                    onChange={(e) => setNewAnnouncementTitle(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-[#E8E4DA] bg-white sm:col-span-2"
                  />
                  <input
                    type="text"
                    placeholder="Badge (e.g. Admissions Open)"
                    value={newAnnouncementBadge}
                    onChange={(e) => setNewAnnouncementBadge(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-[#E8E4DA] bg-white"
                  />
                </div>
                <textarea
                  rows={2}
                  placeholder="Details about date, venue, test series schedule..."
                  value={newAnnouncementContent}
                  onChange={(e) => setNewAnnouncementContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8E4DA] bg-white"
                />
                <button
                  type="button"
                  onClick={handleAddAnnouncement}
                  className="btn-primary text-xs py-2 px-3.5 font-bold cursor-pointer"
                >
                  Add Announcement
                </button>
              </div>

              {/* Announcements List */}
              <div className="space-y-2">
                {studioData.announcements.map((ann, idx) => (
                  <div key={idx} className="p-3 bg-white rounded-xl border border-[#E8E4DA] flex items-start justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-bold">
                          {ann.badge}
                        </span>
                        <strong className="text-slate-900">{ann.title}</strong>
                      </div>
                      <p className="text-slate-600 mt-1">{ann.content}</p>
                    </div>
                    <button
                      onClick={() => {
                        const copy = [...studioData.announcements];
                        copy.splice(idx, 1);
                        setStudioData({ ...studioData, announcements: copy });
                      }}
                      className="text-slate-400 hover:text-red-600 cursor-pointer p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Campus Photo Gallery */}
            <div className="bg-white border border-[#E8E4DA] rounded-3xl p-6 shadow-card space-y-4">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-700" />
                Campus & Classroom Photo Gallery
              </h3>

              <div className="p-4 bg-slate-50 rounded-2xl border border-[#E8E4DA] space-y-2 text-xs">
                <span className="font-bold text-slate-800 block">Add Photo URL</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="url"
                    placeholder="Image URL (Unsplash or CDN link)"
                    value={newGalleryUrl}
                    onChange={(e) => setNewGalleryUrl(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-[#E8E4DA] bg-white sm:col-span-2"
                  />
                  <select
                    value={newGalleryCategory}
                    onChange={(e) => setNewGalleryCategory(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-[#E8E4DA] bg-white font-bold"
                  >
                    <option value="CAMPUS">Campus & Building</option>
                    <option value="CLASSROOM">Classroom</option>
                    <option value="FACULTY">Faculty & Desks</option>
                    <option value="RESULTS">Results Celebration</option>
                  </select>
                </div>
                <input
                  type="text"
                  placeholder="Caption (e.g. Modern Digital Smart Lecture Hall)"
                  value={newGalleryCaption}
                  onChange={(e) => setNewGalleryCaption(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8E4DA] bg-white"
                />
                <button
                  type="button"
                  onClick={handleAddGalleryItem}
                  className="btn-primary text-xs py-2 px-3.5 font-bold cursor-pointer"
                >
                  Add Photo to Showcase
                </button>
              </div>

              {/* Gallery Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {studioData.gallery.map((img, idx) => (
                  <div key={idx} className="relative group rounded-2xl overflow-hidden border border-[#E8E4DA] aspect-video bg-slate-100">
                    <img src={img.url} alt={img.caption} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-between text-white text-[11px]">
                      <span>{img.caption}</span>
                      <button
                        onClick={() => {
                          const copy = [...studioData.gallery];
                          copy.splice(idx, 1);
                          setStudioData({ ...studioData, gallery: copy });
                        }}
                        className="self-end text-red-300 hover:text-red-100 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Senior Faculty Spotlights */}
            <div className="bg-white border border-[#E8E4DA] rounded-3xl p-6 shadow-card space-y-4">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-700" />
                Senior Faculty Roster
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs p-3 bg-slate-50 rounded-2xl border border-[#E8E4DA]">
                <input
                  type="text"
                  placeholder="Faculty Name (e.g. Dr. S.K. Verma)"
                  value={newFacultyName}
                  onChange={(e) => setNewFacultyName(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-[#E8E4DA] bg-white sm:col-span-2"
                />
                <input
                  type="text"
                  placeholder="Subject (e.g. Physics)"
                  value={newFacultySubject}
                  onChange={(e) => setNewFacultySubject(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-[#E8E4DA] bg-white"
                />
                <button
                  type="button"
                  onClick={handleAddFaculty}
                  className="btn-primary text-xs py-1.5 px-3 font-bold cursor-pointer"
                >
                  Add Faculty
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {studioData.facultyRoster.map((fac, idx) => (
                  <div key={idx} className="p-3 rounded-xl border border-[#E8E4DA] flex items-center justify-between">
                    <div>
                      <strong className="text-slate-900 block font-bold">{fac.name}</strong>
                      <span className="text-[11px] text-emerald-800 font-bold">{fac.subject}</span>
                      <span className="text-[10px] text-slate-500 ml-2">({fac.experience})</span>
                    </div>
                    <button
                      onClick={() => {
                        const copy = [...studioData.facultyRoster];
                        copy.splice(idx, 1);
                        setStudioData({ ...studioData, facultyRoster: copy });
                      }}
                      className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 2: RELEASED CONFIRMED LEADS                      */}
        {/* ==================================================== */}
        {activeTab === "LEADS" && (
          <div className="bg-white border border-[#E8E4DA] rounded-3xl p-6 shadow-card space-y-4">
            <div className="border-b border-[#E8E4DA] pb-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                Verified Student Consent Desk
              </span>
              <h2 className="text-lg font-black text-slate-900 mt-1">
                Released Confirmed Leads ({leads.length})
              </h2>
              <p className="text-xs text-[#5F6B64]">
                Strict server isolation: Only students who have explicitly locked a seat pass and confirmed data sharing consent with {instituteData?.name} appear here.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8F5] border-b border-[#E8E4DA] text-[10px] font-black uppercase tracking-wider text-slate-700">
                  <tr>
                    <th className="py-3 px-4">Student & Contact</th>
                    <th className="py-3 px-4">Exam & Year</th>
                    <th className="py-3 px-4">Pass Voucher</th>
                    <th className="py-3 px-4">Consent Timestamp</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E4DA]">
                  {leads.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        No released leads yet for this coaching center.
                      </td>
                    </tr>
                  ) : (
                    leads.map((lead) => (
                      <tr key={lead._id || lead.leadId} className="hover:bg-slate-50">
                        <td className="py-3.5 px-4">
                          <strong className="text-slate-900 block font-bold text-sm">{lead.studentName}</strong>
                          <span className="text-[11px] text-emerald-800 font-mono font-bold flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {lead.phone}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-700">
                          {lead.exam} ({lead.targetYear})
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                          {lead.voucherCode || "SEAT-CONFIRMED"}
                        </td>
                        <td className="py-3.5 px-4 text-[11px] text-slate-500">
                          {lead.consentTimestamp ? new Date(lead.consentTimestamp).toLocaleDateString() : "Live Verified"}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            RELEASED
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 3: COUNTER VOUCHER VERIFIER                      */}
        {/* ==================================================== */}
        {activeTab === "VERIFIER" && (
          <div className="bg-white border border-[#E8E4DA] rounded-3xl p-6 sm:p-8 shadow-card space-y-6">
            <div>
              <h2 className="text-lg font-black text-slate-900">
                Instant Admission Pass Verifier
              </h2>
              <p className="text-xs text-[#5F6B64]">
                Verify the student's ₹15,000 FutureSelector Fee Waiver Pass at the cash counter before issuing the final tuition fee invoice.
              </p>
            </div>

            <form onSubmit={handleVerifyVoucher} className="flex gap-2">
              <input
                type="text"
                value={voucherCodeInput}
                onChange={(e) => setVoucherCodeInput(e.target.value.toUpperCase())}
                placeholder="Enter Pass ID e.g. FS-SEAT-7429"
                className="flex-1 px-4 py-2.5 rounded-xl border border-[#E8E4DA] font-mono font-bold text-sm outline-none focus:border-[#124B38]"
              />
              <button
                type="submit"
                disabled={isVerifying}
                className="btn-primary px-6 py-2.5 text-xs font-bold flex items-center gap-2 cursor-pointer"
              >
                {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>Verify Pass</span>
              </button>
            </form>

            {verificationResult && (
              <div className={`p-5 rounded-2xl border text-xs space-y-3 ${
                verificationResult.valid 
                  ? "bg-emerald-50/70 border-emerald-300 text-emerald-900" 
                  : "bg-red-50 border-red-200 text-red-900"
              }`}>
                {verificationResult.valid ? (
                  <>
                    <div className="flex items-center gap-2 font-black text-sm">
                      <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                      <span>Valid Admission Pass — Apply ₹15,000 Flat Grant Waiver</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-white/80 p-4 rounded-xl border border-emerald-200 text-slate-800">
                      <div><strong>Student Name:</strong> {verificationResult.voucher?.studentName}</div>
                      <div><strong>Mobile Number:</strong> {verificationResult.voucher?.studentPhone}</div>
                      <div><strong>Target Center:</strong> {verificationResult.voucher?.instituteName}</div>
                      <div><strong>Grant Value:</strong> ₹{verificationResult.voucher?.discountValue?.toLocaleString()}</div>
                      <div><strong>Escrow Protected:</strong> {verificationResult.voucher?.escrowProtection}</div>
                      <div><strong>Audit Status:</strong> {verificationResult.voucher?.verificationStatus}</div>
                    </div>

                    <button
                      onClick={() => {
                        setActiveTab("ADMISSIONS");
                        setAdmissionForm({
                          ...admissionForm,
                          voucherCode: verificationResult.voucher?.voucherId,
                          studentName: verificationResult.voucher?.studentName,
                          studentPhone: verificationResult.voucher?.studentPhone
                        });
                      }}
                      className="btn-primary text-xs py-2 px-4 font-bold cursor-pointer"
                    >
                      Proceed to Report Admission & Upload Receipt →
                    </button>
                  </>
                ) : (
                  <div className="font-bold">
                    {verificationResult.error || "Invalid Pass ID. No active record found."}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 4: OFFLINE ADMISSION REPORTING & RECEIPT DESK    */}
        {/* ==================================================== */}
        {activeTab === "ADMISSIONS" && (
          <div className="space-y-6">
            <div className="bg-white border border-[#E8E4DA] rounded-3xl p-6 shadow-card space-y-4">
              <div className="border-b border-[#E8E4DA] pb-3">
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Admissions Ledger & Reconciliation
                </span>
                <h2 className="text-lg font-black text-slate-900 mt-1">
                  Report Student Admission (Offline Receipt Submission)
                </h2>
                <p className="text-xs text-[#5F6B64]">
                  Submit student cash/bank receipt details for Super Admin 4-point verification. Verified admissions automatically unlock escrow-protected commission ledger payments.
                </p>
              </div>

              {admissionReportResult && (
                <div className={`p-4 rounded-xl text-xs font-bold ${
                  admissionReportResult.type === "success" 
                    ? "bg-emerald-50 text-emerald-900 border border-emerald-200" 
                    : "bg-red-50 text-red-900 border border-red-200"
                }`}>
                  {admissionReportResult.text}
                </div>
              )}

              <form onSubmit={handleReportAdmission} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Pass / Voucher Code *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. FS-SEAT-7429"
                      value={admissionForm.voucherCode}
                      onChange={(e) => setAdmissionForm({ ...admissionForm, voucherCode: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 rounded-xl border border-[#E8E4DA] font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Student Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aryan Sharma"
                      value={admissionForm.studentName}
                      onChange={(e) => setAdmissionForm({ ...admissionForm, studentName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#E8E4DA]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Student Phone *</label>
                    <input
                      type="text"
                      required
                      placeholder="+91 98765 43210"
                      value={admissionForm.studentPhone}
                      onChange={(e) => setAdmissionForm({ ...admissionForm, studentPhone: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#E8E4DA]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Center Cash/Bank Receipt # *</label>
                    <input
                      type="text"
                      required
                      placeholder="REC-2026-9041"
                      value={admissionForm.receiptNumber}
                      onChange={(e) => setAdmissionForm({ ...admissionForm, receiptNumber: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#E8E4DA] font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Net Tuition Fee Paid (INR) *</label>
                    <input
                      type="number"
                      required
                      value={admissionForm.receiptAmount}
                      onChange={(e) => setAdmissionForm({ ...admissionForm, receiptAmount: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-[#E8E4DA] font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Payment Date *</label>
                    <input
                      type="date"
                      required
                      value={admissionForm.receiptDate}
                      onChange={(e) => setAdmissionForm({ ...admissionForm, receiptDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#E8E4DA]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Receipt Evidence (Scan / PDF link / Cloud URL)</label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/... or uploaded receipt photo"
                    value={admissionForm.receiptFileUrl}
                    onChange={(e) => setAdmissionForm({ ...admissionForm, receiptFileUrl: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8E4DA]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Admissions In-Charge Verification Remarks</label>
                  <textarea
                    rows={2}
                    value={admissionForm.counterNotes}
                    onChange={(e) => setAdmissionForm({ ...admissionForm, counterNotes: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8E4DA]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isReportingAdmission}
                  className="btn-primary text-xs py-2.5 px-6 font-bold flex items-center gap-2 cursor-pointer"
                >
                  {isReportingAdmission ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                  <span>Submit Admission for Super Admin Audit</span>
                </button>
              </form>
            </div>

            {/* List of Reported Admissions */}
            <div className="bg-white border border-[#E8E4DA] rounded-3xl p-6 shadow-card space-y-3">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Submitted Admission History ({reportedAdmissions.length})
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF8F5] border-b border-[#E8E4DA] text-[10px] font-black uppercase tracking-wider text-slate-700">
                    <tr>
                      <th className="py-3 px-4">Pass & Student</th>
                      <th className="py-3 px-4">Receipt Number</th>
                      <th className="py-3 px-4">Fee Paid</th>
                      <th className="py-3 px-4">Audit Status</th>
                      <th className="py-3 px-4">Ledger Record</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E4DA]">
                    {reportedAdmissions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-slate-400">
                          No reported admissions on file yet.
                        </td>
                      </tr>
                    ) : (
                      reportedAdmissions.map((adm) => (
                        <tr key={adm._id || adm.voucherId} className="hover:bg-slate-50">
                          <td className="py-3 px-4">
                            <strong className="text-slate-900 block font-bold">{adm.studentName}</strong>
                            <span className="font-mono text-[10px] text-slate-500">{adm.voucherId}</span>
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-slate-700">
                            {adm.receiptNumber || "N/A"}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">
                            ₹{adm.receiptAmount?.toLocaleString() || 125000}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              adm.verificationStatus === "VERIFIED"
                                ? "bg-emerald-100 text-emerald-900"
                                : adm.verificationStatus === "REJECTED"
                                ? "bg-red-100 text-red-900"
                                : "bg-amber-100 text-amber-900"
                            }`}>
                              {adm.verificationStatus}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] text-emerald-800 font-bold">
                            {adm.commissionTxnId || (adm.commissionGenerated ? "ESCROW_LOCKED" : "Pending Audit")}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 5: ASSIGNED RMS STUDENT GRIEVANCE DESK           */}
        {/* ==================================================== */}
        {activeTab === "RMS" && (
          <div className="bg-white border border-[#E8E4DA] rounded-3xl p-6 shadow-card space-y-4">
            <div className="border-b border-[#E8E4DA] pb-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-red-50 text-red-800 border border-red-200">
                Student Resolution Management Desk (RMS)
              </span>
              <h2 className="text-lg font-black text-slate-900 mt-1">
                Disputes Assigned to This Coaching Center ({rmsTickets.length})
              </h2>
              <p className="text-xs text-[#5F6B64]">
                Respond to student pass fee disputes or batch allocation inquiries. Your response appears directly on the student dashboard.
              </p>
            </div>

            <div className="space-y-3">
              {rmsTickets.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No active student tickets assigned to this center.
                </div>
              ) : (
                rmsTickets.map((t) => (
                  <div key={t._id || t.ticketId} className="p-4 rounded-2xl border border-[#E8E4DA] space-y-3 bg-slate-50/50">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold bg-slate-200 px-2 py-0.5 rounded text-slate-800">
                          {t.ticketId}
                        </span>
                        <strong className="text-sm font-bold text-slate-900">{t.subject}</strong>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          t.status === "RESOLVED" || t.status === "CLOSED" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                        }`}>
                          {t.status}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono">
                        Student: {t.studentName} ({t.studentPhone})
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-[#E8E4DA]">
                      <strong>Grievance Description:</strong> {t.description || t.subject}
                    </p>

                    {t.instituteResponse ? (
                      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950">
                        <strong>Official Institute Response:</strong> {t.instituteResponse}
                        <div className="text-[10px] text-slate-500 mt-1">
                          Responded by: {t.instituteRespondedBy} on {new Date(t.instituteRespondedAt).toLocaleDateString()}
                        </div>
                      </div>
                    ) : (
                      <div>
                        {selectedRmsTicket?.ticketId === t.ticketId ? (
                          <form onSubmit={handleRespondRms} className="space-y-2 mt-2">
                            <textarea
                              rows={3}
                              required
                              placeholder="Write center's official explanation / resolution terms..."
                              value={rmsResponseText}
                              onChange={(e) => setRmsResponseText(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl border border-[#E8E4DA] text-xs bg-white"
                            />
                            <div className="flex gap-2">
                              <button
                                type="submit"
                                disabled={isSubmittingRmsResponse}
                                className="btn-primary text-xs py-1.5 px-4 font-bold cursor-pointer"
                              >
                                {isSubmittingRmsResponse ? "Sending..." : "Dispatch Official Response"}
                              </button>
                              <button
                                type="button"
                                onClick={() => setSelectedRmsTicket(null)}
                                className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold"
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedRmsTicket(t);
                              setRmsResponseText("");
                            }}
                            className="btn-primary text-xs py-1.5 px-3.5 font-bold cursor-pointer"
                          >
                            Submit Official Center Response
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 6: SENSITIVE MUTATION APPROVAL REQUEST           */}
        {/* ==================================================== */}
        {activeTab === "APPROVALS" && (
          <div className="bg-white border border-[#E8E4DA] rounded-3xl p-6 sm:p-8 shadow-card space-y-6">
            <div className="border-b border-[#E8E4DA] pb-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-900 border border-amber-300">
                Two-Person Governance Queue
              </span>
              <h2 className="text-lg font-black text-slate-900 mt-1">
                Request Sensitive Profile or Fee Mutation
              </h2>
              <p className="text-xs text-[#5F6B64]">
                To maintain student trust and prevent unauthorized fee fluctuations, sensitive parameters (Annual Tuition Fee, New Batches, Target Exam Focus) must be audited and ratified by Super Admin.
              </p>
            </div>

            {changeResult && (
              <div className={`p-4 rounded-xl text-xs font-bold ${
                changeResult.type === "success" 
                  ? "bg-emerald-50 text-emerald-900 border border-emerald-200" 
                  : "bg-red-50 text-red-900 border border-red-200"
              }`}>
                {changeResult.text}
              </div>
            )}

            <form onSubmit={handleSubmitChangeRequest} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mutation Category *</label>
                  <select
                    value={changeType}
                    onChange={(e) => setChangeType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8E4DA] bg-white font-bold"
                  >
                    <option value="FEE_STRUCTURE_UPDATE">Tuition Fee Update / Early Bird Discount</option>
                    <option value="BATCH_ADDITION">New Batch Addition (Leader/Nurture)</option>
                    <option value="FACULTY_ROSTER_UPDATE">Senior Faculty Roster Modification</option>
                    <option value="OTHER">Other Material Modification</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Parameter *</label>
                  <input
                    type="text"
                    required
                    value={changeField}
                    onChange={(e) => setChangeField(e.target.value)}
                    placeholder="e.g. 1-Year Dropper Course Fee"
                    className="w-full px-3 py-2 rounded-xl border border-[#E8E4DA]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Current Live Catalog Value</label>
                  <input
                    type="text"
                    value={changeOldVal}
                    onChange={(e) => setChangeOldVal(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8E4DA]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Proposed New Value *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ₹1,20,000 / Yr (15% reduction)"
                    value={changeNewVal}
                    onChange={(e) => setChangeNewVal(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8E4DA]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Business Rationale for Super Admin Review *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="State reason: e.g. Sanctioned early bird discount for Kota round 1 batch..."
                  value={changeDesc}
                  onChange={(e) => setChangeDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8E4DA]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingChange}
                className="btn-primary text-xs py-2.5 px-6 font-bold flex items-center gap-2 cursor-pointer"
              >
                {isSubmittingChange ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>Submit to FutureSelector Approval Desk</span>
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
