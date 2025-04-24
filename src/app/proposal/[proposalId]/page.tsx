'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react'; // Import useCallback
import * as SM from '@/state/sectionMachine';
import { useJsApiLoader, GoogleMap, Marker } from '@react-google-maps/api';
import exampleProposal from '@/data/exampleproposal.json';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from "@/components/ui/button"; // Import Button
import { Separator } from '@/components/ui/separator';
import { Mail, MessageSquare, Phone, Home, Wrench, Square, Layers, BarChart2, Filter, Star, ShieldCheck, Handshake, HelpCircle, Zap, Droplet, Sun, PackageCheck, ChevronDown, ChevronUp } from 'lucide-react';
// Mock data import for initialising page
import { cn } from "@/lib/utils";
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
      <Card className="w-full shadow-lg">
        <CardContent className="p-5 space-y-6">
          <div className="mb-2">
            <h3 className="text-base font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">Complete details of your paving and concrete package</p>
          </div>
          
          <Separator className="mb-4" />
          
          <div className="space-y-3">
            {rows.map(row => (
              <div key={row.name} className="flex justify-between">
                <div>
                  <p className="text-sm font-medium">{row.name}</p>
                  {row.benefit && (
                    <p className="text-xs text-muted-foreground">{row.benefit}</p>
                  )}
                </div>
                <p className="font-medium whitespace-nowrap">${row.cost.toLocaleString()}</p>
              </div>
            ))}
          </div>
          
          <Separator className="mb-3" />
          
          <div className="flex justify-between items-baseline mt-1">
            <p className="font-semibold">Total Price</p>
            <p className="text-xl font-bold">${total.toLocaleString()}</p>
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

export const dynamic = 'force-dynamic';

