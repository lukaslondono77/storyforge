// src/pages/Auth.js
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { useI18n } from "../lib/i18n";

function AuthShell({ titleKey, subKey, children }) {
  const { t } = useI18n();
  return (
    <div style={{ minHeight: "calc(100vh - 62px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <span style={{ fontSize: 36, display: "block", marginBottom: 10 }}>✦</span>
          <h1 style={{ fontFamily: "var(--serif)", fontSize: 28, fontWeight: 400, marginBottom: 6 }}>{t(titleKey)}</h1>
          <p style={{ color: "var(--muted)", fontSize: 14 }}>{t(subKey)}</p>
        </div>
        <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 12, padding: "32px" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export function Register() {
  const { register } = useAuth();
  const { t, lang }  = useI18n();
  const navigate     = useNavigate();
  const [form, setForm]   = useState({ name: "", email: "", password: "", language: lang });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault(); setError(""); setLoading(true);
    try { await register(form.name, form.email, form.password, form.language); navigate("/write"); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  return (
    <AuthShell titleKey="register_title" subKey="register_sub">
      {error && <div className="alert alert-error">{error}</div>}
      <form onSubmit={submit}>
        <div className="form-group"><label>{t("lbl_name")}</label><input className="form-control" type="text" value={form.name} onChange={set("name")} required /></div>
        <div className="form-group"><label>{t("lbl_email")}</label><input className="form-control" type="email" value={form.email} onChange={set("email")} required /></div>
        <div className="form-group"><label>{t("lbl_password")}</label><input className="form-control" type="password" value={form.password} onChange={set("password")} required /></div>
        <div className="form-group">
          <label>{t("lbl_pref_lang")}</label>
          <select className="form-control" value={form.language} onChange={set("language")}>
            <option value="en">🇺🇸 English</option>
            <option value="es">🇨🇴 Español</option>
            <option value="fr">🇫🇷 Français</option>
            <option value="pt">🇧🇷 Português</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "12px", fontSize: 14, marginTop: 4 }} disabled={loading}>
          {loading ? t("publishing") : t("create_account")}
        </button>
        <p style={{ textAlign: "center", marginTop: 12, fontSize: 12, color: "var(--dim)" }}>{t("free_forever")}</p>
      </form>
      <p style={{ textAlign: "center", marginTop: 18, fontSize: 13, color: "var(--muted)" }}>
        {t("already_account")} <Link to="/login" style={{ color: "var(--gold)" }}>{t("sign_in_link")}</Link>
      </p>
    </AuthShell>
  );
}

export function Login() {
  const { login }  = useAuth();
  const { t }      = useI18n();
  const navigate   = useNavigate();
  const [form, setForm]   = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault(); setError(""); setLoading(true);
    try { await login(form.email, form.password); navigate("/dashboard"); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  return (
    <AuthShell titleKey="login_title" subKey="login_sub">
      {error && <div className="alert alert-error">{error}</div>}
      <form onSubmit={submit}>
        <div className="form-group"><label>{t("lbl_email")}</label><input className="form-control" type="email" value={form.email} onChange={set("email")} required /></div>
        <div className="form-group"><label>{t("lbl_password")}</label><input className="form-control" type="password" value={form.password} onChange={set("password")} required /></div>
        <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "12px", fontSize: 14, marginTop: 4 }} disabled={loading}>
          {loading ? t("loading") : t("sign_in")}
        </button>
      </form>
      <p style={{ textAlign: "center", marginTop: 18, fontSize: 13, color: "var(--muted)" }}>
        {t("no_account")} <Link to="/register" style={{ color: "var(--gold)" }}>{t("sign_up")}</Link>
      </p>
    </AuthShell>
  );
}
