#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the pool details from the file
const poolDetailsPath = path.join(__dirname, '../src/types/pool-details.ts');
const poolDetailsContent = fs.readFileSync(poolDetailsPath, 'utf8');

// Extract image paths using regex
const heroImageRegex = /heroImage: ['"]([^'"]+)['"]/g;
const layoutImageRegex = /layoutImage: ['"]([^'"]+)['"]/g;

const heroImages = [];
const layoutImages = [];
let match;

// Extract hero images
while ((match = heroImageRegex.exec(poolDetailsContent)) !== null) {
  heroImages.push(match[1]);
}

// Extract layout images
while ((match = layoutImageRegex.exec(poolDetailsContent)) !== null) {
  layoutImages.push(match[1]);
}

// Check if images exist
const publicDir = path.join(__dirname, '../public');
const missingHeroImages = [];
const missingLayoutImages = [];

// Check hero images
heroImages.forEach(imagePath => {
  const fullPath = path.join(publicDir, imagePath);
  if (!fs.existsSync(fullPath)) {
    missingHeroImages.push(imagePath);
  }
});

// Check layout images
layoutImages.forEach(imagePath => {
  const fullPath = path.join(publicDir, imagePath);
  if (!fs.existsSync(fullPath)) {
    missingLayoutImages.push(imagePath);
  }
});

// Print results
console.log('== Image Check Results ==');
console.log(`\nTotal Hero Images: ${heroImages.length}`);
console.log(`Total Layout Images: ${layoutImages.length}`);

if (missingHeroImages.length > 0) {
  console.log('\nMissing Hero Images:');
  missingHeroImages.forEach(img => console.log(` - ${img}`));
} else {
  console.log('\nAll Hero Images exist! ✅');
}

if (missingLayoutImages.length > 0) {
  console.log('\nMissing Layout Images:');
  missingLayoutImages.forEach(img => console.log(` - ${img}`));
} else {
  console.log('\nAll Layout Images exist! ✅');
}

// Print image variants check
const webpVariants = heroImages.filter(img => img.endsWith('.webp')).length;
const avifVariants = heroImages.filter(img => img.endsWith('.avif')).length;

console.log('\nHero Image Formats:');
console.log(` - WEBP: ${webpVariants}`);
console.log(` - AVIF: ${heroImages.length - webpVariants}`);

// Check for special cases for Infinity pools
const specialCases = [
  { name: 'Infinity 3', codePath: '/Pools/Pool-Hero/infinity-3-hero.webp', actualPath: '/Pools/Pool-Hero/infinity-3.0m-hero.webp' },
  { name: 'Infinity 4', codePath: '/Pools/Pool-Hero/infinity-4-hero.webp', actualPath: '/Pools/Pool-Hero/infinity-4.0-hero.webp' },
  { name: 'Terrace 3', codePath: '/Pools/Pool-Hero/terrace-3-hero.webp', actualPath: null }
];

console.log('\nPotential Special Cases:');
specialCases.forEach(({ name, codePath, actualPath }) => {
  if (missingHeroImages.includes(codePath) && actualPath) {
    const actualFullPath = path.join(publicDir, actualPath);
    const exists = fs.existsSync(actualFullPath);
    console.log(` - ${name}: ${codePath} is missing, but ${actualPath} ${exists ? 'exists' : 'also missing'}`);
  }
});