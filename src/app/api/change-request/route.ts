/**
 * File: src/app/api/change-request/route.ts
 * API endpoint for handling proposal change requests
 */
import { NextResponse } from 'next/server'
import { supabaseServer } from '@/app/lib/supabaseClient'
import { randomUUID } from 'crypto'

export async function POST(request: Request) {
  try {
    const { customerUuid, changes } = await request.json()
    if (!customerUuid || !changes) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // 1) Fetch the single row from pool_proposal_status
    const { data: statusRow, error: statusErr } = await supabaseServer
      .from('pool_proposal_status')
      .select('*')
      .eq('pool_project_id', customerUuid)
      .single()

    if (statusErr || !statusRow) {
      return NextResponse.json(
        { error: 'Proposal status not found', details: statusErr?.message },
        { status: 404 }
      )
    }

    // 2) Insert into change_requests, but use your real FK column name
    const changeRequestId = randomUUID()
    // Create the change request object first
    const changeRequestObj = {
      sections: changes.selectedSections,
      answers: changes.answers,
      timestamp: new Date().toISOString(),
    }
    
    // Then stringify it for database storage - this is stored as jsonb in PostgreSQL
    const changeRequestJson = JSON.stringify(changeRequestObj)

    const { data: newCR, error: insertError } = await supabaseServer
      .from('change_requests')
      .insert({
        change_request_id: changeRequestId,
        // Using the correct FK column name that matches the database schema
        pool_proposal_status_id: customerUuid,
        change_request_json: changeRequestJson,
      })
      .select('*')
      .single()

    if (insertError) {
      console.error('Could not insert CR:', insertError)
      return NextResponse.json(
        { error: 'Failed to save change request', details: insertError.message },
        { status: 500 }
      )
    }

    // 3) Update the status row
    const { error: updErr } = await supabaseServer
      .from('pool_proposal_status')
      .update({
        last_change_requested: new Date().toISOString(),
        status: 'change_requested',
      })
      .eq('pool_project_id', customerUuid)

    if (updErr) {
      console.warn('Failed to update proposal status:', updErr.message)
    }

    return NextResponse.json({
      success: true,
      changeRequest: newCR,
      message: 'Change request submitted successfully',
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: 'Internal error', details: (err as Error).message },
      { status: 500 }
    )
  }
}