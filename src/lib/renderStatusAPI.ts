/**
 * Client for interacting with the render status API
 */

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
    const response = await fetch('/api/render-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operation: 'enable',
        projectId
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.error('Failed to enable 3D visuals:', response.status, errorData);
      return {
        success: false,
        message: `Failed to enable 3D visuals: ${errorData.message || 'Unknown error'}`
      };
    }
    
    const result = await response.json();
    return result;
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
    const response = await fetch('/api/render-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operation: 'disable',
        projectId
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.error('Failed to disable 3D visuals:', response.status, errorData);
      return {
        success: false,
        message: `Failed to disable 3D visuals: ${errorData.message || 'Unknown error'}`
      };
    }
    
    const result = await response.json();
    return result;
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
    const response = await fetch('/api/render-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operation: 'check',
        projectId
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.error('Failed to check 3D visuals status:', response.status, errorData);
      return {
        success: false,
        message: `Failed to check 3D visuals status: ${errorData.message || 'Unknown error'}`,
        isReady: false
      };
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Unexpected error checking 3D render status:", error);
    return {
      success: false,
      message: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      isReady: false
    };
  }
};