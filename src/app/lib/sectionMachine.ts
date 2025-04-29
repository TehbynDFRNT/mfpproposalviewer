export type SectionId =
  | 'customer-info-section'
  | 'pool-selection-section'
  | 'filtration-maintenance-section'
  | 'concrete-paving-section'
  | 'fencing-section'
  | 'retaining-walls-section'
  | 'water-feature-section'
  | 'add-ons-section'
  | 'site-requirements-section';

/** one *logical* step per scroll tick */
export type Step = 
  | { section: 'customer-info-section' }
  | { section: 'pool-selection-section', sub: 0 }   // Pool Details
  | { section: 'pool-selection-section', sub: 1 }   // ColourGuard
  | { section: 'site-requirements-section', sub: 0 } // Installation Pricing
  | { section: 'site-requirements-section', sub: 1 } // Installation Details
  | { section: 'filtration-maintenance-section' }   // Pool Filtration
  | { section: 'concrete-paving-section' }          // Concrete & Paving
  | { section: 'fencing-section' }
  | { section: 'retaining-walls-section' }
  | { section: 'water-feature-section' }
  | { section: 'add-ons-section' };

/** ordered array drives progress bar & canGoNext/Prev */
export const STEPS: Step[] = [
  { section: 'customer-info-section' },

  { section: 'pool-selection-section', sub: 0 },
  { section: 'pool-selection-section', sub: 1 },
  
  { section: 'site-requirements-section', sub: 0 }, // Installation Pricing
  { section: 'site-requirements-section', sub: 1 }, // Installation Details
  
  { section: 'filtration-maintenance-section' },   // Pool Filtration

  { section: 'concrete-paving-section' },          // Concrete & Paving
  { section: 'fencing-section' },
  { section: 'retaining-walls-section' },
  { section: 'water-feature-section' },
  { section: 'add-ons-section' },
];

export type State = { index: number }            // index in STEPS array
export const current = (s: State) => STEPS[s.index];
export const canGoNext = (s: State) => s.index < STEPS.length - 1;
export const canGoPrev = (s: State) => s.index > 0;
export function next(s: State): State { return {...s, index: s.index + 1}; }
export function prev(s: State): State { return {...s, index: s.index - 1}; }
export const initialState: State = { index: 0 };