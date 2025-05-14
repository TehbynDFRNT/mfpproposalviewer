// scripts/optimize-pool-images.js
import fs from 'fs/promises';
import path from 'path';
import fg from 'fast-glob';
import sharp from 'sharp';

const SRC = 'public/Pools/Pool-Hero/Raw';
const OUT = 'public/Pools/Pool-Hero';

// Ensure output directory exists
await fs.mkdir(OUT, { recursive: true });

// Find all image files (jpg, jpeg, png, webp)
const files = await fg(['**/*.{jpg,jpeg,png,webp}'], { cwd: SRC });
console.log(`Found ${files.length} images to optimize`);

await Promise.all(files.map(async (rel) => {
  const src = path.join(SRC, rel);
  const dir = path.join(OUT, path.dirname(rel));
  await fs.mkdir(dir, { recursive: true });

  const base = path.parse(rel).name;
  console.log(`Processing ${base}`);
  
  const img = sharp(src);
  
  try {
    // Create webp version
    await img.clone()
      .resize(1200, 800, { fit: 'inside', withoutEnlargement: true }) // Resize to reasonable dimensions
      .toFormat('webp', { quality: 82 })
      .toFile(path.join(dir, base + '.webp'));
    console.log(`Created ${base}.webp`);

    // Create avif version
    await img.clone()
      .resize(1200, 800, { fit: 'inside', withoutEnlargement: true })
      .toFormat('avif', { quality: 50 })
      .toFile(path.join(dir, base + '.avif'));
    console.log(`Created ${base}.avif`);
  } catch (error) {
    console.error(`Error processing ${rel}:`, error);
  }
}));

console.log('Image optimization complete!');