# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

tax-wallet is a Next.js 16 mobile-first web application for Malaysian tax relief management. It uses the App Router, shadcn/ui components, and Tailwind CSS 4.

## Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run lint     # Run ESLint
```

## Architecture

### Layout Structure
- **Fixed 430px width design**: The app is optimized for mobile with a max-width container centered on screen (`layout.tsx:25`)
- **Bottom navigation**: Components in `src/components/layout/` handle navigation
- **Screen-based routing**: Pages in `src/app/` map to routes (dashboard, wallet, transactions, etc.)

### Component Organization
- `src/components/ui/` - shadcn/ui base components (button, card, badge, input, etc.)
- `src/components/screens/` - Screen-level components (HomeScreen, WalletScreen, etc.)
- `src/components/layout/` - Layout components (Navbar, AppShell, etc.)
- `src/lib/` - Utilities including `cn()` helper from `lib/utils.ts`

### UI Framework
This project uses shadcn/ui with configuration in `components.json`:
- Style: `base-nova`
- Icon library: `lucide-react`
- Tailwind CSS 4 with CSS variables
- Components are prefixed with `@/components/` alias

### Styling
- Global styles in `src/app/globals.css`
- Uses `slate` color palette with custom background `#F3F8FF`
- Font: Outfit (loaded via next/font/google)

## Important Notes

**This is Next.js 16** with potential breaking changes from earlier versions. APIs, conventions, and file structure may differ from standard documentation. Read `node_modules/next/dist/docs/` for guidance if encountering issues.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI Components**: shadcn/ui + Base UI
- **Styling**: Tailwind CSS 4
- **Animation**: framer-motion, tw-animate-css
- **Charts**: recharts
- **Database**: Prisma (configured but schema not yet created)
- **Notifications**: sonner
- **Theme**: next-themes for dark/light mode support