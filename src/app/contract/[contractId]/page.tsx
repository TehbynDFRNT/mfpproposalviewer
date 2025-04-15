import React from 'react';

// Opt out of caching for dynamic routes, adjust as needed later
export const dynamic = 'force-dynamic';

export default function ContractPage({ params }: { params: { contractId: string } }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-2xl font-semibold">Contract Details</h1>
      <p className="mt-4">Displaying contract ID: {params.contractId}</p>
      {/* Content for the contract page will go here */}
    </main>
  );
}