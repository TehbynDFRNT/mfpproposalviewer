'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react'; // Import useCallback
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button"; // Import Button
import { Mail, MessageSquare, Phone } from 'lucide-react'; // Import icons
import { Separator } from "@/components/ui/separator";

// Define category IDs in order of user interest
const CATEGORY_IDS = {
  CUSTOMER_INFO: 'customer-info-section',
  POOL_SELECTION: 'pool-selection-section',
  CONCRETE_PAVING: 'concrete-paving-section',
  FENCING: 'fencing-section',
  WATER_FEATURE: 'water-feature-section',
  ADD_ONS: 'add-ons-section',
  RETAINING_WALLS: 'retaining-walls-section',
  ELECTRICAL: 'electrical-section',
  SITE_REQUIREMENTS: 'site-requirements-section',
};

// Mapping IDs to names
const CATEGORY_NAMES: { [key: string]: string } = {
  [CATEGORY_IDS.CUSTOMER_INFO]: 'Customer Information',
  [CATEGORY_IDS.POOL_SELECTION]: 'Pool Selection',
  [CATEGORY_IDS.SITE_REQUIREMENTS]: 'Site Requirements',
  [CATEGORY_IDS.CONCRETE_PAVING]: 'Concrete & Paving',
  [CATEGORY_IDS.RETAINING_WALLS]: 'Retaining Walls',
  [CATEGORY_IDS.FENCING]: 'Fencing',
  [CATEGORY_IDS.ELECTRICAL]: 'Electrical',
  [CATEGORY_IDS.WATER_FEATURE]: 'Water Feature',
  [CATEGORY_IDS.ADD_ONS]: 'Optional Add-ons',
};

export const dynamic = 'force-dynamic';

