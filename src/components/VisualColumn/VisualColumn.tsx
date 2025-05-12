/**
 * File: src/components/VisualColumn/VisualColumn.tsx
 */
'use client';

import React, { useState, useEffect } from 'react';
import { useSitePlan } from './useSitePlan';
import Image from 'next/image';
import { GoogleMap, Marker } from '@react-google-maps/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { ResponsiveVideo } from '@/components/ResponsiveVideo';
import { CATEGORY_IDS } from '@/app/lib/constants';
import { supabase } from '@/app/lib/supabaseClient';
import { isSectionEmpty } from '@/app/lib/utils';
import type { VisualColumnProps, Visual, RenderVisual } from './VisualColumn.types';

// Import animation variants from shared module
import { fadeOut, visualIn } from '@/app/lib/animation';

// Helper for getting default/fallback visuals based on section and sub-section
const getDefaultVisual = (
  sectionId: string | null,
  subIndex: number,
  snapshot: VisualColumnProps['snapshot']
): Visual => {
  switch (sectionId) {
    case CATEGORY_IDS.CUSTOMER_INFO:
      return {
        type: 'map',
        address: snapshot.site_address ?? snapshot.home_address ?? ''
      };
    case CATEGORY_IDS.POOL_SELECTION:
      // Always show the Sheffield video for all sub-indices in pool selection
      return {
        type: 'placeholder',
        name: 'Loading 3D Pool Model...',
        fallbackType: 'video',
        fallbackSrc: 'Sheffield'
      };
    case CATEGORY_IDS.FILTRATION_MAINTENANCE:
      return {
        type: 'placeholder',
        name: 'Loading Filtration Visualization...',
        fallbackType: 'video',
        fallbackSrc: 'fire'
      };
    case CATEGORY_IDS.CONCRETE_PAVING:
      return {
        type: 'placeholder',
        name: 'Loading Paving Visualization...',
        fallbackType: 'image',
        fallbackSrc: '/Unique3D/paving.webp'
      };
    case CATEGORY_IDS.FENCING:
      return {
        type: 'placeholder',
        name: 'Loading Fencing Visualization...',
        fallbackType: 'image',
        fallbackSrc: '/Unique3D/fencing.webp'
      };
    case CATEGORY_IDS.RETAINING_WALLS:
      return {
        type: 'placeholder',
        name: 'Loading Retaining Wall Visualization...',
        fallbackType: 'image',
        fallbackSrc: '/Unique3D/RetainingWallImagery.webp'
      };
    case CATEGORY_IDS.WATER_FEATURE:
      return {
        type: 'placeholder',
        name: 'Loading Water Feature Visualization...',
        fallbackType: 'video',
        fallbackSrc: 'waterfeature'
      };
    case CATEGORY_IDS.ADD_ONS:
      return {
        type: 'placeholder',
        name: 'Loading Extras Visualization...',
        fallbackType: 'image',
        fallbackSrc: '/Unique3D/lighting.webp'
      };
    case CATEGORY_IDS.SITE_REQUIREMENTS:
      // Always directly return the FrannaCrane video - never show a placeholder for Site Requirements
      return {
        type: 'video',
        videoName: 'FrannaCrane',
        alt: 'Pool Installation'
      };
    case CATEGORY_IDS.PROPOSAL_SUMMARY:
      // Use Sheffield video for the proposal summary
      return {
        type: 'placeholder',
        name: 'Loading Summary Visualization...',
        fallbackType: 'video',
        fallbackSrc: 'Sheffield'
      };
    default:
      return { type: 'placeholder', name: 'Loading...' };
  }
};

// Helper to get 3D render for a section
const find3DRender = (
  sectionId: string | null,
  renders: Array<{
    video_type: string;
    video_path: string;
    created_at: string;
  }> | null,
  snapshot: VisualColumnProps['snapshot']
): RenderVisual | null => {
  // Early return if requirements aren't met
  if (!sectionId || !renders || !Array.isArray(renders) || renders.length === 0) {
    return null;
  }

  // Check if section is empty - only process non-empty sections or core sections
  if (sectionId !== CATEGORY_IDS.POOL_SELECTION &&
      sectionId !== CATEGORY_IDS.FILTRATION_MAINTENANCE &&
      sectionId !== CATEGORY_IDS.PROPOSAL_SUMMARY &&
      isSectionEmpty(sectionId, snapshot)) {
    // Don't process empty optional sections
    return null;
  }

  const render = renders.find(r => r.video_type === sectionId);
  if (!render) {
    return null;
  }

  return {
    type: '3d',
    videoPath: render.video_path,
    videoType: render.video_type,
    createdAt: render.created_at,
    alt: `3D ${sectionId} Visualization`
  };
};

