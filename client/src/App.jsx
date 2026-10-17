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

function ScrollToTop() {
  const { pathname } = useLocation();
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

function App() {
  return (
    <>
      <ScrollToTop />
      <Navbar />  
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/find-coaching" element={<FindCoaching />} />
        <Route path="/institute/:id" element={<InstituteProfile />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/scholarships" element={<Scholarships />} />
        <Route path="/counselling" element={<Counselling />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        {/* Redirect unknown routes back to Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;