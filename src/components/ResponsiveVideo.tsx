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
  
  console.log(`ResponsiveVideo component mounted with baseName: ${baseName}`);

  /* force-play once the element is mounted */
  useEffect(() => {
    console.log(`ResponsiveVideo useEffect running for ${baseName}`);
    if (autoPlay && ref.current) {
      const video = ref.current;
      console.log(`Attempting to play ${baseName}, video element exists:`, !!video);
      console.log(`Video readyState: ${video.readyState}, networkState: ${video.networkState}`);
      
      // Add loadedmetadata listener
      const handleLoadedMetadata = () => {
        console.log(`${baseName} metadata loaded, attempting play`);
        video.play()
          .then(() => {
            console.log(`Successfully started playing ${baseName}`);
          })
          .catch((error) => {
            console.error(`Failed to play ${baseName} after metadata:`, error);
          });
      };
      
      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      
      // Try to play immediately if ready
      if (video.readyState >= 2) {
        video.play()
          .then(() => {
            console.log(`Successfully started playing ${baseName} immediately`);
          })
          .catch((error) => {
            console.error(`Failed to play ${baseName} immediately:`, error);
          });
      }
      
      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };
    }
    
    return () => {
      console.log(`ResponsiveVideo cleanup for ${baseName}`);
    };
  }, [autoPlay, baseName]);

  const webmSrc = `/Unique3D/${baseName}-720.webm`;
  const mp4Src = `/Unique3D/${baseName}-1080.mp4`;
  
  console.log(`Video sources: webm=${webmSrc}, mp4=${mp4Src}`);
  
  return (
    <video
      ref={ref}
      {...props}
      autoPlay={autoPlay}
      muted
      loop
      playsInline
    >
      <source src={webmSrc}  type="video/webm" />
      <source src={mp4Src} type="video/mp4" />
      Sorry, your browser doesn&apos;t support embedded video.
    </video>
  );
}