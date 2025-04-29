'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Check } from 'lucide-react';
import { subCardFade } from '@/app/lib/animation';

export function SiteWorkCards() {
  // Site work items with benefits - static marketing content
  const siteWorkItems = [
    {name: 'Council certification & CAD plans', benefit: 'paperwork handled'},
    {name: 'Engineer sign-off to AS1839-2021', benefit: 'built to code'},
    {name: 'Excavation & spoil removal', benefit: 'site left tidy'},
    {name: 'Franna crane lift', benefit: 'precise placement'},
    {name: 'Geotechnical soil test', benefit: 'ground verified'},
    {name: 'Drainage & back-fill system', benefit: 'protects your pool'},
    {name: '8-week temporary safety fence', benefit: 'stay compliant'},
    {name: 'Water delivery & fill', benefit: 'logistics sorted'},
    {name: 'Professional cleans & tuition', benefit: 'sparkling hand-over'}
  ];

  // Fixed marketing value
  const SITE_WORK_VALUE = 12_500;

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
          We take care of the entire installation process, including site preparation, compliance, and finishing touches.
        </p>
        
        {/* Site Work Card */}
        <Card className="w-full overflow-y-auto shadow-lg">
          <CardContent className="p-5 space-y-4">
            <h3 className="text-lg font-semibold mb-2">Site-Work & Compliance</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Professional installation and certification
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {siteWorkItems.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="mt-0.5 text-green-600">
                    <Check size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.benefit}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <Separator className="my-4" />
            
            <div className="flex justify-between items-baseline">
              <p className="font-semibold">Total Site Work Value</p>
              <p className="text-xl font-bold">
                {SITE_WORK_VALUE.toLocaleString('en-AU', { style: 'currency', currency: 'AUD' })}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}