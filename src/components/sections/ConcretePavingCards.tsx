/**
 * File: src/components/sections/ConcretePavingCards.tsx
 */
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Image from "next/image";
import type { ProposalSnapshot } from "@/types/snapshot";

// Define specific item types for clarity
interface PavingItem {
  label: string;
  detail: string;
  sqm?: number;
  cost: number;
}

export default function ConcretePavingCards({ snapshot }: { snapshot: ProposalSnapshot }) {
  const fmt = (n: number) => n.toLocaleString('en-AU', { style: 'currency', currency: 'AUD' });

  // Calculate combined paving costs and square meters
  const totalPavingCost = (snapshot.extra_paving_cost || 0) + (snapshot.existing_paving_cost || 0);
  const hasPaving = totalPavingCost > 0;

  // build concrete & paving line items from flat snapshot
  const items: (PavingItem | null)[] = [
    // Combined paving line item
    hasPaving ?
      {
        label: 'Extra Paving',
        detail: 'On new and existing concrete',
        sqm: (snapshot.extra_paving_sqm || 0) + (snapshot.existing_paving_sqm || 0),
        cost: totalPavingCost
      } : null,

    (snapshot.extra_concreting_saved_total && snapshot.extra_concreting_saved_total > 0) ?
      {
        label: 'Extra Concreting',
        detail: snapshot.extra_concreting_type
          ? snapshot.extra_concreting_type
              .replace(/-/g, ' ')
              .replace(/\b\w/g, c => c.toUpperCase())
          : 'Standard finish',
        sqm: snapshot.extra_concreting_sqm || 0,
        cost: snapshot.extra_concreting_saved_total
      } : null,

    // Moved down below separator
    (snapshot.concrete_cuts_cost && snapshot.concrete_cuts_cost > 0) ?
      {
        label: 'Concrete Cuts',
        detail: 'For expansion joints and pathways',
        cost: snapshot.concrete_cuts_cost
      } : null,

    // Always show Concrete Pump if needed, even if cost is zero
    snapshot.concrete_pump_needed ?
      {
        label: 'Concrete Pump',
        detail: snapshot.concrete_pump_quantity
          ? `Needed for ${snapshot.concrete_pump_quantity} Day${snapshot.concrete_pump_quantity !== 1 ? 's' : ''}`
          : 'Required for installation',
        cost: snapshot.concrete_pump_total_cost || 0
      } : null,

    (snapshot.uf_strips_cost && snapshot.uf_strips_cost > 0) ?
      {
        label: 'Under-Fence Strips',
        detail: 'Concrete strips under fence line',
        cost: snapshot.uf_strips_cost
      } : null,
  ];

  // Properly type-narrow the filtered array
  const validItems: PavingItem[] = items
    .filter((item): item is PavingItem => item !== null)
    .map(item => ({
      label: item.label,
      detail: item.detail || '', // Ensure detail is always a string
      ...(item.sqm !== undefined ? { sqm: item.sqm } : {}),
      cost: item.cost
    }));

  const totalCost = validItems.reduce((sum, item) => sum + item.cost, 0);

  return (
    <div className="space-y-6 h-full overflow-y-auto">
      {/* Concrete & Paving Section Cards */}
      <Card className="w-full shadow-lg">
        <CardContent className="p-5 space-y-6">
          <div className="mb-2">
            <h3 className="text-base font-semibold">Concrete & Paving</h3>
            <p className="text-sm text-muted-foreground">Premium surfaces and finishes for your pool area</p>
          </div>

          <Separator className="mb-4" />

          {/* Concrete & Paving cost breakdown */}
          <div className="space-y-3">
            {/* First group: Paving and Concreting items */}
            <div className="space-y-3">
              {validItems.slice(0, 2).map(item => (
                <div key={item.label} className="flex justify-between">
                  <div>
                    <p className="font-medium">{item.label}</p>
                    {item.detail && (
                      <p className="text-sm text-muted-foreground">
                        {item.detail}
                        {item.sqm ? ` (${item.sqm.toFixed(2)} m²)` : ''}
                      </p>
                    )}
                  </div>
                  <p className="font-medium whitespace-nowrap">{fmt(item.cost)}</p>
                </div>
              ))}
            </div>

            {/* Separator between groups */}
            <Separator className="mt-2 mb-3" />

            {/* Second group: Concrete Cuts, Pump, and Under-Fence */}
            <div className="space-y-3">
              {validItems.slice(2).map(item => (
                <div key={item.label} className="flex justify-between">
                  <div>
                    <p className="font-medium">{item.label}</p>
                    {item.detail && (
                      <p className="text-sm text-muted-foreground">
                        {item.detail}
                        {item.sqm ? ` (${item.sqm.toFixed(2)} m²)` : ''}
                      </p>
                    )}
                  </div>
                  <p className="font-medium whitespace-nowrap">{fmt(item.cost)}</p>
                </div>
              ))}
            </div>
          </div>

          <Separator className="mb-3" />

          {/* Grand total */}
          <div className="flex justify-between items-baseline mt-1">
            <p className="font-semibold">Total Cost</p>
            <p className="text-xl font-bold">
              {fmt(totalCost)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 3DStone Paver VIP Card */}
      <Card className="p-4 overflow-y-auto shadow-lg">
        <CardContent className="px-2 flex items-center h-full">
          <div className="flex flex-row items-center w-full">
            {/* Left: VIP graphic */}
            <div className="flex-shrink-0 pr-4 flex items-center justify-center h-full">
              <Image
                src="/VipCards/3dstone.webp"
                alt="Premium 3DStone Paver"
                className="w-16 h-16 rounded-md object-contain"
                width={64}
                height={64}
              />
            </div>

            {/* Right: copy & value points */}
            <div className="flex-grow">
              <h3 className="text-base font-semibold mb-1 flex items-center">
                Premium&nbsp;<i>3D Stone</i>&nbsp;Paver
                <span className="ml-2 inline-block text-xs font-bold px-2 py-0.5 rounded-full bg-yellow-400/80 text-yellow-900">
                  VIP
                </span>
              </h3>

              <p className="text-sm mb-1">Natural stone texture with superior durability</p>
              <p className="mt-2 text-sm font-bold">
                Valued At <span className="text-green-700">$1,850</span>
                <span className="block text-xs font-normal text-muted-foreground">Included at No Extra Charge</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}