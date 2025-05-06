/**
 * File: src/components/SectionJumpSelect/SectionJumpSelect.tsx
 */
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SectionJumpSelectProps {
  value: string;
  sections: { id: string; name: string }[];
  onChange: (id: string) => void;
  className?: string;
}

export default function SectionJumpSelect({
  value,
  sections,
  onChange,
  className
}: SectionJumpSelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={`w-[200px] bg-white ${className || ''}`}>
        <SelectValue placeholder="Jump to section&" />
      </SelectTrigger>
      <SelectContent>
        {sections.map(section => (
          <SelectItem key={section.id} value={section.id}>
            {section.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}