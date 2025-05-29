/**
 * File: /Users/tehbynnova/Code/MyProjects/Web/MFPProposalViewer/src/app/proposal/page.tsx
 * Proposal page without customerUuid - shows PIN verification for security
 */
import PinVerification from "@/app/proposal/[customerUuid]/client/PinVerification.client";

export default function ProposalPage() {
  // Show PIN verification with no snapshot to prevent enumeration attacks
  return <PinVerification snapshot={null} />;
}