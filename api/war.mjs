// Guerre des territoires de Starfarer 3D : influence partagée par tous les joueurs, par secteur (« x,z »).
// Chaque valeur décroît de moitié en 48 h (les frontières reviennent lentement à leur état naturel).
import { getStore, kvOk, json, preflight, notReady } from "./_kv.mjs";
const SID = /^-?\d{1,3},-?\d{1,3}$/, HALF = 48 * 3600e3;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function decay(m, now) { for (const k of Object.keys(m.s)) { const e = m.s[k]; const v = e.v * Math.pow(0.5, (now - e.t) / HALF); if (Math.abs(v) < 0.5) delete m.s[k]; else { e.v = v; e.t = now; } } }
const out = m => { const s = {}; for (const k in m.s) s[k] = Math.round(m.s[k].v * 10) / 10; return s; };
async function load(store) { const r = await store.getWithMetadata("map", { type: "json" }); return r && r.data ? { m: r.data, etag: r.etag } : { m: { s: {} }, etag: null }; }
const handler = async (req) => {
  if (req.method === "OPTIONS") return preflight();
  if (!kvOk()) return notReady();
  const store = getStore("war"), now = Date.now();
  if (req.method === "GET") { const { m } = await load(store); decay(m, now); return json({ s: out(m), t: now }); }
  if (req.method !== "POST") return json({ error: "méthode" }, 405);
  let body; try { body = JSON.parse((await req.text()).slice(0, 20000)); } catch (e) { return json({ error: "données invalides" }, 400); }
  const d = body && typeof body.d === "object" && body.d ? body.d : {};
  const keys = Object.keys(d).filter(k => SID.test(k) && Number.isFinite(+d[k])).slice(0, 30);
  for (let i = 0; i < 6; i++) {
    const { m, etag } = await load(store); if (!m.s || typeof m.s !== "object") m.s = {};
    decay(m, now);
    for (const k of keys) { const e = m.s[k] || { v: 0, t: now }; e.v = clamp(e.v + clamp(+d[k], -60, 60), -150, 150); e.t = now; m.s[k] = e; }
    const res = await store.setJSON("map", m, etag ? { onlyIfMatch: etag } : { onlyIfNew: true });
    if (!res || res.modified !== false) return json({ s: out(m), t: now });
  }
  return json({ error: "occupé, réessaie" }, 503);
};
export default { fetch: handler };
