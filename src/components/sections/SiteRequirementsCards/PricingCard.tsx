/**
 * File: src/components/sections/SiteRequirementsCards/PricingCard.tsx
 */
'use client';
import { motion }           from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Separator }         from '@/components/ui/separator';
import { subCardFade }       from '@/lib/animation';
import type { ProposalSnapshot } from '@/types/snapshot';

export function PricingCard({ snapshot }: { snapshot: ProposalSnapshot }) {
  // Formatting helper
  const fmt = (n: number) => n.toLocaleString('en-AU', { style: 'currency', currency: 'AUD' });

  // Site prep costs
  const craneLabel = snapshot.crn_name;
  const craneCost = snapshot.crane_cost;
  
  // Separate bobcat and excavation
  const bobcatLabel = snapshot.bob_size_category;
  const bobcatCost = snapshot.bobcat_cost;
  
  // Excavation from dig_types
  const excavationLabel = snapshot.dig_name;
  const excavationCost = snapshot.dig_excavation_rate * snapshot.dig_excavation_hours;
  const truckCost = snapshot.dig_truck_rate * snapshot.dig_truck_hours * snapshot.dig_truck_qty;
  const excavationTotalCost = excavationCost + truckCost;
  
  const trafficLabel = snapshot.tc_name;
  const trafficCost = snapshot.traffic_control_cost;

  // Electrical cost items
  const electricalItems = [
    snapshot.elec_standard_power_flag ? { label: 'Standard Power', cost: snapshot.elec_standard_power_rate ?? 0 } : null,
    snapshot.elec_fence_earthing_flag ? { label: 'Fence Earthing', cost: snapshot.elec_fence_earthing_rate ?? 0 } : null,
    snapshot.elec_heat_pump_circuit_flag ? { label: 'Heat Pump Circuit', cost: snapshot.elec_heat_pump_circuit_rate ?? 0 } : null,
  ].filter((i): i is { label: string; cost: number } => i !== null);

  // Base installation costs
  const sitePrepTotal = craneCost + bobcatCost + excavationTotalCost + trafficCost;
  const electricalTotal = snapshot.elec_total_cost;
  const baseInstallationCost = sitePrepTotal + electricalTotal;
  
  // Apply margin using the same formula as pool price: Cost / (1 - Margin/100)
  const marginPercent = snapshot.pool_margin_pct || 0;
  const totalInstallation = marginPercent > 0 
    ? baseInstallationCost / (1 - marginPercent/100) 
    : baseInstallationCost;

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
            </div>

            {/* Electrical costs */}
            {electricalItems.length > 0 && (
              <>
                <Separator className="my-3" />
                
                <div className="space-y-3">
                  <div className="mb-2">
                    <p className="text-lg font-semibold">Electrical Requirements</p>
                  </div>
                  
                  {electricalItems.map((item, idx) => (
                    <div key={idx} className="mb-4">
                      <div className="flex justify-between">
                        <p className="font-medium">{item.label}</p>
                        <p className="font-medium whitespace-nowrap">{fmt(item.cost)}</p>
                      </div>
                      <p className="text-base text-muted-foreground mt-0.5">Professional installation</p>
                    </div>
                  ))}
                </div>
              </>
            )}

            <Separator className="mb-3" />

            {/* Grand total */}
            <div className="flex justify-between items-center">
              <p className="font-semibold text-xl">Total Cost</p>
              <p className="text-xl font-semibold">
                {fmt(totalInstallation)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

