// Hôtel des ventes de Starfarer 3D : annonces entre joueurs, même déconnectés. Commission de 5 % prélevée à l'encaissement.
import { getStore, kvOk, json, preflight, notReady } from "./_kv.mjs";
const CODE = /^SF-[A-HJ-NP-Z2-9]{8}$/;
const ITEMS = new Set(["food", "water", "fuel", "metal", "med", "elec", "lux", "fer", "titane", "cristal", "or", "herbes", "arms", "spice", "relic", "exo"]);
const EXP = 72 * 3600e3, KEEP = 7 * 24 * 3600e3, FEE = 0.05, MAXOPEN = 10, MAXBOOK = 600;
const clean = s => String(s || "").replace(/[<>&"\u0000-\u001f]/g, "").trim().slice(0, 24);
async function load(store) { const r = await store.getWithMetadata("book", { type: "json" }); return r && r.data ? { b: r.data, etag: r.etag } : { b: { l: [], seq: 1 }, etag: null }; }
const pub = (x, code) => ({ id: x.id, n: x.n, it: x.it, q: x.q, p: x.p, t: x.t, mine: x.code === code ? 1 : 0 });
function prune(b, now) { b.l = b.l.filter(x => !(x.st !== "open" && x.paid && now - (x.ts || x.t) > KEEP) && !(x.st === "gone") && !(x.st === "exp" && x.paid)); }
const handler = async (req) => {
  if (req.method === "OPTIONS") return preflight();
  if (!kvOk()) return notReady();
  const store = getStore("market"), now = Date.now();
  if (req.method === "GET") {
    const code = (new URL(req.url).searchParams.get("code") || "").toUpperCase();
    const { b } = await load(store);
    const open = b.l.filter(x => x.st === "open" && now - x.t < EXP).sort((a, z) => z.t - a.t);
    const mine = CODE.test(code) ? b.l.filter(x => x.code === code).map(x => ({ ...pub(x, code), st: x.st === "open" && now - x.t >= EXP ? "exp" : x.st, paid: x.paid ? 1 : 0 })) : [];
    return json({ open: open.slice(0, 120).map(x => pub(x, code)), mine, t: now });
  }
  if (req.method !== "POST") return json({ error: "méthode" }, 405);
  let d; try { d = JSON.parse((await req.text()).slice(0, 4000)); } catch (e) { return json({ error: "données invalides" }, 400); }
  const code = String(d && d.code || "").toUpperCase(), a = d && d.a;
  if (!CODE.test(code)) return json({ error: "code invalide" }, 400);
  for (let i = 0; i < 6; i++) {
    const { b, etag } = await load(store); if (!Array.isArray(b.l)) b.l = []; prune(b, now);
    let out;
    if (a === "sell") {
      const it = String(d.it || ""), q = d.q | 0, p = d.p | 0;
      if (!ITEMS.has(it) || q < 1 || q > 999 || p < 1 || p > 1e6) return json({ error: "annonce invalide" }, 400);
      if (b.l.filter(x => x.code === code && x.st === "open").length >= MAXOPEN) return json({ error: "Tu as déjà " + MAXOPEN + " annonces en cours" }, 409);
      if (b.l.length >= MAXBOOK) return json({ error: "L'hôtel des ventes est plein, réessaie plus tard" }, 507);
      const x = { id: (b.seq = (b.seq || 1) + 1).toString(36) + Math.random().toString(36).slice(2, 5), code, n: clean(d.n) || "Pilote", it, q, p, t: now, st: "open" };
      b.l.push(x); out = { ok: true, id: x.id };
    } else if (a === "buy") {
      const x = b.l.find(y => y.id === d.id);
      if (!x || x.st !== "open" || now - x.t >= EXP) return json({ error: "Cette annonce n'est plus disponible" }, 410);
      if (x.code === code) return json({ error: "C'est ta propre annonce" }, 409);
      x.st = "sold"; x.by = code; x.ts = now; out = { ok: true, it: x.it, q: x.q, p: x.p };
    } else if (a === "cancel") {
      const x = b.l.find(y => y.id === d.id && y.code === code);
      if (!x || x.st !== "open") return json({ error: "Impossible d'annuler" }, 409);
      x.st = "gone"; out = { ok: true, it: x.it, q: x.q };
    } else if (a === "claim") {
      let cr = 0; const items = [];
      for (const x of b.l) { if (x.code !== code || x.paid) continue; if (x.st === "sold") { cr += Math.floor(x.q * x.p * (1 - FEE)); x.paid = 1; } else if (x.st === "open" && now - x.t >= EXP) { x.st = "exp"; x.paid = 1; items.push({ it: x.it, q: x.q }); } }
      if (!cr && !items.length) return json({ ok: true, cr: 0, items: [] });
      out = { ok: true, cr, items };
    } else return json({ error: "action inconnue" }, 400);
    const res = await store.setJSON("book", b, etag ? { onlyIfMatch: etag } : { onlyIfNew: true });
    if (!res || res.modified !== false) return json(out);
  }
  return json({ error: "occupé, réessaie" }, 503);
};
export default { fetch: handler };
