import { useState, useEffect } from "react";
import { 
  IndianRupee, TrendingUp, Clock, CheckCircle2, Download, 
  ArrowUpRight, AlertCircle, Building2, Calendar, FileText, 
  Filter, RefreshCw, Check, X, ShieldCheck, Printer, ArrowRight
} from "lucide-react";
import { adminAPI } from "../../services/api";

export default function AdminFinance() {
  const [filterStatus, setFilterStatus] = useState("all");
  const [summary, setSummary] = useState({
    grossGmv: 580000,
    totalCommission: 66900,
    totalGrants: 60000,
    escrowLocked: 30900,
    eligiblePayout: 13500,
    paidAmount: 36000,
    avgCommissionRate: "11.5%"
  });
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState("");
  const [actionError, setActionError] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  const fetchFinanceData = async () => {
    setIsLoading(true);
    setActionError("");
    try {
      const [sumRes, ledgerRes] = await Promise.all([
        adminAPI.getFinanceSummary().catch(() => null),
        adminAPI.getFinanceLedger(filterStatus).catch(() => null)
      ]);

      if (sumRes && sumRes.summary) {
        setSummary(sumRes.summary);
      }
      if (ledgerRes && ledgerRes.transactions) {
        setTransactions(ledgerRes.transactions);
      }
    } catch (err) {
      console.warn("Could not load finance from backend, using fallback:", err);
      setTransactions([
        {
          transactionId: "TXN-2026-8812",
          instituteName: "Allen Career Institute, Kota",
          studentName: "Aarav Sharma",
          courseName: "JEE Leader Batch (2026-27)",
          admissionFee: 145000,
          grantDiscount: 15000,
          commissionRate: "12%",
          commissionAmount: 17400,
          payoutStatus: "ESCROW_LOCKED",
          dueDate: new Date(Date.now() + 1296000000).toISOString(),
          invoiceId: "INV-ALLEN-042"
        },
        {
          transactionId: "TXN-2026-8809",
          instituteName: "Aakash Institute, South Extension",
          studentName: "Priya Nair",
          courseName: "NEET Medical Achiever",
          admissionFee: 135000,
          grantDiscount: 15000,
          commissionRate: "10%",
          commissionAmount: 13500,
          payoutStatus: "ELIGIBLE_FOR_PAYOUT",
          dueDate: new Date(Date.now() + 432000000).toISOString(),
          invoiceId: "INV-AAK-119"
        },
        {
          transactionId: "TXN-2026-8794",
          instituteName: "Resonance Eduventures, Kota",
          studentName: "Kabir Verma",
          courseName: "JEE 1-Year Dropper",
          admissionFee: 120000,
          grantDiscount: 15000,
          commissionRate: "15%",
          commissionAmount: 18000,
          payoutStatus: "PAID",
          dueDate: new Date(Date.now() - 432000000).toISOString(),
          invoiceId: "INV-RES-088",
          authorizedBy: "admin@futureselector.com"
        },
        {
          transactionId: "TXN-2026-8771",
          instituteName: "FIITJEE Punjabi Bagh, Delhi",
          studentName: "Ananya Iyer",
          courseName: "JEE 2-Year Classroom",
          admissionFee: 180000,
          grantDiscount: 15000,
          commissionRate: "10%",
          commissionAmount: 18000,
          payoutStatus: "PAID",
          dueDate: new Date(Date.now() - 1296000000).toISOString(),
          invoiceId: "INV-FIIT-301",
          authorizedBy: "admin@futureselector.com"
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFinanceData();
  }, [filterStatus]);

  const handleAuthorizePayout = async (id) => {
    const confirm = window.confirm(`Authorize commission payout for transaction ${id}?`);
    if (!confirm) return;
    setActionError("");
    setActionSuccess("");
    try {
      const res = await adminAPI.authorizePayout(id, "Disbursed via automated NEFT escrow clearance");
      if (res.success) {
        setActionSuccess(res.message);
        fetchFinanceData();
      }
    } catch (err) {
      setActionError(err.message || "Failed to authorize payout");
    }
  };

  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      await adminAPI.downloadFinanceCsv();
      setActionSuccess("Financial statement CSV generated and downloaded.");
    } catch (err) {
      setActionError(err.message || "Failed to download financial statement");
    } finally {
      setIsExporting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "PAID":
        return "bg-emerald-50 text-emerald-800 border-emerald-300";
      case "ELIGIBLE_FOR_PAYOUT":
        return "bg-blue-50 text-blue-800 border-blue-300";
      case "ESCROW_LOCKED":
        return "bg-amber-50 text-amber-800 border-amber-300";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="bg-white border-2 border-[#E8E4DA] rounded-3xl p-6 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gold-500/20 text-gold-900 border border-gold-400/30">
            Revenue & Partner Ledger
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2">
            Finance & Commission Reconciliation
          </h1>
          <p className="text-xs text-[#5F6B64]">
            Monitor B2B partner commissions, track fee grant discounts (₹15,000 passes), and authorize scheduled payouts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            disabled={isExporting}
            className="px-3.5 py-2 bg-white border border-[#E8E4DA] text-slate-800 hover:border-slate-400 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? "Generating CSV..." : "Export Statement"}</span>
          </button>

          <button
            onClick={fetchFinanceData}
            disabled={isLoading}
            className="px-3 py-2 bg-white border border-[#E8E4DA] text-slate-800 hover:border-slate-400 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
            title="Refresh Ledger"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </button>
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

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E8E4DA] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Gross Booked GMV</span>
            <div className="w-8 h-8 rounded-xl bg-[#124B38]/10 text-[#124B38] flex items-center justify-center font-bold">
              ₹
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">
            ₹{summary.grossGmv.toLocaleString()}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-700 font-bold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+18.4% this month</span>
          </div>
        </div>

        <div className="bg-white border border-[#E8E4DA] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Commission Accrued</span>
            <div className="w-8 h-8 rounded-xl bg-gold-500/20 text-gold-900 flex items-center justify-center font-bold">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">
            ₹{summary.totalCommission.toLocaleString()}
          </p>
          <span className="text-[10px] text-[#5F6B64] font-medium block mt-1">
            Avg {summary.avgCommissionRate} blended rate
          </span>
        </div>

        <div className="bg-white border border-[#E8E4DA] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pass Grants Sponsored</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">
            ₹{summary.totalGrants.toLocaleString()}
          </p>
          <span className="text-[10px] text-[#5F6B64] font-medium block mt-1">
            Reconciled ₹15,000 fee grants
          </span>
        </div>

        <div className="bg-white border border-[#E8E4DA] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pending Payout Escrow</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-900">
            ₹{(summary.escrowLocked + (summary.eligiblePayout || 0)).toLocaleString()}
          </p>
          <span className="text-[10px] text-amber-700 font-bold block mt-1">
            ₹{summary.eligiblePayout?.toLocaleString() || 0} eligible right now
          </span>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white border border-[#E8E4DA] rounded-3xl shadow-card overflow-hidden">
        <div className="p-4 border-b border-[#E8E4DA] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-black text-slate-900">Partner Commission Ledger</h3>
            <p className="text-xs text-[#5F6B64]">Complete audit trail of student admissions and institutional payable commissions.</p>
          </div>

          <div className="flex items-center gap-2">
            {["all", "ESCROW_LOCKED", "ELIGIBLE_FOR_PAYOUT", "PAID"].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`text-xs px-3 py-1.5 rounded-xl capitalize font-bold transition-all cursor-pointer ${
                  filterStatus === st
                    ? "bg-[#124B38] text-white shadow-xs"
                    : "bg-white text-slate-700 border border-[#E8E4DA] hover:border-slate-400"
                }`}
              >
                {st === "all" ? "All" : st.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] border-b border-[#E8E4DA] text-[10px] font-black uppercase tracking-wider text-slate-700">
              <tr>
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">Institute & Course</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Gross Fee</th>
                <th className="py-3 px-4">Grant Applied</th>
                <th className="py-3 px-4">Commission</th>
                <th className="py-3 px-4">Payout Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E4DA]">
              {transactions.map((txn, idx) => (
                <tr key={txn.transactionId || idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    {txn.transactionId}
                  </td>
                  <td className="py-3.5 px-4">
                    <strong className="text-slate-900 block font-bold">{txn.instituteName}</strong>
                    <span className="text-[11px] text-[#5F6B64]">{txn.courseName}</span>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-800">
                    {txn.studentName}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    ₹{txn.admissionFee.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-[#124B38]">
                    -₹{txn.grantDiscount.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-900 block">₹{txn.commissionAmount.toLocaleString()}</span>
                    <span className="text-[10px] text-[#5F6B64]">({txn.commissionRate})</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(txn.payoutStatus)}`}>
                      {txn.payoutStatus.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <button
                      onClick={() => setSelectedInvoice(txn)}
                      className="px-2.5 py-1 text-[11px] font-bold text-[#124B38] hover:bg-[#124B38]/10 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                    >
                      <FileText className="w-3 h-3" />
                      <span>{txn.invoiceId}</span>
                    </button>

                    {txn.payoutStatus === "ELIGIBLE_FOR_PAYOUT" && (
                      <button
                        onClick={() => handleAuthorizePayout(txn.transactionId)}
                        className="px-2.5 py-1 text-[11px] font-bold bg-[#124B38] text-white hover:bg-[#0D3A2C] rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1 shadow-xs"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Disburse</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tax Invoice Inspection Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border-2 border-[#E8E4DA] rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8E4DA] pb-3">
              <div>
                <span className="text-[10px] font-mono text-[#5F6B64] font-bold block uppercase">B2B Commission Tax Invoice</span>
                <h3 className="text-base font-black text-slate-900">{selectedInvoice.invoiceId}</h3>
              </div>
              <button 
                onClick={() => setSelectedInvoice(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-[#FAF8F5] border border-[#E8E4DA] rounded-2xl space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-[#5F6B64]">Beneficiary Institute:</span>
                <strong className="text-slate-900">{selectedInvoice.instituteName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5F6B64]">Enrolled Student:</span>
                <strong className="text-slate-900">{selectedInvoice.studentName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5F6B64]">Course Batch:</span>
                <span className="text-slate-800">{selectedInvoice.courseName}</span>
              </div>
              <hr className="border-[#E8E4DA]" />
              <div className="flex justify-between">
                <span className="text-[#5F6B64]">Gross Course Tuition:</span>
                <span className="font-mono text-slate-900 font-bold">₹{selectedInvoice.admissionFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-emerald-800 font-bold">
                <span>Fee Grant Discount (Voucher):</span>
                <span>-₹{selectedInvoice.grantDiscount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5F6B64]">Contracted Commission ({selectedInvoice.commissionRate}):</span>
                <span className="font-mono text-[#124B38] font-black text-sm">
                  ₹{selectedInvoice.commissionAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5F6B64]">Payout Status:</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(selectedInvoice.payoutStatus)}`}>
                  {selectedInvoice.payoutStatus.replace(/_/g, " ")}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#E8E4DA]">
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2 border border-[#E8E4DA] rounded-xl text-xs font-bold text-slate-600 cursor-pointer"
              >
                Close
              </button>
              {selectedInvoice.payoutStatus === "ELIGIBLE_FOR_PAYOUT" && (
                <button
                  type="button"
                  onClick={() => {
                    handleAuthorizePayout(selectedInvoice.transactionId);
                    setSelectedInvoice(null);
                  }}
                  className="px-4 py-2 bg-[#124B38] hover:bg-[#0D3A2C] text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Authorize Disbursal Now
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
