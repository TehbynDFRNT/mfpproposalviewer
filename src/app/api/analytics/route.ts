/**
 * File: /Users/tehbynnova/Code/MyProjects/Web/MFPProposalViewer/src/app/api/analytics/route.ts
 * API route for handling analytics events
 */
import { NextRequest, NextResponse } from 'next/server';
import { isClient } from '@/lib/utils';

// Get Jitsu configuration from environment variables
const JITSU_WRITE_KEY = process.env.JITSU_WRITE_KEY || '';

// Jitsu base domain and track endpoint
const JITSU_DOMAIN = 'data.jitsu.mfp.dfrntgroup.com';
const JITSU_TRACK_URL = `https://${JITSU_DOMAIN}/api/s/track`;

/**
 * Generate a unique message ID for events
 */
function generateMessageId(): string {
  return 'mfp_' + Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

/**
 * POST handler for analytics events
 */
export async function POST(request: NextRequest) {
  try {
    const eventData = await request.json();
    
    if (!JITSU_WRITE_KEY) {
      console.error('Missing Jitsu configuration (JITSU_WRITE_KEY)');
      return NextResponse.json(
        { success: false, message: 'Jitsu configuration missing' },
        { status: 500 }
      );
    }

    // Prepare event for Jitsu in the correct format based on documentation
    const jitsuEvent = {
      ...eventData,
      type: eventData.type || 'track', // Default to track if not specified
      event: eventData.event || eventData.properties?.event_name || 'custom_event',
      messageId: eventData.messageId || generateMessageId(),
      timestamp: eventData.timestamp || new Date().toISOString(),
      sentAt: eventData.sentAt || new Date().toISOString(),
      context: {
        ...eventData.context,
        library: {
          name: 'mfp-proposal-viewer',
          version: '1.0.0'
        }
      }
    };

    // Send event to Jitsu using the provided tracking endpoint with proper authentication
    const jitsuResponse = await fetch(JITSU_TRACK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Write-Key': JITSU_WRITE_KEY
      },
      body: JSON.stringify(jitsuEvent),
    });

    if (!jitsuResponse.ok) {
      let errorText = '';
      try {
        errorText = await jitsuResponse.text();
      } catch (e) {
        errorText = 'Could not read error response body';
      }
      console.error('Jitsu API error:', jitsuResponse.status, errorText);
      return NextResponse.json(
        { success: false, message: 'Error forwarding event to Jitsu', details: errorText },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, message: 'Event processed successfully' });
  } catch (error) {
    console.error('Error processing analytics event:', error);
    return NextResponse.json(
      { success: false, message: 'Error processing event' },
      { status: 500 }
    );
  }
}