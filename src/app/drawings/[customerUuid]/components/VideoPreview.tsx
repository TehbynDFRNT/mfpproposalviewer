'use client';

/**
 * File: /Users/tehbynnova/Code/MyProjects/Web/MFPProposalViewer/src/app/drawings/[customerUuid]/components/VideoPreview.tsx
 * Component for displaying uploaded 3D render videos with controls
 */
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Maximize, X, Upload, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from "@/app/drawings/[customerUuid]/lib/utils";
import { supabase } from '@/app/lib/supabaseClient';
import { FileUploadStatus, UploadStatus } from "@/app/drawings/[customerUuid]/components/FileUploadStatus";

interface VideoData {
  video_type: string;
  video_path: string;
  created_at: string;
}

interface VideoPreviewProps {
  video: VideoData;
  onReplace?: (file: File) => void;
  className?: string;
  videoType?: string;
  uploadStatus?: {
    status: UploadStatus;
    message: string;
    file: File | null;
  };
}

export function VideoPreview({ video, onReplace, className, videoType, uploadStatus }: VideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Handle file selection from hidden input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onReplace) {
      onReplace(file);
    }
  };

  // Format date to a more readable format
  const uploadDate = new Date(video.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  // Handle play/pause
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (!isFullscreen) {
        if (videoRef.current.requestFullscreen) {
          videoRef.current.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
      setIsFullscreen(!isFullscreen);
    }
  };

  // Listen for fullscreen change events
  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Get the public URL for the video using Supabase's getPublicUrl method
  const { data } = supabase
    .storage
    .from('3d-renders')
    .getPublicUrl(video.video_path);

  const videoUrl = video.video_path.startsWith('http')
    ? video.video_path
    : data?.publicUrl || '';

  // Log for debugging purposes
  useEffect(() => {
    console.log('Video data:', video);
    console.log('Supabase public URL data:', data);
    console.log('Final video URL:', videoUrl);
    console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  }, [video, data, videoUrl]);

  return (
    <div className={cn("relative rounded-md overflow-hidden bg-black/5", className)}>
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-auto rounded-md"
        onEnded={() => setIsPlaying(false)}
        onError={(e) => {
          console.error('Video loading error:', e);
          console.error('Video element:', videoRef.current);
          console.error('Video URL that failed:', videoUrl);
        }}
        onLoadedData={() => console.log('Video loaded successfully:', videoUrl)}
        controlsList="nodownload"
        playsInline
      />

      {/* Video controls overlay - only covering the video area, not the bottom info bar */}
      <div className="absolute inset-0 bottom-auto flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity z-10" style={{ bottom: '36px' }}>
        <div className="flex gap-2">
          <Button
            onClick={togglePlay}
            size="sm"
            variant="secondary"
            className="bg-white/80 hover:bg-white"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button
            onClick={toggleFullscreen}
            size="sm"
            variant="secondary"
            className="bg-white/80 hover:bg-white"
          >
            <Maximize className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Bottom info bar - with higher z-index to ensure clickable buttons */}
      <div className="flex flex-col p-2 text-xs text-gray-600 bg-white border-t relative z-20">
        <div className="flex items-center justify-between">
          <span>Uploaded: {uploadDate}</span>

          {onReplace && (
            <>
              <input
                type="file"
                id={`replace-video-${videoType || 'default'}`}
                className="hidden"
                accept="video/mp4,video/x-m4v,video/*"
                onChange={handleFileChange}
                ref={fileInputRef}
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                size="sm"
                variant={uploadStatus?.status === 'success' ? "default" : "outline"}
                className={cn(
                  "h-7 px-2 text-xs",
                  uploadStatus?.status === 'success' && "bg-green-600 hover:bg-green-700 text-white"
                )}
                disabled={uploadStatus?.status === 'loading'}
              >
                {uploadStatus?.status === 'loading' ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Uploading...
                  </>
                ) : uploadStatus?.status === 'success' ? (
                  <>
                    <Check className="h-3 w-3 mr-1" />
                    Replaced
                  </>
                ) : (
                  <>
                    <Upload className="h-3 w-3 mr-1" />
                    Replace
                  </>
                )}
              </Button>
            </>
          )}
        </div>

        {/* Show upload status if applicable */}
        {uploadStatus && uploadStatus.status !== 'idle' && (
          <div className="mt-2">
            <FileUploadStatus
              status={uploadStatus.status}
              message={uploadStatus.message}
              file={uploadStatus.file}
            />
          </div>
        )}
      </div>
    </div>
  );
}

