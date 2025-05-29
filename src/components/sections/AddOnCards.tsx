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
  const { fmt, totals } = usePriceCalculator(snapshot);
  
  // Check if sections should be shown based on what's included
  const hasHeatingOptions = snapshot.include_heat_pump || snapshot.include_blanket_roller;
  const hasCleaningOptions = snapshot.cleaner_included;
  const hasGeneralExtras = snapshot.selected_extras_json && snapshot.selected_extras_json.length > 0;

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
                        <p className="font-medium whitespace-nowrap">{fmt(snapshot.cleaner_unit_price)}</p>
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

          {/* General Extras Section */}
          {hasGeneralExtras && (
            <>
              {(hasCleaningOptions || hasHeatingOptions) && <Separator className="my-3" />}
              
              <div className="space-y-3">
                <div className="mb-2">
                  <p className="text-lg font-semibold">Additional Extras</p>
                </div>
                
                {(() => {
                  // Function to get the appropriate image based on extra name
                  const getExtraImage = (extraName: string) => {
                    const name = extraName.toLowerCase();
                    if (name.includes('deck jet')) {
                      return '/VipCards/deckjet.webp';
                    } else if (name.includes('led light') || name.includes('led lights')) {
                      return '/VipCards/ledlight.webp';
                    } else if (name.includes('spa jet') || name.includes('asf440')) {
                      return '/VipCards/spajet.webp';
                    } else if (name.includes('pepper pot') || name.includes('pepperpot')) {
                      return '/VipCards/pepperpots.png';
                    }
                    return null; // No specific image, use placeholder
                  };

                  // Group spa jet system items together (ASF440 + Spa Jet Pump)
                  const isSpaJetSystem = (extraName: string) => {
                    const name = extraName.toLowerCase();
                    return name.includes('asf440') || (name.includes('spa jet') && name.includes('pump'));
                  };

                  // Round Pool 23 Spa Jet Upgrade is separate
                  const isRoundPool23Upgrade = (extraName: string) => {
                    const name = extraName.toLowerCase();
                    return name.includes('round pool 23');
                  };

                  // Separate different types of extras
                  const spaJetSystemItems = snapshot.selected_extras_json?.filter(extra => isSpaJetSystem(extra.name)) || [];
                  const roundPool23Items = snapshot.selected_extras_json?.filter(extra => isRoundPool23Upgrade(extra.name)) || [];
                  const otherExtras = snapshot.selected_extras_json?.filter(extra => 
                    !isSpaJetSystem(extra.name) && !isRoundPool23Upgrade(extra.name)
                  ) || [];

                  const result = [];

                  // Render spa jet system group (ASF440 + Spa Jet Pump)
                  if (spaJetSystemItems.length > 0) {
                    const totalSpaJetSystemCost = spaJetSystemItems.reduce((sum, item) => sum + item.total_rrp, 0);
                    result.push(
                      <div key="spa-jet-system" className="mb-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 pr-6 flex items-center justify-center h-full w-20">
                            <Image 
                              src="/VipCards/spajet.webp" 
                              alt="Spa Jet System" 
                              width={80} 
                              height={64} 
                              className="w-full h-16 rounded-md object-contain" 
                            />
                          </div>
                          <div className="flex-grow">
                            <div className="flex justify-between">
                              <p className="font-medium">Spa Jet System</p>
                              <p className="font-medium whitespace-nowrap">{fmt(totalSpaJetSystemCost)}</p>
                            </div>
                            <p className="text-base text-muted-foreground mt-0.5">Complete spa jet system with pump and jets</p>
                            <div className="mt-2 text-sm text-muted-foreground">
                              <p>Includes:</p>
                              <ul className="list-disc list-inside ml-2">
                                {spaJetSystemItems.map(item => (
                                  <li key={item.id}>{item.name}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // Render Round Pool 23 Spa Jet Upgrade separately
                  roundPool23Items.forEach(extra => {
                    result.push(
                      <div key={extra.id} className="mb-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 pr-6 flex items-center justify-center h-full w-20">
                            <Image 
                              src="/VipCards/spajet.webp" 
                              alt={extra.name} 
                              width={80} 
                              height={64} 
                              className="w-full h-16 rounded-md object-contain" 
                            />
                          </div>
                          <div className="flex-grow">
                            <div className="flex justify-between">
                              <p className="font-medium">{extra.name}</p>
                              <p className="font-medium whitespace-nowrap">{fmt(extra.total_rrp)}</p>
                            </div>
                            <p className="text-base text-muted-foreground mt-0.5">{extra.description}</p>
                            {extra.quantity > 1 && (
                              <p className="text-sm text-muted-foreground mt-0.5">Quantity: {extra.quantity}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  });

                  // Render other individual extras
                  otherExtras.forEach(extra => {
                    const extraImage = getExtraImage(extra.name);
                    result.push(
                      <div key={extra.id} className="mb-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 pr-6 flex items-center justify-center h-full w-20">
                            {extraImage ? (
                              <Image 
                                src={extraImage} 
                                alt={extra.name} 
                                width={80} 
                                height={64} 
                                className="w-full h-16 rounded-md object-contain" 
                              />
                            ) : (
                              <div className="w-full h-16 rounded-md bg-gray-200 flex items-center justify-center">
                                <span className="text-xs text-gray-500">Image</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-grow">
                            <div className="flex justify-between">
                              <p className="font-medium">{extra.name}</p>
                              <p className="font-medium whitespace-nowrap">{fmt(extra.total_rrp)}</p>
                            </div>
                            <p className="text-base text-muted-foreground mt-0.5">{extra.description}</p>
                            {extra.quantity > 1 && (
                              <p className="text-sm text-muted-foreground mt-0.5">Quantity: {extra.quantity}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  });

                  return result;
                })()}
              </div>
            </>
          )}

          <Separator className="mb-3" />

          {/* Grand total - using calculator's extrasTotal for consistency */}
          <div className="flex justify-between items-center">
            <p className="font-semibold text-xl">Total Cost</p>
            <p className="text-xl font-semibold">{fmt(totals.extrasTotal)}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}