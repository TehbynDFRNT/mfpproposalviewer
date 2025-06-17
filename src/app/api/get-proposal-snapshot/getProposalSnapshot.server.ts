/**
 * File: /Users/tehbynnova/Code/MyProjects/Web/mfp/src/app/lib/getProposalSnapshot.server.ts
 */
import { supabase } from '@/lib/supabaseClient'
import type { ProposalSnapshot } from '@/types/snapshot'

/** very simple UUID check */
function isValidUuid(uuid: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
}

/**
 * Fetches a proposal snapshot directly from the SQL view.
 * Should only be called from server components or API routes.
 */
export async function getProposalSnapshot(customerUuid: string): Promise<ProposalSnapshot> {
  if (!isValidUuid(customerUuid)) {
    console.log(`[getProposalSnapshot] Invalid UUID format: ${customerUuid?.slice(0, 8)}...`)
    throw new Error(`Invalid customerUuid format`)
  }

  const { data, error } = await supabase
    .from('proposal_snapshot_v')
    .select('*')
    .eq('project_id', customerUuid)
    .maybeSingle()

  if (error) {
    console.error('[getProposalSnapshot]', error)
    throw new Error(`DB error: ${error.message}`)
  }

  if (!data) {
    throw new Error(`No proposal found for customerUuid "${customerUuid}"`)
  }

  // Log the discount data for debugging
  console.log('[getProposalSnapshot] Fetched data discounts:', {
    hasDiscounts: !!data.applied_discounts_json,
    discountCount: data.applied_discounts_json?.length || 0,
    discounts: data.applied_discounts_json
  });

  // stamp it so UI knows exactly when it was fetched
  return {
    ...data,
    timestamp: new Date().toISOString(),
  }
}