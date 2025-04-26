import { Button } from '@/components/ui/button';
import SectionJumpSelect from '../SectionJumpSelect/SectionJumpSelect';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

interface FooterProps {
  activeSection: string;
  uniqueSections: { id: string; name: string }[];
  handleSectionSelectChange: (value: string) => void;
  progressPercent: number;
  machineState: any;
  canGoPrev: (state: any) => boolean;
  canGoNext: (state: any) => boolean;
  handlePrev: () => void;
  handleNext: () => void;
  children?: React.ReactNode;
}

export default function Footer({
  activeSection,
  uniqueSections,
  handleSectionSelectChange,
  progressPercent,
  machineState,
  canGoPrev,
  canGoNext,
  handlePrev,
  handleNext,
  children
}: FooterProps) {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 flex h-16
                 items-center justify-center lg:justify-end space-x-2 border-t
                 bg-[#F9F4F0] px-4 md:px-6 gap-4">
      {/*  mobile Skip-to bar  */}
      <div className="absolute top-0 left-0 right-0 lg:hidden
           -translate-y-full flex items-center justify-between gap-2
           w-full px-4 py-2 bg-white/90 backdrop-blur-sm
           border-t border-b border-border/50 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-[#DB9D6A]">Skip&nbsp;to:</span>
          <SectionJumpSelect 
            value={activeSection} 
            sections={uniqueSections} 
            onChange={handleSectionSelectChange} 
          />
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-full bg-white" 
            onClick={handlePrev}
            disabled={!canGoPrev(machineState)}
          >
            <ChevronUp className="h-5 w-5 text-[#DB9D6A]" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-full bg-white" 
            onClick={handleNext}
            disabled={!canGoNext(machineState)}
          >
            <ChevronDown className="h-5 w-5 text-[#DB9D6A]" />
          </Button>
        </div>
      </div>
            
      {/* Progress indicator */}
      <motion.div
        className="absolute top-0 left-0 h-1 bg-[#1DA1F2]"   /* blue bar */
        animate={{ width: `${progressPercent}%` }}
        transition={{ ease: 'easeOut', duration: 0.2 }}
      />
      
      {/* Additional children if provided */}
      {children}
      
      <Button variant="destructive" size="lg">Request Changes</Button>
      <Button size="lg">Accept Quote</Button>
    </footer>
  );
}