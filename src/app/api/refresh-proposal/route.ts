/**
 * File: src/app/api/refresh-proposal/route.ts
 * API endpoint for refreshing proposal data
 */
import { NextResponse } from 'next/server'
import { getProposalSnapshot } from '@/app/lib/getProposalSnapshot.server'

export async function GET(request: Request) {
  try {

    // Extract customer UUID from the query params
    const { searchParams } = new URL(request.url)
    const customerUuid = searchParams.get('customerUuid')

    if (!customerUuid) {
      return NextResponse.json({ error: 'Missing customer UUID' }, { status: 400 })
    }

    // Get fresh proposal data
    const freshSnapshot = await getProposalSnapshot(customerUuid)

    if (!freshSnapshot) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
    }

    // Log the refresh for analytics
    console.log(`Proposal data refreshed: ${customerUuid} at ${new Date().toISOString()}`)

    // Return the fresh snapshot
    return NextResponse.json(freshSnapshot)
  } catch (err) {
    console.error('Error refreshing proposal data:', err)
    return NextResponse.json(
      { error: 'Internal error', details: (err as Error).message },
      { status: 500 }
    )
  }
}