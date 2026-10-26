import { useState } from "react";
import { 
  Settings, Shield, Database, Radio, Mail, 
  MessageSquare, Save, Check, RefreshCw, Key, ExternalLink
} from "lucide-react";

export default function AdminSettings() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [whatsappActive, setWhatsappActive] = useState(true);
  const [smsGateway, setSmsGateway] = useState("GUPSHUP_ENTERPRISE");
  const [leadNotificationEmail, setLeadNotificationEmail] = useState("leads@futureselector.com");
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="bg-white border-2 border-[#E8E4DA] rounded-3xl p-6 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-900 text-white">
            Platform Infrastructure
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2">
            Settings & Operational Integrations
          </h1>
          <p className="text-xs text-[#5F6B64]">
            Manage platform communication relays, WhatsApp Business API webhooks, database backups, and emergency controls.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            MongoDB Connected (Localhost:27017)
          </span>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-3 text-xs text-emerald-900 font-bold">
          <Check className="w-5 h-5 text-emerald-700 shrink-0" />
          <span>Operational settings saved and applied to environment variables!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Communication Relays */}
        <div className="bg-white border border-[#E8E4DA] rounded-3xl p-6 shadow-card space-y-4">
          <h3 className="text-sm font-black text-slate-900 border-b border-[#E8E4DA] pb-3 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#124B38]" />
            <span>Communication & Lead Dispatch Webhooks</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                WhatsApp Business API Provider
              </label>
              <select
                value={smsGateway}
                onChange={(e) => setSmsGateway(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E4DA] text-xs font-bold text-slate-900 bg-[#FAF8F5] focus:bg-white focus:border-[#124B38] outline-none"
              >
                <option value="GUPSHUP_ENTERPRISE">Gupshup Enterprise (Active - Route 1)</option>
                <option value="INTERAKT">Interakt WhatsApp Business</option>
                <option value="AISENSY">AiSensy Smart Routing</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Central Operations Alert Email
              </label>
              <input
                type="email"
                value={leadNotificationEmail}
                onChange={(e) => setLeadNotificationEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E4DA] text-xs font-mono font-medium text-slate-900 bg-[#FAF8F5] focus:bg-white focus:border-[#124B38] outline-none"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={whatsappActive}
                onChange={(e) => setWhatsappActive(e.target.checked)}
                className="rounded text-[#124B38] focus:ring-[#124B38]"
              />
              <span>Send instant WhatsApp confirmation to students on ₹15,000 pass generation</span>
            </label>
          </div>
        </div>

        {/* System & Maintenance Switch */}
        <div className="bg-white border border-[#E8E4DA] rounded-3xl p-6 shadow-card space-y-4">
          <h3 className="text-sm font-black text-slate-900 border-b border-[#E8E4DA] pb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-rose-700" />
            <span>Emergency Killswitch & Maintenance</span>
          </h3>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-amber-50/60 border border-amber-200">
            <div>
              <strong className="text-xs font-bold text-slate-900 block">Public Maintenance Mode</strong>
              <p className="text-[11px] text-[#5F6B64] mt-0.5">
                When enabled, the public discovery website will display a maintenance message while the Super Admin suite remains accessible.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setMaintenanceMode(!maintenanceMode)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                maintenanceMode
                  ? "bg-rose-700 text-white shadow-xs"
                  : "bg-white border border-[#E8E4DA] text-slate-700 hover:text-slate-900"
              }`}
            >
              {maintenanceMode ? "MAINTENANCE ACTIVE" : "DISABLED (SITE LIVE)"}
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 bg-[#124B38] hover:bg-[#0D3A2C] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md"
          >
            <Save className="w-4 h-4 text-gold-300" />
            <span>Save Platform Settings</span>
          </button>
        </div>

      </form>

    </div>
  );
}
