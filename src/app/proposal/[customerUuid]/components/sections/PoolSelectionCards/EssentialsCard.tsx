'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Check } from 'lucide-react';
import { subCardFade } from '@/app/lib/animation';

/* ── static marketing copy ─────────────────────────────── */
const essentialsItems = [
  { name: 'Pool shell warranty',               benefit: 'lifetime protection' },
  { name: '12-month mineral start-up kit',     benefit: 'crystal-clear water' },
  { name: 'Multi-colour LED light',            benefit: 'night-time ambience' },
  { name: 'Energy-saving Pureswim pump',       benefit: 'cuts running costs' },
  { name: 'Oversize cartridge filter',         benefit: 'fewer cleans' },
  { name: 'Smart chlorinator',                 benefit: 'set & forget sanitation' },
  { name: 'Premium hand-over kit',             benefit: 'maintenance gear included' },
  { name: 'Stone-lid skimmer',                 benefit: 'blends with coping' },
];

const TOTAL_RRP = 8_900;      // AUD – hard-coded marketing "value"

export function EssentialsCards() {
  return (
    <motion.div
      variants={subCardFade}
      initial="initial"
      animate="enter"
      exit="exit"
      className="w-full min-h-[80vh] py-4"
    >
      <div className="flex flex-col space-y-6">
        <p className="text-white text-sm mb-4">
          Your pool comes with everything you need to start swimming. These essentials
          ensure it's ready from day one with top-quality gear.
        </p>

        <Card className="w-full overflow-y-auto shadow-lg">
          <CardContent className="p-5 space-y-4">
            <h3 className="text-lg font-semibold mb-2">Swim-Ready Essentials</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Included in your package at&nbsp;<strong>no extra cost</strong>
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {essentialsItems.map((item) => (
                <div key={item.name} className="flex items-start gap-3">
                  <Check size={18} className="mt-0.5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.benefit}</p>
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            <div className="flex justify-between items-baseline">
              <p className="font-semibold">Total Value</p>
              <p className="text-xl font-bold">
                {TOTAL_RRP.toLocaleString('en-AU', { style: 'currency', currency: 'AUD' })}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}