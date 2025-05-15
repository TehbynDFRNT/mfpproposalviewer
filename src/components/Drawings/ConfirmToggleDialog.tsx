'use client';

/**
 * File: src/app/drawings/[customerUuid]/components/ConfirmToggleDialog.tsx
 * Confirmation dialog for enabling/disabling 3D renders
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
import { AlertTriangle } from 'lucide-react';

interface ConfirmToggleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isEnabling: boolean;
}

export function ConfirmToggleDialog({
  isOpen,
  onClose,
  onConfirm,
  isEnabling
}: ConfirmToggleDialogProps) {
  // Customize content based on whether enabling or disabling
  const title = isEnabling 
    ? "Enable 3D Renders" 
    : "Disable 3D Renders";
  
  const description = isEnabling
    ? "This will enable 3D renders for this proposal. All viewers will see your custom 3D content instead of the default visuals."
    : "This will disable the custom 3D renders for this proposal. All viewers will see the default visuals instead of your uploaded content.";
  
  const confirmButtonText = isEnabling
    ? "Enable 3D Renders"
    : "Disable 3D Renders";
  
  const confirmButtonClass = isEnabling
    ? ""  // Use default primary color for enabling
    : "bg-amber-500 hover:bg-amber-600"; // Use amber for disabling

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className={isEnabling ? "text-blue-500" : "text-amber-500"} size={18} />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        
        <div className="py-2">
          <p className="text-sm text-gray-600">
            {isEnabling 
              ? "Make sure all your 3D renders are correctly uploaded before enabling."
              : "You can re-enable 3D renders at any time."
            }
          </p>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button className={confirmButtonClass} onClick={onConfirm}>
            {confirmButtonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}