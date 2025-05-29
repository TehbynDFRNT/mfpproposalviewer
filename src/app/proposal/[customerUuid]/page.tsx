/**
 * File: /Users/tehbynnova/Code/MyProjects/Web/mfp/src/app/proposal/[customerUuid]/page.tsx
 * React-Server Component wrapper – fetches data from SQL view directly,
 * then streams the heavy viewer as a client-only bundle.
 * Now includes PIN verification before showing the proposal.
 */
// point explicitly at the server helper
import { getProposalSnapshot } from '@/app/api/get-proposal-snapshot/getProposalSnapshot.server';

// give us the type if you want to annotate the result
import type { ProposalSnapshot } from '@/types/snapshot';
import type { Metadata, ResolvingMetadata } from 'next';

import PinVerification from "./client/PinVerification.client";

// Generate dynamic metadata based on snapshot data
export async function generateMetadata(
  { params }: { params: { customerUuid: string } },
  parent: ResolvingMetadata
): Promise<Metadata> {
  // Await params before using its properties
  const { customerUuid } = await params;
  
  try {
    // Fetch the snapshot data
    const snapshot = await getProposalSnapshot(customerUuid);

    // Build title using owner names
    const ownerNames = snapshot.owner2
      ? `${snapshot.owner1.split(' ')[0]} & ${snapshot.owner2.split(' ')[0]}`
      : snapshot.owner1;

    // Create metadata object
    return {
      title: `${ownerNames} | Your Pool Proposal - MFP Pools`,
      description: `Pool proposal for ${ownerNames} featuring a ${snapshot.spec_name || 'custom'} pool.`,
    };
  } catch (error) {
    // Return generic metadata for invalid UUIDs to prevent enumeration attacks
    return {
      title: 'Pool Proposal - MFP Pools',
      description: 'Your personalized pool proposal from MFP Pools.',
    };
  }
}

export default async function ProposalPage({
  params,
}: {
  params: { customerUuid: string };
}) {
  // Await params before using its properties
  const { customerUuid } = await params;

  // Add server-side logging
  console.log(`Fetching proposal snapshot for project ID: ${customerUuid}`);

  try {
    const snapshot = await getProposalSnapshot(customerUuid);
    console.log('Server-side snapshot retrieved successfully:', {
      created_at: snapshot.created_at
    });

    // Return the PIN verification component which will show the proposal viewer after verification
    return <PinVerification snapshot={snapshot} />;
  } catch (error) {
    console.error('Error fetching proposal snapshot:', error);
    // Show PIN verification even for invalid UUIDs to prevent enumeration attacks
    return <PinVerification snapshot={null} customerUuid={customerUuid} />;
  }
}