/**
 * File: src/lib/visualUtils.ts
 * 
 * Utility functions for working with visual elements in the VisualColumn component
 */
import { CATEGORY_IDS } from './constants';
import { isSectionEmpty } from './utils';
import { supabase } from './supabaseClient';
import type { ProposalSnapshot } from '@/types/snapshot';
import type { Visual, RenderVisual } from '@/components/VisualColumn/VisualColumn.types';

// Type for the raw 3D render data from Supabase
interface RenderData {
  video_type: string;
  video_path: string;
  created_at: string;
}

/**
 * Gets the default visual for a given section and sub-index
 */
export function getDefaultVisual(
  sectionId: string | null,
  subIndex: number,
  snapshot: ProposalSnapshot
): Visual {
  switch (sectionId) {
    case CATEGORY_IDS.CUSTOMER_INFO:
      return {
        type: 'map',
        address: snapshot.site_address ?? snapshot.home_address ?? ''
      };
    case CATEGORY_IDS.POOL_SELECTION:
      // Always show the placeholder video for all sub-indices in pool selection
      return {
        type: 'placeholder',
        name: 'Loading 3D Pool Model...',
        fallbackType: 'video',
        fallbackSrc: 'placeholder'
      };
    case CATEGORY_IDS.FILTRATION_MAINTENANCE:
      return {
        type: 'placeholder',
        name: 'Loading Filtration Visualization...',
        fallbackType: 'video',
        fallbackSrc: 'placeholder'
      };
    case CATEGORY_IDS.CONCRETE_PAVING:
      return {
        type: 'placeholder',
        name: 'Loading Paving Visualization...',
        fallbackType: 'video',
        fallbackSrc: 'placeholder'
      };
    case CATEGORY_IDS.FENCING:
      return {
        type: 'placeholder',
        name: 'Loading Fencing Visualization...',
        fallbackType: 'video',
        fallbackSrc: 'placeholder'
      };
    case CATEGORY_IDS.RETAINING_WALLS:
      return {
        type: 'placeholder',
        name: 'Loading Retaining Wall Visualization...',
        fallbackType: 'video',
        fallbackSrc: 'placeholder'
      };
    case CATEGORY_IDS.WATER_FEATURE:
      return {
        type: 'placeholder',
        name: 'Loading Water Feature Visualization...',
        fallbackType: 'video',
        fallbackSrc: 'placeholder'
      };
    case CATEGORY_IDS.ADD_ONS:
      return {
        type: 'placeholder',
        name: 'Loading Extras Visualization...',
        fallbackType: 'video',
        fallbackSrc: 'placeholder'
      };
    case CATEGORY_IDS.SITE_REQUIREMENTS:
      // Always directly return the FrannaCrane video - never show a placeholder for Site Requirements
      return {
        type: 'video',
        videoName: 'FrannaCrane',
        alt: 'Pool Installation'
      };
    case CATEGORY_IDS.PROPOSAL_SUMMARY:
      // Use placeholder video for the proposal summary
      return {
        type: 'placeholder',
        name: 'Loading Summary Visualization...',
        fallbackType: 'video',
        fallbackSrc: 'placeholder'
      };
    default:
      return { type: 'placeholder', name: 'Loading...' };
  }
}

/**
 * Helper to find a 3D render for a specific section
 */
export function find3DRender(
  sectionId: string | null,
  renders: RenderVisual[] | null,
  snapshot: ProposalSnapshot
): RenderVisual | null {
  // Early return if requirements aren't met
  if (!sectionId || !renders || !Array.isArray(renders) || renders.length === 0) {
    return null;
  }

  // Check if section is empty - only process non-empty sections or core sections
  if (sectionId !== CATEGORY_IDS.POOL_SELECTION &&
      sectionId !== CATEGORY_IDS.FILTRATION_MAINTENANCE &&
      sectionId !== CATEGORY_IDS.PROPOSAL_SUMMARY &&
      isSectionEmpty(sectionId, snapshot)) {
    // Don't process empty optional sections
    return null;
  }

  const render = renders.find(r => r.videoType === sectionId);
  if (!render) {
    return null;
  }

  return render;
}

/**
 * Central selector: site requirements, 3D override, map, or fallbacks.
 * Determines which visual to display based on section, availability of 3D renders,
 * and other factors.
 */
export function selectVisual(
  sectionId: string | null,
  subIndex: number,
  snapshot: ProposalSnapshot,
  use3DVisuals: boolean,
  renders: RenderVisual[] | null
): Visual {
  console.log('selectVisual called:', { sectionId, use3DVisuals, subIndex });
  // Special case for Site Requirements (always use FrannaCrane video)
  if (sectionId === CATEGORY_IDS.SITE_REQUIREMENTS) {
    return {
      type: 'video',
      videoName: 'FrannaCrane',
      alt: 'Pool Installation'
    };
  }

  // If 3D visuals are enabled, check if we have a 3D render for this section (except Customer Info)
  if (use3DVisuals && sectionId && sectionId !== CATEGORY_IDS.CUSTOMER_INFO) {
    const render = find3DRender(sectionId, renders, snapshot);
    if (render) {
      return render;
    }
  }

  // Otherwise use default visuals
  // Special case for customer info (always use map)
  if (sectionId === CATEGORY_IDS.CUSTOMER_INFO) {
    return {
      type: 'map',
      address: snapshot.site_address ?? snapshot.home_address ?? ''
    };
  }

  // For other sections, if 3D is enabled but no render is found, use placeholder
  // Otherwise use the normal defaults
  if (use3DVisuals && sectionId) {
    // Return placeholders with fallbacks when 3D is enabled but no render exists
    return getDefaultVisual(sectionId, subIndex, snapshot);
  }

  // When 3D is disabled, use the original visual content
  switch (sectionId) {
    case CATEGORY_IDS.POOL_SELECTION:
      return { type: 'video', videoName: 'placeholder' };
    case CATEGORY_IDS.FILTRATION_MAINTENANCE:
      return { type: 'video', videoName: 'placeholder', alt: 'Pool Filtration' };
    case CATEGORY_IDS.CONCRETE_PAVING:
      if (subIndex === 0) return { type: 'video', videoName: 'placeholder', alt: 'Paving Options' };
      if (subIndex === 1) return { type: 'video', videoName: 'placeholder', alt: 'Paving & Concrete Cost Metrics' };
      return { type: 'video', videoName: 'placeholder', alt: 'Paving & Concrete' };
    case CATEGORY_IDS.FENCING:
      return { type: 'video', videoName: 'placeholder', alt: 'Fencing' };
    case CATEGORY_IDS.RETAINING_WALLS:
      return { type: 'video', videoName: 'placeholder', alt: 'Retaining Walls' };
    case CATEGORY_IDS.WATER_FEATURE:
      return { type: 'video', videoName: 'placeholder', alt: 'Water Feature' };
    case CATEGORY_IDS.ADD_ONS:
      return { type: 'video', videoName: 'placeholder', alt: 'Extras & Upgrades' };
    case CATEGORY_IDS.PROPOSAL_SUMMARY:
      return { type: 'video', videoName: 'placeholder', alt: 'Proposal Summary' };
    default:
      return { type: 'placeholder', name: 'Loading...' };
  }
}