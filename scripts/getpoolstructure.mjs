// Script to extract the pool_projects structure and save to JSON
// Run with: node extract-pool-structure.mjs

import { createClient } from '@supabase/supabase-js';
import { writeFile } from 'fs/promises';
import { join } from 'path';

// Using the public anon key from the codebase
const SUPABASE_URL = "https://mapshmozorhiewusdgor.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hcHNobW96b3JoaWV3dXNkZ29yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk3NTg5ODksImV4cCI6MjA1NTMzNDk4OX0.u6finPJTpAMxHYHEE3yVLqtlbuwIAIy4d94Wf_kx4wA";

// Initialize the Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Target customer ID
const targetCustomerId = "acec1f18-4af6-41d9-9b36-41aedf697d5f";

// Main extraction function
async function extractPoolProjectStructure() {
  console.log(`Extracting pool_projects structure for customer ID: ${targetCustomerId}...`);

  try {
    // Get the specific customer record
    const { data: poolProjects, error: projectError } = await supabase
      .from('pool_projects')
      .select('*')
      .eq('id', targetCustomerId)
      .single();

    if (projectError) {
      console.error('Error fetching pool project:', projectError);
      throw new Error('Failed to fetch the specified project: ' + projectError.message);
    }

    return poolProjects;
  } catch (error) {
    console.error('Unexpected error:', error);
    throw error;
  }
}

