'use client';

/**
 * File: /Users/tehbynnova/Code/MyProjects/Web/MFPProposalViewer/src/app/drawings/[customerUuid]/DrawingsViewer.client.tsx
 * Client component for the drawings page - follows the same structure as ProposalViewer.client.tsx
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { ProposalSnapshot } from '@/app/lib/types/snapshot';
import { supabase } from '@/app/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, Upload, Camera, Image as ImageIcon, FileVideo, MapPin, LayoutGrid, Grid3X3, Loader2, Map } from 'lucide-react';
import { InputFile } from "@/app/drawings/[customerUuid]/components/InputFile";
// Import motion from framer-motion
import { motion } from 'framer-motion';
// Import directly from source to avoid the barrel file
import Header from '@/components/Header/Header';
// Import from local components folder
import SimpleFooter from "@/app/drawings/[customerUuid]/components/SimpleFooter";
import Image from 'next/image';
import { handleUpload, processAllUploads } from "@/app/drawings/[customerUuid]/lib/uploadHandler";
// Import application constants
import { CATEGORY_IDS, CATEGORY_NAMES } from '@/app/lib/constants';
import { isSectionEmpty } from '@/app/lib/utils';
import { UploadStatus } from "@/app/drawings/[customerUuid]/components/FileUploadStatus";
import { VideoPreview } from "@/app/drawings/[customerUuid]/components/VideoPreview";
import { SitePlanPreview } from "@/app/drawings/[customerUuid]/components/SitePlanPreview";
import { cn } from "@/app/drawings/[customerUuid]/lib/utils";

export interface DrawingsViewerProps {
  snapshot: ProposalSnapshot;
}

export default function DrawingsViewer({ snapshot }: DrawingsViewerProps) {
  const [uploadStatus, setUploadStatus] = useState<Record<string, {
    status: UploadStatus;
    message: string;
    file: File | null;
  }>>({});

  // Add state to store the videos
  const [videos, setVideos] = useState<Array<{
    video_type: string;
    video_path: string;
    created_at: string;
  }>>(snapshot.videos_json || []);

  // Track when to refresh videos
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Helper function to find video by type
  const findVideoByType = (videoType: string) => {
    if (!videos || !Array.isArray(videos)) return null;
    return videos.find(video => video.video_type === videoType) || null;
  };

  // Function to fetch videos from Supabase
  const refreshVideos = useCallback(async () => {
    if (!snapshot.project_id) return;

    try {
      const { data, error } = await supabase
        .from('3d')
        .select('video_type, video_path, created_at')
        .eq('pool_project_id', snapshot.project_id);

      if (error) {
        console.error('Error fetching videos:', error);
        return;
      }

      if (data) {
        setVideos(data);
        console.log('Videos refreshed:', data);
      }
    } catch (err) {
      console.error('Error in refreshVideos:', err);
    }
  }, [snapshot.project_id]);

  // Refresh videos when the refreshTrigger changes
  useEffect(() => {
    refreshVideos();
  }, [refreshTrigger, refreshVideos]);

  // Create refs to hold the selected files for each section
  const fileRefs = {
    [CATEGORY_IDS.POOL_SELECTION]: useRef<HTMLInputElement>(null),
    [CATEGORY_IDS.SITE_REQUIREMENTS]: useRef<HTMLInputElement>(null),
    [CATEGORY_IDS.FILTRATION_MAINTENANCE]: useRef<HTMLInputElement>(null),
    [CATEGORY_IDS.CONCRETE_PAVING]: useRef<HTMLInputElement>(null),
    [CATEGORY_IDS.FENCING]: useRef<HTMLInputElement>(null),
    [CATEGORY_IDS.RETAINING_WALLS]: useRef<HTMLInputElement>(null),
    [CATEGORY_IDS.WATER_FEATURE]: useRef<HTMLInputElement>(null),
    [CATEGORY_IDS.ADD_ONS]: useRef<HTMLInputElement>(null)
  };

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
                onReplace={(file) => {
                  // Set the selected file in the upload status and show loading state
                  setUploadStatus(prev => ({
                    ...prev,
                    [videoType]: {
                      status: 'loading',
                      message: 'Uploading replacement video...',
                      file: file
                    }
                  }));

                  // Automatically trigger upload with the new file - set isReplacement to true
                  handleUpload(
                    file,
                    videoType,
                    snapshot.project_id || 'unknown',
                    true // This is a replacement
                  ).then(result => {
                    // Update status based on result
                    setUploadStatus(prev => ({
                      ...prev,
                      [videoType]: {
                        status: result.success ? 'success' : 'error',
                        message: result.message,
                        file: file
                      }
                    }));

                    // If successful, trigger a refresh of the videos data
                    if (result.success) {
                      // Wait 1 second to show the success state before refreshing
                      setTimeout(() => {
                        setRefreshTrigger(prev => prev + 1);
                      }, 1000);
                    }
                  });
                }}
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

  // Handle file selection and upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, videoType: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Update status immediately to show the selected file
    setUploadStatus(prev => ({
      ...prev,
      [videoType]: {
        status: 'selected',
        message: 'Ready to upload',
        file: file
      }
    }));
  };

  // Upload file for a specific section
  const uploadFile = async (videoType: string) => {
    const inputElement = fileRefs[videoType as keyof typeof fileRefs]?.current;
    const file = inputElement?.files?.[0] || null;

    // Get the currently selected file from state if available
    const currentFile = uploadStatus[videoType]?.file || file;

    if (!currentFile) {
      setUploadStatus(prev => ({
        ...prev,
        [videoType]: {
          status: 'error',
          message: 'No file selected',
          file: null
        }
      }));
      return;
    }

    // Show loading status for this specific video type
    setUploadStatus(prev => ({
      ...prev,
      [videoType]: {
        status: 'loading',
        message: 'Uploading...',
        file: currentFile
      }
    }));

    const result = await handleUpload(
      currentFile,
      videoType, // Using the category ID directly for video_type column
      snapshot.project_id || 'unknown'
    );

    // Update status based on result - only for this specific video type
    setUploadStatus(prev => ({
      ...prev,
      [videoType]: {
        status: result.success ? 'success' : 'error',
        message: result.message,
        file: currentFile
      }
    }));

    // If upload was successful, trigger a refresh of the videos data
    if (result.success) {
      // Force refresh videos and check 3D readiness again
      console.log('Upload successful, refreshing videos and checking 3D readiness');
      setTimeout(() => {
        setRefreshTrigger(prev => prev + 1);
        // Explicitly recalculate is3DReady after refresh
        setTimeout(() => {
          const ready = checkAllSectionsComplete();
          console.log('After upload - Is 3D ready?', ready);
          setIs3DReady(ready);
        }, 500);
      }, 1000);
    }
  };

  // Check if we have videos for all required sections
  const checkAllSectionsComplete = () => {
    // Core sections are always required
    const coreRequiredSections = [
      CATEGORY_IDS.POOL_SELECTION,
      CATEGORY_IDS.FILTRATION_MAINTENANCE,
      CATEGORY_IDS.PROPOSAL_SUMMARY
    ];

    // Optional sections - only include if they're not empty
    const optionalSections = [
      CATEGORY_IDS.CONCRETE_PAVING,
      CATEGORY_IDS.FENCING,
      CATEGORY_IDS.RETAINING_WALLS,
      CATEGORY_IDS.WATER_FEATURE,
      CATEGORY_IDS.ADD_ONS
    ];

    // Filter to include only non-empty optional sections
    const nonEmptyOptionalSections = optionalSections.filter(
      section => !isSectionEmpty(section, snapshot)
    );

    // Log which optional sections are included
    console.log('Non-empty optional sections:', nonEmptyOptionalSections);

    // Combine core and non-empty optional sections
    const requiredSections = [...coreRequiredSections, ...nonEmptyOptionalSections];
    console.log('Total required sections:', requiredSections.length);

    if (!videos || !Array.isArray(videos) || videos.length === 0) {
      console.log('No videos found');
      return false;
    }

    // Create a set of available video types
    const availableTypes = new Set(videos.map(video => video.video_type));

    // Log information for debugging
    console.log('Required sections:', requiredSections);
    console.log('Available types:', Array.from(availableTypes));

    // Check if all required sections have videos
    const allSectionsComplete = requiredSections.every(section => availableTypes.has(section));
    console.log('All sections complete:', allSectionsComplete);

    return allSectionsComplete;
  };

  // State for tracking if proposal is ready to use 3D visuals
  const [is3DReady, setIs3DReady] = useState(checkAllSectionsComplete());

  // Update 3D readiness when videos change
  useEffect(() => {
    setIs3DReady(checkAllSectionsComplete());
  }, [videos]);

  // This function is now handled by SimpleFooter component and renderStatusHandler.ts
  // Keeping this as a placeholder to avoid breaking any references, but the function is no longer used
  const enableProposal3DVisuals = async () => {
    console.warn('enableProposal3DVisuals is deprecated. Use SimpleFooter component instead.');
    return;
  };

  // Process all selected files
  const processAllFiles = async () => {
    // Collect all files from refs and state
    const files: Record<string, File | null> = {};
    Object.entries(fileRefs).forEach(([videoType, ref]) => {
      // First check if we have a file in state
      const stateFile = uploadStatus[videoType]?.file;
      if (stateFile) {
        files[videoType] = stateFile;
      }
      // Otherwise check the ref
      else if (ref.current?.files?.[0]) {
        files[videoType] = ref.current.files[0];
      }
    });

    // Check if any files were selected
    if (Object.keys(files).length === 0) {
      setUploadStatus({
        general: {
          status: 'error',
          message: 'No files selected',
          file: null
        }
      });
      return;
    }

    // Update status for each file that will be uploaded
    Object.entries(files).forEach(([videoType, file]) => {
      if (file) {
        setUploadStatus(prev => ({
          ...prev,
          [videoType]: {
            status: 'loading',
            message: 'Uploading...',
            file
          }
        }));
      }
    });

    // Upload all files - videoType is directly used for DB column
    const results = await processAllUploads(
      files,
      snapshot.project_id || 'unknown'
    );

    // Update status for each file based on results
    Object.entries(results.results).forEach(([videoType, message]) => {
      const file = files[videoType];
      setUploadStatus(prev => ({
        ...prev,
        [videoType]: {
          status: message.includes('successfully') ? 'success' : 'error',
          message,
          file
        }
      }));
    });

    // Add a general success/error message
    setUploadStatus(prev => ({
      ...prev,
      general: {
        status: results.success ? 'success' : 'error',
        message: results.success ?
          'All files uploaded successfully' :
          'Some files failed to upload',
        file: null
      }
    }));

    // If any uploads were successful, trigger a refresh of the videos data
    if (results.success) {
      console.log('Batch upload successful, refreshing videos and checking 3D readiness');
      setTimeout(() => {
        setRefreshTrigger(prev => prev + 1);
        // Explicitly recalculate is3DReady after refresh
        setTimeout(() => {
          const ready = checkAllSectionsComplete();
          console.log('After batch upload - Is 3D ready?', ready);
          setIs3DReady(ready);
        }, 500);
      }, 1000);
    }
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
            setUploadStatus(prev => ({
              ...prev,
              general: {
                status: status,
                message: message,
                file: null
              }
            }));
          }}
        />
      </div>
  );
}