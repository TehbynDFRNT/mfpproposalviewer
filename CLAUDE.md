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