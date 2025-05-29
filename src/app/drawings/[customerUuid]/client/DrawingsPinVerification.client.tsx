'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeOut, contentIn } from '@/lib/animation';
import { ProposalSnapshot } from '@/types/snapshot';
import DrawingsViewer from "@/app/drawings/[customerUuid]/client/DrawingsViewer.client";
import { useDrawingsPassword } from '@/hooks/use-drawings-password';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

interface DrawingsPinVerificationProps {
  snapshot: ProposalSnapshot | null;
  customerUuid?: string;
}

export default function DrawingsPinVerification({ snapshot: initialSnapshot, customerUuid }: DrawingsPinVerificationProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showDrawings, setShowDrawings] = useState(false);

  // Use the password verification hook
  const {
    password,
    isVerifying,
    isAuthenticated,
    error,
    attempts,
    maxAttempts,
    isLocked,
    setPassword,
    verifyPassword,
    clearError,
  } = useDrawingsPassword(() => setShowDrawings(true));

  // If authenticated, show the drawings viewer or an access message
  if (showDrawings) {
    if (initialSnapshot) {
      return <DrawingsViewer snapshot={initialSnapshot} />;
    } else {
      // Authenticated but no specific project - show error
      return (
        <div className="flex flex-col h-screen items-center justify-center bg-[#07032D] proposal-background overflow-hidden">
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
          <Card className="w-[90%] max-w-[400px] mx-auto shadow-lg">
            <CardHeader>
              <CardTitle className="text-center text-xl font-semibold text-red-600">Project Not Found</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center mb-4">
                The requested project could not be found or accessed.
              </p>
              <p className="text-center text-sm text-muted-foreground">
                Please verify the project link and try again.
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }
  }

  // If too many attempts, show locked message
  if (isLocked) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#07032D] proposal-background overflow-hidden">
        <Card className="w-[350px] shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-xl font-semibold">Access Locked</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center mb-4">
              Too many incorrect attempts. Please try again later.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isVerifying && password.trim()) {
      verifyPassword();
    }
  };

  // Show password entry form
  return (
    <div className="flex flex-col h-screen items-center justify-center bg-[#07032D] proposal-background overflow-hidden">
      {/* Logo above the password card */}
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
          key="password-verification"
          variants={{ ...fadeOut, ...contentIn }}
          initial="initial"
          animate="enter"
          exit="exit"
        >
          <Card className="w-[90%] max-w-[400px] mx-auto shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-center text-xl font-semibold">Enter Password</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-6">
              <p className="text-center mb-4">
                Please enter the password to access the 3D render upload portal.
              </p>
              <div className="space-y-4 flex flex-col items-center">
                <div className="relative max-w-xs">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) clearError();
                    }}
                    onKeyPress={handleKeyPress}
                    disabled={isVerifying}
                    className="pr-10 text-center"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                    disabled={isVerifying}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                
                <Button
                  onClick={verifyPassword}
                  disabled={isVerifying || !password.trim()}
                  className="max-w-xs"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Access Portal'
                  )}
                </Button>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-center text-red-500 text-sm"
                    >
                      {error} ({attempts}/{maxAttempts} attempts)
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </CardContent>
            <CardFooter className="flex-col px-5 pb-6">
              <p className="text-center text-sm text-muted-foreground">
                Contact your administrator if you need access credentials.
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}