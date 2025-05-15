/**
 * File: /Users/tehbynnova/Code/MyProjects/Web/mfp/src/app/lib/constants.ts
 * 
 * Application-wide constants for the proposal viewer
 */

// Define category IDs in order of user interest
export const CATEGORY_IDS = {
  CUSTOMER_INFO: 'customer-info-section',
  POOL_SELECTION: 'pool-selection-section',
  FILTRATION_MAINTENANCE: 'filtration-maintenance-section',
  CONCRETE_PAVING: 'concrete-paving-section',
  FENCING: 'fencing-section',
  RETAINING_WALLS: 'retaining-walls-section',
  WATER_FEATURE: 'water-feature-section',
  ADD_ONS: 'add-ons-section',
  SITE_REQUIREMENTS: 'site-requirements-section',
  PROPOSAL_SUMMARY: 'proposal-summary-section',
};

// Mapping IDs to names
export const CATEGORY_NAMES: { [key: string]: string } = {
  [CATEGORY_IDS.CUSTOMER_INFO]: 'Welcome',
  [CATEGORY_IDS.POOL_SELECTION]: 'Pool Selection',
  [CATEGORY_IDS.FILTRATION_MAINTENANCE]: 'Pool Filtration',
  [CATEGORY_IDS.SITE_REQUIREMENTS]: 'Pool Installation',
  [CATEGORY_IDS.CONCRETE_PAVING]: 'Concrete & Paving',
  [CATEGORY_IDS.RETAINING_WALLS]: 'Retaining Walls',
  [CATEGORY_IDS.FENCING]: 'Fencing',
  [CATEGORY_IDS.WATER_FEATURE]: 'Water Feature',
  [CATEGORY_IDS.ADD_ONS]: 'Extras & Upgrades',
  [CATEGORY_IDS.PROPOSAL_SUMMARY]: 'Proposal Summary',
};