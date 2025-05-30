/**
 * File: src/components/sections/PoolSelectionCards/ColourGuardCard.tsx
 */
'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import Image from "next/image";
import { subCardFade } from '@/lib/animation';
import type { ProposalSnapshot } from "@/types/snapshot";

export function ColourGuardCard({ snapshot }: { snapshot?: ProposalSnapshot }) {
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
        <p className="text-white text-base mb-4">
          We go beyond the industry standard installation inclusions. All MFP installation customers receive our VIP treatment. From industry leading materials to the final touches that make your pool yours.
        </p>
        <div className="flex flex-col space-y-4">
          {/* ColourGuard VIP Card */}
          <Card className="p-4 overflow-y-auto shadow-lg">
            <CardContent className="px-2 flex items-center h-full">
              <div className="flex flex-row items-center w-full">
                {/* Left: VIP graphic */}
                <div className="flex-shrink-0 pr-6 flex items-center justify-center h-full w-20 sm:w-20 lg:w-20">
                  <Image
                    src="/VipCards/silver_mist_half_circle.webp"
                    alt="ColourGuard® Silver Mist"
                    className="w-full h-16 object-contain transform rotate-90"
                    width={80}
                    height={64}
                    priority
                  />
                </div>

                {/* Right: copy & value points */}
                <div className="flex-grow">
                  <div className="mb-1">
                    <span className="inline-block text-xs font-bold px-2 py-0.5 rounded-full bg-yellow-400/80 text-yellow-900 mb-1 lg:hidden">
                      VIP
                    </span>
                    <div className="flex items-center">
                      <h3 className="text-base font-semibold">ColourGuard® Finish</h3>
                      <span className="ml-2 hidden lg:inline-block text-xs font-bold px-2 py-0.5 rounded-full bg-yellow-400/80 text-yellow-900">
                        VIP
                      </span>
                    </div>
                  </div>

                  <p className="text-base mb-1">Dual-surface UV protection system</p>
                  <div className="mt-2">
                    <p className="text-base font-semibold">
                      <span>RRP </span>
                      <span className="line-through">$3,700</span>
                    </p>
                    <p className="text-base font-semibold text-green-700">Included FREE</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Graphene VIP Card */}
          <Card className="p-4 overflow-y-auto shadow-lg">
            <CardContent className="px-2 flex items-center h-full">
              <div className="flex flex-row items-center w-full">
                {/* Left: VIP graphic */}
                <div className="flex-shrink-0 pr-6 flex items-center justify-center h-full w-20 sm:w-20 lg:w-20">
                  <Image
                    src="/VipCards/graphene.webp"
                    alt="Graphene VIP Upgrade"
                    className="w-full h-16 rounded-md object-contain"
                    width={80}
                    height={64}
                    priority
                  />
                </div>

                {/* Right: copy & value points */}
                <div className="flex-grow">
                  <div className="mb-1">
                    <span className="inline-block text-xs font-bold px-2 py-0.5 rounded-full bg-yellow-400/80 text-yellow-900 mb-1 lg:hidden">
                      VIP
                    </span>
                    <div className="flex items-center">
                      <h3 className="text-base font-semibold">Graphene‑Fortified Shell</h3>
                      <span className="ml-2 hidden lg:inline-block text-xs font-bold px-2 py-0.5 rounded-full bg-yellow-400/80 text-yellow-900">
                        VIP
                      </span>
                    </div>
                  </div>

                  <p className="text-base mb-1">200 × stronger than steel</p>
                  <div className="mt-2">
                    <p className="text-base font-semibold">
                      <span>RRP </span>
                      <span className="line-through">$3,200</span>
                    </p>
                    <p className="text-base font-semibold text-green-700">Included FREE</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Extra Pavers VIP Card */}
          <Card className="p-4 overflow-y-auto shadow-lg">
            <CardContent className="px-2 flex items-center h-full">
              <div className="flex flex-row items-center w-full">
                {/* Left: VIP graphic */}
                <div className="flex-shrink-0 pr-6 flex items-center justify-center h-full w-20 sm:w-20 lg:w-20">
                  <Image
                    src="/VipCards/coping.webp"
                    alt="Extra Pavers VIP Upgrade"
                    className="w-full h-16 rounded-md object-contain"
                    width={80}
                    height={64}
                    priority
                  />
                </div>

                {/* Right: copy & value points */}
                <div className="flex-grow">
                  <div className="mb-1">
                    <span className="inline-block text-xs font-bold px-2 py-0.5 rounded-full bg-yellow-400/80 text-yellow-900 mb-1 lg:hidden">
                      VIP
                    </span>
                    <div className="flex items-center">
                      <h3 className="text-base font-semibold">Extra Deep‑End Paving Row</h3>
                      <span className="ml-2 hidden lg:inline-block text-xs font-bold px-2 py-0.5 rounded-full bg-yellow-400/80 text-yellow-900">
                        VIP
                      </span>
                    </div>
                  </div>

                  <p className="text-base mb-1">1 extra row of coping pavers at deep end</p>
                  <div className="mt-2">
                    <p className="text-base font-semibold">
                      <span>RRP </span>
                      <span className="line-through">$850</span>
                    </p>
                    <p className="text-base font-semibold text-green-700">Included FREE</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Quad Lid VIP Card */}
          <Card className="p-4 overflow-y-auto shadow-lg">
            <CardContent className="px-2 flex items-center h-full">
              <div className="flex flex-row items-center w-full">
                {/* Left: VIP graphic */}
                <div className="flex-shrink-0 pr-6 flex items-center justify-center h-full w-20 sm:w-20 lg:w-20">
                  <Image
                    src="/VipCards/quadlid.webp"
                    alt="Quad Skimmer Lid"
                    className="w-full h-16 rounded-md object-contain"
                    width={80}
                    height={64}
                    priority
                  />
                </div>

                {/* Right: copy & value points */}
                <div className="flex-grow">
                  <div className="mb-1">
                    <span className="inline-block text-xs font-bold px-2 py-0.5 rounded-full bg-yellow-400/80 text-yellow-900 mb-1 lg:hidden">
                      VIP
                    </span>
                    <div className="flex items-center">
                      <h3 className="text-base font-semibold">Quad Skimmer Lid</h3>
                      <span className="ml-2 hidden lg:inline-block text-xs font-bold px-2 py-0.5 rounded-full bg-yellow-400/80 text-yellow-900">
                        VIP
                      </span>
                    </div>
                  </div>

                  <p className="text-base mb-1">Quad‑lock design stays flush & secure</p>
                  <div className="mt-2">
                    <p className="text-base font-semibold">
                      <span>RRP </span>
                      <span className="line-through">$450</span>
                    </p>
                    <p className="text-base font-semibold text-green-700">Included FREE</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}