  This file provides guidance to Claude Code (claude.ai/code) 
  when working with code in this repository.

  ## Commands
  - Build: `yarn build`
  - Dev server: `yarn dev`
  - Start production: `yarn start`
  - Lint: `yarn lint`
  - Typecheck: `yarn tsc`
  - Format: `yarn prettier --write .`

  ## App Architecture Overview

  This Next.js application follows the App Router architecture 
  with a focus on server components for data fetching and 
  client components for interactive UI.

  ### Key Directories & Files
  - `/src/app` - Main application code using Next.js App Router
  - `/src/app/lib` - Shared utilities, constants, and 
  server-side functions
    - `constants.ts` - Central application constants
    - `getProposalSnapshot.server.ts` - Server-side data 
  fetching from SQL view
    - `supabaseClient.ts` - Supabase database connection  
    - `sectionMachine.ts` - State machine for navigation
    - `layoutConstants.ts` - Layout-specific constants
    - `animation.ts` - Animation configurations
    - `utils.ts` - Utility functions including `isSectionEmpty` 
  for conditional section rendering
    - `/types` - TypeScript type definitions
      - `snapshot.ts` - SQL view data structure types
      - `pool-details.ts` - Pool details type definitions
      - `questionnaire.ts` - Questionnaire type definitions
  - `/src/app/proposal/[customerUuid]` - Dynamic route for 
  proposal display
    - `page.tsx` - Server component that fetches data
    - `ProposalViewer.client.tsx` - Client component that 
  renders the UI
  - `/src/components` - Shared components used across the 
  application
    - `/Footer` - Footer components
    - `/Header` - Header components
    - `/SectionJumpSelect` - Navigation components
    - `/VisualColumn` - Right column visual content
    - `/sections` - Section-specific cards and content
      - `/PoolSelectionCards` - Pool selection components
      - `/SiteRequirementsCards` - Site requirements components
    - `/ui` - Shadcn/UI component library adaptations
      - `button.tsx` - Button component
      - `card.tsx` - Card component
      - `checkbox.tsx` - Checkbox component
      - `dialog.tsx` - Dialog component
      - `input.tsx` - Input component
      - `label.tsx` - Label component
      - `select.tsx` - Select component
      - `separator.tsx` - Separator component
      - `textarea.tsx` - Textarea component
  - `/public` - Static assets organized by category
    - `/CardHero` - Card hero images
    - `/Favicon` - Favicon assets
    - `/Logo` - Logo assets
    - `/Pools` - Pool-related images
    - `/Unique2D` - 2D imagery assets
    - `/Unique3D` - 3D imagery and video assets
    - `/VipCards` - VIP card images

  ## Server vs. Client Components

  The codebase follows a clear separation between server and 
  client components:

  - **Server Components** (.tsx files) - Handle data fetching, 
  SEO, and initial rendering
  - **Client Components** (.client.tsx files) - Handle 
  interactivity, state, and client-side logic

  This separation optimizes performance by keeping data 
  fetching on the server and UI interactions on the client.

  ## Code Style Guidelines
  - **TypeScript**: Use strict typing, avoid `any` types
  - **File Structure**: Follow Next.js App Router conventions
  - **Imports**: Use `@/` alias for imports (e.g., 
  `@/components`, `@/lib`)
  - **Components**: React functional components with explicit 
  type definitions
  - **Styling**: Use Tailwind CSS with `cn` utility from 
  `@/lib/utils` for class merging
  - **UI Components**: Follow shadcn/ui patterns with variants 
  via cva
  - **Naming**: PascalCase for components, camelCase for 
  functions/variables
  - **Error Handling**: Use try/catch with descriptive error 
  messages
  - **State Management**: Use React hooks and XState for state 
  machines
  - **ESLint**: Follow Next.js core web vitals and TypeScript 
  rules
  - **Format**: Use 2-space indentation, single quotes for 
  strings
  - **Documentation**: Add JSDoc comments for complex functions
   and components
  - **Framer Motion**: Use for animations and transitions

  ## Environment Variables

  The application uses environment variables for configuration,
   which are exposed to the client via the Next.js config:

  - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` - Google Maps API key for
   geocoding and map display
  - `NEXT_PUBLIC_SUPABASE_URL` - Supabase URL for database 
  connection
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key 
  for public access

  When adding new environment variables, make sure to update 
  `next.config.ts` if they need to be exposed to the client.

  ## Working with Dynamic Routes
  - Always reference dynamic paths like `[customerUuid]` 
  properly to avoid errors
  - When working with file paths containing special characters 
  (like brackets []), enclose the path in double quotes to 
  prevent shell pattern expansion
  - Example: `./scripts/create-component-prompt.sh 
  "src/app/proposal/[customerUuid]/components/sections/PoolSele
  ctionCards/DetailsCard.tsx"`

  ## State Management

  The application uses a state machine for navigation between 
  sections:

  - `sectionMachine.ts` defines the state machine logic
  - The state machine tracks the current section and subsection
  - Navigation is handled through `next()` and `prev()` 
  functions
  - `uniqueSections` are computed based on the snapshot data to
   determine available sections

  ## Animation Patterns

  The application uses Framer Motion for animations:

  - `animation.ts` contains shared animation variants
  - `AnimatePresence` is used for mounting/unmounting 
  animations
  - `motion` components are used for animating elements
  - Animations are coordinated via `lastDir` for 
  direction-aware transitions

  ## Responsive Design

  The application is fully responsive with a mobile-first 
  approach:

  - Mobile layout uses stacked columns and simplified UI
  - Desktop layout uses side-by-side columns with enhanced UI
  - Breakpoints follow Tailwind's default system:
    - `lg:` for desktop (1024px and above)
    - Default for mobile and tablet

  ## Media Handling

  The application optimizes media assets for performance:

  - Images use Next.js Image component with appropriate sizing
  - Videos use a custom ResponsiveVideo component that selects 
  appropriate format based on browser support
  - Media is organized by category in the `/public` directory
  - Optimization scripts are provided for images and videos

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
     - Interactive elements like the quote price card and site 
  plan

  4. **Navigation**:
     - Section selection dropdown
     - Next/Previous buttons
     - Progress indicator

  ## Database Integration
  - The application uses Supabase for data storage
  - SQL views provide consolidated data (`proposal_snapshot_v`)
  - Data is fetched server-side in 
  `getProposalSnapshot.server.ts`
  - Types in `types/snapshot.ts` define the shape of data 
  returned from the view

  ### Data Flow
  1. The proposal page (`/proposal/[customerUuid]/page.tsx`) 
  fetches data using `getProposalSnapshot`
  2. Data is retrieved from a Supabase database view named 
  `proposal_snapshot_v`
  3. The snapshot data is passed to the client component 
  (`ProposalViewer.client.tsx`)
  4. The client renders different sections based on the data 
  and user navigation

  ## Data Structure and Price Calculator Architecture

  ### Current Implementation (Post-Refactoring)
  The application now uses a centralized price calculation system:

  1. **SQL View Structure**: 
     - Direct SQL view mapping with flat, snake_case properties
     (e.g., `spec_name`, `home_address`, `created_at`, `updated_at`)
     - Defined in `/src/types/snapshot.ts` as `ProposalSnapshot`
     - Used by server-side data fetching in `getProposalSnapshot.server.ts`

  2. **Centralized Price Calculator**:
     - All components now use `usePriceCalculator` hook from `/src/hooks/use-price-calculator.ts`
     - Returns `{ fmt, totals }` where:
       - `fmt`: Currency formatter function
       - `totals`: `DebugPriceTotals` interface with all calculated values
     - Replaces previous scattered calculation logic across components

  ### Price Calculator Hook Structure
  The `usePriceCalculator` hook provides consistent pricing calculations:

  ```typescript
  const { fmt, totals } = usePriceCalculator(snapshot);
  
  // totals contains:
  // - basePoolTotal: Base pool price with margin applied
  // - siteRequirementsTotal: Site requirements with margin
  // - electricalTotal: Electrical costs (margin included in DB)
  // - concreteTotal: Concrete & paving costs (margin included)
  // - fencingTotal: Glass + metal fencing costs (margin included)
  // - waterFeatureTotal: Water feature costs (margin included)
  // - retainingWallsTotal: Sum of all retaining wall costs
  // - extrasTotal: All extras and add-ons (margin included)
  // - grandTotalCalculated: Final total price
  ```

  ### Component Migration Status (COMPLETED)
  All major components have been refactored to use the centralized calculator:

  - ✅ **ProposalSummaryCards.tsx** - Uses `totals` structure
  - ✅ **AcceptProposalDialog.tsx** - Uses `totals` structure  
  - ✅ **PriceCard.tsx** - Uses `totals` structure
  - ✅ **VisualColumn.tsx** - Passes `totals` to PriceCard
  - ✅ **PriceDebugPanel.tsx** - Simplified to use calculator totals
  - ✅ **All section components** - Use individual pricing logic but totals come from calculator

  ### Database Field Standards
  **IMPORTANT**: Use correct database field names:
  - ❌ `snapshot.timestamp` (old/incorrect)
  - ✅ `snapshot.created_at` and `snapshot.updated_at` (correct)
  - ❌ `breakdown.grandTotal` (old structure)
  - ✅ `totals.grandTotalCalculated` (new structure)

  ### Financial Calculation Architecture
  The centralized calculator handles all pricing logic:

  - **Base Pool Price**: Combines shell cost, excavation, filtration, variable costs, and fixed costs (6285), then applies margin
  - **Site Requirements**: Crane (with $700 allowance), bobcat, traffic control, and custom requirements with margin
  - **Electrical**: Pre-calculated totals from database (margin already included)
  - **Other Sections**: Use database totals where margin is pre-applied
  - **Margin Application**: Calculated as `Cost ÷ (1 - margin %)` for applicable sections

  ### Development Guidelines for Pricing Components
  When working with pricing components:

  1. **Always use the centralized hook**: `const { fmt, totals } = usePriceCalculator(snapshot);`
  2. **Never recalculate totals**: Use the provided `totals` object values
  3. **Handle null/undefined gracefully**: The `fmt` function handles null/undefined values
  4. **Type safety**: Use `string | null` to `string | undefined` conversion with `|| undefined` when needed
  5. **Conditional rendering**: Use `totals.sectionTotal > 0` for showing optional sections
  6. **Consistent structure**: All pricing displays should follow the same section order and formatting