/**
 * File: src/components/sections/ProposalSummaryCards.tsx
 */
import type { ProposalSnapshot } from "@/types/snapshot";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from "@/components/ui/separator";
import { usePriceCalculator } from "@/hooks/use-price-calculator";

export default function ProposalSummaryCards({ snapshot }: { snapshot: ProposalSnapshot }) {
  // Use the centralized price calculator hook
  const { fmt, breakdown } = usePriceCalculator(snapshot);
  
  // Helper to format potentially null/undefined values
  const safeFormat = (n: number | undefined | null) => {
    if (n === undefined || n === null) return 'N/A';
    return fmt(n);
  };

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
            <div className="mb-4">
              <div className="flex justify-between">
                <p className="font-medium">Base {snapshot.spec_name} Pool</p>
                <p className="font-medium whitespace-nowrap">{fmt(breakdown.basePoolPrice)}</p>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between">
                <p className="font-medium">Installation</p>
                <p className="font-medium whitespace-nowrap">{fmt(breakdown.installationTotal)}</p>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between">
                <p className="font-medium">Filtration</p>
                <p className="font-medium whitespace-nowrap">{fmt(breakdown.filtrationTotal)}</p>
              </div>
            </div>

            {breakdown.concreteTotal > 0 && (
              <div className="mb-4">
                <div className="flex justify-between">
                  <p className="font-medium">Concrete & Paving</p>
                  <p className="font-medium whitespace-nowrap">{fmt(breakdown.concreteTotal)}</p>
                </div>
              </div>
            )}

            {breakdown.fencingTotal > 0 && (
              <div className="mb-4">
                <div className="flex justify-between">
                  <p className="font-medium">Fencing</p>
                  <p className="font-medium whitespace-nowrap">{fmt(breakdown.fencingTotal)}</p>
                </div>
              </div>
            )}

            {breakdown.waterFeatureTotal > 0 && (
              <div className="mb-4">
                <div className="flex justify-between">
                  <p className="font-medium">Water Features</p>
                  <p className="font-medium whitespace-nowrap">{fmt(breakdown.waterFeatureTotal)}</p>
                </div>
              </div>
            )}

            {breakdown.extrasTotal > 0 && (
              <div className="mb-4">
                <div className="flex justify-between">
                  <p className="font-medium">Extras & Add-ons</p>
                  <p className="font-medium whitespace-nowrap">{fmt(breakdown.extrasTotal)}</p>
                </div>
              </div>
            )}
          </div>

          <Separator className="mb-3" />

          {/* Grand total */}
          <div className="flex justify-between items-center mt-1">
            <p className="text-xl font-semibold">Total Investment</p>
            <p className="text-xl font-semibold">{fmt(breakdown.grandTotal)}</p>
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
            All prices are inclusive of GST and valid for 30 days from {new Date(snapshot.timestamp).toLocaleDateString('en-AU')}.
            Terms and conditions apply.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}