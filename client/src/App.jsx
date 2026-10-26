import { useLayoutEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./component/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import FindCoaching from "./pages/FindCoaching";
import InstituteProfile from "./pages/InstituteProfile";
import Compare from "./pages/Compare";
import Scholarships from "./pages/Scholarships";
import Counselling from "./pages/Counselling";
import Dashboard from "./pages/Dashboard";
import InstitutePortal from "./pages/InstitutePortal";
import Policies from "./pages/Policies";

// Admin Layout & 13 Operation Modules
import AdminLayout from "./layout/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminInstitutes from "./pages/admin/AdminInstitutes";
import AdminLeads from "./pages/admin/AdminLeads";
import AdminAdmissions from "./pages/admin/AdminAdmissions";
import AdminFinance from "./pages/admin/AdminFinance";
import AdminApprovals from "./pages/admin/AdminApprovals";
import AdminRMS from "./pages/admin/AdminRMS";
import AdminCourses from "./pages/admin/AdminCourses";
import AdminCMS from "./pages/admin/AdminCMS";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminTeam from "./pages/admin/AdminTeam";
import AdminAuditLogs from "./pages/admin/AdminAuditLogs";
import AdminSettings from "./pages/admin/AdminSettings";

function ScrollToTop() {
  const { pathname } = useLocation();
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <>
      <ScrollToTop />
      {/* Hide consumer student navigation on Super Admin workspace */}
      {!isAdminRoute && <Navbar />}  
      <Routes>
        {/* Public & Student Portal Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/find-coaching" element={<FindCoaching />} />
        <Route path="/institute/:id" element={<InstituteProfile />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/scholarships" element={<Scholarships />} />
        <Route path="/counselling" element={<Counselling />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/institute-portal" element={<InstitutePortal />} />
        <Route path="/partner" element={<InstitutePortal />} />
        <Route path="/terms" element={<Policies />} />
        <Route path="/privacy" element={<Policies />} />
        <Route path="/refund-policy" element={<Policies />} />
        <Route path="/contact" element={<Policies />} />

        {/* Super Admin Operations Suite - 13 Modular Pages */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="institutes" element={<AdminInstitutes />} />
          <Route path="leads" element={<AdminLeads />} />
          <Route path="admissions" element={<AdminAdmissions />} />
          <Route path="finance" element={<AdminFinance />} />
          <Route path="approvals" element={<AdminApprovals />} />
          <Route path="rms" element={<AdminRMS />} />
          <Route path="courses" element={<AdminCourses />} />
          <Route path="cms" element={<AdminCMS />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="team" element={<AdminTeam />} />
          <Route path="audit-logs" element={<AdminAuditLogs />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* Redirect unknown routes back to Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;