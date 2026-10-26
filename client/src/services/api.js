/**
 * FutureSelector API Client
 * Connects frontend to the Production Express + Mongoose Backend
 */

const API_BASE = "/api";

const request = async (endpoint, options = {}) => {
  // Role-aware token selection to prevent session collisions
  let token = null;
  if (endpoint.startsWith("/partner")) {
    token = localStorage.getItem("fs_partner_token");
  } else if (endpoint.startsWith("/admin")) {
    token = localStorage.getItem("fs_admin_token");
  } else {
    // Student & public endpoints
    token =
      localStorage.getItem("fs_token") ||
      localStorage.getItem("fs_admin_token") ||
      localStorage.getItem("fs_partner_token");
  }

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || data.message || `Request failed with status ${res.status}`);
    }
    return data;
  } catch (error) {
    console.warn(`[API ERROR] ${endpoint}:`, error.message);
    throw error;
  }
};

export const authAPI = {
  getMe: () => request("/auth/me"),

  sendOtp: (phone, name) =>
    request("/auth/send-otp", {
      method: "POST",
      body: JSON.stringify({ phone, name })
    }),

  verifyOtp: (credentials) =>
    request("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify(credentials)
    }),

  googleLogin: (userData) =>
    request("/auth/google", {
      method: "POST",
      body: JSON.stringify(userData)
    }),

  updateProfile: (profileData) =>
    request("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(profileData)
    })
};

export const instituteAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/institutes${query ? `?${query}` : ""}`);
  },

  getByIdOrSlug: (idOrSlug, preview = false) =>
    request(`/institutes/${idOrSlug}${preview ? "?preview=true" : ""}`),

  compare: (ids = [1, 2]) =>
    request(`/institutes/compare?ids=${ids.join(",")}`),

  submitPartnerApplication: (payload) =>
    request("/institutes/partner-apply", {
      method: "POST",
      body: JSON.stringify(payload)
    })
};

export const voucherAPI = {
  claimPass: (voucherData) =>
    request("/vouchers/claim", {
      method: "POST",
      body: JSON.stringify(voucherData)
    }),

  getMyPasses: (phone) =>
    request(`/vouchers/my-passes${phone ? `?phone=${encodeURIComponent(phone)}` : ""}`),

  verifyCode: (code) =>
    request(`/vouchers/verify/${encodeURIComponent(code)}`)
};

export const leadAPI = {
  submitEnquiry: (leadData) =>
    request("/enquiries", {
      method: "POST",
      body: JSON.stringify(leadData)
    }),

  confirmInterest: (leadId, payload) =>
    request(`/enquiries/${encodeURIComponent(leadId)}/confirm-interest`, {
      method: "POST",
      body: JSON.stringify(payload)
    }),

  getMyEnquiries: (phone) =>
    request(`/enquiries/my-enquiries?phone=${encodeURIComponent(phone)}`),

  getAll: () =>
    request("/enquiries"),

  updateStatus: (id, status, notes) =>
    request(`/enquiries/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status, notes })
    })
};

export const counsellingAPI = {
  getAll: () =>
    request("/counselling"),

  createPaymentOrder: (bookingData) =>
    request("/counselling/create-order", {
      method: "POST",
      body: JSON.stringify(bookingData)
    }),

  verifyPayment: (paymentPayload) =>
    request("/counselling/verify-payment", {
      method: "POST",
      body: JSON.stringify(paymentPayload)
    }),

  getMySessions: (phone) =>
    request(`/counselling/my-sessions${phone ? `?phone=${encodeURIComponent(phone)}` : ""}`)
};

export const partnerAPI = {
  login: (credentials) =>
    request("/partner/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials)
    }),

  setupPassword: (payload) =>
    request("/partner/auth/setup-password", {
      method: "POST",
      body: JSON.stringify(payload)
    }),

  getMe: () =>
    request("/partner/auth/me"),

  getProfile: () =>
    request("/partner/profile"),

  updateProfileStudio: (payload) =>
    request("/partner/profile-studio", {
      method: "PUT",
      body: JSON.stringify(payload)
    }),

  submitForApproval: (payload) =>
    request("/partner/submit-for-approval", {
      method: "POST",
      body: JSON.stringify(payload)
    }),

  getLeads: () =>
    request("/partner/leads"),

  verifyCounterVoucher: (voucherCode) =>
    request("/partner/verify-counter", {
      method: "POST",
      body: JSON.stringify({ voucherCode })
    }),

  reportAdmission: (payload) =>
    request("/partner/admissions/report", {
      method: "POST",
      body: JSON.stringify(payload)
    }),

  getAdmissions: () =>
    request("/partner/admissions"),

  getRMSTickets: () =>
    request("/partner/rms"),

  respondRMSTicket: (ticketId, responseText) =>
    request(`/partner/rms/${encodeURIComponent(ticketId)}/respond`, {
      method: "POST",
      body: JSON.stringify({ responseText })
    }),

  // Legacy fallback
  confirmAdmission: (voucherCode, staffName, counterNotes) =>
    request("/partner/confirm-admission", {
      method: "POST",
      body: JSON.stringify({ voucherCode, staffName, counterNotes })
    }),

  requestChange: (payload) =>
    request("/partner/submit-for-approval", {
      method: "POST",
      body: JSON.stringify(payload)
    })
};

export const rmsAPI = {
  submitStudentTicket: (payload) =>
    request("/rms/student-ticket", {
      method: "POST",
      body: JSON.stringify(payload)
    }),

  getMyTickets: (phone) =>
    request(`/rms/my-tickets?phone=${encodeURIComponent(phone)}`),

  confirmResolution: (ticketId, studentFeedback) =>
    request(`/rms/${encodeURIComponent(ticketId)}/student-confirm`, {
      method: "POST",
      body: JSON.stringify({ studentFeedback })
    }),

  reopenTicket: (ticketId, reopenReason) =>
    request(`/rms/${encodeURIComponent(ticketId)}/student-reopen`, {
      method: "POST",
      body: JSON.stringify({ reopenReason })
    })
};

