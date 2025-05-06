# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands
- Build: `yarn build` or `npm run build`
- Dev server: `yarn dev` or `npm run dev`
- Start production: `yarn start` or `npm run start`
- Lint: `yarn lint` or `npm run lint`
- Typecheck: `yarn tsc` or `npx tsc`
- Format: `yarn prettier --write .` or `npx prettier --write .`

## App Architecture Overview

This Next.js application follows the App Router architecture with a focus on server components and data fetching.

### Key Directories & Files
- `/src/app` - Main application code using Next.js App Router
- `/src/app/lib` - Shared utilities, constants, and server-side functions
  - `constants.ts` - Central application constants
  - `getProposalSnapshot.server.ts` - Server-side data fetching from SQL view
  - `supabaseClient.ts` - Supabase database connection  
  - `sectionMachine.ts` - State machine for navigation
  - `layoutConstants.ts` - Layout-specific constants
  - `animation.ts` - Animation configurations
  - `/types` - TypeScript type definitions
    - `snapshot.ts` - SQL view data structure types
- `/src/app/proposal/[customerUuid]` - Dynamic route for proposal display
  - `page.tsx` - Server component that fetches data
  - `ProposalViewer.client.tsx` - Client component that renders the UI
- `/src/components` - Shared components used across the application
  - `/Footer` - Footer components
  - `/Header` - Header components
  - `/SectionJumpSelect` - Navigation components
  - `/VisualColumn` - Right column visual content
  - `/sections` - Section-specific cards and content
    - `/PoolSelectionCards` - Pool selection components
    - `/SiteRequirementsCards` - Site requirements components
- `/public` - Static assets


## Code Style Guidelines
- **TypeScript**: Use strict typing, avoid `any` types
- **File Structure**: Follow Next.js App Router conventions
- **Imports**: Use `@/` alias for imports (e.g., `@/components`, `@/lib`)
- **Components**: React functional components with explicit type definitions
- **Styling**: Use Tailwind CSS with `cn` utility from `@/lib/utils` for class merging
- **UI Components**: Follow shadcn/ui patterns with variants via cva
- **Naming**: PascalCase for components, camelCase for functions/variables
- **Error Handling**: Use try/catch with descriptive error messages
- **State Management**: Use React hooks and XState for state machines
- **ESLint**: Follow Next.js core web vitals and TypeScript rules
- **Format**: Use 2-space indentation, single quotes for strings
- **Documentation**: Add JSDoc comments for complex functions and components
- **Framer Motion**: Use for animations and transitions

## Working with Dynamic Routes
- Always reference dynamic paths like `[customerUuid]` properly to avoid errors
- When working with file paths containing special characters (like brackets []), enclose the path in double quotes to prevent shell pattern expansion
- Example: `./scripts/create-component-prompt.sh "src/app/proposal/[customerUuid]/components/sections/PoolSelectionCards/DetailsCard.tsx"`

## Proposal Components Structure

The proposal viewer is organized into sections:

1. **Main Layout**:
   - Fixed Header
   - Main Content (Left + Right columns)
   - Fixed Footer with progress indicator

2. **Left Column (Content)**:
   - Customer Info (Welcome)
   - Pool Selection
   - Site Requirements (Pool Installation)
   - Filtration & Maintenance
   - Concrete & Paving
   - Fencing
   - Retaining Walls
   - Water Feature
   - Add-Ons (Extras & Upgrades)

3. **Right Column (Visual)**:
   - Context-sensitive visuals (images, videos, maps)
   - Changes based on active section

4. **Navigation**:
   - Section selection dropdown
   - Next/Previous buttons
   - Progress indicator

# Database Integration
- The application uses Supabase for data storage
- SQL views provide consolidated data (`proposal_snapshot_v`)
- Data is fetched server-side in `getProposalSnapshot.server.ts`
- Types in `types/snapshot.ts` define the shape of data returned from the view

### Data Flow
1. The proposal page (`/proposal/[customerUuid]/page.tsx`) fetches data using `getProposalSnapshot`
2. Data is retrieved from a Supabase database view named `proposal_snapshot_v`
3. The snapshot data is passed to the client component (`ProposalViewer.client.tsx`)
4. The client renders different sections based on the data and user navigation

## Data Structure and Migration
Current implementation has two data structures:

1. **SQL View Structure (New)**: 
   - Direct SQL view mapping with flat, snake_case properties (e.g., `spec_name`, `home_address`)
   - Defined in `/src/app/lib/types/snapshot.ts` as `ProposalSnapshot`
   - Used by the server-side data fetching in `getProposalSnapshot.server.ts`

2. **Component Structure (Legacy)**:
   - Nested object structure with camelCase properties (e.g., `poolSpecification.name`, `poolProject.homeAddress`)
   - Previously defined in the old `snapshot.ts` file (before the recent changes)
   - Still expected by all client-side components

### Migration Approach
We are refactoring components one by one to use the new flat SQL view structure directly. 

**IMPORTANT**: 
- Use snake_case in component code to match the SQL view property names
- Adhere to the flat structure - don't recreate nested objects
- Standard TypeScript best practices are less important than consistency with the database fields
- When refactoring a component, update the import to use the new `ProposalSnapshot` type

### Financial Calculations
Previously separated calculations have now been integrated:

- **Base Pool Costs**: Combines fixed costs, variable costs, and shell cost
- **Base Pool Price**: Calculated using the formula: `Cost ÷ (1 - margin %)`
- **Installation Costs**: Include electrical, traffic control, bobcat, and crane costs

When creating new components, work directly with the flat SQL view structure rather than the legacy nested structure.