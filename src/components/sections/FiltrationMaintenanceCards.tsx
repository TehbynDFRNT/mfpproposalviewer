/**
 * File: src/components/sections/FiltrationMaintenanceCards.tsx
 */
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Separator }         from '@/components/ui/separator';
import Image                 from 'next/image';
import type { ProposalSnapshot } from '@/types/snapshot';

export default function FiltrationMaintenanceCards(
  { snapshot }: { snapshot: ProposalSnapshot }
) {
  /* ── build items from flat snapshot fields ───────────────── */
  const items = [
    { name: snapshot.fp_pump_name || 'Pump',           price: snapshot.fp_pump_price,       benefit: snapshot.fp_pump_description || 'Reduces operating costs by up to 70%' },
    { name: snapshot.fp_filter_name || 'Filter',       price: snapshot.fp_filter_price,     benefit: snapshot.fp_filter_description || 'Maintains crystal-clear water with minimal maintenance' },
    { name: snapshot.fp_sanitiser_name || 'Sanitiser', price: snapshot.fp_sanitiser_price,  benefit: snapshot.fp_sanitiser_description || 'Provides reliable, automated sanitation' },
    { name: snapshot.fp_light_name || 'Light',         price: snapshot.fp_light_price,      benefit: snapshot.fp_light_description || 'Creates beautiful night-time illumination' },
    { name: snapshot.fp_handover_name || 'Handover Kit', price: snapshot.fp_handover_kit_price, benefit: snapshot.fp_handover_description || 'Complete pool maintenance essentials' },
  ].filter(i => i.price > 0);    // ignore items with zero price

  // Calculate base equipment cost (sum of all item prices)
  const equipmentBaseCost = items.reduce((t, i) => t + i.price, 0);
  
  // Apply margin using the formula: Cost / (1 - Margin/100)
  const marginPercent = snapshot.pool_margin_pct || 0;
  const equipmentTotal = marginPercent > 0 
    ? equipmentBaseCost / (1 - marginPercent/100) 
    : equipmentBaseCost;
    
  const fmt = (n: number) =>
    n.toLocaleString('en-AU', { style: 'currency', currency: 'AUD' });

  /* ── render ─────────────────────────────────────────── */
  return (
    <div className="space-y-6 h-full overflow-y-auto">

      {/* Main Filtration Equipment Card */}
      <Card className="w-full shadow-lg">
        <CardContent className="p-5 space-y-6">
          <header>
            <h3 className="text-xl font-semibold">{snapshot.spec_name} Filtration Package</h3>
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
                  <p className="font-medium whitespace-nowrap">{fmt(item.price)}</p>
                </div>
                <p className="text-base text-muted-foreground mt-0.5">{item.benefit}</p>
              </div>
            ))}
          </div>

          <Separator className="mb-3" />

          {/* Grand total */}
          <div className="flex justify-between items-center">
            <p className="font-semibold text-xl">Total Cost</p>
            <p className="text-xl font-semibold">{fmt(equipmentTotal)}</p>
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