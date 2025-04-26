'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Image from "next/image";
import { subCardFade } from '@/lib/animation';
import type { ProposalData } from '@/types/proposal';

interface DetailsCardProps {
  pool: ProposalData['poolSelection']['pool'];
  costSummary: ProposalData['poolSelection']['costSummary'];
}

export function DetailsCard({ pool, costSummary }: DetailsCardProps) {
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
              Part of our Latin Series, the Verona features a slimline geometric design perfect for narrow spaces and compact backyards. Its corner entry steps create an uninterrupted swim zone, while the full-length bench seat offers a generous relaxation area  the ideal balance of swimming space and comfort in a smaller footprint.
            </p>
            <Separator className="my-4" />
            <p className="text-sm font-medium mb-3">Dimensions (m)</p>
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium block">Length</span>
                <span>{pool.dimensions.lengthM} m</span>
              </div>
              <div>
                <span className="font-medium block">Width</span>
                <span>{pool.dimensions.widthM} m</span>
              </div>
              <div>
                <span className="font-medium block">Shallow</span>
                <span>{pool.dimensions.shallowDepthM} m</span>
              </div>
              <div>
                <span className="font-medium block">Deep</span>
                <span>{pool.dimensions.deepDepthM} m</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Pool Price Summary Card */}
        <Card className="w-full shadow-lg">
          <CardContent className="p-5">
            <div className="flex justify-between items-baseline">
              <p className="font-semibold">Base Pool Price</p>
              <p className="text-xl font-bold">${costSummary.totalCost.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}