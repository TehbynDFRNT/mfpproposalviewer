'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as SM from '@/state/sectionMachine';
import { useJsApiLoader } from '@react-google-maps/api';
import type { ProposalData } from '@/types/proposal';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Zap, Filter, Droplet, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Header,
  Footer,
  SectionJumpSelect,
  VisualColumn,
  CustomerInfoCards, 
  FiltrationMaintenanceCards, 
  ConcretePavingCards, 
  FencingCards, 
  RetainingWallCards, 
  WaterFeatureCards, 
  AddOnCards,
  PoolSelectionCards,
  SiteRequirementsCards
} from './components';
import { fadeOut, contentIn } from '@/lib/animation';
import { lastDir, SECTIONS_WITH_SUBSECTIONS } from '@/lib/layoutConstants';
import { CATEGORY_IDS, CATEGORY_NAMES } from './ProposalViewer.constants';

export interface ProposalViewerProps { initialData: ProposalData }
export default function ProposalViewer({ initialData }: ProposalViewerProps) {
  const proposalData = initialData;
  const [machineState, setMachineState] = useState<SM.State>(SM.initialState);
  const [, setDir] = useState<1 | -1>(1);   // +1 = forward, -1 = back, state needed for handlers
  const currentStep = SM.current(machineState);
  const activeSection = currentStep.section;
  const sub = 'sub' in currentStep ? currentStep.sub : 0;
  const scrollColumnRef = useRef<HTMLDivElement | null>(null); // Ref for the scrollable container

  // Prepare data for the select dropdown (unique sections)
  const uniqueSections = React.useMemo(() => {
    const sectionMap = new Map<string, string>();
    SM.STEPS.forEach(step => {
      // Use the section ID from the step
      const sectionId = step.section;
      if (!sectionMap.has(sectionId)) {
        // Use CATEGORY_NAMES for display, fall back to the ID if not found
        sectionMap.set(sectionId, CATEGORY_NAMES[sectionId] || sectionId);
      }
    });
    // Convert the map to an array of objects for easier mapping
    return Array.from(sectionMap, ([id, name]) => ({ id, name }));
  }, []); // Empty dependency array means this runs only once

  // Prepare address string for geocoding (using full address)
  const customerAddress = proposalData.customerInfo.propertyDetails.fullAddress;
  // Load Google Maps API
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: ['places'],
  });
  // Map center state
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);
  // Geocode when Customer Info section becomes active
  useEffect(() => {
    if (isLoaded && activeSection === CATEGORY_IDS.CUSTOMER_INFO) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: customerAddress }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const loc = results[0].geometry.location;
          setMapCenter({ lat: loc.lat(), lng: loc.lng() });
        }
      });
    }
  }, [isLoaded, activeSection, customerAddress]);

