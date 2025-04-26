import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Image from "next/image";
import type { ProposalData } from '@/types/proposal';

export default function FiltrationMaintenanceCards() {
  // Filtration and Maintenance items
  const filtrationItems = [
    {name: 'Energy-saving Pureswim pump', benefit: 'cuts running costs by up to 70%', icon: 'Zap', price: 930.04, sku: 'Theraflo TVS 1.25 hp'},
    {name: 'Oversize cartridge filter', benefit: 'fewer cleans, crystal clear water', icon: 'Filter', price: 567.68, sku: 'Theraclear 180 SQF Cartridge'},
    {name: 'Smart chlorinator', benefit: 'automatic, reliable sanitation', icon: 'Droplet', price: 981.85, sku: 'VP25 – Vapure 25 G'},
    {name: 'Multi-colour LED light', benefit: 'creates stunning night-time ambience', icon: 'Sun', price: 396.0, sku: 'Premium LED Light'}
  ];

  return (
    <div className="space-y-6 h-full overflow-y-auto">
      {/* Main Filtration Equipment Card */}
      <Card className="w-full shadow-lg">
        <CardContent className="p-5 space-y-6">
          <div className="mb-2">
            <h3 className="text-base font-semibold">Pool Filtration Package – Premium</h3>
            <p className="text-sm text-muted-foreground">Crystal-clear water with minimal maintenance</p>
          </div>
          
          <Separator className="mb-4" />
          
          {/* Premium Filtration Type (Fixed) */}
          <div className="mb-4">
            <div className="flex items-center">
              <p className="text-sm font-medium">Premium Filtration System</p>
              <span className="ml-2 text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">Recommended</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">High-efficiency filtration with extended warranty</p>
          </div>
          
          {/* Filtration equipment list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtrationItems.map((item, idx) => (
              <div key={idx} className="flex flex-col">
                <p className="text-sm font-medium leading-tight">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.sku}</p>
                <p className="text-xs text-muted-foreground">{item.benefit}</p>
              </div>
            ))}
          </div>
          
          <Separator className="mb-3" />
          
          {/* Grand total */}
          <div className="flex justify-between items-baseline mt-1">
            <p className="font-semibold">Equipment Price</p>
            <p className="text-xl font-bold">$2,875.57</p>
          </div>
          
        </CardContent>
      </Card>
      
      {/* VIP Handover Kit Card */}
      <Card className="p-4 overflow-y-auto shadow-lg">
        <CardContent className="px-2 flex items-center h-full">
          <div className="flex flex-row items-center w-full">
            {/* Left: VIP graphic */}
            <div className="flex-shrink-0 pr-4 flex items-center justify-center h-full">
              <Image
                src="/_opt/StartUpPack.webp"
                alt="Premium Mineral Start-up Kit"
                className="w-16 h-16 rounded-md object-contain"
                width={64}
                height={64}
              />
            </div>

            {/* Right: copy & value points */}
            <div className="flex-grow">
              <h3 className="text-base font-semibold mb-1 flex items-center">
                1 Year Mineral Supply
                <span className="ml-2 inline-block text-xs font-bold px-2 py-0.5 rounded-full bg-yellow-400/80 text-yellow-900">
                  VIP
                </span>
              </h3>

              <p className="text-sm mb-3">12-month water minerals with testing kit.</p>
              
              <p className="mt-2 text-sm font-bold">
                Valued At <span className="text-green-700">$480.00</span>
                <span className="block text-xs font-normal text-muted-foreground">Included at No Extra Charge</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Daily Clean Kit VIP Card */}
      <Card className="p-4 overflow-y-auto shadow-lg">
        <CardContent className="px-2 flex items-center h-full">
          <div className="flex flex-row items-center w-full">
            {/* Left: VIP graphic */}
            <div className="flex-shrink-0 pr-4 flex items-center justify-center h-full">
              <Image
                src="/_opt/Handoverkit.webp"
                alt="Daily Clean Kit"
                className="w-16 h-16 rounded-md object-contain"
                width={64}
                height={64}
              />
            </div>

            {/* Right: copy & value points */}
            <div className="flex-grow">
              <h3 className="text-base font-semibold mb-1 flex items-center">
                Daily Clean Kit
                <span className="ml-2 inline-block text-xs font-bold px-2 py-0.5 rounded-full bg-yellow-400/80 text-yellow-900">
                  VIP
                </span>
              </h3>

              <p className="text-sm mb-3">Skimmer, brush, vacuum head and telescopic pole.</p>
              
              <p className="mt-2 text-sm font-bold">
                Valued At <span className="text-green-700">$320.00</span>
                <span className="block text-xs font-normal text-muted-foreground">Included at No Extra Charge</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}