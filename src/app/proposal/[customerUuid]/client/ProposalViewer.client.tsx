/**
 * File: /Users/tehbynnova/Code/MyProjects/Web/MFPProposalViewer/src/app/proposal/[customerUuid]/client/ProposalViewer.client.tsx
 */
'use client';

import React, { useState, useEffect } from 'react';
import type { ProposalSnapshot } from '@/types/snapshot';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from "@/components/ui/button";
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
  SiteRequirementsCards,
  ProposalSummaryCards
} from '@/components';
import AcceptProposalSuccessDialog from '@/components/modals/AcceptProposalSuccessDialog';
import ChangeRequestSuccessDialog from '@/components/modals/ChangeRequestSuccessDialog';
import { fadeOut, contentIn } from '@/lib/animation';
import { SECTIONS_WITH_SUBSECTIONS } from '@/lib/layoutConstants';
import { CATEGORY_IDS, CATEGORY_NAMES } from '@/lib/constants';

// Import our custom hooks
import { useSectionMachine } from '@/hooks/use-section-machine';
import { useGeocode } from '@/hooks/use-geocode';
import { useProposalAnalytics } from '@/hooks/use-proposal-analytics';
import { useProposalDialogs } from '@/hooks/use-proposal-dialogs';
import { useProposalRefresh } from '@/hooks/use-proposal-refresh';

export interface ProposalViewerProps {
  snapshot: ProposalSnapshot;
  onSnapshotUpdate?: () => Promise<void>;
}

