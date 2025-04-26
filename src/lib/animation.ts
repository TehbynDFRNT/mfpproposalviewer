/* ─── timing constants ──────────────────────────────────────────────── */
export const F_OUT   = 0.35;      // section & visual fade-out
export const F_IN    = 0.45;      // fade-in duration
export const STAGGER = 0.15;      // delay before content column flies in

/** 1 Both columns fade-out together */
export const fadeOut = { exit: { opacity: 0, transition: { duration: F_OUT } } };

/** 2 a  Visual column fades in first (no X-motion) */
export const visualIn = {
  enter:   { opacity: 1, transition: { duration: F_IN, ease: 'easeOut' } },
  initial: { opacity: 0 }
};

/** 2 b  Content column slides from left **after** STAGGER */
export const contentIn = {
  enter: {
    opacity: 1,
    x: 0,
    transition: { duration: F_IN, ease: 'easeOut', delay: STAGGER }
  },
  initial: { opacity: 0, x: -24 }
};

/** 3 Sub-card fade for subsection changes */
export const subCardFade = {
  enter: { opacity: 1, transition: { duration: 0.35 } },
  exit:  { opacity: 0, transition: { duration: 0.25 } },
  initial: { opacity: 0 }
};