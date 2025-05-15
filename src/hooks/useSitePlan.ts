'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { SitePlanVisual } from "@/components/VisualColumn/VisualColumn.types";

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
  sitePlanVisual: SitePlanVisual | null; // For VisualColumn compatibility
}

/**
 * Hook to fetch the latest site plan for a project
 * @param projectId The pool project ID to fetch the site plan for
 * @returns Object containing the site plan data, loading state, error message, public URL, and refresh function
 */
export function useSitePlan(projectId: string | undefined): UseSitePlanResult {
  const [sitePlan, setSitePlan] = useState<SitePlanData | null>(null);
  const [loading, setLoading] = useState<boolean>(false); // Start with false to prevent loading flash if projectId is undefined
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [publicUrl, setPublicUrl] = useState<string | null>(null);
  const [sitePlanVisual, setSitePlanVisual] = useState<SitePlanVisual | null>(null);

  // Function to refresh the site plan data
  const refreshSitePlan = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    // Don't attempt to fetch if projectId is undefined or null
    if (!projectId) {
      setLoading(false);
      setSitePlan(null);
      setPublicUrl(null);
      setSitePlanVisual(null);
      return;
    }

    const fetchSitePlan = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch the latest version of the site plan for this project
        try {
          const { data, error: fetchError } = await supabase
            .from('project_site_plan')
            .select('*')
            .eq('pool_project_id', projectId)
            .order('version', { ascending: false })
            .limit(1);
          
          if (fetchError) {
            console.error('Error fetching site plan:', fetchError);
            setError(`Failed to fetch site plan: ${fetchError.message}`);
            setSitePlan(null);
            setPublicUrl(null);
            setSitePlanVisual(null);
            return;
          }
          
          // Check if we have data and it's an array with at least one item
          if (data && Array.isArray(data) && data.length > 0) {
            const sitePlanData = data[0] as SitePlanData;
            setSitePlan(sitePlanData);
            
            // If we have a plan_path, get the public URL
            if (sitePlanData.plan_path) {
              try {
                const { data: urlData } = supabase
                  .storage
                  .from('project-site-plan')
                  .getPublicUrl(sitePlanData.plan_path);

                const publicUrlValue = urlData?.publicUrl || null;
                setPublicUrl(publicUrlValue);

                // Set the sitePlanVisual for VisualColumn compatibility
                if (publicUrlValue) {
                  setSitePlanVisual({
                    type: 'siteplan',
                    planPath: sitePlanData.plan_path,
                    publicUrl: publicUrlValue,
                    version: sitePlanData.version,
                    createdAt: sitePlanData.created_at,
                    alt: 'Property Site Plan'
                  });
                } else {
                  setSitePlanVisual(null);
                }
              } catch (urlError) {
                console.error('Error getting public URL:', urlError);
                setPublicUrl(null);
                setSitePlanVisual(null);
              }
            } else {
              setPublicUrl(null);
              setSitePlanVisual(null);
            }
          } else {
            // No data returned - this is normal if there's no site plan yet
            setSitePlan(null);
            setPublicUrl(null);
            setSitePlanVisual(null);
          }
        } catch (supabaseError) {
          // This will catch 406 Not Acceptable and other fetch errors
          console.error('Supabase API error:', supabaseError);
          setError(`Supabase API error: ${supabaseError instanceof Error ? supabaseError.message : 'Unknown error'}`);
          setSitePlan(null);
          setPublicUrl(null);
          setSitePlanVisual(null);
        }
      } catch (err) {
        console.error('Unexpected error fetching site plan:', err);
        setError(`Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setSitePlan(null);
        setPublicUrl(null);
        setSitePlanVisual(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSitePlan();
  }, [projectId, refreshTrigger]);

  return { sitePlan, loading, error, publicUrl, refreshSitePlan, sitePlanVisual };
}