export default function ProposalViewer({ snapshot: initialSnapshot, onSnapshotUpdate }: ProposalViewerProps) {
  // Use our proposal refresh hook to manage proposal data
  const { 
    snapshot: currentSnapshot, 
    isRefreshing, 
    refreshProposalData 
  } = useProposalRefresh(initialSnapshot);

  // Always show only non-null sections
  const showOnlyNonNullSections = true;

  // Use our section machine hook to manage navigation
  const {
    machine: machineState,
    scrollRef: scrollColumnRef,
    activeSection,
    subIndex: sub,
    availableSections: uniqueSections,
    handleSelect: handleSectionSelectChange,
    canPrev,
    canNext,
    goPrev,
    goNext,
    progressPercent,
    resetScroll
  } = useSectionMachine(currentSnapshot, CATEGORY_NAMES, undefined, showOnlyNonNullSections);

  // Use our proposal analytics hook to track view events
  useProposalAnalytics(currentSnapshot);

  // Use our dialog hooks to manage acceptance and change request dialogs
  const {
    // Accept dialog
    acceptOpen: acceptSuccessDialogOpen,
    setAcceptOpen: setAcceptSuccessDialogOpen,
    acceptDismissed: acceptDialogDismissed,
    setAcceptDismissed: setAcceptDialogDismissed,
    acceptStatus: acceptSuccessDialogStatus,
    acceptMessage: acceptSuccessDialogMessage,
    onAccept: handleProposalAccepted,
    handleAcceptedStatusClick,

    // Change request dialog
    changeOpen: changeSuccessDialogOpen,
    setChangeOpen: setChangeSuccessDialogOpen,
    changeDismissed: changeDialogDismissed,
    setChangeDismissed: setChangeDialogDismissed,
    changeStatus: changeSuccessDialogStatus,
    changeMessage: changeSuccessDialogMessage,
    onChange: handleChangeRequestSuccess,
    handleChangeRequestedStatusClick
  } = useProposalDialogs(currentSnapshot.proposal_status, refreshProposalData);

  // Handle proposal acceptance error
  const handleAcceptError = (errorMessage: string) => {
    handleProposalAccepted('error', errorMessage || 'There was an error accepting your proposal. Please try again.');
  };

  // Handle change request error
  const handleChangeRequestError = (errorMessage: string) => {
    handleChangeRequestSuccess('error', errorMessage || 'There was an error submitting your change request. Please try again.');
  };

  // Listen for change request success events (if needed)
  useEffect(() => {
    const handleChangeEvent = (event: CustomEvent) => {
      console.log('Change request submitted successfully:', event.detail.message);
      alert(event.detail.message);
    };

    window.addEventListener('requestChangesSuccess', handleChangeEvent as EventListener);
    return () => {
      window.removeEventListener('requestChangesSuccess', handleChangeEvent as EventListener);
    };
  }, []);

  // Prepare address for geocoding
  const fullAddress = currentSnapshot.site_address ?? currentSnapshot.home_address;
  const homeAddress = currentSnapshot.home_address;
  const formattedAddress = (fullAddress ?? '').trim().replace(/\s+/g, ' ');
  const addressToGeocode = formattedAddress || fullAddress || homeAddress;

  // Use our geocode hook only when on the customer info section
  const shouldGeocode = activeSection === CATEGORY_IDS.CUSTOMER_INFO;
  const { 
    isLoaded, 
    location: mapCenter 
  } = useGeocode(
    shouldGeocode ? addressToGeocode : null, 
    { 
      fallbackLocation: { lat: -31.9523, lng: 115.8613 } // Perth, Australia
    }
  );

  return (
    <div className="relative flex min-h-screen flex-col bg-[#07032D] proposal-background">
      {/* --- Header --- */}
      <Header />

      {/* --- Main Content Area --- */}
      <main className="flex flex-col lg:flex-row flex-1 pt-16 lg:pb-16 overscroll-none">
        {/* Left Column - Scrollable Content */}
        <div 
          ref={scrollColumnRef}
          className="order-2 lg:order-1 w-full lg:w-1/3 proposal-left pb-5 lg:pb-0 lg:sticky lg:top-16 lg:h-[calc(100vh-8rem)] lg:overflow-y-auto proposal-content relative"
        >
          <AnimatePresence 
            mode="wait"
            onExitComplete={resetScroll}
          >
            {Object.entries(CATEGORY_IDS).map(([, id]) => {
              if (activeSection !== id) return null; // render only the current one
              const isMultiCardSection = SECTIONS_WITH_SUBSECTIONS.includes(id);

              return (
                <motion.div
                  key={id}
                  variants={{ ...fadeOut, ...contentIn }}
                  initial="initial"
                  animate="enter"
                  exit="exit"
                  className="major-section w-full flex flex-col p-8 pb-8 lg:pb-0 overflow-hidden"
                >
                  {/* Render Header conditionally */}
                  <div className="transition-opacity duration-300 ease-in-out opacity-100">
                    {id === CATEGORY_IDS.CUSTOMER_INFO ? (
                      <h2 className="header-welcome font-bold font-sans text-white text-2xl lg:text-3xl">
                        Welcome <span className="header-owners text-2xl lg:text-3xl !text-[#DB9D6A]">
                          {currentSnapshot.owner1.split(' ')[0]} {currentSnapshot.owner2 ? `& ${currentSnapshot.owner2.split(' ')[0]}` : ''}
                        </span>
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
                            {/* No specific pill for summary, or create a new one if needed */}
                          </span>
                        </div>
                        
                        {/* Section heading */}
                        <h2 className="font-bold font-sans text-white text-xl lg:text-3xl">
                          {id === CATEGORY_IDS.POOL_SELECTION ? 
                            'Your Selected Pool' : 
                            id === CATEGORY_IDS.CONCRETE_PAVING ? 
                              'Concrete & Paving' : 
                              // Default to CATEGORY_NAMES for all others
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
                            {/* No specific pill for summary */}
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
                              snapshot={currentSnapshot}
                            />
                          )}
                          
                          {/* Pool Installation Subsections */}
                          {id === CATEGORY_IDS.SITE_REQUIREMENTS && (
                            <SiteRequirementsCards
                              subIndex={sub}
                              snapshot={currentSnapshot}
                            />
                          )}
                        </AnimatePresence>
                      )}
                    </>
                  ) : (
                    // --- Single Card/Content Sections ---
                    <div
                      data-subsection-index={0}
                      className="subsection-content w-full min-h-[80vh] py-4 pb-8 lg:pb-0 transition-opacity duration-300 ease-in-out opacity-100"
                    >
                      {id === CATEGORY_IDS.CUSTOMER_INFO ? (
                        <CustomerInfoCards snapshot={currentSnapshot} />
                      ) : id === CATEGORY_IDS.FILTRATION_MAINTENANCE ? (
                        <FiltrationMaintenanceCards snapshot={currentSnapshot} />
                      ) : id === CATEGORY_IDS.CONCRETE_PAVING ? (
                        <ConcretePavingCards snapshot={currentSnapshot} />
                      ) : id === CATEGORY_IDS.FENCING ? (
                        <FencingCards snapshot={currentSnapshot} />
                      ) : id === CATEGORY_IDS.RETAINING_WALLS ? (
                        <RetainingWallCards snapshot={currentSnapshot} />
                      ) : id === CATEGORY_IDS.WATER_FEATURE ? (
                        <WaterFeatureCards snapshot={currentSnapshot} />
                      ) : id === CATEGORY_IDS.ADD_ONS ? (
                        <AddOnCards snapshot={currentSnapshot} />
                      ) : id === CATEGORY_IDS.PROPOSAL_SUMMARY ? (
                        <ProposalSummaryCards snapshot={currentSnapshot} />
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
          <div className="sticky bottom-0 left-0 right-0 p-4 pt-2 backdrop-blur-sm border-t border-border/50 z-10 shadow-sm transition-all duration-200">
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
                  onClick={goPrev}
                  disabled={!canPrev}
                >
                  <ChevronUp className="h-5 w-5 text-[#DB9D6A]" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-full bg-white" 
                  onClick={goNext}
                  disabled={!canNext}
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
          snapshot={currentSnapshot}
          resetScroll={resetScroll}
          use3DVisuals={currentSnapshot.render_ready === true}
        />
      </main>
      
      {/* --- Footer --- */}
      <Footer
        snapshot={currentSnapshot}
        activeSection={activeSection}
        uniqueSections={uniqueSections}
        handleSectionSelectChange={handleSectionSelectChange}
        progressPercent={progressPercent}
        machineState={machineState}
        onProposalAccepted={handleProposalAccepted}
        onAcceptedStatusClick={handleAcceptedStatusClick}
        onChangeRequestedStatusClick={handleChangeRequestedStatusClick}
        canGoPrev={() => canPrev}
        canGoNext={() => canNext}
        handlePrev={goPrev}
        handleNext={goNext}
      />
      
      {/* Success Dialogs */}
      <AcceptProposalSuccessDialog
        isOpen={acceptSuccessDialogOpen}
        onClose={() => {
          setAcceptSuccessDialogOpen(false);
          setAcceptDialogDismissed(true);
        }}
        status={acceptSuccessDialogStatus}
        message={acceptSuccessDialogMessage}
      />
      
      <ChangeRequestSuccessDialog
        isOpen={changeSuccessDialogOpen}
        onClose={() => {
          setChangeSuccessDialogOpen(false);
          setChangeDialogDismissed(true);
        }}
        status={changeSuccessDialogStatus}
        message={changeSuccessDialogMessage}
        snapshot={currentSnapshot}
      />
    </div>
  );
}