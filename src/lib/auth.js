// src/lib/auth.js
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(() => localStorage.getItem("sf_token"));
  const [loading, setLoading] = useState(true);

  // On mount: verify stored token
  useEffect(() => {
    if (!token) { setLoading(false); return; }
    fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.user) setUser(data.user);
        else clearAuth();
      })
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line

  function storeAuth(data) {
    localStorage.setItem("sf_token", data.token);
    setToken(data.token);
    setUser(data.user);
  }

  function clearAuth() {
    localStorage.removeItem("sf_token");
    setToken(null);
    setUser(null);
  }

  async function register(name, email, password) {
    const r = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error);
    storeAuth(data);
  }

  async function login(email, password) {
    const r = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error);
    storeAuth(data);
  }

  function logout() { clearAuth(); }

  return (
    <AuthContext.Provider value={{ user, token, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() { return useContext(AuthContext); }
