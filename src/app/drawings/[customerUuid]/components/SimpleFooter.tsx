/**
 * File: src/app/drawings/components/SimpleFooter.tsx
 * Styled footer for the upload portal that matches the proposal footer's appearance
 */
import { useState } from 'react';
import type { ProposalSnapshot } from '@/app/lib/types/snapshot';
import { enableRenderReady, disableRenderReady } from "@/app/drawings/[customerUuid]/lib/renderStatusHandler";

// Import button without referencing components barrel
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from "@/app/drawings/[customerUuid]/lib/utils";
import { ConfirmToggleDialog } from "@/app/drawings/[customerUuid]/components/ConfirmToggleDialog";
import { SuccessDialog } from "@/app/drawings/[customerUuid]/components/SuccessDialog";

interface SimpleFooterProps {
  snapshot: ProposalSnapshot;
  is3DReady?: boolean;
  onStatusChange?: (message: string, status: 'success' | 'error' | 'loading' | 'idle') => void;
}

export default function SimpleFooter({
  snapshot,
  is3DReady = false,
  onStatusChange
}: SimpleFooterProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(snapshot.render_ready === true);
  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusTitle, setStatusTitle] = useState('');
  const [statusType, setStatusType] = useState<'success' | 'error' | 'loading' | 'idle'>('idle');

  // Show confirmation dialog
  const showConfirmDialog = () => {
    if (!snapshot.project_id) return;

    // If not already enabled, require is3DReady check
    if (!isComplete && !is3DReady) return;

    setDialogOpen(true);
  };

  // Handle actual render status change after confirmation
  const handleToggleRenderStatus = async () => {
    if (!snapshot.project_id) return;

    try {
      setIsSubmitting(true);
      setDialogOpen(false); // Close confirmation dialog immediately

      if (isComplete) {
        // Disable 3D visuals
        // Still call onStatusChange for backwards compatibility
        if (onStatusChange) {
          onStatusChange('Disabling 3D visuals for proposal...', 'loading');
        }

        const result = await disableRenderReady(snapshot.project_id);

        if (!result.success) {
          console.error('Error disabling 3D visuals:', result.message);

          // Set state for dialog
          setStatusTitle('Error Disabling 3D Visuals');
          setStatusMessage(`Failed to disable 3D visuals: ${result.message}`);
          setStatusType('error');
          setSuccessDialogOpen(true);

          // Also call onStatusChange for backwards compatibility
          if (onStatusChange) {
            onStatusChange(`Failed to disable 3D visuals: ${result.message}`, 'error');
          }

          setIsSubmitting(false);
          return;
        }

        setIsComplete(false);

        // Set state for success dialog
        setStatusTitle('3D Visuals Disabled');
        setStatusMessage('3D visuals have been disabled for this proposal. Viewers will now see the default visuals.');
        setStatusType('success');
        setSuccessDialogOpen(true);

        // Also call onStatusChange for backwards compatibility
        if (onStatusChange) {
          onStatusChange('3D visuals disabled for proposal. Viewers will now see the default visuals.', 'success');
        }
      } else {
        // Enable 3D visuals
        // Still call onStatusChange for backwards compatibility
        if (onStatusChange) {
          onStatusChange('Enabling 3D visuals for proposal...', 'loading');
        }

        const result = await enableRenderReady(snapshot.project_id);

        if (!result.success) {
          console.error('Error enabling 3D visuals:', result.message);

          // Set state for dialog
          setStatusTitle('Error Enabling 3D Visuals');
          setStatusMessage(`Failed to enable 3D visuals: ${result.message}`);
          setStatusType('error');
          setSuccessDialogOpen(true);

          // Also call onStatusChange for backwards compatibility
          if (onStatusChange) {
            onStatusChange(`Failed to enable 3D visuals: ${result.message}`, 'error');
          }

          setIsSubmitting(false);
          return;
        }

        setIsComplete(true);

        // Set state for success dialog
        setStatusTitle('3D Visuals Enabled');
        setStatusMessage('3D visuals have been enabled for this proposal! Viewers will now see your uploaded 3D content.');
        setStatusType('success');
        setSuccessDialogOpen(true);

        // Also call onStatusChange for backwards compatibility
        if (onStatusChange) {
          onStatusChange('3D visuals enabled for proposal! Viewers will now see your uploaded 3D content.', 'success');
        }
      }
    } catch (err) {
      console.error(`Unexpected error ${isComplete ? 'disabling' : 'enabling'} 3D visuals:`, err);

      // Set state for error dialog
      setStatusTitle('Unexpected Error');
      setStatusMessage(`An unexpected error occurred: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setStatusType('error');
      setSuccessDialogOpen(true);

      // Also call onStatusChange for backwards compatibility
      if (onStatusChange) {
        onStatusChange(`Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`, 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 flex h-16
                 items-center justify-center lg:justify-end space-x-2 border-t
                 bg-[#F9F4F0] px-4 md:px-6 gap-4">

      {/* Status indicator (center) - only shows when there's a status */}
      {is3DReady ? (
        <div className="hidden lg:flex items-center gap-2 text-green-600">
          <CheckCircle2 className="h-5 w-5" />
          <span className="text-sm font-medium">All required 3D renders uploaded</span>
        </div>
      ) : (
        <div className="hidden lg:flex items-center gap-2 text-amber-600">
          <span className="text-sm font-medium">Upload videos for all active sections to enable 3D visuals</span>
        </div>
      )}

      {/* Submit button (right side) - using default primary color */}
      <Button
        size="lg"
        onClick={showConfirmDialog}
        disabled={(!is3DReady && !isComplete) || isSubmitting}
        className={cn(
          isComplete ? "bg-green-600 hover:bg-green-700" : "",
          (!isComplete && is3DReady) || isComplete ? "cursor-pointer" : ""
        )}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {isComplete ? "Disabling..." : "Enabling..."}
          </>
        ) : isComplete ? (
          <>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Disable 3D Renders
          </>
        ) : (
          "Enable 3D Renders"
        )}
      </Button>

      {/* Confirmation Dialog */}
      <ConfirmToggleDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={handleToggleRenderStatus}
        isEnabling={!isComplete}
      />

      {/* Success/Error Dialog */}
      <SuccessDialog
        isOpen={successDialogOpen}
        onClose={() => setSuccessDialogOpen(false)}
        title={statusTitle}
        message={statusMessage}
        status={statusType}
      />
    </footer>
  );
}