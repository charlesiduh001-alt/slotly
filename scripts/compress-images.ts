// Converts README screenshots from PNG to WebP, which keeps soft gradients
// smooth (palette PNGs band) at a fraction of the size. Removes the PNGs.
// Usage: npm run screenshots && npm run images:compress
import { readdirSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const DIR = "docs/screenshots";

async function main() {
  let before = 0;
  let after = 0;
  for (const file of readdirSync(DIR).filter((f) => f.endsWith(".png"))) {
    const path = join(DIR, file);
    const original = statSync(path).size;
    const webp = await sharp(path).webp({ quality: 84, effort: 6, smartSubsample: true }).toBuffer();
    writeFileSync(path.replace(/\.png$/, ".webp"), webp);
    unlinkSync(path);
    before += original;
    after += webp.length;
    console.log(`  ${file.padEnd(24)} ${(original / 1024).toFixed(0).padStart(5)} KB → ${(webp.length / 1024).toFixed(0).padStart(5)} KB`);
  }
  if (before) {
    console.log(`  ${"total".padEnd(24)} ${(before / 1024).toFixed(0).padStart(5)} KB → ${(after / 1024).toFixed(0).padStart(5)} KB (${Math.round((1 - after / before) * 100)}% smaller)`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
