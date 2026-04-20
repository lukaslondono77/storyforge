// src/components/Header.js
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { useI18n } from "../lib/i18n";

export default function Header() {
  const { user, logout } = useAuth();
  const { lang, setLang } = useI18n();
  const { pathname }     = useLocation();
  const navigate         = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate("/");
  }

  const active = (to) => ({
    color: pathname === to ? "var(--ink)" : "var(--muted)",
    fontWeight: pathname === to ? "500" : "400",
    borderBottom: pathname === to ? "2px solid var(--gold)" : "2px solid transparent",
    paddingBottom: "2px",
  });

  return (
    <header style={{
      background: "#fff", borderBottom: "1px solid var(--border)",
      position: "sticky", top: 0, zIndex: 100,
    }}>
      <div style={{
        maxWidth: 1080, margin: "0 auto", padding: "0 24px",
        height: 62, display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 22, lineHeight: 1 }}>✦</span>
          <span style={{
            fontFamily: "var(--serif)", fontSize: 18, color: "var(--ink)", letterSpacing: "-0.01em",
          }}>StoryForge</span>
        </Link>

        {/* Nav */}
        <nav style={{ display: "flex", gap: 28, alignItems: "center" }} className="hide-mobile">
          <Link to="/"      style={{ textDecoration: "none", fontSize: 14, ...active("/") }}>Discover</Link>
          <Link to="/plans" style={{ textDecoration: "none", fontSize: 14, ...active("/plans") }}>Plans</Link>
          {user && <>
            <Link to="/write"     style={{ textDecoration: "none", fontSize: 14, ...active("/write") }}>Write</Link>
            <Link to="/dashboard" style={{ textDecoration: "none", fontSize: 14, ...active("/dashboard") }}>Dashboard</Link>
          </>}
        </nav>

        {/* Actions & Language */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <select 
            value={lang} 
            onChange={(e) => setLang(e.target.value)}
            style={{ 
              border: "none", background: "var(--bg2)", borderRadius: 6, padding: "4px 8px",
              fontSize: 12, cursor: "pointer", color: "var(--ink2)", marginRight: 6
            }}
          >
            <option value="en">🇺🇸 EN</option>
            <option value="es">🇨🇴 ES</option>
          </select>
          {user ? (
            <>
              <span style={{ fontSize: 13, color: "var(--muted)" }} className="hide-mobile">
                Hi, {user.name.split(" ")[0]}
              </span>
              <button onClick={handleLogout} className="btn btn-outline btn-sm">Sign out</button>
            </>
          ) : (
            <>
              <Link to="/login"    className="btn btn-outline btn-sm">Sign in</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Start writing</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
