import React from 'react';

// Define the expected props structure
type PortalPageProps = {
  params: { customerId: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}

// Opt out of caching for dynamic routes, adjust as needed later
export const dynamic = 'force-dynamic';

export default function PortalPage({ params, searchParams: _ }: PortalPageProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-2xl font-semibold">Customer Portal</h1>
      <p className="mt-4">Displaying portal for customer ID: {params.customerId}</p>
      {/* Content for the customer portal page (including 'pizza tracker') will go here */}
    </main>
  );
}