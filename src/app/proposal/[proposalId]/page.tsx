'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react'; // Import useCallback
import * as SM from '@/state/sectionMachine';
import { useJsApiLoader, GoogleMap, Marker } from '@react-google-maps/api';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Mail, MessageSquare, Phone, Home, Wrench, Square, Layers, BarChart2, Filter, Star, ShieldCheck, Handshake, HelpCircle } from 'lucide-react';
// Mock data import for initialising page
import exampleProposal from '@/data/exampleproposal.json';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button"; // Import Button
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── direction (shared mutable ref) ─────────────────────────────────── */
const lastDir: { current: 1 | -1 } = { current: 1 };   // +1 = down, -1 = up

/* ─── Animation variants for section transitions ─────────────────────── */
const sectionVariants = {
  enter: () => ({
    opacity: 0,
    y: lastDir.current === 1 ?  32 : -32   // new screen slides *from* scroll direction
  }),
  center: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: 'easeOut' }
  },
  exit:  () => ({
    opacity: 0,
    y: lastDir.current === 1 ? -32 :  32   // old screen goes *with* scroll direction
  })
};

// fade-only, slightly slower
const visualVariants = {
  enter:  { opacity: 0 },
  center: { opacity: 1, transition: { duration: 0.7, ease: 'easeOut' } },
  exit:   { opacity: 0, transition: { duration: 0.5, ease: 'easeIn' } },
};

const cardFade = {
  enter:  { opacity: 0 },
  center: { opacity: 1, transition: { duration: 0.4 } },
  exit:   { opacity: 0, transition: { duration: 0.3 } },
};

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
  const [machineState, setMachineState] = useState<SM.State>(SM.initialState);
  const [dir, setDir] = useState<1 | -1>(1);   // +1 = forward, -1 = back
  const { section: activeSection, sub: subIndex } = SM.current(machineState);
  const rightColumnRef = useRef<HTMLDivElement | null>(null); // Ref for the scrollable container
  
  // Sections that have sub-sections
  const SECTIONS_WITH_SUBSECTIONS = [CATEGORY_IDS.POOL_SELECTION /* add other IDs here as needed */];
  // Example pool selection sub-section data (details, color, pricing, etc.)
  const poolSubSectionsData = [
    { type: 'details', data: proposalData.poolSelection.pool },
    { type: 'color', data: { color: proposalData.poolSelection.pool.color /*, other details */ } },
    // add more sub-sections here...
  ];
  // Helper for left-column visuals based on section and sub-section
  const getLeftColumnVisual = (sectionId: string | null, subIndex: number) => {
    switch (sectionId) {
      case CATEGORY_IDS.CUSTOMER_INFO:
        return { type: 'map', address: proposalData.customerInfo.propertyDetails.fullAddress };
      case CATEGORY_IDS.POOL_SELECTION:
        if (subIndex === 0) return { type: 'video', src: '/Sheffield.mp4' };
        if (subIndex === 1) return { type: 'image', src: '/silvermist-water.jpg', alt: 'Pool Water Colour' };
        return { type: 'video', src: '/Sheffield.mp4' };
      case CATEGORY_IDS.CONCRETE_PAVING:
        return { type: 'image', src: '/paving.jpg', alt: 'Paving & Concrete' };
      case CATEGORY_IDS.FENCING:
        return { type: 'image', src: '/fencing.jpg', alt: 'Fencing' };
      case CATEGORY_IDS.WATER_FEATURE:
        return { type: 'video', src: '/WaterFeature.mp4', alt: 'Water Feature' };
      case CATEGORY_IDS.ADD_ONS:
        return { type: 'image', src: '/lighting.jpg', alt: 'Optional Add-ons' };
      default:
        return { type: 'placeholder', name: sectionId ? CATEGORY_NAMES[sectionId] : 'Loading...' };
    }
  };


  
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

  // Enhanced video control for all videos
  const videoRefs = useRef<{[key: string]: HTMLVideoElement | null}>({});
  
  // Register a video ref with a unique id
  const registerVideoRef = useCallback((node: HTMLVideoElement | null, id: string) => {
    if (node) {
      videoRefs.current[id] = node;
    } else {
      delete videoRefs.current[id];
    }
  }, []);
  
  // ─── constants & direction ref ───────────────────────────────────────────
const MIN_DELTA = 10;             // ignore jitter below this
const SCROLL_COOLDOWN_MS = 700;   // feel free to tweak

// keep these refs outside of the component body if you prefer
const scrollLock = useRef(false);

