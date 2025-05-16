/*/Users/tehbynnova/Code/MyProjects/Web/MFPProposalViewer/src/components/modals/RequestChangesDialog.tsx*/
import React, { useState, useMemo } from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { CheckIcon, Wrench, Square, Layers, BarChart2, Filter, Star, ShieldCheck, Handshake, Droplets, Hammer, Waves, Loader2 } from 'lucide-react';
import { flows } from '@/lib/flows';
import { FlowQuestion } from '@/types/questionnaire';
import type { ProposalSnapshot } from '@/types/snapshot';
import { CATEGORY_IDS, CATEGORY_NAMES } from '@/lib/constants';
import ChangeRequestSuccessDialog from "@/components/modals/ChangeRequestSuccessDialog";
import { useProposalAnalytics } from '@/hooks/use-proposal-analytics';

interface Section {
  id: string;
  name: string;
}

interface ChangeRequestDialogProps {
  sections: Section[];
  snapshot: ProposalSnapshot | null;
  onChangeRequestSuccess?: () => Promise<void>; // Add callback for refreshing data
}

export default function ChangeRequestDialog({ sections, snapshot, onChangeRequestSuccess }: ChangeRequestDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'select'|'questions'>('select');
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [flow, setFlow] = useState<FlowQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [successDialogStatus, setSuccessDialogStatus] = useState<'success' | 'error'>('success');
  const [successDialogMessage, setSuccessDialogMessage] = useState('');
  
  // Use analytics hook for tracking events
  const analytics = useProposalAnalytics(snapshot || {} as ProposalSnapshot);


  const filteredSections = useMemo(() =>
    sections.filter(s =>
      s.id !== CATEGORY_IDS.CUSTOMER_INFO &&
      s.id !== CATEGORY_IDS.PROPOSAL_SUMMARY &&
      s.id !== CATEGORY_IDS.SITE_REQUIREMENTS &&
      s.id !== CATEGORY_IDS.FILTRATION_MAINTENANCE
    ), [sections]
  );
  
  // Helper function to get the icon for a section
  const getSectionIcon = (sectionId: string) => {
    switch (sectionId) {
      case CATEGORY_IDS.POOL_SELECTION:
        return <Waves className="h-4 w-4 text-[#DB9D6A]" />;
      case CATEGORY_IDS.CONCRETE_PAVING:
        return <Layers className="h-4 w-4 text-[#DB9D6A]" />;
      case CATEGORY_IDS.FENCING:
        return <BarChart2 className="h-4 w-4 text-[#DB9D6A]" />;
      case CATEGORY_IDS.FILTRATION_MAINTENANCE:
        return <Filter className="h-4 w-4 text-[#DB9D6A]" />;
      case CATEGORY_IDS.ADD_ONS:
        return <Star className="h-4 w-4 text-[#DB9D6A]" />;
      case CATEGORY_IDS.RETAINING_WALLS:
        return <Hammer className="h-4 w-4 text-[#DB9D6A]" />;
      case CATEGORY_IDS.WATER_FEATURE:
        return <Droplets className="h-4 w-4 text-[#DB9D6A]" />;
      case CATEGORY_IDS.SITE_REQUIREMENTS:
        return <Wrench className="h-4 w-4 text-[#DB9D6A]" />;
      default:
        return null;
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Reset all state when closing the dialog
      setStep('select');
      setSelectedSections([]);
      setAnswers({});
      setFlow([]);
      setIndex(0);
    }
  };

  const toggleSection = (id: string) => {
    setSelectedSections(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const startQuestions = () => {
    const q = selectedSections.flatMap(sec => flows[sec] || []);

    // Initialize add-ons selection if Add-Ons section is selected
    if (selectedSections.includes(CATEGORY_IDS.ADD_ONS) && snapshot) {
      const currentAddOns: string[] = [];

      // Check which add-ons are included in the proposal
      if (snapshot.cleaner_included) {
        currentAddOns.push('pool_cleaner');
      }

      if (snapshot.include_heat_pump) {
        currentAddOns.push('heat_pump');
      }

      if (snapshot.include_blanket_roller) {
        currentAddOns.push('blanket_roller');
      }

      // Pre-select these in the answers
      setAnswers(prev => ({
        ...prev,
        'addOns_remove': currentAddOns
      }));
    }

    // Add a final confirmation screen
    q.push({
      id: 'final_submission',
      text: 'Review and submit',
      type: 'TEXT' // Keep as TEXT type but we'll handle it differently in the UI
    });

    let first = 0;
    while (first < q.length) {
      const dep = q[first].dependsOn;
      if (dep && !dep(answers)) {
        first++;
        continue;
      }
      break;
    }
    setFlow(q);
    setIndex(first);
    setStep('questions');
  };

  const handleAnswer = (q: FlowQuestion, value: any) => {
    setAnswers(prev => ({ ...prev, [q.id]: value }));
  };

  const handleNext = () => {
    let next = index + 1;
    while (next < flow.length) {
      const dep = flow[next].dependsOn;
      if (dep && !dep(answers)) {
        next++;
        continue;
      }
      break;
    }
    if (next < flow.length) {
      setIndex(next);
    } else {
      // Process add-on removal data if needed
      if (selectedSections.includes(CATEGORY_IDS.ADD_ONS) && snapshot) {
        // Create a simple object showing which add-ons to remove
        const addOnChanges = {
          remove_cleaner: snapshot.cleaner_included &&
            !answers['addOns_remove']?.includes('pool_cleaner'),

          remove_heat_pump: snapshot.include_heat_pump &&
            !answers['addOns_remove']?.includes('heat_pump'),

          remove_blanket_roller: snapshot.include_blanket_roller &&
            !answers['addOns_remove']?.includes('blanket_roller')
        };

        // Merge with the answers
        answers.addOnChanges = addOnChanges;
      }

      // Submit the change request to the backend
      submitChangeRequest();
    }
  };

  const handleBack = () => {
    let prev = index - 1;
    while (prev >= 0) {
      const dep = flow[prev].dependsOn;
      if (dep && !dep(answers)) {
        prev--;
        continue;
      }
      break;
    }
    if (prev >= 0) {
      setIndex(prev);
    } else {
      setStep('select');
    }
  };

  const currentQ = flow[index];

  // Function to submit change request to the backend
  const submitChangeRequest = async () => {
    if (!snapshot?.project_id) {
      setSubmitError('Project ID is missing');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch('/api/change-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerUuid: snapshot.project_id,
          changes: {
            selectedSections,
            answers,
            timestamp: new Date().toISOString(),
          }
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.error || 'Failed to submit change request';
        const errorDetails = data.details ? `: ${data.details}` : '';
        throw new Error(`${errorMessage}${errorDetails}`);
      }

      // Close the request changes dialog
      setIsOpen(false);

      // Track the change request in Jitsu using our centralized analytics hook
      if (snapshot?.project_id) {
        try {
          analytics.trackChange(selectedSections, 
            // Use message from text area if available
            answers.change_request_message || 'No additional message provided');
        } catch (trackingError) {
          console.error('Error tracking change request in Jitsu:', trackingError);
          // Non-critical error, continue with the flow
        }
      }

      // Show success dialog
      setSuccessDialogStatus('success');
      setSuccessDialogMessage('Your change request has been submitted successfully. Our team will review your request and get back to you soon.');
      setSuccessDialogOpen(true);

      // Refresh snapshot data if callback is provided
      if (onChangeRequestSuccess) {
        try {
          await onChangeRequestSuccess();
        } catch (refreshError) {
          console.error('Error refreshing data after change request:', refreshError);
        }
      }
    } catch (error) {
      console.error('Error submitting change request:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit change request';
      setSubmitError(errorMessage);

      // Show error in dialog as well
      setSuccessDialogStatus('error');
      setSuccessDialogMessage(errorMessage);
      setSuccessDialogOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button variant="destructive" size="lg">Request Changes</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px] flex flex-col h-[600px] min-h-[550px] max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="text-xl leading-none font-semibold">Request Project Changes</DialogTitle>
          {step === 'select' && (
            <DialogDescription className="text-muted-foreground text-base">
              Select sections of your proposal you'd like to request changes for.
            </DialogDescription>
          )}
          {step === 'questions' && (
            <DialogDescription className="text-muted-foreground text-base">
              {currentQ?.id === 'final_submission' ?
                'Review your selected changes' :
                'Requesting changes for selected sections'}
            </DialogDescription>
          )}
        </DialogHeader>
        <Separator className="mb-1 mt-2" />

        {step === 'select' && (
          <div className="flex-none">
            <div className="mb-2">
              <h3 className="text-lg font-semibold text-foreground mb-1">What would you like to change about your proposal?</h3>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto pr-2">
          {step === 'select' && (
            <div className="space-y-2 pt-0">
              {filteredSections.map(section => {
                const sel = selectedSections.includes(section.id);
                return (
                  <Button
                    key={section.id}
                    variant="outline"
                    onClick={() => toggleSection(section.id)}
                    className={`w-full justify-between text-left h-auto py-3 whitespace-normal break-words hover:bg-gray-50 ${
                      sel ? 'bg-[#F9F4F0] border-[#DB9D6A]/20' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      {getSectionIcon(section.id)}
                      <span>{CATEGORY_NAMES[section.id] || section.name}</span>
                    </div>
                    {sel && (
                      <div className="flex-shrink-0 h-6 w-6 bg-[#1DA1F2] rounded-full flex items-center justify-center">
                        <CheckIcon className="h-3.5 w-3.5 text-white" />
                      </div>
                    )}
                  </Button>
                );
              })}
              </div>
          )}

          {step === 'questions' && currentQ && (
            <div className="flex flex-col h-full">
              {/* Fixed header with question and current selection */}
              <div className="flex-none">
                <div className="mb-2">
                  <h3 className="text-lg font-semibold text-foreground mb-1">{currentQ.text}</h3>
                </div>
                
                {/* Display current pool model if we're on the pool model selection question */}
                {currentQ.id === 'poolSelection_select_model' && snapshot?.spec_name && (
                  <React.Fragment>
                    <div className="mb-2">
                      <div className="bg-[#F9F4F0] border border-[#DB9D6A]/20 rounded-md p-3 w-full">
                        <div className="flex items-center">
                          <span className="flex-1 text-left">
                            <span className="block text-base text-muted-foreground mb-1">Current Selection</span>
                            <span className="font-medium">{snapshot.spec_name}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <Separator className="mb-3" />
                  </React.Fragment>
                )}

                {/* Display current add-ons if we're on the add-ons removal question */}
                {currentQ.id === 'addOns_remove' && snapshot && (
                  <React.Fragment>
                    <div className="mb-2">
                      <div className="bg-[#F9F4F0] border border-[#DB9D6A]/20 rounded-md p-3 w-full">
                        <div className="flex flex-col">
                          <span className="block text-base text-muted-foreground mb-1">Current Add-ons</span>
                          <div className="space-y-1">
                            {snapshot.cleaner_included && (
                              <div className="flex items-center">
                                <CheckIcon className="h-3.5 w-3.5 text-[#1DA1F2] mr-1" />
                                <span className="text-base">Pool Cleaner: {snapshot.cleaner_name}</span>
                              </div>
                            )}
                            {snapshot.include_heat_pump && (
                              <div className="flex items-center">
                                <CheckIcon className="h-3.5 w-3.5 text-[#1DA1F2] mr-1" />
                                <span className="text-base">Heat Pump: {snapshot.heat_pump_description}</span>
                              </div>
                            )}
                            {snapshot.include_blanket_roller && (
                              <div className="flex items-center">
                                <CheckIcon className="h-3.5 w-3.5 text-[#1DA1F2] mr-1" />
                                <span className="text-base">Pool Blanket & Roller: {snapshot.blanket_roller_description}</span>
                              </div>
                            )}
                            {!snapshot.cleaner_included && !snapshot.include_heat_pump && !snapshot.include_blanket_roller && (
                              <span className="text-base">No add-ons currently selected</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <Separator className="mb-3" />
                  </React.Fragment>
                )}
              </div>
              
              {/* Scrollable content area */}
              <div className="flex-grow overflow-y-auto pr-1 max-h-[calc(100%-90px)] mt-1">
                {currentQ.type === 'TEXT' && (
                  <>
                    {currentQ.id === 'final_submission' ? (
                      <>
                        <div className="mb-4">
                          <div className="space-y-2">
                            {selectedSections.map(sectionId => (
                              <div
                                key={sectionId}
                                className="flex items-center justify-between bg-[#F9F4F0] border border-[#DB9D6A]/20 rounded-md p-3 w-full"
                              >
                                <div className="flex items-center space-x-2">
                                  {getSectionIcon(sectionId)}
                                  <span>{CATEGORY_NAMES[sectionId] || sections.find(s => s.id === sectionId)?.name}</span>
                                </div>
                                <div className="flex-shrink-0 h-6 w-6 bg-[#1DA1F2] rounded-full flex items-center justify-center">
                                  <CheckIcon className="h-3.5 w-3.5 text-white" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-md text-amber-800">
                          <p className="text-lg mb-1 font-semibold">You are about to request changes to your proposal.</p>
                          <p className="text-base">
                            Your change request will be sent to the MFP team for review. This may affect your quote and timeline.
                          </p>
                        </div>

                        {submitError && (
                          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-800">
                            <p className="text-base font-medium">Error: {submitError}</p>
                            <p className="text-base mt-1">Please try again or contact support if the issue persists.</p>
                          </div>
                        )}
                      </>
                    ) : (
                      <Textarea
                        id={`question-${currentQ.id}`}
                        value={answers[currentQ.id] || ''}
                        onInput={e => handleAnswer(currentQ, (e.target as any).value)}
                        placeholder="Enter your feedback here..."
                        className="min-h-[120px] w-full border rounded-md"
                      />
                    )}
                  </>
                )}

                {currentQ.type === 'CHOICE_SINGLE' && currentQ.options && (
                  <div className="space-y-2">
                    {currentQ.options.map(opt => {
                      const sel = answers[currentQ.id] === opt.value;
                      return (
                        <Button
                          key={opt.value}
                          variant="outline"
                          onClick={() => handleAnswer(currentQ, opt.value)}
                          className={`w-full justify-between h-auto py-3 whitespace-normal break-words hover:bg-gray-50 ${
                            sel ? 'bg-[#F9F4F0] border-[#DB9D6A]/20' : 'bg-white'
                          }`}
                        >
                          <span className="text-left">{opt.label}</span>
                          {sel && (
                            <div className="flex-shrink-0 h-6 w-6 bg-[#1DA1F2] rounded-full flex items-center justify-center">
                              <CheckIcon className="h-3.5 w-3.5 text-white" />
                            </div>
                          )}
                        </Button>
                      );
                    })}
                  </div>
                )}

                {currentQ.type === 'CHOICE_MULTI' && currentQ.options && (
                  <div className="space-y-2">
                    {currentQ.options.map(opt => {
                      const arr = answers[currentQ.id] || [];
                      const sel = Array.isArray(arr) && arr.includes(opt.value);
                      return (
                        <Button
                          key={opt.value}
                          variant="outline"
                          onClick={() => {
                            const nextArr = sel ? arr.filter((v: string) => v !== opt.value) : [...arr, opt.value];
                            handleAnswer(currentQ, nextArr);
                          }}
                          className={`w-full justify-between h-auto py-3 whitespace-normal break-words hover:bg-gray-50 ${
                            sel ? 'bg-[#F9F4F0] border-[#DB9D6A]/20' : 'bg-white'
                          }`}
                        >
                          <span className="text-left">{opt.label}</span>
                          {sel && (
                            <div className="flex-shrink-0 h-6 w-6 bg-[#1DA1F2] rounded-full flex items-center justify-center">
                              <CheckIcon className="h-3.5 w-3.5 text-white" />
                            </div>
                          )}
                        </Button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          {step === 'select' && (
            <Button 
              onClick={startQuestions} 
              disabled={selectedSections.length === 0}
              className={`w-full sm:w-auto font-medium ${selectedSections.length > 0 
                ? "bg-[#1DA1F2] hover:bg-[#1A91DA] text-white" 
                : "bg-gray-200 text-gray-500 cursor-not-allowed"}`}
            >
              Next
            </Button>
          )}
          
          {step === 'questions' && (
            <>
              <Button variant="outline" onClick={handleBack}>Back</Button>
              <Button
                onClick={handleNext}
                className="bg-[#1DA1F2] hover:bg-[#1A91DA] text-white font-medium"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  currentQ?.id === 'final_submission' ? 'Submit Changes' : 'Next'
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Success/Error Dialog */}
    <ChangeRequestSuccessDialog
      isOpen={successDialogOpen}
      onClose={() => setSuccessDialogOpen(false)}
      status={successDialogStatus}
      message={successDialogMessage}
    />
    </>
  );
}
