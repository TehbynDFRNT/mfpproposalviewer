/**
 * File: /Users/tehbynnova/Code/MyProjects/Web/mfp/src/app/proposal/[customerUuid]/page.tsx
 * React-Server Component wrapper – fetches data from SQL view directly,
 * then streams the heavy viewer as a client-only bundle.
 */
// point explicitly at the server helper
import { getProposalSnapshot } from '@/app/lib/getProposalSnapshot.server';

// give us the type if you want to annotate the result
import type { ProposalSnapshot } from '@/app/lib/types/snapshot';

import ProposalViewer from './ProposalViewer.client';

export default async function ProposalPage({
  params,
}: {
  params: { customerUuid: string };
}) {
  const { customerUuid } = params;
  
  // Add server-side logging
  console.log(`Fetching proposal snapshot for project ID: ${customerUuid}`);
  
  try {
    const snapshot = await getProposalSnapshot(customerUuid);
    console.log('Server-side snapshot retrieved successfully:', {
      timestamp: snapshot.timestamp
    });
    
    return <ProposalViewer snapshot={snapshot} />;
  } catch (error) {
    console.error('Error fetching proposal snapshot:', error);
    throw error; // Let Next.js error handling take over
  }
}