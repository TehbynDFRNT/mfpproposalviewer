'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeOut, contentIn } from '@/lib/animation';
import { ProposalSnapshot } from '@/types/snapshot';
import ProposalViewer from "@/app/proposal/[customerUuid]/client/ProposalViewer.client";
import { usePinVerification } from '@/hooks/use-pin-verification';
import { useProposalRefresh } from '@/hooks/use-proposal-refresh';

interface PinVerificationProps {
  snapshot: ProposalSnapshot;
}

export default function PinVerification({ snapshot: initialSnapshot }: PinVerificationProps) {
  // Use the proposal refresh hook
  const { 
    snapshot, 
    isRefreshing, 
    refreshProposalData 
  } = useProposalRefresh(initialSnapshot);

  // Track if PIN has been verified
  const [showProposal, setShowProposal] = useState(false);

  // Use the PIN verification hook
  const {
    pin,
    isVerified,
    isError,
    isUpdating,
    attempts,
    maxAttempts,
    handlePinChange
  } = usePinVerification({
    correctPin: snapshot.pin || '',
    customerUuid: snapshot.project_id || '',
    userInfo: {
      email: snapshot.email,
      name: snapshot.owner1,
      consultant: snapshot.proposal_name,
      phone: snapshot.phone,
      address: snapshot.home_address
    },
    onVerified: () => setShowProposal(true)
  });

  // If verified, show the proposal viewer
  if (showProposal) {
    return (
      <ProposalViewer
        snapshot={snapshot}
        onSnapshotUpdate={refreshProposalData}
      />
    );
  }

  // If too many attempts, show locked message
  if (attempts >= maxAttempts) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#07032D] proposal-background overflow-hidden">
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
    <div className="flex flex-col h-screen items-center justify-center bg-[#07032D] proposal-background overflow-hidden">
      {/* Logo above the PIN card */}
      <div className="mb-8 flex flex-col items-center">
        <Image
          src="/Logo/logo-white.png"
          alt="MFP Pools Logo"
          width={100}
          height={24}
          priority
          style={{ width: 'auto', height: 'auto' }}
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
                      Incorrect PIN. Please try again. ({attempts}/{maxAttempts} attempts)
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