// Helper for left-column visuals based on section and sub-section
const getLeftColumnVisual = (
  sectionId: string | null,
  subIndex: number,
  snapshot: VisualColumnProps['snapshot'],
  use3DVisuals: boolean,
  threeDRenders: Array<{
    video_type: string;
    video_path: string;
    created_at: string;
  }> | null
): Visual => {
  // Special case for Site Requirements (always use FrannaCrane video)
  if (sectionId === CATEGORY_IDS.SITE_REQUIREMENTS) {
    return {
      type: 'video',
      videoName: 'FrannaCrane',
      alt: 'Pool Installation'
    };
  }

  // If 3D visuals are enabled, check if we have a 3D render for this section (except Customer Info)
  if (use3DVisuals && sectionId && sectionId !== CATEGORY_IDS.CUSTOMER_INFO) {
    const render = find3DRender(sectionId, threeDRenders, snapshot);
    if (render) {
      return render;
    }
  }

  // Otherwise use default visuals
  // Special case for customer info (always use map)
  if (sectionId === CATEGORY_IDS.CUSTOMER_INFO) {
    return {
      type: 'map',
      address: snapshot.site_address ?? snapshot.home_address ?? ''
    };
  }

  // For other sections, if 3D is enabled but no render is found, use placeholder
  // Otherwise use the normal defaults
  if (use3DVisuals && sectionId) {
    // Return placeholders with fallbacks when 3D is enabled but no render exists
    return getDefaultVisual(sectionId, subIndex, snapshot);
  }

  // When 3D is disabled, use the original visual content
  switch (sectionId) {
    case CATEGORY_IDS.POOL_SELECTION:
      return { type: 'video', videoName: 'Sheffield' };
    case CATEGORY_IDS.FILTRATION_MAINTENANCE:
      return { type: 'video', videoName: 'fire', alt: 'Pool Filtration' };
    case CATEGORY_IDS.CONCRETE_PAVING:
      if (subIndex === 0) return { type: 'image', src: '/Unique3D/paving.webp', alt: 'Paving Options' };
      if (subIndex === 1) return { type: 'image', src: '/Unique3D/paving.webp', alt: 'Paving & Concrete Cost Metrics' };
      return { type: 'image', src: '/Unique3D/paving.webp', alt: 'Paving & Concrete' };
    case CATEGORY_IDS.FENCING:
      return { type: 'image', src: '/Unique3D/fencing.webp', alt: 'Fencing' };
    case CATEGORY_IDS.RETAINING_WALLS:
      return { type: 'image', src: '/Unique3D/RetainingWallImagery.webp', alt: 'Retaining Walls' };
    case CATEGORY_IDS.WATER_FEATURE:
      return { type: 'video', videoName: 'waterfeature', alt: 'Water Feature' };
    case CATEGORY_IDS.ADD_ONS:
      return { type: 'image', src: '/Unique3D/lighting.webp', alt: 'Extras & Upgrades' };
    case CATEGORY_IDS.PROPOSAL_SUMMARY:
      return { type: 'video', videoName: 'Sheffield', alt: 'Proposal Summary' };
    default:
      return { type: 'placeholder', name: 'Loading...' };
  }
};

