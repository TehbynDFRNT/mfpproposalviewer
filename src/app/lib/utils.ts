/**
 * File: /Users/tehbynnova/Code/MyProjects/Web/mfp/src/app/lib/utils.ts
 */
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { CATEGORY_IDS } from "./constants"
import type { ProposalSnapshot } from "./types/snapshot"
import type { Step } from "./sectionMachine"; // Make sure Step is exported from sectionMachine.ts
                                          // and SM.STEPS in sectionMachine.ts is typed as ReadonlyArray<Step>

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Checks if a proposal section is empty (has no relevant data).
 * This function is used by the 'only show non-null sections' filter.
 * Core sections are defined to always return `false` (i.e., they are never considered "empty" by this filter).
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
      // Show fencing section if either glass OR metal fencing has a non-zero cost
      const hasGlassFencing = snapshot.glass_fence_total_cost && snapshot.glass_fence_total_cost > 0;
      const hasMetalFencing = snapshot.metal_fence_total_cost && snapshot.metal_fence_total_cost > 0;
      return !hasGlassFencing && !hasMetalFencing;
    
    case CATEGORY_IDS.WATER_FEATURE:
      return !snapshot.water_feature_total_cost || snapshot.water_feature_total_cost === 0;
    
    case CATEGORY_IDS.RETAINING_WALLS:
      // Check if any of the 4 possible retaining walls have a non-zero cost
      const hasWall1 = snapshot.retaining_wall1_total_cost && snapshot.retaining_wall1_total_cost > 0;
      const hasWall2 = snapshot.retaining_wall2_total_cost && snapshot.retaining_wall2_total_cost > 0;
      const hasWall3 = snapshot.retaining_wall3_total_cost && snapshot.retaining_wall3_total_cost > 0;
      const hasWall4 = snapshot.retaining_wall4_total_cost && snapshot.retaining_wall4_total_cost > 0;
      
      return !hasWall1 && !hasWall2 && !hasWall3 && !hasWall4;
    
    case CATEGORY_IDS.ADD_ONS:
      // Check all add-on options: cleaner, heat pump, and blanket roller
      const hasCleaner = snapshot.cleaner_included && snapshot.cleaner_cost_price && snapshot.cleaner_cost_price > 0;
      const hasHeatPump = snapshot.include_heat_pump && 
                          ((snapshot.heat_pump_cost && snapshot.heat_pump_cost > 0) || 
                           (snapshot.heat_pump_install_cost && snapshot.heat_pump_install_cost > 0));
      const hasBlanketRoller = snapshot.include_blanket_roller && 
                               ((snapshot.blanket_roller_cost && snapshot.blanket_roller_cost > 0) || 
                                (snapshot.br_install_cost && snapshot.br_install_cost > 0));
      
      // Section is empty only if none of the add-ons are present
      return !hasCleaner && !hasHeatPump && !hasBlanketRoller;
    
    // Core sections that should always be shown, regardless of the filter state.
    // They are fundamental to the proposal flow.
    case CATEGORY_IDS.CUSTOMER_INFO:
    case CATEGORY_IDS.POOL_SELECTION:
    case CATEGORY_IDS.FILTRATION_MAINTENANCE:
    case CATEGORY_IDS.SITE_REQUIREMENTS:
    case CATEGORY_IDS.PROPOSAL_SUMMARY: // Proposal Summary should always be shown
      return false;
    
    default:
      // For any unhandled section, default to showing it to be safe.
      // You might want to log a warning for unhandled cases during development.
      console.warn(`isSectionEmpty: Unhandled sectionId "${sectionId}", defaulting to not empty.`);
      return false;
  }
}

/**
 * Finds the index of the next step in SM.STEPS that corresponds to a non-empty section.
 * @param currentIndex The current index in the SM.STEPS array.
 * @param snapshot The proposal snapshot data.
 * @param allSteps The complete array of steps (typically SM.STEPS).
 * @returns The index of the next available step, or -1 if no such step is found.
 */
export function findNextAvailableStepIndex(
  currentIndex: number,
  snapshot: ProposalSnapshot,
  allSteps: ReadonlyArray<Step> 
): number {
  for (let i = currentIndex + 1; i < allSteps.length; i++) {
    if (!isSectionEmpty(allSteps[i].section, snapshot)) {
      return i;
    }
  }
  return -1; // No next available (non-empty) step
}

/**
 * Finds the index of the previous step in SM.STEPS that corresponds to a non-empty section.
 * @param currentIndex The current index in the SM.STEPS array.
 * @param snapshot The proposal snapshot data.
 * @param allSteps The complete array of steps (typically SM.STEPS).
 * @returns The index of the previous available step, or -1 if no such step is found.
 */
export function findPrevAvailableStepIndex(
  currentIndex: number,
  snapshot: ProposalSnapshot,
  allSteps: ReadonlyArray<Step>
): number {
  for (let i = currentIndex - 1; i >= 0; i--) {
    if (!isSectionEmpty(allSteps[i].section, snapshot)) {
      return i;
    }
  }
  return -1; // No previous available (non-empty) step
}

/**
 * Generates a list of unique sections for the "Skip to" dropdown.
 * If `showOnlyNonNull` is true, empty sections (as determined by `isSectionEmpty`) are filtered out.
 * @param snapshot The proposal snapshot data.
 * @param allSteps The complete array of steps (typically SM.STEPS).
 * @param categoryNames A mapping of category IDs to their display names.
 * @param showOnlyNonNull A boolean flag to indicate whether to filter out empty sections.
 * @returns An array of objects with `id` and `name` for each available section.
 */
export function getAvailableSectionsForSelect(
  snapshot: ProposalSnapshot,
  allSteps: ReadonlyArray<Step>,
  categoryNames: Record<string, string>,
  showOnlyNonNull: boolean
): { id: string; name: string }[] {
  const sectionMap = new Map<string, string>();
  
  allSteps.forEach(step => {
    // Consider a section only once
    if (!sectionMap.has(step.section)) {
      if (showOnlyNonNull) {
        // If filter is active, only add non-empty sections
        if (!isSectionEmpty(step.section, snapshot)) {
          sectionMap.set(step.section, categoryNames[step.section] || step.section);
        }
      } else {
        // If filter is not active, add all sections
        sectionMap.set(step.section, categoryNames[step.section] || step.section);
      }
    }
  });
  
  return Array.from(sectionMap, ([id, name]) => ({ id, name }));
}