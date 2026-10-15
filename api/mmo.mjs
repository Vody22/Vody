// Réseau galactique de Starfarer 3D (couche MMO) : identité de pilote, pilotes en ligne dans toute la galaxie,
// discussion Galaxie / Guilde, guildes, chantier commun de la semaine. Stockage : Redis (Upstash) via _kv.mjs.
// Tout passe par POST /api/mmo {a: action, pid, key, ...}. Le pilote est identifié par pid (public) + key (secrète, gardée dans sa sauvegarde).
import { createHash } from "node:crypto";
import { getStore, kvOk, kvCmd, kvPipe, json, preflight, notReady } from "./_kv.mjs";

const P = "sf:mmo:";
const PID = /^[a-z0-9]{12}$/, KEY = /^[a-z0-9]{24}$/, GID = /^[a-z0-9]{8}$/;
const ONLINE_MS = 75e3, STALE_MS = 10 * 60e3, CHAT_MAX = 60, GUILD_MAX = 30, ORES = ["fer", "titane", "cristal", "or"];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const clean = (s, n) => String(s == null ? "" : s).replace(/[\u0000-\u001f\u007f-\u009f​-‏‪-‮⁠-⁤﻿<>]/g, "").trim().slice(0, n);
const num = (v, a, b, d = 0) => (Number.isFinite(+v) ? clamp(+v, a, b) : d);
const sha = s => createHash("sha256").update(s).digest("hex");
const rid = n => { let s = ""; while (s.length < n) s += Math.random().toString(36).slice(2); return s.slice(0, n); };
const store = () => getStore("mmo");
export const guildLevel = xp => clamp(1 + Math.floor(Math.sqrt(Math.max(0, xp) / 400)), 1, 20);
const COLS = ["#7ab6ff", "#ff7a7a", "#ffc34d", "#7dffb0", "#c79bff", "#ff9a3d", "#5ef0ff", "#ff7ad9"];

// ----- semaine ISO et chantier commun -----
function isoWeek(d = new Date()) { const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())); const day = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - day); const y = t.getUTCFullYear(); const w = Math.ceil(((t - Date.UTC(y, 0, 1)) / 864e5 + 1) / 7); return { k: y + "-W" + String(w).padStart(2, "0"), n: y * 53 + w }; }
const PROJ = [
  { n: "Relais hyperspatial", d: "Une balise géante pour relier les secteurs lointains.", g: { fer: 300, titane: 160, cristal: 90, or: 30 } },
  { n: "Croiseur de l'Alliance", d: "Un vaisseau amiral construit par tous les pilotes.", g: { fer: 380, titane: 200, cristal: 60, or: 40 } },
  { n: "Observatoire profond", d: "Un télescope pour cartographier les anomalies.", g: { fer: 200, titane: 120, cristal: 150, or: 30 } },
  { n: "Bouclier planétaire", d: "Protéger les avant-postes des raids pirates.", g: { fer: 260, titane: 220, cristal: 80, or: 35 } },
];
const projOf = w => PROJ[((w.n % PROJ.length) + PROJ.length) % PROJ.length];
function projOut(w, d, pid) {
  const def = projOf(w), got = d.got || {}, by = d.by || {};
  const pct = ORES.reduce((a, o) => a + Math.min(1, (got[o] || 0) / def.g[o]), 0) / ORES.length;
  const top = Object.entries(by).map(([k, x]) => ({ n: x.n || "Pilote", v: x.v | 0, me: k === pid ? 1 : 0 })).sort((a, b) => b.v - a.v).slice(0, 8);
  const mine = by[pid] || null;
  return { w: w.k, n: def.n, d: def.d, goal: def.g, got, pct: Math.round(pct * 1000) / 1000, done: pct >= 1 ? 1 : 0, top, nb: Object.keys(by).length, my: mine ? mine.v | 0 : 0, cl: mine && mine.cl ? 1 : 0 };
}

// ----- guildes -----
function guildOut(g, onl) {
  const mem = Object.entries(g.m || {}).map(([id, x]) => ({ id, n: x.n || "Pilote", r: x.r || "membre", c: x.c | 0, on: onl && onl.has(id) ? 1 : 0 })).sort((a, b) => (b.r === "chef") - (a.r === "chef") || b.c - a.c);
  return { id: g.id, n: g.n, tag: g.tag, col: g.col, motd: g.motd || "", xp: g.xp | 0, lv: guildLevel(g.xp | 0), m: mem, owner: g.owner };
}
async function casUpdate(key, fn, init) {
  const s = store();
  for (let i = 0; i < 6; i++) {
    const r = await s.getWithMetadata(key, { type: "json" });
    const cur = r && r.data ? r.data : init ? init() : null;
    if (!cur) return { gone: 1 };
    const out = fn(cur);
    if (out && out.err) return out;
    if (out && out.del) { await kvCmd("DEL", "sf:mmo:" + key, "sf:mmo:" + key + ":v"); return { ok: 1, val: null }; }
    const res = await s.setJSON(key, cur, r && r.data ? { onlyIfMatch: r.etag } : { onlyIfNew: true });
    if (!res || res.modified !== false) return { ok: 1, val: cur, out };
  }
  return { err: "Serveur occupé, réessaie" };
}

