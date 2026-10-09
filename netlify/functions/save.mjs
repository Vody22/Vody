// Sauvegarde dans le cloud de Starfarer 3D : une partie par code personnel (SF-XXXXXXXX), stockée dans Netlify Blobs.
import { getStore } from "@netlify/blobs";
const CODE = /^SF-[A-HJ-NP-Z2-9]{8}$/;
const H = { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "access-control-allow-origin": "*" };
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: H });
export default async (req) => {
  if (req.method === "OPTIONS") return new Response("", { headers: { ...H, "access-control-allow-methods": "GET,POST", "access-control-allow-headers": "content-type" } });
  const code = (new URL(req.url).searchParams.get("code") || "").toUpperCase();
  if (!CODE.test(code)) return json({ error: "code invalide" }, 400);
  const store = getStore("saves");
  if (req.method === "GET") {
    const v = await store.get(code);
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
export const config = { path: "/api/save" };
