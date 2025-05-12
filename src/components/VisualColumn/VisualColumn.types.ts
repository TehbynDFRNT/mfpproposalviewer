/**
 * File: src/components/VisualColumn/VisualColumn.types.ts
 */
import type { ProposalSnapshot } from '@/app/lib/types/snapshot';

// Visual types
export type MapVisual = {
  type: 'map';
  address: string;
  /** optional: centre the map if we already geocoded on the backend */
  coordinates?: { lat: number; lng: number };
};

export type VideoVisual = {
  type: 'video';
  videoName: string;
  alt?: string;
};

export type ImageVisual = {
  type: 'image';
  src: string;
  alt?: string;
};

// New type for 3D renders from Supabase
export type RenderVisual = {
  type: '3d';
  videoPath: string; // Supabase storage path
  videoType: string; // Category ID
  createdAt: string; // Timestamp for freshness
  alt?: string;
};

// Type for site plans from Supabase
export type SitePlanVisual = {
  type: 'siteplan';
  planPath: string; // Supabase storage path
  publicUrl: string; // Public URL from Supabase storage
  version: number; // Site plan version
  createdAt: string; // Timestamp for freshness
  alt?: string;
};

// Modified to represent local fallback content
export type PlaceholderVisual = {
  type: 'placeholder';
  name: string;
  fallbackType?: 'video' | 'image';
  fallbackSrc?: string; // Local path to fallback content
};

export type Visual = MapVisual | VideoVisual | ImageVisual | PlaceholderVisual | RenderVisual | SitePlanVisual;

export interface VisualColumnProps {
  activeSection: string;
  subIndex: number;
  isLoaded: boolean;                       // G-Maps
  mapCenter: { lat: number; lng: number } | null;
  snapshot: ProposalSnapshot;
  resetScroll: () => void;
  use3DVisuals?: boolean;                 // Toggle for using 3D renders from Supabase
}