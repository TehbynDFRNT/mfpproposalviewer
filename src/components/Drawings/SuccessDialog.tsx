'use client';

/**
 * File: src/components/Drawings/SuccessDialog.tsx
 * Success dialog for displaying operation results
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
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface SuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  status: 'success' | 'error' | 'loading' | 'idle';
}

export function SuccessDialog({
  isOpen,
  onClose,
  title,
  message,
  status
}: SuccessDialogProps) {
  // Determine icon and colors based on status
  const icon = status === 'success' 
    ? <CheckCircle2 className="text-green-500" size={24} /> 
    : <AlertCircle className="text-amber-500" size={24} />;
  
  const dialogTitleClass = status === 'success' 
    ? "text-green-700" 
    : status === 'error' 
      ? "text-red-700"
      : "text-amber-700";
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className={`flex items-center gap-2 ${dialogTitleClass}`}>
            {icon}
            {title}
          </DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>
        
        <DialogFooter>
          <Button onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}