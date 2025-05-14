'use client';

/**
 * File: /Users/tehbynnova/Code/MyProjects/Web/MFPProposalViewer/src/app/drawings/[customerUuid]/components/SitePlanPreview.tsx
 * Component for displaying site plan images with version info and controls
 */
import React, { useState } from 'react';
import Image from 'next/image';
import { useSitePlan } from '../lib/useSitePlan';
import { Button } from '@/components/ui/button';
import { Maximize, Calendar, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

interface SitePlanPreviewProps {
  projectId: string;
  className?: string;
}

export function SitePlanPreview({ projectId, className }: SitePlanPreviewProps) {
  const { sitePlan, loading, error, publicUrl } = useSitePlan(projectId);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Format date to a more readable format
  const uploadDate = sitePlan?.created_at 
    ? new Date(sitePlan.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    : 'Unknown';

  // Handle fullscreen toggle
  const toggleFullscreen = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    const imageEl = document.getElementById('site-plan-image');
    if (!imageEl) return;

    if (!isFullscreen) {
      if (imageEl.requestFullscreen) {
        imageEl.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  // Listen for fullscreen change events
  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className={cn("rounded-md overflow-hidden bg-gray-50 flex items-center justify-center p-8", className)}>
        <div className="flex flex-col items-center text-gray-500">
          <Loader2 className="h-8 w-8 animate-spin mb-2" />
          <span>Loading site plan...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={cn("rounded-md overflow-hidden bg-red-50 flex items-center justify-center p-8", className)}>
        <div className="flex flex-col items-center text-red-500">
          <AlertCircle className="h-8 w-8 mb-2" />
          <span>Error loading site plan</span>
          <span className="text-xs mt-1">{error}</span>
        </div>
      </div>
    );
  }

  // No site plan available
  if (!sitePlan || !publicUrl) {
    console.log('No site plan available:', { sitePlan, publicUrl });
    return (
      <div className={cn("rounded-md overflow-hidden bg-amber-50 flex items-center justify-center p-8", className)}>
        <div className="flex flex-col items-center text-amber-600">
          <AlertCircle className="h-8 w-8 mb-2" />
          <span>No site plan available</span>
          <span className="text-xs mt-1">Site plan has not been uploaded yet</span>
          {sitePlan && (
            <span className="text-xs mt-1">Project ID: {sitePlan.pool_project_id}, Path: {sitePlan.plan_path || 'No path'}</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative rounded-md overflow-hidden bg-white border", className)}>
      <div className="relative aspect-video w-full h-48 bg-gray-50">
        <Image
          id="site-plan-image"
          src={publicUrl}
          alt="Site Plan"
          className="object-contain"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onError={(e) => {
            console.error('Site plan image loading error:', e);
            console.error('Image URL that failed to load:', publicUrl);
            console.error('Site plan data:', sitePlan);
          }}
        />
      </div>

      {/* Controls overlay - only visible on hover */}
      <div className="absolute inset-0 bottom-auto flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity">
        <Button
          onClick={toggleFullscreen}
          size="sm"
          variant="secondary"
          className="bg-white/80 hover:bg-white"
        >
          <Maximize className="h-4 w-4 mr-1" />
          Full Screen
        </Button>
      </div>

      {/* Bottom info bar */}
      <div className="flex items-center justify-between p-2 text-xs text-gray-600 bg-white border-t">
        <div className="flex items-center">
          <Calendar className="h-3 w-3 mr-1" />
          <span>Added: {uploadDate}</span>
        </div>
        <div className="flex items-center">
          <span>Version: {sitePlan.version}</span>
        </div>
      </div>
    </div>
  );
}