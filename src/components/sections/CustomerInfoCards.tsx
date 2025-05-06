/**
 * File: src/components/sections/CustomerInfoCards.tsx
 */
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Mail, Phone, Home, Wrench, Square, Layers, BarChart2, Filter, Star, ShieldCheck, Handshake } from 'lucide-react';
import type { ProposalSnapshot } from "@/app/lib/types/snapshot";

export default function CustomerInfoCards({ snapshot }: { snapshot: ProposalSnapshot }) {
  // Use flat snapshot properties directly instead of nested poolProject
  const installationAddress = snapshot.site_address ?? snapshot.home_address ?? 'Address pending...';
  return (
    <div className="space-y-6 h-full overflow-y-auto">
      {/* Customer info cards rendered sequentially */}
      <Card className="w-full p-5">
        <CardContent className="px-0 space-y-4">
          {/* Contact Info */}
          <p className="text-sm font-medium">Your Best Contact Details</p>
          <div className="grid grid-cols-2 gap-4">
            <a
              href={`tel:${snapshot.phone}`}
              className="flex items-center gap-2 text-sm hover:underline"
              aria-label={`Call ${snapshot.phone}`}
            >
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{snapshot.phone}</span>
            </a>
            <a
              href={`mailto:${snapshot.email}`}
              className="flex items-center gap-2 text-sm hover:underline"
              aria-label={`Email ${snapshot.email}`}
            >
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{snapshot.email}</span>
            </a>
          </div>
          <Separator />
          {/* Pool Installation Location */}
          <p className="text-sm font-medium">Pool Installation Location</p>
          <div className="flex items-start gap-2">
            <Home className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {installationAddress}
            </p>
          </div>
          
          {/* Show Home Address if different from Installation Location */}
          {snapshot.site_address &&
           snapshot.home_address &&
           snapshot.home_address !== snapshot.site_address && (
            <>
              <Separator className="my-2" />
              <p className="text-sm font-medium mt-3">Owner's Home Address</p>
              <div className="flex items-start gap-2">
                <Home className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {snapshot.home_address}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Quote Summary Card */}
      <Card className="w-full p-5">
        <CardContent className="px-0 space-y-4">
          <p className="text-sm font-medium">Complete Pool Quote Includes:</p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Wrench className="h-4 w-4 text-[#DB9D6A]" />
              <span>Installation</span>
            </div>
            <div className="flex items-center space-x-2">
              <Square className="h-4 w-4 text-[#DB9D6A]" />
              <span>Coping</span>
            </div>
            <div className="flex items-center space-x-2">
              <Layers className="h-4 w-4 text-[#DB9D6A]" />
              <span>Paving & Concrete</span>
            </div>
            <div className="flex items-center space-x-2">
              <BarChart2 className="h-4 w-4 text-[#DB9D6A]" />
              <span>Fencing</span>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-[#DB9D6A]" />
              <span>Filtration</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 text-[#DB9D6A]" />
              <span>Upgrades & Extras</span>
            </div>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="h-4 w-4 text-[#DB9D6A]" />
              <span>Warranty</span>
            </div>
            <div className="flex items-center space-x-2">
              <Handshake className="h-4 w-4 text-[#DB9D6A]" />
              <span>Full Handover</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}