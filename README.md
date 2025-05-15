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

#### Component Architecture
- **VisualColumn Refactoring**: Extracted pure functions to utility modules
- **Custom Hooks**: Created specialized hooks for data fetching (useRenders, useSitePlan)
- **VisualRenderer**: Separated rendering logic by visual type (maps, videos, images)

#### Error Handling & Reliability
- **Supabase Error Handling**: Added robust error handling in useSitePlan hook
- **Fallback States**: Proper handling of undefined project IDs and API failures
- **API Error Prevention**: Fixed 406 "Not Acceptable" errors in production
- **Type Safety**: Improved TypeScript typing throughout the application

#### Navigation Improvements
- **Cross-Page Navigation**: Added "View Proposal" button to Drawings Viewer
- **Seamless Experience**: Easy transition between admin and client views

## Data Flow

1. Server components fetch data from Supabase views
2. Data is passed to client components for rendering
3. Interactions trigger API routes that update the database
4. Changes are reflected in real-time UI updates

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