// ----- identité -----
async function auth(b) {
  const pid = String(b.pid || ""), key = String(b.key || "");
  if (!PID.test(pid) || !KEY.test(key)) return null;
  const h = sha(key);
  const [cur, gid] = await kvPipe([["GET", P + "k:" + pid], ["GET", P + "pg:" + pid]]);
  if (cur == null) { const ok = await kvCmd("SET", P + "k:" + pid, h, "NX"); if (ok !== "OK" && (await kvCmd("GET", P + "k:" + pid)) !== h) return null; }
  else if (cur !== h) return null;
  return { pid, gid: gid && GID.test(gid) ? gid : null };
}
function parseOnline(h, now) {
  const L = [], stale = [];
  if (!Array.isArray(h)) return { L, stale };
  for (let i = 0; i + 1 < h.length; i += 2) { try { const o = JSON.parse(h[i + 1]); if (now - o.t > STALE_MS) stale.push(h[i]); else if (now - o.t < ONLINE_MS) L.push({ id: h[i], ...o }); } catch (e) { stale.push(h[i]); } }
  return { L, stale };
}
const msgs = (arr, since) => (Array.isArray(arr) ? arr : []).map(s => { try { return JSON.parse(s); } catch (e) { return null; } }).filter(m => m && m.i > since).reverse();

