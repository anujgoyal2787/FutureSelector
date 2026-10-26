import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { ShieldCheck, FileText, RefreshCw, Mail, Phone, MapPin, CheckCircle, ArrowLeft } from "lucide-react";

export default function Policies() {
  const location = useLocation();
  const getInitialTab = () => {
    if (location.pathname.includes("privacy")) return "privacy";
    if (location.pathname.includes("refund")) return "refund";
    if (location.pathname.includes("contact")) return "contact";
    return "terms";
  };

  const [activeTab, setActiveTab] = useState(getInitialTab());

  return (
    <div className="min-h-screen bg-surfaceBg text-textMain py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-sm text-textMuted hover:text-brand-600 mb-8 transition-colors"
        >
          <ArrowLeft size={16} /> Back to FutureSelector Home
        </Link>

        {/* Header */}
        <div className="bg-surface rounded-2xl border border-border p-8 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="inline-block px-3 py-1 bg-brand-50 text-brand-700 text-xs font-semibold rounded-full mb-3 border border-brand-200">
                Official Compliance & Legal Standards
              </span>
              <h1 className="text-3xl font-bold tracking-tight text-textMain">Legal, Compliance & Contact</h1>
              <p className="text-textMuted mt-1 text-sm">
                FutureSelector operates transparently in accordance with RBI & statutory digital advisory guidelines.
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 mt-8 border-b border-border pb-4">
            <button
              onClick={() => setActiveTab("terms")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === "terms"
                  ? "bg-brand-600 text-white shadow-sm"
                  : "bg-surface hover:bg-surfaceMuted text-textMuted"
              }`}
            >
              <FileText size={16} /> Terms & Conditions
            </button>
            <button
              onClick={() => setActiveTab("privacy")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === "privacy"
                  ? "bg-brand-600 text-white shadow-sm"
                  : "bg-surface hover:bg-surfaceMuted text-textMuted"
              }`}
            >
              <ShieldCheck size={16} /> Privacy Policy
            </button>
            <button
              onClick={() => setActiveTab("refund")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === "refund"
                  ? "bg-brand-600 text-white shadow-sm"
                  : "bg-surface hover:bg-surfaceMuted text-textMuted"
              }`}
            >
              <RefreshCw size={16} /> Cancellation & Refund Policy
            </button>
            <button
              onClick={() => setActiveTab("contact")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === "contact"
                  ? "bg-brand-600 text-white shadow-sm"
                  : "bg-surface hover:bg-surfaceMuted text-textMuted"
              }`}
            >
              <Mail size={16} /> Contact Us
            </button>
          </div>
        </div>

        {/* Content Box */}
        <div className="bg-surface rounded-2xl border border-border p-8 md:p-10 shadow-sm leading-relaxed text-sm md:text-base space-y-6">
          
          {/* 1. TERMS & CONDITIONS */}
          {activeTab === "terms" && (
            <div className="space-y-6 text-textMuted">
              <h2 className="text-2xl font-bold text-textMain">Terms & Conditions of Service</h2>
              <p>Last Updated: October 2026</p>
              
              <section className="space-y-3">
                <h3 className="text-lg font-semibold text-textMain">1. Platform Nature</h3>
                <p>
                  FutureSelector (<strong className="text-textMain">futureselector.in</strong>) is an independent education discovery, headcount audit, and senior academic advisory platform. We connect JEE & NEET aspirants and their parents with verified educational institutions and senior academic advisors.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-lg font-semibold text-textMain">2. Advisory Booking & Token Fee</h3>
                <p>
                  To prevent fraudulent bookings and ensure guaranteed time slots with verified senior counsellors (IIT/NIT/AIIMS alumni), FutureSelector charges a nominal commitment token fee of <strong className="text-textMain">₹11 (inclusive of GST)</strong>.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-lg font-semibold text-textMain">3. Independent Data & Audits</h3>
                <p>
                  Classroom headcount statistics, batch cap audits, and fee structures published on FutureSelector are compiled through physical audits, student RTI disclosures, and verified partner reporting.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-lg font-semibold text-textMain">4. User Responsibilities</h3>
                <p>
                  Users agree to provide accurate mobile contact details when requesting OTP authentication or booking academic advisory sessions. Fraudulent inquiries or misuse of counselor time is strictly prohibited.
                </p>
              </section>
            </div>
          )}

          {/* 2. PRIVACY POLICY */}
          {activeTab === "privacy" && (
            <div className="space-y-6 text-textMuted">
              <h2 className="text-2xl font-bold text-textMain">Privacy Policy & Student Data Protection</h2>
              <p>Last Updated: October 2026</p>

              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-start gap-3">
                <CheckCircle className="shrink-0 mt-0.5 text-emerald-600" size={18} />
                <div>
                  <p className="font-semibold text-sm">Strict Zero-Spam Policy</p>
                  <p className="text-xs mt-1">We never sell, rent, or trade student phone numbers to third-party telemarketers or unauthorized coaching brokers.</p>
                </div>
              </div>

              <section className="space-y-3">
                <h3 className="text-lg font-semibold text-textMain">1. Information We Collect</h3>
                <p>
                  We collect student name, mobile number, target competitive examination (e.g., JEE Advanced / NEET UG), and coaching preferences strictly for advisory scheduling and voucher redemption.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-lg font-semibold text-textMain">2. Payment Data Security</h3>
                <p>
                  All digital payment transactions (₹11 token fee) are processed directly through <strong>Razorpay Payment Gateway</strong> using 256-bit SSL encryption. FutureSelector does not store credit card numbers, CVVs, or UPI PINs on its servers.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-lg font-semibold text-textMain">3. Communication Preferences</h3>
                <p>
                  Transactional OTPs and confirmed advisory meeting links are delivered via SMS / WhatsApp. You may opt out of promotional advisories at any time.
                </p>
              </section>
            </div>
          )}

          {/* 3. CANCELLATION & REFUND POLICY */}
          {activeTab === "refund" && (
            <div className="space-y-6 text-textMuted">
              <h2 className="text-2xl font-bold text-textMain">Cancellation & Refund Policy</h2>
              <p>Last Updated: October 2026</p>

              <div className="bg-blue-50 border border-blue-200 text-blue-900 p-4 rounded-xl space-y-2">
                <p className="font-semibold text-sm">₹11 Commitment Fee Refund Guarantee</p>
                <p className="text-xs">
                  We believe in 100% transparency. If your 1-on-1 advisory session cannot be conducted or if you need to cancel, you are entitled to a full refund.
                </p>
              </div>

              <section className="space-y-3">
                <h3 className="text-lg font-semibold text-textMain">1. Cancellation Terms</h3>
                <ul className="list-disc pl-5 space-y-1.5 text-sm">
                  <li>Cancellations requested at least <strong>2 hours prior</strong> to the scheduled advisory slot are eligible for a <strong>100% instant refund</strong>.</li>
                  <li>If an assigned counsellor fails to join the Google Meet session within 10 minutes of the scheduled time, an automatic full refund will be initiated.</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h3 className="text-lg font-semibold text-textMain">2. Refund Timeline & Processing</h3>
                <p>
                  All approved refunds are reversed to the original source account (UPI / Debit Card / Net Banking) via <strong>Razorpay</strong>. Refunds typically reflect in the student's bank account within <strong>5 to 7 business days</strong> as per banking network standards.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-lg font-semibold text-textMain">3. How to Request a Refund</h3>
                <p>
                  To request a cancellation or refund, email us at <strong className="text-textMain">support@futureselector.in</strong> with your Booking ID (e.g., CNS-XXXX) or reach out via our official support helpline.
                </p>
              </section>
            </div>
          )}

          {/* 4. CONTACT US */}
          {activeTab === "contact" && (
            <div className="space-y-6 text-textMuted">
              <h2 className="text-2xl font-bold text-textMain">Contact FutureSelector Advisory Desk</h2>
              <p>We are available to assist aspirants and parents Monday through Saturday (9:00 AM – 7:00 PM IST).</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                <div className="p-5 rounded-xl border border-border bg-surfaceMuted space-y-2">
                  <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600 mb-3">
                    <Mail size={20} />
                  </div>
                  <h4 className="font-semibold text-textMain text-sm">Official Email</h4>
                  <p className="text-sm">support@futureselector.in</p>
                  <p className="text-xs text-textMuted">Replies within 4 business hours</p>
                </div>

                <div className="p-5 rounded-xl border border-border bg-surfaceMuted space-y-2">
                  <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600 mb-3">
                    <Phone size={20} />
                  </div>
                  <h4 className="font-semibold text-textMain text-sm">Helpline & WhatsApp</h4>
                  <p className="text-sm">+91 78170 35087</p>
                  <p className="text-xs text-textMuted">Mon-Sat, 9:00 AM - 7:00 PM IST</p>
                </div>

                <div className="p-5 rounded-xl border border-border bg-surfaceMuted space-y-2">
                  <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600 mb-3">
                    <MapPin size={20} />
                  </div>
                  <h4 className="font-semibold text-textMain text-sm">Operational Hub</h4>
                  <p className="text-sm">Vigyan Nagar & Landmark City</p>
                  <p className="text-xs text-textMuted">Kota, Rajasthan — 324005, India</p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
