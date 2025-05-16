/**
 * File: src/components/sections/AddOnCards.tsx
 */
import Image from "next/image";
import type { ProposalSnapshot } from "@/types/snapshot";
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { usePriceCalculator } from '@/hooks/use-price-calculator';

export default function AddOnCards({ snapshot }: { snapshot: ProposalSnapshot }) {
  // Use the centralized price calculator for consistent calculations
  const { fmt, breakdown } = usePriceCalculator(snapshot);
  
  // Check if sections should be shown based on what's included

  // Check if any heating options are included
  const hasHeatingOptions = snapshot.include_heat_pump || snapshot.include_blanket_roller;
  // Check if cleaning options are included
  const hasCleaningOptions = snapshot.cleaner_included;

  return (
    <div className="space-y-6 h-full overflow-y-auto">
      {/* Main Extras & Upgrades Card */}
      <Card className="w-full shadow-lg">
        <CardContent className="p-5 space-y-6">
          <header>
            <h3 className="text-xl font-semibold mb-1">Extras & Upgrades</h3>
            <p className="text-base text-muted-foreground">Additional features to enhance your pool experience</p>
          </header>

          <Separator className="mb-4" />
          
          {/* Cleaning Options Section */}
          {hasCleaningOptions && (
            <div className="space-y-3">
              <div className="mb-2">
                <p className="text-lg font-semibold">Pool Cleaning</p>
              </div>
              
              {snapshot.cleaner_included && (
                <div className="mb-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 pr-6 flex items-center justify-center h-full w-20">
                      <Image 
                        src="/VipCards/poolcleaner.webp" 
                        alt={snapshot.cleaner_name} 
                        width={80} 
                        height={64} 
                        className="w-full h-16 rounded-md object-contain" 
                      />
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between">
                        <p className="font-medium">{snapshot.cleaner_name}</p>
                        <p className="font-medium whitespace-nowrap">{fmt(snapshot.cleaner_price + snapshot.cleaner_margin)}</p>
                      </div>
                      <p className="text-base text-muted-foreground mt-0.5">Effortlessly keep your pool pristine with an advanced robotic cleaning system</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Heating Options Section */}
          {hasHeatingOptions && (
            <>
              {hasCleaningOptions && <Separator className="my-3" />}
              
              <div className="space-y-3">
                <div className="mb-2">
                  <p className="text-lg font-semibold">Heating & Insulation</p>
                </div>
                
                {snapshot.include_heat_pump && (
                  <div className="mb-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 pr-6 flex items-center justify-center h-full w-20">
                        <Image 
                          src="/VipCards/oasis.webp" 
                          alt={snapshot.heat_pump_description} 
                          width={80} 
                          height={64} 
                          className="w-full h-16 rounded-md object-contain" 
                        />
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between">
                          <p className="font-medium">{snapshot.heat_pump_description}</p>
                          <p className="font-medium whitespace-nowrap">{fmt(snapshot.heat_pump_rrp)}</p>
                        </div>
                        <p className="text-base text-muted-foreground mt-0.5">Enjoy extended swimming seasons with energy-efficient heating technology</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {snapshot.include_blanket_roller && (
                  <div className="mb-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 pr-6 flex items-center justify-center h-full w-20">
                        <Image 
                          src="/VipCards/poolblanket.webp" 
                          alt={snapshot.blanket_roller_description} 
                          width={80} 
                          height={64} 
                          className="w-full h-16 rounded-md object-contain" 
                        />
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between">
                          <p className="font-medium">Premium Thermal Pool Blanket & Roller</p>
                          <p className="font-medium whitespace-nowrap">{fmt(snapshot.blanket_roller_rrp)}</p>
                        </div>
                        <p className="text-base text-muted-foreground mt-0.5">Premium thermal blanket that reduces evaporation and retains heat for a warmer pool</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          <Separator className="mb-3" />

          {/* Grand total - using calculator's extrasTotal for consistency */}
          <div className="flex justify-between items-center">
            <p className="font-semibold text-xl">Total Cost</p>
            <p className="text-xl font-semibold">{fmt(breakdown.extrasTotal)}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}