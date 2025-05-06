/**
 * File: src/app/lib/types/pool-details.ts
 * Type definitions for pool names, descriptions, and images
 */

/**
 * Pool details interface
 */
export interface PoolDetail {
  name: string;
  description: string;
  heroImage: string;
  layoutImage: string;
}

/**
 * Pool details mapped by pool spec_name
 */
export const POOL_DETAILS: Record<string, PoolDetail> = {
  'Verona': {
    name: 'Verona',
    description: 'Part of our Latin Series, the Verona features a slimline geometric design perfect for narrow spaces and compact backyards. Its corner entry steps create an uninterrupted swim zone, while the full-length bench seat offers a generous relaxation area - the ideal balance of swimming space and comfort in a smaller footprint.',
    heroImage: '/_opt/verona-hero.webp',
    layoutImage: '/_opt/verona_layout.webp',
  },
  'Sheffield': {
    name: 'Sheffield',
    description: 'The Sheffield combines a modern rectangular design with practical features for family swimming. With its spacious interior and clean lines, it offers both aesthetic appeal and functionality for everyday use.',
    heroImage: '/_opt/sheffield-hero.webp',
    layoutImage: '/_opt/sheffield_layout.webp',
  },
  'Latina': {
    name: 'Latina',
    description: 'Our flagship Latina pool features a graceful curved design with wide entry steps and a generous swimming area. Perfect for both recreation and entertainment, it brings resort-style luxury to your backyard.',
    heroImage: '/_opt/latina-hero.webp',
    layoutImage: '/_opt/latina_layout.webp',
  },
  'Small Latina': {
    name: 'Small Latina',
    description: 'A compact version of our popular Latina design, offering the same elegant curves and quality features in a size perfect for smaller yards.',
    heroImage: '/_opt/small_latina.webp',
    layoutImage: '/_opt/small_latina_layout.webp',
  },
};

/**
 * Get pool details from spec name
 * @param specName Pool spec name from snapshot
 * @returns Pool details or default values if not found
 */
export function getPoolDetails(specName: string): PoolDetail {
  // Try exact match first
  if (POOL_DETAILS[specName]) {
    return POOL_DETAILS[specName];
  }
  
  // Try case-insensitive match
  const matchKey = Object.keys(POOL_DETAILS).find(
    key => key.toLowerCase() === specName.toLowerCase()
  );
  
  if (matchKey) {
    return POOL_DETAILS[matchKey];
  }
  
  // Return fallback/default values
  return {
    name: specName || 'Custom Pool',
    description: `The ${specName || 'Custom Pool'} is designed to perfectly complement your outdoor space with elegant proportions and quality construction.`,
    heroImage: '/_opt/verona-hero.webp', // Default hero image
    layoutImage: '/_opt/verona_layout.webp', // Default layout image
  };
}