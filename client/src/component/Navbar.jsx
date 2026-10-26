import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import { 
  Menu, X, Home as HomeIcon, Compass, ArrowRightLeft, 
  Award, Sparkles, User, LogOut, Heart, ArrowRight, ShieldCheck 
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import StarBorder from "./reactbits/StarBorder";
import BorderBeam from "./reactbits/BorderBeam";
import logoImg from "../assets/logo.png";

function Navbar() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [hoveredPath, setHoveredPath] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const location = useLocation();
  const { user, logout, openAuthModal } = useAuth();

  // Animation 2: Smooth Inertia Scroll Progress Line
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    restDelta: 0.001
  });



  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navLinks = [
    { label: "Home", path: "/", icon: HomeIcon },
    { label: "Find Coaching", path: "/find-coaching", icon: Compass },
    { label: "Compare", path: "/compare", icon: ArrowRightLeft },
    { label: "Scholarships", path: "/scholarships", icon: Award },
    { label: "Counselling", path: "/counselling", icon: Sparkles },
  ];

  return (
    <>
      {/* Top Background Fade Mask to prevent scrolled content from bleeding into the top gap */}
      <div 
        className={`fixed top-0 inset-x-0 h-24 bg-gradient-to-b from-background via-background/95 to-transparent pointer-events-none z-40 transition-opacity duration-300 ${
          scrolled ? "opacity-100" : "opacity-0"
        }`} 
      />

      {/* High-Visibility Floating Dock with Scroll & Elevation Animations */}
      <motion.header 
        initial={{ y: -25, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-4 inset-x-0 mx-auto z-50 w-[96%] max-w-7xl"
      >
        <div 
          className={`relative overflow-hidden border transition-all duration-300 rounded-full px-4 sm:px-6 flex items-center justify-between ${
            scrolled 
              ? "py-2 shadow-[0_16px_40px_-10px_rgba(18,75,56,0.16),0_4px_16px_rgba(18,75,56,0.08)] border-brand-200 bg-white scale-[0.995]" 
              : "py-2.5 shadow-[0_12px_40px_-10px_rgba(28,32,29,0.08),0_2px_8px_rgba(28,32,29,0.04)] border-border bg-white/95 backdrop-blur-2xl"
          }`}
        >
          {/* Animation 1: Border Beam / Glow Tracer */}
          <BorderBeam 
            size={300} 
            duration={8} 
            borderWidth={2} 
            colorFrom="#10B981" 
            colorTo="#F59E0B" 
          />

          {/* Animation 2: Smart Scroll Progress Line */}
          <motion.div
            style={{ scaleX, transformOrigin: "left" }}
            className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-brand-600 via-emerald-500 to-amber-500 z-30 pointer-events-none shadow-[0_0_10px_rgba(245,158,11,0.5)]"
          />


          
          {/* Brand Identity with 3D Gold Logo */}
          <Link to="/" className="flex items-center group shrink-0">
            <motion.div 
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 450, damping: 16 }}
              className="flex items-center"
            >
              {!logoError ? (
                <img
                  src={logoImg}
                  alt="FutureSelector"
                  onError={() => setLogoError(true)}
                  className="h-[34px] sm:h-[38px] w-auto max-w-[190px] sm:max-w-[230px] object-contain drop-shadow-xs"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-500 flex items-center justify-center text-white font-black text-xs shadow-sm">
                    FS
                  </div>
                  <span className="font-black text-base sm:text-lg text-slate-900 tracking-tight">
                    Future<span className="text-brand-600">Selector</span>
                  </span>
                </div>
              )}
            </motion.div>
          </Link>

          {/* Animation 3: Desktop Center Segmented Navigation with Magnetic Fluid Dock & Elastic Blob Glider */}
          <nav 
            onMouseLeave={() => setHoveredPath(null)}
            className="hidden lg:flex items-center gap-1 bg-surfaceWarm/90 p-1 rounded-full border border-border relative"
          >
            {navLinks.map((item) => {
              const active = isActive(item.path);
              const currentTab = hoveredPath || navLinks.find(l => isActive(l.path))?.path || "/";
              const isTarget = currentTab === item.path;
              const isHovered = hoveredPath === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onMouseEnter={() => setHoveredPath(item.path)}
                  className={`relative px-3.5 py-1.5 rounded-full text-xs transition-colors duration-200 flex items-center gap-1.5 z-10 select-none ${
                    isTarget ? "text-brand-900 font-black" : "text-slate-600 hover:text-slate-900 font-bold"
                  }`}
                >
                  {/* Elastic Fluid Blob Glider (Smooth liquid spring transition between tabs) */}
                  {isTarget && (
                    <motion.div
                      layoutId="magneticFluidGlider"
                      className={`absolute inset-0 rounded-full z-[-1] ${
                        active
                          ? "bg-white shadow-[0_3px_12px_rgba(18,75,56,0.12),0_1px_3px_rgba(18,75,56,0.06)] border border-brand-200/90"
                          : "bg-white/90 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-slate-200/80"
                      }`}
                      transition={{
                        type: "spring",
                        stiffness: 450,
                        damping: 30,
                        mass: 0.75,
                      }}
                    />
                  )}

                  {/* Active Page Indicator Dot */}
                  {active && (
                    <motion.span
                      layoutId="activeIndicatorDot"
                      className="w-1.5 h-1.5 rounded-full bg-brand-600 shrink-0"
                      transition={{ type: "spring", stiffness: 500, damping: 25 }}
                    />
                  )}

                  {/* Icon with interactive spring lift */}
                  <motion.div
                    animate={isHovered ? { scale: 1.22, y: -1 } : { scale: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 16 }}
                    className="shrink-0 flex items-center justify-center"
                  >
                    <Icon className={`w-3.5 h-3.5 ${active ? "text-brand-600" : isHovered ? "text-brand-700" : "text-slate-500"}`} />
                  </motion.div>

                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Desktop Right Action Area */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2 pl-1">
                {/* Shortlist Counter Badge */}
                {user.shortlisted?.length > 0 && (
                  <motion.div
                    key={user.shortlisted.length}
                    initial={{ scale: 1.25 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 20 }}
                  >
                    <Link 
                      to="/dashboard"
                      title="Shortlisted institutes"
                      className="flex items-center gap-1.5 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-full shadow-2xs hover:bg-rose-100 transition-colors whitespace-nowrap"
                    >
                      <Heart className="w-3.5 h-3.5 fill-rose-500" />
                      <span>{user.shortlisted.length}</span>
                    </Link>
                  </motion.div>
                )}

                {/* Dashboard Pill */}
                <Link
                  to="/dashboard"
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold transition-all whitespace-nowrap ${
                    isActive("/dashboard")
                      ? "bg-brand-50 border-brand-200 text-brand-700 shadow-xs"
                      : "bg-surface border-border text-textMain hover:border-brand-200 hover:bg-brand-50/50"
                  }`}
                >
                  <div className="w-5 h-5 rounded-full bg-brand-600 text-white font-extrabold text-[10px] flex items-center justify-center overflow-hidden shrink-0">
                    {user.picture ? (
                      <img src={user.picture} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user.name?.charAt(0) || "S"
                    )}
                  </div>
                  <span className="max-w-[90px] truncate">{user.name?.split(" ")[0]}</span>
                  <span className="text-[10px] text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded-md font-semibold hidden sm:inline">
                    Dashboard
                  </span>
                </Link>

                {/* Logout Button */}
                <button
                  onClick={logout}
                  title="Sign Out"
                  className="w-7 h-7 rounded-full text-textMuted hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <motion.div
                  whileHover={{ scale: 1.05, y: -1 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 450, damping: 18 }}
                >
                  <Link
                    to="/institute-portal"
                    className="text-xs font-bold text-slate-500 hover:text-brand-700 px-3 py-1.5 rounded-full hover:bg-surfaceWarm transition-colors inline-block whitespace-nowrap"
                  >
                    Partner Portal
                  </Link>

                  <Link
                    to="/login"
                    className="text-xs font-bold text-textMain hover:text-brand-600 px-3.5 py-1.5 rounded-full hover:bg-surfaceWarm transition-colors inline-block whitespace-nowrap"
                  >
                    Log in
                  </Link>
                </motion.div>

                {/* Find Coaching CTA with Magnetic Spring Lift & StarBorder Glow */}
                <motion.div
                  whileHover={{ scale: 1.05, y: -1 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 450, damping: 18 }}
                >
                  <StarBorder
                    as="div"
                    color="#C5A059"
                    speed="4s"
                    className="rounded-full shadow-sm hover:shadow-md transition-shadow"
                    innerClassName="w-full"
                  >
                    <Link
                      to="/find-coaching"
                      className="bg-brand-600 hover:bg-brand-700 text-white text-xs py-1.5 px-4 font-bold rounded-full flex items-center gap-1.5 transition-colors whitespace-nowrap"
                    >
                      <span>Find Coaching</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </StarBorder>
                </motion.div>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Trigger */}
          <button 
            className="lg:hidden text-textMain p-1.5 rounded-full hover:bg-surfaceWarm transition-colors cursor-pointer" 
            onClick={() => setMobileMenu(true)}
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

        </div>
      </motion.header>

      {/* Mobile Drawer (Frosted Glass Sheet with Spring Animation) */}
      <AnimatePresence>
        {mobileMenu && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-xs flex flex-col p-4 lg:hidden"
          >
            <motion.div 
              initial={{ scale: 0.92, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.92, y: 15, opacity: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="bg-white/95 backdrop-blur-2xl border border-border rounded-3xl p-6 shadow-2xl flex flex-col gap-6 max-w-sm w-full mx-auto my-auto"
            >
              
              {/* Header */}
              <div className="flex justify-between items-center border-b border-border pb-4">
                <Link to="/" onClick={() => setMobileMenu(false)} className="flex items-center">
                  {!logoError ? (
                    <img src={logoImg} alt="FutureSelector" className="h-7 w-auto object-contain" onError={() => setLogoError(true)} />
                  ) : (
                    <span className="font-black text-base text-slate-900 tracking-tight">
                      Future<span className="text-brand-600">Selector</span>
                    </span>
                  )}
                </Link>
                <button 
                  onClick={() => setMobileMenu(false)} 
                  className="text-textMuted hover:text-textMain p-1 rounded-full hover:bg-surfaceWarm cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Navigation Links */}
              <div className="flex flex-col gap-1.5">
                {navLinks.map((item) => {
                  const active = isActive(item.path);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenu(false)}
                      className={`text-sm font-bold px-3 py-2.5 rounded-xl transition-colors flex items-center gap-2.5 ${
                        active
                          ? "bg-brand-50 text-brand-700 border border-brand-100"
                          : "text-textMain hover:bg-surfaceWarm"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${active ? "text-brand-600" : "text-textMuted"}`} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              {/* User Session / Auth CTA */}
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                {user ? (
                  <div className="space-y-2">
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileMenu(false)}
                      className="flex items-center justify-between p-3 bg-surfaceWarm rounded-xl border border-border hover:border-brand-200 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-brand-600 text-white font-bold text-xs flex items-center justify-center">
                          {user.name?.charAt(0) || "S"}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-textMain">{user.name}</div>
                          <div className="text-[10px] text-textMuted font-medium">Student Dashboard</div>
                        </div>
                      </div>
                      {user.shortlisted?.length > 0 && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                          <Heart className="w-3 h-3 fill-rose-500" /> {user.shortlisted.length}
                        </span>
                      )}
                    </Link>
                    <button 
                      onClick={() => { logout(); setMobileMenu(false); }}
                      className="w-full text-center py-2.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Sign Out
                    </button>
                  </div>
                ) : (
                  <>
                    <Link 
                      to="/institute-portal" 
                      onClick={() => setMobileMenu(false)} 
                      className="w-full text-center py-2 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl"
                    >
                      Institute Partner Portal
                    </Link>
                    <Link 
                      to="/login" 
                      onClick={() => setMobileMenu(false)} 
                      className="w-full text-center py-2.5 text-xs font-bold text-textMain bg-surfaceWarm rounded-xl hover:bg-border transition-colors"
                    >
                      Log in
                    </Link>
                    <Link 
                      to="/find-coaching" 
                      onClick={() => setMobileMenu(false)} 
                      className="w-full text-center py-2.5 text-xs font-bold text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition-colors shadow-sm"
                    >
                      Find Coaching
                    </Link>
                  </>
                )}
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Navbar;