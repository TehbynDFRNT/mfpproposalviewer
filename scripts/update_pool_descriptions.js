import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name using ESM-compatible approach
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths to files
const poolsJsonPath = path.join(__dirname, '../docs/pools.json');
const poolDetailsPath = path.join(__dirname, '../src/app/lib/types/pool-details.ts');

// Helper function to clean description text
function cleanDescription(description) {
  // Extract the first paragraph
  const firstParagraph = description.split('\n\n')[0].trim();
  
  // Sanitize for use in TypeScript string - escape quotes
  return firstParagraph.replace(/'/g, "\\'");
}

// Read and parse the pools.json file
try {
  const poolsData = JSON.parse(fs.readFileSync(poolsJsonPath, 'utf8'));
  let poolDetailsContent = fs.readFileSync(poolDetailsPath, 'utf8');
  
  // Create a map of pool names to descriptions from pools.json
  const descriptionMap = {};
  poolsData.pools.forEach(pool => {
    // Clean up the description - take just the first paragraph
    const cleanedDescription = cleanDescription(pool.description);
    descriptionMap[pool.name] = cleanedDescription;
  });
  
  // Find all the pool objects in the TypeScript file using regex
  // This regex will match pool entries in the TS file
  const poolObjectRegex = /'([^']+)':\s*{\s*name:\s*'([^']+)',\s*description:\s*'([^']+)',\s*heroImage:/g;
  
  let match;
  let updatedContent = poolDetailsContent;
  const updates = [];
  
  // Find all pool entries in the TypeScript file
  while ((match = poolObjectRegex.exec(poolDetailsContent)) !== null) {
    const [fullMatch, poolKey, poolName, currentDescription] = match;
    
    // Check if we have a matching pool name in pools.json
    if (descriptionMap[poolName]) {
      const newDescription = descriptionMap[poolName];
      
      // Only update if the description is different
      if (newDescription !== currentDescription) {
        // Create the updated pool entry with the new description
        const updatedPoolEntry = fullMatch.replace(
          `description: '${currentDescription}'`, 
          `description: '${newDescription}'`
        );
        
        // Replace the pool entry in the content
        updatedContent = updatedContent.replace(fullMatch, updatedPoolEntry);
        
        updates.push({
          name: poolName,
          old: currentDescription,
          new: newDescription
        });
      }
    }
  }
  
  // Write the updated content to the file
  if (updates.length > 0) {
    fs.writeFileSync(poolDetailsPath, updatedContent, 'utf8');
    
    console.log(`Updated descriptions for ${updates.length} pools:`);
    updates.forEach(update => {
      console.log(`\n${update.name}:`);
      console.log(` - OLD: "${update.old.substring(0, 80)}${update.old.length > 80 ? '...' : ''}"`);
      console.log(` - NEW: "${update.new.substring(0, 80)}${update.new.length > 80 ? '...' : ''}"`);
    });
  } else {
    console.log('No descriptions needed to be updated.');
  }
} catch (error) {
  console.error('Error updating pool descriptions:', error);
}