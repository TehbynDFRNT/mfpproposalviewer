/**
 * File: src/components/Footer/Footer.tsx
 */
import { Button } from '@/components/ui/button';
import SectionJumpSelect from "@/components/SectionJumpSelect/SectionJumpSelect";
import { ChevronUp, ChevronDown, CheckCircle, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import RequestChangesDialog from '@/components/modals/RequestChangesDialog';
import AcceptProposalDialog from '@/components/modals/AcceptProposalDialog';
import AcceptProposalSuccessDialog from '@/components/modals/AcceptProposalSuccessDialog';
import type { ProposalSnapshot } from '@/types/snapshot'; // <-- Import ProposalSnapshot type

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
  snapshot: ProposalSnapshot; // <-- Add snapshot to props
  onProposalAccepted?: () => void; // Callback when proposal is accepted
  onChangeRequestSuccess?: () => Promise<void>; // Callback for change request success
  onAcceptedStatusClick?: () => void; // Callback for accepted status button click
  onChangeRequestedStatusClick?: () => void; // Callback for change requested status button click
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
  children,
  snapshot, // <-- Destructure snapshot prop
  onProposalAccepted,
  onChangeRequestSuccess,
  onAcceptedStatusClick,
  onChangeRequestedStatusClick,
}: FooterProps) {
  // Lift success dialog state to the Footer level
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [successDialogStatus, setSuccessDialogStatus] = useState<'success' | 'error'>('success');
  const [successDialogMessage, setSuccessDialogMessage] = useState('');

  // Handler for when proposal is accepted
  const handleAcceptSuccess = () => {
    // Show success dialog
    setSuccessDialogStatus('success');
    setSuccessDialogMessage('Your proposal has been accepted! We will be in touch shortly to discuss next steps.');
    setSuccessDialogOpen(true);
    
    // Call parent callback
    if (onProposalAccepted) {
      onProposalAccepted();
    }
  };
  
  // Handler for when proposal acceptance fails
  const handleAcceptError = (errorMessage: string) => {
    // Show error dialog
    setSuccessDialogStatus('error');
    setSuccessDialogMessage(errorMessage || 'There was an error accepting your proposal. Please try again.');
    setSuccessDialogOpen(true);
  };
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 flex h-16
                 items-center justify-center lg:justify-end space-x-2 border-t
                 bg-[#F9F4F0] px-4 md:px-6 gap-4">
      {/*     mobile Skip-to bar     */}
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

      {/* Handle different proposal statuses */}
      {(() => {
        // Status-based rendering
        switch (snapshot.proposal_status) {
          case 'accepted':
            return (
              <>
                {/* Show status indicator for accepted proposals */}
                <Button 
                  variant="outline"
                  className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 cursor-pointer"
                  onClick={onAcceptedStatusClick}
                  aria-label="View acceptance details"
                >
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-green-800">
                    Proposal Accepted on {new Date(snapshot.accepted_datetime || '').toLocaleDateString()}
                  </span>
                </Button>
              </>
            );

          case 'change_requested':
            return (
              <>
                {/* Show status indicator for change requested proposals */}
                <Button 
                  variant="outline"
                  className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-md hover:bg-amber-100 cursor-pointer"
                  onClick={onChangeRequestedStatusClick}
                  aria-label="View change request details"
                >
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  <span className="text-sm font-medium text-amber-800">
                    Changes Requested on {new Date(snapshot.last_change_requested || '').toLocaleDateString()}
                  </span>
                </Button>

                {/* Hide the Accept Button for consistency with how we hide Request Changes button */}
              </>
            );

          default:
            // Default view for 'viewed' or other statuses
            return (
              <>
                {/* Show Request Changes button */}
                <RequestChangesDialog
                  sections={uniqueSections}
                  snapshot={snapshot}
                  onChangeRequestSuccess={onChangeRequestSuccess}
                />

                {/* Show Accept Proposal dialog */}
                <AcceptProposalDialog
                  snapshot={snapshot}
                  onAcceptSuccess={handleAcceptSuccess}
                  onAcceptError={handleAcceptError}
                />
              </>
            );
        }
      })()}
      
      {/* Success Dialog - Always rendered at Footer level */}
      <AcceptProposalSuccessDialog
        isOpen={successDialogOpen}
        onClose={() => setSuccessDialogOpen(false)}
        status={successDialogStatus}
        message={successDialogMessage}
      />
    </footer>
  );
}
