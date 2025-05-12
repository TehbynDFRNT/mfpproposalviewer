'use client';

/**
 * File: src/components/modals/ChangeRequestSuccessDialog.tsx
 * Success dialog shown after submitting a change request
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
import { CheckCircle2, AlertTriangle } from 'lucide-react';

interface ChangeRequestSuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  status: 'success' | 'error';
  message: string;
}

export default function ChangeRequestSuccessDialog({
  isOpen,
  onClose,
  status,
  message
}: ChangeRequestSuccessDialogProps) {
  const title = status === 'success' ? 'Change Request Submitted' : 'Submission Error';
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {status === 'success' ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-500" />
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