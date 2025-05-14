import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name using ESM-compatible approach
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IMAGES_DIR = path.join(__dirname, '../public/Pools/Pool-Layout');

// Fixes for specific pool layout names
const nameFixes = {
  '-kensington_layout.webp': 'kensington_layout.webp',
  '-kensington_layout.avif': 'kensington_layout.avif',
  '-portofino_layout.webp': 'portofino_layout.webp',
  '-portofino_layout.avif': 'portofino_layout.avif',
  '-verona_layout.webp': 'verona_layout.webp',
  '-verona_layout.avif': 'verona_layout.avif',
  'florentina_layout.webp': 'florentina_layout.webp',  // This name is correctly spelled in our data
  'florentina_layout.avif': 'florentina_layout.avif',
};

// Process all images in the directory
function renamePoolLayoutImages() {
  try {
    const files = fs.readdirSync(IMAGES_DIR);
    
    console.log(`Found ${files.length} files to process`);
    
    let renameCount = 0;
    
    for (const file of files) {
      // Skip files that don't need renaming
      if (!file.startsWith('-') && !nameFixes[file]) {
        console.log(`Skipping ${file} (already correct)`);
        continue;
      }
      
      // Get the new name
      const newName = nameFixes[file] || file.substring(1); // Remove leading dash if not in fixes
      const oldPath = path.join(IMAGES_DIR, file);
      const newPath = path.join(IMAGES_DIR, newName);
      
      // Rename the file
      fs.renameSync(oldPath, newPath);
      console.log(`Renamed: ${file} -> ${newName}`);
      renameCount++;
    }
    
    console.log(`Renamed ${renameCount} files`);
  } catch (error) {
    console.error('Error renaming files:', error);
  }
}

renamePoolLayoutImages();