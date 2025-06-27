/**
 * File: /Users/tehbynnova/Code/MyProjects/Web/MFPProposalViewer/src/app/api/invoke-compression/route.ts
 * API endpoint to invoke the video-compress Edge Function with proper authentication
 * This acts as a proxy to handle auth server-side
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Use service role key for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,          // ok – URL can be public
  process.env.SUPABASE_SERVICE_ROLE_KEY!          // make sure **no NEXT_PUBLIC_**
);

interface InvokeCompressionRequest {
  bucketId: string;
  name: string;
}

export async function POST(req: NextRequest) {
  try {
    const { bucketId, name }: InvokeCompressionRequest = await req.json();

    if (!bucketId || !name) {
      return NextResponse.json(
        { error: 'Missing required fields: bucketId and name' },
        { status: 400 }
      );
    }

    // Invoke the Edge Function with service role auth
    const { data, error } = await supabase.functions.invoke('video-compress', {
      body: { bucketId, name }
    });

    if (error) {
      console.error('Failed to invoke compression function:', error);
      return NextResponse.json(
        { error: 'Failed to trigger compression', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Compression triggered successfully',
      data
    });

  } catch (error) {
    console.error('Error invoking compression:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}