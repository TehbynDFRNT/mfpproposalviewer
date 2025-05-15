'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import type { ProposalSnapshot } from '@/types/snapshot';
import * as SM from '@/lib/sectionMachine';
import { lastDir } from '@/lib/layoutConstants';
import { 
  findNextAvailableStepIndex, 
  findPrevAvailableStepIndex, 
  getAvailableSectionsForSelect 
} from '@/lib/utils';

/**
 * Hook to manage section navigation state in the proposal viewer
 * 
 * @param snapshot The proposal data
 * @param categoryNames Object containing display names for categories
 * @param steps Optional array of navigation steps (defaults to SM.STEPS)
 * @param showOnlyNonNull Whether to only include sections with data (default: true)
 * @returns Navigation state and handlers
 */
export function useSectionMachine(
  snapshot: ProposalSnapshot,
  categoryNames: Record<string, string>,
  steps: ReadonlyArray<SM.Step> = SM.STEPS,
  showOnlyNonNull = true
) {
  // Current state of the section machine
  const [machine, setMachine] = useState<SM.State>(SM.initialState);
  
  // Ref for the scrollable content container
  const scrollRef = useRef<HTMLDivElement>(null);

  // Extract current section and subsection from machine state
  const currentStep = SM.current(machine);
  const activeSection = currentStep.section;
  const subIndex = 'sub' in currentStep ? currentStep.sub : 0;

  // Handler for section selection change (e.g. from dropdown)
  const handleSelect = useCallback((newSection: string) => {
    const idx = steps.findIndex(s => s.section === newSection);
    if (idx < 0 || idx === machine.index) return;
    
    // Set direction for animation
    const dir = idx > machine.index ? 1 : -1;
    lastDir.current = dir;
    
    // Update state machine index
    setMachine({ index: idx });
  }, [machine.index, steps]);

  // Determine if we can navigate to the previous section
  const canPrev = useMemo(() => {
    if (showOnlyNonNull) {
      return findPrevAvailableStepIndex(machine.index, snapshot, steps) !== -1;
    }
    return SM.canGoPrev(machine);
  }, [machine.index, snapshot, steps, showOnlyNonNull]);

  // Determine if we can navigate to the next section
  const canNext = useMemo(() => {
    if (showOnlyNonNull) {
      return findNextAvailableStepIndex(machine.index, snapshot, steps) !== -1;
    }
    return SM.canGoNext(machine);
  }, [machine.index, snapshot, steps, showOnlyNonNull]);

  // Handler for navigating to the previous section
  const goPrev = useCallback(() => {
    if (!canPrev) return;
    
    // Set direction for animation
    lastDir.current = -1;
    
    if (showOnlyNonNull) {
      // Find previous non-empty section
      const idx = findPrevAvailableStepIndex(machine.index, snapshot, steps);
      if (idx !== -1) {
        setMachine({ index: idx });
      }
    } else {
      // Regular prev navigation
      setMachine(SM.prev(machine));
    }
  }, [canPrev, machine, snapshot, steps, showOnlyNonNull]);

  // Handler for navigating to the next section
  const goNext = useCallback(() => {
    if (!canNext) return;
    
    // Set direction for animation
    lastDir.current = 1;
    
    if (showOnlyNonNull) {
      // Find next non-empty section
      const idx = findNextAvailableStepIndex(machine.index, snapshot, steps);
      if (idx !== -1) {
        setMachine({ index: idx });
      }
    } else {
      // Regular next navigation
      setMachine(SM.next(machine));
    }
  }, [canNext, machine, snapshot, steps, showOnlyNonNull]);

  // Reset scroll position when changing sections
  useEffect(() => {
    const timer = setTimeout(() => {
      // Try to scroll the container
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ top: 0 });
      } else {
        // Fallback to window scroll
        window.scrollTo({ top: 0 });
      }
    }, 500); // slight delay to allow for animation
    
    return () => clearTimeout(timer);
  }, [machine.index]);

  // Calculate progress percentage
  const progressPercent = ((machine.index + 1) / steps.length) * 100;

  // Get available sections for dropdown
  const availableSections = useMemo(
    () => getAvailableSectionsForSelect(snapshot, steps, categoryNames, showOnlyNonNull),
    [snapshot, steps, categoryNames, showOnlyNonNull]
  );

  // Function to reset scroll position
  const resetScroll = useCallback(() => {
    // desktop: left column scroll frame
    if (scrollRef.current) scrollRef.current.scrollTo({ top: 0 });
    // mobile / fallback
    if (typeof window !== 'undefined') window.scrollTo({ top: 0 });
  }, []);

  return {
    machine,
    scrollRef,
    activeSection,
    subIndex,
    availableSections,
    handleSelect,
    canPrev,
    canNext,
    goPrev,
    goNext,
    progressPercent,
    resetScroll
  };
}