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
  
  // Find and fix the Elysian pool name
  poolsData.pools = poolsData.pools.map(pool => {
    if (pool.name === "Elysian– 8.3m x 3.3m") {
      console.log(`Fixing: "${pool.name}" → "Elysian"`);
      return {
        ...pool,
        name: "Elysian"
      };
    }
    return pool;
  });
  
  // Write the updated data back to the file
  fs.writeFileSync(
    poolsJsonPath,
    JSON.stringify(poolsData, null, 2), // Pretty print with 2 spaces
    'utf8'
  );
  
  console.log(`\nSuccessfully updated pools.json`);
} catch (error) {
  console.error('Error processing pools.json:', error);
}