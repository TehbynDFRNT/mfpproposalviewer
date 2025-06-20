/**
 * File: src/components/sections/ProposalSummaryCards.tsx
 */
import type { ProposalSnapshot } from "@/types/snapshot";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from "@/components/ui/separator";
import { usePriceCalculator } from "@/hooks/use-price-calculator";

export default function ProposalSummaryCards({ snapshot }: { snapshot: ProposalSnapshot }) {
  // Use the centralized price calculator hook
  const { fmt, totals, grandTotal, grandTotalWithoutDiscounts, discountBreakdown } = usePriceCalculator(snapshot);

  console.log('🎯 ProposalSummaryCards discount data:', {
    discountTotal: totals.discountTotal,
    hasDiscounts: totals.discountTotal > 0,
    grandTotal,
    grandTotalWithoutDiscounts,
    discountBreakdown,
    snapshotDiscounts: snapshot.applied_discounts_json
  });

  return (
    <div className="space-y-6 h-full overflow-y-auto">
      {/* Main Summary Card */}
      <Card className="w-full shadow-lg">
        <CardContent className="p-5 space-y-4">
          <header>
            <h3 className="text-xl font-semibold">Proposal Summary</h3>
            <p className="text-base text-muted-foreground">
              Thank you for considering us for your pool project, {snapshot.owner1.split(' ')[0]}
              {snapshot.owner2 ? ` & ${snapshot.owner2.split(' ')[0]}` : ''}!
            </p>
          </header>

          <Separator className="mb-4" />

          {/* Cost breakdown section */}
          <div className="space-y-4">
            {/* Base Price Section */}
            <div className="mb-4">
              <h4 className="text-lg font-semibold text-muted-foreground mb-2">Base Price (Website RRP)</h4>
              <div className="flex justify-between">
                <p className="font-medium">Base {snapshot.spec_name} Pool</p>
                <p className="font-medium whitespace-nowrap">{fmt(totals.basePoolTotal)}</p>
              </div>
            </div>

            {/* Additional Site Requirements Section */}
            {(totals.siteRequirementsTotal > 0 || totals.electricalTotal > 0) && (
              <>
                <Separator className="my-3" />
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-muted-foreground mb-2">Additional Site Requirements</h4>
                  
                  {totals.siteRequirementsTotal > 0 && (
                    <div className="mb-2">
                      <div className="flex justify-between">
                        <p className="font-medium">Site Requirements</p>
                        <p className="font-medium whitespace-nowrap">{fmt(totals.siteRequirementsTotal)}</p>
                      </div>
                    </div>
                  )}

                  {totals.electricalTotal > 0 && (
                    <div className="mb-2">
                      <div className="flex justify-between">
                        <p className="font-medium">Electrical</p>
                        <p className="font-medium whitespace-nowrap">{fmt(totals.electricalTotal)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Poolscaping Options Section */}
            {(totals.concreteTotal > 0 || totals.fencingTotal > 0 || totals.waterFeatureTotal > 0 || totals.retainingWallsTotal > 0) && (
              <>
                <Separator className="my-3" />
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-muted-foreground mb-2">Poolscaping Options</h4>
                  
                  {totals.concreteTotal > 0 && (
                    <div className="mb-2">
                      <div className="flex justify-between">
                        <p className="font-medium">Concrete & Paving</p>
                        <p className="font-medium whitespace-nowrap">{fmt(totals.concreteTotal)}</p>
                      </div>
                    </div>
                  )}

                  {totals.fencingTotal > 0 && (
                    <div className="mb-2">
                      <div className="flex justify-between">
                        <p className="font-medium">Fencing</p>
                        <p className="font-medium whitespace-nowrap">{fmt(totals.fencingTotal)}</p>
                      </div>
                    </div>
                  )}

                  {totals.waterFeatureTotal > 0 && (
                    <div className="mb-2">
                      <div className="flex justify-between">
                        <p className="font-medium">Water Features</p>
                        <p className="font-medium whitespace-nowrap">{fmt(totals.waterFeatureTotal)}</p>
                      </div>
                    </div>
                  )}
                  
                  {totals.retainingWallsTotal > 0 && (
                    <div className="mb-2">
                      <div className="flex justify-between">
                        <p className="font-medium">Retaining Walls</p>
                        <p className="font-medium whitespace-nowrap">{fmt(totals.retainingWallsTotal)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Upgrades & Extras Section */}
            {totals.extrasTotal > 0 && (
              <>
                <Separator className="my-3" />
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-muted-foreground mb-2">Upgrades & Extras</h4>
                  <div className="flex justify-between">
                    <p className="font-medium">Extras & Add-ons</p>
                    <p className="font-medium whitespace-nowrap">{fmt(totals.extrasTotal)}</p>
                  </div>
                </div>
              </>
            )}
          </div>

          <Separator className="mb-3" />

          {/* Subtotal (before discounts) */}
          {totals.discountTotal > 0 && (
            <div className="flex justify-between items-center text-muted-foreground">
              <p className="font-medium">Subtotal</p>
              <p className="font-medium">{fmt(grandTotalWithoutDiscounts)}</p>
            </div>
          )}

          {/* Discount Section */}
          {totals.discountTotal > 0 && (
            <>
              <div className="space-y-2">
                {discountBreakdown.discountDetails.map((discount, index) => (
                  <div key={index} className="flex justify-between items-center text-green-600">
                    <p className="font-medium">
                      {discount.name}
                      {discount.type === 'percentage' && ` (${discount.value}%)`}
                    </p>
                    <p className="font-medium whitespace-nowrap">-{fmt(discount.calculatedAmount)}</p>
                  </div>
                ))}
              </div>
              <Separator className="my-3" />
            </>
          )}

          {/* Grand total */}
          <div className="flex justify-between items-center mt-1">
            <p className="text-xl font-semibold">Total Investment (inc GST)</p>
            <p className="text-xl font-semibold">{fmt(grandTotal)}</p>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps Card */}
      <Card className="w-full shadow-lg">
        <CardContent className="p-5 space-y-4">
          <h3 className="text-xl font-semibold">Next Steps</h3>
          <ul className="space-y-4">
            <li className="flex items-center gap-3">
              <span className="flex-shrink-0 h-7 w-7 min-h-[28px] min-w-[28px] bg-[#DB9D6A] rounded-full flex items-center justify-center text-white font-medium">1</span>
              <p>Review this proposal thoroughly</p>
            </li>
            <li className="flex items-center gap-3">
              <span className="flex-shrink-0 h-7 w-7 min-h-[28px] min-w-[28px] bg-[#DB9D6A] rounded-full flex items-center justify-center text-white font-medium">2</span>
              <p>If you have questions or need modifications, click "Request Changes" at the bottom</p>
            </li>
            <li className="flex items-center gap-3">
              <span className="flex-shrink-0 h-7 w-7 min-h-[28px] min-w-[28px] bg-[#DB9D6A] rounded-full flex items-center justify-center text-white font-medium">3</span>
              <p>When you're ready to proceed, click "Accept Quote" and enter your PIN</p>
            </li>
            <li className="flex items-center gap-3">
              <span className="flex-shrink-0 h-7 w-7 min-h-[28px] min-w-[28px] bg-[#DB9D6A] rounded-full flex items-center justify-center text-white font-medium">4</span>
              <p>Our team will contact you to arrange the next steps for your dream pool!</p>
            </li>
          </ul>
          <p className="text-base text-muted-foreground mt-4">
            All prices are inclusive of GST and valid for 30 days from {new Date(snapshot.created_at).toLocaleDateString('en-AU')}.
            Terms and conditions apply.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}