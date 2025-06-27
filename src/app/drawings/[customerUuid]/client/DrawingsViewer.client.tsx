'use client';

/**
 * File: /Users/tehbynnova/Code/MyProjects/Web/MFPProposalViewer/src/app/drawings/[customerUuid]/DrawingsViewer.client.tsx
 * Client component for the drawings page - follows the same structure as ProposalViewer.client.tsx
 */
import React, { useState, useEffect, useMemo } from 'react';
import type { ProposalSnapshot } from '@/types/snapshot';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, Upload, Camera, Image as ImageIcon, FileVideo, MapPin, LayoutGrid, Grid3X3, Loader2, Map } from 'lucide-react';
import { InputFile } from "@/components/Drawings/InputFile";
// Import motion from framer-motion
import { motion } from 'framer-motion';
// Import directly from source to avoid the barrel file
import Header from '@/components/Header/Header';
// Import from local components folder
import SimpleFooter from "@/components/Drawings/SimpleFooter";
import Image from 'next/image';
// Import application constants
import { CATEGORY_IDS, CATEGORY_NAMES } from '@/lib/constants';
import { isSectionEmpty } from '@/lib/utils';
import { VideoPreview } from "@/components/Drawings/VideoPreview";
import { SitePlanPreview } from "@/components/Drawings/SitePlanPreview";
import { cn } from "@/lib/utils";
import { areAllRequiredVideosPresent } from "@/lib/videoRequirementsChecker";
// Import custom hooks
import { useVideos } from "@/hooks/use-videos";
import { useUploads } from "@/hooks/use-uploads";
import { useCompressionRealtime } from "@/hooks/use-compression-realtime";

export interface DrawingsViewerProps {
  snapshot: ProposalSnapshot;
}

