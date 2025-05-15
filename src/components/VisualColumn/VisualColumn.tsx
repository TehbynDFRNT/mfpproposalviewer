/**
 * File: src/components/VisualColumn/VisualColumn.tsx
 */
'use client';

import React, { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useSitePlan } from "@/hooks/useSitePlan";
import { usePriceCalculator } from "@/hooks/use-price-calculator";
import { useRenders } from "@/hooks/useRenders";
import { useGeocode } from "@/hooks/use-geocode";
import { selectVisual } from '@/lib/visualUtils';
import { CATEGORY_IDS } from '@/lib/constants';
import { isSectionEmpty } from '@/lib/utils';
import { supabase } from '@/lib/supabaseClient';
import { VisualRenderer } from './VisualRenderer';
import PriceCard from '@/components/PriceCard/PriceCard';
import type { VisualColumnProps } from "./VisualColumn.types";

// Type for render3DContent
interface Render3DContent {
  videoUrl: string | null;
  isEmpty: boolean;
}

export default function VisualColumn({
  activeSection,
  subIndex,
  snapshot,
  resetScroll,
  use3DVisuals = false
}: VisualColumnProps) {
  // Fetch site plan data and pricing calculations
  const { sitePlanVisual } = useSitePlan(snapshot?.project_id);
  const { fmt, grandTotal, breakdown } = usePriceCalculator(snapshot);
  const { renders } = useRenders(snapshot?.project_id, use3DVisuals);
  
  // Use the geocode hook instead of passing isLoaded and mapCenter as props
  const address = useMemo(() => 
    snapshot?.site_address ?? snapshot?.home_address ?? '', 
    [snapshot?.site_address, snapshot?.home_address]
  );
  const { isLoaded, location: mapCenter } = useGeocode(address);
  
  const [priceCardExpanded, setPriceCardExpanded] = useState<boolean>(false);
  const [sitePlanExpanded, setSitePlanExpanded] = useState<boolean>(false);

  // Main visual to display based on section - use our selectVisual utility
  const visual = useMemo(
    () => selectVisual(activeSection, subIndex, snapshot, use3DVisuals, renders),
    [activeSection, subIndex, snapshot, use3DVisuals, renders]
  );

  // Calculate 3D video URL ahead of time to avoid hook issues
  const render3DContent = useMemo<Render3DContent | null>(() => {
    if (visual.type !== '3d') return null;

    let videoUrl = '';
    const { videoType, videoPath } = visual;

    // Skip URL processing if section is empty (except for core sections)
    if (videoType !== CATEGORY_IDS.POOL_SELECTION &&
        videoType !== CATEGORY_IDS.FILTRATION_MAINTENANCE &&
        videoType !== CATEGORY_IDS.PROPOSAL_SUMMARY &&
        isSectionEmpty(videoType, snapshot)) {
      console.log(`Skipping URL lookup for empty section: ${videoType}`);
      // Return null for empty sections, we'll handle this in VisualRenderer
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
      
      {/* Price Card Component */}
      <PriceCard
        expanded={priceCardExpanded}
        onToggle={() => setPriceCardExpanded(!priceCardExpanded)}
        fmt={fmt}
        grandTotal={grandTotal}
        breakdown={breakdown}
      />
      
      {/* Main Visual Content using our VisualRenderer component */}
      <AnimatePresence mode="wait" onExitComplete={resetScroll}>
        <VisualRenderer
          key={`${activeSection}-${subIndex}`}
          visual={visual}
          isLoaded={isLoaded}
          mapCenter={mapCenter}
          render3DContent={render3DContent}
          use3DVisuals={use3DVisuals}
        />
      </AnimatePresence>
    </div>
  );
}