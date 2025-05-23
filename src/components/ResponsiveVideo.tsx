/**
 * File: src/components/ResponsiveVideo.tsx
 */

// components/ResponsiveVideo.tsx
import React, { useEffect, useRef } from 'react';

type VideoProps = React.ComponentProps<'video'> & {
  baseName: string;
};

export function ResponsiveVideo({
  baseName,
  autoPlay = true,     // default true
  ...props
}: VideoProps) {
  const ref = useRef<HTMLVideoElement>(null);

  /* force-play once the element is mounted */
  useEffect(() => {
    if (autoPlay && ref.current) {
      ref.current
        .play()
        .catch(() => {
          /* silently ignore "NotAllowedError" if browser still blocks */
        });
    }
  }, [autoPlay]);

  return (
    <video
      ref={ref}
      {...props}
      autoPlay={autoPlay}
      muted
      loop
      playsInline
    >
      <source src={`/Unique3D/${baseName}-720.webm`}  type="video/webm" />
      <source src={`/Unique3D/${baseName}-1080.mp4`} type="video/mp4" />
      Sorry, your browser doesn&apos;t support embedded video.
    </video>
  );
}