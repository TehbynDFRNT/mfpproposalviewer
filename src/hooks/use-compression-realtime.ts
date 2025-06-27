'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

/**
 * Hook to subscribe to realtime compression status updates
 * 
 * @param projectId The project ID to monitor
 * @param onUpdate Callback when compression status changes
 */
export function useCompressionRealtime(
  projectId: string | undefined,
  onUpdate?: () => void
) {
  useEffect(() => {
    if (!projectId) return;

    // Create a unique channel for this project's 3d table updates
    const channel = supabase
      .channel(`3d_compression_${projectId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: '3d',
          filter: `pool_project_id=eq.${projectId}`
        },
        (payload) => {
          console.log('Realtime update received:', payload);
          
          // Check if compression status changed to completed
          const newStatus = payload.new.compression_status;
          const oldStatus = payload.old?.compression_status;
          
          if (newStatus !== oldStatus) {
            console.log(`Compression status changed: ${oldStatus} → ${newStatus}`);
            
            // Trigger update callback for any status change
            onUpdate?.();
          }
        }
      )
      .subscribe();

    console.log(`Subscribed to realtime updates for project: ${projectId}`);

    // Cleanup subscription on unmount
    return () => {
      console.log(`Unsubscribing from realtime updates for project: ${projectId}`);
      supabase.removeChannel(channel);
    };
  }, [projectId, onUpdate]);
}