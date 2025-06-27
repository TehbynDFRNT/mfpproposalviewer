'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { VideoRecord } from '@/types/video';

/**
 * Result returned by the useVideos hook
 */
interface UseVideosResult {
  videos: VideoRecord[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
  findVideoByType: (videoType: string) => VideoRecord | null;
}

/**
 * Hook to fetch and manage 3D render videos for a project
 * 
 * @param projectId The pool project ID to fetch videos for
 * @returns Object containing videos array, loading state, error message, refresh function, and helper to find videos by type
 */
export function useVideos(projectId: string | undefined): UseVideosResult {
  const [videos, setVideos] = useState<VideoRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Function to manually refresh the videos
  const refresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  // Helper function to find a video by type
  const findVideoByType = useCallback((videoType: string): VideoRecord | null => {
    if (!videos || !Array.isArray(videos)) return null;
    return videos.find(video => video.video_type === videoType) || null;
  }, [videos]);

  // Fetch videos when component mounts or refresh is triggered
  useEffect(() => {
    const fetchVideos = async () => {
      if (!projectId) {
        setLoading(false);
        setError('Missing project ID');
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('3d')
          .select('video_type, video_path, created_at, compression_status, compressed_path, rendi_command_id, compression_error')
          .eq('pool_project_id', projectId);

        if (fetchError) {
          console.error('Error fetching videos:', fetchError);
          setError(`Failed to fetch videos: ${fetchError.message}`);
          setVideos([]);
        } else {
          setVideos(data || []);
          console.log('Videos refreshed:', data);
        }
      } catch (err) {
        console.error('Unexpected error fetching videos:', err);
        setError(`Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [projectId, refreshTrigger]);

  return { videos, loading, error, refresh, findVideoByType };
}