import { Check } from 'lucide-react';

export default function IncludedChecklistCard({ 
  title, 
  tagline, 
  items 
}:{ 
  title: string; 
  tagline: string; 
  items: { name: string; benefit?: string }[] 
}) {
  return (
    <div className="w-full h-full p-5 overflow-y-auto shadow-lg bg-background rounded-lg">
      <h4 className="text-lg font-semibold mb-1">{title}</h4>
      <p className="text-sm text-muted-foreground mb-4">{tagline}</p>
      <ul className="space-y-2 text-sm leading-5">
        {items.map((i, idx) => (
          <li key={idx} className="flex gap-2">
            <Check className="h-4 w-4 text-[#DB9D6A]" />
            <span>
              <b>{i.name}</b>{i.benefit && ` – ${i.benefit}`}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-xs italic text-muted-foreground">All essentials included – no surprise extras.</p>
    </div>
  );
}