// src/pages/Dashboard.js
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getStories } from "../lib/api";
import { useAuth } from "../lib/auth";

export default function Dashboard() {
  const { user } = useAuth();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return setLoading(false);
    getStories().then(all => {
      setStories(all.filter(s => s.authorId === user.id));
      setLoading(false);
    });
  }, [user]);

  if (!user) return (
    <div style={{ textAlign: "center", padding: "100px 0" }}>
      <h2 style={{ fontFamily: "var(--serif)", fontWeight: 400, fontSize: 28, marginBottom: 20 }}>
        Sign in to see your dashboard
      </h2>
      <Link to="/login" className="btn btn-primary">Sign in</Link>
    </div>
  );

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;

  const totalReads   = stories.reduce((a, s) => a + (s.reads || 0), 0);
  const totalSubs    = stories.reduce((a, s) => a + (s.subscribers || 0), 0);
  const paidCount    = stories.filter(s => s.tier === "paid").length;

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 40 }}>
        <div>
          <h1 style={{ fontSize: 34, marginBottom: 6 }}>
            Welcome, <em>{user.name.split(" ")[0]}</em>
          </h1>
          <p style={{ color: "var(--muted)" }}>Your writing hub</p>
        </div>
        <Link to="/write" className="btn btn-primary">+ New story</Link>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 40 }}>
        {[
          { val: stories.length,              lbl: "Stories published" },
          { val: totalReads.toLocaleString(), lbl: "Total reads"       },
          { val: totalSubs.toLocaleString(),  lbl: "Subscribers"       },
          { val: paidCount,                   lbl: "Paid stories"      },
        ].map(s => (
          <div key={s.lbl} className="stat-card">
            <div className="stat-val">{s.val}</div>
            <div className="stat-lbl">{s.lbl}</div>
          </div>
        ))}
      </div>

      {/* Stories list */}
      <h2 style={{ fontSize: 20, marginBottom: 16 }}>Your stories</h2>

      {stories.length === 0 ? (
        <div style={{
          background: "#fff", border: "1px solid var(--border)", borderRadius: 10,
          padding: "60px 40px", textAlign: "center",
        }}>
          <p style={{ fontSize: 40, marginBottom: 16 }}>✦</p>
          <p style={{ fontSize: 18, marginBottom: 8, fontFamily: "var(--serif)" }}>
            You haven't published any stories yet.
          </p>
          <p style={{ color: "var(--muted)", marginBottom: 28, fontSize: 14 }}>
            Share your imagination with the world — it's free and takes less than a minute.
          </p>
          <Link to="/write" className="btn btn-gold">Write your first story →</Link>
        </div>
      ) : (
        <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
          {/* Table header */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 90px 100px 100px 120px",
            padding: "12px 24px", borderBottom: "1px solid var(--border)",
            background: "var(--bg)",
          }}>
            {["Title", "Tier", "Reads", "Subs", ""].map(h => (
              <span key={h} style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {h}
              </span>
            ))}
          </div>

          {stories.map((s, i) => {
            const accent = s.accentColor || "#b8822a";
            return (
              <div key={s.slug} style={{
                display: "grid", gridTemplateColumns: "1fr 90px 100px 100px 120px",
                padding: "16px 24px", alignItems: "center",
                borderBottom: i < stories.length - 1 ? "1px solid var(--border)" : "none",
                transition: "background 0.1s",
              }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--bg)"}
                onMouseLeave={e => e.currentTarget.style.background = "#fff"}
              >
                <div>
                  <Link to={`/story/${s.slug}`} style={{
                    color: "var(--ink)", textDecoration: "none", fontSize: 15, fontWeight: 500,
                    display: "block", marginBottom: 2,
                  }}
                    onMouseEnter={e => e.target.style.color = accent}
                    onMouseLeave={e => e.target.style.color = "var(--ink)"}
                  >{s.title}</Link>
                  <span style={{ fontSize: 12, color: "var(--dim)" }}>{s.genre}</span>
                </div>
                <span className={`badge badge-${s.tier}`}>{s.tier}</span>
                <span style={{ fontSize: 14, color: "var(--ink2)" }}>{(s.reads || 0).toLocaleString()}</span>
                <span style={{ fontSize: 14, color: "var(--ink2)" }}>{(s.subscribers || 0).toLocaleString()}</span>
                <div style={{ display: "flex", gap: 8 }}>
                  <Link to={`/edit/${s.slug}`} className="btn btn-outline btn-sm">Edit</Link>
                  <Link to={`/story/${s.slug}`} className="btn btn-sm" style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--muted)" }}>View</Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upgrade nudge if no paid stories */}
      {stories.length > 0 && paidCount === 0 && (
        <div style={{
          marginTop: 20, background: "var(--gold2)", border: "1px solid #e0c070",
          borderRadius: 10, padding: "18px 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
        }}>
          <div>
            <p style={{ fontWeight: 600, marginBottom: 2 }}>Want to earn from your writing?</p>
            <p style={{ fontSize: 14, color: "var(--muted)" }}>
              Set any story to <strong>paid</strong> — subscribers pay to read, you keep 100%.
            </p>
          </div>
          <Link to={`/edit/${stories[0].slug}`} className="btn btn-gold" style={{ flexShrink: 0 }}>
            Set a story as paid
          </Link>
        </div>
      )}
    </div>
  );
}
