import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Image from "next/image";
import type { ProposalData } from '@/types/proposal';

export default function RetainingWallCards({ data }: { data: ProposalData['retainingWalls'] }) {
  return (
    <div className="space-y-6 h-full overflow-y-auto">
      {/* Retaining Walls Hero Card */}
      <Card className="w-full overflow-y-auto shadow-lg">
        <div className="w-full relative">
          <div className="overflow-hidden h-48">
            <Image 
              src="/_opt/retainingwall.webp" 
              alt="Block Retaining Wall" 
              className="w-full h-full object-cover object-top" 
              width={800}
              height={450}
            />
            {/* Overlay diagram - bottom right positioning */}
            <div className="absolute bottom-0 right-0 p-4">
              <div className="bg-white/90 p-2 rounded-md">
                <p className="text-xs font-semibold">Wall Dimensions</p>
                <p className="text-xs">H: {data.walls[0].height1M}m × L: {data.walls[0].lengthM}m</p>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/70 to-transparent">
            <h3 className="text-2xl font-semibold text-white">Retaining Wall</h3>
          </div>
        </div>
        <CardContent className="p-5 flex flex-col">
          <p className="text-sm mb-4">
            Premium block wall with decorative cladding for superior durability and elegant appearance.
          </p>
          
          <Separator className="my-4" />
          
          <div className="mb-4">
            <h4 className="font-medium text-base mb-3">Retaining Wall Details</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm font-medium">{data.walls[0].wallType}</p>
                  <p className="text-xs text-muted-foreground">Premium finish with decorative face</p>
                </div>
                <p className="font-medium whitespace-nowrap">${data.walls[0].calculation.totalCost.toLocaleString()}</p>
              </div>
              
              <div className="flex justify-between">
                <div>
                  <p className="text-sm font-medium">Wall Area</p>
                  <p className="text-xs text-muted-foreground">Height: {data.walls[0].height1M}m × Length: {data.walls[0].lengthM}m</p>
                </div>
                <p className="font-medium whitespace-nowrap">{data.walls[0].calculation.squareMeters} m²</p>
              </div>
              
              <div className="flex justify-between">
                <div>
                  <p className="text-sm font-medium">Base Rate</p>
                  <p className="text-xs text-muted-foreground">Structural block wall construction</p>
                </div>
                <p className="font-medium whitespace-nowrap">${data.walls[0].baseRatePerM2}/m²</p>
              </div>
              
              <div className="flex justify-between">
                <div>
                  <p className="text-sm font-medium">Cladding Rate</p>
                  <p className="text-xs text-muted-foreground">Decorative finishing material</p>
                </div>
                <p className="font-medium whitespace-nowrap">${data.walls[0].extraRatePerM2}/m²</p>
              </div>
            </div>
          </div>
          
          <Separator className="mb-3" />
          
          <div className="flex justify-between items-baseline mt-1">
            <p className="font-semibold">Total Wall Price</p>
            <p className="text-xl font-bold">${data.costSummary.totalCost.toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}