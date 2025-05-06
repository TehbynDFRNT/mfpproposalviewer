/**
 * File: /Users/tehbynnova/Code/MyProjects/Web/mfp/src/app/lib/layoutConstants.ts
 */
import { CATEGORY_IDS } from '@/app/lib/constants';

// Define sections that have subsections
export const SECTIONS_WITH_SUBSECTIONS = [
  CATEGORY_IDS.POOL_SELECTION,
  CATEGORY_IDS.SITE_REQUIREMENTS
];

// Direction reference (shared mutable ref) for animations
export const lastDir: { current: 1 | -1 } = { current: 1 }; // +1 = down, -1 = up

// Constants for scroll behavior
export const MIN_DELTA = 10; // ignore jitter below this threshold
export const SCROLL_COOLDOWN_MS = 1200; // debounce time for scroll events