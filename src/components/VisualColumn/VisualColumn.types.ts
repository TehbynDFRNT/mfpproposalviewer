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

export type PlaceholderVisual = {
  type: 'placeholder';
  name: string;
};

export type Visual = MapVisual | VideoVisual | ImageVisual | PlaceholderVisual;

export interface VisualColumnProps {
  activeSection: string;
  subIndex: number;
  isLoaded: boolean;                       // G-Maps
  mapCenter: { lat: number; lng: number } | null;
  snapshot: ProposalSnapshot;
  resetScroll: () => void;
}