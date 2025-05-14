import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name using ESM-compatible approach
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to files
const poolRangesPath = path.join(__dirname, '../docs/poolinternalnameranges.json');
const poolDetailsPath = path.join(__dirname, '../src/app/lib/types/pool-details.ts');

// Read the pool ranges data
const poolRanges = JSON.parse(fs.readFileSync(poolRangesPath, 'utf8'));

// Read the current pool-details.ts file
const poolDetailsFile = fs.readFileSync(poolDetailsPath, 'utf8');

// Generate pool detail entries for each pool in the ranges
function generatePoolDetails() {
  // Parse the pool ranges to generate entries
  let poolDetailsEntries = '';
  
  poolRanges.forEach(pool => {
    const name = pool.name;
    const range = pool.range;
    
    // Convert name to kebab-case for file naming
    const kebabName = name.toLowerCase().replace(/\s+/g, '-');
    
    // Skip if the pool is already in the file (basic check)
    if (poolDetailsFile.includes(`'${name}': {`)) {
      console.log(`Pool ${name} already exists in the file, skipping...`);
      return;
    }
    
    // Create template for new pool detail
    poolDetailsEntries += `  '${name}': {
    name: '${name}',
    description: 'The ${name} is part of our ${range} Series, featuring elegant proportions and quality construction to complement your outdoor space.',
    heroImage: '/Pools/Pool-Hero/${kebabName}-hero.webp',
    layoutImage: '/Pools/Pool-Layout/${kebabName}-layout.webp',
  },
`;
  });
  
  return poolDetailsEntries;
}

// Insert the new pool details into the file
function updatePoolDetailsFile() {
  // Find the position where pool details object starts
  const poolDetailsStart = poolDetailsFile.indexOf('export const POOL_DETAILS: Record<string, PoolDetail> = {');
  const poolDetailsOpenBrace = poolDetailsFile.indexOf('{', poolDetailsStart) + 1;
  
  // Find the position where pool details object ends
  const poolDetailsEnd = poolDetailsFile.indexOf('};', poolDetailsOpenBrace) + 1;
  
  // Split the file content
  const fileStart = poolDetailsFile.substring(0, poolDetailsOpenBrace);
  const fileEnd = poolDetailsFile.substring(poolDetailsEnd);
  
  // Get existing pool details
  const existingPoolDetails = poolDetailsFile.substring(poolDetailsOpenBrace, poolDetailsEnd - 1);
  
  // Generate new pool details
  const newPoolDetails = generatePoolDetails();
  
  // Create the updated file content
  const updatedFile = fileStart + '\n' + existingPoolDetails + newPoolDetails + fileEnd;
  
  // Write the updated file
  fs.writeFileSync(poolDetailsPath, updatedFile);
  
  console.log('Pool details file updated successfully!');
}

updatePoolDetailsFile();