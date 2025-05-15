'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Hook to manage proposal dialogs for accept and change request states
 * 
 * @param proposalStatus Current status of the proposal
 * @param onSnapshotUpdate Optional callback to refresh proposal data
 * @returns Dialog state and handlers
 */
export function useProposalDialogs(
  proposalStatus: string | undefined,
  onSnapshotUpdate?: () => Promise<void>
) {
  // Accept dialog state
  const [acceptOpen, setAcceptOpen] = useState(false);
  const [acceptDismissed, setAcceptDismissed] = useState(false);
  const [acceptStatus, setAcceptStatus] = useState<'success' | 'error'>('success');
  const [acceptMessage, setAcceptMessage] = useState('');

  // Change request dialog state
  const [changeOpen, setChangeOpen] = useState(false);
  const [changeDismissed, setChangeDismissed] = useState(false);
  const [changeStatus, setChangeStatus] = useState<'success' | 'error'>('success');
  const [changeMessage, setChangeMessage] = useState('');

  // Auto-show dialogs based on proposal status
  useEffect(() => {
    // Only show dialog if:
    // 1. The status matches
    // 2. The dialog is not already open
    // 3. The user has not manually dismissed the dialog
    
    if (proposalStatus === 'accepted' && !acceptOpen && !acceptDismissed) {
      const timer = setTimeout(() => {
        setAcceptStatus('success');
        setAcceptMessage('Your proposal has been accepted! We will be in touch shortly to discuss next steps.');
        setAcceptOpen(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    } 
    else if (proposalStatus === 'change_requested' && !changeOpen && !changeDismissed) {
      const timer = setTimeout(() => {
        setChangeStatus('success');
        setChangeMessage('Your change request has been submitted successfully. Our team will review your request and get back to you soon.');
        setChangeOpen(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [proposalStatus, acceptOpen, changeOpen, acceptDismissed, changeDismissed]);

  // Handler for proposal acceptance
  const onAccept = useCallback(async (status: 'success' | 'error' = 'success', message?: string) => {
    setAcceptStatus(status);
    setAcceptMessage(message || 'Your proposal has been accepted! We will be in touch shortly to discuss next steps.');
    setAcceptDismissed(false); // Reset dismissal flag
    setAcceptOpen(true);
    
    // Refresh snapshot if needed
    if (status === 'success' && onSnapshotUpdate) {
      try {
        await onSnapshotUpdate();
      } catch (error) {
        console.error('Error refreshing snapshot after acceptance:', error);
      }
    }
  }, [onSnapshotUpdate]);

  // Handler for proposal change request
  const onChange = useCallback(async (status: 'success' | 'error' = 'success', message?: string) => {
    setChangeStatus(status);
    setChangeMessage(message || 'Your change request has been submitted successfully. Our team will review your request and get back to you soon.');
    setChangeDismissed(false); // Reset dismissal flag
    setChangeOpen(true);
    
    // Refresh snapshot if needed
    if (status === 'success' && onSnapshotUpdate) {
      try {
        await onSnapshotUpdate();
      } catch (error) {
        console.error('Error refreshing snapshot after change request:', error);
      }
    }
  }, [onSnapshotUpdate]);

  // Handler for showing accept dialog from status indicator
  const handleAcceptedStatusClick = useCallback(() => {
    setAcceptStatus('success');
    setAcceptMessage('Your proposal has been accepted! We will be in touch shortly to discuss next steps.');
    setAcceptDismissed(false); // Reset dismissal flag when explicitly clicked 
    setAcceptOpen(true);
  }, []);
  
  // Handler for showing change request dialog from status indicator
  const handleChangeRequestedStatusClick = useCallback(() => {
    setChangeStatus('success');
    setChangeMessage('Your change request has been submitted successfully. Our team will review your request and get back to you soon.');
    setChangeDismissed(false); // Reset dismissal flag when explicitly clicked
    setChangeOpen(true);
  }, []);

  return {
    // Accept dialog
    acceptOpen,
    setAcceptOpen,
    acceptDismissed, 
    setAcceptDismissed,
    acceptStatus,
    acceptMessage,
    onAccept,
    handleAcceptedStatusClick,
    
    // Change request dialog
    changeOpen,
    setChangeOpen, 
    changeDismissed,
    setChangeDismissed,
    changeStatus,
    changeMessage,
    onChange,
    handleChangeRequestedStatusClick
  };
}