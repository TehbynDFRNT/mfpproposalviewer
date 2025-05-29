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
  const { fmt, totals } = usePriceCalculator(snapshot);
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
            className={`hidden lg:block absolute bottom-4 left-4 z-50 bg-white ${sitePlanExpanded ? 'pb-3 px-3 pt-2' : 'p-1.5'} rounded-lg shadow-md border border-[#DB9D6A]/10 transition-all duration-300`}
            style={{ cursor: 'pointer' }}
            onClick={() => setSitePlanExpanded(!sitePlanExpanded)}
          >
            <div>
              <div className={`relative overflow-hidden ${sitePlanExpanded ? 'w-96 h-72' : 'w-48 h-36'} transition-all duration-300 rounded-[3px]`}>
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
                  <p className="text-base font-semibold mb-1">2D Site Plan</p>
                  <p className="text-base text-muted-foreground mb-4 max-w-[24rem]">Your personalised 2D digital siteplan prepared during your Site Inspection</p>
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
        totals={totals}
      />
      
      {/* Main Visual Content using our VisualRenderer component */}
      <AnimatePresence mode="wait" onExitComplete={resetScroll}>
        <VisualRenderer
          key={activeSection}
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