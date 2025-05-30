/**
 * File: /Users/tehbynnova/Code/MyProjects/Web/mfp/src/app/debug/page.tsx
 */
// Server Component for fetching data using the flat SQL view structure
// We load data server-side and pass it to the client component

import DebugClient from "@/app/debug/debug-client";
import { getProposalSnapshot } from '@/app/api/get-proposal-snapshot/getProposalSnapshot.server';

interface DebugPageProps {
  searchParams: {
    uuid?: string;
  };
}

export default async function DebugPage({ searchParams }: DebugPageProps) {
  let snapshotData = null;
  let errorMessage = null;
  
  // Default UUID if none provided in URL
  const defaultUuid = 'acec1f18-4af6-41d9-9b36-41aedf697d5f';
  // Use UUID from URL or fallback to default
  const customerUuid = searchParams.uuid || defaultUuid;
  
  try {
    snapshotData = await getProposalSnapshot(customerUuid);
    console.log('Server-side snapshot retrieved:', !!snapshotData);
  } catch (error) {
    console.error('Error fetching data:', error);
    errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
  }

  // Pass the fetched data to the client component
  return (
    <DebugClient 
      snapshotData={snapshotData} 
      errorMessage={errorMessage}
      initialUuid={customerUuid}
    />
  );
}