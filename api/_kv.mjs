// Stockage des données en ligne sur Vercel : base Redis (Upstash) appelée par son API REST, sans dépendance.
// Imite l'API de Netlify Blobs utilisée par les fonctions (get, set, getWithMetadata, setJSON avec onlyIfMatch / onlyIfNew).
const URL0 = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "";
const TOK = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "";
export const kvOk = () => !!(URL0 && TOK);
async function cmd(...args) {
  const r = await fetch(URL0, { method: "POST", headers: { authorization: "Bearer " + TOK, "content-type": "application/json" }, body: JSON.stringify(args) });
  const j = await r.json().catch(() => ({ error: "réponse illisible" }));
  if (!r.ok || j.error) throw new Error(j.error || "HTTP " + r.status);
  return j.result;
}
// écriture conditionnelle : n'écrit que si la version stockée est celle attendue ("" = la clé n'existe pas encore)
const CAS = "local v=redis.call('GET',KEYS[2]) or '' if v~=ARGV[1] then return 0 end redis.call('SET',KEYS[1],ARGV[2]) redis.call('SET',KEYS[2],ARGV[3]) return 1";
const ver = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
export function getStore(name) {
  const k = key => "sf:" + name + ":" + key;
  return {
    async get(key) { return await cmd("GET", k(key)); },
    async set(key, val) { await cmd("MSET", k(key), String(val), k(key) + ":v", ver()); return { modified: true }; },
    async getWithMetadata(key, { type } = {}) {
      const [d, v] = await cmd("MGET", k(key), k(key) + ":v");
      if (d == null) return null;
      return { data: type === "json" ? JSON.parse(d) : d, etag: v || "" };
    },
    async setJSON(key, obj, opt = {}) {
      const body = JSON.stringify(obj);
      if (opt.onlyIfMatch != null || opt.onlyIfNew) {
        const ok = await cmd("EVAL", CAS, "2", k(key), k(key) + ":v", opt.onlyIfNew ? "" : String(opt.onlyIfMatch), body, ver());
        return { modified: ok === 1 };
      }
      await cmd("MSET", k(key), body, k(key) + ":v", ver());
      return { modified: true };
    },
  };
}
export const H = { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "access-control-allow-origin": "*" };
export const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: H });
export const preflight = () => new Response("", { headers: { ...H, "access-control-allow-methods": "GET,POST", "access-control-allow-headers": "content-type" } });
export const notReady = () => json({ error: "Stockage en ligne non configuré (ajoute Upstash Redis au projet Vercel)" }, 503);