export default function ProposalPage() {
  const params = useParams<{ proposalId: string }>();
  const proposalId = params.proposalId;
  // Initialise mock proposal data for rendering
  const proposalData = exampleProposal.quote;
  const [machineState, setMachineState] = useState<SM.State>(SM.initialState);
  const [dir, setDir] = useState<1 | -1>(1);   // +1 = forward, -1 = back
  const [priceCardExpanded, setPriceCardExpanded] = useState<boolean>(false); // State for price card expansion
  const [sitePlanExpanded, setSitePlanExpanded] = useState<boolean>(false); // State for site plan expansion
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
  const { pavingCostSummary, sectionTotal } = paving;
  
  /* ── Concrete & Paving – fixed cost metrics (for Card #1) ────────────── */
  const pavingMetricsRows: CostItem[] = [
    {
      name: `Extra Paving + Concrete  (${pavingCostSummary.areaM2} m²  @  ${pavingCostSummary.ratePerM2}/m²)`,
      cost: pavingCostSummary.totalCost,
      benefit: 'Premium finish around pool'
    },
    {
      name: `Extra Concrete  (${paving.extraConcreting?.meterageM2} m²  @  ${paving.extraConcreting?.costSummary?.ratePerM2}/m²)`,
      cost: paving.extraConcreting?.costSummary?.totalCost || 0,
      benefit: 'Additional patio area'
    },
    {
      name: `Concrete Pump  (${paving.concretePump.numberOfDaysRequired} day${paving.concretePump.numberOfDaysRequired>1?'s':''})`,
      cost: paving.concretePump.totalCost,
      benefit: 'Precision concrete placement'
    },
    {
      name: `Under-Fence Concrete Strips  (${paving.underFenceConcreteStrips?.lengthMeters} m  @  ${paving.underFenceConcreteStrips?.ratePerLm}/Lm)`,
      cost: paving.underFenceConcreteStrips?.totalCost || 0,
      benefit: 'Secure fence foundation'
    },
    {
      name: `Concrete Cuts  (${paving.concreteCuts?.quantity || 0} × ${paving.concreteCuts?.cutType || 'Standard'} @ $${paving.concreteCuts?.costPerCut || 0} each)`,
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
        if (sub === 0) return { type: 'video', src: '/Sheffield.mov' };
        if (sub === 1) return { type: 'image', src: '/silvermist-water.jpg', alt: 'Pool Water Colour' };
        if (sub === 2) return { type: 'placeholder', name: 'Swim-Ready Essentials' };
        if (sub === 3) return { type: 'placeholder', name: 'Site-Work & Compliance' };
        return { type: 'video', src: '/Sheffield.mov' };
      case CATEGORY_IDS.FILTRATION_MAINTENANCE:
        return { type: 'video', src: '/fire.mp4', alt: 'Pool Filtration' };
      case CATEGORY_IDS.CONCRETE_PAVING:
        if (sub === 0) return { type: 'image', src: '/pavers.png', alt: 'Paving Options' };
        if (sub === 1) return { type: 'image', src: '/paving.jpg', alt: 'Paving & Concrete Cost Metrics' };
        return { type: 'image', src: '/paving.jpg', alt: 'Paving & Concrete' };
      case CATEGORY_IDS.FENCING:
        return { type: 'image', src: '/fencing.jpg', alt: 'Fencing' };
      case CATEGORY_IDS.RETAINING_WALLS:
        return { type: 'image', src: '/RetainingWallImagery.jpg', alt: 'Paving & Concrete' };
      case CATEGORY_IDS.WATER_FEATURE:
        return { type: 'video', src: '/WaterFeature.mp4', alt: 'Water Feature' };
      case CATEGORY_IDS.ADD_ONS:
        return { type: 'image', src: '/lighting.jpg', alt: 'Extras & Upgrades' };
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
        {/* Left Column - Scrollable Content */}
        <div ref={scrollColumnRef}
          onWheel={handleWheel}
          className="w-1/3 proposal-left h-[calc(100vh-8rem)] overflow-hidden touch-none proposal-content relative"> {/* Ensure relative positioning */}
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
                  ) : (
                    <div className="flex items-center justify-between">
                      <h2 className="font-bold font-sans text-white text-3xl">
                        {id === CATEGORY_IDS.POOL_SELECTION ? 
                          'Your Selected Pool' : 
                          id === CATEGORY_IDS.CONCRETE_PAVING ? 
                            'Concrete & Paving' : 
                            CATEGORY_NAMES[id]
                        }
                      </h2>
                      
                      <span className="inline-block text-xs font-medium px-2 py-1 rounded-full bg-[#DB9D6A]/80 text-white">
                        {(id === CATEGORY_IDS.POOL_SELECTION || id === CATEGORY_IDS.FILTRATION_MAINTENANCE || 
                           id === CATEGORY_IDS.SITE_REQUIREMENTS) && 'Base Pool & Inclusions'}
                        {(id === CATEGORY_IDS.FENCING || id === CATEGORY_IDS.CONCRETE_PAVING || 
                           id === CATEGORY_IDS.WATER_FEATURE || id === CATEGORY_IDS.RETAINING_WALLS) && 'Poolscape Options'}
                        {id === CATEGORY_IDS.ADD_ONS && 'Extras & Upgrades'}
                      </span>
                    </div>
                  )}
                </div>

                {/* --- Content Area --- */}
                {isMultiCardSection ? (
                  <>
                    {/* Render MULTIPLE cards with better transitions */}
                    {(id === CATEGORY_IDS.POOL_SELECTION || id === CATEGORY_IDS.SITE_REQUIREMENTS) && (
                      <AnimatePresence mode="wait">
                        {/* Pool Selection Subsections */}
                        {id === CATEGORY_IDS.POOL_SELECTION && sub === 0 && (
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
                            variants={cardFade}
                            initial="enter"
                            animate="center"
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
                        
                        {/* Pool Installation Subsections */}
                        {id === CATEGORY_IDS.SITE_REQUIREMENTS && sub === 0 && (
                          <motion.div
                            key="installation-pricing"
                            variants={cardFade}
                            initial="enter"
                            animate="center"
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
                            variants={cardFade}
                            initial="enter"
                            animate="center"
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
                    className="subsection-content w-full min-h-[80vh] py-4 transition-opacity duration-300 ease-in-out opacity-100"
                  >
                    {id === CATEGORY_IDS.CONCRETE_PAVING ? (
                      <div className="space-y-6 h-full overflow-y-auto">
                        {/* Concrete & Paving Section Cards */}
                        <Card className="w-full shadow-lg">
                          <CardContent className="p-5 space-y-6">
                            <div className="mb-2">
                              <h3 className="text-base font-semibold">Concrete & Paving</h3>
                              <p className="text-sm text-muted-foreground">Premium surfaces and finishes for your pool area</p>
                            </div>
                            
                            <Separator className="mb-4" />
                            
                            {/* Concrete & Paving cost breakdown */}
                            <div className="space-y-3">
                              {pavingMetricsRows.map(row => (
                                <div key={row.name} className="flex justify-between">
                                  <div>
                                    <p className="text-sm font-medium">{row.name}</p>
                                    {row.benefit && (
                                      <p className="text-xs text-muted-foreground">{row.benefit}</p>
                                    )}
                                  </div>
                                  <p className="font-medium whitespace-nowrap">${row.cost.toLocaleString()}</p>
                                </div>
                              ))}
                            </div>
                            
                            <Separator className="mb-3" />
                            
                            {/* Grand total */}
                            <div className="flex justify-between items-baseline mt-1">
                              <p className="font-semibold">Total Price</p>
                              <p className="text-xl font-bold">${pavingMetricsTotal.toLocaleString()}</p>
                            </div>
                          </CardContent>
                        </Card>
                        
                        {/* 3DStone Paver VIP Card */}
                        <Card className="p-4 overflow-y-auto shadow-lg">
                          <CardContent className="px-2 flex items-center h-full">
                            <div className="flex flex-row items-center w-full">
                              {/* Left: VIP graphic */}
                              <div className="flex-shrink-0 pr-4 flex items-center justify-center h-full">
                                <img
                                  src="/3dstone.png"
                                  alt="Premium 3DStone Paver"
                                  className="w-16 h-16 rounded-md object-contain"
                                />
                              </div>
                              
                              {/* Right: copy & value points */}
                              <div className="flex-grow">
                                <h3 className="text-base font-semibold mb-1 flex items-center">
                                  Premium&nbsp;<i>3D Stone</i>&nbsp;Paver
                                  <span className="ml-2 inline-block text-xs font-bold px-2 py-0.5 rounded-full bg-yellow-400/80 text-yellow-900">
                                    VIP
                                  </span>
                                </h3>
                                
                                <p className="text-sm mb-1">Natural stone texture with superior durability</p>
                                <p className="mt-2 text-sm font-bold">
                                  Valued At <span className="text-green-700">$1,850</span>
                                  <span className="block text-xs font-normal text-muted-foreground">Included at No Extra Charge</span>
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    ) : id === CATEGORY_IDS.FILTRATION_MAINTENANCE ? (
                      <div className="space-y-6 h-full overflow-y-auto">
                        {/* Main Filtration Equipment Card */}
                        <Card className="w-full shadow-lg">
                          <CardContent className="p-5 space-y-6">
                            <div className="mb-2">
                              <h3 className="text-base font-semibold">Pool Filtration Package – Premium</h3>
                              <p className="text-sm text-muted-foreground">Crystal-clear water with minimal maintenance</p>
                            </div>
                            
                            <Separator className="mb-4" />
                            
                            {/* Filtration Type Selection */}
                            <div className="mb-4">
                              <p className="text-sm font-medium mb-2">Filtration Type</p>
                              <Select defaultValue="premium">
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select filtration type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="premium">Premium (Recommended)</SelectItem>
                                  <SelectItem value="standard">Standard</SelectItem>
                                  <SelectItem value="advanced">Advanced</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            {/* Filtration equipment list */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {filtrationItems.map((item, idx) => (
                                <div key={idx} className="flex flex-col">
                                  <p className="text-sm font-medium leading-tight">{item.name}</p>
                                  <p className="text-xs text-muted-foreground">{item.sku}</p>
                                  <p className="text-xs text-muted-foreground">{item.benefit}</p>
                                </div>
                              ))}
                            </div>
                            
                            <Separator className="mb-3" />
                            
                            {/* Grand total */}
                            <div className="flex justify-between items-baseline mt-1">
                              <p className="font-semibold">Equipment Price</p>
                              <p className="text-xl font-bold">$2,875.57</p>
                            </div>
                            
                          </CardContent>
                        </Card>
                        
                        {/* VIP Handover Kit Card */}
                        <Card className="p-4 overflow-y-auto shadow-lg">
                          <CardContent className="px-2 flex items-center h-full">
                            <div className="flex flex-row items-center w-full">
                              {/* Left: VIP graphic */}
                              <div className="flex-shrink-0 pr-4 flex items-center justify-center h-full">
                                <img
                                  src="/StartUpPack.png"
                                  alt="Premium Mineral Start-up Kit"
                                  className="w-16 h-16 rounded-md object-contain"
                                />
                              </div>

                              {/* Right: copy & value points */}
                              <div className="flex-grow">
                                <h3 className="text-base font-semibold mb-1 flex items-center">
                                  1 Year Mineral Supply
                                  <span className="ml-2 inline-block text-xs font-bold px-2 py-0.5 rounded-full bg-yellow-400/80 text-yellow-900">
                                    VIP
                                  </span>
                                </h3>

                                <p className="text-sm mb-3">12-month water minerals with testing kit.</p>
                                
                                <p className="mt-2 text-sm font-bold">
                                  Valued At <span className="text-green-700">$480.00</span>
                                  <span className="block text-xs font-normal text-muted-foreground">Included at No Extra Charge</span>
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        
                        {/* Daily Clean Kit VIP Card */}
                        <Card className="p-4 overflow-y-auto shadow-lg">
                          <CardContent className="px-2 flex items-center h-full">
                            <div className="flex flex-row items-center w-full">
                              {/* Left: VIP graphic */}
                              <div className="flex-shrink-0 pr-4 flex items-center justify-center h-full">
                                <img
                                  src="/Handoverkit.png"
                                  alt="Daily Clean Kit"
                                  className="w-16 h-16 rounded-md object-contain"
                                />
                              </div>

                              {/* Right: copy & value points */}
                              <div className="flex-grow">
                                <h3 className="text-base font-semibold mb-1 flex items-center">
                                  Daily Clean Kit
                                  <span className="ml-2 inline-block text-xs font-bold px-2 py-0.5 rounded-full bg-yellow-400/80 text-yellow-900">
                                    VIP
                                  </span>
                                </h3>

                                <p className="text-sm mb-3">Skimmer, brush, vacuum head and telescopic pole.</p>
                                
                                <p className="mt-2 text-sm font-bold">
                                  Valued At <span className="text-green-700">$320.00</span>
                                  <span className="block text-xs font-normal text-muted-foreground">Included at No Extra Charge</span>
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    ) : id === CATEGORY_IDS.FENCING ? (
                      <div className="space-y-6 h-full overflow-y-auto">
                        {/* Fencing Pricing Card */}
                        <Card className="w-full shadow-lg">
                          <CardContent className="p-5 space-y-6">
                            <div className="mb-2">
                              <h3 className="text-base font-semibold">Pool Fencing Package</h3>
                              <p className="text-sm text-muted-foreground">Safety compliant glass fencing with premium finish</p>
                            </div>
                            
                            <Separator className="mb-4" />
                            
                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <div>
                                  <p className="text-sm font-medium">{proposalData.fencing.fenceType} Fencing ({proposalData.fencing.totalFenceLengthM} meters)</p>
                                  <p className="text-xs text-muted-foreground">Premium safety barrier with elegant finish</p>
                                </div>
                                <p className="font-medium whitespace-nowrap">${proposalData.fencing.fenceLinearCost.toLocaleString()}</p>
                              </div>
                              
                              <div className="flex justify-between">
                                <div>
                                  <p className="text-sm font-medium">Safety Gate ({proposalData.fencing.gateSelection.quantity})</p>
                                  <p className="text-xs text-muted-foreground">Self-closing, child-resistant mechanism</p>
                                </div>
                                <p className="font-medium whitespace-nowrap">${proposalData.fencing.gateSelection.gateTotalCost.toLocaleString()}</p>
                              </div>
                              
                              {proposalData.fencing.fgRetainingPanels.simpleCount > 0 && (
                                <div className="flex justify-between">
                                  <div>
                                    <p className="text-sm font-medium">Simple Retaining Panels ({proposalData.fencing.fgRetainingPanels.simpleCount})</p>
                                    <p className="text-xs text-muted-foreground">Standard height panels</p>
                                  </div>
                                  <p className="font-medium whitespace-nowrap">${proposalData.fencing.fgRetainingPanels.simpleCost.toLocaleString()}</p>
                                </div>
                              )}
                              
                              {proposalData.fencing.fgRetainingPanels.complexCount > 0 && (
                                <div className="flex justify-between">
                                  <div>
                                    <p className="text-sm font-medium">Complex Retaining Panels ({proposalData.fencing.fgRetainingPanels.complexCount})</p>
                                    <p className="text-xs text-muted-foreground">Custom height panels</p>
                                  </div>
                                  <p className="font-medium whitespace-nowrap">${proposalData.fencing.fgRetainingPanels.complexCost.toLocaleString()}</p>
                                </div>
                              )}
                              
                              {proposalData.fencing.earthingRequired && (
                                <div className="flex justify-between">
                                  <div>
                                    <p className="text-sm font-medium">Safety Earthing</p>
                                    <p className="text-xs text-muted-foreground">Electrical grounding for metal components</p>
                                  </div>
                                  <p className="font-medium whitespace-nowrap">${proposalData.fencing.earthingCost.toLocaleString()}</p>
                                </div>
                              )}
                              
                              {proposalData.fencing.gateSelection.freeGateDiscount > 0 && (
                                <div className="flex justify-between">
                                  <div>
                                    <p className="text-sm font-medium text-green-700">Complimentary Gate Discount</p>
                                    <p className="text-xs text-muted-foreground">Special offer included</p>
                                  </div>
                                  <p className="font-medium whitespace-nowrap text-green-700">-${proposalData.fencing.gateSelection.freeGateDiscount.toLocaleString()}</p>
                                </div>
                              )}
                            </div>
                            
                            <Separator className="mb-3" />
                            
                            <div className="flex justify-between items-baseline mt-1">
                              <p className="font-semibold">Total Fencing Price</p>
                              <p className="text-xl font-bold">${proposalData.fencing.costSummary.totalCost.toLocaleString()}</p>
                            </div>
                          </CardContent>
                        </Card>
                        
                        {/* Fencing VIP Card */}
                        <Card className="p-4 overflow-y-auto shadow-lg">
                          <CardContent className="px-2 flex items-center h-full">
                            <div className="flex flex-row items-center w-full">
                              {/* Left: VIP graphic */}
                              <div className="flex-shrink-0 pr-4 flex items-center justify-center h-full">
                                <img 
                                  src="/fencinghero.png" 
                                  alt="Temporary Pool Fencing" 
                                  className="w-16 h-16 object-cover rounded-md" 
                                />
                              </div>

                              {/* Right: copy & value points */}
                              <div className="flex-grow">
                                <h3 className="text-base font-semibold mb-1 flex items-center">
                                  Temporary Fencing Package
                                  <span className="ml-2 inline-block text-xs font-bold px-2 py-0.5 rounded-full bg-yellow-400/80 text-yellow-900">
                                    VIP
                                  </span>
                                </h3>

                                <p className="text-sm mb-1">8-Week compliant safety barrier during construction phase</p>
                                <p className="mt-2 text-sm font-bold">
                                  Valued At <span className="text-green-700">$495.00</span>
                                  <span className="block text-xs font-normal text-muted-foreground">Included at No Extra Charge</span>
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    ) : id === CATEGORY_IDS.RETAINING_WALLS ? (
                      <div className="space-y-6 h-full overflow-y-auto">
                        {/* Retaining Walls Hero Card */}
                        <Card className="w-full overflow-y-auto shadow-lg">
                          <div className="w-full relative">
                            <div className="overflow-hidden h-48">
                              <img 
                                src="/retainingwall.png" 
                                alt="Block Retaining Wall" 
                                className="w-full h-full object-cover object-center" 
                              />
                              {/* Overlay diagram - bottom right positioning */}
                              <div className="absolute bottom-0 right-0 p-4">
                                <div className="bg-white/90 p-2 rounded-md">
                                  <p className="text-xs font-semibold">Wall Dimensions</p>
                                  <p className="text-xs">H: {proposalData.retainingWalls.walls[0].height1M}m × L: {proposalData.retainingWalls.walls[0].lengthM}m</p>
                                </div>
                              </div>
                            </div>
                            <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/70 to-transparent">
                              <h3 className="text-2xl font-semibold text-white">Retaining Wall</h3>
                            </div>
                          </div>
                          <CardContent className="p-5 flex flex-col">
                            <p className="text-sm mb-4">
                              Premium block wall with decorative cladding for superior durability and elegant appearance.
                            </p>
                            
                            <Separator className="my-4" />
                            
                            <div className="mb-4">
                              <h4 className="font-medium text-base mb-3">Retaining Wall Details</h4>
                              <div className="space-y-3">
                                <div className="flex justify-between">
                                  <div>
                                    <p className="text-sm font-medium">{proposalData.retainingWalls.walls[0].wallType}</p>
                                    <p className="text-xs text-muted-foreground">Premium finish with decorative face</p>
                                  </div>
                                  <p className="font-medium whitespace-nowrap">${proposalData.retainingWalls.walls[0].calculation.totalCost.toLocaleString()}</p>
                                </div>
                                
                                <div className="flex justify-between">
                                  <div>
                                    <p className="text-sm font-medium">Wall Area</p>
                                    <p className="text-xs text-muted-foreground">Height: {proposalData.retainingWalls.walls[0].height1M}m × Length: {proposalData.retainingWalls.walls[0].lengthM}m</p>
                                  </div>
                                  <p className="font-medium whitespace-nowrap">{proposalData.retainingWalls.walls[0].calculation.squareMeters} m²</p>
                                </div>
                                
                                <div className="flex justify-between">
                                  <div>
                                    <p className="text-sm font-medium">Base Rate</p>
                                    <p className="text-xs text-muted-foreground">Structural block wall construction</p>
                                  </div>
                                  <p className="font-medium whitespace-nowrap">${proposalData.retainingWalls.walls[0].baseRatePerM2}/m²</p>
                                </div>
                                
                                <div className="flex justify-between">
                                  <div>
                                    <p className="text-sm font-medium">Cladding Rate</p>
                                    <p className="text-xs text-muted-foreground">Decorative finishing material</p>
                                  </div>
                                  <p className="font-medium whitespace-nowrap">${proposalData.retainingWalls.walls[0].extraRatePerM2}/m²</p>
                                </div>
                              </div>
                            </div>
                            
                            <Separator className="mb-3" />
                            
                            <div className="flex justify-between items-baseline mt-1">
                              <p className="font-semibold">Total Wall Price</p>
                              <p className="text-xl font-bold">${proposalData.retainingWalls.costSummary.totalCost.toLocaleString()}</p>
                            </div>
                          </CardContent>
                        </Card>
                        
                      </div>
                    ) : id === CATEGORY_IDS.CUSTOMER_INFO ? (
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
                                <div className="mt-1 space-y-1">
                                  <div className="flex items-center text-sm">
                                    <Phone className="h-3.5 w-3.5 text-[#DB9D6A] mr-2" />
                                    <span>0412 345 678</span>
                                  </div>
                                  <div className="flex items-center text-sm">
                                    <Mail className="h-3.5 w-3.5 text-[#DB9D6A] mr-2" />
                                    <span>jonah@mfppools.com.au</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    ) : id === CATEGORY_IDS.WATER_FEATURE ? (
                      <div className="space-y-6 h-full overflow-y-auto">
                        {/* Water Feature Hero Card */}
                        <Card className="w-full overflow-y-auto shadow-lg">
                          <div className="w-full relative">
                            <div className="overflow-hidden h-48">
                              <img 
                                src="/water-feature-hero.png" 
                                alt="Water Feature" 
                                className="w-full h-full object-cover object-center" 
                              />
                              {/* Overlay diagram - bottom right positioning */}
                              <div className="absolute bottom-0 right-0 p-4">
                                <div className="bg-white/90 p-2 rounded-md">
                                  <p className="text-xs font-semibold">Feature Dimensions</p>
                                  <p className="text-xs">{proposalData.waterFeature.size.split(' - ')[0]}</p>
                                </div>
                              </div>
                            </div>
                            <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/70 to-transparent">
                              <h3 className="text-2xl font-semibold text-white">Water Feature</h3>
                            </div>
                          </div>
                          <CardContent className="p-5 flex flex-col">
                            <p className="text-sm mb-4">
                              Custom water feature with LED lighting, creating a stunning visual and soothing audio experience for your pool area.
                            </p>
                            
                            <Separator className="my-4" />
                            
                            <div className="mb-4">
                              <h4 className="font-medium text-base mb-3">Water Feature Details</h4>
                              <div className="space-y-3">
                                <div className="flex justify-between">
                                  <div>
                                    <p className="text-sm font-medium">Feature Size</p>
                                    <p className="text-xs text-muted-foreground">{proposalData.waterFeature.size.split(' - ')[0]}</p>
                                  </div>
                                  <p className="font-medium whitespace-nowrap">$3,100</p>
                                </div>
                                
                                <div className="flex justify-between">
                                  <div>
                                    <p className="text-sm font-medium">LED Blade Selection</p>
                                    <p className="text-xs text-muted-foreground">{proposalData.waterFeature.ledBladeSelection.split(' - ')[0]}</p>
                                  </div>
                                  <p className="font-medium whitespace-nowrap">${proposalData.waterFeature.ledBladeSelection.split(' - ')[1].split('(')[0].replace('$', '')}</p>
                                </div>
                                
                                <div className="flex justify-between">
                                  <div>
                                    <p className="text-sm font-medium">Material Finish</p>
                                    <p className="text-xs text-muted-foreground">Front: {proposalData.waterFeature.frontFinish} | Sides: {proposalData.waterFeature.sidesFinish}</p>
                                  </div>
                                  <p className="font-medium whitespace-nowrap">Premium</p>
                                </div>
                                
                                {proposalData.waterFeature.backCladdingNeeded && (
                                  <div className="flex justify-between">
                                    <div>
                                      <p className="text-sm font-medium">Back Cladding</p>
                                      <p className="text-xs text-muted-foreground">Matching finish for all sides</p>
                                    </div>
                                    <p className="font-medium whitespace-nowrap">${proposalData.waterFeature.backCladdingCost.toLocaleString()}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <Separator className="mb-3" />
                            
                            <div className="flex justify-between items-baseline mt-1">
                              <p className="font-semibold">Total Feature Price</p>
                              <p className="text-xl font-bold">${proposalData.waterFeature.costSummary.totalCost.toLocaleString()}</p>
                            </div>
                          </CardContent>
                        </Card>
                        
                      </div>
                    ) : id === CATEGORY_IDS.ADD_ONS ? (
                      <div className="space-y-6 h-full overflow-y-auto">
                        {/* Extras & Upgrades Introduction */}
                        <p className="text-white text-sm mb-4">
                          Personalize your pool with these premium upgrades to add extra functionality and enjoyment to your pool area. Browse the available options below to see what's possible.
                        </p>
                        
                        {/* Extras & Upgrades Cards */}
                        <div className="space-y-4">
                          {/* Pool Cleaner */}
                          <Card className="overflow-hidden shadow-lg">
                            <div className="p-4">
                              <div className="flex flex-row items-start w-full">
                                {/* Left: graphic */}
                                <div className="flex-shrink-0 pr-4 flex items-center justify-start h-full pt-1">
                                  <div className="w-16 h-16 rounded-md overflow-hidden">
                                    <img src="/poolcleaner.png" alt="Dolphin DB2 Pool Cleaner" className="w-full h-full object-cover" />
                                  </div>
                                </div>
                                
                                {/* Right: content */}
                                <div className="flex-grow">
                                  <div className="flex justify-between items-center mb-3">
                                    <h3 className="text-base font-semibold">
                                      Robotic Pool Cleaner
                                    </h3>
                                    <p className="text-sm font-medium">
                                      $1,400
                                    </p>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                                    <ul className="list-disc pl-4">
                                      <li>Dolphin DB2 Cleaner</li>
                                    </ul>
                                    <ul className="list-disc pl-4">
                                      <li>Floor & wall scrubbing</li>
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Card>
                          
                          {/* Spa Jets */}
                          <Card className="overflow-hidden shadow-lg">
                            <div className="p-4">
                              <div className="flex flex-row items-start w-full">
                                {/* Left: graphic */}
                                <div className="flex-shrink-0 pr-4 flex items-center justify-start h-full pt-1">
                                  <div className="w-16 h-16 rounded-md overflow-hidden">
                                    <img src="/spajet.png" alt="Spa Jets" className="w-full h-full object-cover" />
                                  </div>
                                </div>
                                
                                {/* Right: content */}
                                <div className="flex-grow">
                                  <div className="flex justify-between items-center mb-3">
                                    <h3 className="text-base font-semibold">
                                      Spa Jets
                                    </h3>
                                    <p className="text-sm font-medium">
                                      $1,220
                                    </p>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                                    <ul className="list-disc pl-4">
                                      <li>ASF-440 Jet System</li>
                                      <li>Spa Jet Pump</li>
                                    </ul>
                                    <ul className="list-disc pl-4">
                                      <li>Hydrotherapy jets</li>
                                      <li>Water massage</li>
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Card>
                          
                          {/* Deck Jets */}
                          <Card className="overflow-hidden shadow-lg">
                            <div className="p-4">
                              <div className="flex flex-row items-start w-full">
                                {/* Left: graphic */}
                                <div className="flex-shrink-0 pr-4 flex items-center justify-start h-full pt-1">
                                  <div className="w-16 h-16 rounded-md overflow-hidden">
                                    <img src="/deckjet.png" alt="Deck Jets" className="w-full h-full object-cover" />
                                  </div>
                                </div>
                                
                                {/* Right: content */}
                                <div className="flex-grow">
                                  <div className="flex justify-between items-center mb-3">
                                    <h3 className="text-base font-semibold">
                                      Deck Jets
                                    </h3>
                                    <p className="text-sm font-medium">
                                      $1,075
                                    </p>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                                    <ul className="list-disc pl-4">
                                      <li>2 Deck Jets</li>
                                      <li>Complete plumbing</li>
                                    </ul>
                                    <ul className="list-disc pl-4">
                                      <li>Water arcs</li>
                                      <li>LED compatible</li>
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Card>
                          
                          {/* Pool Heating Options (Available) */}
                          <Card className="overflow-hidden shadow-lg">
                            <div className="p-4">
                              <div className="flex flex-row items-start w-full">
                                {/* Left: graphic */}
                                <div className="flex-shrink-0 pr-4 flex items-center justify-start h-full pt-1">
                                  <div className="w-16 h-16 rounded-md overflow-hidden">
                                    <img src="/poolblanket.png" alt="Pool Heating Options" className="w-full h-full object-cover" />
                                  </div>
                                </div>
                                
                                {/* Right: content */}
                                <div className="flex-grow">
                                  <div className="flex justify-between items-center mb-3">
                                    <h3 className="text-base font-semibold">
                                      Pool Heating Options
                                    </h3>
                                    <p className="text-sm font-medium">
                                      $6,065
                                    </p>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                                    <ul className="list-disc pl-4">
                                      <li>Sunlover Oasis 13kW Heat Pump</li>
                                      <li>Heat Pump Installation</li>
                                    </ul>
                                    <ul className="list-disc pl-4">
                                      <li>3mm Daisy Thermal Blanket</li>
                                      <li>Stainless Steel Roller</li>
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Card>
                        </div>
                        
                        {/* Extras & Upgrades Summary Card */}
                        <Card className="w-full shadow-lg">
                          <CardContent className="p-5">
                            <div className="flex justify-between items-baseline">
                              <p className="font-semibold">Extras & Upgrades Total</p>
                              <p className="text-xl font-bold">${proposalData.addOns.costSummary.totalCost.toLocaleString()}</p>
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

          {/* --- Section Navigation Select --- */}
          <div className="sticky bottom-0 left-0 right-0 p-4 pt-2 backdrop-blur-sm border-t border-border/50 z-10 shadow-sm transition-all duration-200"> {/* Container with enhanced styling */}
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-[#DB9D6A]">Skip to:</span>
                <Select
                  value={activeSection} // Bind value to the current active section ID
                  onValueChange={handleSectionSelectChange} // Call handler on change
                >
                <SelectTrigger className="w-[200px] bg-white">
                  {/* Display current section name or placeholder */}
                  <SelectValue placeholder="Jump to section..." />
                </SelectTrigger>
                <SelectContent>
                  {/* Map over the unique sections prepared in Step 2 */}
                  {uniqueSections.map(({ id, name }) => (
                    <SelectItem key={id} value={id}>
                      {name} {/* Display friendly section name */}
                    </SelectItem>
                  ))}
                </SelectContent>
                </Select>
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
        <div className="w-2/3 sticky top-16 flex h-[calc(100vh-8rem)] flex-col items-center justify-center overflow-hidden touch-none proposal-right">
          {/* Site Plan Thumbnail - Only visible during Pool Selection section */}
          <AnimatePresence>
            {activeSection === CATEGORY_IDS.POOL_SELECTION && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: 1,
                  transition: { 
                    duration: 0.8,
                    ease: "easeInOut",
                    delay: 0.5
                  }
                }}
                exit={{ 
                  opacity: 0,
                  transition: { 
                    duration: 0.8,
                    ease: "easeInOut",
                    delay: 0
                  }
                }}
                className={`absolute bottom-4 left-4 z-50 bg-white ${sitePlanExpanded ? 'p-3' : 'p-1.5'} rounded-lg shadow-md border border-[#DB9D6A]/10 transition-all duration-300`}
                style={{ cursor: 'pointer' }}
                onClick={() => setSitePlanExpanded(!sitePlanExpanded)}
              >
                <div>
                  <img 
                    src="/siteplan.png" 
                    alt="Property Site Plan" 
                    className={`rounded ${sitePlanExpanded ? 'w-96' : 'w-48'} transition-all duration-300`}
                  />
                  {sitePlanExpanded && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                      className="mt-2 text-sm text-black"
                    >
                      <p className="font-medium">Property Site Plan</p>
                      <p className="text-xs mt-1 text-gray-700">Scale: 1:200 | Property orientation: North-facing</p>
                      <p className="text-xs mt-1 text-gray-700">Proposed pool location shown in blue outline</p>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Fixed Quote Price Card */}
          <div className="absolute bottom-4 right-4 z-50 bg-background/90 backdrop-blur-sm text-foreground p-4 rounded-lg shadow-lg border border-[#DB9D6A]/20 w-[28rem] overflow-hidden">
            <div className="flex flex-col">
              <AnimatePresence mode="wait">
                {priceCardExpanded ? (
                  <motion.div
                    key="expanded"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg font-semibold">Your Complete Quote</h3>
                      <motion.button 
                        onClick={() => setPriceCardExpanded(false)}
                        className="w-6 h-6 rounded-full bg-[#DB9D6A]/10 flex items-center justify-center text-[#DB9D6A] hover:bg-[#DB9D6A]/20 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                      </motion.button>
                    </div>
                    
                    <motion.div 
                      className="space-y-1.5"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                    >
                      <div className="flex justify-between items-baseline">
                        <span className="text-sm text-muted-foreground">Base Verona Pool</span>
                        <span className="font-medium">$28,450</span>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="text-sm text-muted-foreground">Site Preparation</span>
                        <span className="font-medium">$3,800</span>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="text-sm text-muted-foreground">Filtration & Equipment</span>
                        <span className="font-medium">$4,200</span>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="text-sm text-muted-foreground">Concrete & Paving</span>
                        <span className="font-medium">$8,750</span>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="text-sm text-muted-foreground">Fencing & Safety</span>
                        <span className="font-medium">$5,600</span>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="text-sm text-muted-foreground">Water Features</span>
                        <span className="font-medium">$8,200</span>
                      </div>
                    </motion.div>
                    
                    <Separator className="my-3" />
                    <div className="flex justify-between items-baseline">
                      <span className="font-medium">Total Quote</span>
                      <span className="text-xl font-bold">$59,000</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Includes all materials, installation, and site works</p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="collapsed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex justify-between items-center"
                  >
                    <span className="font-medium text-lg">Total Quote:</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-bold">$59,000</span>
                      <motion.button 
                        onClick={() => setPriceCardExpanded(true)}
                        className="w-6 h-6 rounded-full bg-[#DB9D6A]/10 flex items-center justify-center text-[#DB9D6A] hover:bg-[#DB9D6A]/20 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
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
                      // Simply play the video immediately when it's mounted
                      node.play().catch(e => console.log("Video play error:", e));
                    }
                  }}
                  src="/Sheffield.mov"
                  muted
                  loop
                  playsInline
                  autoPlay
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
            
            {/* Retaining Walls */}
            {activeSection === CATEGORY_IDS.RETAINING_WALLS && (
              <motion.div
                key="retaining-walls"
                variants={visualVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="w-full h-full flex items-center justify-center"
              >
                <img
                  src="/RetainingWallImagery.png"
                  alt="Retaining Wall"
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
                      // Simply play the video immediately when it's mounted
                      node.play().catch(e => console.log("Video play error:", e));
                    }
                  }}
                  src="/WaterFeature.mp4"
                  muted
                  loop
                  playsInline
                  autoPlay
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
            
            {/* Filtration & Maintenance */}
            {activeSection === CATEGORY_IDS.FILTRATION_MAINTENANCE && (
              <motion.div
                key="filtration"
                variants={visualVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="w-full h-full"
              >
                <video
                  ref={(node) => {
                    if (node) {
                      // Simply play the video immediately when it's mounted
                      node.play().catch(e => console.log("Video play error:", e));
                    }
                  }}
                  src="/fire.mp4"
                  muted
                  loop
                  playsInline
                  autoPlay
                  className="w-full h-full object-cover object-center"
                />
              </motion.div>
            )}
            
            {/* Pool Installation (formerly Site Requirements) */}
            {activeSection === CATEGORY_IDS.SITE_REQUIREMENTS && (
              <motion.div
                key="pool-installation"
                variants={visualVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="w-full h-full"
              >
                <video
                  ref={(node) => {
                    if (node) {
                      // Simply play the video immediately when it's mounted
                      node.play().catch(e => console.log("Video play error:", e));
                    }
                  }}
                  src="/FrannaCrane.mp4"
                  muted
                  loop
                  playsInline
                  autoPlay
                  className="w-full h-full object-cover object-center"
                />
              </motion.div>
            )}
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