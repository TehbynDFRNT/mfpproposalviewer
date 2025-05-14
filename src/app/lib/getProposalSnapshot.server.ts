/**
 * File: /Users/tehbynnova/Code/MyProjects/Web/mfp/src/app/lib/getProposalSnapshot.server.ts
 */
import { supabase } from '@/app/lib/supabaseClient'
import type { ProposalSnapshot } from '@/app/lib/types/snapshot'

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
    throw new Error(`Invalid customerUuid "${customerUuid}"`)
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

  // stamp it so UI knows exactly when it was fetched
  return {
    ...data,
    timestamp: new Date().toISOString(),
  }
}