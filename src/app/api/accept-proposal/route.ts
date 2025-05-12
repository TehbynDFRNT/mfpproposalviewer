/**
 * File: src/app/api/accept-proposal/route.ts
 * API endpoint for updating proposal status to accepted when PIN is verified
 */
import { NextResponse } from 'next/server'
import { supabaseServer } from '@/app/lib/supabaseClient'

export async function POST(request: Request) {
  try {
    // Check request origin for security
    const origin = request.headers.get('origin')
    // Allow only requests from our own domain in production
    const allowedOrigins = [process.env.NEXT_PUBLIC_APP_URL || '']
    // In development, allow localhost
    if (process.env.NODE_ENV === 'development') {
      allowedOrigins.push('http://localhost:3000')
    }

    if (origin && !allowedOrigins.includes(origin)) {
      return NextResponse.json({ error: 'Unauthorized origin' }, { status: 403 })
    }

    // Extract IP address for record-keeping
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1'
    
    const { customerUuid, pin } = await request.json()

    if (!customerUuid) {
      return NextResponse.json({ error: 'Missing customer UUID' }, { status: 400 })
    }

    // First verify that this customer UUID exists and check the PIN if provided
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

    // Check if proposal is already accepted
    if (statusData.status === 'accepted') {
      return NextResponse.json(
        { error: 'Proposal has already been accepted' },
        { status: 400 }
      )
    }

    // If PIN is provided and required, verify it matches
    if (statusData.pin && (!pin || pin !== statusData.pin)) {
      return NextResponse.json({ error: 'Invalid PIN' }, { status: 403 })
    }

    // Update the status row to mark as accepted with timestamp and IP
    const { data, error } = await supabaseServer
      .from('pool_proposal_status')
      .update({
        accepted_datetime: new Date().toISOString(),
        accepted_ip: ip,
        status: 'accepted',
        last_viewed: new Date().toISOString(), // Also update last_viewed
      })
      .eq('pool_project_id', customerUuid)
      .select()

    if (error) {
      console.error('Failed to update proposal status:', error)
      return NextResponse.json(
        { error: 'Failed to update proposal status', details: error.message },
        { status: 500 }
      )
    }

    // Log the successful acceptance for analytics
    console.log(`Proposal accepted: ${customerUuid} at ${new Date().toISOString()} from IP ${ip}`)

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Proposal accepted successfully',
      data
    })
  } catch (err) {
    console.error('Error in accept-proposal API:', err)
    return NextResponse.json(
      { error: 'Internal error', details: (err as Error).message },
      { status: 500 }
    )
  }
}