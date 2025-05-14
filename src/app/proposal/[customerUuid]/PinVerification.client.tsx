'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeOut, contentIn } from '@/app/lib/animation';
import { ProposalSnapshot } from '@/app/lib/types/snapshot';
import ProposalViewer from "@/app/proposal/[customerUuid]/ProposalViewer.client";
import { getProposalSnapshot } from '@/app/lib/getProposalSnapshot.server';
import { trackProposalViewed, identify } from '@/app/lib/jitsuClient';

interface PinVerificationProps {
  snapshot: ProposalSnapshot;
}

export default function PinVerification({ snapshot: initialSnapshot }: PinVerificationProps) {
  const [snapshot, setSnapshot] = useState<ProposalSnapshot>(initialSnapshot);
  const [pin, setPin] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const MAX_ATTEMPTS = 5;

  // Get correct PIN from the snapshot
  const correctPin = snapshot.pin || '';

  // Handle PIN change
  const handlePinChange = (value: string) => {
    setPin(value);
    setIsError(false);

    // Auto-verify when all digits are entered
    if (value.length === 4) {
      verifyPin(value);
    }
  };

  // Update the proposal status to viewed
  const updateProposalStatus = async (verifiedPin: string) => {
    setIsUpdating(true);
    try {
      const response = await fetch('/api/update-viewed-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerUuid: snapshot.project_id,
          pin: verifiedPin,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to update proposal status:', errorData);
        // If there's an API error, we still want to show the proposal
        // since we've already verified the PIN client-side
        setIsVerified(true);
      } else {
        setIsVerified(true);
      }
      
      // First identify the user if customer email is available
      const customerEmail = snapshot.customer_email;
      if (customerEmail) {
        // This is the real user identity for Jitsu
        identify(customerEmail, {
          name: snapshot.customer_name,
          consultant: snapshot.consultant_name,
          phone: snapshot.customer_phone,
          address: snapshot.home_address
        });
      }
      
      // NOTE: We no longer track the proposal viewed event here
      // Instead, we track it in the ProposalViewer component
      // This prevents duplicate events
    } catch (error) {
      console.error('Error updating proposal status:', error);
      // Even if the API call fails, we still want to show the proposal
      // since we've already verified the PIN client-side
      setIsVerified(true);
    } finally {
      setIsUpdating(false);
    }
  };

  // Verify PIN
  const verifyPin = async (inputPin: string) => {
    if (inputPin === correctPin) {
      // Update the proposal status when PIN is correct
      await updateProposalStatus(inputPin);
    } else {
      setIsError(true);
      setAttempts(attempts + 1);
      // Clear the input on error
      setTimeout(() => setPin(''), 1000);
    }
  };

  // Function to refresh proposal data
  const refreshProposalData = useCallback(async () => {
    if (!snapshot.project_id) return;

    setIsRefreshing(true);
    try {
      // Use 'use server' function to get fresh data
      const freshSnapshot = await fetch(`/api/refresh-proposal?customerUuid=${snapshot.project_id}`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to refresh proposal data');
          return res.json();
        });

      setSnapshot(freshSnapshot);
      console.log('Proposal data refreshed successfully');
    } catch (error) {
      console.error('Error refreshing proposal data:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [snapshot.project_id]);

  // If verified, show the proposal viewer
  if (isVerified) {
    return <ProposalViewer
      snapshot={snapshot}
      onSnapshotUpdate={refreshProposalData}
    />;
  }

  // If too many attempts, show locked message
  if (attempts >= MAX_ATTEMPTS) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#07032D] proposal-background">
        <Card className="w-[350px] shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-xl font-semibold">Access Locked</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center mb-4">
              Too many incorrect attempts. Please contact your pool consultant for assistance.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show PIN entry form
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-[#07032D] proposal-background">
      {/* Logo above the PIN card */}
      <div className="mb-6 flex flex-col items-center">
        <Image
          src="/Logo/logo-white.png"
          alt="MFP Pools Logo"
          width={100}
          height={24}
          className="mb-2"
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key="pin-verification"
          variants={{ ...fadeOut, ...contentIn }}
          initial="initial"
          animate="enter"
          exit="exit"
        >
          <Card className="w-[350px] shadow-lg">
            <CardHeader>
              <CardTitle className="text-center text-xl font-semibold">Enter PIN</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center mb-4">
                Please enter the 4-digit PIN provided to you to view your proposal.
              </p>
              <div className="mb-6">
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={4}
                    value={pin}
                    onChange={handlePinChange}
                    containerClassName="group"
                    disabled={isUpdating}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} className={isError ? 'border-red-500' : ''} />
                      <InputOTPSlot index={1} className={isError ? 'border-red-500' : ''} />
                      <InputOTPSlot index={2} className={isError ? 'border-red-500' : ''} />
                      <InputOTPSlot index={3} className={isError ? 'border-red-500' : ''} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <AnimatePresence>
                  {isUpdating && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-center text-blue-500 text-sm mt-4"
                    >
                      Verifying PIN and loading your proposal...
                    </motion.div>
                  )}
                  {isError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-center text-red-500 text-sm mt-4"
                    >
                      Incorrect PIN. Please try again. ({attempts}/{MAX_ATTEMPTS} attempts)
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </CardContent>
            <CardFooter className="flex-col">
              <p className="text-center text-sm text-muted-foreground">
                If you don't have a PIN, please contact your pool consultant.
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}