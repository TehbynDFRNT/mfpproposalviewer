'use client';

/* eslint-disable @next/next/no-img-element */

export default function ProposalError() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-center px-6">
      <img src="/_opt/error-illustration.svg" alt="Error" className="w-40 mb-6" />
      <h1 className="text-2xl font-semibold mb-2">Something went wrong</h1>
      <p className="text-sm text-muted-foreground max-w-md">
        We couldn't load your proposal just now. Please refresh the page or contact your
        MFP sales consultant.
      </p>
    </div>
  );
}