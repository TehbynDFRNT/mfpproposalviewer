/**
 * File: /Users/tehbynnova/Code/MyProjects/Web/MFPProposalViewer/src/app/api/render-status/route.ts
 * API route for handling render status operations
 */
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

/**
 * Enables 3D rendering for a project by setting the render_ready flag to true
 * @param projectId The project ID to update
 */
async function enableRenderReady(projectId: string): Promise<{ success: boolean; message: string }> {
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
}

/**
 * Disables 3D rendering for a project by setting the render_ready flag to false
 * @param projectId The project ID to update
 */
async function disableRenderReady(projectId: string): Promise<{ success: boolean; message: string }> {
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
}

/**
 * Checks the current 3D render ready status for a project
 * @param projectId The project ID to check
 */
async function checkRenderStatus(projectId: string): Promise<{ success: boolean; message: string; isReady: boolean }> {
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
}

/**
 * POST handler for render status operations
 */
export async function POST(request: NextRequest) {
  try {
    const { operation, projectId } = await request.json();

    if (!operation || !projectId) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: operation and projectId' },
        { status: 400 }
      );
    }

    let result;
    switch (operation) {
      case 'enable':
        result = await enableRenderReady(projectId);
        break;
      case 'disable':
        result = await disableRenderReady(projectId);
        break;
      case 'check':
        result = await checkRenderStatus(projectId);
        break;
      default:
        return NextResponse.json(
          { success: false, message: `Invalid operation: ${operation}` },
          { status: 400 }
        );
    }

    return NextResponse.json(result, { status: result.success ? 200 : 500 });

  } catch (error) {
    console.error('Error in render status API route:', error);
    return NextResponse.json(
      {
        success: false,
        message: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}`
      },
      { status: 500 }
    );
  }
}