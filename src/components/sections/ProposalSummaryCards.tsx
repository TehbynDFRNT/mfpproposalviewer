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
              <p className="font-medium whitespace-nowrap">{fmt(breakdown.basePoolPrice)}</p>
            </div>

            <div className="flex justify-between items-baseline">
              <div>
                <p className="text-sm font-medium">Installation & Site Works</p>
              </div>
              <p className="font-medium whitespace-nowrap">{fmt(breakdown.installationTotal)}</p>
            </div>

            <div className="flex justify-between items-baseline">
              <div>
                <p className="text-sm font-medium">Filtration & Equipment</p>
              </div>
              <p className="font-medium whitespace-nowrap">{fmt(breakdown.filtrationTotal)}</p>
            </div>

            {breakdown.concreteTotal > 0 && (
              <div className="flex justify-between items-baseline">
                <div>
                  <p className="text-sm font-medium">Concrete & Paving</p>
                </div>
                <p className="font-medium whitespace-nowrap">{fmt(breakdown.concreteTotal)}</p>
              </div>
            )}

            {breakdown.fencingTotal > 0 && (
              <div className="flex justify-between items-baseline">
                <div>
                  <p className="text-sm font-medium">Fencing & Safety</p>
                </div>
                <p className="font-medium whitespace-nowrap">{fmt(breakdown.fencingTotal)}</p>
              </div>
            )}

            {breakdown.waterFeatureTotal > 0 && (
              <div className="flex justify-between items-baseline">
                <div>
                  <p className="text-sm font-medium">Water Features</p>
                </div>
                <p className="font-medium whitespace-nowrap">{fmt(breakdown.waterFeatureTotal)}</p>
              </div>
            )}

            {breakdown.extrasTotal > 0 && (
              <div className="flex justify-between items-baseline">
                <div>
                  <p className="text-sm font-medium">Extras & Add-ons</p>
                </div>
                <p className="font-medium whitespace-nowrap">{fmt(breakdown.extrasTotal)}</p>
              </div>
            )}
          </div>

          <Separator className="mb-3" />

          {/* Grand total */}
          <div className="flex justify-between items-baseline mt-1">
            <p className="font-semibold">Total Investment</p>
            <p className="text-xl font-bold">{fmt(breakdown.grandTotal)}</p>
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