export default function VisualColumn({
  activeSection,
  subIndex,
  isLoaded,
  mapCenter,
  snapshot,
  resetScroll,
  use3DVisuals = false
}: VisualColumnProps) {
  // Fetch site plan data if available
  const { sitePlanVisual } = useSitePlan(snapshot.project_id);
  const [priceCardExpanded, setPriceCardExpanded] = useState<boolean>(false);
  const [sitePlanExpanded, setSitePlanExpanded] = useState<boolean>(false);
  const [threeDRenders, setThreeDRenders] = useState<Array<{
    video_type: string;
    video_path: string;
    created_at: string;
  }> | null>(snapshot.videos_json || null);

  // Fetch 3D renders from Supabase if they're not available in the snapshot
  useEffect(() => {
    if (use3DVisuals && snapshot.project_id && (!threeDRenders || threeDRenders.length === 0)) {
      const fetchRenders = async () => {
        try {
          const { data, error } = await supabase
            .from('3d')
            .select('video_type, video_path, created_at')
            .eq('pool_project_id', snapshot.project_id);

          if (error) {
            console.error('Error fetching 3D renders:', error);
            return;
          }

          if (data) {
            setThreeDRenders(data);
          }
        } catch (err) {
          console.error('Error in fetchRenders:', err);
        }
      };

      fetchRenders();
    }
  }, [use3DVisuals, snapshot.project_id, threeDRenders]);

  // Main visual to display based on section
  const visual = React.useMemo(
    () => getLeftColumnVisual(activeSection, subIndex, snapshot, use3DVisuals, threeDRenders),
    [activeSection, subIndex, snapshot, use3DVisuals, threeDRenders]
  );

  // Calculate 3D video URL ahead of time to avoid hook issues
  const render3DContent = React.useMemo(() => {
    if (visual.type !== '3d') return null;

    let videoUrl = '';
    const { videoType, videoPath } = visual;

    // Skip URL processing if section is empty (except for core sections)
    if (videoType !== CATEGORY_IDS.POOL_SELECTION &&
        videoType !== CATEGORY_IDS.FILTRATION_MAINTENANCE &&
        videoType !== CATEGORY_IDS.PROPOSAL_SUMMARY &&
        isSectionEmpty(videoType, snapshot)) {
      console.log(`Skipping URL lookup for empty section: ${videoType}`);
      // Return null for empty sections, we'll handle this in renderVisual
      return {
        videoUrl: null,
        isEmpty: true
      };
    }

    // If path already starts with http, use it directly
    if (videoPath.startsWith('http')) {
      videoUrl = videoPath;
    } else {
      try {
        // Get the public URL from Supabase
        const { data } = supabase
          .storage
          .from('3d-renders')
          .getPublicUrl(videoPath);

        videoUrl = data?.publicUrl || '';
      } catch (error) {
        console.error(`Error getting public URL for ${videoPath}:`, error);
        videoUrl = '';
      }
    }

    return {
      videoUrl,
      isEmpty: false
    };
  }, [visual, snapshot]);

  function renderVisual() {
    switch (visual.type) {
      case 'map':
        // Use coordinates from visual if available
        const mapCoordinates = visual.coordinates || mapCenter;

        return (
          <motion.div
            key="map"
            variants={{ ...fadeOut, ...visualIn }}
            initial="initial"
            animate="enter"
            exit="exit"
            className="w-full h-full flex justify-center items-start"
          >
            {isLoaded && mapCoordinates ? (
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%' }}
                center={mapCoordinates}
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
                <Marker position={mapCoordinates} />
              </GoogleMap>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-white">Loading map for {visual.address || 'property'}...</p>
              </div>
            )}
          </motion.div>
        );

      case '3d':
        // Use the precomputed render3DContent from the useMemo hook
        return (
          <motion.div
            key={`3d-${visual.videoType}-${visual.createdAt}`}
            variants={{ ...fadeOut, ...visualIn }}
            initial="initial"
            animate="enter"
            exit="exit"
            className="w-full h-full flex justify-center items-start"
          >
            {/* Section is empty and not included */}
            {render3DContent?.isEmpty && (
              <div className="w-full h-full flex items-center justify-center bg-black/40 backdrop-blur-sm">
                <div className="text-white text-center p-8">
                  <h3 className="text-xl font-medium mb-2">Section not included</h3>
                  <p className="text-white/60">
                    This optional section is not active in the proposal
                  </p>
                </div>
              </div>
            )}

            {/* Section has a valid URL */}
            {!render3DContent?.isEmpty && render3DContent?.videoUrl && (
              <video
                src={render3DContent.videoUrl}
                className="w-full h-full object-cover object-top"
                autoPlay
                muted
                playsInline
                loop
              />
            )}

            {/* Section should have content but URL is missing */}
            {!render3DContent?.isEmpty && !render3DContent?.videoUrl && (
              <div className="w-full h-full flex items-center justify-center bg-black/40 backdrop-blur-sm">
                <div className="text-white text-center p-8">
                  <h3 className="text-xl font-medium mb-2">3D visual not available</h3>
                  <p className="text-white/60">
                    Using default visual content instead
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        );

      case 'video':
        return (
          <motion.div
            key={`video-${visual.videoName}`}
            variants={{ ...fadeOut, ...visualIn }}
            initial="initial"
            animate="enter"
            exit="exit"
            className="w-full h-full flex justify-center items-start"
          >
            <ResponsiveVideo
              baseName={visual.videoName}
              className="w-full h-full object-cover object-top"
              autoPlay={true}
              controls={false}
              loop={true}
            />
          </motion.div>
        );

      case 'image':
        return (
          <motion.div
            key={`image-${visual.src}`}
            variants={{ ...fadeOut, ...visualIn }}
            initial="initial"
            animate="enter"
            exit="exit"
            className="w-full h-full flex justify-center items-start"
          >
            <Image
              src={visual.src}
              alt={visual.alt || 'Visual'}
              className="w-full h-full object-cover object-top"
              width={800}
              height={600}
            />
          </motion.div>
        );

      case 'placeholder':
        // Improved placeholder that can show fallback content while waiting for 3D
        return (
          <motion.div
            key={`placeholder-${visual.name}`}
            variants={{ ...fadeOut, ...visualIn }}
            initial="initial"
            animate="enter"
            exit="exit"
            className="w-full h-full relative"
          >
            {/* Show fallback content in the background */}
            {visual.fallbackType === 'video' && visual.fallbackSrc && (
              <div className="absolute inset-0 z-0 opacity-40">
                <ResponsiveVideo
                  baseName={visual.fallbackSrc}
                  className="w-full h-full object-cover object-top"
                  autoPlay={true}
                />
              </div>
            )}

            {visual.fallbackType === 'image' && visual.fallbackSrc && (
              <div className="absolute inset-0 z-0 opacity-40">
                <Image
                  src={visual.fallbackSrc}
                  alt="Fallback Visual"
                  className="w-full h-full object-cover object-top"
                  width={800}
                  height={600}
                />
              </div>
            )}

            {/* Loading overlay */}
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <div className="text-white text-center p-8">
                <h3 className="text-xl font-medium mb-2">{visual.name}</h3>
                <p className="text-white/60">
                  {use3DVisuals ? "Loading custom 3D visualization..." : "Visual content is being prepared"}
                </p>
              </div>
            </div>
          </motion.div>
        );
    }
  }

  return (
    <div className="order-1 lg:order-2 w-full lg:w-2/3 h-[40vh] lg:sticky lg:top-16 lg:h-[calc(100vh-8rem)] flex flex-col items-center justify-center overflow-hidden touch-none proposal-right bg-[#07032D] proposal-background transition-colors duration-300">
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
            className={`hidden lg:block absolute bottom-4 left-4 z-50 bg-white ${sitePlanExpanded ? 'p-3' : 'p-1.5'} rounded-lg shadow-md border border-[#DB9D6A]/10 transition-all duration-300`}
            style={{ cursor: 'pointer' }}
            onClick={() => setSitePlanExpanded(!sitePlanExpanded)}
          >
            <div>
              <div className={`relative rounded overflow-hidden ${sitePlanExpanded ? 'w-96 h-72' : 'w-48 h-36'} transition-all duration-300`}>
                <Image
                  src={sitePlanVisual?.publicUrl || "/Unique2D/siteplan.webp"}
                  alt="Property Site Plan"
                  className="object-contain"
                  fill
                  sizes={sitePlanExpanded ? "384px" : "192px"}
                />
              </div>
              {sitePlanExpanded && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="mt-2 text-sm text-black"
                >
                  <p className="font-medium">Property Site Plan {sitePlanVisual?.version ? `(v${sitePlanVisual.version})` : ''}</p>
                  <p className="text-xs mt-1 text-gray-700">Scale: 1:200 | Property orientation: North-facing</p>
                  <p className="text-xs mt-1 text-gray-700">Proposed pool location shown in blue outline</p>
                  {sitePlanVisual && (
                    <p className="text-xs mt-1 text-gray-700">Last updated: {new Date(sitePlanVisual.createdAt).toLocaleDateString()}</p>
                  )}
                  
                  {/* Mobile helper */}
                  <div className="hidden lg:block text-xs text-neutral-400 mt-4">
                    Tap image to collapse
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Fixed Quote Price Card */}
      <div className="hidden lg:flex absolute bottom-4 right-4 z-50 bg-background/90 backdrop-blur-sm text-foreground p-4 rounded-lg shadow-lg border border-[#DB9D6A]/20 w-[28rem] overflow-hidden">
        <div className="flex flex-col w-full">
          <AnimatePresence mode="wait" onExitComplete={resetScroll}>
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
                
                {/* Calculate dynamic pricing from the snapshot */}
                {(() => {
                  // Format helper
                  const fmt = (n: number) => n.toLocaleString('en-AU', { style: 'currency', currency: 'AUD' });
                  
                  // Calculate base pool price with margin
                  const fixedCosts = 6285; // Sum of fixed costs data
                  const individualPoolCosts = 
                    snapshot.pc_beam + 
                    snapshot.pc_coping_supply + 
                    snapshot.pc_coping_lay + 
                    snapshot.pc_salt_bags + 
                    snapshot.pc_trucked_water + 
                    snapshot.pc_misc + 
                    snapshot.pc_pea_gravel + 
                    snapshot.pc_install_fee;
                  const baseCost = snapshot.spec_buy_inc_gst + individualPoolCosts + fixedCosts;
                  const marginPercent = snapshot.pool_margin_pct || 0;
                  const basePoolPrice = marginPercent > 0 
                    ? baseCost / (1 - marginPercent/100) 
                    : baseCost;
                  
                  // Site preparation costs
                  const sitePrepCosts = snapshot.crane_cost + 
                    snapshot.bobcat_cost +
                    (snapshot.dig_excavation_rate * snapshot.dig_excavation_hours) +
                    (snapshot.dig_truck_rate * snapshot.dig_truck_hours * snapshot.dig_truck_qty) +
                    snapshot.traffic_control_cost + 
                    snapshot.elec_total_cost;
                  const installationTotal = marginPercent > 0 
                    ? sitePrepCosts / (1 - marginPercent/100) 
                    : sitePrepCosts;
                  
                  // Filtration equipment with margin applied
                  const filtrationBaseCost = 
                    snapshot.fp_pump_price + 
                    snapshot.fp_filter_price + 
                    snapshot.fp_sanitiser_price + 
                    snapshot.fp_light_price + 
                    (snapshot.fp_handover_kit_price || 0);
                  
                  // Apply the same margin formula to filtration
                  const filtrationTotal = marginPercent > 0 
                    ? filtrationBaseCost / (1 - marginPercent/100) 
                    : filtrationBaseCost;
                  
                  // Concrete & paving
                  const concreteTotal = (snapshot.concrete_cuts_cost || 0) + 
                    (snapshot.extra_paving_cost || 0) + 
                    (snapshot.existing_paving_cost || 0) + 
                    (snapshot.extra_concreting_saved_total || 0) + 
                    (snapshot.concrete_pump_total_cost || 0) + 
                    (snapshot.uf_strips_cost || 0);
                  
                  // Fencing total
                  const fencingTotal = snapshot.fencing_total_cost || 0;
                  
                  // Water feature
                  const waterFeatureTotal = snapshot.water_feature_total_cost || 0;
                  
                  // Extras & add-ons
                  const cleanerCost = snapshot.cleaner_cost_price || 0;
                  const heatPumpCost = (snapshot.heat_pump_cost || 0) + (snapshot.heat_pump_install_cost || 0);
                  const blanketRollerCost = (snapshot.blanket_roller_cost || 0) + (snapshot.br_install_cost || 0);
                  const extrasTotal = cleanerCost + heatPumpCost + blanketRollerCost;
                  
                  // Calculate grand total
                  const grandTotal = basePoolPrice + 
                    installationTotal + 
                    filtrationTotal + 
                    concreteTotal + 
                    fencingTotal + 
                    waterFeatureTotal + 
                    extrasTotal;
                  
                  return (
                    <motion.div 
                      className="space-y-1.5 w-full"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                    >
                      <div className="flex justify-between items-baseline">
                        <span className="text-sm text-muted-foreground">Base {snapshot.spec_name} Pool</span>
                        <span className="font-medium">{fmt(basePoolPrice)}</span>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="text-sm text-muted-foreground">Installation</span>
                        <span className="font-medium">{fmt(installationTotal)}</span>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="text-sm text-muted-foreground">Filtration & Equipment</span>
                        <span className="font-medium">{fmt(filtrationTotal)}</span>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="text-sm text-muted-foreground">Concrete & Paving</span>
                        <span className="font-medium">{fmt(concreteTotal)}</span>
                      </div>
                      {fencingTotal > 0 && (
                        <div className="flex justify-between items-baseline">
                          <span className="text-sm text-muted-foreground">Fencing & Safety</span>
                          <span className="font-medium">{fmt(fencingTotal)}</span>
                        </div>
                      )}
                      {waterFeatureTotal > 0 && (
                        <div className="flex justify-between items-baseline">
                          <span className="text-sm text-muted-foreground">Water Features</span>
                          <span className="font-medium">{fmt(waterFeatureTotal)}</span>
                        </div>
                      )}
                      {extrasTotal > 0 && (
                        <div className="flex justify-between items-baseline">
                          <span className="text-sm text-muted-foreground">Extras & Add-ons</span>
                          <span className="font-medium">{fmt(extrasTotal)}</span>
                        </div>
                      )}
                      
                      <Separator className="my-3" />
                      <div className="flex justify-between items-baseline">
                        <span className="font-medium">Total Quote</span>
                        <span className="text-xl font-bold">{fmt(grandTotal)}</span>
                      </div>
                    </motion.div>
                  );
                })()}
                
                <p className="text-xs text-muted-foreground mt-2">Includes all materials, installation, and site works</p>
              </motion.div>
            ) : (
              <motion.div
                key="collapsed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex justify-between items-center w-full"
              >
                <span className="font-medium text-lg">Total Quote:</span>
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold">
                    {(() => {
                      // Format helper
                      const fmt = (n: number) => n.toLocaleString('en-AU', { style: 'currency', currency: 'AUD' });
                      
                      // Calculate the same grand total as in the expanded view
                      const fixedCosts = 6285;
                      const individualPoolCosts = 
                        snapshot.pc_beam + 
                        snapshot.pc_coping_supply + 
                        snapshot.pc_coping_lay + 
                        snapshot.pc_salt_bags + 
                        snapshot.pc_trucked_water + 
                        snapshot.pc_misc + 
                        snapshot.pc_pea_gravel + 
                        snapshot.pc_install_fee;
                      const baseCost = snapshot.spec_buy_inc_gst + individualPoolCosts + fixedCosts;
                      const marginPercent = snapshot.pool_margin_pct || 0;
                      const basePoolPrice = marginPercent > 0 
                        ? baseCost / (1 - marginPercent/100) 
                        : baseCost;
                      
                      const sitePrepCosts = snapshot.crane_cost + 
                        snapshot.bobcat_cost +
                        (snapshot.dig_excavation_rate * snapshot.dig_excavation_hours) +
                        (snapshot.dig_truck_rate * snapshot.dig_truck_hours * snapshot.dig_truck_qty) +
                        snapshot.traffic_control_cost + 
                        snapshot.elec_total_cost;
                      const installationTotal = marginPercent > 0 
                        ? sitePrepCosts / (1 - marginPercent/100) 
                        : sitePrepCosts;
                      
                      const filtrationBaseCost = 
                        snapshot.fp_pump_price + 
                        snapshot.fp_filter_price + 
                        snapshot.fp_sanitiser_price + 
                        snapshot.fp_light_price + 
                        (snapshot.fp_handover_kit_price || 0);
                        
                      // Apply margin to filtration cost
                      const filtrationTotal = marginPercent > 0 
                        ? filtrationBaseCost / (1 - marginPercent/100) 
                        : filtrationBaseCost;
                      
                      const concreteTotal = (snapshot.concrete_cuts_cost || 0) + 
                        (snapshot.extra_paving_cost || 0) + 
                        (snapshot.existing_paving_cost || 0) + 
                        (snapshot.extra_concreting_saved_total || 0) + 
                        (snapshot.concrete_pump_total_cost || 0) + 
                        (snapshot.uf_strips_cost || 0);
                      
                      const fencingTotal = snapshot.fencing_total_cost || 0;
                      const waterFeatureTotal = snapshot.water_feature_total_cost || 0;
                      
                      // Calculate extras total using the same method as in other components
                      const cleanerCost = snapshot.cleaner_cost_price || 0;
                      const heatPumpCost = (snapshot.heat_pump_cost || 0) + (snapshot.heat_pump_install_cost || 0);
                      const blanketRollerCost = (snapshot.blanket_roller_cost || 0) + (snapshot.br_install_cost || 0);
                      const extrasTotal = cleanerCost + heatPumpCost + blanketRollerCost;
                      
                      const grandTotal = basePoolPrice + 
                        installationTotal + 
                        filtrationTotal + 
                        concreteTotal + 
                        fencingTotal + 
                        waterFeatureTotal + 
                        extrasTotal;
                      
                      return fmt(grandTotal);
                    })()}
                  </span>
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
      <AnimatePresence mode="wait" onExitComplete={resetScroll}>
        {renderVisual()}
      </AnimatePresence>
    </div>
  );
}