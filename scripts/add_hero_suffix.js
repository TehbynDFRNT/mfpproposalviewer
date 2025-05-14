import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name using ESM-compatible approach
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IMAGES_DIR = path.join(__dirname, '../public/Pools/Pool-Hero/Raw');

// Process all images in the directory
function addHeroSuffix() {
  try {
    const files = fs.readdirSync(IMAGES_DIR);
    
    console.log(`Found ${files.length} files to process`);
    
    let renameCount = 0;
    
    for (const file of files) {
      // Skip if already has -hero in the name
      if (file.includes('-hero')) {
        console.log(`Skipping ${file} (already has -hero)`);
        continue;
      }
      
      // Add -hero before the extension
      const ext = path.extname(file);
      const basename = path.basename(file, ext);
      const newName = `${basename}-hero${ext}`;
      
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

addHeroSuffix();