/**
 * File: /Users/tehbynnova/Code/MyProjects/Web/MFPProposalViewer/src/app/drawings/[customerUuid]/loading.tsx
 * Loading state for the drawings page
 */
export default function LoadingDrawings() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#07032D] text-white">
      <div className="animate-pulse text-lg font-medium">Loading 3D render portal…</div>
    </div>
  );
}