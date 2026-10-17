import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("fs_student");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [authModal, setAuthModal] = useState({
    isOpen: false,
    targetInstitute: null,
    message: ""
  });

  const openAuthModal = (institute = null, message = "Unlock full audited details, real batch size reports, and verified student reviews.") => {
    setAuthModal({
      isOpen: true,
      targetInstitute: institute,
      message
    });
  };

  const closeAuthModal = () => {
    setAuthModal({
      isOpen: false,
      targetInstitute: null,
      message: ""
    });
  };

  const login = (userData) => {
    const studentUser = {
      name: userData.name || "Aryan Sharma",
      email: userData.email || "aspirant@futureselector.com",
      phone: userData.phone || "+91 98765 43210",
      exam: userData.exam || "JEE Advanced 2026",
      city: userData.city || "Delhi NCR",
      shortlisted: userData.shortlisted || [1],
      verified: true,
      joinedAt: new Date().toLocaleDateString("en-IN", { month: "short", year: "numeric" })
    };
    setUser(studentUser);
    localStorage.setItem("fs_student", JSON.stringify(studentUser));
    return studentUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("fs_student");
  };

  const toggleShortlist = (instituteId) => {
    if (!user) {
      openAuthModal(null, "Log in to save this coaching to your shortlist.");
      return false;
    }
    const isCurrentlySaved = user.shortlisted?.includes(instituteId);
    const updatedList = isCurrentlySaved
      ? user.shortlisted.filter((id) => id !== instituteId)
      : [...(user.shortlisted || []), instituteId];

    const updatedUser = { ...user, shortlisted: updatedList };
    setUser(updatedUser);
    localStorage.setItem("fs_student", JSON.stringify(updatedUser));
    return !isCurrentlySaved;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        toggleShortlist,
        authModal,
        openAuthModal,
        closeAuthModal
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
