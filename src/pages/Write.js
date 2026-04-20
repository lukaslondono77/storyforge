// src/pages/Write.js  — used for both new stories and editing
import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { publishStory, updateStory, getStory } from "../lib/api";

const GENRES  = ["Fantasy", "Cyberpunk", "Literary", "Steampunk", "Horror", "Romance", "Sci-Fi", "Mystery", "Thriller", "Adventure"];
const ACCENTS = [
  { color: "#b8822a", name: "Gold"   },
  { color: "#7b5ea7", name: "Purple" },
  { color: "#3a8a6e", name: "Teal"   },
  { color: "#c0522e", name: "Rust"   },
  { color: "#3a6aa8", name: "Blue"   },
  { color: "#a85ea0", name: "Rose"   },
];

export default function Write() {
  const { slug }         = useParams(); // if editing
  const { user, token }  = useAuth();
  const navigate         = useNavigate();
  const isEditing        = Boolean(slug);

  const [form, setForm] = useState({
    title: "", genre: "Fantasy", tier: "free",
    excerpt: "", accentColor: "#b8822a", body: "",
  });
  const [tab,     setTab]     = useState("write"); // write | preview | tips
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(isEditing);
  const [existingSha, setExistingSha] = useState(null);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: typeof e === "string" ? e : e.target.value }));

  // Load existing story if editing
  useEffect(() => {
    if (!isEditing) return;
    getStory(slug).then(s => {
      if (!s) return navigate("/dashboard");
      if (s.authorId !== user?.id) return navigate("/");
      setForm({
        title: s.title, genre: s.genre, tier: s.tier,
        excerpt: s.excerpt, accentColor: s.accentColor || "#b8822a", body: s.body,
      });
      setExistingSha(s.sha);
      setLoading(false);
    });
  }, [slug]); // eslint-disable-line

  if (!user) return (
    <div style={{ textAlign: "center", padding: "100px 0" }}>
      <h2 style={{ fontFamily: "var(--serif)", fontWeight: 400, fontSize: 28, marginBottom: 12 }}>
        Create a free account to start writing
      </h2>
      <p style={{ color: "var(--muted)", marginBottom: 28 }}>
        Your stories are published in seconds. No technical knowledge needed.
      </p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
        <Link to="/register" className="btn btn-primary">Create free account</Link>
        <Link to="/login"    className="btn btn-outline">Sign in</Link>
      </div>
    </div>
  );

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;

  async function save() {
    if (!form.title.trim()) return setError("Please add a title for your story.");
    if (!form.body.trim())  return setError("Please write something before publishing!");
    if (!form.excerpt.trim()) return setError("Please add a short teaser (shown on the story card).");
    setError(""); setSaving(true);
    try {
      if (isEditing) {
        await updateStory(token, slug, form);
        setSuccess("Story updated!");
        setTimeout(() => navigate(`/story/${slug}`), 1200);
      } else {
        const { slug: newSlug } = await publishStory(token, form);
        navigate(`/story/${newSlug}`);
      }
    } catch (e) {
      setError("Something went wrong: " + e.message);
    } finally {
      setSaving(false);
    }
  }

  const wordCount = form.body.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div style={{ maxWidth: 820, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 36 }}>
        <div>
          <h1 style={{ fontSize: 34, marginBottom: 4 }}>
            {isEditing ? "Edit your story" : "Write a new story"}
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 14 }}>
            {isEditing ? "Changes save directly to your published story." : "Fill in the details and hit publish — it's that simple."}
          </p>
        </div>
        <span style={{ fontSize: 13, color: "var(--dim)" }}>{wordCount.toLocaleString()} words</span>
      </div>

      {error   && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* ── Story details panel ── */}
      <div style={{
        background: "#fff", border: "1px solid var(--border)", borderRadius: 10,
        padding: "24px 28px", marginBottom: 20,
      }}>
        <h3 style={{ fontSize: 14, fontFamily: "var(--sans)", fontWeight: 600, marginBottom: 20, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Story details
        </h3>
        <div className="form-group">
          <label>Title *</label>
          <input className="form-control" type="text"
            placeholder="Give your story a title…"
            value={form.title} onChange={set("title")}
            style={{ fontSize: 20, fontFamily: "var(--serif)" }} />
        </div>

        <div className="form-group">
          <label>Short teaser — shown on the story card and paywall *</label>
          <input className="form-control" type="text"
            placeholder="One sentence that makes readers need to know more…"
            value={form.excerpt} onChange={set("excerpt")} />
          <p style={{ fontSize: 12, color: "var(--dim)", marginTop: 5 }}>
            Keep it under 120 characters for best results.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Genre</label>
            <select className="form-control" value={form.genre} onChange={set("genre")}>
              {GENRES.map(g => <option key={g}>{g}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Who can read this?</label>
            <select className="form-control" value={form.tier} onChange={set("tier")}>
              <option value="free">Everyone — free to read</option>
              <option value="paid">Subscribers only — paid</option>
            </select>
          </div>
        </div>

        {/* Accent color */}
        <div style={{ marginTop: 20 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--ink2)", marginBottom: 10 }}>
            Story color (shows on your card)
          </label>
          <div style={{ display: "flex", gap: 10 }}>
            {ACCENTS.map(a => (
              <button key={a.color} onClick={() => set("accentColor")(a.color)}
                title={a.name}
                style={{
                  width: 32, height: 32, borderRadius: "50%", background: a.color,
                  border: form.accentColor === a.color ? "3px solid var(--ink)" : "3px solid transparent",
                  cursor: "pointer", transition: "border 0.15s",
                }} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Editor ── */}
      <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden", marginBottom: 20 }}>
        {/* Tab bar */}
        <div style={{ borderBottom: "1px solid var(--border)", display: "flex", padding: "0 4px" }}>
          {[
            { id: "write",   label: "✍️ Write"   },
            { id: "preview", label: "👁 Preview" },
            { id: "tips",    label: "💡 Tips"    },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                padding: "14px 18px", fontSize: 13, fontFamily: "var(--sans)",
                color: tab === t.id ? "var(--ink)" : "var(--muted)",
                fontWeight: tab === t.id ? 600 : 400,
                borderBottom: tab === t.id ? "2px solid var(--gold)" : "2px solid transparent",
                marginBottom: -1,
              }}>{t.label}</button>
          ))}
        </div>

        <div style={{ padding: "24px 28px" }}>
          {tab === "write" && (
            <textarea className="form-control" value={form.body} onChange={set("body")}
              placeholder={"Start writing your story here…\n\nYou can use:\n# Headings\n**bold text**\n*italic text*\n> Blockquotes for dramatic effect"}
              style={{ minHeight: 460, fontFamily: "var(--serif)", fontSize: 17, lineHeight: 1.8, border: "none", padding: 0, boxShadow: "none" }}
            />
          )}

          {tab === "preview" && (
            <div>
              {form.body ? (
                <div className="prose">
                  {/* Simple markdown preview using native rendering */}
                  {form.body.split("\n\n").map((para, i) => {
                    if (para.startsWith("# "))  return <h1 key={i} style={{ fontSize: 32, margin: "1.5em 0 0.5em" }}>{para.slice(2)}</h1>;
                    if (para.startsWith("## ")) return <h2 key={i}>{para.slice(3)}</h2>;
                    if (para.startsWith("> "))  return <blockquote key={i}>{para.slice(2)}</blockquote>;
                    return <p key={i} dangerouslySetInnerHTML={{ __html:
                      para.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
                          .replace(/\*(.+?)\*/g, "<em>$1</em>")
                    }} />;
                  })}
                </div>
              ) : (
                <p style={{ color: "var(--dim)", fontStyle: "italic", textAlign: "center", padding: "40px 0" }}>
                  Nothing to preview yet — start writing!
                </p>
              )}
            </div>
          )}

          {tab === "tips" && (
            <div style={{ maxWidth: 560 }}>
              <h3 style={{ fontSize: 18, marginBottom: 20, fontFamily: "var(--serif)" }}>Writing tips & formatting</h3>
              {[
                ["# Big heading",     "Creates a large chapter title"],
                ["## Small heading",  "Creates a section title"],
                ["**bold text**",     "Makes text bold"],
                ["*italic text*",     "Makes text italic"],
                ["> This is a quote", "Creates a stylish blockquote"],
                ["---",               "Adds a horizontal divider between sections"],
              ].map(([code, desc]) => (
                <div key={code} style={{ display: "flex", gap: 20, marginBottom: 16, alignItems: "center" }}>
                  <code style={{
                    background: "var(--bg2)", border: "1px solid var(--border)",
                    borderRadius: 6, padding: "4px 10px", fontSize: 13,
                    fontFamily: "monospace", minWidth: 160, color: "var(--gold)",
                  }}>{code}</code>
                  <span style={{ fontSize: 14, color: "var(--muted)" }}>{desc}</span>
                </div>
              ))}
              <div style={{ marginTop: 24, padding: "16px 20px", background: "var(--bg2)", borderRadius: 8, fontSize: 14, color: "var(--muted)" }}>
                💡 <strong>Tip:</strong> Leave a blank line between paragraphs. Readers love short, punchy paragraphs — aim for 3–5 sentences each.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <button onClick={save} className="btn btn-gold" disabled={saving} style={{ fontSize: 15, padding: "12px 28px" }}>
          {saving ? "Publishing…" : isEditing ? "Save changes" : "✦ Publish story"}
        </button>
        <button onClick={() => navigate(-1)} className="btn btn-outline">Cancel</button>
        {form.tier === "paid" && (
          <span style={{ fontSize: 13, color: "var(--muted)", marginLeft: 8 }}>
            🔒 This story will only be visible to subscribers
          </span>
        )}
      </div>
    </div>
  );
}
