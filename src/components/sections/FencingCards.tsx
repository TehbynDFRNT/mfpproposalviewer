/**
 * File: src/components/sections/FencingCards.tsx
 */
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Image from "next/image";
import type { ProposalSnapshot } from '@/types/snapshot';
import { calculatePrices } from '@/hooks/use-price-calculator';

/**
 * Renders **one card per fencing package**.
 * Pass the whole enriched snapshot so we can read `snapshot.fences`.
 */
export default function FencingCards({ snapshot }: { snapshot: ProposalSnapshot }) {
  // build static fence packages: glass and metal
  const packages: Array<{
    fenceType: string;
    totalFenceLengthM: number;
    fenceLinearCost: number;
    gateSelection: { 
      quantity: number; 
      gateTotalCost: number; 
      gateDiscountedCost: number;
      freeGateDiscount: number 
    };
    panels: { simpleCount: number; complexCount: number };
    earthingRequired: boolean;
    earthingCost: number;
    costSummary: { totalCost: number };
  }> = [];

  // Frameless Glass Fencing
  if (snapshot.glass_linear_meters && snapshot.glass_fence_total_cost != null) {
    // Calculate special gate pricing for frameless glass
    const glassGateCount = snapshot.glass_gates ?? 0;
    let glassGateCost = 0;
    let glassGateOriginalCost = 0;
    let glassGateDiscount = 0;
    
    if (glassGateCount > 0) {
      // Standard per-gate price is $385
      const standardGatePrice = 385;
      
      // Calculate original total gate cost (before discount)
      glassGateOriginalCost = snapshot.glass_gate_cost ?? 0;
      
      // Apply discount: first gate is free ($385 discount)
      glassGateDiscount = 385;
      
      // Total gate cost with discount applied
      glassGateCost = glassGateOriginalCost - glassGateDiscount;
      
      // Ensure gate cost doesn't go negative
      if (glassGateCost < 0) glassGateCost = 0;
    }
    
    packages.push({
      fenceType: 'Frameless Glass Fencing',
      totalFenceLengthM: snapshot.glass_linear_meters,
      fenceLinearCost: snapshot.glass_fence_cost ?? 0,
      gateSelection: {
        quantity: glassGateCount,
        gateTotalCost: glassGateOriginalCost, // Show original cost
        gateDiscountedCost: glassGateCost, // Store discounted cost for reference
        freeGateDiscount: glassGateDiscount,
      },
      panels: {
        simpleCount: snapshot.glass_simple_panels ?? 0,
        complexCount: snapshot.glass_complex_panels ?? 0,
      },
      earthingRequired: snapshot.glass_earthing_required ?? false,
      earthingCost: snapshot.glass_earthing_cost ?? 0,
      costSummary: { totalCost: snapshot.glass_fence_total_cost },
    });
  }

  // Flat-Top Metal Fencing
  if (snapshot.metal_linear_meters && snapshot.metal_fence_total_cost != null) {
    packages.push({
      fenceType: 'Flat-Top Metal Fencing',
      totalFenceLengthM: snapshot.metal_linear_meters,
      fenceLinearCost: snapshot.metal_fence_cost ?? 0,
      gateSelection: {
        quantity: snapshot.metal_gates ?? 0,
        gateTotalCost: snapshot.metal_gate_cost ?? 0,
        gateDiscountedCost: snapshot.metal_gate_cost ?? 0, // Add missing property
        freeGateDiscount: 0,
      },
      panels: {
        simpleCount: snapshot.metal_simple_panels ?? 0,
        complexCount: snapshot.metal_complex_panels ?? 0,
      },
      earthingRequired: snapshot.glass_earthing_required ?? false,
      earthingCost: snapshot.glass_earthing_cost ?? 0,
      costSummary: { totalCost: snapshot.metal_fence_total_cost },
    });
  }

  if (packages.length === 0) return null;

  // Use our own formatter to ensure consistent dollar sign display
  const fmtCalc = (n: number) => n.toLocaleString('en-AU');
  // Also get the breakdown from the calculator
  const { breakdown } = calculatePrices(snapshot);
  
  // Our display formatter that ensures just one $ sign
  const fmt = (n: number) => '$' + fmtCalc(n);

  return (
    <div className="space-y-6 h-full overflow-y-auto">
      {packages.map(pkg => (
        <Card key={pkg.fenceType} className="w-full shadow-lg">
          <CardContent className="p-5 space-y-6">
            <div className="mb-2">
              <h3 className="text-xl font-semibold">
                {pkg.fenceType}
              </h3>
              <p className="text-base text-muted-foreground">
                Safety-compliant barrier with premium finish
              </p>
            </div>
          
          <Separator className="mb-4" />
          
          <div className="space-y-3">
            <div className="mb-4">
              <div className="flex justify-between">
                <p className="font-medium">
                  Fence Length ({pkg.totalFenceLengthM}m)
                </p>
                <p className="font-medium whitespace-nowrap">
                  {fmt(pkg.fenceLinearCost)}
                </p>
              </div>
              <p className="text-base text-muted-foreground mt-0.5">Premium safety barrier with elegant finish</p>
            </div>
            
            {pkg.gateSelection.quantity > 0 && pkg.gateSelection.gateTotalCost > 0 && (
              <div className="mb-4">
                <div className="flex justify-between">
                  <p className="font-medium">
                    Safety Gate ({pkg.gateSelection.quantity})
                  </p>
                  <p className="font-medium whitespace-nowrap">
                    {fmt(pkg.gateSelection.gateTotalCost)}
                  </p>
                </div>
                <p className="text-base text-muted-foreground mt-0.5">Self-closing, child-resistant mechanism</p>
              </div>
            )}
            
            {pkg.panels.simpleCount > 0 && (
              <div className="mb-4">
                <div className="flex justify-between">
                  <p className="font-medium">Simple Retaining Panels ({pkg.panels.simpleCount})</p>
                  <p className="font-medium whitespace-nowrap">{fmt(pkg.panels.simpleCount * 220)}</p>
                </div>
                <p className="text-base text-muted-foreground mt-0.5">Standard height panels</p>
              </div>
            )}
            
            {pkg.panels.complexCount > 0 && (
              <div className="mb-4">
                <div className="flex justify-between">
                  <p className="font-medium">Complex Retaining Panels ({pkg.panels.complexCount})</p>
                  <p className="font-medium whitespace-nowrap">{fmt(pkg.panels.complexCount * 385)}</p>
                </div>
                <p className="text-base text-muted-foreground mt-0.5">Custom height panels</p>
              </div>
            )}
            
            {pkg.earthingRequired && pkg.earthingCost > 0 && (
              <div className="mb-4">
                <div className="flex justify-between">
                  <p className="font-medium">Safety Earthing</p>
                  <p className="font-medium whitespace-nowrap">{fmt(pkg.earthingCost)}</p>
                </div>
                <p className="text-base text-muted-foreground mt-0.5">Electrical grounding for metal components</p>
              </div>
            )}
            
            {pkg.fenceType === 'Frameless Glass Fencing' && pkg.gateSelection.freeGateDiscount > 0 && (
              <div className="mb-4">
                <div className="flex justify-between">
                  <p className="font-medium text-green-700">First Gate Discount</p>
                  <p className="font-medium whitespace-nowrap text-green-700">
                    -{fmt(pkg.gateSelection.freeGateDiscount)}
                  </p>
                </div>
                <p className="text-base text-green-700 mt-0.5">$385 discount on first gate</p>
              </div>
            )}
          </div>
          
          <Separator className="mb-3" />
          
          <div className="flex justify-between items-center">
            <p className="font-semibold text-xl">Total Cost</p>
            <p className="text-xl font-semibold">
              {fmt(pkg.costSummary.totalCost)}
            </p>
          </div>
          </CardContent>
        </Card>
      ))}
      
      {/* Fencing VIP Card */}
      <Card className="p-4 overflow-y-auto shadow-lg">
        <CardContent className="px-2 flex items-center h-full">
          <div className="flex flex-row items-center w-full">
            {/* Left: VIP graphic */}
            <div className="flex-shrink-0 pr-6 flex items-center justify-center h-full w-20 sm:w-20 lg:w-20">
              <Image 
                src="/VipCards/fencinghero.webp" 
                alt="Temporary Pool Fencing" 
                className="w-full h-16 object-cover rounded-md" 
                width={80}
                height={64}
              />
            </div>

            {/* Right: copy & value points */}
            <div className="flex-grow">
              <div className="mb-1">
                <span className="inline-block text-xs font-bold px-2 py-0.5 rounded-full bg-yellow-400/80 text-yellow-900 mb-1 lg:hidden">
                  VIP
                </span>
                <div className="flex items-center">
                  <h3 className="text-base font-semibold">Temporary Fencing Package</h3>
                  <span className="ml-2 hidden lg:inline-block text-xs font-bold px-2 py-0.5 rounded-full bg-yellow-400/80 text-yellow-900">
                    VIP
                  </span>
                </div>
              </div>

              <p className="text-base mb-1">8-Week compliant safety barrier during construction phase</p>
              <div className="mt-2">
                <p className="text-base font-semibold">
                  <span>RRP </span>
                  <span className="line-through">$495.00</span>
                </p>
                <p className="text-base font-semibold text-green-700">Included FREE</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}