export default function DrawingsViewer({ snapshot }: DrawingsViewerProps) {
  // Use the useVideos hook to fetch and manage videos
  const { videos, refresh: refreshVideos, findVideoByType } = useVideos(snapshot.project_id);
  
  // Use the useUploads hook for handling file uploads
  const { 
    uploadStatus, 
    fileRefs,
    handleFileChange,
    uploadFile,
    processAllFiles,
    replaceVideo,
    setStatus
  } = useUploads(snapshot.project_id, refreshVideos);

  // Subscribe to realtime compression status updates
  useCompressionRealtime(snapshot.project_id, refreshVideos);

  // Check if all sections are complete
  const is3DReady = useMemo(() => 
    areAllRequiredVideosPresent(videos, snapshot),
    [videos, snapshot]
  );

  // Helper to render a section card with conditional video display
  const renderSectionCard = (videoType: string, title: string, description: string, icon: React.ReactNode) => {
    const existingVideo = findVideoByType(videoType);

    return (
      <Card className="bg-white overflow-hidden border border-[#DB9D6A]/20">
        <CardHeader className="p-4 bg-[#DB9D6A]/10">
          <div className="flex items-center gap-2">
            {icon}
            <CardTitle>{title}</CardTitle>
          </div>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          {/* Check if we have an existing video for this type */}
          {existingVideo ? (
            <div className="space-y-3">
              <VideoPreview
                video={existingVideo}
                videoType={videoType}
                uploadStatus={uploadStatus[videoType]}
                onReplace={(file) => replaceVideo(file, videoType)}
              />
            </div>
          ) : (
            <>
              <InputFile
                id={`${videoType}-render`}
                label="3D Render Video"
                accept="video/mp4,video/x-m4v,video/*"
                onChange={(e) => handleFileChange(e, videoType)}
                ref={fileRefs[videoType as keyof typeof fileRefs]}
                status={uploadStatus[videoType]?.status || 'idle'}
                statusMessage={uploadStatus[videoType]?.message}
                selectedFile={uploadStatus[videoType]?.file}
              />
              <div className="mt-4 flex justify-end">
                <Button
                  className="gap-2"
                  onClick={() => uploadFile(videoType)}
                  disabled={uploadStatus[videoType]?.status === 'loading'}
                >
                  {uploadStatus[videoType]?.status === 'loading' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  Upload Video
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-[#07032D] proposal-background">
      {/* Header - same as proposal page */}
      <Header />

      {/* Main Content - similar layout but simpler than proposal */}
      <main className="flex flex-col flex-1 pt-16 lg:pb-16 overscroll-none">
        <div className="w-full proposal-left pb-5 lg:pb-0 lg:sticky lg:top-16 lg:h-[calc(100vh-8rem)] lg:overflow-y-auto proposal-content relative">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="major-section w-full flex flex-col p-8 pb-8 lg:pb-0 overflow-hidden"
          >
              {/* Admin header */}
              <h2 className="header-welcome font-bold font-sans text-white text-2xl lg:text-3xl mb-6">
                3D Render <span className="header-owners text-2xl lg:text-3xl !text-[#DB9D6A]">Upload Portal</span>
              </h2>

              <p className="text-white/90 mb-6">
                Upload 3D render videos for customer: <span className="font-semibold text-[#DB9D6A]">{snapshot.owner1} {snapshot.owner2 ? `& ${snapshot.owner2}` : ''}</span>
                <span className="text-sm ml-2 text-white/60">(ID: {snapshot.project_id?.slice(0, 8)})</span>
              </p>

              {/* Status Message */}
              {uploadStatus.general?.status && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="mb-8"
                >
                  <div className={cn(
                    "p-4 rounded-md",
                    uploadStatus.general.status === 'success' ? "bg-green-100 text-green-800 border border-green-200" :
                    uploadStatus.general.status === 'error' ? "bg-red-100 text-red-800 border border-red-200" :
                    "bg-blue-100 text-blue-800 border border-blue-200"
                  )}>
                    {uploadStatus.general.message}
                  </div>
                </motion.div>
              )}

              {/* Site Plan Preview Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <Card className="bg-white overflow-hidden border border-[#DB9D6A]/20">
                  <CardHeader className="p-4 bg-[#DB9D6A]/10">
                    <div className="flex items-center gap-2">
                      <Map className="h-5 w-5 text-[#DB9D6A]" />
                      <CardTitle>Site Plan</CardTitle>
                    </div>
                    <CardDescription>Current site plan from external design tool</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    <SitePlanPreview projectId={snapshot.project_id || ''} className="w-full" />
                  </CardContent>
                </Card>
              </div>

            {/* Upload cards for each major section */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">

                {/* Pool Selection Section - Always show as it's a core section */}
                {renderSectionCard(
                  CATEGORY_IDS.POOL_SELECTION,
                  CATEGORY_NAMES[CATEGORY_IDS.POOL_SELECTION],
                  "Pool model 3D visualization",
                  <LayoutGrid className="h-5 w-5 text-[#DB9D6A]" />
                )}

                {/* Site Requirements Section - intentionally removed as it always uses FrannaCrane video */}

                {/* Filtration & Maintenance - Always show as it's a core section */}
                {renderSectionCard(
                  CATEGORY_IDS.FILTRATION_MAINTENANCE,
                  CATEGORY_NAMES[CATEGORY_IDS.FILTRATION_MAINTENANCE],
                  "Equipment operation visualization",
                  <FileVideo className="h-5 w-5 text-[#DB9D6A]" />
                )}

                {/* Concrete & Paving - Show only if not empty */}
                {!isSectionEmpty(CATEGORY_IDS.CONCRETE_PAVING, snapshot) && renderSectionCard(
                  CATEGORY_IDS.CONCRETE_PAVING,
                  CATEGORY_NAMES[CATEGORY_IDS.CONCRETE_PAVING],
                  "Surface finishes visualization",
                  <FileVideo className="h-5 w-5 text-[#DB9D6A]" />
                )}

                {/* Fencing Section - Show only if not empty */}
                {!isSectionEmpty(CATEGORY_IDS.FENCING, snapshot) && renderSectionCard(
                  CATEGORY_IDS.FENCING,
                  CATEGORY_NAMES[CATEGORY_IDS.FENCING],
                  "Safety barrier visualization",
                  <FileVideo className="h-5 w-5 text-[#DB9D6A]" />
                )}

                {/* Retaining Walls - Show only if not empty */}
                {!isSectionEmpty(CATEGORY_IDS.RETAINING_WALLS, snapshot) && renderSectionCard(
                  CATEGORY_IDS.RETAINING_WALLS,
                  CATEGORY_NAMES[CATEGORY_IDS.RETAINING_WALLS],
                  "Structural visualization",
                  <FileVideo className="h-5 w-5 text-[#DB9D6A]" />
                )}

                {/* Water Feature - Show only if not empty */}
                {!isSectionEmpty(CATEGORY_IDS.WATER_FEATURE, snapshot) && renderSectionCard(
                  CATEGORY_IDS.WATER_FEATURE,
                  CATEGORY_NAMES[CATEGORY_IDS.WATER_FEATURE],
                  "Water effects visualization",
                  <FileVideo className="h-5 w-5 text-[#DB9D6A]" />
                )}

                {/* Add-Ons - Show only if not empty */}
                {!isSectionEmpty(CATEGORY_IDS.ADD_ONS, snapshot) && renderSectionCard(
                  CATEGORY_IDS.ADD_ONS,
                  CATEGORY_NAMES[CATEGORY_IDS.ADD_ONS],
                  "Premium features visualization",
                  <FileVideo className="h-5 w-5 text-[#DB9D6A]" />
                )}

                {/* Proposal Summary - Always include this as it's a core section */}
                {renderSectionCard(
                  CATEGORY_IDS.PROPOSAL_SUMMARY,
                  CATEGORY_NAMES[CATEGORY_IDS.PROPOSAL_SUMMARY],
                  "Final proposal overview",
                  <FileVideo className="h-5 w-5 text-[#DB9D6A]" />
                )}
              </div>
            </motion.div>
          </div>
        </main>

        {/* Simple Footer without navigation */}
        <SimpleFooter
          snapshot={snapshot}
          is3DReady={is3DReady}
          onStatusChange={(message, status) => {
            setStatus('general', {
              status: status,
              message: message,
              file: null
            });
          }}
        />
      </div>
  );
}