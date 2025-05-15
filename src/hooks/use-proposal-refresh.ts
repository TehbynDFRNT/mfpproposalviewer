'use client';

import { useState, useCallback } from 'react';
import type { ProposalSnapshot } from '@/types/snapshot';

/**
 * Hook for refreshing proposal data from the server
 * 
 * @param initialSnapshot The initial proposal data
 * @returns Object containing current snapshot, loading state, and refresh function
 */
export function useProposalRefresh(initialSnapshot: ProposalSnapshot) {
  const [snapshot, setSnapshot] = useState<ProposalSnapshot>(initialSnapshot);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Function to refresh proposal data
  const refreshProposalData = useCallback(async () => {
    if (!snapshot.project_id) return;

    setIsRefreshing(true);
    try {
      // Fetch fresh data from the API
      const response = await fetch(`/api/refresh-proposal?customerUuid=${snapshot.project_id}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('Failed to refresh proposal data:', response.status, errorData);
        return;
      }

      const freshSnapshot = await response.json();
      setSnapshot(freshSnapshot);
      console.log('Proposal data refreshed successfully');
    } catch (error) {
      console.error('Error refreshing proposal data:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [snapshot.project_id]);

  return {
    snapshot,
    isRefreshing,
    refreshProposalData
  };
}