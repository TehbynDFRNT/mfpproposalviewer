import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name using ESM-compatible approach
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to pool-details.ts file
const poolDetailsPath = path.join(__dirname, '../src/app/lib/types/pool-details.ts');

// Read the pool-details.ts file
try {
  const poolDetailsContent = fs.readFileSync(poolDetailsPath, 'utf8');
  
  // Update all paths that use _layout to use -layout instead
  const updatedContent = poolDetailsContent.replace(/layoutImage: '\/Pools\/Pool-Layout\/(\w+)(_layout\.webp)'/g, 
    (match, poolName, ext) => {
      const newPath = `layoutImage: '/Pools/Pool-Layout/${poolName}-layout.webp'`;
      console.log(`Updated: ${match} → ${newPath}`);
      return newPath;
    }
  );

  // Write the updated file
  fs.writeFileSync(poolDetailsPath, updatedContent, 'utf8');
  
  console.log('\nSuccessfully updated all layout image paths in pool-details.ts');
} catch (error) {
  console.error('Error updating pool-details.ts:', error);
}