// Sauvegarde dans le cloud de Starfarer 3D : une partie par code personnel (SF-XXXXXXXX), stockée dans la base Redis du projet Vercel.
import { getStore, kvOk, json, preflight, notReady, H } from "./_kv.mjs";
// partie pas encore ici : on va la chercher sur l'ancien site Netlify (transfert automatique avec le même code)
const OLD = "https://starvody.netlify.app/api/save?code=";
async function fromOld(code) { try { const c = new AbortController(); const tm = setTimeout(() => c.abort(), 5000); const r = await fetch(OLD + encodeURIComponent(code), { signal: c.signal }); clearTimeout(tm); if (!r.ok) return null; const t = await r.text(); if (!t || t === "null") return null; const d = JSON.parse(t); return d && typeof d === "object" ? t : null; } catch (e) { return null; } }
const CODE = /^SF-[A-HJ-NP-Z2-9]{8}$/;
const handler = async (req) => {
  if (req.method === "OPTIONS") return preflight();
  if (!kvOk()) return notReady();
  const code = (new URL(req.url).searchParams.get("code") || "").toUpperCase();
  if (!CODE.test(code)) return json({ error: "code invalide" }, 400);
  const store = getStore("saves");
  if (req.method === "GET") {
    let v = await store.get(code);
    if (!v) { v = await fromOld(code); if (v) await store.set(code, v); }
    return new Response(v || "null", { headers: H });
  }
  if (req.method === "POST") {
    const body = await req.text();
    if (body.length > 400000) return json({ error: "trop gros" }, 413);
    try { const d = JSON.parse(body); if (!d || typeof d !== "object") throw 0; } catch (e) { return json({ error: "données invalides" }, 400); }
    await store.set(code, body);
    return json({ ok: true, t: Date.now() });
  }
  return json({ error: "méthode" }, 405);
};
export default { fetch: handler };
