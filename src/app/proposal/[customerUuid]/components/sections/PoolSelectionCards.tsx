'use client';

import type { Snapshot } from '@/app/lib/types/snapshot';

import { DetailsCard }     from './PoolSelectionCards/DetailsCard';
import { ColourGuardCard } from './PoolSelectionCards/ColourGuardCard';
import { EssentialsCards } from './PoolSelectionCards/EssentialsCard';
import { SiteWorkCards }   from './PoolSelectionCards/SiteWorkCard';

interface Props {
  subIndex    : number;
  pool        : Snapshot['poolSpecification'];
  poolCosts   : Snapshot['poolCosts']   | null;
  poolMargins : Snapshot['poolMargins'] | null;
}

export default function PoolSelectionCards({
  subIndex,
  pool,
  poolCosts,
  poolMargins,
}: Props) {
  // sum up all the numeric poolCost fields
  const basePoolCost = poolCosts
    ? poolCosts.beam
      + poolCosts.coping_lay
      + poolCosts.coping_supply
      + poolCosts.install_fee
      + poolCosts.misc
      + poolCosts.pea_gravel
      + poolCosts.salt_bags
      + poolCosts.trucked_water
    : 0;

  // factor in margin if present
  const marginFactor = 1 + (poolMargins?.margin_percentage ?? 0) / 100;
  const totalCost    = Math.round(basePoolCost * marginFactor);

  switch (subIndex) {
    case 0:
      return <DetailsCard pool={pool} totalCost={totalCost} />;

    case 1:
      return <ColourGuardCard />;

    case 2:
      return <EssentialsCards />;  // static marketing copy

    case 3:
      return <SiteWorkCards />;    // static marketing copy

    default:
      return null;
  }
}
