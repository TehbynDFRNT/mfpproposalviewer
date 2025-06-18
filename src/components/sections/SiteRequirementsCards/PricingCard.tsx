/**
 * File: src/components/sections/SiteRequirementsCards/PricingCard.tsx
 */
'use client';
import { motion }           from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Separator }         from '@/components/ui/separator';
import { subCardFade }       from '@/lib/animation';
import type { ProposalSnapshot } from '@/types/snapshot';
import { usePriceCalculator } from '@/hooks/use-price-calculator';

export function PricingCard({ snapshot }: { snapshot: ProposalSnapshot }) {
  // Use the price calculator for formatting and calculated total
  const { fmt, totals } = usePriceCalculator(snapshot);
  
  // Site prep costs 
  const craneLabel = snapshot.crn_name;
  const rawCraneCost = snapshot.crane_cost;
  
  // Handle crane cost logic: ‼️ New logic — margin ONLY on allowance, no margin on excess
  const getCraneDisplayInfo = () => {
    const craneAllowance = 700;
    const craneExcessCost = Math.max(rawCraneCost - craneAllowance, 0);
    
    if (craneExcessCost === 0) {
      return {
        displayCost: 'Included in Base Price',
        showSubtext: false,
        isIncluded: true,
        allowanceAmount: craneAllowance
      };
    } else {
      return {
        displayCost: craneExcessCost,
        showSubtext: true,
        isIncluded: false,
        allowanceAmount: craneAllowance
      };
    }
  };
  
  const craneInfo = getCraneDisplayInfo();
  
  // Separate bobcat
  const bobcatLabel = snapshot.bob_size_category;
  const bobcatCost = snapshot.bobcat_cost;
  
  const trafficLabel = snapshot.tc_name;
  const trafficCost = snapshot.traffic_control_cost;

  // Electrical cost items without margin (they already include margin)
  const electricalItems = [
    snapshot.elec_standard_power_flag ? { 
      label: 'Standard Power', 
      cost: snapshot.elec_standard_power_rate ?? 0
    } : null,
    snapshot.elec_fence_earthing_flag ? { 
      label: 'Fence Earthing', 
      cost: snapshot.elec_fence_earthing_rate ?? 0
    } : null,
    snapshot.elec_heat_pump_circuit_flag ? { 
      label: 'Heat Pump Circuit', 
      cost: snapshot.elec_heat_pump_circuit_rate ?? 0
    } : null,
  ].filter((i): i is { label: string; cost: number } => i !== null);

  // Use separate totals from the price calculator
  const siteRequirementsTotal = totals.siteRequirementsTotal;
  const electricalTotal = totals.electricalTotal;

  return (
    <motion.div
      variants={subCardFade}
      initial="initial"
      animate="enter"
      exit="exit"
      className="w-full min-h-[80vh] py-4"
    >
      <div className="space-y-6 h-full overflow-y-auto">
        {/* Site Requirements Card */}
        <Card className="w-full shadow-lg">
          <CardContent className="p-5 space-y-6">
            <header>
              <h3 className="text-xl font-semibold">Site Requirements</h3>
              <p className="text-base text-muted-foreground">
                Additional requirements unique to your site, ensuring a premium long lasting pool installation.
              </p>
            </header>

            <Separator className="mb-4" />

            {/* Site preparation costs */}
            <div className="space-y-3">
              {craneLabel && (
                <div className="mb-4">
                  <div className="flex justify-between">
                    <p className="font-medium">Crane Service</p>
                    <p className="font-medium whitespace-nowrap">
                      {craneInfo.isIncluded ? craneInfo.displayCost as string : fmt(craneInfo.displayCost as number)}
                    </p>
                  </div>
                  <p className="text-base text-muted-foreground mt-0.5">{craneLabel}</p>
                  {craneInfo.showSubtext && (
                    <p className="text-base text-muted-foreground mt-0.5">{fmt(craneInfo.allowanceAmount)} Crane allowance included in base price</p>
                  )}
                </div>
              )}
              
              {bobcatLabel && (
                <div className="mb-4">
                  <div className="flex justify-between">
                    <p className="font-medium">Bobcat</p>
                    <p className="font-medium whitespace-nowrap">{fmt(bobcatCost)}</p>
                  </div>
                  <p className="text-base text-muted-foreground mt-0.5">{bobcatLabel} size</p>
                </div>
              )}
              
              {trafficLabel && (
                <div className="mb-4">
                  <div className="flex justify-between">
                    <p className="font-medium">Traffic Management</p>
                    <p className="font-medium whitespace-nowrap">{fmt(trafficCost)}</p>
                  </div>
                  <p className="text-base text-muted-foreground mt-0.5">{trafficLabel}</p>
                </div>
              )}
              
              {/* Custom site requirements */}
              {snapshot.site_requirements_data && (
                <>
                  <div className="mb-2">
                    <p className="text-lg font-semibold">Custom Site Requirements</p>
                  </div>
                  
                  {Array.isArray(snapshot.site_requirements_data) 
                    ? snapshot.site_requirements_data.map((item: { id: string, price: number, description: string }) => (
                        <div key={item.id} className="mb-4">
                          <div className="flex justify-between">
                            <p className="font-medium">{item.description}</p>
                            <p className="font-medium whitespace-nowrap">{fmt(item.price)}</p>
                          </div>
                        </div>
                      ))
                    : null
                  }
                  
                  {snapshot.site_requirements_notes && (
                    <p className="text-base text-muted-foreground mt-0.5 mb-4">{snapshot.site_requirements_notes}</p>
                  )}
                </>
              )}
            </div>

            <Separator className="mb-3" />

            {/* Site Requirements Total */}
            <div className="flex justify-between items-center">
              <p className="font-semibold text-xl">Total Cost</p>
              <p className="text-xl font-semibold">
                {fmt(siteRequirementsTotal)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Electrical Requirements Card */}
        {electricalItems.length > 0 && (
          <Card className="w-full shadow-lg">
            <CardContent className="p-5 space-y-6">
              <header>
                <h3 className="text-xl font-semibold">Electrical Requirements</h3>
                <p className="text-base text-muted-foreground">
                  Professional electrical installation and connections
                </p>
              </header>

              <Separator className="mb-4" />
              
              <div className="space-y-3">
                {electricalItems.map((item, idx) => {
                  // Custom descriptions that are user-friendly for each electrical item
                  let description = '';
                  switch(item.label) {
                    case 'Standard Power':
                      description = 'Filtered pump power connection with safety features';
                      break;
                    case 'Fence Earthing':
                      description = 'Safety earthing for metal pool fencing';
                      break;
                    case 'Heat Pump Circuit':
                      description = 'Dedicated high-capacity circuit for pool heating';
                      break;
                    default:
                      description = 'Professional electrical installation';
                  }
                  
                  return (
                    <div key={idx} className="mb-4">
                      <div className="flex justify-between">
                        <p className="font-medium">{item.label}</p>
                        <p className="font-medium whitespace-nowrap">{fmt(item.cost)}</p>
                      </div>
                      <p className="text-base text-muted-foreground mt-0.5">{description}</p>
                    </div>
                  );
                })}
              </div>

              <Separator className="mb-3" />

              {/* Electrical Total */}
              <div className="flex justify-between items-center">
                <p className="font-semibold text-xl">Total Cost</p>
                <p className="text-xl font-semibold">
                  {fmt(electricalTotal)}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </motion.div>
  );
}

