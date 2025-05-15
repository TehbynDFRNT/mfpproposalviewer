/**
 * File: src/components/sections/SiteRequirementsCards/DetailsCard.tsx
 */
'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Layers, ShieldCheck, Square, Handshake } from 'lucide-react';
import { subCardFade } from '@/lib/animation';
import type { ProposalSnapshot } from '@/types/snapshot';

// Simple placeholder component without dependencies on old properties
export function DetailsCard() {
  return (
    <motion.div
      variants={subCardFade}
      initial="initial"
      animate="enter"
      exit="exit"
      className="w-full min-h-[80vh] py-4"
    >
      <div className="space-y-6 h-full overflow-y-auto">
        {/* Installation Details Card */}
        <Card className="w-full shadow-lg">
          <CardContent className="p-5 space-y-5">
            <div className="mb-2">
              <h3 className="text-base font-semibold">Installation Standards & Safety</h3>
              <p className="text-sm text-muted-foreground">Quality assurance and compliance measures</p>
            </div>
            
            <Separator className="mb-4" />
            
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 mt-0.5 rounded-lg bg-[#DB9D6A]/10 flex items-center justify-center">
                  <Layers className="h-7 w-7 text-[#DB9D6A]" />
                </div>
                <div>
                  <p className="text-sm font-medium">Council Certification & CAD Plans</p>
                  <p className="text-xs text-muted-foreground mt-1">We handle all required local council certifications and provide detailed CAD plans for approval. All paperwork is managed by our experienced team so you don't have to worry about the administrative details.</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 mt-0.5 rounded-lg bg-[#DB9D6A]/10 flex items-center justify-center">
                  <ShieldCheck className="h-7 w-7 text-[#DB9D6A]" />
                </div>
                <div>
                  <p className="text-sm font-medium">Engineer Sign-off to AS1839-2021</p>
                  <p className="text-xs text-muted-foreground mt-1">Your pool is built to meet or exceed the Australian Standard AS1839-2021. Our professional engineers provide complete sign-off documentation to ensure your installation meets all safety and construction requirements.</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 mt-0.5 rounded-lg bg-[#DB9D6A]/10 flex items-center justify-center">
                  <Square className="h-7 w-7 text-[#DB9D6A]" />
                </div>
                <div>
                  <p className="text-sm font-medium">Temporary Safety Fencing (8 Weeks)</p>
                  <p className="text-xs text-muted-foreground mt-1">During your pool installation, we provide compliant temporary safety fencing for 8 weeks, ensuring your property remains safe and meets all legal requirements during the construction phase.</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 mt-0.5 rounded-lg bg-[#DB9D6A]/10 flex items-center justify-center">
                  <Handshake className="h-7 w-7 text-[#DB9D6A]" />
                </div>
                <div>
                  <p className="text-sm font-medium">Professional Handover & Training</p>
                  <p className="text-xs text-muted-foreground mt-1">When your pool is complete, we provide professional handover services including thorough cleaning, water chemistry setup, and personalized training on maintenance and equipment operation to ensure you're fully confident with your new pool.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}