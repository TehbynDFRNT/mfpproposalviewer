/**
 * File: /Users/tehbynnova/Code/MyProjects/Web/mfp/src/app/lib/utils.ts
 */
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { CATEGORY_IDS } from "./constants"
import type { ProposalSnapshot } from "./types/snapshot"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Checks if a proposal section is empty (has no relevant data)
 */
export function isSectionEmpty(sectionId: string, snapshot: ProposalSnapshot): boolean {
  switch (sectionId) {
    case CATEGORY_IDS.CONCRETE_PAVING:
      return (
        (!snapshot.concrete_cuts_cost || snapshot.concrete_cuts_cost === 0) &&
        (!snapshot.extra_paving_cost || snapshot.extra_paving_cost === 0) &&
        (!snapshot.existing_paving_cost || snapshot.existing_paving_cost === 0) &&
        (!snapshot.extra_concreting_saved_total || snapshot.extra_concreting_saved_total === 0) &&
        (!snapshot.concrete_pump_total_cost || snapshot.concrete_pump_total_cost === 0) &&
        (!snapshot.uf_strips_cost || snapshot.uf_strips_cost === 0)
      );
    
    case CATEGORY_IDS.FENCING:
      return !snapshot.fencing_total_cost || snapshot.fencing_total_cost === 0;
    
    case CATEGORY_IDS.WATER_FEATURE:
      return !snapshot.water_feature_total_cost || snapshot.water_feature_total_cost === 0;
    
    case CATEGORY_IDS.RETAINING_WALLS:
      // Note: Would need the actual field for retaining walls total cost
      return false; // For now, always show retaining walls
    
    case CATEGORY_IDS.ADD_ONS:
      return (
        (!snapshot.cleaner_cost_price || snapshot.cleaner_cost_price === 0) &&
        (!snapshot.heating_total_cost || snapshot.heating_total_cost === 0)
      );
    
    // Core sections that should always be shown
    case CATEGORY_IDS.CUSTOMER_INFO:
    case CATEGORY_IDS.POOL_SELECTION:
    case CATEGORY_IDS.FILTRATION_MAINTENANCE:
    case CATEGORY_IDS.SITE_REQUIREMENTS:
      return false;
    
    default:
      return false; // Default to showing the section
  }
}
