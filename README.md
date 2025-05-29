# MFP Pool Proposal Viewer

A Next.js application for MFP Pools to showcase interactive pool proposals and accept client uploads.

## Overview

This application provides two main features:
- **Proposal Viewer**: An interactive proposal viewer for clients to review their pool projects
- **Drawings Viewer**: An admin portal for uploading 3D renders and site plans

## Getting Started

First, run the development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Key Features

### Proposal Viewer (`/proposal/[customerUuid]`)
- **Interactive Sections**: Browse through each aspect of the pool proposal
- **Visual Elements**: 3D renders, maps, images, and videos for each section
- **Price Calculator**: Dynamic price calculation based on selected options
- **Acceptance Flow**: Digital proposal acceptance with record keeping

### Drawings Viewer (`/drawings/[customerUuid]`)
- **3D Render Upload**: Upload section-specific 3D render videos
- **Site Plan Display**: View and manage site plans
- **Render Toggle**: Enable/disable 3D renders for client viewing
- **Proposal Navigation**: Quick link to view the associated proposal

## Architecture

The application follows Next.js App Router architecture with a focus on:
- Server components for data fetching
- Client components for interactive UI
- Supabase for data storage
- TypeScript for type safety

### Recent Improvements

#### Price Calculator Architecture (Latest)
- **Centralized Calculations**: Refactored all pricing logic into `usePriceCalculator` hook
- **Consistent Data Structure**: All components now use unified `totals` structure instead of scattered calculations
- **Component Standardization**: Updated ProposalSummaryCards, AcceptProposalDialog, PriceCard, and VisualColumn to use centralized pricing
- **Database Field Alignment**: Fixed timestamp field mismatches (`created_at`/`updated_at` vs `timestamp`)
- **Type Safety Improvements**: Resolved null/undefined type inconsistencies across components

#### Component Architecture
- **VisualColumn Refactoring**: Extracted pure functions to utility modules
- **Custom Hooks**: Created specialized hooks for data fetching (useRenders, useSitePlan, usePriceCalculator)
- **VisualRenderer**: Separated rendering logic by visual type (maps, videos, images)
- **Pricing Components**: Unified all pricing displays to use centralized calculator

#### Error Handling & Reliability
- **Supabase Error Handling**: Added robust error handling in useSitePlan hook
- **Fallback States**: Proper handling of undefined project IDs and API failures
- **API Error Prevention**: Fixed 406 "Not Acceptable" errors in production
- **Type Safety**: Improved TypeScript typing throughout the application
- **Build Stability**: Resolved TypeScript compilation errors for production builds

#### Navigation Improvements
- **Cross-Page Navigation**: Added "View Proposal" button to Drawings Viewer
- **Seamless Experience**: Easy transition between admin and client views

## Pricing System

The application uses a centralized pricing calculation system:

### Architecture
- **Central Hook**: `usePriceCalculator(snapshot)` provides all pricing calculations
- **Consistent Output**: Returns `{ fmt, totals }` where `fmt` formats currency and `totals` contains all calculated values
- **Single Source of Truth**: All components use the same calculation logic, eliminating inconsistencies

### Price Components
- **Base Pool**: Shell cost + excavation + filtration + variable costs + fixed costs (6285) with margin
- **Site Requirements**: Crane (with $700 allowance) + bobcat + traffic control + custom requirements with margin  
- **Electrical**: Pre-calculated database totals (margin already included)
- **Concrete & Paving**: Database totals (margin already included)
- **Fencing**: Glass + metal fencing costs (margin already included)
- **Water Features**: Database totals (margin already included)
- **Retaining Walls**: Sum of all retaining wall costs from JSONB data
- **Extras**: Heat pumps + blankets + cleaners + general extras (margin already included)

### Usage Example
```typescript
const { fmt, totals } = usePriceCalculator(snapshot);

// Display formatted prices
<div>Base Pool: {fmt(totals.basePoolTotal)}</div>
<div>Grand Total: {fmt(totals.grandTotalCalculated)}</div>
```

## Data Flow

1. Server components fetch data from Supabase views (`proposal_snapshot_v`)
2. Data is passed to client components for rendering
3. `usePriceCalculator` hook calculates all pricing from the snapshot data
4. Components display prices using the centralized totals
5. Interactions trigger API routes that update the database
6. Changes are reflected in real-time UI updates

## Technology Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **State Management**: React hooks and XState
- **Animation**: Framer Motion
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel

## Environment Setup

This application requires the following environment variables:

```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```
