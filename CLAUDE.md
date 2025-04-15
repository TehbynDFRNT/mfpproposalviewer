# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands
- Build: `yarn build` or `npm run build`
- Dev server: `yarn dev` or `npm run dev`
- Start production: `yarn start` or `npm run start`
- Lint: `yarn lint` or `npm run lint`

## Code Style Guidelines
- **TypeScript**: Use strict typing, avoid `any` types
- **File Structure**: Follow Next.js App Router conventions
- **Imports**: Use `@/` alias for src directory imports
- **Components**: React functional components with explicit type definitions
- **Styling**: Use Tailwind CSS with cn utility for class merging
- **UI Components**: Follow shadcn/ui patterns with variants via cva
- **Naming**: PascalCase for components, camelCase for functions/variables
- **Error Handling**: Use try/catch with descriptive error messages
- **React Patterns**: Prefer composition over inheritance, use hooks for state
- **ESLint**: Follow Next.js core web vitals and TypeScript rules