// src/app/components/RetainingWallCards.tsx
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import type { Snapshot } from '@/app/lib/types/snapshot';

type RetainingWallCost = NonNullable<Snapshot['referenceTables']>['retainingWalls'][number];
type PoolProject       = Snapshot['poolProject'];

export default function RetainingWallCards({
  project,
  referenceTables,
}: {
  project: PoolProject;
  referenceTables: RetainingWallCost[];
}) {
  // 1) Which wall‐type did the user choose?
  const wallTypeId = project.retaining_wall1_type;
  if (!wallTypeId) return null;

  // 2) Find its cost entry in your reference table
  const costEntry = referenceTables.find(w => w.id === wallTypeId);
  if (!costEntry) return null;

  // 3) Grab the user’s dimensions from the project
  const height = project.retaining_wall1_height1 ?? 0;
  const length = project.retaining_wall1_length  ?? 0;
  const area   = height * length;

  // 4) Pull the base‐rate and the extra-cladding‐rate
  const baseRate     = costEntry.rate;      
  const claddingRate = costEntry.extra_rate;

  // 5) Calculate costs
  const baseCost     = baseRate     * area;
  const claddingCost = claddingRate * area;
  const totalCost    = baseCost + claddingCost;

  const fmt = (n: number) =>
    n.toLocaleString('en-AU', { style: 'currency', currency: 'AUD' });

  return (
    <div className="space-y-6 h-full overflow-y-auto">
      {/* Hero image + dimensions overlay */}
      <Card className="w-full overflow-y-auto shadow-lg">
        <div className="w-full relative">
          <div className="overflow-hidden h-48">
            <Image
              src="/_opt/retainingwall.webp"
              alt="Block Retaining Wall"
              className="w-full h-full object-cover object-top"
              width={800}
              height={450}
            />
            <div className="absolute bottom-0 right-0 p-4">
              <div className="bg-white/90 p-2 rounded-md">
                <p className="text-xs font-semibold">Wall Dimensions</p>
                <p className="text-xs">
                  H: {height} m × L: {length} m
                </p>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/70 to-transparent">
            <h3 className="text-2xl font-semibold text-white">Retaining Wall</h3>
          </div>
        </div>

        <CardContent className="p-5 flex flex-col">
          <p className="text-sm mb-4">
            Premium block wall with decorative cladding for superior durability and elegant appearance.
          </p>

          <Separator className="my-4" />

          <div className="mb-4">
            <h4 className="font-medium text-base mb-3">Retaining Wall Details</h4>
            <div className="space-y-3">

              {/* Wall Type + total for that type */}
              <div className="flex justify-between">
                <div>
                  <p className="text-sm font-medium">{costEntry.type}</p>
                  <p className="text-xs text-muted-foreground">
                    (includes margin {costEntry.margin}%)
                  </p>
                </div>
                <p className="font-medium whitespace-nowrap">{fmt(totalCost)}</p>
              </div>

              {/* Raw area */}
              <div className="flex justify-between">
                <div>
                  <p className="text-sm font-medium">Wall Area</p>
                  <p className="text-xs text-muted-foreground">
                    {area.toFixed(2)} m²
                  </p>
                </div>
                <p className="font-medium whitespace-nowrap">{area.toFixed(2)} m²</p>
              </div>

              {/* Base rate per m² */}
              <div className="flex justify-between">
                <div>
                  <p className="text-sm font-medium">Base Rate</p>
                  <p className="text-xs text-muted-foreground">Structural block cost</p>
                </div>
                <p className="font-medium whitespace-nowrap">
                  {fmt(baseRate)}/m²
                </p>
              </div>

              {/* Cladding rate per m² */}
              <div className="flex justify-between">
                <div>
                  <p className="text-sm font-medium">Cladding Rate</p>
                  <p className="text-xs text-muted-foreground">Decorative finish cost</p>
                </div>
                <p className="font-medium whitespace-nowrap">
                  {fmt(claddingRate)}/m²
                </p>
              </div>
            </div>
          </div>

          <Separator className="mb-3" />

          {/* Grand total */}
          <div className="flex justify-between items-baseline mt-1">
            <p className="font-semibold">Total Wall Price</p>
            <p className="text-xl font-bold">{fmt(totalCost)}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
