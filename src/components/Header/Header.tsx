/**
 * File: src/components/Header/Header.tsx
 */
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Phone } from 'lucide-react';

interface HeaderProps {
  children?: React.ReactNode;
}

export default function Header({ children }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
      {/* Logo */}
      <div className="flex items-center">
        <Image src="/Logo/logo.webp" alt="MFP Pools Logo" className="h-8 w-auto" width={160} height={40} />
      </div>
      
      {/* Optional children for SectionJumpSelect on mobile */}
      {children}
      
      {/* Contact Phone */}
      <div className="flex items-center">
        <a href="tel:1300306011" aria-label="Call 1300 306 011">
          <Button variant="secondary" className="flex items-center gap-2" aria-label="Call Us">
            <Phone className="h-4 w-4" />
            <span className="hidden sm:inline">1300 306 011</span>
          </Button>
        </a>
      </div>
    </header>
  );
}