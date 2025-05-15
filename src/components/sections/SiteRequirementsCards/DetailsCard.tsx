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
              <h3 className="text-xl font-semibold">Installation Standards & Safety</h3>
              <p className="text-base text-muted-foreground">Quality assurance and regulatory compliance</p>
            </div>
            
            <Separator className="mb-4" />
            
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 min-h-[40px] min-w-[40px] flex-shrink-0 rounded-lg bg-[#DB9D6A]/10 flex items-center justify-center p-0">
                  <Layers className="h-6 w-6 text-[#DB9D6A]" />
                </div>
                <div>
                  <p className="font-medium">Council Certification & CAD Plans</p>
                  <p className="text-base text-muted-foreground mt-0.5">Our team handles all council certifications and CAD plans for approval, managing all paperwork so you needn't worry about administrative details.</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 min-h-[40px] min-w-[40px] flex-shrink-0 rounded-lg bg-[#DB9D6A]/10 flex items-center justify-center p-0">
                  <ShieldCheck className="h-6 w-6 text-[#DB9D6A]" />
                </div>
                <div>
                  <p className="font-medium">Engineer Sign-off to AS1839-2021</p>
                  <p className="text-base text-muted-foreground mt-0.5">Your pool meets or exceeds Australian Standard AS1839-2021. Our engineers provide complete documentation ensuring your installation satisfies all safety and construction requirements.</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 min-h-[40px] min-w-[40px] flex-shrink-0 rounded-lg bg-[#DB9D6A]/10 flex items-center justify-center p-0">
                  <Square className="h-6 w-6 text-[#DB9D6A]" />
                </div>
                <div>
                  <p className="font-medium">Temporary Safety Fencing (8 Weeks)</p>
                  <p className="text-base text-muted-foreground mt-0.5">We supply compliant temporary safety fencing for 8 weeks during installation, keeping your property secure and meeting all legal requirements throughout construction.</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 min-h-[40px] min-w-[40px] flex-shrink-0 rounded-lg bg-[#DB9D6A]/10 flex items-center justify-center p-0">
                  <Handshake className="h-6 w-6 text-[#DB9D6A]" />
                </div>
                <div>
                  <p className="font-medium">Professional Handover & Training</p>
                  <p className="text-base text-muted-foreground mt-0.5">Upon completion, we deliver professional handover including thorough cleaning, water chemistry setup and personalised training on maintenance and equipment operation, ensuring your confidence with your new pool.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}