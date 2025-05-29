/**
 * File: /Users/tehbynnova/Code/MyProjects/Web/MFPProposalViewer/src/app/drawings/page.tsx
 * Drawings page without customerUuid - shows password verification for security
 */
import DrawingsPinVerification from "@/app/drawings/[customerUuid]/client/DrawingsPinVerification.client";

export default function DrawingsPage() {
  // Show password verification with no snapshot to prevent enumeration attacks
  return <DrawingsPinVerification snapshot={null} />;
}