/**
 * File: src/components/sections/SiteRequirementsCards/PricingCard.tsx
 */
'use client';
import { motion }           from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Separator }         from '@/components/ui/separator';
import { subCardFade }       from '@/app/lib/animation';
import type { ProposalSnapshot } from '@/app/lib/types/snapshot';

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
              <h3 className="text-base font-semibold">{snapshot.spec_name} Installation</h3>
              <p className="text-sm text-muted-foreground">
                Professional site preparation and electrical work
              </p>
            </header>

            <Separator className="mb-4" />

            {/* Site preparation costs */}
            <div className="space-y-3">
              <div className="mb-2">
                <p className="text-sm font-medium">Site Preparation</p>
              </div>
              
              {craneLabel && (
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm font-medium leading-tight">Crane Service</p>
                    <p className="text-xs text-muted-foreground">{craneLabel}</p>
                  </div>
                  <p className="font-medium whitespace-nowrap">{fmt(craneCost)}</p>
                </div>
              )}
              
              {excavationLabel && (
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm font-medium leading-tight">Excavation</p>
                    <p className="text-xs text-muted-foreground">{excavationLabel}</p>
                  </div>
                  <p className="font-medium whitespace-nowrap">{fmt(excavationTotalCost)}</p>
                </div>
              )}
              
              {bobcatLabel && (
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm font-medium leading-tight">Bobcat</p>
                    <p className="text-xs text-muted-foreground">{bobcatLabel} size</p>
                  </div>
                  <p className="font-medium whitespace-nowrap">{fmt(bobcatCost)}</p>
                </div>
              )}
              
              {trafficLabel && (
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm font-medium leading-tight">Traffic Management</p>
                    <p className="text-xs text-muted-foreground">{trafficLabel}</p>
                  </div>
                  <p className="font-medium whitespace-nowrap">{fmt(trafficCost)}</p>
                </div>
              )}
            </div>

            {/* Electrical costs */}
            {electricalItems.length > 0 && (
              <>
                <Separator className="my-3" />
                
                <div className="space-y-3">
                  <div className="mb-2">
                    <p className="text-sm font-medium">Electrical Requirements</p>
                  </div>
                  
                  {electricalItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between">
                      <div>
                        <p className="text-sm font-medium leading-tight">{item.label}</p>
                        <p className="text-xs text-muted-foreground">Professional installation</p>
                      </div>
                      <p className="font-medium whitespace-nowrap">{fmt(item.cost)}</p>
                    </div>
                  ))}
                </div>
              </>
            )}

            <Separator className="mb-3" />

            {/* Grand total */}
            <div className="flex justify-between items-baseline mt-1">
              <p className="font-semibold">Total Installation Cost</p>
              <p className="text-xl font-bold">
                {fmt(totalInstallation)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

