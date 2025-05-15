Below is a practical pattern that keeps your current UX (Framer-motion wrapper, click-to-expand, responsive sizing) while letting the thumbnail work for either an image or a single-page PDF pulled from Supabase.

1 — Add a very small helper to detect file-type
ts
Copy
Edit
// /src/lib/getExtension.ts
export const getExtension = (path: string | undefined) =>
  path?.split('.').pop()?.toLowerCase() ?? '';
2 — Augment useSitePlan so the hook tells the UI what it’s dealing with
diff
Copy
Edit
@@
- const [sitePlanVisual, setSitePlanVisual] = useState<SitePlanVisual | null>(null);
+ const [sitePlanVisual, setSitePlanVisual] = useState<SitePlanVisual | null>(null);
+ const [isPdf, setIsPdf] = useState(false);
@@ inside fetchSitePlan()
-       if (sitePlanData.plan_path) {
+       if (sitePlanData.plan_path) {
            …
-               if (publicUrlValue) {
+               if (publicUrlValue) {
                    setSitePlanVisual({
                      type: 'siteplan',
                      planPath: sitePlanData.plan_path,
                      publicUrl: publicUrlValue,
                      version: sitePlanData.version,
                      createdAt: sitePlanData.created_at,
                      alt: 'Property Site Plan'
                    });
+                   setIsPdf(getExtension(sitePlanData.plan_path) === 'pdf');
                }
Return it:

ts
Copy
Edit
return { sitePlan, loading, error, publicUrl, refreshSitePlan, sitePlanVisual, isPdf };
3 — Lightweight PDF-to-canvas component (client-only)
ts
Copy
Edit
// /src/components/PdfThumb.tsx
'use client';
import { useEffect, useRef } from 'react';
import * as pdfjs from 'pdfjs-dist/build/pdf';
import 'pdfjs-dist/build/pdf.worker.entry';

interface Props {
  url: string;
  width: number;
  height: number;
  className?: string;
}
export default function PdfThumb({ url, width, height, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const pdf = await pdfjs.getDocument({ url }).promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 1 });
      const scale = Math.min(width / viewport.width, height / viewport.height);
      const scaled = page.getViewport({ scale });

      const canvas = canvasRef.current;
      if (!canvas || !mounted) return;
      canvas.width = scaled.width;
      canvas.height = scaled.height;
      await page.render({ canvasContext: canvas.getContext('2d')!, viewport: scaled }).promise;
    })();

    return () => { mounted = false; };
  }, [url, width, height]);

  return <canvas ref={canvasRef} className={className} />;
}
Why this route?
• pdfjs-dist lets you render just the first page in-memory—no external services, no iframe security quirks.
• The canvas behaves exactly like an <img>; Framer-motion and Tailwind sizing don’t change.

4 — Swap the <Image> for a conditional renderer in VisualColumn
diff
Copy
Edit
@@
- <Image
-   src={sitePlanVisual?.publicUrl || '/Unique2D/siteplan.webp'}
-   alt="Property Site Plan"
-   className="object-contain"
-   fill
-   sizes={sitePlanExpanded ? '384px' : '192px'}
- />
+ {isPdf ? (
+   <PdfThumb
+     url={sitePlanVisual?.publicUrl || ''}
+     width={sitePlanExpanded ? 384 : 192}
+     height={sitePlanExpanded ? 288 : 144}
+     className="w-full h-full object-contain"
+   />
+ ) : (
+   <Image
+     src={sitePlanVisual?.publicUrl || '/Unique2D/siteplan.webp'}
+     alt="Property Site Plan"
+     className="object-contain"
+     fill
+     sizes={sitePlanExpanded ? '384px' : '192px'}
+   />
+ )}
Remember to import the new bits at the top of the file:

ts
Copy
Edit
import PdfThumb from '@/components/PdfThumb';
import { getExtension } from '@/lib/getExtension';
…and pull isPdf out of the hook:

ts
Copy
Edit
const { sitePlanVisual, isPdf } = useSitePlan(snapshot?.project_id);
