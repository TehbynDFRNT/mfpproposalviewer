/**
 * React-Server Component wrapper – fetches data, then streams the
 * heavy viewer as a client-only bundle.
 */
import { getProposalData } from '@/lib/getProposalData';
import ProposalViewer       from './ProposalViewer.client';

// Next 15: `params` is now a *Promise* – so we await it first.
export default async function ProposalPage({
  params,
}: {
  /** awaited later ↓                                    */
  params: Promise<{ customerUuid: string }>;
}) {
  const { customerUuid } = await params;          // ✅ no console warning
  const proposalData     = await getProposalData(customerUuid);

  return <ProposalViewer initialData={proposalData} />;
}