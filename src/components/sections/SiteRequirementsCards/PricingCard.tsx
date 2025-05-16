/**
 * File: src/components/sections/SiteRequirementsCards/PricingCard.tsx
 */
'use client';
import { motion }           from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Separator }         from '@/components/ui/separator';
import { subCardFade }       from '@/lib/animation';
import type { ProposalSnapshot } from '@/types/snapshot';
import { calculatePrices } from '@/hooks/use-price-calculator';

export function PricingCard({ snapshot }: { snapshot: ProposalSnapshot }) {
  // Use the price calculator for formatting and calculations
  const { fmt, breakdown } = calculatePrices(snapshot);
  
  // Apply margin function for individual line items
  const marginPercent = snapshot.pool_margin_pct || 0;
  const applyMargin = (cost: number) => marginPercent > 0 
    ? cost / (1 - marginPercent/100) 
    : cost;
  
  // Site prep costs with margin applied to each item
  const craneLabel = snapshot.crn_name;
  const craneCost = applyMargin(snapshot.crane_cost);
  
  // Separate bobcat and excavation
  const bobcatLabel = snapshot.bob_size_category;
  const bobcatCost = applyMargin(snapshot.bobcat_cost);
  
  // Excavation from dig_types
  const excavationLabel = snapshot.dig_name;
  const excavationCost = snapshot.dig_excavation_rate * snapshot.dig_excavation_hours;
  const truckCost = snapshot.dig_truck_rate * snapshot.dig_truck_hours * snapshot.dig_truck_qty;
  const excavationTotalCost = applyMargin(excavationCost + truckCost);
  
  const trafficLabel = snapshot.tc_name;
  const trafficCost = applyMargin(snapshot.traffic_control_cost);

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

  // Use the installation total from the price calculator
  const totalInstallation = breakdown.installationTotal;

  return (
    <motion.div
      variants={subCardFade}
      initial="initial"
      animate="enter"
      exit="exit"
      className="w-full min-h-[80vh] py-4"
    >
      <div className="space-y-6 h-full overflow-y-auto">
        <Card className="w-full shadow-lg">
          <CardContent className="p-5 space-y-6">
            <header>
              <h3 className="text-xl font-semibold">{snapshot.spec_name} Installation</h3>
              <p className="text-base text-muted-foreground">
                Professional site preparation and electrical work
              </p>
            </header>

            <Separator className="mb-4" />

            {/* Site preparation costs */}
            <div className="space-y-3">
              {craneLabel && (
                <div className="mb-4">
                  <div className="flex justify-between">
                    <p className="font-medium">Crane Service</p>
                    <p className="font-medium whitespace-nowrap">{fmt(craneCost)}</p>
                  </div>
                  <p className="text-base text-muted-foreground mt-0.5">{craneLabel}</p>
                </div>
              )}
              
              {excavationLabel && (
                <div className="mb-4">
                  <div className="flex justify-between">
                    <p className="font-medium">Excavation</p>
                    <p className="font-medium whitespace-nowrap">{fmt(excavationTotalCost)}</p>
                  </div>
                  <p className="text-base text-muted-foreground mt-0.5">{excavationLabel}</p>
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
                            <p className="font-medium whitespace-nowrap">{fmt(applyMargin(item.price))}</p>
                          </div>
                        </div>
                      ))
                    : null
                  }
                  
                  {snapshot.site_requirement_notes && (
                    <p className="text-base text-muted-foreground mt-0.5 mb-4">{snapshot.site_requirement_notes}</p>
                  )}
                </>
              )}
            </div>

            {/* Electrical costs */}
            {electricalItems.length > 0 && (
              <>
                <Separator className="my-3" />
                
                <div className="space-y-3">
                  <div className="mb-2">
                    <p className="text-lg font-semibold">Electrical Requirements</p>
                  </div>
                  
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
              </>
            )}

            <Separator className="mb-3" />

            {/* Grand total */}
            <div className="flex justify-between items-center">
              <p className="font-semibold text-xl">Total Cost</p>
              <p className="text-xl font-semibold">
                {fmt(breakdown.installationTotal)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

