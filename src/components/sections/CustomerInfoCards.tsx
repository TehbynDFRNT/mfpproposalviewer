/**
 * File: src/components/sections/CustomerInfoCards.tsx
 */
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Mail, Phone, Home, Wrench, Square, Layers, BarChart2, Filter, Star, ShieldCheck, Handshake, Waves, Droplets, Hammer } from 'lucide-react';
import type { ProposalSnapshot } from "@/types/snapshot";
import { CATEGORY_IDS } from "@/lib/constants";
import { isSectionEmpty } from "@/lib/utils";

export default function CustomerInfoCards({ snapshot }: { snapshot: ProposalSnapshot }) {
  // Use flat snapshot properties directly instead of nested poolProject
  const installationAddress = snapshot.site_address ?? snapshot.home_address ?? 'Address pending...';
  return (
    <div className="space-y-6 h-full overflow-y-auto">
      {/* Customer info cards rendered sequentially */}
      <Card className="w-full shadow-lg">
        <CardContent className="p-5 space-y-4">
          {/* Contact Info Header */}
          <header>
            <h3 className="text-xl font-semibold">Your Contact Information</h3>
            <p className="text-base text-muted-foreground">
              How we'll stay in touch throughout your pool project
            </p>
          </header>

          <Separator className="mb-4" />
          
          {/* Contact Info */}
          <div className="space-y-3">
            <div className="mb-2">
              <p className="text-base font-medium">Your Best Contact Details</p>
            </div>
            <div className="flex flex-col space-y-2 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">
              <a
                href={`tel:${snapshot.phone}`}
                className="flex items-center gap-2 text-base hover:underline"
                aria-label={`Call ${snapshot.phone}`}
              >
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{snapshot.phone}</span>
              </a>
              <a
                href={`mailto:${snapshot.email}`}
                className="flex items-center gap-2 text-base hover:underline overflow-hidden text-ellipsis"
                aria-label={`Email ${snapshot.email}`}
              >
                <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="font-medium overflow-hidden text-ellipsis">{snapshot.email}</span>
              </a>
            </div>
          </div>
          
          <Separator className="my-3" />
          
          {/* Addresses */}
          <div className="space-y-3">
            <div className="mb-2">
              <p className="text-base font-medium">Project Location</p>
            </div>
            
            {/* Pool Installation Location */}
            <div className="flex justify-between">
              <div>
                <p className="text-base font-medium">{installationAddress}</p>
              </div>
            </div>
            
            {/* Show Home Address if different from Installation Location */}
            {snapshot.site_address &&
             snapshot.home_address &&
             snapshot.home_address !== snapshot.site_address && (
              <div className="flex justify-between mt-2">
                <div>
                  <p className="text-base text-muted-foreground">Owner's Home Address:</p>
                  <p className="text-base font-medium">{snapshot.home_address}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Quote Summary Card */}
      <Card className="w-full shadow-lg">
        <CardContent className="p-5 space-y-4">
          <header>
            <h3 className="text-xl font-semibold">Your Complete Pool Package</h3>
            <p className="text-base text-muted-foreground">
              Everything included in your customized proposal
            </p>
          </header>

          <Separator className="mb-4" />
          
          <p className="text-base font-medium">Complete Pool Quote Includes:</p>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Core sections - always shown */}
            <div className="flex items-center space-x-2">
              <Waves className="h-4 w-4 text-[#DB9D6A]" />
              <p className="text-base font-medium">Selection</p>
            </div>
            <div className="flex items-center space-x-2">
              <Wrench className="h-4 w-4 text-[#DB9D6A]" />
              <p className="text-base font-medium">Installation</p>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-[#DB9D6A]" />
              <p className="text-base font-medium">Filtration</p>
            </div>
            
            {/* Additional sections - only shown if they have content */}
            {!isSectionEmpty(CATEGORY_IDS.CONCRETE_PAVING, snapshot) && (
              <div className="flex items-center space-x-2">
                <Layers className="h-4 w-4 text-[#DB9D6A]" />
                <p className="text-base font-medium">Concrete & Paving</p>
              </div>
            )}
            {!isSectionEmpty(CATEGORY_IDS.FENCING, snapshot) && (
              <div className="flex items-center space-x-2">
                <BarChart2 className="h-4 w-4 text-[#DB9D6A]" />
                <p className="text-base font-medium">Fencing</p>
              </div>
            )}
            {!isSectionEmpty(CATEGORY_IDS.RETAINING_WALLS, snapshot) && (
              <div className="flex items-center space-x-2">
                <Hammer className="h-4 w-4 text-[#DB9D6A]" />
                <p className="text-base font-medium">Retaining Walls</p>
              </div>
            )}
            {!isSectionEmpty(CATEGORY_IDS.WATER_FEATURE, snapshot) && (
              <div className="flex items-center space-x-2">
                <Droplets className="h-4 w-4 text-[#DB9D6A]" />
                <p className="text-base font-medium">Water Feature</p>
              </div>
            )}
            {!isSectionEmpty(CATEGORY_IDS.ADD_ONS, snapshot) && (
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-[#DB9D6A]" />
                <p className="text-base font-medium">Upgrades</p>
              </div>
            )}
            
            {/* Proposal Summary - always last */}
            <div className="flex items-center space-x-2">
              <Square className="h-4 w-4 text-[#DB9D6A]" />
              <p className="text-base font-medium">Summary</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}