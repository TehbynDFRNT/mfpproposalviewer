import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name using ESM-compatible approach
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IMAGES_DIR = path.join(__dirname, '../public/Pools/Pool-Layout');

// Process all images in the directory
function renamePoolImages() {
  try {
    const files = fs.readdirSync(IMAGES_DIR);
    
    console.log(`Found ${files.length} files to process`);
    
    let renameCount = 0;
    
    for (const file of files) {
      // Skip the Raw directory
      if (file === 'Raw') {
        continue;
      }
      
      // Check if the file contains "_layout" in the name
      if (!file.includes('_layout')) {
        console.log(`Skipping ${file} (not a layout image)`);
        continue;
      }
      
      // Replace "_layout" with "-hero" in the filename
      const newName = file.replace('_layout', '-layout');
      
      // Skip if already correctly named
      if (file === newName) {
        console.log(`Skipping ${file} (already correct)`);
        continue;
      }
      
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