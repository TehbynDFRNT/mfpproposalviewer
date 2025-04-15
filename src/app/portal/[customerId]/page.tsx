import React from 'react';

// Opt out of caching for dynamic routes, adjust as needed later
export const dynamic = 'force-dynamic';

export default function PortalPage({ params }: { params: { customerId: string } }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-2xl font-semibold">Customer Portal</h1>
      <p className="mt-4">Displaying portal for customer ID: {params.customerId}</p>
      {/* Content for the customer portal page (including 'pizza tracker') will go here */}
    </main>
  );
}