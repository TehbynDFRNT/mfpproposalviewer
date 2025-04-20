export type SectionId =
  | 'customer-info-section'
  | 'pool-selection-section'
  | 'filtration-maintenance-section'
  | 'concrete-paving-section'
  | 'fencing-section'
  | 'water-feature-section'
  | 'add-ons-section'
  | 'retaining-walls-section'
  | 'electrical-section'
  | 'site-requirements-section';

/** one *logical* step per scroll tick */
export type Step = 
  | { section: 'customer-info-section' }
  | { section: 'pool-selection-section', sub: 0 }   // Pool Details
  | { section: 'pool-selection-section', sub: 1 }   // ColourGuard
  | { section: 'filtration-maintenance-section' }   // Filtration and Maintenance
  | { section: 'concrete-paving-section', sub: 1 }  // Cost Metrics
  | { section: 'fencing-section' }
  | { section: 'water-feature-section' }
  | { section: 'add-ons-section' }
  | { section: 'retaining-walls-section' }
  | { section: 'electrical-section' }
  | { section: 'site-requirements-section' };

/** ordered array drives progress bar & canGoNext/Prev */
export const STEPS: Step[] = [
  { section: 'customer-info-section' },

  { section: 'pool-selection-section', sub: 0 },
  { section: 'pool-selection-section', sub: 1 },
  
  { section: 'filtration-maintenance-section' },   // Filtration and Maintenance

  { section: 'concrete-paving-section', sub: 1 },  // Cost Metrics
  { section: 'fencing-section' },
  { section: 'water-feature-section' },
  { section: 'add-ons-section' },
  { section: 'retaining-walls-section' },
  { section: 'electrical-section' },
  { section: 'site-requirements-section' },
];

export type State = { index: number }            // index in STEPS array
export const current = (s: State) => STEPS[s.index];
export const canGoNext = (s: State) => s.index < STEPS.length - 1;
export const canGoPrev = (s: State) => s.index > 0;
export function next(s: State): State { return {...s, index: s.index + 1}; }
export function prev(s: State): State { return {...s, index: s.index - 1}; }
export const initialState: State = { index: 0 };