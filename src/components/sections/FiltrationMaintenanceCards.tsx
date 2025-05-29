/**
 * File: src/components/sections/FiltrationMaintenanceCards.tsx
 */
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Separator }         from '@/components/ui/separator';
import Image                 from 'next/image';
import type { ProposalSnapshot } from '@/types/snapshot';
// Note: usePriceCalculator import removed as it's no longer needed

export default function FiltrationMaintenanceCards(
  { snapshot }: { snapshot: ProposalSnapshot }
) {
  /* ── Use the price calculator helper function ───────────────── */
  // Note: fmt removed as it's no longer needed since we show "Included" for all items
  
  /* ── build items from flat snapshot fields ───────────────── */
  // First prepare raw component prices
  const componentPrices = {
    pump: snapshot.pump_price_inc_gst || 0,
    filter: snapshot.filter_price_inc_gst || 0,
    sanitiser: snapshot.sanitiser_price_inc_gst || 0,
    light: snapshot.light_price_inc_gst || 0
  };
  
  // Calculate total base price for the components (excluding handover kit)
  const baseComponentsTotal = 
    componentPrices.pump + 
    componentPrices.filter + 
    componentPrices.sanitiser + 
    componentPrices.light;
  
  // Calculate handover kit cost
  const handoverKitCost = (snapshot.handover_components || [])
    .reduce((sum, c) => sum + c.hk_component_price_inc_gst * c.hk_component_quantity, 0);
  
  // Calculate percentage distribution based on component prices
  const getHandoverKitShare = (componentPrice: number) => {
    if (baseComponentsTotal === 0) return 0; // Avoid division by zero
    return (componentPrice / baseComponentsTotal) * handoverKitCost;
  };
  
  // Apply margin to individual item prices to match the displayed total
  const marginPercent = snapshot.pool_margin_pct || 0;
  const applyMargin = (price: number) => marginPercent > 0 
    ? price / (1 - marginPercent/100) 
    : price;
    
  const items = [
    { 
      name: snapshot.pump_name,
      price: applyMargin(componentPrices.pump + getHandoverKitShare(componentPrices.pump)),
      benefit: 'Reduces operating costs by up to 70%' 
    },
    { 
      name: snapshot.filter_name,
      price: applyMargin(componentPrices.filter + getHandoverKitShare(componentPrices.filter)),
      benefit: 'Maintains crystal-clear water with minimal maintenance' 
    },
    { 
      name: snapshot.sanitiser_name,
      price: applyMargin(componentPrices.sanitiser + getHandoverKitShare(componentPrices.sanitiser)),
      benefit: 'Provides reliable, automated sanitation' 
    },
    { 
      name: snapshot.light_name,
      price: applyMargin(componentPrices.light + getHandoverKitShare(componentPrices.light)),
      benefit: 'Creates beautiful night-time illumination' 
    },
  ].filter(i => i.price > 0);       // ignore zero-cost items

  /* ── render ─────────────────────────────────────────── */
  return (
    <div className="space-y-6 h-full overflow-y-auto">

      {/* Main Filtration Equipment Card */}
      <Card className="w-full shadow-lg">
        <CardContent className="p-5 space-y-6">
          <header>
            <h3 className="text-xl font-semibold">{snapshot.filtration_package_name || snapshot.spec_name} Filtration Package</h3>
            <p className="text-base text-muted-foreground">
              Crystal-clear water with minimal maintenance
            </p>
          </header>

          <Separator className="mb-4" />

          {/* equipment list */}
          <div className="space-y-3">
            {items.map((item, idx) => (
              <div key={idx} className="mb-4">
                <div className="flex justify-between">
                  <p className="font-medium">{item.name}</p>
                  <p className="font-medium whitespace-nowrap">Included</p>
                </div>
                <p className="text-base text-muted-foreground mt-0.5">{item.benefit}</p>
              </div>
            ))}
          </div>

          <Separator className="mb-3" />

          {/* Grand total */}
          <div className="flex justify-between items-center">
            <p className="font-semibold text-xl">Total Cost</p>
            <p className="text-xl font-semibold">Included in Base Price</p>
          </div>
        </CardContent>
      </Card>

      {/* ── VIP cards are purely marketing, leave static ── */}
      {/* 1 Year Mineral Supply */}
      <VipCard
        img="/VipCards/StartUpPack.webp"
        title="1 Year Mineral Supply"
        blurb="12-month water minerals with testing kit."
        rrp="480.00"
      />

      {/* Daily Clean Kit */}
      <VipCard
        img="/VipCards/Handoverkit.webp"
        title="Daily Clean Kit"
        blurb="Skimmer, brush, vacuum head and telescopic pole."
        rrp="320.00"
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* reusable tiny VIP component                                         */
/* ------------------------------------------------------------------ */
function VipCard(
  { img, title, blurb, rrp }: { img: string; title: string;
    blurb: string; rrp: string; }
) {
  return (
    <Card className="p-4 overflow-y-auto shadow-lg">
      <CardContent className="px-2 flex items-center h-full">
        <div className="flex flex-row items-center w-full">
          <div className="flex-shrink-0 pr-6 flex items-center justify-center h-full w-20 sm:w-20 lg:w-20">
            <Image src={img} alt={title} width={80} height={64}
                   className="w-full h-16 rounded-md object-contain" />
          </div>

          <div className="flex-grow">
            <div className="mb-1">
              <span className="inline-block text-xs font-bold px-2 py-0.5 rounded-full bg-yellow-400/80 text-yellow-900 mb-1 lg:hidden">
                VIP
              </span>
              <div className="flex items-center">
                <h3 className="text-base font-semibold">{title}</h3>
                <span className="ml-2 hidden lg:inline-block text-xs font-bold px-2 py-0.5 rounded-full bg-yellow-400/80 text-yellow-900">
                  VIP
                </span>
              </div>
            </div>

            <p className="text-base mb-1">{blurb}</p>

            <div className="mt-2">
              <p className="text-base font-semibold">
                <span>RRP </span>
                <span className="line-through">${rrp}</span>
              </p>
              <p className="text-base font-semibold text-green-700">Included FREE</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}