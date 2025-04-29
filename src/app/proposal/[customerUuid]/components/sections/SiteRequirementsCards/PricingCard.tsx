'use client';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Separator }          from '@/components/ui/separator';
import { subCardFade }       from '@/app/lib/animation';

type InstallationRequirement = {
  crane?:   { label: string; cost: number };
  bobcat?:  { label: string; cost: number };
  traffic?: { label: string; cost: number };
  custom:   { id: string; description: string; price: number }[];
  costSummary: { totalCost: number };
};

type ElectricalUI = {
  items:       { label: string; cost: number }[];
  costSummary: { totalCost: number };
};

interface PricingCardProps {
  siteRequirements: InstallationRequirement;
  electrical:       ElectricalUI;
}

export function PricingCard({
  siteRequirements: s,
  electrical:       e,
}: PricingCardProps) {
  const fmt = (n: number) =>
    n.toLocaleString('en-AU', { style: 'currency', currency: 'AUD' });

  return (
    <motion.div
      variants={subCardFade}
      initial="initial"
      animate="enter"
      exit="exit"
      className="w-full min-h-[80vh] py-4"
    >
      <div className="space-y-6 h-full overflow-y-auto">
        <Card className="w-full shadow-lg">
          <CardContent className="p-5 space-y-6">
            <header>
              <h3 className="text-base font-semibold">Pool Installation</h3>
              <p className="text-sm text-muted-foreground">
                Comprehensive site prep & electrical
              </p>
            </header>

            <Separator />

            <div className="space-y-3">
              {s.crane   && <Line label={`Crane (${s.crane.label})`}   value={s.crane.cost} />}
              {s.bobcat  && <Line label={`Bobcat (${s.bobcat.label})`} value={s.bobcat.cost} />}
              {s.traffic && <Line label={`Traffic (${s.traffic.label})`} value={s.traffic.cost} />}
              {s.custom.map(c => (
                <Line key={c.id} label={c.description} value={c.price} />
              ))}

              {e.items.length > 0 && (
                <>
                  <div className="pt-4">
                    <p className="text-sm font-medium mb-1">Electrical</p>
                    <Separator className="mb-1" />
                  </div>
                  {e.items.map((i, idx) => (
                    <Line key={idx} label={i.label} value={i.cost} />
                  ))}
                </>
              )}
            </div>

            <Separator />

            <div className="flex justify-between items-baseline">
              <p className="font-semibold">Total Installation Price</p>
              <p className="text-xl font-bold">
                {fmt(s.costSummary.totalCost + e.costSummary.totalCost)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

function Line({ label, value }: { label: string; value: number }) {
  const fmt = (n: number) =>
    n.toLocaleString('en-AU', { style: 'currency', currency: 'AUD' });
  return (
    <div className="flex justify-between">
      <p className="text-sm font-medium">{label}</p>
      <p className="font-medium whitespace-nowrap">{fmt(value)}</p>
    </div>
  );
}
