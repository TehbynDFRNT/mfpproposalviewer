/**
 * File: /Users/tehbynnova/Code/MyProjects/Web/MFPProposalViewer/src/app/api/trigger-compression/route.ts
 * API endpoint to manually trigger video compression for testing or re-processing
 * This endpoint simulates what the Supabase Edge Function will do
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const RENDI_API_KEY = process.env.RENDI_API_KEY!;

interface TriggerCompressionRequest {
  projectId: string;
  videoType: string;
}

export async function POST(req: NextRequest) {
  try {
    const { projectId, videoType }: TriggerCompressionRequest = await req.json();

    if (!projectId || !videoType) {
      return NextResponse.json(
        { error: 'Missing required fields: projectId and videoType' },
        { status: 400 }
      );
    }

    // Fetch the video record
    const { data: videoRecord, error: fetchError } = await supabase
      .from('3d')
      .select('*')
      .eq('pool_project_id', projectId)
      .eq('video_type', videoType)
      .single();

    if (fetchError || !videoRecord) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    // Check if already compressed
    if (videoRecord.compression_status === 'completed' && videoRecord.compressed_path) {
      return NextResponse.json(
        { message: 'Video already compressed', compressed_path: videoRecord.compressed_path },
        { status: 200 }
      );
    }

    // Create a signed URL for the original video
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('3d-renders')
      .createSignedUrl(videoRecord.video_path, 300); // 5 minutes

    if (signedUrlError || !signedUrlData?.signedUrl) {
      console.error('Failed to create signed URL:', signedUrlError);
      return NextResponse.json(
        { error: 'Failed to create signed URL' },
        { status: 500 }
      );
    }

    // Prepare Rendi API request (matching Edge Function settings)
    const rendiPayload = {
      ffmpeg_command: "-i {{in_1}} -c:v libx264 -preset veryfast -crf 26 -movflags +faststart {{out_1}}",
      input_files: { in_1: signedUrlData.signedUrl },
      output_files: { out_1: "compressed.mp4" },
      max_command_run_seconds: 900 // 15 minutes
    };

    // Call Rendi API
    const rendiResponse = await fetch("https://api.rendi.dev/v1/run-ffmpeg-command", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": RENDI_API_KEY,
      },
      body: JSON.stringify(rendiPayload),
    });

    if (!rendiResponse.ok) {
      const errorText = await rendiResponse.text();
      console.error('Rendi API error:', errorText);
      return NextResponse.json(
        { error: 'Failed to start compression', details: errorText },
        { status: 500 }
      );
    }

    const rendiData = await rendiResponse.json();

    // Update database with processing status
    const { error: updateError } = await supabase
      .from('3d')
      .update({
        compression_status: 'processing',
        rendi_command_id: rendiData.command_id,
        updated_at: new Date().toISOString()
      })
      .eq('pool_project_id', projectId)
      .eq('video_type', videoType);

    if (updateError) {
      console.error('Failed to update compression status:', updateError);
    }

    return NextResponse.json({
      message: 'Compression started',
      command_id: rendiData.command_id,
      status: 'processing'
    });

  } catch (error) {
    console.error('Error triggering compression:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}