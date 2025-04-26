'use client';

import { motion } from 'framer-motion';
import type { ProposalData } from '@/types/proposal';
import { DetailsCard } from './DetailsCard';
import { ColourGuardCard } from './ColourGuardCard';
import { EssentialsCards } from './EssentialsCard';
import { SiteWorkCards } from './SiteWorkCard';

export default function PoolSelectionCards(
  { subIndex, data }: { subIndex: number; data: ProposalData['poolSelection'] }
) {
  switch (subIndex) {
    case 0: return <DetailsCard pool={data.pool} costSummary={data.costSummary} />;
    case 1: return <ColourGuardCard fixed={data.fixedCosts} />;
    case 2: return <EssentialsCards fixed={data.fixedCosts} />;
    case 3: return <SiteWorkCards fixed={data.fixedCosts} variable={data.individualCosts} />;
    default: return null;
  }
}