// Extract a pool specification
async function extractPoolSpecification(poolSpecId) {
  if (!poolSpecId) {
    console.log('No pool specification ID provided');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('pool_specifications')
      .select('*')
      .eq('id', poolSpecId)
      .single();

    if (error) {
      console.error('Error fetching pool specification:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching pool specification:', error);
    return null;
  }
}

// Extract pool costs
async function extractPoolCosts(poolId) {
  if (!poolId) {
    console.log('No pool ID provided for pool costs');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('pool_costs')
      .select('*')
      .eq('pool_id', poolId)
      .single();

    if (error) {
      console.error('Error fetching pool costs:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching pool costs:', error);
    return null;
  }
}

// Extract pool margins
async function extractPoolMargins(poolId) {
  if (!poolId) {
    console.log('No pool ID provided for pool margins');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('pool_margins')
      .select('*')
      .eq('pool_id', poolId)
      .single();

    if (error) {
      console.error('Error fetching pool margins:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching pool margins:', error);
    return null;
  }
}

// Extract filtration package
async function extractFiltrationPackage(packageId) {
  if (!packageId) {
    console.log('No filtration package ID provided');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('filtration_packages')
      .select(`
        *,
        pump:pump_id(*),
        filter:filter_id(*),
        light:light_id(*),
        sanitiser:sanitiser_id(*),
        handover_kit:handover_kit_id(*)
      `)
      .eq('id', packageId)
      .single();

    if (error) {
      console.error('Error fetching filtration package:', error);
      return null;
    }

    // If there's a handover kit, get its components
    if (data.handover_kit && data.handover_kit.id) {
      const { data: kitComponents, error: kitError } = await supabase
        .from('handover_kit_package_components')
        .select(`
          *,
          component:component_id(*)
        `)
        .eq('package_id', data.handover_kit.id);

      if (!kitError && kitComponents) {
        data.handover_kit.components = kitComponents;
      }
    }

    return data;
  } catch (error) {
    console.error('Error fetching filtration package:', error);
    return null;
  }
}

// Get electrical requirements
async function extractElectricalRequirements(poolId, customerId) {
  if (!poolId || !customerId) {
    console.log('No pool or customer ID provided for electrical requirements');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('pool_electrical_requirements')
      .select('*')
      .eq('pool_id', poolId)
      .eq('customer_id', customerId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('No electrical requirements found');
        return null;
      }
      console.error('Error fetching electrical requirements:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching electrical requirements:', error);
    return null;
  }
}

// Get fencing information
async function extractFencingInfo(poolId, customerId) {
  if (!poolId || !customerId) {
    console.log('No pool or customer ID provided for fencing');
    return null;
  }

  const fencing = {
    framelessGlass: null,
    flatTopMetal: null
  };

  try {
    // Get frameless glass fencing
    const { data: framelessData, error: framelessError } = await supabase
      .from('frameless_glass_fencing')
      .select('*')
      .eq('pool_id', poolId)
      .eq('customer_id', customerId)
      .single();

    if (!framelessError) {
      fencing.framelessGlass = framelessData;
    }

    // Get flat top metal fencing
    const { data: flatTopData, error: flatTopError } = await supabase
      .from('flat_top_metal_fencing')
      .select('*')
      .eq('pool_id', poolId)
      .eq('customer_id', customerId)
      .single();

    if (!flatTopError) {
      fencing.flatTopMetal = flatTopData;
    }

    return fencing;
  } catch (error) {
    console.error('Error fetching fencing info:', error);
    return fencing;
  }
}

// Get water feature
async function extractWaterFeature(poolId, customerId) {
  if (!poolId || !customerId) {
    console.log('No pool or customer ID provided for water feature');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('pool_water_features')
      .select('*')
      .eq('pool_id', poolId)
      .eq('customer_id', customerId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('No water feature found');
        return null;
      }
      console.error('Error fetching water feature:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching water feature:', error);
    return null;
  }
}

// Get fixed costs
async function extractFixedCosts() {
  try {
    const { data, error } = await supabase
      .from('fixed_costs')
      .select('*')
      .order('display_order');

    if (error) {
      console.error('Error fetching fixed costs:', error);
      return [];
    }

    return data;
  } catch (error) {
    console.error('Error fetching fixed costs:', error);
    return [];
  }
}

// Get all reference tables
async function extractReferenceTables() {
  const referenceTables = {};
  
  try {
    // Get crane costs
    const { data: craneCosts, error: craneError } = await supabase
      .from('crane_costs')
      .select('*')
      .limit(5);
      
    if (!craneError) {
      referenceTables.craneCosts = craneCosts;
    }
    
    // Get bobcat costs
    const { data: bobcatCosts, error: bobcatError } = await supabase
      .from('bobcat_costs')
      .select('*')
      .limit(5);
      
    if (!bobcatError) {
      referenceTables.bobcatCosts = bobcatCosts;
    }
    
    // Get traffic control costs
    const { data: trafficControlCosts, error: trafficError } = await supabase
      .from('traffic_control_costs')
      .select('*')
      .limit(5);
      
    if (!trafficError) {
      referenceTables.trafficControlCosts = trafficControlCosts;
    }
    
    // Get concrete cuts
    const { data: concreteCuts, error: cutsError } = await supabase
      .from('concrete_cuts')
      .select('*')
      .limit(5);
      
    if (!cutsError) {
      referenceTables.concreteCuts = concreteCuts;
    }
    
    // Get extra paving costs
    const { data: extraPavingCosts, error: pavingError } = await supabase
      .from('extra_paving_costs')
      .select('*')
      .limit(5);
      
    if (!pavingError) {
      referenceTables.extraPavingCosts = extraPavingCosts;
    }
    
    // Get retaining walls
    const { data: retainingWalls, error: wallsError } = await supabase
      .from('retaining_walls')
      .select('*')
      .limit(5);
      
    if (!wallsError) {
      referenceTables.retainingWalls = retainingWalls;
    }
    
    return referenceTables;
  } catch (error) {
    console.error('Error fetching reference tables:', error);
    return referenceTables;
  }
}

// Main function to run the extraction
async function run() {
  try {
    console.log('Starting pool project structure extraction...');
    
    // Get the pool project
    const poolProject = await extractPoolProjectStructure();
    console.log('Pool project retrieved, ID:', poolProject.id);
    
    // Get the pool specification
    const poolSpec = await extractPoolSpecification(poolProject.pool_specification_id);
    
    // Get pool costs
    const poolCosts = poolSpec ? await extractPoolCosts(poolSpec.id) : null;
    
    // Get pool margins
    const poolMargins = poolSpec ? await extractPoolMargins(poolSpec.id) : null;
    
    // Get the filtration package if pool spec has one
    let filtrationPackage = null;
    if (poolSpec && poolSpec.default_filtration_package_id) {
      filtrationPackage = await extractFiltrationPackage(poolSpec.default_filtration_package_id);
    }
    
    // Get electrical requirements
    const electricalRequirements = await extractElectricalRequirements(
      poolProject.pool_specification_id, 
      poolProject.id
    );
    
    // Get fencing information
    const fencingInfo = await extractFencingInfo(
      poolProject.pool_specification_id,
      poolProject.id
    );
    
    // Get water feature
    const waterFeature = await extractWaterFeature(
      poolProject.pool_specification_id,
      poolProject.id
    );
    
    // Get fixed costs
    const fixedCosts = await extractFixedCosts();
    
    // Get reference tables
    const referenceTables = await extractReferenceTables();
    
    // Compile all data
    const completeStructure = {
      poolProject: poolProject,
      poolSpecification: poolSpec,
      poolCosts: poolCosts,
      poolMargins: poolMargins,
      filtrationPackage: filtrationPackage,
      electricalRequirements: electricalRequirements,
      fencing: fencingInfo,
      waterFeature: waterFeature,
      fixedCosts: fixedCosts,
      referenceTables: referenceTables,
      timestamp: new Date().toISOString(),
      note: "Extracted using Supabase public key for structure reference."
    };
    
    // Save to file
    const outputPath = 'pool-project-structure-comprehensive.json';
    await writeFile(outputPath, JSON.stringify(completeStructure, null, 2));
    console.log(`Structure saved to ${outputPath}`);
    
    return completeStructure;
  } catch (error) {
    console.error('Error in extraction:', error);
  }
}

// Run the extraction
run();