/**
 * File: /Users/tehbynnova/Code/MyProjects/Web/mfp/src/app/lib/animation.ts
 */
/* ─── timing constants ──────────────────────────────────────────────── */
export const F_OUT   = 0.35;      // section & visual fade-out
export const F_IN    = 0.45;      // fade-in duration
export const STAGGER = 0.15;      // delay before content column flies in

// Use dramatically longer durations for subsection transitions
// These need to be much slower because the total visual transition includes:
// fade-out + scroll reset + fade-in (which happens quickly within the same section)
export const SUB_F_OUT = 1.1;    // subsection fade-out (very slow for smooth subsection exit)
export const SUB_F_IN  = 1.5;    // subsection fade-in (very slow for gradual appearance)

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

/** 3 Sub-card fade for subsection changes - now MUCH SLOWER than main section transitions */
export const subCardFade = {
  enter: { 
    opacity: 1, 
    transition: { 
      duration: SUB_F_IN, 
      ease: [0.2, 0.0, 0.0, 1.0] // Custom cubic-bezier for very gradual start, smooth end
    } 
  },  
  exit: { 
    opacity: 0, 
    transition: { 
      duration: SUB_F_OUT, 
      ease: [0.4, 0.0, 0.2, 1.0] // Custom cubic-bezier for smoother exit
    } 
  },
  initial: { opacity: 0 }
};