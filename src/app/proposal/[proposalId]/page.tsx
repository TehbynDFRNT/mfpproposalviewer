'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react'; // Import useCallback
import * as SM from '@/state/sectionMachine';
import { useJsApiLoader, GoogleMap, Marker } from '@react-google-maps/api';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Mail, MessageSquare, Phone, Home, Wrench, Square, Layers, BarChart2, Filter, Star, ShieldCheck, Handshake, HelpCircle } from 'lucide-react';
import IncludedChecklistCard from '@/components/ui/IncludedChecklistCard';
// Mock data import for initialising page
import exampleProposal from '@/data/exampleproposal.json';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button"; // Import Button
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

// Cost Table Card component for both Fixed and Variable costs
interface CostItem {
  name: string;
  cost: number;
  benefit?: string;
}

interface CostTableCardProps {
  title: string;
  rows: CostItem[];
  total: number;
  variants: any;
}

const CostTableCard = ({ title, rows, total, variants }: CostTableCardProps) => {
  return (
    <motion.div
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      className="w-full min-h-[80vh] py-4"
    >
      <Card className="w-full h-full p-5 overflow-y-auto shadow-lg">
        <CardContent className="px-0 space-y-4">
          <p className="text-sm font-medium">{title}</p>
          <div className="space-y-2">
            {rows.map(row => (
              <div key={row.name} className="flex justify-between text-sm">
                <span>{row.name}</span>
                <span>${row.cost.toLocaleString()}</span>
              </div>
            ))}
          </div>
          <Separator />
          <div className="flex justify-between font-medium">
            <span>Total {title}</span>
            <span>${total.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

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
  FILTRATION_MAINTENANCE: 'filtration-maintenance-section',
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
  [CATEGORY_IDS.FILTRATION_MAINTENANCE]: 'Filtration & Maintenance',
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
  const { section: activeSection, sub = 0 } = SM.current(machineState);
  const rightColumnRef = useRef<HTMLDivElement | null>(null); // Ref for the scrollable container
  
  // Sections that have sub-sections
  const SECTIONS_WITH_SUBSECTIONS = [
    CATEGORY_IDS.POOL_SELECTION,
    CATEGORY_IDS.CONCRETE_PAVING
  ];
  
  // Filtration and Maintenance items
  const filtrationItems = [
    {name: 'Energy-saving Pureswim pump', benefit: 'cuts running costs by up to 70%'},
    {name: 'Oversize cartridge filter', benefit: 'fewer cleans, crystal clear water'},
    {name: 'Smart chlorinator', benefit: 'automatic, reliable sanitation'},
    {name: 'Multi-colour LED light', benefit: 'creates stunning night-time ambience'}
  ];
  // Ordered list drives <dot> nav + headings + visuals
  /* exact same length/order as the 4 pool-selection STEPS above */
  const poolSubSectionsData = [
    { type: 'details',   data: proposalData.poolSelection.pool },
    { type: 'color',     data: { color: proposalData.poolSelection.pool.color } },
    { type: 'essentials', data: proposalData.poolSelection.fixedCosts },
    { type: 'siteWork',  data: { fixed: proposalData.poolSelection.fixedCosts, variable: proposalData.poolSelection.individualCosts } },
  ];
  
  // Helper for optional-safe number formatting with locale
  const $ = (n?: number) => n !== undefined ? n.toLocaleString() : '—';
  
  // turn fixedCosts array into friendly items
  const essentialsItems = [
    {name: 'Pool shell warranty', benefit: 'lifetime protection'},
    {name: '12-month mineral start-up kit', benefit: 'crystal-clear water'},
    {name: 'Multi-colour LED light', benefit: 'night-time ambience'},
    {name: 'Energy-saving Pureswim pump', benefit: 'cuts running costs'},
    {name: 'Oversize cartridge filter', benefit: 'fewer cleans'},
    {name: 'Smart chlorinator', benefit: 'set & forget sanitation'},
    {name: 'Premium hand-over kit', benefit: 'maintenance gear included'},
    {name: 'Stone-lid skimmer', benefit: 'blends with coping'}
  ];
  
  const siteWorkItems = [
    {name: 'Council certification & CAD plans', benefit: 'paperwork handled'},
    {name: 'Engineer sign-off to AS1839-2021', benefit: 'built to code'},
    {name: 'Excavation & spoil removal', benefit: 'site left tidy'},
    {name: 'Franna crane lift', benefit: 'precise placement'},
    {name: 'Geotechnical soil test', benefit: 'ground verified'},
    {name: 'Drainage & back-fill system', benefit: 'protects your pool'},
    {name: '8-week temporary safety fence', benefit: 'stay compliant'},
    {name: 'Water delivery & fill', benefit: 'logistics sorted'},
    {name: 'Professional cleans & tuition', benefit: 'sparkling hand-over'}
  ];
  
  // Data for concrete-paving section with improved data schema
  const paving = proposalData.concreteAndPaving;
  const { pavingCostSummary, sectionTotal } = paving;
  
  /* ── Concrete & Paving – fixed cost metrics (for Card #1) ────────────── */
  const pavingMetricsRows: CostItem[] = [
    {
      name: `Extra Paving + Concrete  (${pavingCostSummary.areaM2} m²  @  ${pavingCostSummary.ratePerM2}/m²)`,
      cost: pavingCostSummary.totalCost
    },
    {
      name: `Extra Concrete  (${paving.extraConcreting?.meterageM2} m²  @  ${paving.extraConcreting?.costSummary?.ratePerM2}/m²)`,
      cost: paving.extraConcreting?.costSummary?.totalCost || 0
    },
    {
      name: `Concrete Pump  (${paving.concretePump.numberOfDaysRequired} day${paving.concretePump.numberOfDaysRequired>1?'s':''})`,
      cost: paving.concretePump.totalCost         // already "switch ON" in JSON
    },
    {
      name: `Under-Fence Concrete Strips  (${paving.underFenceConcreteStrips?.lengthMeters} m  @  ${paving.underFenceConcreteStrips?.ratePerLm}/Lm)`,
      cost: paving.underFenceConcreteStrips?.totalCost || 0
    },
    {
      name: `Concrete Cuts  (${paving.concreteCuts?.quantity || 0} × ${paving.concreteCuts?.cutType || 'Standard'} @ $${paving.concreteCuts?.costPerCut || 0} each)`,
      cost: paving.concreteCuts?.totalCost || 0
    }
  ];

  const pavingMetricsTotal =
    pavingMetricsRows.reduce((sum, r) => sum + r.cost, 0);
  
  const concretePavingSubSectionsData = [
    { type: 'options', data: paving },
    { type: 'metrics', data: paving }
  ];
  
  // Concrete paving items for the other sub-sections
  
  const pavingOptionItems = [
    {name: 'Honed concrete', benefit: 'smooth, contemporary finish'},
    {name: 'Exposed aggregate', benefit: 'textured, decorative surface'},
    {name: 'Stamped concrete', benefit: 'pattern and color options'},
    {name: 'Premium pavers', benefit: 'luxury look and feel'},
    {name: 'Color integration', benefit: 'matches your home palette'}
  ];
  
  const pavingSelectionItems = [
    {name: 'Square meters covered', benefit: `${paving.squareMeters ?? '—'}m² perfectly finished`},
    {name: 'Category selected', benefit: paving.pavingCategory ?? 'Custom'},
    {name: 'Rate per m²', benefit: `$${$(pavingCostSummary.ratePerM2)}`},
    {name: 'Concrete type', benefit: paving.extraConcreting?.concreteType ?? 'Standard finish'},
    {name: 'Reinforcement included', benefit: 'durability guaranteed'}
  ];
  // Helper for left-column visuals based on section and sub-section
  const getLeftColumnVisual = (sectionId: string | null, subIndex: number) => {
    switch (sectionId) {
      case CATEGORY_IDS.CUSTOMER_INFO:
        return { type: 'map', address: proposalData.customerInfo.propertyDetails.fullAddress };
      case CATEGORY_IDS.POOL_SELECTION:
        if (sub === 0) return { type: 'video', src: '/Sheffield.mp4' };
        if (sub === 1) return { type: 'image', src: '/silvermist-water.jpg', alt: 'Pool Water Colour' };
        if (sub === 2) return { type: 'placeholder', name: 'Swim-Ready Essentials' };
        if (sub === 3) return { type: 'placeholder', name: 'Site-Work & Compliance' };
        return { type: 'video', src: '/Sheffield.mp4' };
      case CATEGORY_IDS.FILTRATION_MAINTENANCE:
        return { type: 'image', src: '/filter.jpg', alt: 'Filtration & Maintenance' };
      case CATEGORY_IDS.CONCRETE_PAVING:
        if (sub === 0) return { type: 'image', src: '/pavers.png', alt: 'Paving Options' };
        if (sub === 1) return { type: 'image', src: '/paving.jpg', alt: 'Paving & Concrete Cost Metrics' };
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
const SCROLL_COOLDOWN_MS = 1200;   // feel free to tweak

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
    const currentVisual = getLeftColumnVisual(activeSection, sub);
    
    // Play the active video if there is one
    if (currentVisual.type === 'video') {
      const videoId = `video-${activeSection}-${sub}`;
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
                <div className="transition-opacity duration-300 ease-in-out opacity-100">
                  {id === CATEGORY_IDS.CUSTOMER_INFO ? (
                    <h2 className="header-welcome">
                      Welcome <span className="header-owners">{proposalData.customerInfo.owner1.split(' ')[0]} & {proposalData.customerInfo.owner2?.split(' ')[0]}</span>
                    </h2>
                  ) : id === CATEGORY_IDS.POOL_SELECTION ? (
                    <h2 className="font-bold font-sans text-white text-3xl">
                      Your Selected Pool
                    </h2>
                  ) : id === CATEGORY_IDS.CONCRETE_PAVING ? (
                    <h2 className="font-bold font-sans text-white text-3xl">
                      Concrete & Paving
                    </h2>
                  ) : (
                    <h2 className="font-bold font-sans text-white text-3xl">
                      {CATEGORY_NAMES[id]}
                    </h2>
                  )}
                </div>

                {/* --- Content Area --- */}
                {isMultiCardSection ? (
                  <>
                    {/* Render MULTIPLE cards with better transitions */}
                    {id === CATEGORY_IDS.POOL_SELECTION && (
                      <AnimatePresence mode="wait">
                        {sub === 0 && (
                          <motion.div
                            key="pool-details"
                            variants={cardFade}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            className="w-full min-h-[80vh] py-4"
                          >
                            <div className="flex flex-col space-y-6">
                              {/* Pool Dimensions Card with Hero Image */}
                              <Card className="w-full overflow-y-auto shadow-lg">
                                <div className="w-full relative">
                                  <div className="overflow-hidden h-48">
                                    <img 
                                      src="/verona-hero.jpg" 
                                      alt="Verona Pool" 
                                      className="w-full h-full object-cover object-center" 
                                    />
                                    {/* Overlay layout image - bottom right positioning */}
                                    <div className="absolute bottom-0 right-0 p-4">
                                      <img 
                                        src="/verona_layout.png" 
                                        alt="Verona Pool Layout" 
                                        className="w-28 object-contain"
                                      />
                                    </div>
                                  </div>
                                  <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/70 to-transparent">
                                    <h3 className="text-2xl font-semibold text-white">Verona</h3>
                                  </div>
                                </div>
                                <CardContent className="p-5 flex flex-col">
                                  <p className="text-sm mb-4">
                                    Part of our Latin Series, the Verona features a slimline geometric design perfect for narrow spaces and compact backyards. Its corner entry steps create an uninterrupted swim zone, while the full-length bench seat offers a generous relaxation area — the ideal balance of swimming space and comfort in a smaller footprint.
                                  </p>
                                  <Separator className="my-4" />
                                  <p className="text-sm font-medium mb-3">Dimensions (m)</p>
                                  <div className="grid grid-cols-4 gap-4 text-sm">
                                    <div>
                                      <span className="font-medium block">Length</span>
                                      <span>{proposalData.poolSelection.pool.dimensions.lengthM} m</span>
                                    </div>
                                    <div>
                                      <span className="font-medium block">Width</span>
                                      <span>{proposalData.poolSelection.pool.dimensions.widthM} m</span>
                                    </div>
                                    <div>
                                      <span className="font-medium block">Shallow</span>
                                      <span>{proposalData.poolSelection.pool.dimensions.shallowDepthM} m</span>
                                    </div>
                                    <div>
                                      <span className="font-medium block">Deep</span>
                                      <span>{proposalData.poolSelection.pool.dimensions.deepDepthM} m</span>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                              
                              
                              {/* Lifetime Warranty VIP Card */}
                              <Card className="p-4 overflow-y-auto shadow-lg">
                                <CardContent className="px-2 flex items-center h-full">
                                  <div className="flex flex-row items-center w-full">
                                    {/* Left: VIP graphic */}
                                    <div className="flex-shrink-0 pr-4 flex items-center justify-center h-full">
                                      <div className="w-16 h-16 rounded-md bg-[#DB9D6A]/10 flex items-center justify-center">
                                        <ShieldCheck className="w-10 h-10 text-[#DB9D6A]" />
                                      </div>
                                    </div>

                                    {/* Right: copy & value points */}
                                    <div className="flex-grow">
                                      <h3 className="text-base font-semibold mb-1 flex items-center">
                                        Lifetime Structural Warranty
                                      </h3>

                                      <p className="text-sm">Full transferable lifetime shell protection backed by our comprehensive warranty program</p>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          </motion.div>
                        )}
                        {sub === 1 && (
                          <motion.div
                            key="colour-guard"
                            variants={cardFade}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            className="w-full min-h-[80vh] py-4"
                          >
                            <div className="flex flex-col space-y-6">
                              <h3 className="text-2xl font-bold text-white">
                                <span className="text-[#DB9D6A]">VIP</span> Inclusions
                              </h3>
                              <div className="flex flex-col space-y-4">
                                {/* ColourGuard VIP Card */}
                                <Card className="p-4 overflow-y-auto shadow-lg">
                                  <CardContent className="px-2 flex items-center h-full">
                                    <div className="flex flex-row items-center w-full">
                                      {/* Left: VIP graphic */}
                                      <div className="flex-shrink-0 pr-4 flex items-center justify-center h-full">
                                        <img
                                          src="/silver_mist_half_circle.png"
                                          alt="ColourGuard® Silver Mist"
                                          className="w-16 h-16 object-contain transform rotate-90"
                                        />
                                      </div>

                                      {/* Right: copy & value points */}
                                      <div className="flex-grow">
                                        <h3 className="text-base font-semibold mb-1 flex items-center">
                                          ColourGuard® Finish
                                          <span className="ml-2 inline-block text-xs font-bold px-2 py-0.5 rounded-full bg-yellow-400/80 text-yellow-900">
                                            VIP
                                          </span>
                                        </h3>

                                        <p className="text-sm mb-1">Dual-surface UV protection system</p>
                                        <p className="mt-2 text-sm font-bold">
                                          Valued At <span className="text-green-700">$3,700</span>
                                          <span className="block text-xs font-normal text-muted-foreground">Included at No Extra Charge</span>
                                        </p>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                                
                                {/* Graphene VIP Card */}
                                <Card className="p-4 overflow-y-auto shadow-lg">
                                  <CardContent className="px-2 flex items-center h-full">
                                    <div className="flex flex-row items-center w-full">
                                      {/* Left: VIP graphic */}
                                      <div className="flex-shrink-0 pr-4 flex items-center justify-center h-full">
                                        <img
                                          src="/graphene.png"
                                          alt="Graphene VIP Upgrade"
                                          className="w-16 rounded-md object-contain"
                                        />
                                      </div>

                                      {/* Right: copy & value points */}
                                      <div className="flex-grow">
                                        <h3 className="text-base font-semibold mb-1 flex items-center">
                                          Graphene‑Fortified Shell
                                          <span className="ml-2 inline-block text-xs font-bold px-2 py-0.5 rounded-full bg-yellow-400/80 text-yellow-900">
                                            VIP
                                          </span>
                                        </h3>

                                        <p className="text-sm mb-1">200 × stronger than steel</p>
                                        <p className="mt-2 text-sm font-bold">
                                          Valued At <span className="text-green-700">$3,200</span>
                                          <span className="block text-xs font-normal text-muted-foreground">Included at No Extra Charge</span>
                                        </p>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                                
                                {/* Extra Pavers VIP Card */}
                                <Card className="p-4 overflow-y-auto shadow-lg">
                                  <CardContent className="px-2 flex items-center h-full">
                                    <div className="flex flex-row items-center w-full">
                                      {/* Left: VIP graphic */}
                                      <div className="flex-shrink-0 pr-4 flex items-center justify-center h-full">
                                        <img
                                          src="/coping.png"
                                          alt="Extra Pavers VIP Upgrade"
                                          className="w-16 rounded-md object-contain"
                                        />
                                      </div>

                                      {/* Right: copy & value points */}
                                      <div className="flex-grow">
                                        <h3 className="text-base font-semibold mb-1 flex items-center">
                                          Extra Deep‑End Paving Row
                                          <span className="ml-2 inline-block text-xs font-bold px-2 py-0.5 rounded-full bg-yellow-400/80 text-yellow-900">
                                            VIP
                                          </span>
                                        </h3>

                                        <p className="text-sm mb-1">1 extra row of coping pavers at deep end</p>
                                        <p className="mt-2 text-sm font-bold">
                                          Valued At <span className="text-green-700">$850</span>
                                          <span className="block text-xs font-normal text-muted-foreground">Included at No Extra Charge</span>
                                        </p>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                                
                                {/* Quad Lid VIP Card */}
                                <Card className="p-4 overflow-y-auto shadow-lg">
                                  <CardContent className="px-2 flex items-center h-full">
                                    <div className="flex flex-row items-center w-full">
                                      {/* Left: VIP graphic */}
                                      <div className="flex-shrink-0 pr-4 flex items-center justify-center h-full">
                                        <img
                                          src="/quadlid.png"
                                          alt="Quad Skimmer Lid"
                                          className="w-16 rounded-md object-contain"
                                        />
                                      </div>

                                      {/* Right: copy & value points */}
                                      <div className="flex-grow">
                                        <h3 className="text-base font-semibold mb-1 flex items-center">
                                          Quad Skimmer Lid
                                          <span className="ml-2 inline-block text-xs font-bold px-2 py-0.5 rounded-full bg-yellow-400/80 text-yellow-900">
                                            VIP
                                          </span>
                                        </h3>

                                        <p className="text-sm mb-1">Quad‑lock design stays flush & secure</p>
                                        <p className="mt-2 text-sm font-bold">
                                          Valued At <span className="text-green-700">$450</span>
                                          <span className="block text-xs font-normal text-muted-foreground">Included at No Extra Charge</span>
                                        </p>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    )}
                    
                    {/* Concrete & Paving Section */}
                    {id === CATEGORY_IDS.CONCRETE_PAVING && (
                      <AnimatePresence mode="wait">
                        {sub === 1 && (
                          <CostTableCard
                            key="cp-metrics"
                            title="Concrete & Paving – Cost Metrics"
                            rows={pavingMetricsRows}
                            total={pavingMetricsTotal}
                            variants={cardFade}
                          />
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
                          </CardContent>
                        </Card>
                        
                        {/* Salesperson Profile Card */}
                        <Card className="w-full p-5">
                          <CardContent className="px-0">
                            <div className="flex items-start">
                              <div className="flex-shrink-0 mr-4">
                                <img 
                                  src="/Jonah.jpeg" 
                                  alt="Jonah" 
                                  className="h-16 w-16 rounded-full object-cover border-2 border-[#DB9D6A]" 
                                />
                              </div>
                              <div className="flex-1">
                                <h3 className="text-base font-semibold">Thanks for Meeting with Jonah!</h3>
                                <div className="mt-1 space-y-1 mb-3">
                                  <div className="flex items-center text-sm">
                                    <Phone className="h-3.5 w-3.5 text-[#DB9D6A] mr-2" />
                                    <span>0412 345 678</span>
                                  </div>
                                  <div className="flex items-center text-sm">
                                    <Mail className="h-3.5 w-3.5 text-[#DB9D6A] mr-2" />
                                    <span>jonah@mfppools.com.au</span>
                                  </div>
                                </div>
                                <div className="mt-3 pt-3 border-t border-[#DB9D6A]/20">
                                  <p className="text-sm italic text-muted-foreground">
                                    "Thanks Bella and Beau, excited to see your Verona Pool in the ground"
                                  </p>
                                </div>
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