// ─── handler ─────────────────────────────────────────────────────────────
const handleWheel = useCallback((e: React.WheelEvent) => {
  const { deltaY } = e;

  // 1. ignore micro‑movements
  if (Math.abs(deltaY) < MIN_DELTA) return;

  // 2. ignore if we're still in cooldown
  if (scrollLock.current) { e.preventDefault(); return; }

  // 3. decide direction   (+1 = down, -1 = up)
  const dir: 1 | -1 = deltaY > 0 ? 1 : -1;

  /* 1 step in the machine ⤵︎ */
  setMachineState(s =>
    dir === 1 && SM.canGoNext(s) ? SM.next(s) :
    dir === -1 && SM.canGoPrev(s) ? SM.prev(s) :
    s
  );
  /* 2 store direction for variants */
  setDir(dir);
  lastDir.current = dir;

  /* 3 lock a short cooldown */
  scrollLock.current = true;
  setTimeout(() => { scrollLock.current = false; }, SCROLL_COOLDOWN_MS);

  e.preventDefault();
}, []);
  
  // Control playback of videos on section change
  useEffect(() => {
    // Pause all videos first
    Object.entries(videoRefs.current).forEach(([id, videoNode]) => {
      if (videoNode) {
        videoNode.pause();
      }
    });
    
    // Get the current visual
    const currentVisual = getLeftColumnVisual(activeSection, subIndex);
    
    // Play the active video if there is one
    if (currentVisual.type === 'video') {
      const videoId = `video-${activeSection}-${subIndex}`;
      const videoNode = videoRefs.current[videoId];
      
      if (videoNode) {
        // Reset the video position
        videoNode.currentTime = 0;
        // Play with a small delay to ensure rendering is complete
        setTimeout(() => {
          videoNode.play().catch(err => console.log("Video play error:", err));
        }, 100);
      }
    }
  }, [activeSection]);

  // Debug effect to log state changes
  useEffect(() => {
    console.log(`State Changed - Active Section: ${activeSection}`);
  }, [activeSection]);

  // Compute section-based progress using machine state
  const progressPercent = ((machineState.index + 1) / SM.STEPS.length) * 100;

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
  <main className="flex flex-1 pt-16 pb-16 overscroll-none">
      {/* Left Column */}
      <div className="w-2/3 sticky top-16 flex h-[calc(100vh-8rem)] flex-col items-center justify-center overflow-hidden touch-none proposal-left">
        {/* Enhanced Debug Panel - remove in production */}
        <div className="absolute top-2 left-2 z-50 bg-black/80 text-white text-sm p-3 rounded">
          <p className="font-bold mb-1">Debug Panel</p>
          <p>Active Section: {activeSection}</p>
          <div className="mt-2 space-y-1">
            <p className="text-xs font-medium mb-1">Manual Section Selection:</p>
            {Object.entries(CATEGORY_IDS).map(([key, id]) => (
              <button
                key={id}
                onClick={() => {
                  setMachineState({ step: Object.values(CATEGORY_IDS).indexOf(id), section: id as SM.SectionId });
                  console.log(`Manually set section to ${id}`);
                }}
                className={`block w-full text-xs px-2 py-1 rounded ${activeSection === id ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
              >
                {key}
              </button>
            ))}
          </div>
        </div>
        
        {/* Left Column Visuals with AnimatePresence */}
        <AnimatePresence mode="wait">
          {/* Customer Info - Map */}
          {activeSection === CATEGORY_IDS.CUSTOMER_INFO && (
            <motion.div
              key="map"
              variants={visualVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full h-full"
            >
              {isLoaded && mapCenter ? (
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
                <div className="flex items-center justify-center h-full">
                  <p className="text-white">Loading map...</p>
                </div>
              )}
            </motion.div>
          )}
          
          {/* Pool Selection */}
          {activeSection === CATEGORY_IDS.POOL_SELECTION && (
            <motion.div
              key="pool"
              variants={visualVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full h-full"
            >
              <video
                ref={(node) => {
                  if (node) {
                    // Play the video immediately
                    node.play().catch(e => console.log("Video play error:", e));
                  }
                }}
                src="/Sheffield.mp4"
                muted
                loop
                playsInline
                className="w-full h-full object-cover object-center"
              />
            </motion.div>
          )}
        
          {/* Concrete & Paving */}
          {activeSection === CATEGORY_IDS.CONCRETE_PAVING && (
            <motion.div
              key="paving"
              variants={visualVariants}
              initial="enter"
              animate="center"
              exit="exit" 
              className="w-full h-full"
            >
              <img
                src="/paving.jpg"
                alt="Paving & Concrete"
                className="w-full h-full object-cover object-center"
              />
            </motion.div>
          )}
          
          {/* Fencing */}
          {activeSection === CATEGORY_IDS.FENCING && (
            <motion.div
              key="fencing"
              variants={visualVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full h-full"
            >
              <img
                src="/fencing.jpg"
                alt="Fencing"
                className="w-full h-full object-cover object-center"
              />
            </motion.div>
          )}
          
          {/* Water Feature */}
          {activeSection === CATEGORY_IDS.WATER_FEATURE && (
            <motion.div
              key="water-feature"
              variants={visualVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full h-full"
            >
              <video
                ref={(node) => {
                  if (node) {
                    // Play the video immediately
                    node.play().catch(e => console.log("Video play error:", e));
                  }
                }}
                src="/WaterFeature.mp4"
                muted
                loop
                playsInline
                className="w-full h-full object-cover object-center"
              />
            </motion.div>
          )}
          
          {/* Add-ons */}
          {activeSection === CATEGORY_IDS.ADD_ONS && (
            <motion.div
              key="add-ons"
              variants={visualVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full h-full"
            >
              <img
                src="/lighting.jpg"
                alt="Optional Add-ons"
                className="w-full h-full object-cover object-center"
              />
            </motion.div>
          )}
          
          {/* Generic Placeholder for remaining sections */}
          {(activeSection === CATEGORY_IDS.RETAINING_WALLS || 
            activeSection === CATEGORY_IDS.ELECTRICAL || 
            activeSection === CATEGORY_IDS.SITE_REQUIREMENTS) && (
            <motion.div
              key="placeholder"
              variants={visualVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full h-full flex items-center justify-center"
            >
              <div className="text-white text-center">
                <p className="text-2xl font-bold mb-2">{activeSection ? CATEGORY_NAMES[activeSection] : 'Loading...'}</p>
                <p className="text-lg opacity-70">Visual coming soon</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right Column - Scrollable Container */}
      <div 
        ref={rightColumnRef}
        onWheel={handleWheel}
        className="w-1/3 h-[calc(100vh-8rem)] overflow-hidden touch-none proposal-left">
        <AnimatePresence mode="wait">
          {Object.entries(CATEGORY_IDS).map(([key, id]) => {
            if (activeSection !== id) return null;      // render only the current one

            const isMultiCardSection = SECTIONS_WITH_SUBSECTIONS.includes(id);
            const isCustomerInfo = id === CATEGORY_IDS.CUSTOMER_INFO;

            return (
              <motion.div
                key={id}
                variants={sectionVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="major-section w-full flex flex-col p-8 overflow-hidden"
              >
              {/* Render Header conditionally */}
              <div className="mb-4 transition-opacity duration-300 ease-in-out opacity-100">
                {id === CATEGORY_IDS.CUSTOMER_INFO ? (
                  <>
                    <h2 className="header-welcome">
                      Welcome <span className="header-owners">{proposalData.customerInfo.owner1.split(' ')[0]} & {proposalData.customerInfo.owner2?.split(' ')[0]}</span>
                    </h2>
                    <h3 className="subheader-text mt-1.5">
                      Your Pool Proposal for {proposalData.customerInfo.propertyDetails.streetAddress}
                    </h3>
                  </>
                ) : id === CATEGORY_IDS.POOL_SELECTION ? (
                  <>
                    <h2 className="font-bold font-sans text-white text-3xl mb-4">
                      Your Pool, {proposalData.poolSelection.pool.modelName.replace(/\s*\(.*\)$/, '')}
                    </h2>
                    <h3 className="subheader-text mt-1.5">
                      {subIndex === 0
                        ? 'Pool Details'
                        : 'ColourGuard® Finishes'}
                    </h3>
                  </>
                ) : (
                  <>
                    <h2 className="font-bold font-sans text-white text-3xl mb-4">
                      {CATEGORY_NAMES[id]}
                    </h2>
                    <h3 className="subheader-text mt-1.5">
                      Your {CATEGORY_NAMES[id]} Details
                    </h3>
                  </>
                )}
              </div>

              {/* --- Content Area --- */}
              {isMultiCardSection ? (
                <>
                  {/* Render MULTIPLE cards with better transitions */}
                  {id === CATEGORY_IDS.POOL_SELECTION && (
                    <AnimatePresence mode="wait">
                      {subIndex === 0 && (
                        <motion.div
                          key="pool-details"
                          variants={cardFade}
                          initial="enter"
                          animate="center"
                          exit="exit"
                          className="w-full min-h-[80vh] py-4"
                        >
                          <Card className="w-full h-full p-5 overflow-y-auto shadow-lg">
                            <CardContent className="px-0 space-y-4">
                              <p className="text-sm font-medium">Pool Details</p>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="flex flex-col">
                                  <span className="font-medium">Model Name</span>
                                  <span>{proposalData.poolSelection.pool.modelName}</span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-medium">Range</span>
                                  <span>{proposalData.poolSelection.pool.poolRange}</span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-medium">Type</span>
                                  <span>{proposalData.poolSelection.pool.poolType}</span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-medium">Weight (kg)</span>
                                  <span>{proposalData.poolSelection.pool.weightKg.toLocaleString()}</span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-medium">Volume (L)</span>
                                  <span>{proposalData.poolSelection.pool.volumeLiters.toLocaleString()}</span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-medium">Color</span>
                                  <span>{proposalData.poolSelection.pool.color}</span>
                                </div>
                              </div>
                              <Separator />
                              <p className="text-sm font-medium">Dimensions (m)</p>
                              <div className="flex flex-col items-start pl-1 mb-3 mt-1">
                                <img 
                                  src="/verona_layout.png" 
                                  alt="Verona Pool Layout" 
                                  className="w-32 rounded-md object-contain" 
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="flex flex-col">
                                  <span className="font-medium">Length</span>
                                  <span>{proposalData.poolSelection.pool.dimensions.lengthM}</span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-medium">Width</span>
                                  <span>{proposalData.poolSelection.pool.dimensions.widthM}</span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-medium">Shallow Depth</span>
                                  <span>{proposalData.poolSelection.pool.dimensions.shallowDepthM}</span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-medium">Deep Depth</span>
                                  <span>{proposalData.poolSelection.pool.dimensions.deepDepthM}</span>
                                </div>
                                <div className="flex flex-col col-span-2">
                                  <span className="font-medium">Waterline (L/m)</span>
                                  <span>{proposalData.poolSelection.pool.dimensions.waterlineLitersPerMeter}</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      )}
                      {subIndex === 1 && (
                        <motion.div
                          key="colour-guard"
                          variants={cardFade}
                          initial="enter"
                          animate="center"
                          exit="exit"
                          className="w-full min-h-[80vh] py-4"
                        >
                          <Card className="w-full h-full p-5 overflow-y-auto shadow-lg">
                            <CardContent className="px-0 space-y-4">
                              <p className="text-sm font-medium">ColourGuard® Pool Colour</p>
                              <p className="text-sm text-muted-foreground">
                                The only dual-surface protection system with a clear layer that protects the colour layer.
                              </p>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col items-center">
                                  <img
                                    src="/silver-mist.png"
                                    alt="Silver Mist Pool Colour"
                                    className="h-24 w-24 object-cover rounded-md mb-2"
                                  />
                                  <span className="text-sm font-medium">Pool Colour</span>
                                </div>
                                <div className="flex flex-col items-center">
                                  <img
                                    src="/silvermist-water.jpg"
                                    alt="Silver Mist Water Colour"
                                    className="h-24 w-24 object-cover rounded-md mb-2"
                                  />
                                  <span className="text-sm font-medium">Water Colour</span>
                                </div>
                              </div>
                              <p className="text-sm font-medium flex items-center space-x-2 cursor-pointer">
                                <HelpCircle className="h-4 w-4 text-muted-foreground" title="Learn more about ColourGuard" />
                                <span>Learn more about ColourGuard</span>
                              </p>
                            </CardContent>
                          </Card>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                  {/* Add mapping for other multi-card sections */}
                </>
              ) : (
                // --- Single Card/Content Sections ---
                <div
                  ref={null}
                  data-subsection-index={0}
                  className="subsection-content w-full min-h-[80vh] py-4 transition-opacity duration-300 ease-in-out opacity-100"
                >
                  {id === CATEGORY_IDS.CUSTOMER_INFO ? (
                    <div className="space-y-6 h-full overflow-y-auto">
                      {/* Customer info cards rendered sequentially */}
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
                      <Card className="w-full p-5">
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
                    </div>
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
      </div>
    </main>
    
    {/* --- Footer --- */}
  <footer className="fixed bottom-0 left-0 right-0 z-50 flex h-16
                   items-center justify-end space-x-2 border-t
                   bg-[#DB9D6A33] px-4 md:px-6">
    {/* Progress indicator */}
    <motion.div
      className="absolute top-0 left-0 h-1 bg-[#1DA1F2]"   /* blue bar */
      animate={{ width: `${progressPercent}%` }}
      transition={{ ease: 'easeOut', duration: 0.2 }}
    />
    <Button variant="destructive" size="lg">Request Changes</Button>
    <Button size="lg">Accept Quote</Button>
  </footer>
  </div>
  );
}

