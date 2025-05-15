/**
 * File: /Users/tehbynnova/Code/MyProjects/Web/MFPProposalViewer/src/app/drawings/[customerUuid]/page.tsx
 * React-Server Component wrapper – fetches data from SQL view directly,
 * then streams the viewer as a client-only bundle.
 */
import { getProposalSnapshot } from '@/app/api/get-proposal-snapshot/getProposalSnapshot.server';
import type { ProposalSnapshot } from '@/types/snapshot';
import type { Metadata, ResolvingMetadata } from 'next';
import DrawingsViewer from "@/app/drawings/[customerUuid]/client/DrawingsViewer.client";

// Generate dynamic metadata based on snapshot data
export async function generateMetadata(
  { params }: { params: { customerUuid: string } },
  parent: ResolvingMetadata
): Promise<Metadata> {
  // Await params before using its properties
  const { customerUuid } = await params;
  
  // Fetch the snapshot data
  const snapshot = await getProposalSnapshot(customerUuid);

  // Build title using owner names
  const ownerNames = snapshot.owner2
    ? `${snapshot.owner1.split(' ')[0]} & ${snapshot.owner2.split(' ')[0]}`
    : snapshot.owner1;

  // Create metadata object
  return {
    title: `${ownerNames} | 3D Render Upload - MFP Pools`,
    description: `3D render upload portal for ${ownerNames}'s pool project.`,
  };
}

export default async function DrawingsPage({
  params,
}: {
  params: { customerUuid: string };
}) {
  // Await params before using its properties
  const { customerUuid } = await params;

  // Add server-side logging
  console.log(`Fetching data for 3D render uploads, project ID: ${customerUuid}`);

  try {
    // Fetch the proposal snapshot with included videos_json field
    const snapshot = await getProposalSnapshot(customerUuid);

    console.log('Server-side data retrieved successfully for drawings page:', {
      timestamp: snapshot.timestamp,
      videoCount: snapshot.videos_json?.length || 0
    });

    return <DrawingsViewer snapshot={snapshot} />;
  } catch (error) {
    console.error('Error fetching data for drawings page:', error);
    throw error; // Let Next.js error handling take over
  }
}