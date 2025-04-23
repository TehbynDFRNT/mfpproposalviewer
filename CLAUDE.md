# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands
- Build: `yarn build` or `npm run build`
- Dev server: `yarn dev` or `npm run dev`
- Start production: `yarn start` or `npm run start`
- Lint: `yarn lint` or `npm run lint`
- Typecheck: `yarn tsc` or `npx tsc`
- Format: `yarn prettier --write .` or `npx prettier --write .`
- Test: No test command specified in package.json

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

## Proposal Page Section References
Reference tags for major sections in `src/app/proposal/[proposalId]/page.tsx`:

- `{/* --- Header --- */}` - Lines 444-461: Fixed header with logo and contact buttons
- `{/* --- Main Content Area --- */}` - Lines 464-2098: Main layout with left/right columns
- `{/* Left Column - Scrollable Content */}` - Lines 468-1723: Scrollable section for proposal content
- `{/* Visual Column (Right Column) */}` - Lines 1726-2096: Visual content including images/videos
- `{/* --- Footer --- */}` - Lines 2101-2145: Fixed footer with progress indicator and action buttons

Section content identifiers:
- `{/* --- Customer Info --- */}` - Welcome section (Lines 1324-1427)
- `{/* --- Pool Selection --- */}` - Pool details section (Lines 524-594)
- `{/* --- Pool Colour --- */}` - ColourGuard section (Lines 598-742)
- `{/* --- Filtration & Maintenance --- */}` - Pool equipment section (Lines 1022-1134)
- `{/* --- Concrete & Paving --- */}` - Paving options section (Lines 952-1021)
- `{/* --- Fencing --- */}` - Fencing package section (Lines 1137-1246)
- `{/* --- Retaining Walls --- */}` - Retaining walls section (Lines 1248-1323)
- `{/* --- Water Feature --- */}` - Water feature section (Lines 1428-1506)
- `{/* --- Add-Ons --- */}` - Extras & upgrades section (Lines 1508-1673)
- `{/* --- Pool Installation --- */}` - Site requirements section (Lines 746-868)