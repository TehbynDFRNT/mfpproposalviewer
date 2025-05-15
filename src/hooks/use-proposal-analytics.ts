'use client';

import { useRef, useEffect } from 'react';
import { identify, trackProposalViewed } from '@/lib/analytics';
import type { ProposalSnapshot } from '@/types/snapshot';

/**
 * Hook to track proposal analytics events
 * 
 * @param snapshot Proposal snapshot data
 * @returns Object containing tracking status
 */
export function useProposalAnalytics(snapshot: ProposalSnapshot) {
  // Flag to ensure we only track the view once
  const hasTrackedRef = useRef(false);

  // Track the proposal view event on mount
  useEffect(() => {
    // Only track once
    if (hasTrackedRef.current) {
      return;
    }
    
    hasTrackedRef.current = true;

    // Identify the user if email is available
    if (snapshot.email) {
      identify(snapshot.email, {
        name: snapshot.owner1,
        consultant: snapshot.proposal_name,
        phone: snapshot.phone,
        address: snapshot.home_address
      });
    }

    // Track the proposal viewed event
    trackProposalViewed(
      snapshot.project_id ?? '', 
      {
        pin_verified: true, // PIN was already verified if we're at this component
        customer_name: snapshot.owner1,
        consultant_name: snapshot.proposal_name,
        pool_model: snapshot.spec_name,
        proposal_created_at: snapshot.timestamp,
        proposal_last_modified: snapshot.timestamp,
        source: 'proposal_viewer_mount', // Indicate this came from the ProposalViewer component
        proposal_status: snapshot.proposal_status
      },
      snapshot.email // Pass customer email as userId if available
    );

    console.log('Tracked proposal view event');
  }, [snapshot]); // Dependencies needed to access snapshot data

  return {
    hasTracked: hasTrackedRef.current
  };
}