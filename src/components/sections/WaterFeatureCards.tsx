/**
 * File: src/components/sections/WaterFeatureCards.tsx
 */
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Image from "next/image";
import type { ProposalSnapshot } from "@/app/lib/types/snapshot";

export default function WaterFeatureCards({
  snapshot,
}: { snapshot: ProposalSnapshot }) {
  return (
    <div className="space-y-6 h-full overflow-y-auto">
      {/* Water Feature Hero Card */}
      <Card className="w-full overflow-y-auto shadow-lg">
        <div className="w-full relative">
          <div className="overflow-hidden h-48">
            <Image 
              src="/CardHero/water-feature-hero.webp" 
              alt="Water Feature" 
              className="w-full h-full object-cover object-top" 
              width={800}
              height={450}
            />
            {/* Overlay diagram - bottom right positioning */}
            <div className="absolute bottom-0 right-0 p-4">
              <div className="bg-white/90 p-2 rounded-md">
                <p className="text-xs font-semibold">Feature Dimensions</p>
                <p className="text-xs">
                  {snapshot.water_feature_size.split(' - ')[0]}
                </p>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/70 to-transparent">
            <h3 className="text-2xl font-semibold text-white">
              Water Feature
            </h3>
          </div>
        </div>

        <CardContent className="p-5 flex flex-col">
          <p className="text-sm mb-4">
            Custom water feature with LED lighting, creating a stunning visual and soothing audio experience for your pool area.
          </p>
          
          <Separator className="my-4" />
          
          <div className="mb-4">
            <div className="space-y-3">

              {/* 1) Size */}
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">Size</p>
                </div>
                <p className="font-medium whitespace-nowrap">
                  {snapshot.water_feature_size.split(' - ')[0].replace(/\b\w/g, l => l.toUpperCase())}
                </p>
              </div>

              {/* 2) LED Blade - only show if not "none" */}
              {snapshot.water_feature_led_blade && 
               !snapshot.water_feature_led_blade.toLowerCase().includes('none') && (
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">LED Blade Selection</p>
                  </div>
                  <p className="font-medium whitespace-nowrap">
                    {snapshot.water_feature_led_blade.split(' - ')[0]}
                  </p>
                </div>
              )}

              {/* Front Cladding - only show if not "none" */}
              {snapshot.water_feature_front_finish && 
               !snapshot.water_feature_front_finish.toLowerCase().includes('none') && (
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">Front Cladding</p>
                  </div>
                  <p className="font-medium whitespace-nowrap capitalize">
                    {snapshot.water_feature_front_finish.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </p>
                </div>
              )}

              {/* Side Cladding - only show if not "none" */}
              {snapshot.water_feature_sides_finish && 
               !snapshot.water_feature_sides_finish.toLowerCase().includes('none') && (
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">Side Cladding</p>
                  </div>
                  <p className="font-medium whitespace-nowrap capitalize">
                    {snapshot.water_feature_sides_finish.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </p>
                </div>
              )}

              {/* Back Cladding - only show if "Yes" */}
              {snapshot.water_feature_back_cladding_needed === true && (
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">Back Cladding</p>
                  </div>
                  <p className="font-medium whitespace-nowrap">Yes</p>
                </div>
              )}
            </div>
          </div>
          
          <Separator className="mb-3" />

          {/* TOTAL */}
          <div className="flex justify-between items-baseline mt-1">
            <p className="font-semibold">Total Feature Price</p>
            <p className="text-xl font-bold">
              ${snapshot.water_feature_total_cost.toLocaleString()}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
