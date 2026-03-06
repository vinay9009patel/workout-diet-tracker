import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import api from "../api/axios.js";

export const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const isLoggedIn = Boolean(token);

  const fetchProfile = useCallback(async () => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await api.get("/auth/profile");
      setUser(response.data);
    } catch (_error) {
      localStorage.removeItem("token");
      setToken("");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const login = ({ token: nextToken, user: nextUser }) => {
    localStorage.setItem("token", nextToken);
    setToken(nextToken);
    if (nextUser) {
      setUser(nextUser);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setUser(null);
  };

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      isLoggedIn,
      login,
      logout,
      refreshProfile: fetchProfile,
    }),
    [token, user, loading, isLoggedIn, fetchProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
