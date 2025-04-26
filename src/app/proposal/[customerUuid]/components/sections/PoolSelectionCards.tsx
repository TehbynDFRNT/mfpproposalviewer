'use client';

import { ProposalData } from "@/types/proposal";
import { DetailsCard } from "./PoolSelectionCards/DetailsCard";
import { ColourGuardCard } from "./PoolSelectionCards/ColourGuardCard";
import { EssentialsCards } from "./PoolSelectionCards/EssentialsCard";
import { SiteWorkCards } from "./PoolSelectionCards/SiteWorkCard";

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