/**
 * File: /Users/tehbynnova/Code/MyProjects/Web/mfp/src/app/proposal/[customerUuid]/loading.tsx
 * Enhanced loading component that shows a card-based loader similar to the PIN verification screen
 */
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function LoadingProposal() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#07032D] proposal-background">
      <Card className="w-[350px] shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto h-6 w-1/2 animate-pulse rounded-md bg-muted"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 w-3/4 mx-auto animate-pulse rounded-md bg-muted"></div>
            <div className="h-4 w-2/3 mx-auto animate-pulse rounded-md bg-muted"></div>

            <div className="flex justify-center gap-2 py-4">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-9 w-9 animate-pulse rounded-md bg-muted"
                  style={{
                    animationDelay: `${i * 100}ms`
                  }}
                ></div>
              ))}
            </div>

            <div className="h-10 w-full animate-pulse rounded-md bg-muted"></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}