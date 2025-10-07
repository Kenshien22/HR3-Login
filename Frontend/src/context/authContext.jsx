import axios from "axios";
import React, { createContext, useContext, useEffect, useState } from "react";

// API Base URL - automatically uses production URL when deployed
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Named export for AuthContext
export const AuthContext = createContext();

const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      const token = localStorage.getItem("token");

      if (token) {
        try {
          const response = await axios.get(`${API_URL}/api/auth/verify`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.data.success) {
            console.log("Token verified successfully:", response.data.user);
            setUser(response.data.user);
          } else {
            console.log("Token verification failed - invalid token");
            setUser(null);
            localStorage.removeItem("token");
          }
        } catch (error) {
          console.error(
            "Token verification error:",
            error.response?.status,
            error.response?.data
          );

          // Only remove token if it's actually invalid (401/403)
          if (
            error.response?.status === 401 ||
            error.response?.status === 403
          ) {
            console.log("Invalid token - removing from storage");
            setUser(null);
            localStorage.removeItem("token");
          } else {
            console.log("Network error - keeping existing state");
            setUser(null);
          }
        }
      } else {
        console.log("No token found");
        setUser(null);
      }

      setLoading(false);
    };

    verifyUser();
  }, []);

  // Login function
  const login = (userData) => {
    console.log("Login called with:", userData);

    // Ensure userData has all required fields
    const normalizedUserData = {
      id: userData.id || userData._id,
      _id: userData._id || userData.id,
      name: userData.name,
      email: userData.email,
      role: userData.role || "employee",
    };

    setUser(normalizedUserData);
  };

  // Logout function
  const logout = () => {
    console.log("Logout called");
    setUser(null);
    localStorage.removeItem("token");

    // Also clear any other stored data
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    sessionStorage.clear();

    return true;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Named export for useAuth hook
export const useAuth = () => useContext(AuthContext);

// Default export for the provider
export default AuthContextProvider;
