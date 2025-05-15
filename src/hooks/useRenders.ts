/**
 * File: src/hooks/useRenders.ts
 * 
 * Custom hook for fetching 3D renders from Supabase
 */
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { RenderVisual } from '@/components/VisualColumn/VisualColumn.types';

// Raw data structure from Supabase
interface RenderData {
  video_type: string;
  video_path: string;
  created_at: string;
}

interface UseRendersResult {
  renders: RenderVisual[] | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Custom hook to fetch 3D renders from Supabase for a project
 * @param projectId - The project ID to fetch renders for
 * @param enabled - Whether the hook should be enabled (if false, no fetch will occur)
 * @returns An object containing the renders, loading state, and any errors
 */
export function useRenders(projectId: string | undefined, enabled: boolean): UseRendersResult {
  const [renders, setRenders] = useState<RenderVisual[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Early return if hook is disabled or no projectId is provided
    if (!enabled || !projectId) return;

    let isMounted = true;
    setIsLoading(true);
    
    async function fetchRenders() {
      try {
        const { data, error: fetchError } = await supabase
          .from('3d')
          .select('video_type, video_path, created_at')
          .eq('pool_project_id', projectId);

        if (fetchError) {
          throw new Error(`Error fetching 3D renders: ${fetchError.message}`);
        }

        // Only update state if the component is still mounted
        if (isMounted) {
          setRenders(data?.map((item: RenderData) => ({
            type: '3d',
            videoType: item.video_type,
            videoPath: item.video_path,
            createdAt: item.created_at,
            alt: `3D ${item.video_type} Visualization`
          })) || null);
          setIsLoading(false);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error in fetchRenders:', err);
          setError(err instanceof Error ? err : new Error(String(err)));
          setIsLoading(false);
        }
      }
    }

    fetchRenders();

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [projectId, enabled]);

  return { renders, isLoading, error };
}