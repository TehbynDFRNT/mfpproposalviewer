'use client';

/**
 * File: src/components/modals/AcceptProposalDialog.tsx
 * Dialog for accepting a proposal with PIN confirmation
 */
import React, { useState } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Separator } from '@/components/ui/separator';
import { Loader2, ThumbsUp, CheckCircle2, CheckCircle } from 'lucide-react';
import { ProposalSnapshot } from '@/types/snapshot';
import { isSectionEmpty } from '@/lib/utils';
import { CATEGORY_IDS } from '@/lib/constants';
import { useProposalAnalytics } from '@/hooks/use-proposal-analytics';
import { usePriceCalculator } from '@/hooks/use-price-calculator';

interface AcceptProposalDialogProps {
  snapshot: ProposalSnapshot;
  onAcceptSuccess: () => Promise<void> | void; // Callback to notify ProposalViewer of acceptance
  onAcceptError?: (errorMessage: string) => void; // Optional callback for error handling
}

export default function AcceptProposalDialog({ snapshot, onAcceptSuccess, onAcceptError }: AcceptProposalDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [pin, setPin] = useState('');
  const [isPinValid, setIsPinValid] = useState(false);  // Track if PIN is valid
  const [isPinError, setIsPinError] = useState(false);  // Track PIN error state for styling
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [proposalAccepted, setProposalAccepted] = useState(false);

  // Use the price calculator hook for consistent calculations
  const { fmt, breakdown } = usePriceCalculator(snapshot);
  
  // Use analytics hook for tracking events
  const analytics = useProposalAnalytics(snapshot);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Reset state when dialog is closed
      setTermsAccepted(false);
      setPin('');
      setIsPinValid(false);
      setIsPinError(false);
      setSubmitError(null);
    }
  };

  // Handle PIN input change
  const handlePinChange = (value: string) => {
    setPin(value);

    // Clear error state when user types
    setIsPinError(false);
    setSubmitError(null);

    // Check if PIN is valid
    if (value.length === 4) {
      if (snapshot.pin && value === snapshot.pin) {
        setIsPinValid(true);
      } else if (snapshot.pin && value !== snapshot.pin) {
        setIsPinError(true);
        setSubmitError('Incorrect PIN. Please try again.');
      }
    } else {
      setIsPinValid(false);
    }
  };

  const handleAcceptProposal = async () => {
    if (!termsAccepted) {
      setSubmitError('You must accept the terms and conditions');
      return;
    }

    if (snapshot.pin && (!pin || pin.length < 4)) {
      setIsPinError(true);
      setSubmitError('Please enter your complete 4-digit PIN code');
      return;
    }

    // Verify that the entered PIN matches the one in the snapshot
    if (snapshot.pin && !isPinValid) {
      setIsPinError(true);
      setSubmitError('Incorrect PIN. Please enter the PIN you used to view this proposal.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch('/api/accept-proposal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerUuid: snapshot.project_id,
          pin: pin,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.error || 'Failed to accept proposal';
        const errorDetails = data.details ? `: ${data.details}` : '';
        throw new Error(`${errorMessage}${errorDetails}`);
      }

      // Track the proposal acceptance using our centralized analytics hook
      analytics.trackAccept();

      // Close the main dialog
      setIsOpen(false);

      // Mark the proposal as accepted
      setProposalAccepted(true);

      // Notify parent component to update UI and show the success dialog
      // Since success dialog is now in parent, it won't be unmounted
      if (onAcceptSuccess) {
        onAcceptSuccess();
      }
    } catch (error) {
      console.error('Error accepting proposal:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to accept proposal';
      setSubmitError(errorMessage);

      // Call the error handler if provided
      if (onAcceptError) {
        onAcceptError(errorMessage);
      } else {
        console.error('Not calling onAcceptSuccess due to error state');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper for formatting potentially null/undefined values
  const safeFormat = (n: number | undefined | null) => {
    if (n === undefined || n === null) return 'N/A';
    return fmt(n);
  };

  // Get the total price and subtotals for the proposal dialog
  const getProposalBreakdown = () => {
    if (!snapshot.project_id) return { totalPrice: 'N/A', subtotals: {} };

    // Use the centralized breakdown from our usePriceCalculator hook
    return {
      totalPrice: fmt(breakdown.grandTotal),
      subtotals: {
        basePool: {
          label: 'Base Pool',
          value: breakdown.basePoolPrice,
          show: true, // Always show core sections
          sectionId: CATEGORY_IDS.POOL_SELECTION
        },
        installation: {
          label: 'Installation',
          value: breakdown.installationTotal,
          show: true, // Always show core sections
          sectionId: CATEGORY_IDS.SITE_REQUIREMENTS
        },
        filtration: {
          label: 'Filtration',
          value: breakdown.filtrationTotal,
          show: true, // Always show core sections
          sectionId: CATEGORY_IDS.FILTRATION_MAINTENANCE
        },
        concrete: {
          label: 'Concrete & Paving',
          value: breakdown.concreteTotal,
          show: !isSectionEmpty(CATEGORY_IDS.CONCRETE_PAVING, snapshot),
          sectionId: CATEGORY_IDS.CONCRETE_PAVING
        },
        fencing: {
          label: 'Fencing',
          value: breakdown.fencingTotal,
          show: !isSectionEmpty(CATEGORY_IDS.FENCING, snapshot),
          sectionId: CATEGORY_IDS.FENCING
        },
        waterFeature: {
          label: 'Water Feature',
          value: breakdown.waterFeatureTotal,
          show: !isSectionEmpty(CATEGORY_IDS.WATER_FEATURE, snapshot),
          sectionId: CATEGORY_IDS.WATER_FEATURE
        },
        retainingWalls: {
          label: 'Retaining Walls',
          value: snapshot.retaining_wall1_total_cost +
                 (snapshot.retaining_wall2_total_cost || 0) +
                 (snapshot.retaining_wall3_total_cost || 0) +
                 (snapshot.retaining_wall4_total_cost || 0),
          show: !isSectionEmpty(CATEGORY_IDS.RETAINING_WALLS, snapshot),
          sectionId: CATEGORY_IDS.RETAINING_WALLS
        },
        extras: {
          label: 'Extras & Add-ons',
          value: breakdown.extrasTotal,
          show: !isSectionEmpty(CATEGORY_IDS.ADD_ONS, snapshot),
          sectionId: CATEGORY_IDS.ADD_ONS
        }
      }
    };
  };

  const { totalPrice, subtotals } = getProposalBreakdown();

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          disabled={snapshot.proposal_status === 'accepted'}
        >
          Accept Quote
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] flex flex-col h-[600px] min-h-[550px] max-h-[85vh]">
        <DialogHeader className="flex-none">
          <DialogTitle className="text-xl leading-none font-semibold">
            Accept Pool Proposal
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-base mt-2 text-left">
            Please review the details before accepting your proposal.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2">
          <div className="space-y-4 my-4">
          <div className="bg-muted p-4 rounded-md">
            <h3 className="font-medium text-base text-muted-foreground mb-1">
              Project Details
            </h3>
            <p className="font-medium">
              {snapshot.proposal_name || 'Pool Project'}
            </p>
            <p className="text-base mb-2">
              {snapshot.site_address || snapshot.home_address || 'N/A'}
            </p>

            <div className="border-t border-border pt-3 space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-base">Selected Pool:</span>
                <span className="font-medium">{snapshot.spec_name}</span>
              </div>

              {/* Always show core sections first */}
              {["basePool", "installation", "filtration"].map((key) => {
                const item = subtotals[key as keyof typeof subtotals];
                return item && item.show && (
                  <div key={key} className="flex justify-between items-center">
                    <span className="text-base text-muted-foreground">{item.label}:</span>
                    <span className="text-base">{fmt(item.value)}</span>
                  </div>
                );
              })}

              {/* Then show optional sections if they're not empty (according to isSectionEmpty) */}
              {["concrete", "fencing", "waterFeature", "retainingWalls", "extras"].map((key) => {
                const item = subtotals[key as keyof typeof subtotals];
                return item && item.show && (
                  <div key={key} className="flex justify-between items-center">
                    <span className="text-base text-muted-foreground">{item.label}:</span>
                    <span className="text-base">{fmt(item.value)}</span>
                  </div>
                );
              })}

              <div className="border-t border-border mt-2 pt-2 flex justify-between items-center">
                <span className="text-base font-medium">Total Investment:</span>
                <span className="font-medium text-base">{totalPrice}</span>
              </div>
            </div>
          </div>

          <Separator className="mb-4" />
          
          <div className="flex items-start space-x-2">
            <Checkbox
              id="terms"
              className="mt-1.5"
              checked={termsAccepted}
              onCheckedChange={(checked) => {
                if (typeof checked === 'boolean') {
                  setTermsAccepted(checked);
                }
              }}
            />
            <Label
              htmlFor="terms"
              className="text-base font-normal leading-relaxed"
            >
              I understand I am requesting MFP to create a construction contract and construction site plan.
            </Label>
          </div>
          
          {snapshot.pin && (
            <div className="mt-4">
              <Separator className="mb-4" />
              
              <div className="bg-muted p-4 rounded-md space-y-3">
                <Label htmlFor="pin-code" className="block text-center text-base">
                  Please enter your 4-digit PIN code
                </Label>
                <div className="flex justify-center my-3">
                  <InputOTP
                    maxLength={4}
                    value={pin}
                    onChange={handlePinChange}
                    containerClassName="group"
                    disabled={isPinValid || isSubmitting}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot
                        index={0}
                        className={`bg-white ${isPinError ? 'border-red-500' : isPinValid ? 'border-green-500' : ''}`}
                      />
                      <InputOTPSlot
                        index={1}
                        className={`bg-white ${isPinError ? 'border-red-500' : isPinValid ? 'border-green-500' : ''}`}
                      />
                      <InputOTPSlot
                        index={2}
                        className={`bg-white ${isPinError ? 'border-red-500' : isPinValid ? 'border-green-500' : ''}`}
                      />
                      <InputOTPSlot
                        index={3}
                        className={`bg-white ${isPinError ? 'border-red-500' : isPinValid ? 'border-green-500' : ''}`}
                      />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                {isPinValid && (
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <p className="text-base text-green-600 font-medium">PIN verified</p>
                  </div>
                )}
                <p className="text-base text-muted-foreground text-center">
                  Enter the same PIN used to view the Proposal to Accept the Proposal.
                </p>
              </div>
            </div>
          )}

          {submitError && (
            <div className="p-3 text-base bg-red-50 border border-red-200 rounded-md text-red-800">
              {submitError}
            </div>
          )}
        </div>
        </div>

        <DialogFooter className="flex-none flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAcceptProposal}
            className="bg-green-600 hover:bg-green-700 text-white font-medium"
            disabled={isSubmitting || !termsAccepted || (Boolean(snapshot.pin) && !isPinValid)}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <ThumbsUp className="mr-2 h-4 w-4" />
                Accept Proposal
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}