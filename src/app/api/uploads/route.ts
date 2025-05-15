/**
 * File: /Users/tehbynnova/Code/MyProjects/Web/MFPProposalViewer/src/app/api/uploads/route.ts
 * API route for handling file uploads to Supabase storage
 */
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { CATEGORY_IDS } from '@/lib/constants';

/**
 * Uploads a video file to Supabase storage and creates or updates a database record
 * @param file The file to upload
 * @param videoType The section category ID (e.g., 'pool-selection-section')
 * @param projectId The project ID from the snapshot
 * @param isReplacement Whether this is replacing an existing video
 * @returns Promise that resolves when upload is complete
 */
export const handleUpload = async (
  file: File,
  videoType: string,
  projectId: string,
  isReplacement: boolean = false
): Promise<{ success: boolean; message: string }> => {
  if (!file || !projectId) {
    return {
      success: false,
      message: "Missing file or project ID"
    };
  }

  // Validate that videoType is a valid category ID
  const validVideoTypes = [
    CATEGORY_IDS.POOL_SELECTION,
    CATEGORY_IDS.FILTRATION_MAINTENANCE,
    CATEGORY_IDS.CONCRETE_PAVING,
    CATEGORY_IDS.FENCING,
    CATEGORY_IDS.RETAINING_WALLS,
    CATEGORY_IDS.WATER_FEATURE,
    CATEGORY_IDS.ADD_ONS,
    CATEGORY_IDS.SITE_REQUIREMENTS,
    CATEGORY_IDS.PROPOSAL_SUMMARY
  ];

  if (!validVideoTypes.includes(videoType)) {
    return {
      success: false,
      message: `Invalid video type: ${videoType}`
    };
  }

  try {
    // Check if we already have a video of this type for this project
    if (isReplacement) {
      // Find the existing video record to get its path
      const { data: existingVideos, error: queryError } = await supabase
        .from('3d')
        .select('*')
        .eq('pool_project_id', projectId)
        .eq('video_type', videoType);

      if (queryError) {
        console.error("Error querying existing videos:", queryError);
        return {
          success: false,
          message: `Failed to check for existing videos: ${queryError.message}`
        };
      }

      // If found, delete the old file from storage
      if (existingVideos && existingVideos.length > 0) {
        const oldPath = existingVideos[0].video_path;
        if (oldPath) {
          const { error: deleteError } = await supabase.storage
            .from('3d-renders')
            .remove([oldPath]);

          if (deleteError) {
            console.warn("Could not delete old video file:", deleteError);
            // Continue with replacement even if old file deletion fails
          }
        }
      }
    }

    // Upload the file to Supabase Storage
    const filePath = `${projectId}/${videoType}-${Date.now()}.mp4`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('3d-renders')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return {
        success: false,
        message: `Upload failed: ${uploadError.message}`
      };
    }

    if (isReplacement) {
      // Update the existing record
      const { error: updateError } = await supabase
        .from('3d')
        .update({
          video_path: filePath,
          created_at: new Date().toISOString(),
        })
        .eq('pool_project_id', projectId)
        .eq('video_type', videoType);

      if (updateError) {
        console.error("Update in '3d' table failed:", updateError);
        return {
          success: false,
          message: `Database update failed: ${updateError.message}`
        };
      }

      return {
        success: true,
        message: "Video replaced successfully"
      };
    } else {
      // Insert a new record
      const { error: insertError } = await supabase
        .from('3d')
        .insert([
          {
            pool_project_id: projectId,
            video_path: filePath,
            video_type: videoType,
            created_at: new Date().toISOString(),
          },
        ]);

      if (insertError) {
        console.error("Insert into '3d' table failed:", insertError);
        return {
          success: false,
          message: `Database record failed: ${insertError.message}`
        };
      }

      return {
        success: true,
        message: "Video uploaded and reference saved successfully"
      };
    }
  } catch (error) {
    console.error("Unexpected error during upload:", error);
    return {
      success: false,
      message: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

/**
 * POST handler for file uploads
 * Takes a file, video type, and project ID in a FormData object
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const videoType = formData.get('videoType') as string;
    const projectId = formData.get('projectId') as string;
    const isReplacement = formData.get('isReplacement') === 'true';

    if (!file || !videoType || !projectId) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await handleUpload(file, videoType, projectId, isReplacement);
    
    return NextResponse.json(
      result,
      { status: result.success ? 200 : 500 }
    );
  } catch (error) {
    console.error('Error in upload API route:', error);
    return NextResponse.json(
      {
        success: false,
        message: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}`
      },
      { status: 500 }
    );
  }
}