// src/pages/StoryDetail.js
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getStory, incrementRead } from "../lib/api";
import { useAuth } from "../lib/auth";

export default function StoryDetail() {
  const { slug }   = useParams();
  const navigate   = useNavigate();
  const { user }   = useAuth();
  const [story, setStory]     = useState(null);
  const [loading, setLoading] = useState(true);

  const plan = localStorage.getItem("sf_plan") || "free";
  const canRead = (s) =>
    s.tier === "free" || plan !== "free" || s.authorId === user?.id;

  useEffect(() => {
    getStory(slug).then(s => {
      setStory(s);
      setLoading(false);
      if (s) incrementRead(slug);
    });
  }, [slug]);

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;
  if (!story)  return (
    <div style={{ textAlign: "center", padding: "80px 0" }}>
      <p style={{ fontSize: 18, color: "var(--muted)", marginBottom: 20 }}>Story not found.</p>
      <Link to="/" className="btn btn-outline">← Back to stories</Link>
    </div>
  );

  const accent = story.accentColor || "#b8822a";
  const locked = !canRead(story);
  const teaser = story.body.slice(0, 400).trim() + "…";
  const isOwner = user?.id === story.authorId;

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      {/* Back */}
      <button onClick={() => navigate(-1)} className="btn btn-outline btn-sm"
        style={{ marginBottom: 32 }}>← Back</button>

      {/* Header */}
      <div style={{ borderLeft: `4px solid ${accent}`, paddingLeft: 20, marginBottom: 32 }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: accent, display: "block", marginBottom: 8 }}>
          {story.genre}
        </span>
        <h1 style={{ fontSize: 42, lineHeight: 1.1, marginBottom: 10 }}>{story.title}</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 14, color: "var(--muted)" }}>by <strong style={{ color: "var(--ink2)" }}>{story.author}</strong></span>
          <span className={`badge badge-${story.tier}`}>{story.tier}</span>
          {isOwner && (
            <Link to={`/edit/${story.slug}`} className="btn btn-outline btn-sm">Edit story</Link>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 12, marginBottom: 36 }}>
        {[
          { val: story.reads || 0,       lbl: "Reads"       },
          { val: story.subscribers || 0, lbl: "Subscribers" },
        ].map(s => (
          <div key={s.lbl} className="stat-card" style={{ flex: 1 }}>
            <div className="stat-val">{s.val >= 1000 ? `${(s.val/1000).toFixed(1)}k` : s.val}</div>
            <div className="stat-lbl">{s.lbl}</div>
          </div>
        ))}
      </div>

      {/* Story body */}
      <div style={{
        background: "#fff", border: "1px solid var(--border)",
        borderRadius: 10, padding: "36px 40px", position: "relative", overflow: "hidden",
      }}>
        {locked ? (
          <>
            <div style={{ filter: "blur(4px)", userSelect: "none", pointerEvents: "none", opacity: 0.6 }}>
              <div className="prose"><p>{teaser}</p></div>
            </div>
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.97) 35%)",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "flex-end", padding: 40,
            }}>
              <div style={{
                background: "#fff", border: "1px solid var(--border)", borderRadius: 12,
                padding: "32px 36px", textAlign: "center", maxWidth: 380,
                boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
              }}>
                <span style={{ fontSize: 28, display: "block", marginBottom: 12 }}>✦</span>
                <h3 style={{ fontSize: 20, marginBottom: 8 }}>This story is for subscribers</h3>
                <p style={{ fontSize: 14, color: "var(--muted)", fontStyle: "italic", marginBottom: 24 }}>
                  "{story.excerpt}"
                </p>
                <Link to="/plans" className="btn btn-gold" style={{ width: "100%", marginBottom: 10 }}>
                  See subscription plans
                </Link>
                {!user && (
                  <Link to="/login" className="btn btn-outline" style={{ width: "100%", fontSize: 13 }}>
                    Sign in if you already subscribe
                  </Link>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="prose">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{story.body}</ReactMarkdown>
          </div>
        )}
      </div>

      {/* Author card */}
      {!locked && (
        <div style={{
          background: "#fff", border: "1px solid var(--border)", borderRadius: 10,
          padding: "20px 24px", marginTop: 24,
          display: "flex", alignItems: "center", gap: 16,
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: "50%",
            background: accent + "22", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 20, color: accent, flexShrink: 0,
            border: `2px solid ${accent}33`,
          }}>
            {story.author?.[0]?.toUpperCase() || "A"}
          </div>
          <div>
            <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 2 }}>Written by</p>
            <p style={{ fontSize: 16, fontWeight: 500 }}>{story.author}</p>
          </div>
        </div>
      )}
    </div>
  );
}
