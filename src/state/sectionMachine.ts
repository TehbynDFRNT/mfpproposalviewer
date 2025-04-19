export type SectionId =
  | 'customer-info-section'
  | 'pool-selection-section'
  | 'concrete-paving-section'
  | 'fencing-section'
  | 'water-feature-section'
  | 'add-ons-section'
  | 'retaining-walls-section'
  | 'electrical-section'
  | 'site-requirements-section';

export type Step = { section: SectionId; sub: number }; // sub = card index

export const STEPS: Step[] = [
  { section: 'customer-info-section',     sub: 0 },
  { section: 'pool-selection-section',    sub: 0 }, // Pool Details
  { section: 'pool-selection-section',    sub: 1 }, // ColourGuard
  { section: 'concrete-paving-section',   sub: 0 },
  { section: 'fencing-section',           sub: 0 },
  { section: 'water-feature-section',     sub: 0 },
  { section: 'add-ons-section',           sub: 0 },
  { section: 'retaining-walls-section',   sub: 0 },
  { section: 'electrical-section',        sub: 0 },
  { section: 'site-requirements-section', sub: 0 },
];

export type State = { index: number }            // index in STEPS array
export const initialState: State = { index: 0 };

export function next(s: State): State {
  return { index: Math.min(s.index + 1, STEPS.length - 1) };
}

export function prev(s: State): State {
  return { index: Math.max(s.index - 1, 0) };
}

export const canGoNext = (s: State) => s.index < STEPS.length - 1;
export const canGoPrev = (s: State) => s.index > 0;

export const current = (s: State) => STEPS[s.index];