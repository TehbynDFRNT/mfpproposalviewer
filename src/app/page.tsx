'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeOut, contentIn } from '@/lib/animation';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-gradient-to-b from-[#07032D] to-[#0f0a45] proposal-background">
      {/* Logo above the card */}
      <div className="mb-8 flex flex-col items-center">
        <Image
          src="/Logo/logo-white.png"
          alt="MFPEasy Logo"
          width={140}
          height={35}
          priority
          style={{ width: 'auto', height: 'auto' }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key="no-proposal"
          variants={{ ...fadeOut, ...contentIn }}
          initial="initial"
          animate="enter"
          exit="exit"
          className="flex justify-center items-center w-full"
        >
          <Card className="w-[90%] max-w-[400px] shadow-lg border-blue-100 bg-white/95">
            <CardHeader className="pb-2">
              <CardTitle className="text-center text-xl font-semibold text-blue-900">No Proposal Found</CardTitle>
              <CardDescription className="text-center text-muted-foreground">
                We couldn't locate your proposal
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <p className="text-center">
                It looks like you have tried to access an MFPEasy Proposal without a unique proposal link. <span className="font-bold">If you are an MFPEasy customer, please contact us to get your unique proposal URL.</span>
              </p>
              <div className="flex justify-center mt-6">
                <a href="tel:1300306011" aria-label="Call 1300 306 011">
                  <Button variant="secondary" className="flex items-center gap-2" aria-label="Call Us">
                    <Phone className="h-4 w-4" />
                    <span className="sm:inline">1300 306 011</span>
                  </Button>
                </a>
              </div>
            </CardContent>
            <CardFooter className="flex-col justify-center pt-0 pb-4">
              <p className="text-center text-sm text-muted-foreground">
                Your MFPEasy Consultant will be happy to assist you
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}