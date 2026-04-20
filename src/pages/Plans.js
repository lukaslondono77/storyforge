// src/pages/Plans.js
import { useNavigate } from "react-router-dom";

const PLANS = [
  {
    id: "free", label: "Free Reader", price: 0,
    desc: "Browse and read all free stories from every writer on the platform.",
    features: ["Access all free-tier stories", "Discover new writers", "No sign-up required"],
    cta: "You already have this",
  },
  {
    id: "story_pass", label: "Story Pass", price: 4.99,
    desc: "Unlock every paid story and support independent writers directly.",
    features: ["Everything in Free", "Unlock all paid stories", "Early chapter access", "Writers keep 100%"],
    cta: "Subscribe — $4.99/mo",
    popular: true,
  },
  {
    id: "patron", label: "Patron", price: 12.99,
    desc: "Maximum support. Go deeper with your favourite writers.",
    features: ["Everything in Story Pass", "Direct author messages", "Patron badge on profile", "Higher revenue share for writers"],
    cta: "Subscribe — $12.99/mo",
  },
];

export default function Plans() {
  const navigate = useNavigate();
  const current  = localStorage.getItem("sf_plan") || "free";

  function select(id) {
    localStorage.setItem("sf_plan", id);
    navigate("/");
  }

  return (
    <div>
      {/* Hero */}
      <div style={{ textAlign: "center", maxWidth: 520, margin: "0 auto 56px" }}>
        <h1 style={{ fontSize: 42, lineHeight: 1.1, marginBottom: 14 }}>
          Support writers.<br /><em>Read more stories.</em>
        </h1>
        <p style={{ fontSize: 16, color: "var(--muted)", lineHeight: 1.6 }}>
          100% of your subscription goes directly to the writers whose stories you love. We never take a cut.
        </p>
      </div>

      {/* Plan cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, maxWidth: 920, margin: "0 auto 56px" }}>
        {PLANS.map((plan) => {
          const active = current === plan.id || (current === "free" && plan.id === "free");
          return (
            <div key={plan.id} style={{
              background: "#fff",
              border: `2px solid ${plan.popular ? "var(--gold)" : "var(--border)"}`,
              borderRadius: 12, padding: "32px 28px",
              position: "relative",
              transform: plan.popular ? "scale(1.03)" : "scale(1)",
            }}>
              {plan.popular && (
                <div style={{
                  position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)",
                  background: "var(--gold)", color: "#fff",
                  fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
                  padding: "4px 16px", borderRadius: 20, whiteSpace: "nowrap",
                }}>MOST POPULAR</div>
              )}

              <h2 style={{ fontSize: 20, marginBottom: 8 }}>{plan.label}</h2>
              <div style={{ marginBottom: 14 }}>
                {plan.price === 0
                  ? <span style={{ fontSize: 34, fontFamily: "var(--serif)" }}>Free</span>
                  : <>
                      <span style={{ fontSize: 34, fontFamily: "var(--serif)", color: "var(--gold)" }}>${plan.price}</span>
                      <span style={{ fontSize: 13, color: "var(--dim)" }}>/month</span>
                    </>
                }
              </div>

              <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.6, marginBottom: 24 }}>{plan.desc}</p>

              <ul style={{ listStyle: "none", marginBottom: 28 }}>
                {plan.features.map(f => (
                  <li key={f} style={{ fontSize: 14, color: "var(--ink2)", marginBottom: 10, display: "flex", gap: 8 }}>
                    <span style={{ color: "var(--gold)", fontWeight: 700 }}>✓</span> {f}
                  </li>
                ))}
              </ul>

              <button onClick={() => select(plan.id)} className="btn"
                disabled={active}
                style={{
                  width: "100%",
                  background: active ? "var(--bg2)" : (plan.popular ? "var(--gold)" : "var(--ink)"),
                  color: active ? "var(--dim)" : "#fff",
                  borderColor: active ? "var(--border)" : "transparent",
                  cursor: active ? "default" : "pointer",
                  fontSize: 14,
                }}>
                {active ? "Current plan" : plan.cta}
              </button>
            </div>
          );
        })}
      </div>

      {/* Trust line */}
      <div style={{ textAlign: "center", borderTop: "1px solid var(--border)", paddingTop: 36 }}>
        <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16 }}>
          Every plan includes:
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 36, flexWrap: "wrap" }}>
          {["No ads, ever", "Cancel anytime", "New stories weekly", "Writers keep 100%"].map(f => (
            <span key={f} style={{ fontSize: 14, color: "var(--muted)" }}>
              <span style={{ color: "var(--gold)", marginRight: 6 }}>✦</span>{f}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
