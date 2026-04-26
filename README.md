# taxWallet 💰

**AI-Powered Open Finance Tax Relief Wallet for Malaysia**

taxWallet is a Malaysian personal tax relief wallet that uses the Open Finance concept to securely collect user financial transaction data from multiple banks, e-wallets, credit cards, and financial accounts with user consent. It helps Malaysians track, verify, and prepare their personal tax relief claims seamlessly throughout the year.

---

## 🚀 Features

- **Open Finance Integration**: Safely collect transaction data from multiple financial sources.
- **e-Invoice Matching**: Cross-check transactions with e-Invoice records (LHDN MyInvois) and uploaded receipts to determine claimability.
- **AI Document Extraction**: AI engine classifies, explains, and extracts item-level details from uploaded supporting documents.
- **Tax Relief Dashboard**: Real-time estimates for individual income tax relief based on the latest LHDN rules.
- **Recommendation Engine**: Automatically recommend relevant categorizations or actionable insights for unused tax reliefs.
- **Final Tax Relief Summary**: Export a formatted guide that users can easily key into the LHDN MyTax / e-Filing platform.

---

## 🏗 Architecture & Tech Stack

This project is built using a modern, mobile-first web architecture:

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4 with CSS variables & shadcn/ui components
- **Database**: Cloud MySQL via Prisma ORM
- **Animations**: framer-motion

### System Architecture Diagram

```mermaid
graph TD
    User([User]) -->|Interacts with| Frontend(Next.js 16 AppShell)
    
    subgraph Frontend
        Frontend -->|State| ScreenMgr[Screen Manager]
        ScreenMgr --> Screens[Screens: Dashboard, Wallet, Summary, etc.]
    end
    
    subgraph Backend Services & APIs
        Screens --> API[Next.js API Routes]
        API --> DB[(Cloud MySQL / Prisma)]
        API -->|AI Extraction| AIEngine[AI Receipt Analysis]
    end

    subgraph External Integrations
        API -->|Open Finance API| Banks[Bank & E-Wallet Data]
        API -->|MyInvois APIs| LHDN[LHDN e-Invoices]
    end
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js (>= 18.x)
- npm, yarn, or pnpm
- A Cloud MySQL database connection string

### 1. Clone the repository
```bash
git clone https://github.com/kongjiyu/tax-wallet.git
cd tax-wallet
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory and add your configurations (e.g., database connection URL).
```env
DATABASE_URL="mysql://username:password@host:port/database"
```

### 4. Database Setup
Push the Prisma schema to your Cloud MySQL database:
```bash
npx prisma db push
```

### 5. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to view the application.

---

## 📱 Navigation & Screens

taxWallet uses a **Screen-Based Navigation** pattern via `AppShell` instead of traditional file-based routing to ensure a fluid mobile-first experience. Key screens include:
- `OnboardingScreen`
- `HomeScreen` (Dashboard)
- `ActivityScreen` (Transaction history)
- `WalletScreen` (Document/Proof management)
- `SummaryScreen` (Tax relief summary)

