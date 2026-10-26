import { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../services/api";

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

  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Sync with live MongoDB student profile on mount
  useEffect(() => {
    const syncLiveProfile = async () => {
      const token = localStorage.getItem("fs_token");
      if (!token) {
        setIsLoadingAuth(false);
        return;
      }
      try {
        const res = await authAPI.getMe();
        if (res && res.user) {
          setUser(res.user);
          localStorage.setItem("fs_student", JSON.stringify(res.user));
        }
      } catch (err) {
        console.warn("[AUTH SYNC] Invalid or expired student token, clearing session:", err.message);
        localStorage.removeItem("fs_token");
        localStorage.removeItem("fs_student");
        setUser(null);
      } finally {
        setIsLoadingAuth(false);
      }
    };

    syncLiveProfile();
  }, []);

  const [lockedSeats, setLockedSeats] = useState(() => {
    try {
      const saved = localStorage.getItem("fs_locked_seats");
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [];
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

  const login = (userData, token = null) => {
    const studentUser = {
      ...userData,
      name: userData.name || "Student Aspirant",
      email: userData.email || "",
      phone: userData.phone || "",
      exam: userData.exam || "JEE Advanced 2026",
      city: userData.city || "Kota, Rajasthan",
      standard: userData.standard || "12th Science / Dropper",
      dreamCollege: userData.dreamCollege || "IIT Bombay (Computer Science)",
      shortlisted: userData.shortlisted || userData.shortlistedInstitutes || [],
      verified: true
    };

    if (token) {
      localStorage.setItem("fs_token", token);
    }
    setUser(studentUser);
    localStorage.setItem("fs_student", JSON.stringify(studentUser));
    return studentUser;
  };

  const updateProfile = async (updatedFields) => {
    if (!user) return;
    const updated = { ...user, ...updatedFields };
    setUser(updated);
    localStorage.setItem("fs_student", JSON.stringify(updated));

    // Persist changes to MongoDB backend if token exists
    try {
      const res = await authAPI.updateProfile(updatedFields);
      if (res && res.user) {
        setUser(res.user);
        localStorage.setItem("fs_student", JSON.stringify(res.user));
        return res.user;
      }
    } catch (err) {
      console.warn("[PROFILE PERSIST WARN]:", err.message);
    }
    return updated;
  };

  const addLockedSeat = (seatData) => {
    const newSeat = {
      voucherId: seatData.voucherId || `FS-SEAT-${Math.floor(1000 + Math.random() * 9000)}`,
      instituteId: seatData.instituteId || seatData.id || 1,
      instituteName: seatData.instituteName || seatData.name || "Allen Career Institute",
      batch: seatData.batch || "2026 Regular Classroom Batch",
      discountAmount: "₹15,000 Flat Grant",
      status: "ACTIVE • PRESENT AT COUNTER",
      validTill: "Valid till 30 Nov 2026",
      escrowDays: "15-Day Escrow Protected",
      code: seatData.code || `FS-${(seatData.instituteName || seatData.name || "COACHING").split(" ")[0].toUpperCase()}-15K`,
      lockedAt: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      studentName: user?.name || seatData.studentName || "Aryan Sharma"
    };

    setLockedSeats((prev) => {
      const filtered = prev.filter((s) => s.voucherId !== newSeat.voucherId);
      const updated = [newSeat, ...filtered];
      localStorage.setItem("fs_locked_seats", JSON.stringify(updated));
      return updated;
    });

    return newSeat;
  };

  const removeLockedSeat = (voucherId) => {
    setLockedSeats((prev) => {
      const updated = prev.filter((s) => s.voucherId !== voucherId);
      localStorage.setItem("fs_locked_seats", JSON.stringify(updated));
      return updated;
    });
  };

  const logout = () => {
    setUser(null);
    setLockedSeats([]);
    localStorage.removeItem("fs_student");
    localStorage.removeItem("fs_token");
    localStorage.removeItem("fs_locked_seats");
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
        updateProfile,
        toggleShortlist,
        lockedSeats,
        addLockedSeat,
        removeLockedSeat,
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
