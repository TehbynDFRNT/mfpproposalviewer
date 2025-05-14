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
import { ProposalSnapshot } from '@/app/lib/types/snapshot';
import { isSectionEmpty } from '@/app/lib/utils';
import { CATEGORY_IDS } from '@/app/lib/constants';
import { trackProposalAccepted } from '@/app/lib/jitsuClient';

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

      // Track the proposal acceptance in Jitsu
      const { totalPrice, subtotals } = calculatePrices();
      trackProposalAccepted(snapshot.project_id, {
        customer_name: snapshot.customer_name,
        consultant_name: snapshot.consultant_name,
        pool_model: snapshot.spec_name,
        total_price: totalPrice,
        proposal_created_at: snapshot.created_at,
        proposal_last_modified: snapshot.updated_at,
        includes_extras: !isSectionEmpty(CATEGORY_IDS.ADD_ONS, snapshot),
        includes_fencing: !isSectionEmpty(CATEGORY_IDS.FENCING, snapshot),
        includes_water_feature: !isSectionEmpty(CATEGORY_IDS.WATER_FEATURE, snapshot),
        includes_retaining_walls: !isSectionEmpty(CATEGORY_IDS.RETAINING_WALLS, snapshot)
      });

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

  // Helper to format currency
  const fmt = (n: number | undefined | null) => {
    if (n === undefined || n === null) return 'N/A';
    return n.toLocaleString('en-AU', { style: 'currency', currency: 'AUD' });
  };

  // Calculate the total price and subtotals using the same logic as ProposalSummaryCards
  const calculatePrices = () => {
    if (!snapshot.project_id) return { totalPrice: 'N/A', subtotals: {} };

    // Fixed costs
    const fixedCosts = 6285;

    // Individual pool costs
    const individualPoolCosts =
      snapshot.pc_beam +
      snapshot.pc_coping_supply +
      snapshot.pc_coping_lay +
      snapshot.pc_salt_bags +
      snapshot.pc_trucked_water +
      snapshot.pc_misc +
      snapshot.pc_pea_gravel +
      snapshot.pc_install_fee;

    // Base cost and price
    const baseCost = snapshot.spec_buy_inc_gst + individualPoolCosts + fixedCosts;
    const marginPercent = snapshot.pool_margin_pct || 0;
    const basePoolPrice = marginPercent > 0
      ? baseCost / (1 - marginPercent / 100)
      : baseCost;

    // Site preparation costs
    const sitePrepCosts = snapshot.crane_cost +
      snapshot.bobcat_cost +
      (snapshot.dig_excavation_rate * snapshot.dig_excavation_hours) +
      (snapshot.dig_truck_rate * snapshot.dig_truck_hours * snapshot.dig_truck_qty) +
      snapshot.traffic_control_cost +
      snapshot.elec_total_cost;
    const installationTotal = marginPercent > 0
      ? sitePrepCosts / (1 - marginPercent / 100)
      : sitePrepCosts;

    // Filtration costs
    const filtrationBaseCost =
      snapshot.fp_pump_price +
      snapshot.fp_filter_price +
      snapshot.fp_sanitiser_price +
      snapshot.fp_light_price +
      (snapshot.fp_handover_kit_price || 0);
    const filtrationTotal = marginPercent > 0
      ? filtrationBaseCost / (1 - marginPercent / 100)
      : filtrationBaseCost;

    // Other costs
    const concreteTotal = (snapshot.concrete_cuts_cost || 0) +
      (snapshot.extra_paving_cost || 0) +
      (snapshot.existing_paving_cost || 0) +
      (snapshot.extra_concreting_saved_total || 0) +
      (snapshot.concrete_pump_total_cost || 0) +
      (snapshot.uf_strips_cost || 0);

    const fencingTotal = snapshot.fencing_total_cost || 0;
    const waterFeatureTotal = snapshot.water_feature_total_cost || 0;

    // Calculate extras total
    const cleanerCost = snapshot.cleaner_cost_price || 0;
    const heatPumpCost = (snapshot.heat_pump_cost || 0) + (snapshot.heat_pump_install_cost || 0);
    const blanketRollerCost = (snapshot.blanket_roller_cost || 0) + (snapshot.br_install_cost || 0);
    const extrasTotal = cleanerCost + heatPumpCost + blanketRollerCost;

    // Grand total
    const grandTotal = basePoolPrice +
      installationTotal +
      filtrationTotal +
      concreteTotal +
      fencingTotal +
      waterFeatureTotal +
      extrasTotal;

    return {
      totalPrice: fmt(grandTotal),
      subtotals: {
        basePool: {
          label: 'Base Pool',
          value: basePoolPrice,
          show: true, // Always show core sections
          sectionId: CATEGORY_IDS.POOL_SELECTION
        },
        installation: {
          label: 'Installation',
          value: installationTotal,
          show: true, // Always show core sections
          sectionId: CATEGORY_IDS.SITE_REQUIREMENTS
        },
        filtration: {
          label: 'Filtration',
          value: filtrationTotal,
          show: true, // Always show core sections
          sectionId: CATEGORY_IDS.FILTRATION_MAINTENANCE
        },
        concrete: {
          label: 'Concrete & Paving',
          value: concreteTotal,
          show: !isSectionEmpty(CATEGORY_IDS.CONCRETE_PAVING, snapshot),
          sectionId: CATEGORY_IDS.CONCRETE_PAVING
        },
        fencing: {
          label: 'Fencing',
          value: fencingTotal,
          show: !isSectionEmpty(CATEGORY_IDS.FENCING, snapshot),
          sectionId: CATEGORY_IDS.FENCING
        },
        waterFeature: {
          label: 'Water Feature',
          value: waterFeatureTotal,
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
          value: extrasTotal,
          show: !isSectionEmpty(CATEGORY_IDS.ADD_ONS, snapshot),
          sectionId: CATEGORY_IDS.ADD_ONS
        }
      }
    };
  };

  const { totalPrice, subtotals } = calculatePrices();

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
          <DialogTitle className="text-lg leading-none font-semibold">
            Accept Pool Proposal
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm mt-2">
            Please review the details before accepting your proposal.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2">
          <div className="space-y-4 my-4">
          <div className="bg-muted p-4 rounded-md">
            <h3 className="font-medium text-sm text-muted-foreground mb-1">
              Project Details
            </h3>
            <p className="font-medium">
              {snapshot.proposal_name || 'Pool Project'}
            </p>
            <p className="text-sm mb-2">
              {snapshot.site_address || snapshot.home_address || 'N/A'}
            </p>

            <div className="border-t border-border pt-3 space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-sm">Selected Pool:</span>
                <span className="font-medium">{snapshot.spec_name}</span>
              </div>

              {/* Always show core sections first */}
              {["basePool", "installation", "filtration"].map((key) => {
                const item = subtotals[key as keyof typeof subtotals];
                return item && item.show && (
                  <div key={key} className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">{item.label}:</span>
                    <span className="text-sm">{fmt(item.value)}</span>
                  </div>
                );
              })}

              {/* Then show optional sections if they're not empty (according to isSectionEmpty) */}
              {["concrete", "fencing", "waterFeature", "retainingWalls", "extras"].map((key) => {
                const item = subtotals[key as keyof typeof subtotals];
                return item && item.show && (
                  <div key={key} className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">{item.label}:</span>
                    <span className="text-sm">{fmt(item.value)}</span>
                  </div>
                );
              })}

              <div className="border-t border-border mt-2 pt-2 flex justify-between items-center">
                <span className="text-sm font-medium">Total Investment:</span>
                <span className="font-medium text-base">{totalPrice}</span>
              </div>
            </div>
          </div>

          {snapshot.pin && (
            <div className="space-y-3">
              <Separator className="my-3" />

              <Label htmlFor="pin-code" className="block text-center">
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
                      className={isPinError ? 'border-red-500' : isPinValid ? 'border-green-500' : ''}
                    />
                    <InputOTPSlot
                      index={1}
                      className={isPinError ? 'border-red-500' : isPinValid ? 'border-green-500' : ''}
                    />
                    <InputOTPSlot
                      index={2}
                      className={isPinError ? 'border-red-500' : isPinValid ? 'border-green-500' : ''}
                    />
                    <InputOTPSlot
                      index={3}
                      className={isPinError ? 'border-red-500' : isPinValid ? 'border-green-500' : ''}
                    />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              {isPinValid && (
                <div className="flex items-center justify-center gap-1 mt-1">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <p className="text-xs text-green-600 font-medium">PIN verified</p>
                </div>
              )}
              <p className="text-xs text-muted-foreground text-center">
                Enter the same PIN used to view the Proposal to Accept the Proposal.
              </p>

              <Separator className="my-3" />
            </div>
          )}

          <div className="flex items-start space-x-2">
            <Checkbox
              id="terms"
              checked={termsAccepted}
              onCheckedChange={(checked) => {
                if (typeof checked === 'boolean') {
                  setTermsAccepted(checked);
                }
              }}
            />
            <Label
              htmlFor="terms"
              className="text-sm font-normal leading-relaxed"
            >
              I accept the terms and conditions and understand that this constitutes a legally
              binding agreement. My pool project will proceed based on the details in this proposal.
            </Label>
          </div>

          {submitError && (
            <div className="p-3 text-sm bg-red-50 border border-red-200 rounded-md text-red-800">
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