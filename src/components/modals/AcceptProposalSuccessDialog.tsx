'use client';

/**
 * File: src/components/modals/AcceptProposalSuccessDialog.tsx
 * Success dialog shown after accepting a proposal
 */
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertTriangle, PartyPopper } from 'lucide-react';

interface AcceptProposalSuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  status: 'success' | 'error';
  message: string;
}

export default function AcceptProposalSuccessDialog({
  isOpen,
  onClose,
  status,
  message
}: AcceptProposalSuccessDialogProps) {
  const title = status === 'success' ? 'Proposal Accepted!' : 'Acceptance Error';
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {status === 'success' ? (
              <>
                <PartyPopper className="h-5 w-5 text-green-500" />
                <span className="text-green-700">{title}</span>
              </>
            ) : (
              <>
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <span className="text-amber-700">{title}</span>
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {message}
          </DialogDescription>
        </DialogHeader>
        
        {status === 'success' && (
          <div className="py-3 px-4 bg-green-50 border border-green-100 rounded-md my-4">
            <p className="text-sm text-green-800">
              Our team will contact you soon to discuss the next steps of your pool journey!
            </p>
          </div>
        )}
        
        <DialogFooter className="mt-4">
          <Button 
            onClick={onClose}
            className={status === 'success' ? "bg-green-600 hover:bg-green-700" : ""}
          >
            {status === 'success' ? 'Close' : 'Try Again'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}