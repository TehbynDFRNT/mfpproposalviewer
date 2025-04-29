'use client';

import type { Snapshot, ElectricalRequirement } from '@/app/lib/types/snapshot';
import { PricingCard }  from './SiteRequirementsCards/PricingCard';
import { DetailsCard }  from './SiteRequirementsCards/DetailsCard';

type InstallationRequirement = {
  crane?:   { label: string; cost: number };
  bobcat?:  { label: string; cost: number };
  traffic?: { label: string; cost: number };
  custom:   { id: string; description: string; price: number }[];
  costSummary: { totalCost: number };
};

type ElectricalUI = {
  items:       { label: string; cost: number }[];
  costSummary: { totalCost: number };
};

interface Props {
  subIndex:       number;
  site:           Snapshot['poolProject'];
  electrical:     ElectricalRequirement | null;
  referenceTables:Snapshot['referenceTables'];
}

export default function SiteRequirementsCards({
  subIndex,
  site,
  electrical,
  referenceTables,
}: Props) {
  // look up the actual cost rows
  const craneEntry = site.crane_id
    ? referenceTables.craneCosts.find(c => c.id === site.crane_id)
    : undefined;

  const bobcatEntry = site.bobcat_id
    ? referenceTables.bobcatCosts.find(b => b.id === site.bobcat_id)
    : undefined;

  const trafficEntry = site.traffic_control_id
    ? referenceTables.trafficControlCosts.find(t => t.id === site.traffic_control_id)
    : undefined;

  const installationReq: InstallationRequirement = {
    crane:   craneEntry   && { label: craneEntry.name,          cost: craneEntry.price },
    bobcat:  bobcatEntry  && { label: bobcatEntry.size_category, cost: bobcatEntry.price },
    traffic: trafficEntry && { label: trafficEntry.name,        cost: trafficEntry.price },
    custom: Array.isArray(site.site_requirements_data)
      ? site.site_requirements_data.map((entry, i) => ({
          id:          String(i),
          description: typeof entry === 'object' ? JSON.stringify(entry) : String(entry),
          price:       0,
        }))
      : [],
    costSummary: {
      totalCost:
        (craneEntry?.price ?? 0) +
        (bobcatEntry?.price ?? 0) +
        (trafficEntry?.price ?? 0),
    },
  };

  // Now electrical is already in the UI-friendly format
  const elecUI: ElectricalUI = electrical || {
    items: [],
    costSummary: { totalCost: 0 }
  };

  switch (subIndex) {
    case 0:
      return (
        <PricingCard
          siteRequirements={installationReq}
          electrical={elecUI}
        />
      );
    case 1:
      return <DetailsCard />;
    default:
      return null;
  }
}
