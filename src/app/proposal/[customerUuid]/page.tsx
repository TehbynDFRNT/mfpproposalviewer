/**
 * React-Server Component wrapper – fetches data, then streams the
 * heavy viewer as a client-only bundle.
 */
import { getProposalSnapshot } from '@/app/lib/getProposalSnapshot';
import type { Snapshot }        from '@/app/lib/types/snapshot';
import ProposalViewer       from './ProposalViewer.client';

// Next 15: `params` is now a *Promise* – so we await it first.
export default async function ProposalPage({
  params,
}: {
  /** awaited later ↓                                    */
  params: Promise<{ customerUuid: string }>;
}) {
  const { customerUuid } = await params;          // ✅ no console warning
  
  // Add server-side logging
  console.log(`Fetching proposal snapshot for UUID: ${customerUuid}`);
  
  try {
    const snapshot: Snapshot = await getProposalSnapshot(customerUuid);
    console.log('Server-side snapshot retrieved successfully:', {
      hasPoolProject: !!snapshot.poolProject,
      hasPoolSpec: !!snapshot.poolSpecification,
      timestamp: snapshot.timestamp
    });
    
    return <ProposalViewer snapshot={snapshot} />;
  } catch (error) {
    console.error('Error fetching proposal snapshot:', error);
    throw error; // Let Next.js error handling take over
  }
}