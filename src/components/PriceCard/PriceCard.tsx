/**
 * File: src/components/PriceCard/PriceCard.tsx
 * 
 * Component for displaying the proposal price card
 */
'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Separator } from '@/components/ui/separator';
import type { DebugPriceTotals, DiscountBreakdown } from '@/hooks/use-price-calculator';

export interface PriceCardProps {
  expanded: boolean;
  onToggle: () => void;
  fmt: (n: number | null | undefined) => string;
  totals: DebugPriceTotals;
  grandTotal: number;
  grandTotalWithoutDiscounts: number;
  discountBreakdown: DiscountBreakdown;
}

export default function PriceCard({
  expanded,
  onToggle,
  fmt,
  totals,
  grandTotal,
  grandTotalWithoutDiscounts,
  discountBreakdown
}: PriceCardProps) {
  return (
    <div className="hidden lg:flex absolute bottom-4 right-4 z-50 bg-background/90 backdrop-blur-sm text-foreground p-4 rounded-lg shadow-lg border border-[#DB9D6A]/20 w-[28rem] overflow-hidden">
      <div className="flex flex-col w-full">
        <AnimatePresence mode="wait">
          {expanded ? (
            <motion.div
              key="expanded"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xl font-semibold">Your Complete Quote</h3>
                <motion.button 
                  onClick={onToggle}
                  className="w-6 h-6 rounded-full bg-[#DB9D6A]/10 flex items-center justify-center text-[#DB9D6A] hover:bg-[#DB9D6A]/20 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </motion.button>
              </div>
              
              <motion.div 
                className="space-y-2 w-full"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                {/* Base Price Section */}
                <div>
                  <h5 className="text-xs font-semibold text-muted-foreground mb-1">Base Price (Website RRP)</h5>
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm">Base Pool</span>
                    <span className="text-sm font-medium">{fmt(totals.basePoolTotal)}</span>
                  </div>
                </div>

                {/* Additional Site Requirements Section */}
                {(totals.siteRequirementsTotal > 0 || totals.electricalTotal > 0) && (
                  <div className="border-t border-border/50 pt-2">
                    <h5 className="text-xs font-semibold text-muted-foreground mb-1">Additional Site Requirements</h5>
                    {totals.siteRequirementsTotal > 0 && (
                      <div className="flex justify-between items-baseline">
                        <span className="text-sm">Site Requirements</span>
                        <span className="text-sm font-medium">{fmt(totals.siteRequirementsTotal)}</span>
                      </div>
                    )}
                    {totals.electricalTotal > 0 && (
                      <div className="flex justify-between items-baseline">
                        <span className="text-sm">Electrical</span>
                        <span className="text-sm font-medium">{fmt(totals.electricalTotal)}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Poolscaping Options Section */}
                {(totals.concreteTotal > 0 || totals.fencingTotal > 0 || totals.waterFeatureTotal > 0 || totals.retainingWallsTotal > 0) && (
                  <div className="border-t border-border/50 pt-2">
                    <h5 className="text-xs font-semibold text-muted-foreground mb-1">Poolscaping Options</h5>
                    {totals.concreteTotal > 0 && (
                      <div className="flex justify-between items-baseline">
                        <span className="text-sm">Concrete & Paving</span>
                        <span className="text-sm font-medium">{fmt(totals.concreteTotal)}</span>
                      </div>
                    )}
                    {totals.fencingTotal > 0 && (
                      <div className="flex justify-between items-baseline">
                        <span className="text-sm">Fencing</span>
                        <span className="text-sm font-medium">{fmt(totals.fencingTotal)}</span>
                      </div>
                    )}
                    {totals.waterFeatureTotal > 0 && (
                      <div className="flex justify-between items-baseline">
                        <span className="text-sm">Water Features</span>
                        <span className="text-sm font-medium">{fmt(totals.waterFeatureTotal)}</span>
                      </div>
                    )}
                    {totals.retainingWallsTotal > 0 && (
                      <div className="flex justify-between items-baseline">
                        <span className="text-sm">Retaining Walls</span>
                        <span className="text-sm font-medium">{fmt(totals.retainingWallsTotal)}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Upgrades & Extras Section */}
                {totals.extrasTotal > 0 && (
                  <div className="border-t border-border/50 pt-2">
                    <h5 className="text-xs font-semibold text-muted-foreground mb-1">Upgrades & Extras</h5>
                    <div className="flex justify-between items-baseline">
                      <span className="text-sm">Extras & Add-ons</span>
                      <span className="text-sm font-medium">{fmt(totals.extrasTotal)}</span>
                    </div>
                  </div>
                )}
                
                {/* Subtotal (before discounts) */}
                {totals.discountTotal > 0 && (
                  <>
                    <Separator className="my-3" />
                    <div className="flex justify-between items-baseline text-muted-foreground">
                      <span className="text-sm">Subtotal</span>
                      <span className="text-sm">{fmt(grandTotalWithoutDiscounts)}</span>
                    </div>
                  </>
                )}

                {/* Discount Section */}
                {totals.discountTotal > 0 && (
                  <div className="space-y-1 mt-2">
                    {discountBreakdown.discountDetails.map((discount, index) => (
                      <div key={index} className="flex justify-between items-baseline text-green-600">
                        <span className="text-sm">
                          {discount.name}
                          {discount.type === 'percentage' && ` (${discount.value}%)`}
                        </span>
                        <span className="text-sm">-{fmt(discount.calculatedAmount)}</span>
                      </div>
                    ))}
                  </div>
                )}

                <Separator className="my-3" />
                <div className="flex justify-between items-baseline">
                  <span className="text-lg font-semibold">Total Quote (inc GST)</span>
                  <span className="text-lg font-semibold">{fmt(grandTotal)}</span>
                </div>
              </motion.div>
              
              <p className="text-base text-muted-foreground mt-2">Includes all materials, installation, and site works</p>
            </motion.div>
          ) : (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex justify-between items-center w-full"
            >
              <span className="text-xl font-semibold">Total Quote:</span>
              <div className="flex items-center gap-3">
                <span className="text-xl font-semibold">
                  {fmt(grandTotal)}
                </span>
                <motion.button 
                  onClick={onToggle}
                  className="w-6 h-6 rounded-full bg-[#DB9D6A]/10 flex items-center justify-center text-[#DB9D6A] hover:bg-[#DB9D6A]/20 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}