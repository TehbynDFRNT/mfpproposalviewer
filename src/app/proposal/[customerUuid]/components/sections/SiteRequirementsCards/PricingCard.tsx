'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { subCardFade } from '@/lib/animation';
import type { ProposalData } from '@/types/proposal';

interface PricingCardProps {
  siteRequirements: ProposalData['siteRequirements'];
  poolSelection: ProposalData['poolSelection'];
  electrical: ProposalData['electrical'];
}

export function PricingCard({ siteRequirements, poolSelection, electrical }: PricingCardProps) {
  return (
    <motion.div
      key="installation-pricing"
      variants={subCardFade}
      initial="initial"
      animate="enter"
      exit="exit"
      className="w-full min-h-[80vh] py-4"
    >
      <div className="space-y-6 h-full overflow-y-auto">
        {/* Pool Installation Section Cards */}
        <Card className="w-full shadow-lg">
          <CardContent className="p-5 space-y-6">
            <div className="mb-2">
              <h3 className="text-base font-semibold">Pool Installation</h3>
              <p className="text-sm text-muted-foreground">Comprehensive pool installation and site preparation</p>
            </div>
            
            <Separator className="mb-4" />
            
            {/* Pool Installation cost breakdown */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm font-medium">Pool Installation</p>
                  <p className="text-xs text-muted-foreground">Fixed costs + variable costs (labor, materials, certifications)</p>
                </div>
                <p className="font-medium whitespace-nowrap">${(poolSelection.totalFixedCosts + poolSelection.totalIndividualCosts).toLocaleString()}</p>
              </div>
              
              <div className="flex justify-between">
                <div>
                  <p className="text-sm font-medium">Franna Crane ({siteRequirements.standardSiteRequirements.craneSelection.type})</p>
                  <p className="text-xs text-muted-foreground">Precision pool placement</p>
                </div>
                <p className="font-medium whitespace-nowrap">${siteRequirements.standardSiteRequirements.craneSelection.cost.toLocaleString()}</p>
              </div>
              
              <div className="flex justify-between">
                <div>
                  <p className="text-sm font-medium">Bobcat ({siteRequirements.standardSiteRequirements.bobcatSelection.type})</p>
                  <p className="text-xs text-muted-foreground">Site excavation and preparation</p>
                </div>
                <p className="font-medium whitespace-nowrap">${siteRequirements.standardSiteRequirements.bobcatSelection.cost.toLocaleString()}</p>
              </div>
              
              {siteRequirements.standardSiteRequirements.trafficControl.cost > 0 && (
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm font-medium">Traffic Control ({siteRequirements.standardSiteRequirements.trafficControl.level})</p>
                    <p className="text-xs text-muted-foreground">Safe site access</p>
                  </div>
                  <p className="font-medium whitespace-nowrap">${siteRequirements.standardSiteRequirements.trafficControl.cost.toLocaleString()}</p>
                </div>
              )}
              
              {siteRequirements.customSiteRequirements && 
               siteRequirements.customSiteRequirements[0] && 
               typeof siteRequirements.customSiteRequirements[0] === 'object' && (
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm font-medium">{siteRequirements.customSiteRequirements[0].description}</p>
                    <p className="text-xs text-muted-foreground">Custom site requirement</p>
                  </div>
                  <p className="font-medium whitespace-nowrap">${siteRequirements.customSiteRequirements[0].price.toLocaleString()}</p>
                </div>
              )}
              
              {/* Electrical Section Items */}
              <div className="pt-4 pb-0">
                <p className="text-sm font-medium mb-1">Electrical Requirements</p>
                <Separator className="mb-1" />
              </div>
              
              {electrical.standardPower.isSelected && (
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm font-medium">Standard Power Circuit</p>
                    <p className="text-xs text-muted-foreground">Power supply for pool equipment</p>
                  </div>
                  <p className="font-medium whitespace-nowrap">${electrical.standardPower.rate.toLocaleString()}</p>
                </div>
              )}
              
              {electrical.addOnFenceEarthing.isSelected && (
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm font-medium">Fence Earthing</p>
                    <p className="text-xs text-muted-foreground">Safety grounding for metal fences</p>
                  </div>
                  <p className="font-medium whitespace-nowrap">${electrical.addOnFenceEarthing.rate.toLocaleString()}</p>
                </div>
              )}
              
              {electrical.heatPumpCircuit.isSelected && (
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm font-medium">Heat Pump Circuit</p>
                    <p className="text-xs text-muted-foreground">Dedicated circuit for heating system</p>
                  </div>
                  <p className="font-medium whitespace-nowrap">${electrical.heatPumpCircuit.rate.toLocaleString()}</p>
                </div>
              )}
            </div>
            
            <Separator className="mb-3" />
            
            {/* Grand total */}
            <div className="flex justify-between items-baseline mt-1">
              <p className="font-semibold">Total Installation Price</p>
              <p className="text-xl font-bold">${(
                poolSelection.totalFixedCosts + 
                poolSelection.totalIndividualCosts + 
                siteRequirements.costSummary.totalCost + 
                electrical.costSummary.totalCost
              ).toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}