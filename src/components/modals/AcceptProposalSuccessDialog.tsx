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
import { CheckCircle2, AlertTriangle, PartyPopper, ThumbsUp, CheckCircle, Phone } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

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
      <DialogContent className="sm:max-w-[500px] flex flex-col h-[600px] min-h-[550px] max-h-[85vh]">
        {status === 'success' ? (
          <>
            <DialogHeader className="flex-none pb-2">
              <DialogTitle className="text-lg leading-none font-semibold flex items-center gap-2">
                <PartyPopper className="h-5 w-5 text-green-500" />
                <span className="text-green-700">Congratulations!</span>
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-base mt-2">
                Your pool proposal has been accepted successfully.
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4 mt-1 mb-2 shadow-[0_-4px_6px_-2px_rgba(0,0,0,0.05)_inset] pt-2">
              <div className="bg-green-50 p-5 rounded-md border border-green-100 text-center">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
                <h3 className="text-xl font-semibold text-green-800 mb-1">Your Pool Journey Begins!</h3>
                <p className="text-green-700">
                  We've received your acceptance and will be in touch shortly to begin the next steps of your pool project.
                </p>
              </div>

              <div className="p-4 bg-muted rounded-md">
                <h4 className="font-medium mb-2">What happens next?</h4>
                <ul className="space-y-3 text-base">
                  <li className="flex items-center gap-3">
                    <span className="flex-shrink-0 h-6 w-6 bg-[#DB9D6A] rounded-full flex items-center justify-center text-white font-medium text-base">1</span>
                    <p>Our team will contact you within 1-2 business days</p>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="flex-shrink-0 h-6 w-6 bg-[#DB9D6A] rounded-full flex items-center justify-center text-white font-medium text-base">2</span>
                    <p>We'll schedule a final consultation to review your project details</p>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="flex-shrink-0 h-6 w-6 bg-[#DB9D6A] rounded-full flex items-center justify-center text-white font-medium text-base">3</span>
                    <p>Construction planning and timeline will be prepared</p>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="flex-shrink-0 h-6 w-6 bg-[#DB9D6A] rounded-full flex items-center justify-center text-white font-medium text-base">4</span>
                    <p>Your dream pool journey officially begins!</p>
                  </li>
                </ul>
              </div>
              
            </div>
          </>
        ) : (
          <>
            <DialogHeader className="flex-none pb-2">
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <span className="text-amber-700">{title}</span>
              </DialogTitle>
              <DialogDescription>
                {message}
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex-1 overflow-y-auto pr-2 mt-1 mb-2 shadow-[0_-4px_6px_-2px_rgba(0,0,0,0.05)_inset] pt-2">
              <div className="py-3 px-4 bg-amber-50 border border-amber-100 rounded-md">
                <p className="text-base text-amber-800">
                  Please try again or contact our support team if the issue persists.
                </p>
              </div>
            </div>
          </>
        )}
        
        <DialogFooter className="flex-none mt-2 pt-2 border-t">
          {status === 'success' ? (
            <div className="w-full flex flex-col items-center">
              <a href="tel:1300306011" aria-label="Call 1300 306 011" className="w-full">
                <Button variant="secondary" className="flex items-center justify-center gap-2 w-full" aria-label="Call Us">
                  <Phone className="h-4 w-4" />
                  <span>1300 306 011</span>
                </Button>
              </a>
              <p className="text-xs text-muted-foreground mt-2 text-center">Call us if you have any questions about your pool project</p>
            </div>
          ) : (
            <Button onClick={onClose}>Try Again</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}