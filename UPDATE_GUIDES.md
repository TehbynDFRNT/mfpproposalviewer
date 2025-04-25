# Media Optimization Implementation Guide

This guide shows how to update the proposal pages to use optimized media assets.

## Step 1: Import the ResponsiveVideo Component

Add this at the top of your page:

```tsx
import Image from 'next/image';
import { ResponsiveVideo } from "@/components/ResponsiveVideo";
```

## Step 2: Replace Image Tags

Replace standard `<img>` tags with Next.js `<Image>` components:

### Before:
```tsx
<img src="/logo.png" alt="MFP Pools Logo" className="h-8 w-auto" />
```

### After:
```tsx
<Image 
  src="/_opt/logo.webp" 
  alt="MFP Pools Logo" 
  width={120}
  height={40}
  className="h-8 w-auto"
/>
```

**Important Notes:**
- Change the path from `/filename.png` to `/_opt/filename.webp`
- Provide `width` and `height` attributes (required by Next.js)
- Keep your existing `className` attributes

## Step 3: Replace Video Tags

Replace standard `<video>` tags with the `<ResponsiveVideo>` component:

### Before:
```tsx
<video 
  src="/Sheffield.mov" 
  muted 
  loop 
  playsInline 
  autoPlay 
  className="w-full h-full object-cover"
/>
```

### After:
```tsx
<ResponsiveVideo 
  baseName="Sheffield"
  className="w-full h-full object-cover"
  muted
  loop
  playsInline
  autoPlay
/>
```

**Important Notes:**
- Replace `src="/filename.mov"` with `baseName="filename"` (without extension)
- Keep all your existing video attributes (muted, loop, etc.)
- The component automatically provides WebM and MP4 sources

## Step 4: Test All Media Files

Make sure all media files have been properly optimized:

1. Images should have both `.webp` and `.avif` versions in `public/_opt/`
2. Videos should have both `-1080.mp4` and `-720.webm` versions in `public/_vid/`

If any files are missing, you can run:
```bash
npm run media:build
```