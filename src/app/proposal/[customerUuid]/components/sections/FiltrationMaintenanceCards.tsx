'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import type { FiltrationPackage } from '@/app/lib/types/snapshot';

export default function FiltrationMaintenanceCards(
  { pkg }: { pkg: FiltrationPackage | null }
) {
  /* ── flatten what the DB gave us ───────────────────── */
  const items = [
    {
      name : pkg?.pump?.name,
      sku  : pkg?.pump?.model_number,
      price: pkg?.pump?.price ?? 0,
      benefit: 'cuts running costs by up to 70 %',
    },
    {
      name : pkg?.filter?.name,
      sku  : pkg?.filter?.model_number,
      price: pkg?.filter?.price ?? 0,
      benefit: 'fewer cleans, crystal-clear water',
    },
    {
      name : pkg?.sanitiser?.name,
      sku  : pkg?.sanitiser?.model_number,
      price: pkg?.sanitiser?.price ?? 0,
      benefit: 'automatic, reliable sanitation',
    },
    {
      name : pkg?.light?.name,
      sku  : pkg?.light?.model_number,
      price: pkg?.light?.price ?? 0,
      benefit: 'creates stunning night-time ambience',
    },
  ].filter(i => i.name);          // ignore null rows

  const equipmentTotal = items.reduce((t, i) => t + i.price, 0);
  const fmt = (n: number) =>
    n.toLocaleString('en-AU', { style: 'currency', currency: 'AUD' });

  /* ── render ─────────────────────────────────────────── */
  return (
    <div className="space-y-6 h-full overflow-y-auto">

      {/* Main Filtration Equipment Card */}
      <Card className="w-full shadow-lg">
        <CardContent className="p-5 space-y-6">
          <header>
            <h3 className="text-base font-semibold">
              Pool Filtration Package
            </h3>
            <p className="text-sm text-muted-foreground">
              Crystal-clear water with minimal maintenance
            </p>
          </header>

          <Separator className="mb-4" />

          {/* equipment list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {items.map((item, idx) => (
              <div key={idx} className="flex flex-col">
                <p className="text-sm font-medium leading-tight">{item.name}</p>
                {item.sku && (
                  <p className="text-xs text-muted-foreground">{item.sku}</p>
                )}
                <p className="text-xs text-muted-foreground">{item.benefit}</p>
              </div>
            ))}
          </div>

          <Separator className="mb-3" />

          {/* Grand total */}
          <div className="flex justify-between items-baseline mt-1">
            <p className="font-semibold">Equipment Price</p>
            <p className="text-xl font-bold">{fmt(equipmentTotal)}</p>
          </div>
        </CardContent>
      </Card>

      {/* ── VIP cards are purely marketing, leave static ── */}
      {/* 1 Year Mineral Supply */}
      <VipCard
        img="/_opt/StartUpPack.webp"
        title="1 Year Mineral Supply"
        blurb="12-month water minerals with testing kit."
        rrp="480.00"
      />

      {/* Daily Clean Kit */}
      <VipCard
        img="/_opt/Handoverkit.webp"
        title="Daily Clean Kit"
        blurb="Skimmer, brush, vacuum head and telescopic pole."
        rrp="320.00"
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* reusable tiny VIP component                                         */
/* ------------------------------------------------------------------ */
function VipCard(
  { img, title, blurb, rrp }: { img: string; title: string;
    blurb: string; rrp: string; }
) {
  return (
    <Card className="p-4 overflow-y-auto shadow-lg">
      <CardContent className="px-2 flex items-center h-full">
        <div className="flex flex-row items-center w-full">
          <div className="flex-shrink-0 pr-4 flex items-center justify-center">
            <Image src={img} alt={title} width={64} height={64}
                   className="w-16 h-16 rounded-md object-contain" />
          </div>

          <div className="flex-grow">
            <h3 className="text-base font-semibold mb-1 flex items-center">
              {title}
              <span className="ml-2 inline-block text-xs font-bold
                               px-2 py-0.5 rounded-full bg-yellow-400/80
                               text-yellow-900">
                VIP
              </span>
            </h3>

            <p className="text-sm mb-3">{blurb}</p>

            <p className="text-sm font-bold">
              Valued At&nbsp;
              <span className="text-green-700">${rrp}</span>
              <span className="block text-xs font-normal text-muted-foreground">
                Included at No Extra Charge
              </span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}