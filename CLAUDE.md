# Casa Muffoletto — design HQ

Private website for Martin & Stefany's house: **Largo Pietra Rossa 2, Gratteri (PA), Sicily**.
Claude acts as their interior designer / architect / geometra: it keeps the house record, the
target design for every room, the to-do / project / shopping lists, and produces decorator briefs.

## How the site works
- Next.js 15 (App Router), deployed on Vercel. No database: **`/content` is the database** (JSON, in git).
- `content/house.json` — address, facts, floors (with plan images), style direction & whole-house palette, documents, contacts.
- `content/rooms/<slug>.json` — one file per space. Schema = `Room` type in `lib/content.ts`.
  Sections: `dimensions`, `orientation`, `photos`, `current` (summary/keep/issues), `proposal` (architect's works),
  `target` (concept, mood, palette, materials, furniture, lighting, textiles), `brief` (scope, surfaces, notes, access).
- `content/tasks.json` — ONE list for everything: `type` = fix | project | buy | decor | admin. `buy` items show on the
  Shopping list; the rest on To-do. Link to a room with `room: <slug>`. IDs are `t001`, `t002`… (never reuse).
- `public/plans/` — survey & architect drawings (PDF + PNG renders). `public/photos/<room-slug>/NN.jpg` — room photos.
- `/brief/<slug>`, `/brief/house`, `/brief/selection?rooms=a,b` — print-ready decorator packs (browser “Save as PDF”).
- `middleware.ts` — basic-auth lock when `SITE_PASSWORD` env var is set (user name `SITE_USER`, default `casa`).

## Workflow when the owners send material
1. **Photos**: copy into `inbox/<room-slug>/`, run `npm run add-photos` (resizes to 2000px JPEG, strips the originals,
   prints JSON to paste into the room's `photos`). Look at every photo; write `caption`s and update `current`
   (summary / keep / issues) from what you actually see. Add fixes you spot to `tasks.json`.
2. **Drawings/PDFs**: copy to `public/plans/` with a dated, descriptive name; render PNGs with `pdftoppm` (+ sharp to
   crop/rotate); add to `house.documents` and to the relevant room `proposal.drawings` / floor `plan`.
   Survey sheets are 1:50 on A3 — at 110 dpi, 1 px ≈ 0.01155 m (useful for scaling dimensions).
3. **Design**: when a room is ready, fill `target` + `brief`, set `status` to `designing` → `approved` once agreed.
   Palette entries need real paint references (brand + code + finish), not just hex.
4. Always: `npm run check` (validates content) and `npm run build` before committing. Update `updated` dates.

## What we know (Nov 2026)
- Corner town house, 4 storeys + attic; façade on Largo Pietra Rossa, angled side wall on via Pietra Rossa.
- Existing-state survey: Chloé Pierron, 30 Sep 2024 ("Mayor's House" — the house's old name).
- Architects: Studio Architettura A3, Palermo (archh. S. La Versa, V. Simanella) — "internal reconfiguration",
  Apr 2026: ground-floor water tank + booster pump, new sewer pipe; first floor → bedroom + en-suite (options A / 2-B).
- Open questions live in `tasks.json` (type `admin`). Ask the owners rather than guessing; mark guesses "to confirm".

## Git / deploy
- The owners asked (Nov 2026) for updates to be pushed straight to `main` — Vercel deploys from `main`.
  Run `npm run check` and `npm run build` first; never push a broken build.

## Conventions
- English UI, Italian room names in `nameIt`. Euros. Metric. Dates ISO.
- The `example-living-room` (`content/rooms/_example.json`) is a template showing a fully designed room; it is hidden from
  real lists. Delete it once a real room is fully designed.
