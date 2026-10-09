// Classements hebdomadaires de Starfarer 3D (une saison = une semaine ISO). Une entrée par code de sauvegarde (SF-XXXXXXXX).
import { getStore } from "@netlify/blobs";
const H = { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "access-control-allow-origin": "*" };
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: H });
const CODE = /^SF-[A-HJ-NP-Z2-9]{8}$/, SEASON = /^\d{4}-W\d{2}$/;
const CATS = { riche: [0, 5e7, -1], chasse: [0, 1e5, -1], explo: [0, 1e4, -1], course: [0, 3600, 1], niveau: [0, 1e9, -1] };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const clean = s => String(s || "").replace(/[<>&"\u0000-\u001f]/g, "").trim().slice(0, 24);
function isoWeek(d = new Date()) { const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())); const day = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - day); const y = t.getUTCFullYear(); const w = Math.ceil(((t - Date.UTC(y, 0, 1)) / 864e5 + 1) / 7); return y + "-W" + String(w).padStart(2, "0"); }
async function load(store, s) { const r = await store.getWithMetadata("s/" + s, { type: "json" }); return r && r.data ? { b: r.data, etag: r.etag } : { b: { e: {} }, etag: null }; }
function tops(b, code) {
  const E = Object.entries(b.e || {}), top = {}, me = {};
  for (const c in CATS) {
    const dir = CATS[c][2], L = E.filter(([, x]) => x.v && x.v[c] > 0).sort((a, z) => dir < 0 ? z[1].v[c] - a[1].v[c] : a[1].v[c] - z[1].v[c]);
    top[c] = L.slice(0, 10).map(([k, x]) => ({ n: x.n || "Pilote", ti: x.ti || "", v: x.v[c], lv: x.v.lv || 1, me: k === code ? 1 : 0 }));
    if (code) { const i = L.findIndex(([k]) => k === code); if (i >= 0) me[c] = { r: i + 1, v: L[i][1].v[c] }; }
  }
  return { top, me, n: E.length };
}
export default async (req) => {
  if (req.method === "OPTIONS") return new Response("", { headers: { ...H, "access-control-allow-methods": "GET,POST", "access-control-allow-headers": "content-type" } });
  const store = getStore("board"), cur = isoWeek(), u = new URL(req.url);
  if (req.method === "GET") {
    const s = u.searchParams.get("season") || cur, code = (u.searchParams.get("code") || "").toUpperCase();
    if (!SEASON.test(s)) return json({ error: "saison invalide" }, 400);
    const { b } = await load(store, s);
    return json({ season: s, cur, ...tops(b, CODE.test(code) ? code : null) });
  }
  if (req.method !== "POST") return json({ error: "méthode" }, 405);
  let d; try { d = JSON.parse((await req.text()).slice(0, 4000)); } catch (e) { return json({ error: "données invalides" }, 400); }
  const code = String(d && d.code || "").toUpperCase();
  if (!CODE.test(code)) return json({ error: "code invalide" }, 400);
  const v = {};
  for (const c in CATS) { const x = +((d.v || {})[c]) || 0; v[c] = clamp(Math.round(x * (c === "course" ? 100 : 1)) / (c === "course" ? 100 : 1), CATS[c][0], CATS[c][1]); }
  v.lv = clamp((d.v || {}).lv | 0, 1, 60);
  for (let i = 0; i < 6; i++) {
    const { b, etag } = await load(store, cur); if (!b.e || typeof b.e !== "object") b.e = {};
    if (!b.e[code] && Object.keys(b.e).length >= 5000) return json({ error: "saison complète" }, 507);
    b.e[code] = { n: clean(d.n) || "Pilote", ti: clean(d.ti), v, t: Date.now() };
    const res = await store.setJSON("s/" + cur, b, etag ? { onlyIfMatch: etag } : { onlyIfNew: true });
    if (!res || res.modified !== false) return json({ ok: true, season: cur, ...tops(b, code) });
  }
  return json({ error: "occupé, réessaie" }, 503);
};
export const config = { path: "/api/board" };