const handleSectionSelectChange = useCallback((newSectionId: string) => {
  const currentIndex = machineState.index;
  // Find the index of the *first* step belonging to the selected section
  const targetIndex = SM.STEPS.findIndex(step => step.section === newSectionId);

  if (targetIndex !== -1 && targetIndex !== currentIndex) {
    // Determine direction for animation based on index change
    const direction: 1 | -1 = targetIndex > currentIndex ? 1 : -1;
    setDir(direction);
    lastDir.current = direction; // Update shared ref for animation variants

    // Update the state machine directly to the target index
    setMachineState({ index: targetIndex });
  }
}, [machineState.index]); // Dependency ensures closure captures the current index
  
  // Safety fallback for scroll reset on any step change
  useEffect(() => {
    const t = setTimeout(resetScroll, 500);  // slight > exit duration
    return () => clearTimeout(t);
  }, [machineState.index]);

  // Compute section-based progress using machine state
  const progressPercent = ((machineState.index + 1) / SM.STEPS.length) * 100;
  
  // Helper function to reset scroll position
  const resetScroll = () => {
    // desktop: left column scroll frame
    if (scrollColumnRef.current) scrollColumnRef.current.scrollTo({ top: 0 });
    // mobile / fallback
    if (typeof window !== 'undefined') window.scrollTo({ top: 0 });
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-[#07032D] proposal-background"> {/* Changed to flex-col for header/main/footer layout */}
      {/* --- Header --- */}
      <Header />
      
      {/* --- Main Content Area --- */}
      {/* flex-1 makes this grow to fill space between header/footer */}
      {/* pt-16/pb-16 account for fixed header/footer height */}
      <main className="flex flex-col lg:flex-row flex-1 pt-16 lg:pb-16 overscroll-none">
        {/* Left Column - Scrollable Content */}
        <div ref={scrollColumnRef}
          className="order-2 lg:order-1 w-full lg:w-1/3 proposal-left pb-5 lg:pb-0 lg:sticky lg:top-16 lg:h-[calc(100vh-8rem)] lg:overflow-y-auto proposal-content relative"> {/* Ensure relative positioning */}
          <AnimatePresence 
            mode="wait"
            onExitComplete={resetScroll}>
            {Object.entries(CATEGORY_IDS).map(([, id]) => {
              if (activeSection !== id) return null;      // render only the current one

              const isMultiCardSection = SECTIONS_WITH_SUBSECTIONS.includes(id);

              return (
                <motion.div
                  key={id}
                  variants={{ ...fadeOut, ...contentIn }} /* fadeOut on exit, contentIn on enter */
                  initial="initial"
                  animate="enter"
                  exit="exit"
                  className="major-section w-full flex flex-col p-8 pb-8 lg:pb-0 overflow-hidden"
                >
                {/* Render Header conditionally */}
                <div className="transition-opacity duration-300 ease-in-out opacity-100">
                  {id === CATEGORY_IDS.CUSTOMER_INFO ? (
                    <h2 className="header-welcome font-bold font-sans text-white text-2xl lg:text-3xl">
                      Welcome <span className="header-owners text-2xl lg:text-3xl !text-[#DB9D6A]">{proposalData.customerInfo.owner1.split(' ')[0]} & {proposalData.customerInfo.owner2?.split(' ')[0]}</span>
                    </h2>
                  ) : (
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      {/* Pill on mobile - above heading */}
                      <div className="flex mb-2 lg:hidden">
                        <span className="inline-block text-xs font-medium px-2 py-1 rounded-full bg-[#DB9D6A]/80 text-white self-start">
                          {(id === CATEGORY_IDS.POOL_SELECTION || id === CATEGORY_IDS.FILTRATION_MAINTENANCE || 
                             id === CATEGORY_IDS.SITE_REQUIREMENTS) && 'Base Pool & Inclusions'}
                          {(id === CATEGORY_IDS.FENCING || id === CATEGORY_IDS.CONCRETE_PAVING || 
                             id === CATEGORY_IDS.WATER_FEATURE || id === CATEGORY_IDS.RETAINING_WALLS) && 'Poolscape Options'}
                          {id === CATEGORY_IDS.ADD_ONS && 'Extras & Upgrades'}
                        </span>
                      </div>
                      
                      {/* Section heading */}
                      <h2 className="font-bold font-sans text-white text-xl lg:text-3xl">
                        {id === CATEGORY_IDS.POOL_SELECTION ? 
                          'Your Selected Pool' : 
                          id === CATEGORY_IDS.CONCRETE_PAVING ? 
                            'Concrete & Paving' : 
                            CATEGORY_NAMES[id]
                        }
                      </h2>
                      
                      {/* Pill on desktop - to the right */}
                      <div className="hidden lg:flex">
                        <span className="inline-block text-xs font-medium px-2 py-1 rounded-full bg-[#DB9D6A]/80 text-white">
                          {(id === CATEGORY_IDS.POOL_SELECTION || id === CATEGORY_IDS.FILTRATION_MAINTENANCE || 
                             id === CATEGORY_IDS.SITE_REQUIREMENTS) && 'Base Pool & Inclusions'}
                          {(id === CATEGORY_IDS.FENCING || id === CATEGORY_IDS.CONCRETE_PAVING || 
                             id === CATEGORY_IDS.WATER_FEATURE || id === CATEGORY_IDS.RETAINING_WALLS) && 'Poolscape Options'}
                          {id === CATEGORY_IDS.ADD_ONS && 'Extras & Upgrades'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* --- Content Area --- */}
                {isMultiCardSection ? (
                  <>
                    {/* Render MULTIPLE cards with better transitions */}
                    {(id === CATEGORY_IDS.POOL_SELECTION || id === CATEGORY_IDS.SITE_REQUIREMENTS) && (
                      <AnimatePresence mode="wait" onExitComplete={resetScroll}>
                        {/* Pool Selection Subsections */}
                        {id === CATEGORY_IDS.POOL_SELECTION && (
                          <PoolSelectionCards
                            subIndex={sub}
                            data={proposalData.poolSelection}
                          />
                        )}
                        
                        {/* Pool Installation Subsections */}
                        {id === CATEGORY_IDS.SITE_REQUIREMENTS && (
                          <SiteRequirementsCards
                            subIndex={sub}
                            site={proposalData.siteRequirements}
                            pool={proposalData.poolSelection}
                            electrical={proposalData.electrical}
                          />
                        )}
                      </AnimatePresence>
                    )}
                  </>
                ) : (
                  // --- Single Card/Content Sections ---
                  <div
                    ref={null}
                    data-subsection-index={0}
                    className="subsection-content w-full min-h-[80vh] py-4 pb-8 lg:pb-0 transition-opacity duration-300 ease-in-out opacity-100"
                  >
                    {id === CATEGORY_IDS.CUSTOMER_INFO ? (
                      <CustomerInfoCards data={proposalData.customerInfo} />
                    ) : id === CATEGORY_IDS.FILTRATION_MAINTENANCE ? (
                      <FiltrationMaintenanceCards />
                    ) : id === CATEGORY_IDS.CONCRETE_PAVING ? (
                      <ConcretePavingCards 
                        data={proposalData.concreteAndPaving} 
                      />
                    ) : id === CATEGORY_IDS.FENCING ? (
                      <FencingCards data={proposalData.fencing} />
                    ) : id === CATEGORY_IDS.RETAINING_WALLS ? (
                      <RetainingWallCards data={proposalData.retainingWalls} />
                    ) : id === CATEGORY_IDS.WATER_FEATURE ? (
                      <WaterFeatureCards data={proposalData.waterFeature} />
                    ) : id === CATEGORY_IDS.ADD_ONS ? (
                      <AddOnCards data={proposalData.addOns} />
                    ) : (
                      // Generic placeholder for other single-content sections
                      <Card className="w-full h-full p-5 overflow-y-auto">
                        <CardContent>
                          <p>Content for {CATEGORY_NAMES[id]} goes here.</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
                
              </motion.div>
            );
          })}
          </AnimatePresence>

          {/* --- Section Navigation Select --- */}
          <div className="sticky bottom-0 left-0 right-0 p-4 pt-2 backdrop-blur-sm border-t border-border/50 z-10 shadow-sm transition-all duration-200"> {/* Container with enhanced styling */}
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-[#DB9D6A]">Skip to:</span>
                <SectionJumpSelect
                  value={activeSection}
                  sections={uniqueSections}
                  onChange={handleSectionSelectChange}
                />
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-full bg-white" 
                  onClick={() => {
                    if (SM.canGoPrev(machineState)) {
                      // Use setMachineState directly for direct index handling
                      setDir(-1);
                      lastDir.current = -1;
                      setMachineState(SM.prev(machineState));
                    }
                  }}
                  disabled={!SM.canGoPrev(machineState)}
                >
                  <ChevronUp className="h-5 w-5 text-[#DB9D6A]" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-full bg-white" 
                  onClick={() => {
                    if (SM.canGoNext(machineState)) {
                      // Use setMachineState directly for direct index handling
                      setDir(1);
                      lastDir.current = 1;
                      setMachineState(SM.next(machineState));
                    }
                  }}
                  disabled={!SM.canGoNext(machineState)}
                >
                  <ChevronDown className="h-5 w-5 text-[#DB9D6A]" />
                </Button>
              </div>
            </div>
          </div>
          {/* --- End Section Navigation Select --- */}
        </div>
        
        
        {/* Visual Column (Right Column) */}
        <VisualColumn
          activeSection={activeSection}
          subIndex={sub}
          isLoaded={isLoaded}
          mapCenter={mapCenter}
          proposalData={proposalData}
          resetScroll={resetScroll}
        />
      </main>
      
      {/* --- Footer --- */}
      <Footer
        activeSection={activeSection}
        uniqueSections={uniqueSections}
        handleSectionSelectChange={handleSectionSelectChange}
        progressPercent={progressPercent}
        machineState={machineState}
        canGoPrev={SM.canGoPrev}
        canGoNext={SM.canGoNext}
        handlePrev={() => { 
          if (SM.canGoPrev(machineState)) { 
            lastDir.current=-1; 
            setDir(-1); 
            setMachineState(SM.prev(machineState)); 
          } 
        }}
        handleNext={() => { 
          if (SM.canGoNext(machineState)) { 
            lastDir.current=1; 
            setDir(1); 
            setMachineState(SM.next(machineState)); 
          } 
        }}
      />
    </div>
  );
}