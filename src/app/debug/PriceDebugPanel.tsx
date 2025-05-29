import React from 'react';
import type { ProposalSnapshot } from '@/types/snapshot';
import { usePriceCalculator } from '@/hooks/use-price-calculator';

interface PriceDebugPanelProps {
  snapshotData: ProposalSnapshot;
}

export default function PriceDebugPanel({ snapshotData }: PriceDebugPanelProps) {
  const { fmt, totals } = usePriceCalculator(snapshotData);

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <h2 className="text-xl font-semibold">Price Debug Panel</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <h3 className="font-medium">Section Totals:</h3>
          <div className="text-sm space-y-1">
            <div>Base Pool: {fmt(totals.basePoolTotal)}</div>
            <div>Site Requirements: {fmt(totals.siteRequirementsTotal)}</div>
            <div>Electrical: {fmt(totals.electricalTotal)}</div>
            <div>Concrete: {fmt(totals.concreteTotal)}</div>
            <div>Fencing: {fmt(totals.fencingTotal)}</div>
            <div>Water Feature: {fmt(totals.waterFeatureTotal)}</div>
            <div>Retaining Walls: {fmt(totals.retainingWallsTotal)}</div>
            <div>Extras: {fmt(totals.extrasTotal)}</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="font-medium">Grand Total:</h3>
          <div className="text-lg font-bold">
            {fmt(totals.grandTotalCalculated)}
          </div>
        </div>
      </div>
    </div>
  );
}