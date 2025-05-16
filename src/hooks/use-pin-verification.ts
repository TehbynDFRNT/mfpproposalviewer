'use client';

import { useState, useCallback } from 'react';
// Note: identity tracking now handled directly in use-proposal-analytics

interface PinVerificationOptions {
  correctPin: string;
  customerUuid: string;
  userInfo: {
    email?: string;
    name?: string;
    phone?: string;
    address?: string;
    consultant?: string;
  };
  maxAttempts?: number;
  onVerified: () => void;
}

/**
 * Hook for handling PIN verification and status updates
 */
export function usePinVerification({
  correctPin,
  customerUuid,
  userInfo,
  maxAttempts = 5,
  onVerified
}: PinVerificationOptions) {
  const [pin, setPin] = useState<string>('');
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [attempts, setAttempts] = useState<number>(0);

  // Handle PIN change
  const handlePinChange = useCallback((value: string) => {
    setPin(value);
    setIsError(false);

    // Auto-verify when all digits are entered
    if (value.length === 4) {
      verifyPin(value);
    }
  }, []);

  // Update the proposal status to viewed
  const updateProposalStatus = useCallback(async (verifiedPin: string) => {
    setIsUpdating(true);
    try {
      const response = await fetch('/api/update-viewed-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerUuid,
          pin: verifiedPin,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to update proposal status:', errorData);
        // If there's an API error, we still want to proceed
        // since we've already verified the PIN client-side
      }
      
      // Note: User identification is now handled by use-proposal-analytics

      // Set verified and trigger callback
      setIsVerified(true);
      onVerified();
    } catch (error) {
      console.error('Error updating proposal status:', error);
      // Even if the API call fails, we still proceed
      // since we've already verified the PIN client-side
      setIsVerified(true);
      onVerified();
    } finally {
      setIsUpdating(false);
    }
  }, [customerUuid, userInfo, onVerified]);

  // Verify PIN
  const verifyPin = useCallback(async (inputPin: string) => {
    if (inputPin === correctPin) {
      // Update the proposal status when PIN is correct
      await updateProposalStatus(inputPin);
    } else {
      setIsError(true);
      setAttempts(prev => prev + 1);
      // Clear the input on error
      setTimeout(() => setPin(''), 1000);
    }
  }, [correctPin, updateProposalStatus, setPin]);

  return {
    pin,
    isVerified,
    isError,
    isUpdating,
    attempts,
    maxAttempts,
    handlePinChange
  };
}