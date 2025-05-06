/**
 * File: src/components/Header/Header.tsx
 */
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Mail, MessageSquare, Phone } from 'lucide-react';

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
      
      {/* Contact Icons */}
      <div className="flex items-center space-x-2">
        <Button variant="secondary" size="icon" aria-label="Email Us">
          <Mail className="h-5 w-5" />
        </Button>
        <Button variant="secondary" size="icon" aria-label="Chat With Us">
          <MessageSquare className="h-5 w-5" />
        </Button>
        <Button variant="secondary" size="icon" aria-label="Call Us">
          <Phone className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}