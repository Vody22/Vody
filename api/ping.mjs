// Diagnostic : la base de données en ligne est-elle branchée ? (ne renvoie que des noms de variables, jamais leurs valeurs)
import { kvOk, kvSrc, kvCmd, json } from "./_kv.mjs";
export default {
  async fetch() {
    const keys = Object.keys(process.env).filter(k => /KV|REDIS|UPSTASH|STORAGE/i.test(k)).sort();
    let test = "non testé";
    if (kvOk()) { try { const v = "p" + Date.now(); await kvCmd("SET", "sf:ping", v); test = (await kvCmd("GET", "sf:ping")) === v ? "ok" : "lecture différente"; } catch (e) { test = "erreur : " + String(e.message || e).slice(0, 120); } }
    const fn = {};
    for (const n of ["war", "board", "market", "save"]) {
      try { const h = (await import("./" + n + ".mjs")).default; const r = await h.fetch(new Request("https://x/api/" + n + (n == "save" ? "?code=SF-AAAAAAAA" : ""), { method: "GET" })); fn[n] = r.status + " " + (await r.text()).slice(0, 80); }
      catch (e) { fn[n] = "erreur : " + String(e && e.stack || e).slice(0, 300); }
    }
    return json({ ok: true, kv: kvOk(), source: kvSrc(), variables: keys, test, fn, t: Date.now() });
  },
};
