'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabaseClient';

interface SitePlanData {
  id: string;
  pool_project_id: string;
  plan_path: string;
  version: number;
  created_at: string;
}

interface UseSitePlanResult {
  sitePlan: SitePlanData | null;
  loading: boolean;
  error: string | null;
  publicUrl: string | null;
  refreshSitePlan: () => void;
}

/**
 * Hook to fetch the latest site plan for a project
 * @param projectId The pool project ID to fetch the site plan for
 * @returns Object containing the site plan data, loading state, error message, public URL, and refresh function
 */
export function useSitePlan(projectId: string): UseSitePlanResult {
  const [sitePlan, setSitePlan] = useState<SitePlanData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [publicUrl, setPublicUrl] = useState<string | null>(null);

  // Function to refresh the site plan data
  const refreshSitePlan = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    const fetchSitePlan = async () => {
      if (!projectId) {
        setLoading(false);
        setError('Missing project ID');
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch the latest version of the site plan for this project
        const { data, error: fetchError } = await supabase
          .from('project_site_plan')
          .select('*')
          .eq('pool_project_id', projectId)
          .order('version', { ascending: false })
          .limit(1)
          .single();

        if (fetchError) {
          if (fetchError.code === 'PGRST116') {
            // No rows returned - this is not an error for our purposes
            setSitePlan(null);
            setPublicUrl(null);
          } else {
            console.error('Error fetching site plan:', fetchError);
            setError(`Failed to fetch site plan: ${fetchError.message}`);
          }
        } else if (data) {
          setSitePlan(data as SitePlanData);
          
          // If we have a plan_path, get the public URL
          if (data.plan_path) {
            const { data: urlData } = supabase
              .storage
              .from('project-site-plan')
              .getPublicUrl(data.plan_path);

            setPublicUrl(urlData?.publicUrl || null);

            // Log for debugging
            console.log('Plan path from DB:', data.plan_path);
            console.log('Generated public URL:', urlData?.publicUrl);
          } else {
            setPublicUrl(null);
          }
        } else {
          setSitePlan(null);
          setPublicUrl(null);
        }
      } catch (err) {
        console.error('Unexpected error fetching site plan:', err);
        setError(`Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchSitePlan();
  }, [projectId, refreshTrigger]);

  return { sitePlan, loading, error, publicUrl, refreshSitePlan };
}