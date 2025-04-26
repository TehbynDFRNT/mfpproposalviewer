import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Image from "next/image";
import type { ProposalData } from '@/types/proposal';

export default function AddOnCards({ data }: { data: ProposalData['addOns'] }) {
  // Local state for drawer cards, replacing the parent component's state
  const [spaJetsOpen, setSpaJetsOpen] = useState<boolean>(false);
  const [deckJetsOpen, setDeckJetsOpen] = useState<boolean>(false);
  const [poolHeatingOpen, setPoolHeatingOpen] = useState<boolean>(false);

  return (
    <div className="space-y-6 h-full overflow-y-auto">
      {/* Extras & Upgrades Introduction */}
      <p className="text-white text-sm mb-4">
        Personalize your pool with these premium upgrades to add extra functionality and enjoyment to your pool area. Browse the available options below to see what's possible.
      </p>
      
      {/* Extras & Upgrades Cards */}
      <div className="space-y-4">
        {/* Pool Cleaner */}
        <Card className="overflow-hidden shadow-lg">
          <div className="p-4">
            <div className="flex flex-row items-start w-full">
              {/* Left: graphic */}
              <div className="flex-shrink-0 pr-4 flex items-center justify-start h-full pt-1">
                <div className="w-16 h-16 rounded-md overflow-hidden">
                  <Image src="/_opt/poolcleaner.webp" alt="Dolphin DB2 Pool Cleaner" className="w-full h-full object-cover" width={400} height={300} />
                </div>
              </div>
              
              {/* Right: content */}
              <div className="flex-grow">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-base font-semibold">
                    Robotic Pool Cleaner
                  </h3>
                  <p className="text-sm font-medium">
                    $1,400
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  <ul className="list-disc pl-4">
                    <li>Dolphin DB2 Cleaner</li>
                  </ul>
                  <ul className="list-disc pl-4">
                    <li>Floor & wall scrubbing</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Card>
        
        {/* Spa Jets */}
        <Card className="overflow-hidden shadow-lg">
          <div className="p-4">
            <div className="flex flex-row items-start w-full">
              {/* Left: graphic */}
              <div className="flex-shrink-0 pr-4 flex items-center justify-start h-full pt-1">
                <div className="w-16 h-16 rounded-md overflow-hidden">
                  <Image src="/_opt/spajet.webp" alt="Spa Jets" className="w-full h-full object-cover" width={400} height={300} />
                </div>
              </div>
              
              {/* Right: content */}
              <div className="flex-grow">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-base font-semibold">
                    Spa Jets
                  </h3>
                  <p className="text-sm font-medium">
                    $1,220
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  <ul className="list-disc pl-4">
                    <li>ASF-440 Jet System</li>
                    <li>Spa Jet Pump</li>
                  </ul>
                  <ul className="list-disc pl-4">
                    <li>Hydrotherapy jets</li>
                    <li>Water massage</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Card>
        
        {/* Deck Jets */}
        <Card className="overflow-hidden shadow-lg">
          <div className="p-4">
            <div className="flex flex-row items-start w-full">
              {/* Left: graphic */}
              <div className="flex-shrink-0 pr-4 flex items-center justify-start h-full pt-1">
                <div className="w-16 h-16 rounded-md overflow-hidden">
                  <Image src="/_opt/deckjet.webp" alt="Deck Jets" className="w-full h-full object-cover" width={400} height={300} />
                </div>
              </div>
              
              {/* Right: content */}
              <div className="flex-grow">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-base font-semibold">
                    Deck Jets
                  </h3>
                  <p className="text-sm font-medium">
                    $1,075
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  <ul className="list-disc pl-4">
                    <li>2 Deck Jets</li>
                    <li>Complete plumbing</li>
                  </ul>
                  <ul className="list-disc pl-4">
                    <li>Water arcs</li>
                    <li>LED compatible</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Card>
        
        {/* Pool Heating Options (Available) */}
        <Card className="overflow-hidden shadow-lg">
          <div className="p-4">
            <div className="flex flex-row items-start w-full">
              {/* Left: graphic */}
              <div className="flex-shrink-0 pr-4 flex items-center justify-start h-full pt-1">
                <div className="w-16 h-16 rounded-md overflow-hidden">
                  <Image src="/_opt/poolblanket.webp" alt="Pool Heating Options" className="w-full h-full object-cover" width={400} height={300} />
                </div>
              </div>
              
              {/* Right: content */}
              <div className="flex-grow">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-base font-semibold">
                    Pool Heating Options
                  </h3>
                  <p className="text-sm font-medium">
                    $6,065
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  <ul className="list-disc pl-4">
                    <li>Sunlover Oasis 13kW Heat Pump</li>
                    <li>Heat Pump Installation</li>
                  </ul>
                  <ul className="list-disc pl-4">
                    <li>3mm Daisy Thermal Blanket</li>
                    <li>Stainless Steel Roller</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Extras & Upgrades Summary Card */}
      <Card className="w-full shadow-lg">
        <CardContent className="p-5">
          <div className="flex justify-between items-baseline">
            <p className="font-semibold">Extras & Upgrades Total</p>
            <p className="text-xl font-bold">${data.costSummary.totalCost.toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}