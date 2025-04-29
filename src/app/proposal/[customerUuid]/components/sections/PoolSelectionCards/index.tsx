// …imports
import type { Snapshot } from "@/app/lib/types/snapshot";
import { DetailsCard } from './DetailsCard';
import { ColourGuardCard }   from './ColourGuardCard';
import { EssentialsCards }   from './EssentialsCard';
import { SiteWorkCards }     from './SiteWorkCard';   // still optional

export default function PoolSelectionCards({
  subIndex,
  pool,
  poolCosts,
  poolMargins,
}: {
  subIndex: number;
  pool: Snapshot['poolSpecification'];
  poolCosts: Snapshot['poolCosts'] | null;
  poolMargins: Snapshot['poolMargins'] | null;
}) {
  // pull out *only* the numeric fields from poolCosts…
  const numericValues = poolCosts
    ? Object.values(poolCosts).filter((v): v is number => typeof v === 'number')
    : [];
  const basePoolCost = numericValues.reduce((sum, v) => sum + v, 0);
  // apply margin if present
  const marginFactor = poolMargins
    ? 1 + poolMargins.margin_percentage / 100
    : 1;
  const totalCost = Math.round(basePoolCost * marginFactor);

  switch (subIndex) {
    case 0:
      return (
        <DetailsCard
          pool={pool}
          totalCost={totalCost}
        />
      );

    case 1: return <ColourGuardCard />;

    case 2: return <EssentialsCards />;        // ← no props

    case 3: return <SiteWorkCards />;          // ← no props (or remove card)

    default: return null;
  }
}