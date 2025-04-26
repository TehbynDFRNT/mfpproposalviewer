import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Image from "next/image";
import type { ProposalData } from '@/types/proposal';
import type { PavingMetric } from '@/types/paving';

export default function ConcretePavingCards({ 
  data, 
  metricsRows, 
  metricsTotal 
}: { 
  data: ProposalData['concreteAndPaving']; 
  metricsRows: PavingMetric[];
  metricsTotal: number; 
}) {
  return (
    <div className="space-y-6 h-full overflow-y-auto">
      {/* Concrete & Paving Section Cards */}
      <Card className="w-full shadow-lg">
        <CardContent className="p-5 space-y-6">
          <div className="mb-2">
            <h3 className="text-base font-semibold">Concrete & Paving</h3>
            <p className="text-sm text-muted-foreground">Premium surfaces and finishes for your pool area</p>
          </div>
          
          <Separator className="mb-4" />
          
          {/* Concrete & Paving cost breakdown */}
          <div className="space-y-3">
            {metricsRows.map(row => (
              <div key={row.name} className="flex justify-between">
                <div>
                  <p className="text-sm font-medium">{row.name}</p>
                  {row.benefit && (
                    <p className="text-xs text-muted-foreground">{row.benefit}</p>
                  )}
                </div>
                <p className="font-medium whitespace-nowrap">${row.cost.toLocaleString()}</p>
              </div>
            ))}
          </div>
          
          <Separator className="mb-3" />
          
          {/* Grand total */}
          <div className="flex justify-between items-baseline mt-1">
            <p className="font-semibold">Total Price</p>
            <p className="text-xl font-bold">${metricsTotal.toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>
      
      {/* 3DStone Paver VIP Card */}
      <Card className="p-4 overflow-y-auto shadow-lg">
        <CardContent className="px-2 flex items-center h-full">
          <div className="flex flex-row items-center w-full">
            {/* Left: VIP graphic */}
            <div className="flex-shrink-0 pr-4 flex items-center justify-center h-full">
              <Image
                src="/_opt/3dstone.webp"
                alt="Premium 3DStone Paver"
                className="w-16 h-16 rounded-md object-contain"
                width={64}
                height={64}
              />
            </div>
            
            {/* Right: copy & value points */}
            <div className="flex-grow">
              <h3 className="text-base font-semibold mb-1 flex items-center">
                Premium&nbsp;<i>3D Stone</i>&nbsp;Paver
                <span className="ml-2 inline-block text-xs font-bold px-2 py-0.5 rounded-full bg-yellow-400/80 text-yellow-900">
                  VIP
                </span>
              </h3>
              
              <p className="text-sm mb-1">Natural stone texture with superior durability</p>
              <p className="mt-2 text-sm font-bold">
                Valued At <span className="text-green-700">$1,850</span>
                <span className="block text-xs font-normal text-muted-foreground">Included at No Extra Charge</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}