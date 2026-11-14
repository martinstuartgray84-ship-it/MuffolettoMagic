// Validate /content: JSON parses, slugs unique, floors exist, photo files exist, task rooms exist.
import fs from "node:fs";
import path from "node:path";
const C = path.join(process.cwd(), "content");
const errs = [];
const read = (p) => { try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch (e) { errs.push(`${p}: ${e.message}`); return null; } };
const house = read(path.join(C, "house.json"));
const floors = new Set(house?.floors?.map((f) => f.id));
const slugs = new Set();
for (const f of fs.readdirSync(path.join(C, "rooms")).filter((f) => f.endsWith(".json"))) {
  const r = read(path.join(C, "rooms", f)); if (!r) continue;
  if (!r.slug || !r.name || !r.floor || !r.status) errs.push(`${f}: missing slug/name/floor/status`);
  if (slugs.has(r.slug)) errs.push(`${f}: duplicate slug ${r.slug}`); slugs.add(r.slug);
  if (!floors.has(r.floor)) errs.push(`${f}: unknown floor "${r.floor}"`);
  for (const p of r.photos ?? []) if (!fs.existsSync(path.join(process.cwd(), "public", p.src))) errs.push(`${f}: missing photo ${p.src}`);
  for (const s of r.target?.palette ?? []) if (!/^#[0-9a-f]{3}([0-9a-f]{3})?$/i.test(s.hex)) errs.push(`${f}: bad hex ${s.hex}`);
}
const tasks = read(path.join(C, "tasks.json")) ?? [];
const ids = new Set();
for (const t of tasks) {
  if (ids.has(t.id)) errs.push(`tasks: duplicate id ${t.id}`); ids.add(t.id);
  if (t.room && !slugs.has(t.room)) errs.push(`tasks ${t.id}: unknown room "${t.room}"`);
}
if (errs.length) { console.error(errs.join("\n")); process.exit(1); }
console.log(`content OK — ${slugs.size} rooms, ${tasks.length} tasks`);
