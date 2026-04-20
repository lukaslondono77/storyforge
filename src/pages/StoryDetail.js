// src/pages/StoryDetail.js
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getStory, incrementRead } from "../lib/api";
import { useAuth } from "../lib/auth";
import { useI18n } from "../lib/i18n";

const LANG_FLAGS = { en:"🇺🇸", es:"🇨🇴", fr:"🇫🇷", pt:"🇧🇷", de:"🇩🇪", it:"🇮🇹" };
const CAT_ICONS  = { story:"📖", poetry:"🎭", theater:"🎬", essay:"✍️", article:"📰", micro:"⚡" };

export default function StoryDetail() {
  const { slug }   = useParams();
  const navigate   = useNavigate();
  const { user }   = useAuth();
  const { t }      = useI18n();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);

  const plan = localStorage.getItem("sf_plan") || "free";
  const canRead = s => s.tier === "free" || plan !== "free" || s.authorId === user?.id;

  useEffect(() => {
    getStory(slug).then(s => { setStory(s); setLoading(false); if (s) incrementRead(slug); });
  }, [slug]);

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;
  if (!story)  return (
    <div style={{ textAlign: "center", padding: "80px 0" }}>
      <p style={{ fontSize: 18, color: "var(--muted)", marginBottom: 20 }}>{t("story_not_found")}</p>
      <Link to="/" className="btn btn-outline">{t("back_btn")}</Link>
    </div>
  );

  const accent = story.accentColor || "#b8822a";
  const locked = !canRead(story);
  const isOwner = user?.id === story.authorId;

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <button onClick={() => navigate(-1)} className="btn btn-outline btn-sm" style={{ marginBottom: 32 }}>
        {t("back_btn")}
      </button>

      <div style={{ borderLeft: `4px solid ${accent}`, paddingLeft: 20, marginBottom: 32 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
          <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", color: accent }}>{story.genre}</span>
          <span style={{ fontSize: 11, background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 12, padding: "2px 10px", color: "var(--muted)" }}>
            {CAT_ICONS[story.category] || "📖"} {story.category}
          </span>
          {story.language && (
            <span style={{ fontSize: 12, color: "var(--dim)" }}>{LANG_FLAGS[story.language]} {story.language?.toUpperCase()}</span>
          )}
        </div>
        <h1 style={{ fontFamily: "var(--serif)", fontSize: 42, fontWeight: 400, lineHeight: 1.1, marginBottom: 12 }}>{story.title}</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 14, color: "var(--muted)" }}>
            {t("written_by")} <strong style={{ color: "var(--ink2)" }}>{story.author}</strong>
          </span>
          <span className={`badge badge-${story.tier}`}>{t(`tier_${story.tier}`)}</span>
          {isOwner && <Link to={`/edit/${story.slug}`} className="btn btn-outline btn-sm">{t("edit")}</Link>}
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 36 }}>
        {[{ val: story.reads || 0, lbl: t("stat_reads") }, { val: story.subscribers || 0, lbl: t("stat_subs") }].map(s => (
          <div key={s.lbl} className="stat-card" style={{ flex: 1, textAlign: "center" }}>
            <div className="stat-val">{s.val >= 1000 ? `${(s.val/1000).toFixed(1)}k` : s.val}</div>
            <div className="stat-lbl">{s.lbl}</div>
          </div>
        ))}
      </div>

      <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 10, padding: "36px 40px", position: "relative", overflow: "hidden" }}>
        {locked ? (
          <>
            <div style={{ filter: "blur(4px)", userSelect: "none", pointerEvents: "none", opacity: .55 }}>
              <div className="prose"><p>{story.body.slice(0, 400)}…</p></div>
            </div>
            <div className="paywall-wrap">
              <div className="paywall-card">
                <div style={{ fontSize: 30, marginBottom: 14 }}>✦</div>
                <h3 style={{ fontFamily: "var(--serif)", fontSize: 22, fontWeight: 400, marginBottom: 8 }}>{t("paywall_title")}</h3>
                <p style={{ fontSize: 14, color: "var(--muted)", fontStyle: "italic", marginBottom: 24, lineHeight: 1.5 }}>"{story.excerpt}"</p>
                <Link to="/plans" className="btn btn-gold" style={{ width: "100%", marginBottom: 10 }}>{t("paywall_cta")}</Link>
                {!user && <Link to="/login" className="btn btn-outline" style={{ width: "100%", fontSize: 13 }}>{t("paywall_signin")}</Link>}
              </div>
            </div>
          </>
        ) : (
          <div className="prose">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{story.body}</ReactMarkdown>
          </div>
        )}
      </div>

      {!locked && (
        <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 10, padding: "20px 24px", marginTop: 24, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: accent+"22", border: `2px solid ${accent}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: accent, flexShrink: 0 }}>
            {story.author?.[0]?.toUpperCase() || "A"}
          </div>
          <div>
            <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 2 }}>{t("written_by")}</p>
            <p style={{ fontSize: 16, fontWeight: 500 }}>{story.author}</p>
          </div>
        </div>
      )}
    </div>
  );
}
