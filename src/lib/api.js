// src/lib/api.js
// All calls go to our Express backend, which talks to GitHub.
// Writers never touch GitHub directly.

function authHeader(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getStories() {
  const r = await fetch("/api/stories");
  if (!r.ok) return [];
  return r.json();
}

export async function getStory(slug) {
  const r = await fetch(`/api/stories/${slug}`);
  if (!r.ok) return null;
  return r.json();
}

export async function publishStory(token, story) {
  const r = await fetch("/api/stories", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader(token) },
    body: JSON.stringify(story),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error);
  return data;
}

export async function updateStory(token, slug, story) {
  const r = await fetch(`/api/stories/${slug}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeader(token) },
    body: JSON.stringify(story),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error);
  return data;
}

export async function incrementRead(slug) {
  fetch(`/api/stories/${slug}/read`, { method: "POST" }).catch(() => {});
}
