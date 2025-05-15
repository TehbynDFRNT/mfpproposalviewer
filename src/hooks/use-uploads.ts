'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { handleUpload, processAllUploads } from '@/lib/uploadHandler';
import type { StatusMap, UploadStatusRecord, FileRefMap } from '@/types/video';
import { CATEGORY_IDS } from '@/lib/constants';

interface UseUploadsResult {
  uploadStatus: StatusMap;
  fileRefs: FileRefMap;
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>, videoType: string) => void;
  uploadFile: (videoType: string) => Promise<void>;
  processAllFiles: () => Promise<void>;
  replaceVideo: (file: File, videoType: string) => Promise<void>;
  setStatus: (videoType: string, status: UploadStatusRecord) => void;
}

/**
 * Hook for managing file uploads and upload status
 * 
 * @param projectId The project ID to associate uploads with
 * @param onUploadSuccess Optional callback for when an upload succeeds
 * @returns Methods and state for managing file uploads
 */
export function useUploads(
  projectId: string | undefined,
  onUploadSuccess?: () => void
): UseUploadsResult {
  const [uploadStatus, setUploadStatus] = useState<StatusMap>({});

  // Create refs for each category
  const poolSelectionRef = React.useRef<HTMLInputElement>(null);
  const siteRequirementsRef = React.useRef<HTMLInputElement>(null);
  const filtrationMaintenanceRef = React.useRef<HTMLInputElement>(null);
  const concretePavingRef = React.useRef<HTMLInputElement>(null);
  const fencingRef = React.useRef<HTMLInputElement>(null);
  const retainingWallsRef = React.useRef<HTMLInputElement>(null);
  const waterFeatureRef = React.useRef<HTMLInputElement>(null);
  const addOnsRef = React.useRef<HTMLInputElement>(null);
  const proposalSummaryRef = React.useRef<HTMLInputElement>(null);
  
  // Create an object to store refs
  const fileRefs = useMemo<FileRefMap>(() => ({
    [CATEGORY_IDS.POOL_SELECTION]: poolSelectionRef,
    [CATEGORY_IDS.SITE_REQUIREMENTS]: siteRequirementsRef,
    [CATEGORY_IDS.FILTRATION_MAINTENANCE]: filtrationMaintenanceRef,
    [CATEGORY_IDS.CONCRETE_PAVING]: concretePavingRef,
    [CATEGORY_IDS.FENCING]: fencingRef,
    [CATEGORY_IDS.RETAINING_WALLS]: retainingWallsRef,
    [CATEGORY_IDS.WATER_FEATURE]: waterFeatureRef,
    [CATEGORY_IDS.ADD_ONS]: addOnsRef,
    [CATEGORY_IDS.PROPOSAL_SUMMARY]: proposalSummaryRef
  }), []);

  // Set a specific status record
  const setStatus = useCallback((videoType: string, status: UploadStatusRecord) => {
    setUploadStatus(prev => ({
      ...prev,
      [videoType]: status
    }));
  }, []);

  // Handle file selection
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>, videoType: string) => {
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
  }, []);

  // Handle replacing an existing video
  const replaceVideo = useCallback(async (file: File, videoType: string) => {
    if (!projectId) {
      setStatus(videoType, {
        status: 'error',
        message: 'Missing project ID',
        file: null
      });
      return;
    }

    // Set loading status
    setStatus(videoType, {
      status: 'loading',
      message: 'Uploading replacement video...',
      file
    });

    try {
      // Perform the upload with isReplacement=true
      const result = await handleUpload(
        file,
        videoType,
        projectId,
        true // This is a replacement
      );

      // Update status based on result
      setStatus(videoType, {
        status: result.success ? 'success' : 'error',
        message: result.message,
        file
      });

      // If successful, trigger callback
      if (result.success && onUploadSuccess) {
        // Wait 1 second to show the success state before callback
        setTimeout(() => {
          onUploadSuccess();
        }, 1000);
      }
    } catch (error) {
      console.error('Error replacing video:', error);
      setStatus(videoType, {
        status: 'error',
        message: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        file
      });
    }
  }, [projectId, onUploadSuccess, setStatus]);

  // Upload a single file
  const uploadFile = useCallback(async (videoType: string) => {
    if (!projectId) {
      setStatus(videoType, {
        status: 'error',
        message: 'Missing project ID',
        file: null
      });
      return;
    }

    // Get the file from refs or status
    const inputElement = fileRefs[videoType].current;
    const file = inputElement?.files?.[0] || uploadStatus[videoType]?.file;

    if (!file) {
      setStatus(videoType, {
        status: 'error',
        message: 'No file selected',
        file: null
      });
      return;
    }

    // Set loading status
    setStatus(videoType, {
      status: 'loading',
      message: 'Uploading...',
      file
    });

    try {
      // Perform the upload
      const result = await handleUpload(
        file,
        videoType,
        projectId
      );

      // Update status based on result
      setStatus(videoType, {
        status: result.success ? 'success' : 'error',
        message: result.message,
        file
      });

      // If successful, trigger callback
      if (result.success && onUploadSuccess) {
        // Wait 1 second to show the success state before callback
        setTimeout(() => {
          onUploadSuccess();
        }, 1000);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setStatus(videoType, {
        status: 'error',
        message: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        file
      });
    }
  }, [projectId, fileRefs, uploadStatus, onUploadSuccess, setStatus]);

  // Process all selected files
  const processAllFiles = useCallback(async () => {
    if (!projectId) {
      setUploadStatus(prev => ({
        ...prev,
        general: {
          status: 'error',
          message: 'Missing project ID',
          file: null
        }
      }));
      return;
    }

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
      setUploadStatus(prev => ({
        ...prev,
        general: {
          status: 'error',
          message: 'No files selected',
          file: null
        }
      }));
      return;
    }

    // Update status for each file that will be uploaded
    Object.entries(files).forEach(([videoType, file]) => {
      if (file) {
        setStatus(videoType, {
          status: 'loading',
          message: 'Uploading...',
          file
        });
      }
    });

    try {
      // Upload all files
      const results = await processAllUploads(
        files,
        projectId
      );

      // Update status for each file based on results
      Object.entries(results.results).forEach(([videoType, message]) => {
        const file = files[videoType];
        setStatus(videoType, {
          status: message.includes('successfully') ? 'success' : 'error',
          message,
          file
        });
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

      // If any uploads were successful, trigger callback
      if (results.success && onUploadSuccess) {
        setTimeout(() => {
          onUploadSuccess();
        }, 1000);
      }
    } catch (error) {
      console.error('Error processing all files:', error);
      setUploadStatus(prev => ({
        ...prev,
        general: {
          status: 'error',
          message: `Batch upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          file: null
        }
      }));
    }
  }, [projectId, fileRefs, uploadStatus, onUploadSuccess, setStatus]);

  return {
    uploadStatus,
    fileRefs,
    handleFileChange,
    uploadFile,
    processAllFiles,
    replaceVideo,
    setStatus
  };
}