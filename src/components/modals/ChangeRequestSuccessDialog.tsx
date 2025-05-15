'use client';

/**
 * File: src/components/modals/ChangeRequestSuccessDialog.tsx
 * Success dialog shown after submitting a change request
 */
import React, { useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertTriangle, Wrench, Square, Layers, BarChart2, Filter, Star, ShieldCheck, Droplets, Hammer, Waves, Phone } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { CATEGORY_IDS, CATEGORY_NAMES } from '@/lib/constants';
import type { ProposalSnapshot } from '@/types/snapshot';

interface ChangeRequestSuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  status: 'success' | 'error';
  message: string;
  snapshot?: ProposalSnapshot | null;
}

export default function ChangeRequestSuccessDialog({
  isOpen,
  onClose,
  status,
  message,
  snapshot
}: ChangeRequestSuccessDialogProps) {
  // Disable console logging for production
  const isDev = process.env.NODE_ENV === 'development';
  
  // Set title based on status
  const title = status === 'success' ? 'Changes Requested' : 'Submission Error';

  // Parse change request JSON if available
  const changeRequest = useMemo(() => {
    // Only log in development
    if (isDev) {
      console.log('Change request JSON:', snapshot?.change_request_json);
      console.log('Typeof change_request_json:', typeof snapshot?.change_request_json);
    }
    
    if (!snapshot?.change_request_json) return null;
    
    try {
      // If it's already an object, use it directly
      if (typeof snapshot.change_request_json === 'object' && !Array.isArray(snapshot.change_request_json)) {
        console.log('Using direct object');
        return snapshot.change_request_json;
      }
      
      // Handle string format JSON
      const jsonStr = snapshot.change_request_json as string;
      
      // First try direct parsing
      try {
        if (isDev) console.log('Trying direct JSON.parse');
        const parsed = JSON.parse(jsonStr);
        if (isDev) console.log('Direct parse succeeded:', parsed);
        return parsed;
      } catch (parseError) {
        if (isDev) console.log('Direct parse failed, trying with cleanup');
        
        // If parsing fails, check for escaped quotes format
        if (jsonStr.includes('\\\"') || jsonStr.includes('\\"')) {
          if (isDev) console.log('Found escaped quotes, cleaning string');
          
          // Replace all escaped quotes with regular quotes
          let cleanedStr = jsonStr.replace(/\\"/g, '"');
          
          // If the string is wrapped in quotes, remove them
          if (cleanedStr.startsWith('"') && cleanedStr.endsWith('"')) {
            if (isDev) console.log('Removing outer quotes');
            cleanedStr = cleanedStr.slice(1, -1);
          }
          
          try {
            if (isDev) console.log('Parsing cleaned string');
            const cleaned = JSON.parse(cleanedStr);
            if (isDev) console.log('Clean parse succeeded:', cleaned);
            return cleaned;
          } catch (cleanError) {
            if (isDev) console.error('Clean parse failed:', cleanError);
            
            // Last attempt: try a regex approach to extract sections
            const sectionsMatch = jsonStr.match(/sections":\[(.*?)\]/);
            if (sectionsMatch && sectionsMatch[1]) {
              if (isDev) console.log('Using regex fallback to extract sections');
              const sectionsStr = sectionsMatch[1];
              // Extract section names from the string
              const sectionNames = sectionsStr.match(/\"([^\"]+)\"/g);
              if (sectionNames) {
                return {
                  sections: sectionNames.map(s => s.replace(/\"/g, ''))
                };
              }
            }
          }
        }
        
        throw parseError;
      }
    } catch (error) {
      if (isDev) {
        console.error('All parsing methods failed:', error);
        console.error('Raw value was:', snapshot?.change_request_json);
      }
      return null;
    }
  }, [snapshot?.change_request_json]);
  
  // Extract sections from change request
  const requestedSections = useMemo(() => {
    if (isDev) console.log('Extracted change request object:', changeRequest);
    if (!changeRequest?.sections) return [];
    
    // Make sure we're working with an array of section IDs
    const sections = Array.isArray(changeRequest.sections) ? changeRequest.sections : [];
    if (isDev) console.log('Extracted sections:', sections);
    
    return sections;
  }, [changeRequest]);
  
  // Get answers from change request (for future reference if needed)
  const answers = useMemo(() => {
    return changeRequest?.answers || {};
  }, [changeRequest]);
  
  // Helper function to get the icon for a section (mirrored from RequestChangesDialog)
  const getSectionIcon = (sectionId: string) => {
    switch (sectionId) {
      case CATEGORY_IDS.POOL_SELECTION:
        return <Waves className="h-5 w-5 text-[#DB9D6A]" />;
      case CATEGORY_IDS.CONCRETE_PAVING:
        return <Layers className="h-5 w-5 text-[#DB9D6A]" />;
      case CATEGORY_IDS.FENCING:
        return <BarChart2 className="h-5 w-5 text-[#DB9D6A]" />;
      case CATEGORY_IDS.FILTRATION_MAINTENANCE:
        return <Filter className="h-5 w-5 text-[#DB9D6A]" />;
      case CATEGORY_IDS.ADD_ONS:
        return <Star className="h-5 w-5 text-[#DB9D6A]" />;
      case CATEGORY_IDS.RETAINING_WALLS:
        return <Hammer className="h-5 w-5 text-[#DB9D6A]" />;
      case CATEGORY_IDS.WATER_FEATURE:
        return <Droplets className="h-5 w-5 text-[#DB9D6A]" />;
      case CATEGORY_IDS.SITE_REQUIREMENTS:
        return <Wrench className="h-5 w-5 text-[#DB9D6A]" />;
      default:
        return null;
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] flex flex-col h-[600px] min-h-[550px] max-h-[85vh]">
        {status === 'success' ? (
          <>
            <DialogHeader className="flex-none pb-2">
              <DialogTitle className="text-lg leading-none font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-blue-500" />
                <span className="text-blue-600">{title}</span>
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-base mt-2">
                Your change request has been successfully submitted.
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4 mt-1 mb-2 shadow-[0_-4px_6px_-2px_rgba(0,0,0,0.05)_inset] pt-2">
              <div className="p-5 rounded-md border border-muted">
                <h3 className="text-base font-semibold mb-3">What happens next?</h3>
                <ul className="space-y-3 text-base">
                  <li className="flex items-center gap-3">
                    <span className="flex-shrink-0 h-6 w-6 bg-[#DB9D6A] rounded-full flex items-center justify-center text-white font-medium text-base">1</span>
                    <p>Our team will review your change request within 1-2 business days</p>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="flex-shrink-0 h-6 w-6 bg-[#DB9D6A] rounded-full flex items-center justify-center text-white font-medium text-base">2</span>
                    <p>We'll contact you to discuss the requested modifications</p>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="flex-shrink-0 h-6 w-6 bg-[#DB9D6A] rounded-full flex items-center justify-center text-white font-medium text-base">3</span>
                    <p>An updated proposal will be prepared reflecting your changes</p>
                  </li>
                </ul>
              </div>

              <div className="p-4 border border-muted rounded-md">
                <h4 className="font-medium mb-2 text-muted-foreground text-base">Requested Changes</h4>
                <div className="space-y-1">
                  {requestedSections && requestedSections.length > 0 ? (
                    // Show only the sections from the change request JSON
                    requestedSections.map((sectionId: string) => (
                      <div key={sectionId} className="flex items-center space-x-2 text-base py-1 px-2 rounded-sm hover:bg-muted/50">
                        {getSectionIcon(sectionId)}
                        <span>{CATEGORY_NAMES[sectionId] || 'Unknown Section'}</span>
                      </div>
                    ))
                  ) : (
                    // Fallback message if no sections were specified
                    <div className="text-sm text-muted-foreground py-1">
                      General changes requested without specific sections.
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-3">Note: Changes may affect your quote price and project timeline</p>
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
              <p className="text-xs text-muted-foreground mt-2 text-center">Call us if you have any questions about your requested changes</p>
            </div>
          ) : (
            <Button onClick={onClose}>Try Again</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}