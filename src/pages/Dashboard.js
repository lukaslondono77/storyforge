// src/pages/Dashboard.js
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getStories, getAuthorProfile } from "../lib/api";
import { useAuth } from "../lib/auth";
import { useI18n } from "../lib/i18n";

const CAT_ICONS = { story:"📖", poetry:"🎭", theater:"🎬", essay:"✍️", article:"📰", micro:"⚡" };

export default function Dashboard() {
  const { user }   = useAuth();
  const { t }      = useI18n();
  const [stories, setStories] = useState([]);
  const [authorProfile, setAuthorProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return setLoading(false);
    Promise.all([
      getStories(),
      getAuthorProfile(user.id)
    ]).then(([all, profile]) => {
      setStories(all.filter(s => s.authorId === user.id || s.author === user.name));
      setAuthorProfile(profile);
      setLoading(false);
    });
  }, [user]);

  if (!user) return (
    <div style={{ textAlign: "center", padding: "100px 0" }}>
      <h2 style={{ fontFamily: "var(--serif)", fontWeight: 400, fontSize: 28, marginBottom: 20 }}>{t("sign_in")}</h2>
      <Link to="/login" className="btn btn-primary">{t("sign_in")}</Link>
    </div>
  );

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;

  const totalReads = stories.reduce((a, s) => a + (s.reads || 0), 0);
  const totalLikes = stories.reduce((a, s) => a + (s.likes || 0), 0);
  const paidCount  = stories.filter(s => s.tier === "paid").length;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 36 }}>
        <div>
          <h1 style={{ fontFamily: "var(--serif)", fontSize: 34, fontWeight: 400, marginBottom: 4 }}>
            {t("welcome", user.name.split(" ")[0])}
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 14 }}>{t("dash_sub")}</p>
        </div>
        <Link to="/write" className="btn btn-primary">{t("new_story")}</Link>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 36 }}>
        {[
          { val: authorProfile?.followers || 0, lbl: t("stat_subs")      },
          { val: totalReads.toLocaleString(),   lbl: t("stat_reads")     },
          { val: totalLikes.toLocaleString(),   lbl: t("stat_likes")     },
          { val: paidCount,                     lbl: t("stat_paid")      },
        ].map(s => (
          <div key={s.lbl} className="stat-card" style={{ textAlign: "center" }}>
            <div className="stat-val">{s.val}</div>
            <div className="stat-lbl">{s.lbl}</div>
          </div>
        ))}
      </div>

      <h2 style={{ fontFamily: "var(--serif)", fontSize: 20, fontWeight: 400, marginBottom: 16 }}>{t("your_stories")}</h2>

      {stories.length === 0 ? (
        <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "60px 40px", textAlign: "center" }}>
          <p style={{ fontSize: 36, marginBottom: 16 }}>✦</p>
          <p style={{ fontFamily: "var(--serif)", fontSize: 18, marginBottom: 8 }}>{t("empty_dashboard")}</p>
          <p style={{ color: "var(--muted)", marginBottom: 28, fontSize: 14 }}>{t("empty_dashboard_sub")}</p>
          <Link to="/write" className="btn btn-gold">{t("write_first")}</Link>
        </div>
      ) : (
        <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 110px 90px 90px 90px 120px", padding: "12px 24px", background: "var(--bg2)", borderBottom: "1px solid var(--border)" }}>
            {[t("col_title"), t("col_category"), t("col_tier"), t("col_reads"), t("stat_likes"), ""].map((h, i) => (
              <span key={i} style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".05em" }}>{h}</span>
            ))}
          </div>
          {stories.map((s, i) => {
            const accent = s.accentColor || "#b8822a";
            return (
              <div key={s.slug} style={{ display: "grid", gridTemplateColumns: "1fr 110px 90px 90px 90px 120px", padding: "15px 24px", borderBottom: i < stories.length - 1 ? "1px solid var(--border)" : "none", alignItems: "center", transition: "background .1s", cursor: "pointer" }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--bg)"}
                onMouseLeave={e => e.currentTarget.style.background = "#fff"}>
                <div>
                  <Link to={`/story/${s.slug}`} style={{ color: "var(--ink)", textDecoration: "none", fontSize: 15, fontWeight: 500, display: "block", marginBottom: 2 }}
                    onMouseEnter={e => e.target.style.color = accent}
                    onMouseLeave={e => e.target.style.color = "var(--ink)"}>{s.title}</Link>
                  <span style={{ fontSize: 12, color: "var(--dim)" }}>{s.genre}</span>
                </div>
                <span style={{ fontSize: 13, color: "var(--muted)" }}>{CAT_ICONS[s.category] || "📖"} {s.category}</span>
                <span className={`badge badge-${s.tier}`}>{t(`tier_${s.tier}`)}</span>
                <span style={{ fontSize: 14, color: "var(--ink2)" }}>{(s.reads || 0).toLocaleString()}</span>
                <span style={{ fontSize: 14, color: "var(--ink2)" }}>{(s.likes || 0).toLocaleString()}</span>
                <div style={{ display: "flex", gap: 6 }}>
                  <Link to={`/edit/${s.slug}`} className="btn btn-outline btn-sm">{t("edit")}</Link>
                  <Link to={`/story/${s.slug}`} className="btn btn-sm" style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--muted)" }}>{t("view")}</Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {stories.length > 0 && paidCount === 0 && (
        <div className="nudge">
          <div>
            <p style={{ fontWeight: 600, marginBottom: 2 }}>{t("earn_nudge_title")}</p>
            <p style={{ fontSize: 14, color: "var(--muted)" }}>{t("earn_nudge_body")}</p>
          </div>
          <Link to={`/edit/${stories[0].slug}`} className="btn btn-gold" style={{ flexShrink: 0 }}>{t("set_paid")}</Link>
        </div>
      )}
    </div>
  );
}
