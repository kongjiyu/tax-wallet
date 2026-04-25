# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

tax-wallet is a Next.js 16 mobile-first web application for Malaysian tax relief management. It features a screen-based navigation system (not file-based routing) where all screens are rendered within a single AppShell container.

## Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Build for production
npm run lint     # Run ESLint
```

## Architecture

### Screen-Based Navigation
The app uses a single-page architecture where `src/app/page.tsx` manages screen state via `AppShell`. Navigation is handled through `ScreenType` state, not URL routes.

Key screens in `src/components/screens/`:
- `OnboardingScreen` - MyDigital ID login
- `ConsentScreen` - Data permission consent flow
- `HomeScreen` - Dashboard with relief wallet overview
- `ActivityScreen` - Transaction history
- `WalletScreen` - Document/Proof management (labeled "Documents" in nav)
- `SummaryScreen` - Tax relief summary and breakdown
- `ProfileScreen` - User profile and settings
- `ClaimsReviewScreen` - Review pending claims
- `UploadScreen` - Upload statements/receipts

### Layout Structure
- **Fixed 430px width**: Mobile-optimized container centered on screen
- **Bottom navigation**: Managed by `AppShell` component in `src/components/layout/`
- **Screen transitions**: Uses framer-motion for fade/slide animations

### Component Organization
- `src/components/ui/` - shadcn/ui base components (button, card, badge, input, etc.)
- `src/components/screens/` - Screen-level components
- `src/components/layout/` - AppShell, navigation
- `src/lib/` - Utilities including `cn()` helper

### UI Framework
- shadcn/ui with `base-nova` style, configured in `components.json`
- lucide-react icons
- Tailwind CSS 4 with CSS variables
- framer-motion for animations

### Color Semantic System
- **Blue** (`text-blue-600`) - Primary, trust, financial data
- **Emerald** (`text-emerald-600`) - Success, verified, claimable
- **Amber** (`text-amber-600`) - Warning, pending, needs attention
- **Rose** (`text-rose-600`) - Error, critical issues
- **Slate** (`text-slate-500`) - Neutral, secondary text

## Important Notes

**This is Next.js 16** - APIs, conventions, and file structure may differ from earlier versions. Read `node_modules/next/dist/docs/` for guidance.

**No hover-dependent interactions** - This is a mobile-first app. Charts, progress bars, and interactive elements should work without hover states.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI Components**: shadcn/ui + Base UI
- **Styling**: Tailwind CSS 4
- **Animation**: framer-motion
- **Charts**: recharts (use mobile-friendly alternatives instead of hover tooltips)
- **Database**: Prisma with MySQL (see Prisma schema for models)
- **Notifications**: sonner
- **Icons**: lucide-react

## File Structure

```
src/
├── app/
│   ├── page.tsx         # Main entry, renders AppShell with screen state
│   ├── layout.tsx       # Root layout with font (Outfit) and Toaster
│   └── globals.css       # Global styles, CSS variables, theme
├── components/
│   ├── layout/
│   │   └── AppShell.tsx  # Main container with bottom nav
│   ├── screens/          # All screen components
│   └── ui/               # shadcn/ui components
└── lib/
    └── utils.ts           # cn() utility for Tailwind class merging
```