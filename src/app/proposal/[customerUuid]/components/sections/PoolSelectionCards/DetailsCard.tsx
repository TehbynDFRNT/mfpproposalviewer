'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Image from "next/image";
import { subCardFade } from '@/app/lib/animation';
import type { Snapshot } from "@/app/lib/types/snapshot";

// Helper function to get pool description based on name
function getPoolDescription(poolName: string): string {
  const descriptions: Record<string, string> = {
    'Verona': 'Part of our Latin Series, the Verona features a slimline geometric design perfect for narrow spaces and compact backyards. Its corner entry steps create an uninterrupted swim zone, while the full-length bench seat offers a generous relaxation area - the ideal balance of swimming space and comfort in a smaller footprint.',
    'Sheffield': 'The Sheffield combines a modern rectangular design with practical features for family swimming. With its spacious interior and clean lines, it offers both aesthetic appeal and functionality for everyday use.',
    'Latina': 'Our flagship Latina pool features a graceful curved design with wide entry steps and a generous swimming area. Perfect for both recreation and entertainment, it brings resort-style luxury to your backyard.',
  };
  
  // Return the matching description or a generic one if not found
  return descriptions[poolName] || 
    `The ${poolName} pool is designed to perfectly complement your outdoor space with elegant proportions and quality construction.`;
}

export function DetailsCard({ snapshot }: { snapshot: Snapshot }) {
  const { poolSpecification: pool, poolCosts } = snapshot;
  // derive totalCost by summing poolCosts fields
  const totalCost = poolCosts
    ? poolCosts.beam + poolCosts.misc + poolCosts.saltBags + poolCosts.copingLay + poolCosts.peaGravel + poolCosts.installFee + poolCosts.copingSupply + poolCosts.truckedWater
    : 0;
  // Debugging outputs
  console.log("Details card props - pool:", pool);
  console.log("Details card props - totalCost:", totalCost);
  
  // Format price for display
  const formattedPrice = totalCost > 0 
    ? totalCost.toLocaleString('en-AU', { style: 'currency', currency: 'AUD' })
    : "$0.00";

  const dims = pool.dimensions;
  
  // Log warning if pool cost is zero for debugging purposes
  if (totalCost === 0) {
    console.warn('WARNING: Pool price is showing as ZERO - check pool_costs calculation in getProposalData.ts');
  }
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
                src={`/_opt/${pool.name.toLowerCase()}-hero.webp`}
                alt={`${pool.name} Pool`}
                className="w-full h-full object-cover object-top" 
                width={800}
                height={450}
              />
              {/* Overlay layout image - bottom right positioning */}
              <div className="absolute bottom-0 right-0 p-4">
                <Image 
                  src={`/_opt/${pool.name.toLowerCase()}_layout.webp`}
                  alt={`${pool.name} Pool Layout`}
                  className="w-28 object-contain"
                  width={112} 
                  height={80}
                />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/70 to-transparent">
              <h3 className="text-2xl font-semibold text-white">{pool.name}</h3>
            </div>
          </div>
          <CardContent className="p-5 flex flex-col">
            <p className="text-sm mb-4">
              {pool.description || getPoolDescription(pool.name)}
            </p>
            <Separator className="my-4" />
            <p className="text-sm font-medium mb-3">Dimensions (m)</p>
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium block">Length</span>
                <span>{dims.lengthM.toFixed(2)} m</span>
              </div>
              <div>
                <span className="font-medium block">Width</span>
                <span>{dims.widthM.toFixed(2)} m</span>
              </div>
              <div>
                <span className="font-medium block">Shallow</span>
                <span>{dims.shallowDepthM.toFixed(2)} m</span>
              </div>
              <div>
                <span className="font-medium block">Deep</span>
                <span>{dims.deepDepthM.toFixed(2)} m</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Pool Price Summary Card */}
        <Card className="w-full shadow-lg">
          <CardContent className="p-5">
            <div className="flex justify-between items-baseline mb-3">
              <p className="font-semibold">Total Pool Price</p>
              <p className="text-xl font-bold">{formattedPrice}</p>
            </div>
            
            <Separator className="my-3" />
            
            {/* Pool type and color details */}
            <div className="text-sm text-muted-foreground">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium">Model:</span>
                <span>{pool.name}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="font-medium">Color:</span>
                <span className="flex items-center gap-1">
                  <span 
                    className="inline-block w-3 h-3 rounded-full" 
                    style={{ 
                      backgroundColor: pool.color === 'Silver Mist' ? '#CCCCCC' : 
                                      pool.color === 'Blue Pearl' ? '#00BFFF' : 
                                      pool.color === 'Graphite' ? '#333333' : '#FFFFFF'
                    }}
                  />
                  {pool.color}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}