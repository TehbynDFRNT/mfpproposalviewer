/**
 * File: src/components/sections/PoolSelectionCards/DetailsCard.tsx
 */
'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Image from "next/image";
import { subCardFade } from '@/app/lib/animation';
import type { ProposalSnapshot } from "@/app/lib/types/snapshot";
import { getPoolDetails } from "@/app/lib/types/pool-details";

export function DetailsCard({ snapshot }: { snapshot: ProposalSnapshot }) {
  // Get pool details from the spec_name in the snapshot
  const poolDetails = getPoolDetails(snapshot.spec_name);
  
  // Use the pool details for description and images
  const description = poolDetails.description;
  const heroSrc = poolDetails.heroImage;
  const layoutSrc = poolDetails.layoutImage;

  // Calculate total of individual pool costs
  const individualPoolCosts = 
    snapshot.pc_beam + 
    snapshot.pc_coping_supply + 
    snapshot.pc_coping_lay + 
    snapshot.pc_salt_bags + 
    snapshot.pc_trucked_water + 
    snapshot.pc_misc + 
    snapshot.pc_pea_gravel + 
    snapshot.pc_install_fee;
  
  // Fixed costs are always the same, so we can hard-code the total
  const fixedCostsData = [
    {"id":"a3f2eb40-9370-4a3c-bcca-86329216bad3","name":"Temporary Safety Barrier","price":400},
    {"id":"c825fe88-893f-4604-9b51-58607c88e9b7","name":"Freight","price":800},
    {"id":"b335f1dc-fcda-47df-8834-ba649588adcf","name":"Earthbond","price":40},
    {"id":"d19b9dba-c036-484d-b74e-04730d909aac","name":"Ag Line","price":35},
    {"id":"7e31adfc-9466-4a6a-8d1f-e33f0676d6dc","name":"Pipe Fitting + 3 Way Valve","price":300},
    {"id":"69578277-9345-4786-9e26-2dee48d02a3b","name":"Filter Slab","price":50},
    {"id":"6f8bd374-d64b-45d8-95cc-bd351a53f53a","name":"Miscellaneous","price":2700},
    {"id":"df475e8c-794b-4a4f-8596-86fad86fa68a","name":"Form 15","price":1295},
    {"id":"94485e26-5c0a-4dfc-872a-f815585d82fd","name":"Fire Ant","price":165},
    {"id":"8589c183-19f4-443c-9e14-c69d4988c2ac","name":"Handover","price":500}
  ];
  
  const fixedCosts = fixedCostsData.reduce((total, item) => total + item.price, 0); // Sum: 6285
  
  // Calculate base cost (sum of spec cost, individual pool costs, and fixed costs)
  const baseCost = snapshot.spec_buy_inc_gst + individualPoolCosts + fixedCosts;
  
  // Apply margin using the formula: Cost / (1 - Margin/100)
  const marginPercent = snapshot.pool_margin_pct || 0;
  const basePoolPrice = marginPercent > 0 
    ? baseCost / (1 - marginPercent/100) 
    : baseCost;
  
  // Format for display
  const formattedPrice = basePoolPrice.toLocaleString('en-AU', {
    style: 'currency',
    currency: 'AUD',
  });

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
                className="w-full h-full object-cover object-top" 
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
            <p className="text-sm mb-4">{description}</p>
            <Separator className="my-4" />
            <p className="text-sm font-medium mb-3">Dimensions (m)</p>
            <div className="grid grid-cols-4 gap-4 text-sm">
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
            <div className="flex justify-between items-baseline">
              <p className="font-semibold">{snapshot.spec_name} Base Price</p>
              <p className="text-xl font-bold">{formattedPrice}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}