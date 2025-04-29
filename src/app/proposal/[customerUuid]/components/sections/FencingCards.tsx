import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Image from "next/image";
import type { FencingPackage } from "@/app/lib/types/snapshot";

export default function FencingCards(
  { data }: { data: FencingPackage | null }
) {
  if (!data) return null;
  return (
    <div className="space-y-6 h-full overflow-y-auto">
      {/* Fencing Pricing Card */}
      <Card className="w-full shadow-lg">
        <CardContent className="p-5 space-y-6">
          <div className="mb-2">
            <h3 className="text-base font-semibold">Pool Fencing Package</h3>
            <p className="text-sm text-muted-foreground">Safety compliant glass fencing with premium finish</p>
          </div>
          
          <Separator className="mb-4" />
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium">{data.fenceType} Fencing ({data.totalFenceLengthM} meters)</p>
                <p className="text-xs text-muted-foreground">Premium safety barrier with elegant finish</p>
              </div>
              <p className="font-medium whitespace-nowrap">${data.fenceLinearCost.toLocaleString()}</p>
            </div>
            
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium">Safety Gate ({data.gateSelection.quantity})</p>
                <p className="text-xs text-muted-foreground">Self-closing, child-resistant mechanism</p>
              </div>
              <p className="font-medium whitespace-nowrap">${data.gateSelection.gateTotalCost.toLocaleString()}</p>
            </div>
            
            {data.fgRetainingPanels.simpleCount > 0 && (
              <div className="flex justify-between">
                <div>
                  <p className="text-sm font-medium">Simple Retaining Panels ({data.fgRetainingPanels.simpleCount})</p>
                  <p className="text-xs text-muted-foreground">Standard height panels</p>
                </div>
                <p className="font-medium whitespace-nowrap">${data.fgRetainingPanels.simpleCost.toLocaleString()}</p>
              </div>
            )}
            
            {data.fgRetainingPanels.complexCount > 0 && (
              <div className="flex justify-between">
                <div>
                  <p className="text-sm font-medium">Complex Retaining Panels ({data.fgRetainingPanels.complexCount})</p>
                  <p className="text-xs text-muted-foreground">Custom height panels</p>
                </div>
                <p className="font-medium whitespace-nowrap">${data.fgRetainingPanels.complexCost.toLocaleString()}</p>
              </div>
            )}
            
            {data.earthingRequired && (
              <div className="flex justify-between">
                <div>
                  <p className="text-sm font-medium">Safety Earthing</p>
                  <p className="text-xs text-muted-foreground">Electrical grounding for metal components</p>
                </div>
                <p className="font-medium whitespace-nowrap">${data.earthingCost.toLocaleString()}</p>
              </div>
            )}
            
            {data.gateSelection.freeGateDiscount > 0 && (
              <div className="flex justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Complimentary Gate Discount</p>
                  <p className="text-xs text-muted-foreground">Special offer included</p>
                </div>
                <p className="font-medium whitespace-nowrap text-green-700">-${data.gateSelection.freeGateDiscount.toLocaleString()}</p>
              </div>
            )}
          </div>
          
          <Separator className="mb-3" />
          
          <div className="flex justify-between items-baseline mt-1">
            <p className="font-semibold">Total Fencing Price</p>
            <p className="text-xl font-bold">${data.costSummary.totalCost.toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>
      
      {/* Fencing VIP Card */}
      <Card className="p-4 overflow-y-auto shadow-lg">
        <CardContent className="px-2 flex items-center h-full">
          <div className="flex flex-row items-center w-full">
            {/* Left: VIP graphic */}
            <div className="flex-shrink-0 pr-4 flex items-center justify-center h-full">
              <Image 
                src="/_opt/fencinghero.webp" 
                alt="Temporary Pool Fencing" 
                className="w-16 h-16 object-cover rounded-md" 
                width={64}
                height={64}
              />
            </div>

            {/* Right: copy & value points */}
            <div className="flex-grow">
              <h3 className="text-base font-semibold mb-1 flex items-center">
                Temporary Fencing Package
                <span className="ml-2 inline-block text-xs font-bold px-2 py-0.5 rounded-full bg-yellow-400/80 text-yellow-900">
                  VIP
                </span>
              </h3>

              <p className="text-sm mb-1">8-Week compliant safety barrier during construction phase</p>
              <p className="mt-2 text-sm font-bold">
                Valued At <span className="text-green-700">$495.00</span>
                <span className="block text-xs font-normal text-muted-foreground">Included at No Extra Charge</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}