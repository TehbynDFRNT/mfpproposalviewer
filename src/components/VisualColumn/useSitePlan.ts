'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabaseClient';
import type { SitePlanVisual } from "@/components/VisualColumn/VisualColumn.types";

/**
 * Hook to fetch the latest site plan for a project
 * @param projectId The pool project ID to fetch the site plan for
 * @returns Object containing a site plan visual if available
 */
export function useSitePlan(projectId: string | undefined): {
  sitePlanVisual: SitePlanVisual | null;
  loading: boolean;
  error: string | null;
} {
  const [sitePlanVisual, setSitePlanVisual] = useState<SitePlanVisual | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSitePlan = async () => {
      if (!projectId) {
        setLoading(false);
        setSitePlanVisual(null);
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
            setSitePlanVisual(null);
          } else {
            console.error('Error fetching site plan:', fetchError);
            setError(`Failed to fetch site plan: ${fetchError.message}`);
          }
        } else if (data && data.plan_path) {
          // Get public URL for the site plan image
          const { data: urlData } = supabase
            .storage
            .from('project-site-plan')
            .getPublicUrl(data.plan_path);

          // Log for debugging
          console.log('Plan path from DB:', data.plan_path);
          console.log('Generated public URL:', urlData?.publicUrl);

          if (urlData?.publicUrl) {
            setSitePlanVisual({
              type: 'siteplan',
              planPath: data.plan_path,
              publicUrl: urlData.publicUrl,
              version: data.version,
              createdAt: data.created_at,
              alt: 'Property Site Plan'
            });
          } else {
            setSitePlanVisual(null);
          }
        } else {
          setSitePlanVisual(null);
        }
      } catch (err) {
        console.error('Unexpected error fetching site plan:', err);
        setError(`Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setSitePlanVisual(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSitePlan();
  }, [projectId]);

  return { sitePlanVisual, loading, error };
}