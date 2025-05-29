/**
 * File: src/components/sections/PoolSelectionCards/DetailsCard.tsx
 */
'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Image from "next/image";
import { subCardFade } from '@/lib/animation';
import type { ProposalSnapshot } from "@/types/snapshot";
import { getPoolDetails } from "@/types/pool-details";
import { usePriceCalculator } from '@/hooks/use-price-calculator';

export function DetailsCard({ snapshot }: { snapshot: ProposalSnapshot }) {
  // Get pool details from the spec_name in the snapshot
  const poolDetails = getPoolDetails(snapshot.spec_name);
  
  // Use the pool details for description and images
  const description = poolDetails.description;
  const heroSrc = poolDetails.heroImage;
  const layoutSrc = poolDetails.layoutImage;

  // Use the price calculator for the base pool total
  const { fmt, totals } = usePriceCalculator(snapshot);
  const basePoolPrice = totals.basePoolTotal;

  // Dimensions from flat snapshot
  const { spec_length_m, spec_width_m, spec_depth_shallow_m, spec_depth_deep_m } = snapshot;

  return (
    <motion.div
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
                src={heroSrc}
                alt={`${snapshot.spec_name} Pool`}
                className="w-full h-full object-cover object-center" 
                width={800}
                height={450}
              />
              {/* Overlay layout image - bottom right positioning */}
              <div className="absolute bottom-0 right-0 p-4">
                <Image
                  src={layoutSrc}
                  alt={`${snapshot.spec_name} Pool Layout`}
                  className="w-28 object-contain"
                  width={112} 
                  height={80}
                />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/70 to-transparent">
              <h3 className="text-2xl font-semibold text-white">{snapshot.spec_name}</h3>
            </div>
          </div>
          <CardContent className="p-5 flex flex-col">
            <p className="text-base text-muted-foreground mb-4">{description}</p>
            <Separator className="my-4" />
            <p className="text-base font-medium mb-3">Dimensions (m)</p>
            <div className="grid grid-cols-4 gap-4 text-base">
              <div>
                <span className="font-medium block">Length</span>
                <span>{spec_length_m.toFixed(2)} m</span>
              </div>
              <div>
                <span className="font-medium block">Width</span>
                <span>{spec_width_m.toFixed(2)} m</span>
              </div>
              <div>
                <span className="font-medium block">Shallow</span>
                <span>{spec_depth_shallow_m.toFixed(2)} m</span>
              </div>
              <div>
                <span className="font-medium block">Deep</span>
                <span>{spec_depth_deep_m.toFixed(2)} m</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Pool Price Summary Card */}
        <Card className="w-full shadow-lg">
          <CardContent className="p-5">
            <div className="flex justify-between items-center">
              <p className="text-xl font-semibold">{snapshot.spec_name} Base Price</p>
              <p className="text-xl font-semibold">{fmt(basePoolPrice)}</p>
            </div>
            
            <div className="mt-4">
              <ul className="text-sm font-semibold text-muted-foreground space-y-1">
                <li>• Includes installation costs excepting unique site requirements.</li>
                <li>• Includes filtration costs.</li>
              </ul>
              
              <p className="text-sm text-muted-foreground mt-3">
                This value matches our Web RRP price and includes all the compulsory costs to install your selected pool on a standard block.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}