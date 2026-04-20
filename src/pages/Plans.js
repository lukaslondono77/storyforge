// src/pages/Plans.js
import { useNavigate } from "react-router-dom";
import { useI18n } from "../lib/i18n";

export default function Plans() {
  const { t }    = useI18n();
  const navigate = useNavigate();
  const current  = localStorage.getItem("sf_plan") || "free";

  const PLANS = [
    { id: "free",    nameKey: "plan_free_name",   priceKey: "plan_free_price",   descKey: "plan_free_desc",   features: ["plan_free_f1","plan_free_f2","plan_free_f3"], ctaKey: "plan_current", featured: false },
    { id: "story_pass", nameKey: "plan_pass_name", price: 4.99, descKey: "plan_pass_desc", features: ["plan_pass_f1","plan_pass_f2","plan_pass_f3","plan_pass_f4"], ctaKey: "plan_pass_cta", featured: true  },
    { id: "patron",  nameKey: "plan_patron_name",  price: 12.99, descKey: "plan_patron_desc", features: ["plan_patron_f1","plan_patron_f2","plan_patron_f3","plan_patron_f4"], ctaKey: "plan_patron_cta", featured: false },
  ];

  function select(id) { localStorage.setItem("sf_plan", id); navigate("/"); }

  return (
    <div>
      <div style={{ textAlign: "center", maxWidth: 500, margin: "0 auto 52px" }}>
        <h1 style={{ fontFamily: "var(--serif)", fontSize: 44, fontWeight: 400, lineHeight: 1.1, marginBottom: 14 }}>
          {t("plans_title")}
        </h1>
        <p style={{ fontSize: 16, color: "var(--muted)", lineHeight: 1.6 }}>{t("plans_sub")}</p>
      </div>

      <div className="plans-grid">
        {PLANS.map(plan => {
          const active = current === plan.id || (current === "free" && plan.id === "free");
          return (
            <div key={plan.id} className={`plan-card ${plan.featured ? "featured" : ""}`}>
              {plan.featured && <div className="popular-badge">{t("most_popular")}</div>}
              <h2 style={{ fontFamily: "var(--serif)", fontSize: 20, marginBottom: 8 }}>{t(plan.nameKey)}</h2>
              <div style={{ fontFamily: "var(--serif)", fontSize: 34, color: plan.featured ? "var(--gold)" : "var(--ink)", marginBottom: 12 }}>
                {plan.price ? <>$ {plan.price}<span style={{ fontFamily: "var(--sans)", fontSize: 13, color: "var(--dim)" }}>{t("per_month")}</span></> : t(plan.priceKey)}
              </div>
              <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6, marginBottom: 20 }}>{t(plan.descKey)}</p>
              <ul style={{ listStyle: "none", marginBottom: 24 }}>
                {plan.features.map(f => (
                  <li key={f} style={{ fontSize: 13, color: "var(--ink2)", marginBottom: 9, display: "flex", gap: 8 }}>
                    <span style={{ color: "var(--gold)", fontWeight: 700 }}>✓</span> {t(f)}
                  </li>
                ))}
              </ul>
              <button onClick={() => !active && select(plan.id)} className="btn" disabled={active}
                style={{
                  width: "100%",
                  background: active ? "var(--bg2)" : (plan.featured ? "var(--gold)" : "var(--ink)"),
                  color: active ? "var(--dim)" : "#fff",
                  borderColor: active ? "var(--border)" : "transparent",
                  cursor: active ? "default" : "pointer", fontSize: 14,
                }}>
                {active ? t("plan_current") : t(plan.ctaKey)}
              </button>
            </div>
          );
        })}
      </div>

      <div style={{ textAlign: "center", borderTop: "1px solid var(--border)", paddingTop: 36 }}>
        <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16 }}>{t("all_plans_include")}</p>
        <div style={{ display: "flex", justifyContent: "center", gap: 32, flexWrap: "wrap" }}>
          {["perk1","perk2","perk3","perk4"].map(k => (
            <span key={k} style={{ fontSize: 14, color: "var(--muted)" }}>✦ {t(k)}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
