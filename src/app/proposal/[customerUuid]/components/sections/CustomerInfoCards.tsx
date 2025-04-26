import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Mail, Phone, Home, Wrench, Square, Layers, BarChart2, Filter, Star, ShieldCheck, Handshake } from 'lucide-react';
import Image from "next/image";
import type { ProposalData } from '@/types/proposal';

export default function CustomerInfoCards({ data }: { data: ProposalData['customerInfo'] }) {
  return (
    <div className="space-y-6 h-full overflow-y-auto">
      {/* Customer info cards rendered sequentially */}
      <Card className="w-full p-5">
        <CardContent className="px-0 space-y-4">
          {/* Contact Info */}
          <p className="text-sm font-medium">Your Best Contact Details</p>
          <div className="grid grid-cols-2 gap-4">
            <a
              href={`tel:${data.phoneNumber}`}
              className="flex items-center gap-2 text-sm hover:underline"
              aria-label={`Call ${data.phoneNumber}`}
            >
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{data.phoneNumber}</span>
            </a>
            <a
              href={`mailto:${data.emailAddress}`}
              className="flex items-center gap-2 text-sm hover:underline"
              aria-label={`Email ${data.emailAddress}`}
            >
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{data.emailAddress}</span>
            </a>
          </div>
          <Separator />
          {/* Pool Installation Location */}
          <p className="text-sm font-medium">Pool Installation Location</p>
          <div className="flex items-start gap-2">
            <Home className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{data.propertyDetails.fullAddress}</p>
          </div>
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
      
      {/* Salesperson Profile Card */}
      <Card className="w-full p-5">
        <CardContent className="px-0">
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-4">
              <Image 
                src="/_opt/Jonah.webp" 
                alt="Jonah" 
                className="h-16 w-16 rounded-full object-cover border-2 border-[#DB9D6A]" 
                width={64}
                height={64}
              />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold">Thanks for Meeting with Jonah!</h3>
              <div className="mt-1 space-y-1">
                <div className="flex items-center text-sm">
                  <Phone className="h-3.5 w-3.5 text-[#DB9D6A] mr-2" />
                  <span>0412 345 678</span>
                </div>
                <div className="flex items-center text-sm">
                  <Mail className="h-3.5 w-3.5 text-[#DB9D6A] mr-2" />
                  <span>jonah@mfppools.com.au</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}