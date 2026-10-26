import { createContext, useContext, useState, useEffect } from "react";
import { adminAPI } from "../services/api";

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem("fs_admin_token") || null);
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const saved = localStorage.getItem("fs_admin_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  // Validate token on mount
  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem("fs_admin_token");
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await adminAPI.getMe();
        if (res.success && res.admin) {
          setAdminUser(res.admin);
          localStorage.setItem("fs_admin_user", JSON.stringify(res.admin));
        } else {
          logoutAdmin();
        }
      } catch {
        // If token expired or invalid, log out
        logoutAdmin();
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const loginAdmin = async (credentials) => {
    try {
      const res = await adminAPI.login(credentials);
      if (res.success && res.token) {
        setAdminToken(res.token);
        setAdminUser(res.admin);
        localStorage.setItem("fs_admin_token", res.token);
        localStorage.setItem("fs_admin_user", JSON.stringify(res.admin));
        return { success: true };
      }
      return { success: false, error: res.error || "Authentication failed" };
    } catch (err) {
      return { success: false, error: err.message || "Login request failed" };
    }
  };

  const logoutAdmin = () => {
    setAdminToken(null);
    setAdminUser(null);
    localStorage.removeItem("fs_admin_token");
    localStorage.removeItem("fs_admin_user");
    localStorage.removeItem("fs_admin_authenticated");
  };

  const hasRole = (...roles) => {
    if (!adminUser) return false;
    if (adminUser.role === "SUPER_ADMIN") return true;
    return roles.includes(adminUser.role);
  };

  const hasPermission = (permission) => {
    if (!adminUser) return false;
    if (adminUser.role === "SUPER_ADMIN") return true;
    if (adminUser.permissions?.includes("*")) return true;
    return adminUser.permissions?.includes(permission);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        adminUser,
        adminToken,
        isAuthenticated: !!adminToken,
        isLoading,
        loginAdmin,
        logoutAdmin,
        hasRole,
        hasPermission
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
};
