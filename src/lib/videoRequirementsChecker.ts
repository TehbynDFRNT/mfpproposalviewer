/**
 * Utilities for handling 3D render status and requirements
 */
import type { ProposalSnapshot } from '@/types/snapshot';
import type { VideoRecord } from '@/types/video';
import { CATEGORY_IDS } from '@/lib/constants';
import { isSectionEmpty } from '@/lib/utils';

/**
 * Checks if all required videos are present for a complete 3D render set
 * 
 * @param videos Array of video records from the database
 * @param snapshot The proposal snapshot data
 * @returns boolean indicating if all required videos are present
 */
export function areAllRequiredVideosPresent(
  videos: VideoRecord[],
  snapshot: ProposalSnapshot
): boolean {
  if (!videos || !Array.isArray(videos) || videos.length === 0) {
    console.log('No videos found');
    return false;
  }

  // Core sections are always required
  const coreRequiredSections = [
    CATEGORY_IDS.POOL_SELECTION,
    CATEGORY_IDS.FILTRATION_MAINTENANCE,
    CATEGORY_IDS.PROPOSAL_SUMMARY
  ];

  // Optional sections - only include if they're not empty
  const optionalSections = [
    CATEGORY_IDS.CONCRETE_PAVING,
    CATEGORY_IDS.FENCING,
    CATEGORY_IDS.RETAINING_WALLS,
    CATEGORY_IDS.WATER_FEATURE,
    CATEGORY_IDS.ADD_ONS
  ];

  // Filter to include only non-empty optional sections
  const nonEmptyOptionalSections = optionalSections.filter(
    section => !isSectionEmpty(section, snapshot)
  );

  // Log which optional sections are included
  console.log('Non-empty optional sections:', nonEmptyOptionalSections);

  // Combine core and non-empty optional sections
  const requiredSections = [...coreRequiredSections, ...nonEmptyOptionalSections];
  console.log('Total required sections:', requiredSections.length);

  // Create a set of available video types
  const availableTypes = new Set(videos.map(video => video.video_type));

  // Log information for debugging
  console.log('Required sections:', requiredSections);
  console.log('Available types:', Array.from(availableTypes));

  // Check if all required sections have videos
  const allSectionsComplete = requiredSections.every(section => availableTypes.has(section));
  console.log('All sections complete:', allSectionsComplete);

  return allSectionsComplete;
}

/**
 * Updates the render status in the database
 * Functions related to updating the render status should be added here
 */