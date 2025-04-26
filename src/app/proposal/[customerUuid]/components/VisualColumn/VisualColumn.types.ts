import type { ProposalData } from '@/types/proposal';

// Visual types
export type MapVisual = {
  type: 'map';
  address: string;
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
  proposalData: ProposalData;
  resetScroll: () => void;
}