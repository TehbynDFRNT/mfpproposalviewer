import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name using ESM-compatible approach
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the pools.json file
const poolsJsonPath = path.join(__dirname, '../docs/pools.json');

// Read the pools.json file
try {
  // Read the file
  const poolsData = JSON.parse(fs.readFileSync(poolsJsonPath, 'utf8'));
  
  // Process each pool to clean up the name
  poolsData.pools = poolsData.pools.map(pool => {
    // Original name for logging
    const originalName = pool.name;
    
    // Remove QLD and QLD- prefix
    let cleanedName = pool.name.replace(/^QLD-?/, '').trim();
    
    // Remove everything after and including the dash followed by dimensions
    // This pattern will match a dash or en dash followed by dimensions like "– 4.5m x 2.5m"
    cleanedName = cleanedName.replace(/\s+[–-]\s+[0-9.]+m.*$/i, '').trim();
    
    // Log the name change
    console.log(`Changed: "${originalName}" → "${cleanedName}"`);
    
    // Return the updated pool object with the cleaned name
    return {
      ...pool,
      name: cleanedName
    };
  });
  
  // Write the updated data back to the file
  fs.writeFileSync(
    poolsJsonPath,
    JSON.stringify(poolsData, null, 2), // Pretty print with 2 spaces
    'utf8'
  );
  
  console.log(`\nSuccessfully updated ${poolsData.pools.length} pool names in ${poolsJsonPath}`);
} catch (error) {
  console.error('Error processing pools.json:', error);
}