/**
 * File: src/components/PriceCard/PriceCard.tsx
 * 
 * Component for displaying the proposal price card
 */
'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Separator } from '@/components/ui/separator';
import type { PriceBreakdown } from '@/hooks/use-price-calculator';

export interface PriceCardProps {
  expanded: boolean;
  onToggle: () => void;
  fmt: (n: number) => string;
  grandTotal: number;
  breakdown: PriceBreakdown;
}

export default function PriceCard({
  expanded,
  onToggle,
  fmt,
  grandTotal,
  breakdown
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
                <h3 className="text-lg font-semibold">Your Complete Quote</h3>
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
                className="space-y-1.5 w-full"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-muted-foreground">Base Pool</span>
                  <span className="font-medium">{fmt(breakdown.basePoolPrice)}</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-muted-foreground">Installation</span>
                  <span className="font-medium">{fmt(breakdown.installationTotal)}</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-muted-foreground">Filtration & Equipment</span>
                  <span className="font-medium">{fmt(breakdown.filtrationTotal)}</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-muted-foreground">Concrete & Paving</span>
                  <span className="font-medium">{fmt(breakdown.concreteTotal)}</span>
                </div>
                {breakdown.fencingTotal > 0 && (
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm text-muted-foreground">Fencing & Safety</span>
                    <span className="font-medium">{fmt(breakdown.fencingTotal)}</span>
                  </div>
                )}
                {breakdown.waterFeatureTotal > 0 && (
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm text-muted-foreground">Water Features</span>
                    <span className="font-medium">{fmt(breakdown.waterFeatureTotal)}</span>
                  </div>
                )}
                {breakdown.extrasTotal > 0 && (
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm text-muted-foreground">Extras & Add-ons</span>
                    <span className="font-medium">{fmt(breakdown.extrasTotal)}</span>
                  </div>
                )}
                
                <Separator className="my-3" />
                <div className="flex justify-between items-baseline">
                  <span className="font-medium">Total Quote</span>
                  <span className="text-xl font-bold">{fmt(breakdown.grandTotal)}</span>
                </div>
              </motion.div>
              
              <p className="text-xs text-muted-foreground mt-2">Includes all materials, installation, and site works</p>
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
              <span className="font-medium text-lg">Total Quote:</span>
              <div className="flex items-center gap-3">
                <span className="text-xl font-bold">
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