# taxWallet Deployment Guide (Linux Compute Instance)

This guide explains how to host the **taxWallet** application on a Linux server (AWS EC2, Google Compute Engine, or generic VPS) and initialize the demo database.

## 1. Prerequisites

Ensure your compute instance has the following installed:
- **Node.js**: v20.x or higher
- **npm**: v10.x or higher
- **MySQL Server**: v8.0 or higher
- **Git** (to clone the repository)

## 2. System Preparation

Update your system and install Node.js and MySQL (example for Ubuntu):
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install nodejs npm mysql-server -y
```

## 3. Database Setup

### Step A: Initialize the Database & Demo Data
We have provided a consolidated SQL file called `demo_snapshot.sql` that creates the schema, tables, and the specific data for the demo (Apple Store e-Invoice and Great Eastern Insurance).

1. Log into your MySQL server:
   ```bash
   sudo mysql -u root -p
   ```

2. Run the provided snapshot script. This will create the `taxwallet` database and populate it:
   ```bash
   # In your terminal (replace root/password with your credentials)
   mysql -u root -p < demo_snapshot.sql
   ```

### Step B: Verify the Demo Records
To ensure the demo is ready, verify that the following data exists:
- **User**: `Ji Yu` (ID: `user-001`)
- **Tasks**: Apple Store purchase (Pending Confirmation) and Great Eastern (Pending Proof).
- **Invoice**: 3 items for Apple Store (Phone, Care, Cable).

## 4. Application Configuration

1. Clone or upload the project files to `/var/www/tax-wallet`.
2. Navigate to the project directory:
   ```bash
   cd /var/www/tax-wallet
   ```
3. Create a `.env` file in the root directory:
   ```bash
   nano .env
   ```
4. Add your configuration:
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=taxwallet

   # AI Configuration (Gemini API)
   AI_API_KEY=your_google_gemini_api_key
   ```

## 5. Build and Run

Install dependencies and build the Next.js application:
```bash
npm install
npm run build
```

### Running with PM2 (Recommended for Production)
To keep the app running after you close your terminal:
```bash
sudo npm install -g pm2
pm2 start npm --name "tax-wallet" -- start
```

## 6. Accessing the App
The application runs on port **3000** by default. Ensure your compute instance's firewall (Security Groups) allows traffic on port 3000, or set up an Nginx reverse proxy.

---

## 7. Resetting the Demo
If you need to reset the data back to its starting state for a fresh demonstration, simply re-run the SQL snapshot:
```bash
mysql -u [user] -p [password] taxwallet < demo_snapshot.sql
```
