// src/pages/Discover.js
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getStories } from "../lib/api";
import { useI18n } from "../lib/i18n";

const GENRES = ["All", "Fantasy", "Cyberpunk", "Literary", "Steampunk", "Horror", "Romance", "Sci-Fi", "Mystery", "Thriller"];

export default function Discover() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [genre, setGenre]     = useState("All");
  const [tier, setTier]       = useState("All");
  const [search, setSearch]   = useState("");
  const { t } = useI18n();

  useEffect(() => {
    getStories().then(s => { setStories(s); setLoading(false); });
  }, []);

  const filtered = stories.filter(s => {
    const matchGenre  = genre  === "All" || s.genre === genre;
    const matchTier   = tier   === "All" || s.tier  === tier;
    const matchSearch = !search ||
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.author.toLowerCase().includes(search.toLowerCase());
    return matchGenre && matchTier && matchSearch;
  });

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;

  return (
    <div>
      {/* Hero */}
      <div style={{ marginBottom: 48, maxWidth: 560 }}>
        <h1 style={{ fontSize: 48, lineHeight: 1.1, marginBottom: 14 }}>
          {t("hero_title_1")}<br /><em>{t("hero_title_2")}</em>
        </h1>
        <p style={{ fontSize: 16, color: "var(--muted)", lineHeight: 1.6 }}>
          {t("hero_sub")}
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 32, flexWrap: "wrap", alignItems: "center" }}>
        {/* Search */}
        <input
          className="form-control" placeholder={t("search_placeholder")}
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ width: 240, padding: "8px 14px", fontSize: 14 }}
        />

        {/* Genre pills */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {GENRES.map(g => (
            <button key={g} onClick={() => setGenre(g)}
              className="btn btn-sm"
              style={{
                background: genre === g ? "var(--ink)" : "#fff",
                color: genre === g ? "#fff" : "var(--muted)",
                borderColor: genre === g ? "var(--ink)" : "var(--border)",
                fontSize: 12,
              }}>{g}</button>
          ))}
        </div>

        {/* Tier */}
        <div style={{ display: "flex", gap: 6 }}>
          {["All", "free", "paid"].map(tierOpt => (
            <button key={tierOpt} onClick={() => setTier(tierOpt)}
              className="btn btn-sm"
              style={{
                background: tier === tierOpt ? "var(--gold)" : "#fff",
                color: tier === tierOpt ? "#fff" : "var(--muted)",
                borderColor: tier === tierOpt ? "var(--gold)" : "var(--border)",
                fontSize: 12,
              }}>{tierOpt === "All" ? t("all_tiers") : t(`tier_${tierOpt}`)}</button>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "80px 0" }}>
          <p style={{ fontSize: 40, marginBottom: 16 }}>✦</p>
          <p style={{ fontSize: 18, color: "var(--muted)", marginBottom: 8 }}>
            {stories.length === 0 ? t("no_stories") : t("no_match")}
          </p>
          {stories.length === 0 && (
            <Link to="/register" className="btn btn-primary" style={{ marginTop: 16 }}>
              {t("be_first")}
            </Link>
          )}
        </div>
      )}

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
        {filtered.map(story => <StoryCard key={story.slug} story={story} t={t} />)}
      </div>
    </div>
  );
}

function StoryCard({ story, t }) {
  const accent = story.accentColor || "#b8822a";
  return (
    <Link to={`/story/${story.slug}`} style={{ textDecoration: "none" }}>
      <div className="card" style={{ overflow: "hidden", height: "100%" }}
        onMouseEnter={e => e.currentTarget.style.borderColor = accent}
        onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
      >
        {/* Color strip */}
        <div style={{ height: 4, background: accent }} />
        <div style={{ padding: "22px 24px", display: "flex", flexDirection: "column", height: "calc(100% - 4px)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <span style={{ fontSize: 12, color: accent, fontWeight: 500 }}>{story.genre}</span>
            <span className={`badge badge-${story.tier}`}>{t(`tier_${story.tier}`)}</span>
          </div>
          <h2 style={{ fontSize: 20, marginBottom: 10, color: "var(--ink)", lineHeight: 1.25 }}>{story.title}</h2>
          <p style={{ fontSize: 14, color: "var(--muted)", fontStyle: "italic", lineHeight: 1.6, flex: 1, marginBottom: 16 }}>
            "{story.excerpt}"
          </p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: 14 }}>
            <span style={{ fontSize: 13, color: "var(--muted)" }}>{t("written_by")} {story.author}</span>
            <div style={{ display: "flex", gap: 12 }}>
              <StatPill val={story.reads || 0} label={t("stat_reads")} />
              <StatPill val={story.likes || 0} label={t("stat_likes")} icon="❤️" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function StatPill({ val, label, icon }) {
  const display = val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val;
  return (
    <span style={{ fontSize: 12, color: "var(--dim)" }}>
      <span style={{ color: "var(--ink2)", fontWeight: 500 }}>{icon ? `${icon} ` : ''}{display}</span> {label}
    </span>
  );
}
