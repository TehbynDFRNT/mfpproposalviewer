'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import Image from "next/image";
import { subCardFade } from '@/app/lib/animation';

export function ColourGuardCard() {
  return (
    <motion.div
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
  );
}