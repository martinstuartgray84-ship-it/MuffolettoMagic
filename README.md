# Casa Muffoletto

Private design & works headquarters for our house in Gratteri — every room, its current state, its target design,
colours and materials, the to-do / project / shopping lists, and print-ready briefs for decorators.

## Run locally
```bash
npm install
npm run dev        # http://localhost:3000
```

## Deploy (Vercel)
1. vercel.com → **Add New… → Project** → import this GitHub repo (framework: Next.js, no settings to change).
2. **Settings → Environment Variables**: add `SITE_PASSWORD` (and optionally `SITE_USER`, default `casa`).
   With it set, the whole site asks for that user/password. Redeploy after adding it.
3. Every push to the main branch redeploys automatically.

## Updating the content
Everything lives in `/content` (JSON) and `/public` (photos, plans). See `CLAUDE.md` — the easiest way is to send
photos, drawings and notes to Claude and let it update the files.

## Decorator PDFs
Open **Decorator briefs**, pick rooms (or the whole house), press **Download PDF** → “Save as PDF”.
