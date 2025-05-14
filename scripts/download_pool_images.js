import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const poolData = require('../docs/pools.json');

// Get the directory name using ESM-compatible approach
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.join(__dirname, '../public/Pools/Pool-Hero/Raw');

// Ensure the output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Function to download an image
function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    console.log(`Downloading ${filename}...`);
    
    const outputPath = path.join(OUTPUT_DIR, filename);
    const file = fs.createWriteStream(outputPath);
    
    https.get(url, (response) => {
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded ${filename}`);
        resolve(outputPath);
      });
    }).on('error', (err) => {
      fs.unlink(outputPath, () => {}); // Delete the file if there was an error
      console.error(`Error downloading ${filename}:`, err.message);
      reject(err);
    });
  });
}

// Process all pools
async function downloadAllImages() {
  const downloads = [];
  
  poolData.pools.forEach((pool) => {
    // Extract just the pool name without dimensions and clean it up
    let poolName = pool.name.replace('QLD', '').replace('QLD-', '').trim();
    poolName = poolName.split('–')[0].trim(); // Remove dimensions if present in name
    
    // Generate a safe filename and add the file extension from the URL
    const fileExtension = path.extname(pool.imageUrl);
    const safeFileName = `${poolName.toLowerCase().replace(/\s+/g, '-')}${fileExtension}`;
    
    downloads.push(downloadImage(pool.imageUrl, safeFileName));
  });
  
  try {
    await Promise.all(downloads);
    console.log('All images downloaded successfully!');
  } catch (error) {
    console.error('Some downloads failed:', error);
  }
}

downloadAllImages();