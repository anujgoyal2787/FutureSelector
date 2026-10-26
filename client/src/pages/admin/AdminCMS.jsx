import { useState } from "react";
import { 
  Globe, Sparkles, Image, Check, AlertCircle, Save, 
  MapPin, Eye, ExternalLink, Megaphone, HelpCircle
} from "lucide-react";

export default function AdminCMS() {
  const [heroTitle, setHeroTitle] = useState("Find the Right JEE & NEET Coaching with Verified Truth");
  const [heroSubtitle, setHeroSubtitle] = useState("Compare genuine batch sizes, faculty rosters, verified fee structures, and claim ₹15,000 direct admission assistance.");
  const [announcementText, setAnnouncementText] = useState("🚨 Early admissions open for 2026-27 Batches. Limited ₹15,000 FutureSelector Fee Waiver Passes available today!");
  const [announcementActive, setAnnouncementActive] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const cities = [
    { name: "Kota, Rajasthan", institutesCount: 28, isFeatured: true },
    { name: "Delhi NCR", institutesCount: 42, isFeatured: true },
    { name: "Hyderabad, Telangana", institutesCount: 19, isFeatured: true },
    { name: "Patna, Bihar", institutesCount: 15, isFeatured: true },
    { name: "Pune, Maharashtra", institutesCount: 12, isFeatured: false },
    { name: "Lucknow, Uttar Pradesh", institutesCount: 11, isFeatured: false },
  ];

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
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gold-500/20 text-gold-900 border border-gold-400/30">
            Frontend Content Studio
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2">
            Website CMS & Visual Banner Manager
          </h1>
          <p className="text-xs text-[#5F6B64]">
            Manage public landing page headlines, marquee announcement tickers, featured coaching hubs, and trust badges.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 bg-white border border-[#E8E4DA] text-slate-800 hover:border-slate-400 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <span>Preview Live Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-3 text-xs text-emerald-900 font-bold">
          <Check className="w-5 h-5 text-emerald-700 shrink-0" />
          <span>Website CMS changes updated and pushed to Edge CDN cache successfully!</span>
        </div>
      )}

      {/* Hero Content Form */}
      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Urgent Announcement Marquee */}
        <div className="bg-white border border-[#E8E4DA] rounded-3xl p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-[#E8E4DA] pb-3">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-gold-600" />
              <span>Announcement Top Bar Ticker</span>
            </h3>

            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={announcementActive}
                onChange={(e) => setAnnouncementActive(e.target.checked)}
                className="rounded text-[#124B38] focus:ring-[#124B38]"
              />
              <span>Display Live on Website</span>
            </label>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Banner Message Text
            </label>
            <input
              type="text"
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E4DA] text-xs font-medium text-slate-900 bg-[#FAF8F5] focus:bg-white focus:border-[#124B38] outline-none"
            />
          </div>
        </div>

        {/* Hero Section Copy */}
        <div className="bg-white border border-[#E8E4DA] rounded-3xl p-6 shadow-card space-y-4">
          <h3 className="text-sm font-black text-slate-900 border-b border-[#E8E4DA] pb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#124B38]" />
            <span>Homepage Hero Header Copy</span>
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Main Headline (H1)
              </label>
              <input
                type="text"
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E4DA] text-xs font-bold text-slate-900 bg-[#FAF8F5] focus:bg-white focus:border-[#124B38] outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Sub-headline Description
              </label>
              <textarea
                rows={3}
                value={heroSubtitle}
                onChange={(e) => setHeroSubtitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E4DA] text-xs font-medium text-slate-900 bg-[#FAF8F5] focus:bg-white focus:border-[#124B38] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Featured Coaching Hubs */}
        <div className="bg-white border border-[#E8E4DA] rounded-3xl p-6 shadow-card space-y-4">
          <h3 className="text-sm font-black text-slate-900 border-b border-[#E8E4DA] pb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#124B38]" />
            <span>Featured Coaching Hubs (City Clusters)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {cities.map((city, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl border border-[#E8E4DA] bg-[#FAF8F5] flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{city.name}</h4>
                  <span className="text-[10px] text-[#5F6B64]">{city.institutesCount} active partner centres</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  city.isFeatured
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-slate-200 text-slate-600"
                }`}>
                  {city.isFeatured ? "Featured" : "Standard"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 bg-[#124B38] hover:bg-[#0D3A2C] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md"
          >
            <Save className="w-4 h-4 text-gold-300" />
            <span>Save & Publish Changes</span>
          </button>
        </div>

      </form>

    </div>
  );
}
