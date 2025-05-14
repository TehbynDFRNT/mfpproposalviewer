/**
 * File: src/app/api/update-viewed-status/route.ts
 * API endpoint for updating proposal status to viewed when PIN is verified
 */
import { NextResponse } from 'next/server'
import { supabaseServer } from '@/app/lib/supabaseClient'

export async function POST(request: Request) {
  try {

    const { customerUuid, pin } = await request.json()

    if (!customerUuid) {
      return NextResponse.json({ error: 'Missing customer UUID' }, { status: 400 })
    }

    // First verify that this customer UUID exists and check the PIN if provided
    // Also retrieve current status to determine if we should update it
    const { data: statusData, error: fetchError } = await supabaseServer
      .from('pool_proposal_status')
      .select('pool_project_id, pin, status')
      .eq('pool_project_id', customerUuid)
      .single()

    if (fetchError || !statusData) {
      return NextResponse.json(
        { error: 'Proposal not found', details: fetchError?.message },
        { status: 404 }
      )
    }

    // If PIN is provided, verify it matches
    if (pin && statusData.pin && pin !== statusData.pin) {
      return NextResponse.json({ error: 'Invalid PIN' }, { status: 403 })
    }

    // Create an update object that always includes the timestamp
    const updateObj: { last_viewed: string; status?: string } = {
      last_viewed: new Date().toISOString(),
    };

    // Only set status to 'viewed' if current status is not 'accepted' or 'change_requested'
    const currentStatus = statusData.status;
    if (currentStatus !== 'accepted' && currentStatus !== 'change_requested') {
      updateObj.status = 'viewed';
    }

    // Update the status row
    const { data, error } = await supabaseServer
      .from('pool_proposal_status')
      .update(updateObj)
      .eq('pool_project_id', customerUuid)
      .select()

    if (error) {
      console.error('Failed to update proposal status:', error)
      return NextResponse.json(
        { error: 'Failed to update proposal status', details: error.message },
        { status: 500 }
      )
    }

    // Log the successful view for analytics, noting if we preserved an existing status
    if (currentStatus === 'accepted' || currentStatus === 'change_requested') {
      console.log(`Proposal viewed (preserved status '${currentStatus}'): ${customerUuid} at ${new Date().toISOString()}`);
    } else {
      console.log(`Proposal viewed: ${customerUuid} at ${new Date().toISOString()}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Proposal status updated to viewed',
      data
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: 'Internal error', details: (err as Error).message },
      { status: 500 }
    )
  }
}