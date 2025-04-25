// scripts/optimize-images.js
import fs from 'fs/promises';
import path from 'path';
import fg from 'fast-glob';
import sharp from 'sharp';

const SRC = 'public/images_raw';
const OUT = 'public/_opt';

await fs.mkdir(OUT, { recursive: true });
const files = await fg(['**/*.{jpg,jpeg,png}'], { cwd: SRC });

await Promise.all(files.map(async rel => {
  const src = path.join(SRC, rel);
  const dir = path.join(OUT, path.dirname(rel));
  await fs.mkdir(dir, { recursive: true });

  const base = path.parse(rel).name;
  const img  = sharp(src);

  await img.toFormat('webp', { quality: 82 })
           .toFile(path.join(dir, base + '.webp'));

  await img.toFormat('avif', { quality: 50 })
           .toFile(path.join(dir, base + '.avif'));
}));