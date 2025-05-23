/**
 * File: src/components/sections/PoolSelectionCards.tsx
 */
'use client';

import type { ProposalSnapshot } from '@/types/snapshot';
import { POOL_DETAILS, getPoolDetails } from '@/types/pool-details';

import { DetailsCard }     from "@/components/sections/PoolSelectionCards/DetailsCard";
import { ColourGuardCard } from "@/components/sections/PoolSelectionCards/ColourGuardCard";


interface Props {
  subIndex : number;
  snapshot : ProposalSnapshot;
}

export default function PoolSelectionCards({ subIndex, snapshot }: Props) {
  switch (subIndex) {
    case 0:
      return <DetailsCard snapshot={snapshot} />;

    case 1:
      return <ColourGuardCard snapshot={snapshot} />;

    default:
      return null;
  }
}