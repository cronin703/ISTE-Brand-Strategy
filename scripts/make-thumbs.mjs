// Builds small WebP previews of public/logos for the grid (run: npm run thumbs).
import { readdir, mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const src = "public/logos";
const out = "public/thumbs";
await mkdir(out, { recursive: true });
for (const file of await readdir(src)) {
  const name = path.parse(file).name;
  await sharp(path.join(src, file), { density: 200 })
    .resize({ width: 640, height: 400, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(path.join(out, `${name}.webp`));
}
console.log("thumbs written to", out);
