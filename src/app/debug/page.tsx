/**
 * File: /Users/tehbynnova/Code/MyProjects/Web/mfp/src/app/debug/page.tsx
 */
// Server Component for fetching data using the flat SQL view structure
// We load data server-side and pass it to the client component

import DebugClient from './debug-client';
import { getProposalSnapshot } from '@/app/lib/getProposalSnapshot.server';

interface DebugPageProps {
  searchParams: {
    uuid?: string;
  };
}

export default async function DebugPage({ searchParams }: DebugPageProps) {
  let snapshotData = null;
  let errorMessage = null;
  
  // Default UUID if none provided in URL
  const defaultUuid = '0b7179a5-0a80-47ed-b12b-9989a520d770';
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