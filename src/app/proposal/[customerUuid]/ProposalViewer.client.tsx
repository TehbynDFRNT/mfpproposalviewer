/**
 * File: /Users/tehbynnova/Code/MyProjects/Web/mfp/src/app/proposal/[customerUuid]/ProposalViewer.client.tsx
 */
'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import * as SM from '@/app/lib/sectionMachine';
import { useJsApiLoader } from '@react-google-maps/api';
import type { ProposalSnapshot } from '@/app/lib/types/snapshot';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Zap, Filter, Droplet, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { trackProposalViewed, identify } from '@/app/lib/jitsuClient';
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
import { fadeOut, contentIn } from '@/app/lib/animation';
import { lastDir, SECTIONS_WITH_SUBSECTIONS } from '@/app/lib/layoutConstants';
import { CATEGORY_IDS, CATEGORY_NAMES } from '@/app/lib/constants';
import { isSectionEmpty, findNextAvailableStepIndex, findPrevAvailableStepIndex, getAvailableSectionsForSelect } from '@/app/lib/utils';

export interface ProposalViewerProps {
  snapshot: ProposalSnapshot;
  onSnapshotUpdate?: () => Promise<void>;
}

export default function ProposalViewer({ snapshot, onSnapshotUpdate }: ProposalViewerProps) {
  // Current proposal data
  const [currentSnapshot, setCurrentSnapshot] = useState<ProposalSnapshot>(snapshot);
  const [machineState, setMachineState] = useState<SM.State>(SM.initialState);
  const [, setDir] = useState<1 | -1>(1);   // +1 = forward, -1 = back, state needed for handlers
  
  // Success dialog states
  const [acceptSuccessDialogOpen, setAcceptSuccessDialogOpen] = useState(false);
  const [acceptSuccessDialogStatus, setAcceptSuccessDialogStatus] = useState<'success' | 'error'>('success');
  const [acceptSuccessDialogMessage, setAcceptSuccessDialogMessage] = useState('');
  // Track if user has manually dismissed the dialog to prevent auto-reopening
  const [acceptDialogDismissed, setAcceptDialogDismissed] = useState(false);
  
  const [changeSuccessDialogOpen, setChangeSuccessDialogOpen] = useState(false);
  const [changeSuccessDialogStatus, setChangeSuccessDialogStatus] = useState<'success' | 'error'>('success');
  const [changeSuccessDialogMessage, setChangeSuccessDialogMessage] = useState('');
  // Track if user has manually dismissed the dialog to prevent auto-reopening
  const [changeDialogDismissed, setChangeDialogDismissed] = useState(false);
  // Always show only non-null sections
  const showOnlyNonNullSections = true;
  const currentStep = SM.current(machineState);
  const activeSection = currentStep.section;
  const sub = 'sub' in currentStep ? currentStep.sub : 0;
  const scrollColumnRef = useRef<HTMLDivElement | null>(null); // Ref for the scrollable container

  // Update local snapshot when prop changes
  useEffect(() => {
    setCurrentSnapshot(snapshot);
  }, [snapshot]);
  
  // Store snapshot in a ref to avoid dependency issues
  const snapshotRef = useRef(snapshot);
  
  // Use a ref to track if we've already sent the view event
  const hasTrackedRef = useRef(false);
  
  // Update ref when snapshot changes
  useEffect(() => {
    snapshotRef.current = snapshot;
  }, [snapshot]);
  
  // Track proposal view event only once on initial mount
  useEffect(() => {
    // Only track the view event once per session
    if (!hasTrackedRef.current) {
      hasTrackedRef.current = true;
      
      const currentSnapshot = snapshotRef.current;
      
      // First identify the user if customer email is available
      const customerEmail = currentSnapshot.customer_email;
      if (customerEmail) {
        // This is the real user identity for Jitsu
        identify(customerEmail, {
          name: currentSnapshot.customer_name,
          consultant: currentSnapshot.consultant_name,
          phone: currentSnapshot.customer_phone,
          address: currentSnapshot.home_address
        });
      }
      
      // Track the proposal viewed event in Jitsu
      trackProposalViewed(currentSnapshot.project_id, {
        pin_verified: true, // PIN was already verified if we're at this component
        customer_name: currentSnapshot.customer_name,
        consultant_name: currentSnapshot.consultant_name,
        pool_model: currentSnapshot.spec_name,
        proposal_created_at: currentSnapshot.created_at,
        proposal_last_modified: currentSnapshot.updated_at,
        source: 'proposal_viewer_mount', // Indicate this came from the ProposalViewer component
        proposal_status: currentSnapshot.proposal_status
      }, customerEmail); // Pass customer email as userId if available
      
      console.log('Tracked proposal view event');
    }
  }, []); // Empty dependency array ensures this only runs once on mount

  // Prepare data for the select dropdown (unique sections), only showing non-null sections
  const uniqueSections = useMemo(() => {
    return getAvailableSectionsForSelect(currentSnapshot, SM.STEPS, CATEGORY_NAMES, showOnlyNonNullSections);
  }, [currentSnapshot, showOnlyNonNullSections]); // Recompute if snapshot changes

  // Get address info from snapshot
  const fullAddress = currentSnapshot.site_address ?? currentSnapshot.home_address;
  const homeAddress = currentSnapshot.home_address;
  const formattedAddress = (fullAddress ?? '').trim().replace(/\s+/g, ' ');
  
  // Load Google Maps API
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: ['places'],
  });
  
  // Map center state
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);
  
  // Geocode when Customer Info section becomes active
  useEffect(() => {
    // Only run geocoding when Customer Info section is active and the API is loaded
    if (isLoaded && activeSection === CATEGORY_IDS.CUSTOMER_INFO) {
      // Choose which address to geocode (in order of preference)
      const addressToGeocode = formattedAddress || fullAddress || homeAddress;
      
      if (!addressToGeocode) {
        console.warn("No address found to geocode");
        // Use fallback if no address available
        setMapCenter({ lat: -31.9523, lng: 115.8613 }); // Perth, Australia
        return;
      }
      
      console.log("Geocoding address:", addressToGeocode);
      
      const geocoder = new window.google.maps.Geocoder();
      
      // Use more robust geocoding approach with region biasing for Australia
      geocoder.geocode(
        { 
          address: addressToGeocode,
          region: 'au', // Australia region biasing
          bounds: {
            north: -10.0, // Northern Australia approx
            south: -45.0, // Southern Australia approx
            east: 155.0,  // Eastern Australia approx
            west: 110.0   // Western Australia approx
          }
        }, 
        (results, status) => {
          if (status === 'OK' && results && results[0]) {
            const loc = results[0].geometry.location;
            console.log("Successfully geocoded to:", results[0].formatted_address);
            console.log("Coordinates:", { lat: loc.lat(), lng: loc.lng() });
            setMapCenter({ lat: loc.lat(), lng: loc.lng() });
          } else {
            console.error('Geocode was not successful:', status);
            // If the first address fails, try the home address as fallback (if different)
            if (homeAddress && homeAddress !== fullAddress) {
              console.log("Trying home address as fallback:", homeAddress);
              geocoder.geocode(
                { 
                  address: homeAddress,
                  region: 'au' // Australia region biasing
                }, 
                (results2, status2) => {
                  if (status2 === 'OK' && results2 && results2[0]) {
                    const loc = results2[0].geometry.location;
                    console.log("Successfully geocoded home address to:", results2[0].formatted_address);
                    setMapCenter({ lat: loc.lat(), lng: loc.lng() });
                  } else {
                    // Last resort fallback
                    console.error('Both geocoding attempts failed');
                    setMapCenter({ lat: -31.9523, lng: 115.8613 }); // Perth, Australia
                  }
                }
              );
            } else {
              // No home address fallback, use default
              setMapCenter({ lat: -31.9523, lng: 115.8613 }); // Perth, Australia
            }
          }
        }
      );
    }
  }, [isLoaded, activeSection, fullAddress, homeAddress, formattedAddress]);

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

  // Handle proposal acceptance
  const handleProposalAccepted = useCallback(async () => {
    console.log('Proposal accepted successfully');
    
    // Show success dialog
    setAcceptSuccessDialogStatus('success');
    setAcceptSuccessDialogMessage('Your proposal has been accepted! We will be in touch shortly to discuss next steps.');
    setAcceptDialogDismissed(false); // Reset dismissal flag when a new action is performed
    setAcceptSuccessDialogOpen(true);

    // Refresh snapshot data from server if callback provided
    if (onSnapshotUpdate) {
      try {
        await onSnapshotUpdate();
      } catch (error) {
        console.error('Error refreshing snapshot after acceptance:', error);
      }
    }
  }, [onSnapshotUpdate]);

  // Handle proposal acceptance error
  const handleAcceptError = useCallback((errorMessage: string) => {
    // Show error dialog
    setAcceptSuccessDialogStatus('error');
    setAcceptSuccessDialogMessage(errorMessage || 'There was an error accepting your proposal. Please try again.');
    setAcceptDialogDismissed(false); // Reset dismissal flag for error dialogs too
    setAcceptSuccessDialogOpen(true);
  }, []);

  // Handle change request success - uses same refresh mechanism as acceptance
  const handleChangeRequestSuccess = useCallback(async () => {
    console.log('Change request submitted successfully');
    
    // Show success dialog
    setChangeSuccessDialogStatus('success');
    setChangeSuccessDialogMessage('Your change request has been submitted successfully. Our team will review your request and get back to you soon.');
    setChangeDialogDismissed(false); // Reset dismissal flag when a new action is performed
    setChangeSuccessDialogOpen(true);

    // Refresh snapshot data from server if callback provided
    if (onSnapshotUpdate) {
      try {
        await onSnapshotUpdate();
      } catch (error) {
        console.error('Error refreshing snapshot after change request:', error);
      }
    }
  }, [onSnapshotUpdate]);

  // Handle change request error
  const handleChangeRequestError = useCallback((errorMessage: string) => {
    // Show error dialog
    setChangeSuccessDialogStatus('error');
    setChangeSuccessDialogMessage(errorMessage || 'There was an error submitting your change request. Please try again.');
    setChangeDialogDismissed(false); // Reset dismissal flag for error dialogs too
    setChangeSuccessDialogOpen(true);
  }, []);

  // Handle change request success events
  useEffect(() => {
    const handleChangeRequestSuccess = (event: CustomEvent) => {
      // You could add a toast notification library here,
      // or implement a simple notification system
      console.log('Change request submitted successfully:', event.detail.message);

      // For now, we'll use a simple alert
      // In a production app, you'd want to use a proper notification component
      alert(event.detail.message);
    };

    // Add event listener
    window.addEventListener('requestChangesSuccess', handleChangeRequestSuccess as EventListener);

    // Clean up
    return () => {
      window.removeEventListener('requestChangesSuccess', handleChangeRequestSuccess as EventListener);
    };
  }, []);

  // Compute section-based progress using machine state
  const progressPercent = ((machineState.index + 1) / SM.STEPS.length) * 100;
  
  // Helper function to reset scroll position
  const resetScroll = () => {
    // desktop: left column scroll frame
    if (scrollColumnRef.current) scrollColumnRef.current.scrollTo({ top: 0 });
    // mobile / fallback
    if (typeof window !== 'undefined') window.scrollTo({ top: 0 });
  };
  
  // Functions to handle status indicator button clicks in the footer
  const handleAcceptedStatusClick = useCallback(() => {
    setAcceptSuccessDialogStatus('success');
    setAcceptSuccessDialogMessage('Your proposal has been accepted! We will be in touch shortly to discuss next steps.');
    setAcceptDialogDismissed(false); // Reset dismissal flag when explicitly clicked from footer
    setAcceptSuccessDialogOpen(true);
  }, []);
  
  const handleChangeRequestedStatusClick = useCallback(() => {
    setChangeSuccessDialogStatus('success');
    setChangeSuccessDialogMessage('Your change request has been submitted successfully. Our team will review your request and get back to you soon.');
    setChangeDialogDismissed(false); // Reset dismissal flag when explicitly clicked from footer
    setChangeSuccessDialogOpen(true);
  }, []);
  
  // Automatically show success dialog when proposal status is accepted or change_requested
  // The dismissal flags prevent the dialogs from reopening after the user manually closes them
  useEffect(() => {
    // Only show the accepted dialog if:
    // 1. The proposal has been accepted
    // 2. The dialog is not already open
    // 3. The user has not manually dismissed the dialog
    if (currentSnapshot.proposal_status === 'accepted' && !acceptSuccessDialogOpen && !acceptDialogDismissed) {
      // Set a short delay to avoid immediate popup when page loads
      const timer = setTimeout(() => {
        setAcceptSuccessDialogStatus('success');
        setAcceptSuccessDialogMessage('Your proposal has been accepted! We will be in touch shortly to discuss next steps.');
        setAcceptSuccessDialogOpen(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    } 
    // Only show the change request dialog if:
    // 1. A change has been requested
    // 2. The dialog is not already open
    // 3. The user has not manually dismissed the dialog
    else if (currentSnapshot.proposal_status === 'change_requested' && !changeSuccessDialogOpen && !changeDialogDismissed) {
      // Set a short delay to avoid immediate popup when page loads
      const timer = setTimeout(() => {
        setChangeSuccessDialogStatus('success');
        setChangeSuccessDialogMessage('Your change request has been submitted successfully. Our team will review your request and get back to you soon.');
        setChangeSuccessDialogOpen(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [currentSnapshot.proposal_status, acceptSuccessDialogOpen, changeSuccessDialogOpen, acceptDialogDismissed, changeDialogDismissed]);

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
                        Welcome <span className="header-owners text-2xl lg:text-3xl !text-[#DB9D6A]">{snapshot.owner1.split(' ')[0]} & {snapshot.owner2?.split(' ')[0]}</span>
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
                              // Default to CATEGORY_NAMES for all others including Proposal Summary
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
                                        snapshot={snapshot}
                                       />
                          )}
                          
                          {/* Pool Installation Subsections */}
                          {id === CATEGORY_IDS.SITE_REQUIREMENTS && (
                            <SiteRequirementsCards
                              subIndex={sub}
                              snapshot={snapshot}
                            />
                          )}
                        </AnimatePresence>
                      )}
                    </>
                  ) : (
                    // --- Single Card/Content Sections ---
                    (<div
                      ref={null}
                      data-subsection-index={0}
                      className="subsection-content w-full min-h-[80vh] py-4 pb-8 lg:pb-0 transition-opacity duration-300 ease-in-out opacity-100"
                    >
                      {id === CATEGORY_IDS.CUSTOMER_INFO ? (
                        <CustomerInfoCards snapshot={snapshot} />
                      ) : id === CATEGORY_IDS.FILTRATION_MAINTENANCE ? (
                        <FiltrationMaintenanceCards snapshot={snapshot} />
                      ) : id === CATEGORY_IDS.CONCRETE_PAVING ? (
                        <ConcretePavingCards snapshot={snapshot} />
                      ) : id === CATEGORY_IDS.FENCING ? (
                        <FencingCards snapshot={snapshot} />
                      ) : id === CATEGORY_IDS.RETAINING_WALLS ? (
                        <RetainingWallCards snapshot={snapshot} />
                      ) : id === CATEGORY_IDS.WATER_FEATURE ? (
                        <WaterFeatureCards snapshot={snapshot} />
                      ) : id === CATEGORY_IDS.ADD_ONS ? (
                        <AddOnCards snapshot={snapshot} />
                      ) : id === CATEGORY_IDS.PROPOSAL_SUMMARY ? (
                        <ProposalSummaryCards snapshot={snapshot} />
                      ) : (
                        // Generic placeholder for other single-content sections
                        (<Card className="w-full h-full p-5 overflow-y-auto">
                          <CardContent>
                            <p>Content for {CATEGORY_NAMES[id]} goes here.</p>
                          </CardContent>
                        </Card>)
                      )}
                    </div>)
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
                      setDir(-1);
                      lastDir.current = -1;
                      
                      if (showOnlyNonNullSections) {
                        // Find previous non-empty section
                        const prevIndex = findPrevAvailableStepIndex(machineState.index, snapshot, SM.STEPS);
                        if (prevIndex !== -1) {
                          setMachineState({ index: prevIndex });
                        }
                      } else {
                        // Regular prev navigation
                        setMachineState(SM.prev(machineState));
                      }
                    }
                  }}
                  disabled={showOnlyNonNullSections 
                    ? findPrevAvailableStepIndex(machineState.index, snapshot, SM.STEPS) === -1 
                    : !SM.canGoPrev(machineState)}
                >
                  <ChevronUp className="h-5 w-5 text-[#DB9D6A]" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-full bg-white" 
                  onClick={() => {
                    if (SM.canGoNext(machineState)) {
                      setDir(1);
                      lastDir.current = 1;
                      
                      if (showOnlyNonNullSections) {
                        // Find next non-empty section
                        const nextIndex = findNextAvailableStepIndex(machineState.index, snapshot, SM.STEPS);
                        if (nextIndex !== -1) {
                          setMachineState({ index: nextIndex });
                        }
                      } else {
                        // Regular next navigation
                        setMachineState(SM.next(machineState));
                      }
                    }
                  }}
                  disabled={showOnlyNonNullSections 
                    ? findNextAvailableStepIndex(machineState.index, snapshot, SM.STEPS) === -1 
                    : !SM.canGoNext(machineState)}
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
          snapshot={snapshot}
          resetScroll={resetScroll}
          use3DVisuals={snapshot.render_ready === true}
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
        canGoPrev={(state) => {
          if (showOnlyNonNullSections) {
            return findPrevAvailableStepIndex(state.index, currentSnapshot, SM.STEPS) !== -1;
          }
          return SM.canGoPrev(state);
        }}
        canGoNext={(state) => {
          if (showOnlyNonNullSections) {
            return findNextAvailableStepIndex(state.index, currentSnapshot, SM.STEPS) !== -1;
          }
          return SM.canGoNext(state);
        }}
        handlePrev={() => {
          if (SM.canGoPrev(machineState)) {
            lastDir.current=-1;
            setDir(-1);

            if (showOnlyNonNullSections) {
              // Find previous non-empty section
              const prevIndex = findPrevAvailableStepIndex(machineState.index, currentSnapshot, SM.STEPS);
              if (prevIndex !== -1) {
                setMachineState({ index: prevIndex });
              }
            } else {
              // Regular prev navigation
              setMachineState(SM.prev(machineState));
            }
          }
        }}
        handleNext={() => {
          if (SM.canGoNext(machineState)) {
            lastDir.current=1;
            setDir(1);

            if (showOnlyNonNullSections) {
              // Find next non-empty section
              const nextIndex = findNextAvailableStepIndex(machineState.index, currentSnapshot, SM.STEPS);
              if (nextIndex !== -1) {
                setMachineState({ index: nextIndex });
              }
            } else {
              // Regular next navigation
              setMachineState(SM.next(machineState));
            }
          }
        }}
      />
      
      {/* Success Dialogs */}
      <AcceptProposalSuccessDialog
        isOpen={acceptSuccessDialogOpen}
        onClose={() => {
          setAcceptSuccessDialogOpen(false);
          // Mark as dismissed to prevent auto-reopening when closed by user
          setAcceptDialogDismissed(true);
        }}
        status={acceptSuccessDialogStatus}
        message={acceptSuccessDialogMessage}
      />
      
      <ChangeRequestSuccessDialog
        isOpen={changeSuccessDialogOpen}
        onClose={() => {
          setChangeSuccessDialogOpen(false);
          // Mark as dismissed to prevent auto-reopening when closed by user
          setChangeDialogDismissed(true);
        }}
        status={changeSuccessDialogStatus}
        message={changeSuccessDialogMessage}
        snapshot={currentSnapshot}
      />
    </div>
  );
}