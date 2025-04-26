'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as SM from '@/state/sectionMachine';
import { useJsApiLoader } from '@react-google-maps/api';
import type { ProposalData } from '@/types/proposal';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { Separator } from '@/components/ui/separator';
import { Mail, MessageSquare, Phone, Home, Wrench, Square, Layers, BarChart2, Filter, Star, ShieldCheck, Handshake, HelpCircle, Zap, Droplet, Sun, PackageCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from 'framer-motion';
import Image from "next/image";
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import SectionJumpSelect from './components/SectionJumpSelect/SectionJumpSelect';
import VisualColumn from './components/VisualColumn/VisualColumn';
import { 
  CustomerInfoCards, 
  FiltrationMaintenanceCards, 
  ConcretePavingCards, 
  FencingCards, 
  RetainingWallCards, 
  WaterFeatureCards, 
  AddOnCards 
} from './components/sections';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


/* ─── direction (shared mutable ref) ─────────────────────────────────── */
const lastDir: { current: 1 | -1 } = { current: 1 };   // +1 = down, -1 = up

/* ─── timing constants ──────────────────────────────────────────────── */
const F_OUT   = 0.35;      // section & visual fade-out
const F_IN    = 0.45;      // fade-in duration
const STAGGER = 0.15;      // delay before content column flies in

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

// Define category IDs in order of user interest
const CATEGORY_IDS = {
  CUSTOMER_INFO: 'customer-info-section',
  POOL_SELECTION: 'pool-selection-section',
  FILTRATION_MAINTENANCE: 'filtration-maintenance-section',
  CONCRETE_PAVING: 'concrete-paving-section',
  FENCING: 'fencing-section',
  RETAINING_WALLS: 'retaining-walls-section',
  WATER_FEATURE: 'water-feature-section',
  ADD_ONS: 'add-ons-section',
  SITE_REQUIREMENTS: 'site-requirements-section',
};

// Mapping IDs to names
const CATEGORY_NAMES: { [key: string]: string } = {
  [CATEGORY_IDS.CUSTOMER_INFO]: 'Welcome',
  [CATEGORY_IDS.POOL_SELECTION]: 'Pool Selection',
  [CATEGORY_IDS.FILTRATION_MAINTENANCE]: 'Pool Filtration',
  [CATEGORY_IDS.SITE_REQUIREMENTS]: 'Pool Installation',
  [CATEGORY_IDS.CONCRETE_PAVING]: 'Concrete & Paving',
  [CATEGORY_IDS.RETAINING_WALLS]: 'Retaining Walls',
  [CATEGORY_IDS.FENCING]: 'Fencing',
  [CATEGORY_IDS.WATER_FEATURE]: 'Water Feature',
  [CATEGORY_IDS.ADD_ONS]: 'Extras & Upgrades',
};


export interface ProposalViewerProps { initialData: ProposalData }
export default function ProposalViewer({ initialData }: ProposalViewerProps) {
  const proposalData = initialData;
  const [machineState, setMachineState] = useState<SM.State>(SM.initialState);
  const [dir, setDir] = useState<1 | -1>(1);   // +1 = forward, -1 = back
  // Add state for drawer cards in add-ons section
  // State for add-on drawer cards
  const [spaJetsOpen, setSpaJetsOpen] = useState<boolean>(false);
  const [deckJetsOpen, setDeckJetsOpen] = useState<boolean>(false);
  const [poolHeatingOpen, setPoolHeatingOpen] = useState<boolean>(false);
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

  // Sections that have sub-sections
  const SECTIONS_WITH_SUBSECTIONS = [
    CATEGORY_IDS.POOL_SELECTION,
    CATEGORY_IDS.SITE_REQUIREMENTS
  ];
  
  // Filtration and Maintenance items
  const filtrationItems = [
    {name: 'Energy-saving Pureswim pump', benefit: 'cuts running costs by up to 70%', icon: <Zap />, price: 930.04, sku: 'Theraflo TVS 1.25 hp'},
    {name: 'Oversize cartridge filter', benefit: 'fewer cleans, crystal clear water', icon: <Filter />, price: 567.68, sku: 'Theraclear 180 SQF Cartridge'},
    {name: 'Smart chlorinator', benefit: 'automatic, reliable sanitation', icon: <Droplet />, price: 981.85, sku: 'VP25 – Vapure 25 G'},
    {name: 'Multi-colour LED light', benefit: 'creates stunning night-time ambience', icon: <Sun />, price: 396.0, sku: 'Premium LED Light'}
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
  const { pavingCostSummary } = paving;
  // Calculate section total manually since it's not in the type
  const sectionTotal = pavingCostSummary.totalCost + 
    (paving.extraConcreting?.costSummary?.totalCost || 0) + 
    (paving.concretePump?.totalCost || 0) + 
    (paving.concreteCuts?.totalCost || 0) + 
    (paving.underFenceConcreteStrips?.totalCost || 0);
  
  /* ── Concrete & Paving – fixed cost metrics (for Card #1) ────────────── */
  const pavingMetricsRows: Array<{name: string; cost: number; benefit?: string}> = [
    {
      name: `Extra Paving + Concrete (${pavingCostSummary.areaM2} m² @ ${pavingCostSummary.ratePerM2}/m²)`,
      cost: pavingCostSummary.totalCost,
      benefit: 'Premium finish around pool'
    },
    {
      name: `Extra Concrete (${paving.extraConcreting?.meterageM2} m² @ ${paving.extraConcreting?.costSummary?.ratePerM2}/m²)`,
      cost: paving.extraConcreting?.costSummary?.totalCost || 0,
      benefit: 'Additional patio area'
    },
    {
      name: `Concrete Pump (${paving.concretePump.numberOfDaysRequired} day${paving.concretePump.numberOfDaysRequired>1?'s':''})`,
      cost: paving.concretePump.totalCost,
      benefit: 'Precision concrete placement'
    },
    {
      name: `Under-Fence Concrete Strips (${paving.underFenceConcreteStrips?.lengthMeters} m @ ${paving.underFenceConcreteStrips?.ratePerLm}/Lm)`,
      cost: paving.underFenceConcreteStrips?.totalCost || 0,
      benefit: 'Secure fence foundation'
    },
    {
      name: `Concrete Cuts (${paving.concreteCuts?.quantity || 0} × ${paving.concreteCuts?.cutType || 'Standard'} @ $${paving.concreteCuts?.costPerCut || 0} each)`,
      cost: paving.concreteCuts?.totalCost || 0,
      benefit: 'Expansion joints for durability'
    }
  ];

  const pavingMetricsTotal =
    pavingMetricsRows.reduce((sum, r) => sum + r.cost, 0);
  
  const concretePavingSubSectionsData = [
    { type: 'options', data: paving },
    { type: 'metrics', data: paving }
  ];
  
  // Pool Installation subsection data
  const installationSubSectionsData = [
    { type: 'pricing', data: { 
      siteRequirements: proposalData.siteRequirements,
      poolSelection: proposalData.poolSelection,
      electrical: proposalData.electrical
    }},
    { type: 'details', data: {
      fixedCosts: proposalData.poolSelection.fixedCosts,
      individualCosts: proposalData.poolSelection.individualCosts
    }}
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
    {name: `Square meters covered`, benefit: `${paving.squareMeters ?? '—'}m² perfectly finished`},
    {name: `Category selected`, benefit: paving.pavingCategory ?? 'Custom'},
    {name: `Rate per m²`, benefit: `${(pavingCostSummary.ratePerM2).toFixed(2)}/m²`, value: `${pavingCostSummary.ratePerM2}`},
    {name: `Concrete type`, benefit: paving.extraConcreting?.concreteType ?? 'Standard finish'},
    {name: `Reinforcement included`, benefit: 'durability guaranteed'}
  ];
  // Helper for left-column visuals based on section and sub-section
  const getLeftColumnVisual = (sectionId: string | null, subIndex: number) => {
    switch (sectionId) {
      case CATEGORY_IDS.CUSTOMER_INFO:
        return { type: 'map', address: proposalData.customerInfo.propertyDetails.fullAddress };
      case CATEGORY_IDS.POOL_SELECTION:
        if (sub === 0) return { type: 'video', videoName: 'Sheffield' };
        if (sub === 1) return { type: 'image', src: '/_opt/silvermist-water.webp', alt: 'Pool Water Colour' };
        if (sub === 2) return { type: 'placeholder', name: 'Swim-Ready Essentials' };
        if (sub === 3) return { type: 'placeholder', name: 'Site-Work & Compliance' };
        return { type: 'video', videoName: 'Sheffield' };
      case CATEGORY_IDS.FILTRATION_MAINTENANCE:
        return { type: 'video', videoName: 'fire', alt: 'Pool Filtration' };
      case CATEGORY_IDS.CONCRETE_PAVING:
        if (sub === 0) return { type: 'image', src: '/_opt/pavers.webp', alt: 'Paving Options' };
        if (sub === 1) return { type: 'image', src: '/_opt/paving.webp', alt: 'Paving & Concrete Cost Metrics' };
        return { type: 'image', src: '/_opt/paving.webp', alt: 'Paving & Concrete' };
      case CATEGORY_IDS.FENCING:
        return { type: 'image', src: '/_opt/fencing.webp', alt: 'Fencing' };
      case CATEGORY_IDS.RETAINING_WALLS:
        return { type: 'image', src: '/_opt/RetainingWallImagery.webp', alt: 'Paving & Concrete' };
      case CATEGORY_IDS.WATER_FEATURE:
        return { type: 'video', videoName: 'WaterFeature', alt: 'Water Feature' };
      case CATEGORY_IDS.ADD_ONS:
        return { type: 'image', src: '/_opt/lighting.webp', alt: 'Extras & Upgrades' };
      case CATEGORY_IDS.SITE_REQUIREMENTS:
        if (sub === 0) return { type: 'placeholder', name: 'Pool Installation Pricing' };
        if (sub === 1) return { type: 'placeholder', name: 'Installation Details' };
        return { type: 'placeholder', name: 'Pool Installation' };
      default:
        return { type: 'placeholder', name: 'Loading...' };
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
  // Disabled scroll wheel based trigger for section changes
  // Now relying only on the navigation menu for section changes
  // Original mobile check is preserved for reference
  // if (typeof window !== 'undefined' && window.innerWidth < 1024) return;
  
  // No preventDefault to allow normal scrolling within sections
  return;
}, []);

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

    // Lock scroll briefly to prevent wheel handler interference
    scrollLock.current = true;
    setTimeout(() => { scrollLock.current = false; }, 150); // Slightly longer than animation? Adjust as needed.
  }
}, [machineState.index]); // Dependency ensures closure captures the current index
  
  // Simplified video control - don't use the complex ref system
  useEffect(() => {
    console.log(`Section changed to: ${activeSection}`);
    // Videos should auto-play when rendered with the appropriate attributes
  }, [activeSection]);

  // Debug effect to log state changes
  useEffect(() => {
    console.log(`State Changed - Active Section: ${activeSection}`);
  }, [activeSection]);
  
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
          onWheel={handleWheel}
          className="order-2 lg:order-1 w-full lg:w-1/3 proposal-left pb-5 lg:pb-0 lg:sticky lg:top-16 lg:h-[calc(100vh-8rem)] lg:overflow-y-auto proposal-content relative"> {/* Ensure relative positioning */}
          <AnimatePresence 
            mode="wait"
            onExitComplete={resetScroll}>
            {Object.entries(CATEGORY_IDS).map(([key, id]) => {
              if (activeSection !== id) return null;      // render only the current one

              const isMultiCardSection = SECTIONS_WITH_SUBSECTIONS.includes(id);
              const isCustomerInfo = id === CATEGORY_IDS.CUSTOMER_INFO;

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
                        {id === CATEGORY_IDS.POOL_SELECTION && sub === 0 && (
                          <motion.div
                            key="pool-details"
                            variants={subCardFade}
                            initial="initial"
                            animate="enter"
                            exit="exit"
                            className="w-full min-h-[80vh] py-4"
                          >
                            <div className="flex flex-col space-y-6">
                              {/* Pool Dimensions Card with Hero Image */}
                              <Card className="w-full overflow-y-auto shadow-lg">
                                <div className="w-full relative">
                                  <div className="overflow-hidden h-48">
                                    <Image 
                                      src="/_opt/verona-hero.webp" 
                                      alt="Verona Pool" 
                                      className="w-full h-full object-cover object-top" 
                                      width={800}
                                      height={450}
                                    />
                                    {/* Overlay layout image - bottom right positioning */}
                                    <div className="absolute bottom-0 right-0 p-4">
                                      <Image 
                                        src="/_opt/verona_layout.webp" 
                                        alt="Verona Pool Layout" 
                                        className="w-28 object-contain"
                                        width={112} 
                                        height={80}
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
                              
                              
                              {/* Pool Price Summary Card */}
                              <Card className="w-full shadow-lg">
                                <CardContent className="p-5">
                                  <div className="flex justify-between items-baseline">
                                    <p className="font-semibold">Base Pool Price</p>
                                    <p className="text-xl font-bold">${proposalData.poolSelection.costSummary.totalCost.toLocaleString()}</p>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          </motion.div>
                        )}
                        {/* Pool Selection Colour Guard */}
                        {id === CATEGORY_IDS.POOL_SELECTION && sub === 1 && (
                          <motion.div
                            key="colour-guard"
                            variants={subCardFade}
                            initial="initial"
                            animate="enter"
                            exit="exit"
                            className="w-full min-h-[80vh] py-4"
                          >
                             {/* VIP Inclusions */}  
                            <div className="flex flex-col space-y-6">
                              <p className="text-white text-sm mb-4">
                                We go beyond the industry standard installation inclusions. All MFP installation customers receive our VIP treatment. From industry leading materials to the final touches that make your pool yours.
                              </p>
                              <div className="flex flex-col space-y-4">
                                {/* ColourGuard VIP Card */}
                                <Card className="p-4 overflow-y-auto shadow-lg">
                                  <CardContent className="px-2 flex items-center h-full">
                                    <div className="flex flex-row items-center w-full">
                                      {/* Left: VIP graphic */}
                                      <div className="flex-shrink-0 pr-4 flex items-center justify-center h-full">
                                        <Image
                                          src="/_opt/silver_mist_half_circle.webp"
                                          alt="ColourGuard® Silver Mist"
                                          className="w-16 h-16 object-contain transform rotate-90"
                                          width={64}
                                          height={64}
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
                                        <Image
                                          src="/_opt/graphene.webp"
                                          alt="Graphene VIP Upgrade"
                                          className="w-16 rounded-md object-contain"
                                          width={64}
                                          height={64}
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
                                        <Image
                                          src="/_opt/coping.webp"
                                          alt="Extra Pavers VIP Upgrade"
                                          className="w-16 rounded-md object-contain"
                                          width={64}
                                          height={64}
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
                                        <Image
                                          src="/_opt/quadlid.webp"
                                          alt="Quad Skimmer Lid"
                                          className="w-16 rounded-md object-contain"
                                          width={64}
                                          height={64}
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
                        
                        {/* Pool Installation Subsections */}
                        {id === CATEGORY_IDS.SITE_REQUIREMENTS && sub === 0 && (
                          <motion.div
                            key="installation-pricing"
                            variants={subCardFade}
                            initial="initial"
                            animate="enter"
                            exit="exit"
                            className="w-full min-h-[80vh] py-4"
                          >
                            <div className="space-y-6 h-full overflow-y-auto">
                              {/* Pool Installation Section Cards */}
                              <Card className="w-full shadow-lg">
                                <CardContent className="p-5 space-y-6">
                                  <div className="mb-2">
                                    <h3 className="text-base font-semibold">Pool Installation</h3>
                                    <p className="text-sm text-muted-foreground">Comprehensive pool installation and site preparation</p>
                                  </div>
                                  
                                  <Separator className="mb-4" />
                                  
                                  {/* Pool Installation cost breakdown */}
                                  <div className="space-y-3">
                                    <div className="flex justify-between">
                                      <div>
                                        <p className="text-sm font-medium">Pool Installation</p>
                                        <p className="text-xs text-muted-foreground">Fixed costs + variable costs (labor, materials, certifications)</p>
                                      </div>
                                      <p className="font-medium whitespace-nowrap">${(proposalData.poolSelection.totalFixedCosts + proposalData.poolSelection.totalIndividualCosts).toLocaleString()}</p>
                                    </div>
                                    
                                    <div className="flex justify-between">
                                      <div>
                                        <p className="text-sm font-medium">Franna Crane ({proposalData.siteRequirements.standardSiteRequirements.craneSelection.type})</p>
                                        <p className="text-xs text-muted-foreground">Precision pool placement</p>
                                      </div>
                                      <p className="font-medium whitespace-nowrap">${proposalData.siteRequirements.standardSiteRequirements.craneSelection.cost.toLocaleString()}</p>
                                    </div>
                                    
                                    <div className="flex justify-between">
                                      <div>
                                        <p className="text-sm font-medium">Bobcat ({proposalData.siteRequirements.standardSiteRequirements.bobcatSelection.type})</p>
                                        <p className="text-xs text-muted-foreground">Site excavation and preparation</p>
                                      </div>
                                      <p className="font-medium whitespace-nowrap">${proposalData.siteRequirements.standardSiteRequirements.bobcatSelection.cost.toLocaleString()}</p>
                                    </div>
                                    
                                    {proposalData.siteRequirements.standardSiteRequirements.trafficControl.cost > 0 && (
                                      <div className="flex justify-between">
                                        <div>
                                          <p className="text-sm font-medium">Traffic Control ({proposalData.siteRequirements.standardSiteRequirements.trafficControl.level})</p>
                                          <p className="text-xs text-muted-foreground">Safe site access</p>
                                        </div>
                                        <p className="font-medium whitespace-nowrap">${proposalData.siteRequirements.standardSiteRequirements.trafficControl.cost.toLocaleString()}</p>
                                      </div>
                                    )}
                                    
                                    {proposalData.siteRequirements.customSiteRequirements && 
                                     proposalData.siteRequirements.customSiteRequirements[0] && 
                                     typeof proposalData.siteRequirements.customSiteRequirements[0] === 'object' && (
                                      <div className="flex justify-between">
                                        <div>
                                          <p className="text-sm font-medium">{proposalData.siteRequirements.customSiteRequirements[0].description}</p>
                                          <p className="text-xs text-muted-foreground">Custom site requirement</p>
                                        </div>
                                        <p className="font-medium whitespace-nowrap">${proposalData.siteRequirements.customSiteRequirements[0].price.toLocaleString()}</p>
                                      </div>
                                    )}
                                    
                                    {/* Electrical Section Items */}
                                    <div className="pt-4 pb-0">
                                      <p className="text-sm font-medium mb-1">Electrical Requirements</p>
                                      <Separator className="mb-1" />
                                    </div>
                                    
                                    {proposalData.electrical.standardPower.isSelected && (
                                      <div className="flex justify-between">
                                        <div>
                                          <p className="text-sm font-medium">Standard Power Circuit</p>
                                          <p className="text-xs text-muted-foreground">Power supply for pool equipment</p>
                                        </div>
                                        <p className="font-medium whitespace-nowrap">${proposalData.electrical.standardPower.rate.toLocaleString()}</p>
                                      </div>
                                    )}
                                    
                                    {proposalData.electrical.addOnFenceEarthing.isSelected && (
                                      <div className="flex justify-between">
                                        <div>
                                          <p className="text-sm font-medium">Fence Earthing</p>
                                          <p className="text-xs text-muted-foreground">Safety grounding for metal fences</p>
                                        </div>
                                        <p className="font-medium whitespace-nowrap">${proposalData.electrical.addOnFenceEarthing.rate.toLocaleString()}</p>
                                      </div>
                                    )}
                                    
                                    {proposalData.electrical.heatPumpCircuit.isSelected && (
                                      <div className="flex justify-between">
                                        <div>
                                          <p className="text-sm font-medium">Heat Pump Circuit</p>
                                          <p className="text-xs text-muted-foreground">Dedicated circuit for heating system</p>
                                        </div>
                                        <p className="font-medium whitespace-nowrap">${proposalData.electrical.heatPumpCircuit.rate.toLocaleString()}</p>
                                      </div>
                                    )}
                                  </div>
                                  
                                  <Separator className="mb-3" />
                                  
                                  {/* Grand total */}
                                  <div className="flex justify-between items-baseline mt-1">
                                    <p className="font-semibold">Total Installation Price</p>
                                    <p className="text-xl font-bold">${(
                                      proposalData.poolSelection.totalFixedCosts + 
                                      proposalData.poolSelection.totalIndividualCosts + 
                                      proposalData.siteRequirements.costSummary.totalCost + 
                                      proposalData.electrical.costSummary.totalCost
                                    ).toLocaleString()}</p>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          </motion.div>
                        )}
                        
                        {id === CATEGORY_IDS.SITE_REQUIREMENTS && sub === 1 && (
                          <motion.div
                            key="installation-details"
                            variants={subCardFade}
                            initial="initial"
                            animate="enter"
                            exit="exit"
                            className="w-full min-h-[80vh] py-4"
                          >
                            <div className="space-y-6">
                              
                              {/* Installation Details Card */}
                              <Card className="w-full shadow-lg">
                                <CardContent className="p-5 space-y-5">
                                  <div className="mb-2">
                                    <h3 className="text-base font-semibold">Installation Standards & Safety</h3>
                                    <p className="text-sm text-muted-foreground">Quality assurance and compliance measures</p>
                                  </div>
                                  
                                  <Separator className="mb-4" />
                                  
                                  <div className="space-y-5">
                                    <div className="flex items-start gap-4">
                                      <div className="h-10 w-10 mt-0.5 rounded-md bg-[#DB9D6A]/10 flex items-center justify-center">
                                        <Layers className="h-6 w-6 text-[#DB9D6A]" />
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium">Council Certification & CAD Plans</p>
                                        <p className="text-xs text-muted-foreground mt-1">We handle all required local council certifications and provide detailed CAD plans for approval. All paperwork is managed by our experienced team so you don't have to worry about the administrative details.</p>
                                      </div>
                                    </div>
                                    
                                    <Separator />
                                    
                                    <div className="flex items-start gap-4">
                                      <div className="h-10 w-10 mt-0.5 rounded-md bg-[#DB9D6A]/10 flex items-center justify-center">
                                        <ShieldCheck className="h-6 w-6 text-[#DB9D6A]" />
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium">Engineer Sign-off to AS1839-2021</p>
                                        <p className="text-xs text-muted-foreground mt-1">Your pool is built to meet or exceed the Australian Standard AS1839-2021. Our professional engineers provide complete sign-off documentation to ensure your installation meets all safety and construction requirements.</p>
                                      </div>
                                    </div>
                                    
                                    <Separator />
                                    
                                    <div className="flex items-start gap-4">
                                      <div className="h-10 w-10 mt-0.5 rounded-md bg-[#DB9D6A]/10 flex items-center justify-center">
                                        <Square className="h-6 w-6 text-[#DB9D6A]" />
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium">Temporary Safety Fencing (8 Weeks)</p>
                                        <p className="text-xs text-muted-foreground mt-1">During your pool installation, we provide compliant temporary safety fencing for 8 weeks, ensuring your property remains safe and meets all legal requirements during the construction phase.</p>
                                      </div>
                                    </div>
                                    
                                    <Separator />
                                    
                                    <div className="flex items-start gap-4">
                                      <div className="h-10 w-10 mt-0.5 rounded-md bg-[#DB9D6A]/10 flex items-center justify-center">
                                        <Handshake className="h-6 w-6 text-[#DB9D6A]" />
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium">Professional Handover & Training</p>
                                        <p className="text-xs text-muted-foreground mt-1">When your pool is complete, we provide professional handover services including thorough cleaning, water chemistry setup, and personalized training on maintenance and equipment operation to ensure you're fully confident with your new pool.</p>
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          </motion.div>
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
                        metricsRows={pavingMetricsRows} 
                        metricsTotal={pavingMetricsTotal} 
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