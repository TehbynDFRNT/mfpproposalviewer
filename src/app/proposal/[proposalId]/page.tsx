'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react'; // Import useCallback
import { useJsApiLoader, GoogleMap, Marker } from '@react-google-maps/api';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Mail, MessageSquare, Phone, Home, Wrench, Square, Layers, BarChart2, Filter, Star, ShieldCheck, Handshake } from 'lucide-react';
// Mock data import for initialising page
import exampleProposal from '@/data/exampleproposal.json';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button"; // Import Button
import { useParams } from 'next/navigation';

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

export default function ProposalPage() {
  const params = useParams<{ proposalId: string }>();
  const proposalId = params.proposalId;
  // Initialise mock proposal data for rendering
  const proposalData = exampleProposal.quote;
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
  // Fade transition states for left-column content
  const [displaySection, setDisplaySection] = useState<string | null>(activeSection);
  const [isTransitioning, setIsTransitioning] = useState(false);
  useEffect(() => {
    setIsTransitioning(true);
    const t = setTimeout(() => {
      setDisplaySection(activeSection);
      setIsTransitioning(false);
    }, 500);
    return () => clearTimeout(t);
  }, [activeSection]);
  
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

  // Control playback of pool selection video on section change
  const poolVideoRef = useRef<HTMLVideoElement | null>(null);
  useEffect(() => {
    if (activeSection === CATEGORY_IDS.POOL_SELECTION) {
      poolVideoRef.current?.play();
    } else {
      poolVideoRef.current?.pause();
    }
  }, [activeSection]);
  // Compute section-based progress
  const sectionIds = Object.values(CATEGORY_IDS);
  const totalSections = sectionIds.length;
  const activeIndex = sectionIds.findIndex(id => id === activeSection);
  const progressPercent = ((activeIndex !== -1 ? activeIndex + 1 : 0) / totalSections) * 100;

  return (
    <div className="relative flex min-h-screen flex-col"> {/* Changed to flex-col for header/main/footer layout */}
  {/* --- Header --- */}
  <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
    {/* Logo */}
    <div className="flex items-center">
      <img src="/logo.png" alt="MFP Pools Logo" className="h-8 w-auto" />
    </div>
    {/* Contact Icons */}
      <div className="flex items-center space-x-2">
      <Button variant="secondary" size="icon" aria-label="Email Us">
        <Mail className="h-5 w-5" />
        </Button>
      <Button variant="secondary" size="icon" aria-label="Chat With Us">
        <MessageSquare className="h-5 w-5" />
      </Button>
      <Button variant="secondary" size="icon" aria-label="Call Us">
        <Phone className="h-5 w-5" />
      </Button>
    </div>
  </header>
  
  {/* --- Main Content Area --- */}
  {/* flex-1 makes this grow to fill space between header/footer */}
  {/* pt-16/pb-16 account for fixed header/footer height */}
  <main className="flex flex-1 pt-16 pb-16">
      {/* Left Column */}
       <div className="w-2/3 sticky top-16 flex h-[calc(100vh-8rem)] flex-col items-center justify-center overflow-hidden overscroll-none touch-none proposal-left">
{/* Visual placeholder now takes full height of the left column */}
        <div className={`w-full h-full relative rounded overflow-hidden transition-opacity duration-500 ease-in-out ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
          {displaySection === CATEGORY_IDS.CUSTOMER_INFO ? (
            isLoaded && mapCenter ? (
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%' }}
                center={mapCenter}
                zoom={21}
                options={{
                  mapTypeId: 'satellite',
                  disableDefaultUI: true,
                  clickableIcons: false,
                  maxZoom: 21,
                  tilt: 0,
                  styles: [
                    { featureType: 'all', elementType: 'labels', stylers: [{ visibility: 'off' }] },
                    { featureType: 'poi', stylers: [{ visibility: 'off' }] },
                    { featureType: 'transit', stylers: [{ visibility: 'off' }] },
                    { featureType: 'road', stylers: [{ visibility: 'off' }] },
                    { featureType: 'administrative', stylers: [{ visibility: 'off' }] }
                  ]
                }}
              >
                <Marker position={mapCenter} />
              </GoogleMap>
            ) : (
              <p className="text-muted-foreground p-4">Loading map…</p>
            )
          ) : (
            <>
              {displaySection === CATEGORY_IDS.POOL_SELECTION ? (
                <video
                  ref={poolVideoRef}
                  src="/Sheffield.mp4"
                  muted
                  autoPlay
                  loop
                  playsInline
                  className="w-full h-full object-cover object-center"
                />
              ) : (
                <>
                  <p className="text-xl font-semibold opacity-50 p-4 absolute top-4 left-4 bg-background/80 rounded">
                    {CATEGORY_NAMES[displaySection]}
                  </p>
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">
                      Visual for {CATEGORY_NAMES[displaySection]}
                    </p>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Right Column */}
      <div ref={rightColumnRef} className="w-1/3 h-[calc(100vh-8rem)] overflow-y-scroll p-0 scroll-smooth snap-y snap-mandatory proposal-right"> {/* Right column background, enabled scroll snapping */}

        {Object.entries(CATEGORY_IDS).map(([key, id]) => {
          const isCustomerInfo = id === CATEGORY_IDS.CUSTOMER_INFO;
          return (
            <React.Fragment key={id}>
              <div
                ref={(node) => assignRef(node, id)}
                id={id}
                className={cn(
                  "h-full w-full snap-start snap-always flex flex-col p-8 transition-opacity duration-500 ease-in-out",
                  activeSection === id ? "opacity-100" : "opacity-20"
                )}
              >
                {isCustomerInfo ? (
                  <>
                    {/* Custom welcome header */}
                    <div className="mb-4">
                      <h2 className="header-welcome">
                        Welcome <span className="header-owners">{proposalData.customerInfo.owner1.split(' ')[0]} &amp; {proposalData.customerInfo.owner2?.split(' ')[0]}</span>
                      </h2>
                      <h3 className="subheader-text mt-1.5">
                        Your Pool Proposal for {proposalData.customerInfo.propertyDetails.streetAddress}
                      </h3>
                    </div>
                    <Card className="w-full p-5">
<CardContent className="px-0 space-y-4">
                      {/* Contact Info */}
                      <p className="text-sm font-medium">Your Best Contact Details</p>
                      <div className="grid grid-cols-2 gap-4">
                        <a
                          href={`tel:${proposalData.customerInfo.phoneNumber}`}
                          className="flex items-center gap-2 text-sm hover:underline"
                          aria-label={`Call ${proposalData.customerInfo.phoneNumber}`}
                        >
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{proposalData.customerInfo.phoneNumber}</span>
                        </a>
                        <a
                          href={`mailto:${proposalData.customerInfo.emailAddress}`}
                          className="flex items-center gap-2 text-sm hover:underline"
                          aria-label={`Email ${proposalData.customerInfo.emailAddress}`}
                        >
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{proposalData.customerInfo.emailAddress}</span>
                        </a>
                      </div>
                      <Separator />
                      {/* Pool Installation Location */}
                      <p className="text-sm font-medium">Pool Installation Location</p>
                      <div className="flex items-start gap-2">
                        <Home className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">{proposalData.customerInfo.propertyDetails.fullAddress}</p>
                      </div>
                      </CardContent>
                    </Card>
                    {/* Quote Summary Card */}
                    <Card className="w-full p-5 mt-6">
                      <CardContent className="px-0 space-y-4">
                        <p className="text-sm font-medium">Complete Pool Quote Includes:</p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <Wrench className="h-4 w-4 text-[#DB9D6A]" />
                            <span>Installation</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Square className="h-4 w-4 text-[#DB9D6A]" />
                            <span>Coping</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Layers className="h-4 w-4 text-[#DB9D6A]" />
                            <span>Paving & Concrete</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <BarChart2 className="h-4 w-4 text-[#DB9D6A]" />
                            <span>Fencing</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Filter className="h-4 w-4 text-[#DB9D6A]" />
                            <span>Filtration</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Star className="h-4 w-4 text-[#DB9D6A]" />
                            <span>Upgrades & Extras</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <ShieldCheck className="h-4 w-4 text-[#DB9D6A]" />
                            <span>Warranty</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Handshake className="h-4 w-4 text-[#DB9D6A]" />
                            <span>Full Handover</span>
                          </div>
                        </div>
                        <Separator />
                        {/* Grand Total */}
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Total Quote</span>
                            <span>${proposalData.quoteTotalSummary.grandTotalCost.toLocaleString()}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                ) : id === CATEGORY_IDS.POOL_SELECTION ? (
                  <>
                    <div className="mb-4">
                      <h2 className="font-bold font-sans text-white text-3xl mb-4">
                        Your Pool, {proposalData.poolSelection.pool.modelName.replace(/\s*\(.*\)$/, '')}
                      </h2>
                      <h3 className="subheader-text mt-1.5">
                        From the <span className="text-[#DB9D6A] font-semibold">
                          {proposalData.poolSelection.pool.poolRange} Range
                        </span>
                      </h3>
                    </div>
                    <div className="flex-grow" />
                  </>
                ) : (
                  <>
                    <h2 className="text-2xl font-semibold mb-4">
                      {CATEGORY_NAMES[id]}
                    </h2>
                    <div>
                      <p className="text-muted-foreground">
                        Details for {CATEGORY_NAMES[id]} go here...
                      </p>
                    </div>
                    <div className="flex-grow" />
                  </>
                )}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </main>
    
    {/* --- Footer --- */}
  <footer className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-end space-x-2 border-t bg-[#DB9D6A33] px-4 md:px-6">
    {/* Progress indicator */}
    <div
      className="absolute top-0 left-0 h-px bg-accent transition-all duration-200 ease-out"
      style={{ width: `${progressPercent}%` }}
    />
    <Button variant="destructive" size="lg">Request Changes</Button>
    <Button size="lg">Accept Quote</Button>
  </footer>
  </div>
  );
}