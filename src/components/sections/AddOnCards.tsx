/**
 * File: src/components/sections/AddOnCards.tsx
 */
import Image from "next/image";
import type { ProposalSnapshot } from "@/types/snapshot";
import { Card, CardContent } from '@/components/ui/card';

export default function AddOnCards({ snapshot }: { snapshot: ProposalSnapshot }) {
  const fmt = (n: number) => n.toLocaleString('en-AU', { style: 'currency', currency: 'AUD' });

  // Build add-on item costs
  const cleanerCost = snapshot.cleaner_cost_price;
  const heatPumpCost = snapshot.heat_pump_cost + snapshot.heat_pump_install_cost;
  const blanketRollerCost = snapshot.blanket_roller_cost + snapshot.br_install_cost;
  const totalCost = cleanerCost + heatPumpCost + blanketRollerCost;

  return (
    <div className="space-y-6 h-full overflow-y-auto">
      {/* Cleaner Card */}
      {snapshot.cleaner_included && (
        <Card className="overflow-hidden shadow-lg">
          <div className="p-4 flex items-center">
            <Image src="/VipCards/poolcleaner.webp" alt={snapshot.cleaner_name} width={64} height={64} className="w-16 h-16 rounded-md object-cover mr-4" />
            <div>
              <h3 className="text-base font-semibold">{snapshot.cleaner_name}</h3>
              <p className="text-xs mb-1">{snapshot.cleaner_name ? `Automatic pool cleaning system` : 'Automatic pool cleaning system'}</p>
              <p className="text-sm font-medium">{fmt(snapshot.cleaner_unit_price)}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Heat Pump Card */}
      {snapshot.include_heat_pump && (
        <Card className="overflow-hidden shadow-lg">
          <div className="p-4 flex items-center">
            <Image src="/VipCards/oasis.webp" alt={snapshot.heat_pump_description} width={64} height={64} className="w-16 h-16 rounded-md object-cover mr-4" />
            <div>
              <h3 className="text-base font-semibold">{snapshot.heat_pump_description}</h3>
              <p className="text-xs mb-1">{snapshot.heat_pump_install_inclusions}</p>
              <p className="text-sm font-medium">{fmt(heatPumpCost)}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Blanket Roller Card */}
      {snapshot.include_blanket_roller && (
        <Card className="overflow-hidden shadow-lg">
          <div className="p-4 flex items-center">
            <Image src="/VipCards/poolblanket.webp" alt={snapshot.blanket_roller_description} width={64} height={64} className="w-16 h-16 rounded-md object-cover mr-4" />
            <div>
              <h3 className="text-base font-semibold">{snapshot.blanket_roller_description}</h3>
              <p className="text-xs mb-1">{snapshot.br_install_inclusions}</p>
              <p className="text-sm font-medium">{fmt(blanketRollerCost)}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Extras & Upgrades Summary Card */}
      <Card className="w-full shadow-lg">
        <CardContent className="p-5">
          <div className="flex justify-between items-baseline">
            <p className="font-semibold">Extras & Upgrades Total</p>
            <p className="text-xl font-bold">{fmt(totalCost)}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}