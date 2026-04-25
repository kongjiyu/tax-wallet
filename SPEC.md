# taxWallet - Specification

## Overview
taxWallet is a web platform for managing tax calculations and digital wallet functionality, with integrations for Cloud MySQL database and Cloud Hosting services.

## Core Features

### 1. Dashboard
- Overview of account status, recent transactions, tax summaries
- Quick access to main features

### 2. Cloud MySQL Integration
- **Database Connection Manager**: Interface to connect to cloud MySQL databases (e.g., AWS RDS, Cloud SQL, PlanetScale)
- **Connection Settings**: Host, port, username, password, database name
- **Connection Status**: Test and verify connections
- **Schema Viewer**: View tables and structures

### 3. Cloud Hosting Integration
- **Hosting Manager**: Interface to connect to cloud hosting providers
- **Service Selection**: Support for Vercel, Netlify, AWS Elastic Beanstalk, etc.
- **Deployment Status**: Monitor deployment progress

### 4. Tax Calculator
- Income tax estimation
- Deduction tracking
- Tax filing status management

### 5. Wallet Management
- Transaction history
- Balance tracking
- Integration with accounting systems

## Technical Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React hooks / Context
- **Database**: Cloud MySQL via Prisma ORM
- **Deployment**: Cloud hosting platforms

## Pages
- `/` - Landing/Dashboard
- `/dashboard` - Main dashboard
- `/database` - Cloud MySQL integration
- `/hosting` - Cloud Hosting integration
- `/tax` - Tax calculator
- `/wallet` - Wallet management

## API Routes
- `POST /api/database/connect` - Test database connection
- `POST /api/database/query` - Execute database queries
- `POST /api/hosting/deploy` - Trigger deployment
- `GET /api/hosting/status` - Get deployment status