export const adminAPI = {
  login: (credentials) =>
    request("/admin/login", {
      method: "POST",
      body: JSON.stringify(typeof credentials === "string" ? { secretKey: credentials } : credentials)
    }),

  getMe: () =>
    request("/admin/me"),

  getMetrics: () =>
    request("/admin/metrics"),

  getAuditLogs: () =>
    request("/admin/audit-logs"),

  // Manual Institute Onboarding & Management
  getAllInstitutes: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/admin/institutes${qs ? `?${qs}` : ""}`);
  },

  manualAddInstitute: (payload) =>
    request("/admin/institutes/manual", {
      method: "POST",
      body: JSON.stringify(payload)
    }),

  provisionPartner: (instituteId, payload) =>
    request(`/admin/institutes/${encodeURIComponent(instituteId)}/provision-partner`, {
      method: "POST",
      body: JSON.stringify(payload)
    }),

  updatePartnerPermissions: (instituteId, payload) =>
    request(`/admin/institutes/${encodeURIComponent(instituteId)}/permissions`, {
      method: "PUT",
      body: JSON.stringify(payload)
    }),

  publishInstitute: (instituteId) =>
    request(`/admin/institutes/${encodeURIComponent(instituteId)}/publish`, {
      method: "POST"
    }),

  suspendInstitute: (instituteId, reason) =>
    request(`/admin/institutes/${encodeURIComponent(instituteId)}/suspend`, {
      method: "POST",
      body: JSON.stringify({ reason })
    }),

  assignRMSToInstitute: (ticketId, instituteId, instituteName) =>
    request(`/admin/rms/${encodeURIComponent(ticketId)}/assign-institute`, {
      method: "POST",
      body: JSON.stringify({ instituteId, instituteName })
    }),

  getPartnerApplications: () =>
    request("/admin/partner-applications"),

  approvePartnerApplication: (id) =>
    request(`/admin/partner-applications/${encodeURIComponent(id)}/approve`, {
      method: "POST"
    }),

  downloadLeadsCsv: async () => {
    const token = localStorage.getItem("fs_admin_token");
    const res = await fetch("/api/admin/export-csv", {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || "Failed to download leads CSV");
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `futureselector-leads-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },

  getApprovals: (status) =>
    request(`/admin/approvals${status ? `?status=${encodeURIComponent(status)}` : ""}`),

  createApprovalRequest: (payload) =>
    request("/admin/approvals", {
      method: "POST",
      body: JSON.stringify(payload)
    }),

  approveRequest: (id, reviewNote) =>
    request(`/admin/approvals/${encodeURIComponent(id)}/approve`, {
      method: "POST",
      body: JSON.stringify({ reviewNote })
    }),

  rejectRequest: (id, reason) =>
    request(`/admin/approvals/${encodeURIComponent(id)}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason })
    }),

  getAdmissions: (filter) => {
    const params = new URLSearchParams();
    if (filter?.status) params.append("status", filter.status);
    if (filter?.verificationStatus) params.append("verificationStatus", filter.verificationStatus);
    const qs = params.toString();
    return request(`/admin/admissions${qs ? `?${qs}` : ""}`);
  },

  verifyAdmission: (id, verificationNotes) =>
    request(`/admin/admissions/${encodeURIComponent(id)}/verify`, {
      method: "POST",
      body: JSON.stringify({ verificationNotes })
    }),

  flagAdmission: (id, reason) =>
    request(`/admin/admissions/${encodeURIComponent(id)}/flag`, {
      method: "POST",
      body: JSON.stringify({ reason })
    }),

  rejectAdmission: (id, reason) =>
    request(`/admin/admissions/${encodeURIComponent(id)}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason })
    }),

  getFinanceSummary: () =>
    request("/admin/finance/summary"),

  getFinanceLedger: (status) =>
    request(`/admin/finance/ledger${status && status !== "all" ? `?status=${encodeURIComponent(status)}` : ""}`),

  authorizePayout: (id, notes) =>
    request(`/admin/finance/payout/${encodeURIComponent(id)}`, {
      method: "POST",
      body: JSON.stringify({ notes })
    }),

  downloadFinanceCsv: async () => {
    const token = localStorage.getItem("fs_admin_token");
    const res = await fetch("/api/admin/finance/export-csv", {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || "Failed to download financial statement");
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `futureselector-finance-statement-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },

  getRMSTickets: (status, search, priority) => {
    const params = new URLSearchParams();
    if (status && status !== "ALL" && status !== "all") params.append("status", status);
    if (search) params.append("search", search);
    if (priority && priority !== "ALL" && priority !== "all") params.append("priority", priority);
    const qs = params.toString();
    return request(`/admin/rms${qs ? `?${qs}` : ""}`);
  },

  createRMSTicket: (payload) =>
    request("/admin/rms", {
      method: "POST",
      body: JSON.stringify(payload)
    }),

  updateRMSTicketStatus: (id, status, assignedTo, assignedOfficerEmail) =>
    request(`/admin/rms/${encodeURIComponent(id)}/status`, {
      method: "POST",
      body: JSON.stringify({ status, assignedTo, assignedOfficerEmail })
    }),

  resolveRMSTicket: (id, resolutionNotes) =>
    request(`/admin/rms/${encodeURIComponent(id)}/resolve`, {
      method: "POST",
      body: JSON.stringify({ resolutionNotes })
    })
};
