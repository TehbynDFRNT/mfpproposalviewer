/**
 * File: src/components/sections/ConcretePavingCards.tsx
 */
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Image from "next/image";
import type { ProposalSnapshot } from "@/types/snapshot";
import { usePriceCalculator } from '@/hooks/use-price-calculator';

// Define specific item types for clarity
interface PavingItem {
  label: string;
  detail: string;
  sqm?: number;
  cost: number;
}

export default function ConcretePavingCards({ snapshot }: { snapshot: ProposalSnapshot }) {
  // Use the price calculator for formatting and calculated total
  const { fmt, totals } = usePriceCalculator(snapshot);
  
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

    (snapshot.extra_concreting_cost && snapshot.extra_concreting_cost > 0) ?
      {
        label: 'Extra Concreting',
        detail: snapshot.extra_concreting_name || snapshot.extra_concreting_type || 'Standard finish',
        sqm: snapshot.extra_concreting_sqm || 0,
        cost: snapshot.extra_concreting_cost
      } : null,

    // Moved down below separator
    (snapshot.concrete_cuts_cost && snapshot.concrete_cuts_cost > 0) ?
      {
        label: 'Concrete Cuts',
        detail: 'For expansion joints and pathways',
        cost: snapshot.concrete_cuts_cost
      } : null,

    // Concrete Pump (combined regular + extra)
    (snapshot.concrete_pump_needed || snapshot.extra_concrete_pump) ?
      {
        label: 'Concrete Pump',
        detail: (() => {
          const regularHours = snapshot.concrete_pump_hours || 0;
          const extraHours = snapshot.extra_concrete_pump_quantity || 0;
          const totalHours = regularHours + extraHours;
          
          if (totalHours > 0) {
            return `Needed for ${totalHours} Day${totalHours !== 1 ? 's' : ''}`;
          } else {
            return 'Required for installation';
          }
        })(),
        cost: (snapshot.concrete_pump_total_cost || 0) + (snapshot.extra_concrete_pump_total_cost || 0)
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
  

  return (
    <div className="space-y-6 h-full overflow-y-auto">
      {/* Concrete & Paving Section Cards */}
      <Card className="w-full shadow-lg">
        <CardContent className="p-5 space-y-6">
          <div className="mb-2">
            <h3 className="text-xl font-semibold">Concrete & Paving</h3>
            <p className="text-base text-muted-foreground">A pool scaping option to bring life to your pool area with Premium surfaces and finishes using 3DStone pavers</p>
          </div>

          <Separator className="mb-4" />

          {/* Concrete & Paving cost breakdown */}
          <div className="space-y-3">
            {/* First group: Paving and Concreting items */}
            <div className="space-y-8">
              {validItems.slice(0, 2).map(item => (
                <div key={item.label} className="mb-4">
                  <div className="flex justify-between">
                    <p className="font-medium">{item.label}</p>
                    <p className="font-medium whitespace-nowrap">{fmt(item.cost)}</p>
                  </div>
                  {item.detail && (
                    <p className="text-base text-muted-foreground mt-0.5">
                      {item.detail}
                      {item.sqm ? ` (${item.sqm.toFixed(2)} m²)` : ''}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Separator between groups */}
            <Separator className="mt-2 mb-3" />

            {/* Second group: Concrete Cuts, Pump, and Under-Fence */}
            <div className="space-y-8">
              {validItems.slice(2).map(item => (
                <div key={item.label} className="mb-4">
                  <div className="flex justify-between">
                    <p className="font-medium">{item.label}</p>
                    <p className="font-medium whitespace-nowrap">{fmt(item.cost)}</p>
                  </div>
                  {item.detail && (
                    <p className="text-base text-muted-foreground mt-0.5">
                      {item.detail}
                      {item.sqm ? ` (${item.sqm.toFixed(2)} m²)` : ''}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Separator className="mb-3" />

          {/* Grand total */}
          <div className="flex justify-between items-center">
            <p className="font-semibold text-xl">Total Cost</p>
            <p className="text-xl font-semibold">
              {fmt(totals.concreteTotal)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 3DStone Paver VIP Card */}
      <Card className="p-4 overflow-y-auto shadow-lg">
        <CardContent className="px-2 flex items-center h-full">
          <div className="flex flex-row items-center w-full">
            {/* Left: VIP graphic */}
            <div className="flex-shrink-0 pr-6 flex items-center justify-center h-full w-20 sm:w-20 lg:w-20">
              <Image
                src="/VipCards/3dstone.webp"
                alt="Premium 3DStone Paver"
                className="w-full h-16 rounded-md object-contain"
                width={80}
                height={64}
                priority
              />
            </div>

            {/* Right: copy & value points */}
            <div className="flex-grow">
              <div className="mb-1">
                <span className="inline-block text-xs font-bold px-2 py-0.5 rounded-full bg-yellow-400/80 text-yellow-900 mb-1 lg:hidden">
                  VIP
                </span>
                <div className="flex items-center">
                  <h3 className="text-base font-semibold">Premium 3D Stone Paver</h3>
                  <span className="ml-2 hidden lg:inline-block text-xs font-bold px-2 py-0.5 rounded-full bg-yellow-400/80 text-yellow-900">
                    VIP
                  </span>
                </div>
              </div>

              <p className="text-base mb-1">Natural stone texture with superior durability</p>
              <p className="mt-2 text-base font-semibold text-green-700">
                Premium Paver Upgrade
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}