// ----- actions -----
const A = {};
A.sync = async (b, me, now) => {
  const m = b.me || {};
  const prev = await kvCmd("HGET", P + "on", me.pid);
  let gt = "", gc = "", g = null;
  if (me.gid) { const r = await store().getWithMetadata("g/" + me.gid, { type: "json" }); g = r && r.data; if (g && g.m && g.m[me.pid]) { gt = g.tag; gc = g.col; } else { g = null; me.gid = null; await kvCmd("DEL", P + "pg:" + me.pid); } }
  const nick = clean(m.n, 16) || "Pilote";
  const rec = { n: nick, h: num(m.h, 0, 360) | 0, lv: num(m.lv, 1, 60, 1) | 0, sh: clean(m.sh, 14), z: clean(m.z, 24), zn: clean(m.zn, 32), m: m.m === "surf" ? "surf" : m.m === "int" ? "int" : "space", pl: clean(m.pl, 24), x: Math.round(num(m.x, -1e7, 1e7) / 50) * 50, y: Math.round(num(m.y, -1e5, 1e5) / 50) * 50, zz: Math.round(num(m.zz, -1e7, 1e7) / 50) * 50, gt, gc, t: now };
  // contribution à la guilde (XP gagnée depuis la dernière synchro, plafonnée)
  const gx = num(b.gx, 0, 400) | 0;
  if (g && gx > 0) {
    const r = await casUpdate("g/" + g.id, gg => { if (!gg.m || !gg.m[me.pid]) return { err: "x" }; gg.xp = (gg.xp | 0) + gx; gg.m[me.pid].c = (gg.m[me.pid].c | 0) + gx; gg.m[me.pid].n = nick; });
    if (r.ok && r.val) g = r.val;
  }
  const cmds = [["HSET", P + "on", me.pid, JSON.stringify(rec)], ["HGETALL", P + "on"], ["LRANGE", P + "chat:g", 0, CHAT_MAX - 1], ["GET", P + "p/" + isoWeek().k]];
  if (g) cmds.push(["LRANGE", P + "chat:c:" + g.id, 0, CHAT_MAX - 1]);
  const R = await kvPipe(cmds);
  const { L, stale } = parseOnline(R[1], now);
  if (stale.length && Math.random() < 0.3) await kvCmd("HDEL", P + "on", ...stale.slice(0, 50));
  const w = isoWeek();
  let pd = {}; try { pd = R[3] ? JSON.parse(R[3]) : {}; } catch (e) {}
  const onl = new Set(L.map(x => x.id));
  return json({ ok: 1, t: now, first: prev ? 0 : 1, on: L.sort((a, c) => c.lv - a.lv).slice(0, 100), g: msgs(R[2], num(b.cg, 0, 1e15)), c: g ? msgs(R[4], num(b.cc, 0, 1e15)) : [], guild: g ? guildOut(g, onl) : null, pr: projOut(w, pd, me.pid) });
};
A.chat = async (b, me, now) => {
  const ch = b.ch === "c" ? "c" : "g";
  if (ch === "c" && !me.gid) return json({ err: "Tu n'es dans aucune guilde" }, 400);
  const txt = clean(b.txt, 140); if (!txt) return json({ err: "Message vide" }, 400);
  const rl = await kvCmd("SET", P + "rl:" + me.pid, "1", "PX", 1200, "NX");
  if (rl !== "OK") return json({ err: "Doucement, un message à la fois" }, 429);
  let o = {}; try { o = JSON.parse((await kvCmd("HGET", P + "on", me.pid)) || "{}"); } catch (e) {}
  const i = await kvCmd("INCR", P + "chat:n");
  const msg = { i, p: me.pid, n: o.n || "Pilote", h: o.h | 0, gt: o.gt || "", gc: o.gc || "", tx: txt, t: now };
  const key = ch === "c" ? P + "chat:c:" + me.gid : P + "chat:g";
  await kvPipe([["LPUSH", key, JSON.stringify(msg)], ["LTRIM", key, 0, CHAT_MAX - 1]]);
  return json({ ok: 1, m: msg });
};
A.glist = async (b, me) => {
  const ids = ((await kvCmd("SMEMBERS", P + "gs")) || []).filter(x => GID.test(x)).slice(0, 80);
  if (!ids.length) return json({ ok: 1, l: [] });
  const raw = await kvCmd("MGET", ...ids.map(id => P + "g/" + id));
  const l = raw.map(s => { try { return JSON.parse(s); } catch (e) { return null; } }).filter(Boolean).map(g => ({ id: g.id, n: g.n, tag: g.tag, col: g.col, lv: guildLevel(g.xp | 0), nb: Object.keys(g.m || {}).length, motd: (g.motd || "").slice(0, 80) })).sort((a, c) => c.lv - a.lv || c.nb - a.nb);
  return json({ ok: 1, l });
};
A.gcreate = async (b, me, now) => {
  if (me.gid) return json({ err: "Quitte d'abord ta guilde" }, 400);
  const n = clean(b.n, 24), tag = clean(b.tag, 4).toUpperCase().replace(/[^A-Z0-9]/g, ""), col = COLS.includes(b.col) ? b.col : COLS[0];
  if (n.length < 3) return json({ err: "Nom trop court (3 lettres minimum)" }, 400);
  if (tag.length < 2) return json({ err: "Tag de 2 à 4 lettres ou chiffres" }, 400);
  const gid = rid(8);
  const ok = await kvCmd("SET", P + "gt:" + tag, gid, "NX");
  if (ok !== "OK") return json({ err: "Ce tag est déjà pris" }, 409);
  const nick = clean(b.nick, 16) || "Pilote";
  const g = { id: gid, n, tag, col, owner: me.pid, motd: "Bienvenue dans " + n + " !", xp: 0, m: { [me.pid]: { n: nick, r: "chef", c: 0, j: now } }, t: now };
  await store().setJSON("g/" + gid, g, { onlyIfNew: true });
  await kvPipe([["SADD", P + "gs", gid], ["SET", P + "pg:" + me.pid, gid]]);
  return json({ ok: 1, guild: guildOut(g) });
};
A.gjoin = async (b, me, now) => {
  if (me.gid) return json({ err: "Tu es déjà dans une guilde" }, 400);
  const gid = String(b.gid || ""); if (!GID.test(gid)) return json({ err: "Guilde inconnue" }, 404);
  const nick = clean(b.nick, 16) || "Pilote";
  const r = await casUpdate("g/" + gid, g => { if (Object.keys(g.m || {}).length >= GUILD_MAX) return { err: "Guilde complète (" + GUILD_MAX + " pilotes)" }; if ((g.ban || []).includes(me.pid)) return { err: "Le chef t'a exclu de cette guilde" }; g.m = g.m || {}; g.m[me.pid] = { n: nick, r: "membre", c: 0, j: now }; });
  if (r.gone) return json({ err: "Guilde dissoute" }, 404);
  if (r.err) return json({ err: r.err }, 400);
  await kvCmd("SET", P + "pg:" + me.pid, gid);
  return json({ ok: 1, guild: guildOut(r.val) });
};
A.gleave = async (b, me) => {
  if (!me.gid) return json({ ok: 1 });
  const gid = me.gid; let tag = "";
  const r = await casUpdate("g/" + gid, g => {
    tag = g.tag; if (!g.m || !g.m[me.pid]) return;
    delete g.m[me.pid];
    const rest = Object.entries(g.m);
    if (!rest.length) return { del: 1 };
    if (g.owner === me.pid) { rest.sort((a, c) => (c[1].c | 0) - (a[1].c | 0)); g.owner = rest[0][0]; g.m[rest[0][0]].r = "chef"; }
  });
  await kvCmd("DEL", P + "pg:" + me.pid);
  if (r.ok && r.val === null) await kvPipe([["SREM", P + "gs", gid], ["DEL", P + "gt:" + tag], ["DEL", P + "chat:c:" + gid]]);
  return json({ ok: 1 });
};
A.gkick = async (b, me) => {
  const who = String(b.who || ""); if (!me.gid || !PID.test(who) || who === me.pid) return json({ err: "Impossible" }, 400);
  const r = await casUpdate("g/" + me.gid, g => { if (g.owner !== me.pid) return { err: "Seul le chef peut exclure" }; if (!g.m[who]) return { err: "Ce pilote n'est plus là" }; delete g.m[who]; g.ban = [...(g.ban || []), who].slice(-50); });
  if (r.err) return json({ err: r.err }, 403);
  await kvCmd("DEL", P + "pg:" + who);
  return json({ ok: 1, guild: guildOut(r.val) });
};
A.gmotd = async (b, me) => {
  if (!me.gid) return json({ err: "Impossible" }, 400);
  const txt = clean(b.txt, 140);
  const r = await casUpdate("g/" + me.gid, g => { if (g.owner !== me.pid) return { err: "Seul le chef peut changer le message" }; g.motd = txt; });
  if (r.err) return json({ err: r.err }, 403);
  return json({ ok: 1, guild: guildOut(r.val) });
};
A.pgive = async (b, me) => {
  const w = isoWeek(), def = projOf(w), res = b.res || {};
  const nick = clean(b.nick, 16) || "Pilote";
  let took = {};
  const r = await casUpdate("p/" + w.k, d => {
    d.got = d.got || {}; d.by = d.by || {}; took = {}; let pts = 0;
    for (const o of ORES) { const want = num(res[o], 0, 500) | 0, room = Math.max(0, def.g[o] - (d.got[o] | 0)), q = Math.min(want, room); if (q > 0) { d.got[o] = (d.got[o] | 0) + q; took[o] = q; pts += q * (o === "or" ? 6 : o === "cristal" ? 3 : o === "titane" ? 2 : 1); } }
    if (!pts) return { err: "Le chantier n'a plus besoin de ces minerais" };
    const e = d.by[me.pid] || { n: nick, v: 0 }; e.n = nick; e.v = (e.v | 0) + pts; d.by[me.pid] = e;
  }, () => ({ got: {}, by: {} }));
  if (r.err) return json({ err: r.err }, 400);
  return json({ ok: 1, took, pr: projOut(w, r.val, me.pid) });
};
A.pclaim = async (b, me) => {
  const w = isoWeek(); let pts = 0;
  const r = await casUpdate("p/" + w.k, d => {
    const p = projOut(w, d, me.pid);
    if (!p.done) return { err: "Le chantier n'est pas encore terminé" };
    const e = d.by && d.by[me.pid]; if (!e) return { err: "Tu n'as rien livré à ce chantier" };
    if (e.cl) return { err: "Récompense déjà récupérée" };
    e.cl = 1; pts = e.v | 0;
  });
  if (r.err || r.gone) return json({ err: r.err || "Chantier introuvable" }, 400);
  return json({ ok: 1, pts, pr: projOut(w, r.val, me.pid) });
};
A.bye = async (b, me) => { await kvCmd("HDEL", P + "on", me.pid); return json({ ok: 1 }); };

const handler = async (req) => {
  if (req.method === "OPTIONS") return preflight();
  if (!kvOk()) return notReady();
  if (req.method !== "POST") return json({ error: "méthode" }, 405);
  let b; try { b = JSON.parse((await req.text()).slice(0, 8000)); } catch (e) { return json({ err: "données invalides" }, 400); }
  const f = b && A[b.a]; if (!f) return json({ err: "action inconnue" }, 400);
  try {
    const me = await auth(b); if (!me) return json({ err: "Identité de pilote refusée" }, 403);
    return await f(b, me, Date.now());
  } catch (e) { return json({ err: "erreur serveur", d: String(e && e.message || e).slice(0, 120) }, 500); }
};
export default { fetch: handler };
