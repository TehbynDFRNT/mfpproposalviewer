import camelcaseKeys from 'camelcase-keys'
import { supabase }         from './supabaseClient'
import type { Snapshot }     from './types/snapshot'

/** Fetch one fully-hydrated proposal snapshot, deeply camelCased */
export async function getProposalSnapshot(
  projectId: string
): Promise<Snapshot> {
  const { data, error } = await supabase
    .rpc('get_proposal_snapshot', { p_project_id: projectId })
    // tell Supabase we expect `body` to be a JSON object
    .single<{ body: Record<string, any> }>()

  if (error || !data) throw error

  // ◆ first assert to a plain object, then camel-case it, then assert to our Snapshot type
  const raw = data.body as Record<string, any>
  const camelized = camelcaseKeys(raw, { deep: true })
  return camelized as Snapshot
}