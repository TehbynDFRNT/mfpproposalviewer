import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name using ESM-compatible approach
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IMAGES_DIR = path.join(__dirname, '../public/Pools/Pool-Hero/Raw');

// Fixes for specific pool names
const nameFixes = {
  '-kensington.jpg': 'kensington.jpg',
  '-portofino.jpg': 'portofino.jpg',
  '-verona.jpg': 'verona.jpg',
  'florentina.jpg': 'florentina.jpg',  // This name is correctly spelled in our data but incorrectly in the URL
};

// Process all images in the directory
function renamePoolImages() {
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

renamePoolImages();