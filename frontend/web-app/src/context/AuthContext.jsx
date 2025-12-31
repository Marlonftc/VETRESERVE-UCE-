import { createContext, useContext, useEffect, useState } from "react";
import { getMe } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const me = await getMe(token);
        setUser(me);
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  function login(token) {
    localStorage.setItem("token", token);
    window.location.href = "/";
  }

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/login";
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