export default function ProposalPage({ params }: { params: { proposalId: string } }) {
  const [activeSection, setActiveSection] = useState<string | null>(CATEGORY_IDS.CUSTOMER_INFO);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const rightColumnRef = useRef<HTMLDivElement | null>(null); // Ref for the scrollable container

  // Callback function for Intersection Observer
  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    let bestVisibleSection: string | null = null;
    let maxVisibleRatio = 0;

    entries.forEach(entry => {
      if (entry.isIntersecting && entry.intersectionRatio > maxVisibleRatio) {
          maxVisibleRatio = entry.intersectionRatio;
          bestVisibleSection = entry.target.id;
      }
      // Fallback: if scrolling fast, the top-most intersecting element might be the best guess
      else if (entry.isIntersecting && !bestVisibleSection) {
          // Check if element is somewhat near the middle/top of the viewport
          const rect = entry.boundingClientRect;
          const viewportHeight = rightColumnRef.current?.clientHeight || window.innerHeight; // Use container height
           // Consider elements intersecting the top 60% of the viewport as potentially active
          if (rect.top >= 0 && rect.top < viewportHeight * 0.6) {
               if (entry.intersectionRatio > 0) { // Ensure it's at least somewhat visible
                   bestVisibleSection = entry.target.id;
                   // Don't update maxVisibleRatio here, prioritize the most visible one found earlier
               }
          }
      }
    });

    // Only update state if a section is determined to be visible
    // And only if the best visible section has changed from the current active one
    if (bestVisibleSection && bestVisibleSection !== activeSection) {
       setActiveSection(bestVisibleSection);
    }
    // If nothing is intersecting significantly, maybe keep the last active one
    // or default back to the top one if scrolled all the way up (needs more logic if desired)

  }, [activeSection]); // Depend on activeSection to prevent unnecessary updates if it hasn't changed

  // Setup Intersection Observer
  useEffect(() => {
    // Ensure execution only in the browser
    if (typeof window === 'undefined' || !rightColumnRef.current) {
        return;
    }
    observerRef.current = new IntersectionObserver(handleIntersection, {
      root: rightColumnRef.current, // Observe within the right column scroll container
      rootMargin: '-40% 0px -60% 0px', // Trigger when element is closer to the center/top of the viewport
      threshold: [0, 0.25, 0.5, 0.75, 1.0], // Multiple thresholds for better ratio calculation
    });

    const currentObserver = observerRef.current; // Capture observer instance

    // Observe all sections that have refs
    Object.values(sectionRefs.current).forEach(ref => {
      if (ref) {
        currentObserver.observe(ref);
      }
    });

    // Cleanup observer on component unmount
    return () => {
      const refs = sectionRefs.current; // Capture refs for cleanup
      const currentObserver = observerRef.current; // Capture observer for cleanup
      Object.values(refs).forEach(ref => {
        if (ref && currentObserver) { // Check if observer exists before unobserving
          currentObserver.unobserve(ref);
        }
      });
      if (currentObserver) {
        currentObserver.disconnect();
      }
      observerRef.current = null; // Also nullify the observer ref itself
    };
  // Re-run effect only if handleIntersection changes (due to activeSection dependency change)
  }, [handleIntersection]);

  // Callback ref to assign refs to section elements
  const assignRef = useCallback((node: HTMLDivElement | null, id: string) => {
    if (node) {
      sectionRefs.current[id] = node;
      // Re-observe if the observer exists and the ref was previously null or changed
       if (observerRef.current) {
         observerRef.current.observe(node);
       }
    } else {
      // Unobserve if the node is removed
      if (observerRef.current && sectionRefs.current[id]) {
         observerRef.current.unobserve(sectionRefs.current[id]!);
      }
      if (observerRef.current && sectionRefs.current[id]) {
         observerRef.current.unobserve(sectionRefs.current[id]!);
      }
      delete sectionRefs.current[id];
    }
  }, []); // Empty dependency array means this callback itself doesn't change

  return (
    <div className="relative flex min-h-screen flex-col"> {/* Changed to flex-col for header/main/footer layout */}
  {/* --- Header --- */}
  <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
    {/* Logo Placeholder */}
    <div className="flex items-center">
      <span className="font-semibold text-lg">MFP Pools</span> {/* Or your logo component */}
    </div>
    {/* Contact Icons */}
    <div className="flex items-center space-x-2">
      <Button variant="ghost" size="icon" aria-label="Email Us">
        <Mail className="h-5 w-5" />
      </Button>
      <Button variant="ghost" size="icon" aria-label="Chat With Us">
        <MessageSquare className="h-5 w-5" />
      </Button>
      <Button variant="ghost" size="icon" aria-label="Call Us">
        <Phone className="h-5 w-5" />
      </Button>
    </div>
  </header>
  
  {/* --- Main Content Area --- */}
  {/* flex-1 makes this grow to fill space between header/footer */}
  {/* pt-16/pb-16 account for fixed header/footer height */}
  <main className="flex flex-1 pt-16 pb-16">
      {/* Left Column */}
       <div className="w-2/3 sticky top-16 flex h-[calc(100vh-8rem)] flex-col items-center justify-center overflow-hidden bg-gray-100 dark:bg-gray-900">
{/* Visual placeholder now takes full height of the left column */}
        <div className="w-full h-full bg-gray-300 dark:bg-gray-700 rounded flex items-center justify-center">
           {/* Display active section name subtly or remove if visual replaces it entirely */}
           <p className="text-xl font-semibold opacity-50 p-4 absolute top-4 left-4 bg-background/80 rounded">
             {activeSection ? CATEGORY_NAMES[activeSection] : 'Overview'}
           </p>
           {/* TODO: Replace this div with the actual dynamic visual component */}
        </div>
      </div>

      {/* Right Column */}
      <div ref={rightColumnRef} className="w-1/3 h-[calc(100vh-8rem)] overflow-y-auto p-8 scroll-smooth border-l"> {/* Added border-l for visual separation */}
        <h1 className="text-3xl font-bold mb-6">Proposal Details for ID: {params.proposalId}</h1>

        {Object.entries(CATEGORY_IDS).map(([key, id], index, arr) => (
          <React.Fragment key={id}>
             {/* Assign ref using the callback */}
            <Card
              ref={(node) => assignRef(node, id)}
              id={id}
              className={cn(
                "transition-all duration-300 ease-out mb-8", // Added mb-8 here for consistent spacing
                activeSection === id ? "opacity-100 ring-2 ring-primary shadow-lg scale-[1.01]" : "opacity-60 scale-100" // Enhanced active style
              )}
              style={{ scrollMarginTop: `calc(50vh - 100px)` }} // Adjust scroll snap alignment
            >
              <CardHeader>
                <CardTitle>{CATEGORY_NAMES[id]}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Details for {CATEGORY_NAMES[id]} go here...</p>
                <div className="h-60"></div> {/* Adjusted dummy height */}
              </CardContent>
            </Card>
            {/* Add Separator unless it's the last item */}
            {index < arr.length - 1 && <Separator className="my-8" />}
          </React.Fragment>
        ))}
      </div>
    </main>
    
    {/* --- Footer --- */}
  <footer className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-end border-t bg-background px-4 md:px-6">
    <Button size="lg">Accept Quote</Button>
  </footer>
  </div>
  );
}