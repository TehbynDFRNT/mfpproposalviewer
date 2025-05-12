/**
 * File: /Users/tehbynnova/Code/MyProjects/Web/MFPProposalViewer/src/app/drawings/[customerUuid]/lib/renderStatusHandler.ts
 * Handles updating the render_ready status in the database
 */
import { supabase } from '@/app/lib/supabaseClient';

/**
 * Enables 3D rendering for a project by setting the render_ready flag to true
 * @param projectId The project ID to update
 * @returns Promise that resolves to a result object with success status and message
 */
export const enableRenderReady = async (
  projectId: string
): Promise<{ success: boolean; message: string }> => {
  if (!projectId) {
    return {
      success: false,
      message: "Missing project ID"
    };
  }

  try {
    // Update the pool_proposal_status with the render_ready flag
    const { error } = await supabase
      .from('pool_proposal_status')
      .update({ render_ready: true })
      .eq('pool_project_id', projectId);

    if (error) {
      console.error('Error enabling 3D render status:', error);
      return {
        success: false,
        message: `Failed to enable 3D visuals: ${error.message}`
      };
    }

    return {
      success: true,
      message: "3D visuals enabled for proposal"
    };
  } catch (error) {
    console.error("Unexpected error enabling 3D render status:", error);
    return {
      success: false,
      message: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

/**
 * Disables 3D rendering for a project by setting the render_ready flag to false
 * @param projectId The project ID to update
 * @returns Promise that resolves to a result object with success status and message
 */
export const disableRenderReady = async (
  projectId: string
): Promise<{ success: boolean; message: string }> => {
  if (!projectId) {
    return {
      success: false,
      message: "Missing project ID"
    };
  }

  try {
    // Update the pool_proposal_status with the render_ready flag set to false
    const { error } = await supabase
      .from('pool_proposal_status')
      .update({ render_ready: false })
      .eq('pool_project_id', projectId);

    if (error) {
      console.error('Error disabling 3D render status:', error);
      return {
        success: false,
        message: `Failed to disable 3D visuals: ${error.message}`
      };
    }

    return {
      success: true,
      message: "3D visuals disabled for proposal"
    };
  } catch (error) {
    console.error("Unexpected error disabling 3D render status:", error);
    return {
      success: false,
      message: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

/**
 * Checks the current 3D render ready status for a project
 * @param projectId The project ID to check
 * @returns Promise that resolves to a result object with success status, message, and the render_ready value
 */
export const checkRenderStatus = async (
  projectId: string
): Promise<{ success: boolean; message: string; isReady: boolean }> => {
  if (!projectId) {
    return {
      success: false,
      message: "Missing project ID",
      isReady: false
    };
  }

  try {
    // Query the pool_proposal_status to get the render_ready status
    const { data, error } = await supabase
      .from('pool_proposal_status')
      .select('render_ready')
      .eq('pool_project_id', projectId)
      .single();

    if (error) {
      console.error('Error checking 3D render status:', error);
      return {
        success: false,
        message: `Failed to check 3D visuals status: ${error.message}`,
        isReady: false
      };
    }

    return {
      success: true,
      message: "Successfully checked 3D visuals status",
      isReady: data?.render_ready === true
    };
  } catch (error) {
    console.error("Unexpected error checking 3D render status:", error);
    return {
      success: false,
      message: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      isReady: false
    };
  }
};