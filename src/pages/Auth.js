// src/pages/Auth.js  — Register + Login pages

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";

// ── Shared form shell ────────────────────────────────────────────────────────
function AuthShell({ title, subtitle, children }) {
  return (
    <div style={{
      minHeight: "calc(100vh - 62px)", display: "flex",
      alignItems: "center", justifyContent: "center",
      background: "var(--bg)", padding: "40px 24px",
    }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* Decorative mark */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <span style={{ fontSize: 36, display: "block", marginBottom: 12 }}>✦</span>
          <h1 style={{ fontSize: 28, marginBottom: 6 }}>{title}</h1>
          <p style={{ color: "var(--muted)", fontSize: 14 }}>{subtitle}</p>
        </div>
        <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 12, padding: "36px 32px" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// ── Register ─────────────────────────────────────────────────────────────────
export function Register() {
  const { register }   = useAuth();
  const navigate       = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate("/write");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Start writing" subtitle="Create your free StoryForge account">
      {error && <div className="alert alert-error">{error}</div>}
      <form onSubmit={submit}>
        <div className="form-group">
          <label>Your name (shown on your stories)</label>
          <input className="form-control" type="text" placeholder="Elena Voss"
            value={form.name} onChange={set("name")} required />
        </div>
        <div className="form-group">
          <label>Email address</label>
          <input className="form-control" type="email" placeholder="you@example.com"
            value={form.email} onChange={set("email")} required />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input className="form-control" type="password" placeholder="At least 6 characters"
            value={form.password} onChange={set("password")} required />
        </div>
        <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: 4 }} disabled={loading}>
          {loading ? "Creating account…" : "Create free account"}
        </button>
      </form>
      <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "var(--muted)" }}>
        Already have an account? <Link to="/login" style={{ color: "var(--gold)" }}>Sign in</Link>
      </p>
      <p style={{ textAlign: "center", marginTop: 12, fontSize: 12, color: "var(--dim)" }}>
        Free forever. Writers keep 100% of their earnings.
      </p>
    </AuthShell>
  );
}

// ── Login ─────────────────────────────────────────────────────────────────────
export function Login() {
  const { login }       = useAuth();
  const navigate        = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to your StoryForge account">
      {error && <div className="alert alert-error">{error}</div>}
      <form onSubmit={submit}>
        <div className="form-group">
          <label>Email address</label>
          <input className="form-control" type="email" placeholder="you@example.com"
            value={form.email} onChange={set("email")} required />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input className="form-control" type="password" placeholder="Your password"
            value={form.password} onChange={set("password")} required />
        </div>
        <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: 4 }} disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "var(--muted)" }}>
        Don't have an account? <Link to="/register" style={{ color: "var(--gold)" }}>Sign up free</Link>
      </p>
    </AuthShell>
  );
}
