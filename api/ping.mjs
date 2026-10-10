// Diagnostic : la base de données en ligne est-elle branchée ? (ne renvoie que des noms de variables, jamais leurs valeurs)
import { kvOk, kvSrc, kvCmd, json } from "./_kv.mjs";
export default {
  async fetch() {
    const keys = Object.keys(process.env).filter(k => /KV|REDIS|UPSTASH|STORAGE/i.test(k)).sort();
    let test = "non testé";
    if (kvOk()) { try { const v = "p" + Date.now(); await kvCmd("SET", "sf:ping", v); test = (await kvCmd("GET", "sf:ping")) === v ? "ok" : "lecture différente"; } catch (e) { test = "erreur : " + String(e.message || e).slice(0, 120); } }
    return json({ ok: true, kv: kvOk(), source: kvSrc(), variables: keys, test, t: Date.now() });
  },
};
