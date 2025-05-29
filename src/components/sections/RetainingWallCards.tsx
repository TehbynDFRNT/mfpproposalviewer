/**
 * File: src/components/sections/RetainingWallCards.tsx
 */
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';
import { useState } from 'react';
import type { ProposalSnapshot } from '@/types/snapshot';
import { usePriceCalculator } from '@/hooks/use-price-calculator';

// Define proper wall type to help TypeScript - matches the JSONB structure
interface RetainingWall {
  id: number;
  wall_type: string;
  height1: number;
  height2: number | null;
  length: number;
  total_cost: number;
}

export default function RetainingWallCards({ snapshot }: { snapshot: ProposalSnapshot }) {
  // Helper function to calculate wall area using height1, height2, and length
  const calculateWallArea = (height1: number, height2: number | null, length: number) => {
    // If height2 is provided, use average height
    const avgHeight = height2 ? (height1 + height2) / 2 : height1;
    return avgHeight * length;
  };

  // Get walls from the JSONB structure and add IDs for component state management
  const availableWalls: RetainingWall[] = (snapshot.retaining_walls_json || [])
    .map((wall, index) => ({
      id: index + 1,
      ...wall
    }))
    .sort((a, b) => a.wall_type.localeCompare(b.wall_type));

  // State to track which wall is selected - define before conditional returns
  const [selectedWallId, setSelectedWallId] = useState(availableWalls.length > 0 ? availableWalls[0].id : 0);

  // If no retaining walls, don't render anything
  if (availableWalls.length === 0) return null;

  // Get the price calculator for consistent formatting and calculated total
  const { fmt, totals } = usePriceCalculator(snapshot);
  
  // Use the calculated retaining wall total from the price calculator
  const totalRetainingWallCost = totals.retainingWallsTotal;

  // Get the currently selected wall
  const selectedWall = availableWalls.find(wall => wall.id === selectedWallId) || availableWalls[0];

  // Calculate area using both height values
  const area = calculateWallArea(selectedWall.height1, selectedWall.height2, selectedWall.length);

  return (
    <div className="space-y-6 h-full overflow-y-auto">
      {/* Hero image + dimensions overlay */}
      <Card className="w-full overflow-y-auto shadow-lg">
        <div className="w-full relative">
          <div className="overflow-hidden h-48">
            <Image
              src="/CardHero/retainingwall.webp"
              alt="Block Retaining Wall"
              className="w-full h-full object-cover object-center"
              width={800}
              height={450}
              priority
            />
            <div className="absolute bottom-0 right-0 p-4">
              <div className="bg-white/90 p-2 rounded-md">
                <p className="text-sm font-semibold">Wall Dimensions</p>
                <p className="text-sm">
                  H: {selectedWall.height1.toFixed(2)}
                  {selectedWall.height2 ? `-${selectedWall.height2.toFixed(2)}` : ''} m ×
                  L: {selectedWall.length.toFixed(2)} m
                </p>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/70 to-transparent">
            <h3 className="text-2xl font-semibold text-white">Retaining Wall</h3>
          </div>
        </div>

        <CardContent className="p-5 flex flex-col">
          {/* Wall Selector - Only show if there are multiple walls */}
          {availableWalls.length > 1 && (
            <div className="mb-4">
              <p className="font-medium mb-2">Select Retaining Wall:</p>
              <Select
                value={selectedWallId.toString()}
                onValueChange={(value) => setSelectedWallId(parseInt(value, 10))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a wall" />
                </SelectTrigger>
                <SelectContent>
                  {availableWalls.map((wall) => (
                    <SelectItem key={wall.id} value={wall.id.toString()}>
                      {wall.wall_type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <p className="text-base text-muted-foreground mb-4">
            Premium block wall with decorative cladding for superior durability and elegant appearance.
          </p>

          <Separator className="my-4" />

          <div className="mb-4">
            <div className="space-y-3">
              {/* Wall Type */}
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">Type</p>
                </div>
                <p className="font-medium whitespace-nowrap">{selectedWall.wall_type}</p>
              </div>

              {/* Wall Height */}
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">Height</p>
                </div>
                <p className="font-medium whitespace-nowrap">
                  {selectedWall.height1.toFixed(2)}
                  {selectedWall.height2 ? `-${selectedWall.height2.toFixed(2)}` : ''} m
                </p>
              </div>

              {/* Wall Length */}
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">Length</p>
                </div>
                <p className="font-medium whitespace-nowrap">{selectedWall.length.toFixed(2)} m</p>
              </div>

              {/* Wall Area */}
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">Area</p>
                </div>
                <p className="font-medium whitespace-nowrap">{area.toFixed(2)} m²</p>
              </div>
            </div>
          </div>

          <Separator className="mb-3" />

          {/* This wall's price */}
          <div className="flex justify-between items-center mt-1">
            <p className="text-xl font-semibold">Subtotal</p>
            <p className="text-xl font-semibold">{fmt(selectedWall.total_cost)}</p>
          </div>
        </CardContent>
      </Card>

      {/* Total cost summary card - Only show if there are multiple walls */}
      {availableWalls.length > 1 && (
        <Card className="w-full shadow-lg">
          <CardContent className="p-5">
            <div className="flex justify-between items-center">
              <p className="text-xl font-semibold">Total Cost</p>
              <p className="text-xl font-semibold">{fmt(totalRetainingWallCost)}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}