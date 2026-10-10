// Stockage des données en ligne sur Vercel : base Redis (Upstash) appelée par son API REST, sans dépendance.
// Imite l'API de Netlify Blobs utilisée par les fonctions (get, set, getWithMetadata, setJSON avec onlyIfMatch / onlyIfNew).
// variables posées par l'intégration Upstash (avec ou sans préfixe), sinon déduites de l'URL redis(s)://default:jeton@hôte:port
function pickEnv() {
  const E = process.env, K = Object.keys(E);
  const find = re => K.find(k => re.test(k) && E[k]);
  let u = E.KV_REST_API_URL || E.UPSTASH_REDIS_REST_URL, t = E.KV_REST_API_TOKEN || E.UPSTASH_REDIS_REST_TOKEN, src = "direct";
  if (!(u && t)) { const ku = find(/(^|_)(KV_REST_API_URL|UPSTASH_REDIS_REST_URL|REST_API_URL|REDIS_REST_URL)$/), kt = find(/(^|_)(KV_REST_API_TOKEN|UPSTASH_REDIS_REST_TOKEN|REST_API_TOKEN|REDIS_REST_TOKEN)$/); if (ku && kt) { u = E[ku]; t = E[kt]; src = ku + "/" + kt; } }
  if (!(u && t)) { const kr = find(/(^|_)(REDIS_URL|KV_URL)$/); if (kr) { try { const x = new URL(E[kr]); if (x.password) { u = "https://" + x.hostname; t = decodeURIComponent(x.password); src = kr; } } catch (e) {} } }
  return { u: u || "", t: t || "", src: u && t ? src : "" };
}
const ENV = pickEnv(), URL0 = ENV.u, TOK = ENV.t;
export const kvOk = () => !!(URL0 && TOK);
export const kvSrc = () => ENV.src;
export const kvCmd = (...a) => cmd(...a);
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
