// Resize raw photos from inbox/<room-slug>/* into public/photos/<room-slug>/NN.jpg
// and print JSON snippets to paste into content/rooms/<room>.json → "photos".
// Usage: npm run add-photos            (all folders in inbox/)
//        npm run add-photos -- kitchen (one room)
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const INBOX = path.join(ROOT, "inbox");
const OUT = path.join(ROOT, "public", "photos");
const only = process.argv[2];
const exts = new Set([".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif", ".tif", ".tiff"]);

const rooms = fs.readdirSync(INBOX, { withFileTypes: true })
  .filter((d) => d.isDirectory() && (!only || d.name === only)).map((d) => d.name);

for (const room of rooms) {
  const src = path.join(INBOX, room);
  const dst = path.join(OUT, room);
  fs.mkdirSync(dst, { recursive: true });
  let n = fs.readdirSync(dst).filter((f) => f.endsWith(".jpg")).length;
  const files = fs.readdirSync(src).filter((f) => exts.has(path.extname(f).toLowerCase())).sort();
  const added = [];
  for (const f of files) {
    n += 1;
    const name = String(n).padStart(2, "0") + ".jpg";
    try {
      await sharp(path.join(src, f)).rotate().resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 80, mozjpeg: true }).toFile(path.join(dst, name));
      fs.unlinkSync(path.join(src, f));
      added.push({ src: `/photos/${room}/${name}`, caption: "", kind: "current" });
    } catch (e) {
      n -= 1;
      console.error(`! could not process ${room}/${f}: ${e.message}`);
    }
  }
  if (added.length) {
    console.log(`\n${room}: ${added.length} photo(s)`);
    console.log(JSON.stringify(added, null, 2));
  }
}
