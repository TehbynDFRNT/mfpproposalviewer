import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Image from "next/image";
import type { ProposalData } from '@/types/proposal';

export default function WaterFeatureCards({ data }: { data: ProposalData['waterFeature'] }) {
  return (
    <div className="space-y-6 h-full overflow-y-auto">
      {/* Water Feature Hero Card */}
      <Card className="w-full overflow-y-auto shadow-lg">
        <div className="w-full relative">
          <div className="overflow-hidden h-48">
            <Image 
              src="/_opt/water-feature-hero.webp" 
              alt="Water Feature" 
              className="w-full h-full object-cover object-top" 
              width={800}
              height={450}
            />
            {/* Overlay diagram - bottom right positioning */}
            <div className="absolute bottom-0 right-0 p-4">
              <div className="bg-white/90 p-2 rounded-md">
                <p className="text-xs font-semibold">Feature Dimensions</p>
                <p className="text-xs">{data.size.split(' - ')[0]}</p>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/70 to-transparent">
            <h3 className="text-2xl font-semibold text-white">Water Feature</h3>
          </div>
        </div>
        <CardContent className="p-5 flex flex-col">
          <p className="text-sm mb-4">
            Custom water feature with LED lighting, creating a stunning visual and soothing audio experience for your pool area.
          </p>
          
          <Separator className="my-4" />
          
          <div className="mb-4">
            <h4 className="font-medium text-base mb-3">Water Feature Details</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm font-medium">Feature Size</p>
                  <p className="text-xs text-muted-foreground">{data.size.split(' - ')[0]}</p>
                </div>
                <p className="font-medium whitespace-nowrap">$3,100</p>
              </div>
              
              <div className="flex justify-between">
                <div>
                  <p className="text-sm font-medium">LED Blade Selection</p>
                  <p className="text-xs text-muted-foreground">
                    {data?.ledBladeSelection ? 
                      data.ledBladeSelection.split(' - ')[0] : 
                      'Not selected'}
                  </p>
                </div>
                <p className="font-medium whitespace-nowrap">
                  {data?.ledBladeSelection ? 
                    `$${data.ledBladeSelection.split(' - ')[1]?.split('(')[0]?.replace('$', '') || '0'}` : 
                    '$0'}
                </p>
              </div>
              
              <div className="flex justify-between">
                <div>
                  <p className="text-sm font-medium">Material Finish</p>
                  <p className="text-xs text-muted-foreground">Front: {data.frontFinish} | Sides: {data.sidesFinish}</p>
                </div>
                <p className="font-medium whitespace-nowrap">Premium</p>
              </div>
              
              {data.backCladdingNeeded && (
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm font-medium">Back Cladding</p>
                    <p className="text-xs text-muted-foreground">Matching finish for all sides</p>
                  </div>
                  <p className="font-medium whitespace-nowrap">${data.backCladdingCost.toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>
          
          <Separator className="mb-3" />
          
          <div className="flex justify-between items-baseline mt-1">
            <p className="font-semibold">Total Feature Price</p>
            <p className="text-xl font-bold">${data.costSummary.totalCost.toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}