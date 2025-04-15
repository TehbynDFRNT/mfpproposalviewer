import React from 'react';
import { Button } from "@/components/ui/button";
import Link from 'next/link'; // Import Link

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">MFP Home Services</h1>
      <p className="mt-4 text-lg">Project Initialized</p>

      {/* Navigation Links */}
      <nav className="mt-12 flex flex-col space-y-4 items-center">
        <Button variant="link" asChild>
          <Link href="/proposal/123">View Sample Proposal (ID: 123)</Link>
        </Button>
        <Button variant="link" asChild>
          <Link href="/contract/456">View Sample Contract (ID: 456)</Link>
        </Button>
        <Button variant="link" asChild>
          <Link href="/portal/789">View Sample Portal (ID: 789)</Link>
        </Button>
      </nav>

      <Button variant="outline" className="mt-8">Test Button</Button>
    </main>
  );
}