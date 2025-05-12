/**
 * File: src/components/sections/ProposalSummaryCards.tsx
 */
import type { ProposalSnapshot } from "@/app/lib/types/snapshot";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from "@/components/ui/separator";

export default function ProposalSummaryCards({ snapshot }: { snapshot: ProposalSnapshot }) {
  // Helper to format currency
  const fmt = (n: number | undefined | null) => {
    if (n === undefined || n === null) return 'N/A';
    return n.toLocaleString('en-AU', { style: 'currency', currency: 'AUD' });
  };

  // Recalculate totals (similar to VisualColumn's price card logic)
  // This is duplicated logic. Ideally, this calculation should be centralized.
  // For now, we'll repeat it for demonstration.
  const fixedCosts = 6285;
  const individualPoolCosts =
    snapshot.pc_beam +
    snapshot.pc_coping_supply +
    snapshot.pc_coping_lay +
    snapshot.pc_salt_bags +
    snapshot.pc_trucked_water +
    snapshot.pc_misc +
    snapshot.pc_pea_gravel +
    snapshot.pc_install_fee;
  const baseCost = snapshot.spec_buy_inc_gst + individualPoolCosts + fixedCosts;
  const marginPercent = snapshot.pool_margin_pct || 0;
  const basePoolPrice = marginPercent > 0
    ? baseCost / (1 - marginPercent / 100)
    : baseCost;

  const sitePrepCosts = snapshot.crane_cost +
    snapshot.bobcat_cost +
    (snapshot.dig_excavation_rate * snapshot.dig_excavation_hours) +
    (snapshot.dig_truck_rate * snapshot.dig_truck_hours * snapshot.dig_truck_qty) +
    snapshot.traffic_control_cost +
    snapshot.elec_total_cost;
  const installationTotal = marginPercent > 0
    ? sitePrepCosts / (1 - marginPercent / 100)
    : sitePrepCosts;

  const filtrationBaseCost =
    snapshot.fp_pump_price +
    snapshot.fp_filter_price +
    snapshot.fp_sanitiser_price +
    snapshot.fp_light_price +
    (snapshot.fp_handover_kit_price || 0);
  const filtrationTotal = marginPercent > 0
    ? filtrationBaseCost / (1 - marginPercent / 100)
    : filtrationBaseCost;

  const concreteTotal = (snapshot.concrete_cuts_cost || 0) +
    (snapshot.extra_paving_cost || 0) +
    (snapshot.existing_paving_cost || 0) +
    (snapshot.extra_concreting_saved_total || 0) +
    (snapshot.concrete_pump_total_cost || 0) +
    (snapshot.uf_strips_cost || 0);

  const fencingTotal = snapshot.fencing_total_cost || 0;
  const waterFeatureTotal = snapshot.water_feature_total_cost || 0;
  // Calculate extras total to match AddOnCards component
  const cleanerCost = snapshot.cleaner_cost_price || 0;
  const heatPumpCost = (snapshot.heat_pump_cost || 0) + (snapshot.heat_pump_install_cost || 0);
  const blanketRollerCost = (snapshot.blanket_roller_cost || 0) + (snapshot.br_install_cost || 0);
  const extrasTotal = cleanerCost + heatPumpCost + blanketRollerCost;

  const grandTotal = basePoolPrice +
    installationTotal +
    filtrationTotal +
    concreteTotal +
    fencingTotal +
    waterFeatureTotal +
    extrasTotal;

  return (
    <div className="space-y-6 h-full overflow-y-auto">
      {/* Main Summary Card */}
      <Card className="w-full shadow-lg">
        <CardContent className="p-5 space-y-4">
          <header>
            <h3 className="text-base font-semibold">Proposal Summary</h3>
            <p className="text-sm text-muted-foreground">
              Thank you for considering us for your pool project, {snapshot.owner1.split(' ')[0]}
              {snapshot.owner2 ? ` & ${snapshot.owner2.split(' ')[0]}` : ''}!
            </p>
          </header>

          <Separator className="mb-4" />

          {/* Cost breakdown section */}
          <div className="space-y-3">
            <div className="flex justify-between items-baseline">
              <div>
                <p className="text-sm font-medium">Base {snapshot.spec_name} Pool</p>
              </div>
              <p className="font-medium whitespace-nowrap">{fmt(basePoolPrice)}</p>
            </div>

            <div className="flex justify-between items-baseline">
              <div>
                <p className="text-sm font-medium">Installation & Site Works</p>
              </div>
              <p className="font-medium whitespace-nowrap">{fmt(installationTotal)}</p>
            </div>

            <div className="flex justify-between items-baseline">
              <div>
                <p className="text-sm font-medium">Filtration & Equipment</p>
              </div>
              <p className="font-medium whitespace-nowrap">{fmt(filtrationTotal)}</p>
            </div>

            {concreteTotal > 0 && (
              <div className="flex justify-between items-baseline">
                <div>
                  <p className="text-sm font-medium">Concrete & Paving</p>
                </div>
                <p className="font-medium whitespace-nowrap">{fmt(concreteTotal)}</p>
              </div>
            )}

            {fencingTotal > 0 && (
              <div className="flex justify-between items-baseline">
                <div>
                  <p className="text-sm font-medium">Fencing & Safety</p>
                </div>
                <p className="font-medium whitespace-nowrap">{fmt(fencingTotal)}</p>
              </div>
            )}

            {waterFeatureTotal > 0 && (
              <div className="flex justify-between items-baseline">
                <div>
                  <p className="text-sm font-medium">Water Features</p>
                </div>
                <p className="font-medium whitespace-nowrap">{fmt(waterFeatureTotal)}</p>
              </div>
            )}

            {extrasTotal > 0 && (
              <div className="flex justify-between items-baseline">
                <div>
                  <p className="text-sm font-medium">Extras & Add-ons</p>
                </div>
                <p className="font-medium whitespace-nowrap">{fmt(extrasTotal)}</p>
              </div>
            )}
          </div>

          <Separator className="mb-3" />

          {/* Grand total */}
          <div className="flex justify-between items-baseline mt-1">
            <p className="font-semibold">Total Investment</p>
            <p className="text-xl font-bold">{fmt(grandTotal)}</p>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps Card */}
      <Card className="w-full shadow-lg">
        <CardContent className="p-5 space-y-4">
          <h3 className="text-base font-semibold">Next Steps</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-3">
              <span className="flex-shrink-0 h-6 w-6 bg-[#DB9D6A] rounded-full flex items-center justify-center text-white font-medium text-sm">1</span>
              <p>Review this proposal thoroughly</p>
            </li>
            <li className="flex items-center gap-3">
              <span className="flex-shrink-0 h-6 w-6 bg-[#DB9D6A] rounded-full flex items-center justify-center text-white font-medium text-sm">2</span>
              <p>If you have questions or need modifications, click "Request Changes" at the bottom</p>
            </li>
            <li className="flex items-center gap-3">
              <span className="flex-shrink-0 h-6 w-6 bg-[#DB9D6A] rounded-full flex items-center justify-center text-white font-medium text-sm">3</span>
              <p>When you're ready to proceed, click "Accept Quote" and enter your PIN</p>
            </li>
            <li className="flex items-center gap-3">
              <span className="flex-shrink-0 h-6 w-6 bg-[#DB9D6A] rounded-full flex items-center justify-center text-white font-medium text-sm">4</span>
              <p>Our team will contact you to arrange the next steps for your dream pool!</p>
            </li>
          </ul>
          <p className="text-xs text-muted-foreground mt-4">
            All prices are inclusive of GST and valid for 30 days from {new Date(snapshot.timestamp).toLocaleDateString('en-AU')}.
            Terms and conditions apply.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}