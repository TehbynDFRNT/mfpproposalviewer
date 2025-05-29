/**
 * File: src/components/VisualColumn/VisualRenderer.tsx
 * 
 * Component that renders different types of visuals based on the visual type
 */
'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { GoogleMap, Marker } from '@react-google-maps/api';
import { ResponsiveVideo } from '@/components/ResponsiveVideo';
import { Card, CardContent } from '@/components/ui/card';
import { Box } from 'lucide-react';
import { fadeOut, visualIn } from '@/lib/animation';
import type { Visual } from './VisualColumn.types';

// Type for render3DContent
interface Render3DContent {
  videoUrl: string | null;
  isEmpty: boolean;
}

interface VisualRendererProps {
  visual: Visual;
  mapCenter: { lat: number; lng: number } | null;
  isLoaded: boolean;
  render3DContent?: Render3DContent | null;
  use3DVisuals?: boolean;
}

export function VisualRenderer({
  visual,
  mapCenter,
  isLoaded,
  render3DContent,
  use3DVisuals
}: VisualRendererProps) {
  console.log('VisualRenderer received visual:', visual);
  switch (visual.type) {
    case 'map':
      // Use coordinates from visual if available
      const mapCoordinates = visual.coordinates || mapCenter;

      return (
        <motion.div
          key="map"
          variants={{ ...fadeOut, ...visualIn }}
          initial="initial"
          animate="enter"
          exit="exit"
          className="w-full h-full flex justify-center items-start"
        >
          {isLoaded && mapCoordinates ? (
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '100%' }}
              center={mapCoordinates}
              zoom={21}
              options={{
                mapTypeId: 'satellite',
                disableDefaultUI: true,
                clickableIcons: false,
                maxZoom: 21,
                tilt: 0,
                styles: [
                  { featureType: 'all', elementType: 'labels', stylers: [{ visibility: 'off' }] },
                  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
                  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
                  { featureType: 'road', stylers: [{ visibility: 'off' }] },
                  { featureType: 'administrative', stylers: [{ visibility: 'off' }] }
                ]
              }}
            >
              <Marker position={mapCoordinates} />
            </GoogleMap>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-white">Loading map for {visual.address || 'property'}...</p>
            </div>
          )}
        </motion.div>
      );

    case '3d':
      // Use the precomputed render3DContent from the useMemo hook
      return (
        <motion.div
          key={`3d-${visual.videoType}-${visual.createdAt}`}
          variants={{ ...fadeOut, ...visualIn }}
          initial="initial"
          animate="enter"
          exit="exit"
          className="w-full h-full flex justify-center items-start"
        >
          {/* Section is empty and not included */}
          {render3DContent?.isEmpty && (
            <div className="w-full h-full flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <div className="text-white text-center p-8">
                <h3 className="text-xl font-medium mb-2">Section not included</h3>
                <p className="text-white/60">
                  This optional section is not active in the proposal
                </p>
              </div>
            </div>
          )}

          {/* Section has a valid URL */}
          {!render3DContent?.isEmpty && render3DContent?.videoUrl && (
            <video
              src={render3DContent.videoUrl}
              className="w-full h-full object-cover object-top"
              autoPlay
              muted
              playsInline
              loop
            />
          )}

          {/* Section should have content but URL is missing */}
          {!render3DContent?.isEmpty && !render3DContent?.videoUrl && (
            <div className="w-full h-full flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <div className="text-white text-center p-8">
                <h3 className="text-xl font-medium mb-2">3D visual not available</h3>
                <p className="text-white/60">
                  Using default visual content instead
                </p>
              </div>
            </div>
          )}
        </motion.div>
      );

    case 'video':
      console.log('Rendering video:', visual.videoName);
      return (
        <motion.div
          key={`video-${visual.videoName}`}
          variants={{ ...fadeOut, ...visualIn }}
          initial="initial"
          animate="enter"
          exit="exit"
          className="w-full h-full flex justify-center items-start relative"
        >
          <ResponsiveVideo
            baseName={visual.videoName}
            className="w-full h-full object-cover object-top"
            autoPlay={true}
            controls={false}
            loop={true}
          />
          {/* Show 3D pending message when placeholder is playing and 3D is disabled */}
          {visual.videoName === 'placeholder' && !use3DVisuals && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Card className="bg-white/60 shadow-lg border-0">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 justify-center">
                    <Box className="w-4 h-4 text-blue-500" />
                    <p className="text-sm font-medium">Your 3D Render is Pending</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </motion.div>
      );

    case 'image':
      return (
        <motion.div
          key={`image-${visual.src}`}
          variants={{ ...fadeOut, ...visualIn }}
          initial="initial"
          animate="enter"
          exit="exit"
          className="w-full h-full flex justify-center items-start"
        >
          <Image
            src={visual.src}
            alt={visual.alt || 'Visual'}
            className="w-full h-full object-cover object-top"
            width={800}
            height={600}
          />
        </motion.div>
      );

    case 'placeholder':
      // Improved placeholder that can show fallback content while waiting for 3D
      return (
        <motion.div
          key={`placeholder-${visual.name}`}
          variants={{ ...fadeOut, ...visualIn }}
          initial="initial"
          animate="enter"
          exit="exit"
          className="w-full h-full relative"
        >
          {/* Show fallback content in the background */}
          {visual.fallbackType === 'video' && visual.fallbackSrc && (
            <div className="absolute inset-0 z-0 opacity-40">
              <ResponsiveVideo
                baseName={visual.fallbackSrc}
                className="w-full h-full object-cover object-top"
                autoPlay={true}
              />
            </div>
          )}

          {visual.fallbackType === 'image' && visual.fallbackSrc && (
            <div className="absolute inset-0 z-0 opacity-40">
              <Image
                src={visual.fallbackSrc}
                alt="Fallback Visual"
                className="w-full h-full object-cover object-top"
                width={800}
                height={600}
              />
            </div>
          )}

          {/* Loading overlay */}
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="text-white text-center p-8">
              <h3 className="text-xl font-medium mb-2">{visual.name}</h3>
              <p className="text-white/60">
                {use3DVisuals ? "Loading custom 3D visualization..." : "Visual content is being prepared"}
              </p>
            </div>
          </div>
        </motion.div>
      );
      
    default:
      return null;
  }
}