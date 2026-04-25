# GEMINI.md - Instructional Context for taxWallet

## Project Overview
**taxWallet** is an AI-powered personal tax relief wallet designed for the Malaysian tax ecosystem. It helps users identify potential tax relief claims by connecting financial transaction data from banks, e-wallets, and credit cards (Open Finance) and matching them with e-Invoice line items and uploaded supporting documents.

### Key Technologies
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui + Base UI
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Icons**: Lucide React
- **Database**: Prisma ORM with MySQL
- **Notifications**: Sonner

### Core Concept
The app identifies tax relief eligibility based on:
1. **Open Finance Data**: Proves payment occurred.
2. **e-Invoice Matching**: Shows item-level purchase details.
3. **Document Upload/Extraction**: Proves claimable amount for insurance, EPF, SOCSO, etc.
4. **AI-Powered Analysis**: Categorizes expenses into official LHDN tax relief categories.
5. **Final Summary**: Generates a categories-based report for manual entry into LHDN MyTax / e-Filing.

## Building and Running

### Development Commands
```bash
# Start the development server
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Run ESLint
npm run lint
```

### Database Management
- **Prisma**: The project uses Prisma ORM. Ensure your `.env` file has the correct `DATABASE_URL` for MySQL.
- **MySQL**: Connection settings can be found in `src/lib/db.ts`.

## Development Conventions

### Single-Page Architecture
The application uses a screen-based navigation system instead of standard file-based routing.
- **Entry Point**: `src/app/page.tsx` manages the `activeScreen` state.
- **Layout**: `src/components/layout/AppShell.tsx` provides the main container and fixed bottom navigation.
- **Screens**: Individual screen components are located in `src/components/screens/`.

### UI/UX Standards
- **Mobile-First Design**: The layout is optimized for a **430px width** (mobile viewport) and centered on desktop screens.
- **No Hover Interactions**: Since it is mobile-first, avoid logic that relies on hover states.
- **Semantic Colors**:
  - `text-blue-600`: Primary branding / Financial data.
  - `text-emerald-600`: Success / Verified / Claimable.
  - `text-amber-600`: Warning / Pending / Needs Attention.
  - `text-rose-600`: Error / Critical.
  - `text-slate-500`: Neutral / Secondary.
- **Radius System**: Uses a consistent `24px` radius for cards and major UI elements.

### Tax Relief Logic
The core categorization logic resides in `src/lib/tax-relief-algorithm.ts`. This file contains:
- **TaxReliefCategory**: Official LHDN YA 2025 categories.
- **Proof Rules**: Documentation requirements for each category.
- **Keywords**: Mapping for automatic classification based on transaction descriptions.

### Component Organization
- `src/components/ui/`: Base shadcn/ui components.
- `src/components/screens/`: Screen-level logic and views.
- `src/components/layout/`: Global layout components like `AppShell`.
- `src/lib/`: Shared utilities, database logic, and tax algorithms.
