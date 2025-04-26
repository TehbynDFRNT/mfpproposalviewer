'use client';

import { ProposalData } from "@/types/proposal";
import { PricingCard } from "./SiteRequirementsCards/PricingCard";
import { DetailsCard } from "./SiteRequirementsCards/DetailsCard";

export default function SiteRequirementsCards(
  { subIndex, site, pool, electrical }: { 
    subIndex: number;
    site: ProposalData['siteRequirements'];
    pool: ProposalData['poolSelection'];
    electrical: ProposalData['electrical'];
  }
) {
  switch (subIndex) {
    case 0: return <PricingCard 
      siteRequirements={site}
      poolSelection={pool}
      electrical={electrical}
    />;
    case 1: return <DetailsCard
      fixedCosts={pool.fixedCosts}
      individualCosts={pool.individualCosts}
    />;
    default: return null;
  }
}