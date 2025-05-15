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

// Define proper wall type to help TypeScript
interface RetainingWall {
  id: number;
  type: string;
  height1: number;
  height2?: number;
  length: number;
  totalCost: number;
}

export default function RetainingWallCards({ snapshot }: { snapshot: ProposalSnapshot }) {
  // Helper function to calculate wall area using height1, height2, and length
  const calculateWallArea = (height1: number, height2: number | undefined, length: number) => {
    // If height2 is provided, use average height
    const avgHeight = height2 ? (height1 + height2) / 2 : height1;
    return avgHeight * length;
  };

  // Create wall objects from snapshot with type safety
  const wallsArray: (RetainingWall | null)[] = [
    snapshot.retaining_wall1_type &&
    typeof snapshot.retaining_wall1_height1 === 'number' &&
    typeof snapshot.retaining_wall1_length === 'number' &&
    typeof snapshot.retaining_wall1_total_cost === 'number' ?
    {
      id: 1,
      type: snapshot.retaining_wall1_type,
      height1: snapshot.retaining_wall1_height1,
      height2: snapshot.retaining_wall1_height2,
      length: snapshot.retaining_wall1_length,
      totalCost: snapshot.retaining_wall1_total_cost
    } : null,

    snapshot.retaining_wall2_type &&
    typeof snapshot.retaining_wall2_height1 === 'number' &&
    typeof snapshot.retaining_wall2_length === 'number' &&
    typeof snapshot.retaining_wall2_total_cost === 'number' ?
    {
      id: 2,
      type: snapshot.retaining_wall2_type,
      height1: snapshot.retaining_wall2_height1,
      height2: snapshot.retaining_wall2_height2,
      length: snapshot.retaining_wall2_length,
      totalCost: snapshot.retaining_wall2_total_cost
    } : null,

    snapshot.retaining_wall3_type &&
    typeof snapshot.retaining_wall3_height1 === 'number' &&
    typeof snapshot.retaining_wall3_length === 'number' &&
    typeof snapshot.retaining_wall3_total_cost === 'number' ?
    {
      id: 3,
      type: snapshot.retaining_wall3_type,
      height1: snapshot.retaining_wall3_height1,
      height2: snapshot.retaining_wall3_height2,
      length: snapshot.retaining_wall3_length,
      totalCost: snapshot.retaining_wall3_total_cost
    } : null,

    snapshot.retaining_wall4_type &&
    typeof snapshot.retaining_wall4_height1 === 'number' &&
    typeof snapshot.retaining_wall4_length === 'number' &&
    typeof snapshot.retaining_wall4_total_cost === 'number' ?
    {
      id: 4,
      type: snapshot.retaining_wall4_type,
      height1: snapshot.retaining_wall4_height1,
      height2: snapshot.retaining_wall4_height2,
      length: snapshot.retaining_wall4_length,
      totalCost: snapshot.retaining_wall4_total_cost
    } : null
  ];
  
  // Type-safe filter for non-null walls
  const availableWalls: RetainingWall[] = wallsArray.filter((wall): wall is RetainingWall => wall !== null);

  // State to track which wall is selected - define before conditional returns
  const [selectedWallId, setSelectedWallId] = useState(availableWalls.length > 0 ? availableWalls[0].id : 0);

  // If no retaining walls, don't render anything
  if (availableWalls.length === 0) return null;

  // Calculate the total cost of all retaining walls
  const totalRetainingWallCost = availableWalls.reduce((sum, wall) => sum + wall.totalCost, 0);

  // Get the currently selected wall
  const selectedWall = availableWalls.find(wall => wall.id === selectedWallId) || availableWalls[0];

  // Calculate area using both height values
  const area = calculateWallArea(selectedWall.height1, selectedWall.height2, selectedWall.length);

  const fmt = (n: number) =>
    n.toLocaleString('en-AU', { style: 'currency', currency: 'AUD' });

  return (
    <div className="space-y-6 h-full overflow-y-auto">
      {/* Hero image + dimensions overlay */}
      <Card className="w-full overflow-y-auto shadow-lg">
        <div className="w-full relative">
          <div className="overflow-hidden h-48">
            <Image
              src="/CardHero/retainingwall.webp"
              alt="Block Retaining Wall"
              className="w-full h-full object-cover object-top"
              width={800}
              height={450}
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
                      Wall {wall.id}: {wall.type}
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
                <p className="font-medium whitespace-nowrap">{selectedWall.type}</p>
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
            <p className="text-xl font-semibold">{fmt(selectedWall.totalCost)}</p>
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