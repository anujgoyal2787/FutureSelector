import { useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, Building2, Users, CheckCircle2, IndianRupee, 
  FileCheck, LifeBuoy, GraduationCap, Globe, BarChart3, 
  ShieldAlert, History, Settings, ChevronLeft, ChevronRight, 
  LogOut, ExternalLink, ShieldCheck, Lock, Sparkles, Menu, X, 
  AlertCircle, ArrowRight
} from "lucide-react";
import { useAdminAuth } from "../context/AdminAuthContext";
import logoImg from "../assets/logo.png";

const NAV_GROUPS = [
  {
    group: "Core Operations",
    items: [
      { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
      { to: "/admin/institutes", label: "Institutes & Partners", icon: Building2 },
      { to: "/admin/leads", label: "Students & Leads", icon: Users },
      { to: "/admin/admissions", label: "Admissions & Verification", icon: CheckCircle2 },
      { to: "/admin/finance", label: "Finance & Commissions", icon: IndianRupee },
    ]
  },
  {
    group: "Governance & Support",
    items: [
      { to: "/admin/approvals", label: "Approval Center", icon: FileCheck },
      { to: "/admin/rms", label: "RMS & Support", icon: LifeBuoy },
      { to: "/admin/courses", label: "Courses & Scholarships", icon: GraduationCap },
    ]
  },
  {
    group: "Content & Intelligence",
    items: [
      { to: "/admin/cms", label: "Website CMS", icon: Globe },
      { to: "/admin/analytics", label: "Analytics & Reports", icon: BarChart3 },
    ]
  },
  {
    group: "System & Security",
    items: [
      { to: "/admin/team", label: "Team & Permissions", icon: ShieldAlert },
      { to: "/admin/audit-logs", label: "Audit Logs", icon: History },
      { to: "/admin/settings", label: "Settings & Integrations", icon: Settings },
    ]
  }
];

export default function AdminLayout() {
  const { isAuthenticated, adminUser, loginAdmin, logoutAdmin, isLoading } = useAdminAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [adminKey, setAdminKey] = useState("admin2026");
  const [loginError, setLoginError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  // If not authenticated, show Super Admin Gate Modal
  if (!isAuthenticated && !isLoading) {
    const handleLogin = async (e) => {
      e.preventDefault();
      setIsSubmitting(true);
      setLoginError("");
      const res = await loginAdmin({ secretKey: adminKey });
      setIsSubmitting(false);
      if (!res.success) {
        setLoginError(res.error || "Invalid Secret Key. Use 'admin2026'");
      }
    };

    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white border-2 border-[#E8E4DA] rounded-3xl p-8 shadow-card space-y-6">
          <div className="flex items-center justify-between">
            <img src={logoImg} alt="FutureSelector" className="h-8 w-auto object-contain" />
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gold-500/20 text-gold-800 border border-gold-400/30">
              Admin Gateway
            </span>
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Super Admin Authentication
            </h2>
            <p className="text-xs text-[#5F6B64] leading-relaxed">
              Enter your master secret key or administrative credentials to unlock the operational command center.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Admin Master Secret Key
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  placeholder="Enter key (default: admin2026)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E4DA] text-xs font-mono font-medium text-slate-900 bg-white outline-none focus:border-[#124B38] focus:ring-4 focus:ring-[#124B38]/15 transition-all"
                />
                <Lock className="w-4 h-4 text-[#5F6B64] absolute right-3 top-3" />
              </div>
              {loginError && (
                <p className="text-[10px] text-red-600 font-medium mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {loginError}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#124B38] hover:bg-[#0D3A2C] text-white text-xs font-bold py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <span>{isSubmitting ? "Authenticating..." : "Unlock Super Admin Shell"}</span>
              <ArrowRight className="w-3.5 h-3.5 text-gold-300" />
            </button>

            <div className="p-2.5 bg-[#FAF8F5] border border-[#E8E4DA] rounded-xl text-center">
              <span className="text-[10px] font-bold text-[#124B38]">
                ⚡ Development Secret: <code className="font-mono">admin2026</code>
              </span>
            </div>
          </form>

          <div className="pt-2 text-center">
            <Link to="/" className="text-[11px] font-bold text-[#5F6B64] hover:text-slate-900 flex items-center justify-center gap-1">
              <span>Return to Public Website</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Active module breadcrumb label
  const allItems = NAV_GROUPS.flatMap(g => g.items);
  const currentItem = allItems.find(item => 
    location.pathname === item.to || (item.to !== "/admin/dashboard" && location.pathname.startsWith(item.to))
  ) || { label: "Operations Dashboard" };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col antialiased text-[#1C201D]">
      
      {/* ---------------------------------------------------- */}
      {/* TOP DESK HEADER BAR */}
      {/* ---------------------------------------------------- */}
      <header className="h-16 bg-white border-b border-[#E8E4DA] sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 shadow-2xs">
        
        {/* Left: Hamburger (mobile) / Breadcrumb & Status */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-xl border border-[#E8E4DA] text-slate-700 hover:bg-slate-50 cursor-pointer"
            title="Toggle Menu"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1.5 rounded-lg border border-[#E8E4DA] text-[#5F6B64] hover:text-slate-900 hover:bg-slate-50 cursor-pointer transition-colors"
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-[#5F6B64]">Super Admin</span>
            <span className="text-[#E8E4DA]">/</span>
            <strong className="text-slate-900 font-black">{currentItem.label}</strong>
          </div>
        </div>

        {/* Right: Live DB Status, Public Link & Staff Card */}
        <div className="flex items-center gap-3">
          
          {/* Live DB Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            <span>MongoDB Live (127.0.0.1)</span>
          </div>

          {/* Quick link to consumer website */}
          <Link
            to="/"
            target="_blank"
            className="hidden md:flex items-center gap-1.5 text-xs font-bold text-[#5F6B64] hover:text-[#124B38] px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            title="Open Public Student Website in New Tab"
          >
            <span>Live Site</span>
            <ExternalLink className="w-3 h-3" />
          </Link>

          {/* Role Pill */}
          <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-gold-500/20 text-gold-800 border border-gold-400/30">
            {adminUser?.role || "SUPER_ADMIN"}
          </span>

          {/* Staff Avatar / Name */}
          <div className="flex items-center gap-2 pl-2 border-l border-[#E8E4DA]">
            <div className="w-8 h-8 rounded-full bg-[#124B38] text-white flex items-center justify-center text-xs font-black select-none">
              {(adminUser?.name || "A")[0].toUpperCase()}
            </div>
            <div className="hidden xl:block text-left text-xs leading-tight">
              <strong className="text-slate-900 block truncate max-w-[120px]">
                {adminUser?.name || "Super Admin"}
              </strong>
              <span className="text-[10px] text-[#5F6B64] font-mono truncate block max-w-[120px]">
                {adminUser?.email || "admin@futureselector.com"}
              </span>
            </div>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={() => {
              logoutAdmin();
              navigate("/admin");
            }}
            className="p-2 rounded-xl text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all cursor-pointer"
            title="Sign Out of Admin Shell"
          >
            <LogOut className="w-4 h-4" />
          </button>

        </div>

      </header>

      {/* ---------------------------------------------------- */}
      {/* BODY WITH COLLAPSIBLE SIDEBAR + MAIN CANVAS */}
      {/* ---------------------------------------------------- */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* SIDEBAR NAVIGATION (Desktop & Mobile Drawer) */}
        <aside
          className={`bg-white border-r border-[#E8E4DA] flex flex-col justify-between transition-all duration-300 z-20 shrink-0
            ${collapsed ? "lg:w-20" : "lg:w-64"}
            ${mobileOpen ? "fixed inset-y-0 left-0 w-64 shadow-2xl block" : "hidden lg:flex"}
          `}
        >
          
          {/* Top Brand Block */}
          <div className="p-4 border-b border-[#E8E4DA] flex items-center justify-between">
            <Link to="/admin/dashboard" className="flex items-center gap-2 overflow-hidden">
              <img src={logoImg} alt="FutureSelector" className="h-7 w-auto object-contain shrink-0" />
              {!collapsed && (
                <span className="text-[10px] font-black uppercase tracking-wider bg-[#124B38] text-white px-2 py-0.5 rounded">
                  Admin OS
                </span>
              )}
            </Link>
            {mobileOpen && (
              <button onClick={() => setMobileOpen(false)} className="lg:hidden p-1 text-slate-500">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Scrollable Navigation Items */}
          <div className="flex-1 overflow-y-auto py-3 px-3 space-y-5">
            {NAV_GROUPS.map((group, gIdx) => (
              <div key={gIdx} className="space-y-1">
                
                {/* Group Title (Only in Expanded Mode) */}
                {!collapsed && (
                  <h4 className="px-3 text-[9px] font-black uppercase tracking-wider text-[#5F6B64]/70 mb-1">
                    {group.group}
                  </h4>
                )}

                {/* Group Nav Items */}
                <div className="space-y-0.5">
                  {group.items.map((item, iIdx) => {
                    const Icon = item.icon;
                    const isActive = item.exact 
                      ? location.pathname === "/admin" || location.pathname === "/admin/dashboard"
                      : location.pathname.startsWith(item.to);

                    return (
                      <NavLink
                        key={iIdx}
                        to={item.to}
                        onClick={() => setMobileOpen(false)}
                        title={collapsed ? item.label : undefined}
                        className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all
                          ${isActive 
                            ? "bg-[#124B38] text-white shadow-2xs font-extrabold" 
                            : "text-[#5F6B64] hover:text-slate-900 hover:bg-slate-100/80"
                          }
                          ${collapsed ? "justify-center px-0 py-2.5" : ""}
                        `}
                      >
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-gold-300" : "text-[#5F6B64]"}`} />
                        {!collapsed && <span className="truncate">{item.label}</span>}
                      </NavLink>
                    );
                  })}
                </div>

              </div>
            ))}
          </div>

          {/* Bottom Sidebar Footer */}
          <div className="p-3 border-t border-[#E8E4DA] bg-[#FAF8F5]">
            <Link
              to="/institute-portal"
              className={`flex items-center gap-2 p-2 rounded-xl text-[11px] font-bold text-slate-700 hover:bg-white border border-transparent hover:border-[#E8E4DA] transition-all
                ${collapsed ? "justify-center" : ""}
              `}
              title="Switch to Coaching Partner Desk"
            >
              <Building2 className="w-3.5 h-3.5 text-gold-600 shrink-0" />
              {!collapsed && <span className="truncate">Partner Desk</span>}
            </Link>
          </div>

        </aside>

        {/* ---------------------------------------------------- */}
        {/* MAIN MODULE CONTENT CANVAS */}
        {/* ---------------------------------------------------- */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>

      </div>

    </div>
  );
}
