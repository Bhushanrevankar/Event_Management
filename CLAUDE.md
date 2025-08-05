# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build the production application  
- `npm start` - Start the production server

## Project Architecture

This is a Next.js 15 starter kit built with Untitled UI React components, featuring:

### Tech Stack
- **Next.js 15** with App Router and Turbopack
- **React 19** with React Aria Components for accessibility
- **Tailwind CSS v4.1** with custom design tokens
- **TypeScript 5.8** with strict mode enabled
- **next-themes** for dark/light mode switching

### Directory Structure
- `src/app/` - Next.js App Router pages and layouts
- `src/components/` - Component library organized by category:
  - `base/` - Form controls, buttons, inputs, etc.
  - `application/` - Complex components like navigation, tables, modals
  - `foundations/` - Icons, logos, design system elements
  - `marketing/` - Marketing-specific components
- `src/hooks/` - Custom React hooks
- `src/providers/` - React context providers
- `src/utils/` - Utility functions
- `src/styles/` - Global CSS and theme files

### Component Organization
Components follow the Untitled UI React design system with:
- Base components for primitive UI elements
- Application components for complex functionality
- React Aria integration for accessibility
- TypeScript interfaces for component props

### Styling System
- Custom Tailwind CSS configuration with extended classes
- `cx()` utility function (wrapper around tailwind-merge) for conditional classes
- `sortCx()` helper for organizing class definitions
- Custom design tokens including display text sizes
- Theme provider with light/dark mode support

### Path Aliases
- `@/*` maps to `src/*` directory

### Key Conventions
- Components use React Aria Components for accessibility
- Navigation configuration stored in `src/components/application/app-navigation/config.ts`
- Theme switching handled by next-themes provider
- File uploads and complex interactions use React Aria patterns