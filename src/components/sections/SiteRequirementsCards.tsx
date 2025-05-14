/**
 * File: src/components/sections/SiteRequirementsCards.tsx
 */
'use client';

// 🎯  new pattern: single enriched snapshot prop
import type { ProposalSnapshot } from '@/app/lib/types/snapshot';
import { PricingCard }  from "@/components/sections/SiteRequirementsCards/PricingCard";
import { DetailsCard }  from "@/components/sections/SiteRequirementsCards/DetailsCard";

interface Props {
  subIndex : number;
  snapshot : ProposalSnapshot;
}

export default function SiteRequirementsCards({ subIndex, snapshot }: Props) {
  switch (subIndex) {
    case 0:
      /* installation already built in withTotals() */
      return <PricingCard snapshot={snapshot} />;

    case 1:
      return <DetailsCard />;

    default:
      return null;
  }
}