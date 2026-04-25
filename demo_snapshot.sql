-- taxWallet Final Demo Snapshot
-- Use this file to reset the database for your demo.

CREATE DATABASE IF NOT EXISTS taxwallet;
USE taxwallet;

-- 1. DROP & RECREATE TABLES (Full Reset)
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS invoice_line_items;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS relief_summary;
DROP TABLE IF EXISTS categorized_items;
DROP TABLE IF EXISTS financial_records;
DROP TABLE IF EXISTS tax_relief_categories;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- 2. SCHEMA DEFINITION

CREATE TABLE users (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    tin VARCHAR(50),
    filing_status ENUM('SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED') DEFAULT 'SINGLE',
    assessment_year CHAR(6) DEFAULT 'YA2025',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE tax_relief_categories (
    id CHAR(36) PRIMARY KEY,
    assessment_year CHAR(6) NOT NULL,
    relief_code VARCHAR(50) NOT NULL,
    category_name VARCHAR(255) NOT NULL,
    max_amount DECIMAL(15, 2) NOT NULL,
    description TEXT,
    UNIQUE KEY (assessment_year, relief_code)
);

CREATE TABLE financial_records (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36),
    record_id VARCHAR(100) UNIQUE,
    transaction_date DATE NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    direction ENUM('INFLOW', 'OUTFLOW') NOT NULL,
    institution VARCHAR(100),
    account_ref VARCHAR(50),
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    category VARCHAR(50) DEFAULT 'other',
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE invoices (
    id CHAR(36) PRIMARY KEY,
    financial_record_id CHAR(36),
    uuid VARCHAR(100) UNIQUE,
    invoice_number VARCHAR(100),
    status VARCHAR(50),
    supplier_name VARCHAR(255),
    supplier_tin VARCHAR(50),
    total_amount DECIMAL(15, 2),
    issue_date DATE,
    FOREIGN KEY (financial_record_id) REFERENCES financial_records(id)
);

CREATE TABLE invoice_line_items (
    id CHAR(36) PRIMARY KEY,
    invoice_id CHAR(36),
    description TEXT,
    classification_code VARCHAR(50),
    quantity INT,
    unit_price DECIMAL(15, 2),
    total_amount DECIMAL(15, 2),
    FOREIGN KEY (invoice_id) REFERENCES invoices(id)
);

-- Categorized items (Constraint removed for demo flexibility)
CREATE TABLE categorized_items (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    line_item_id CHAR(36) NOT NULL,
    relief_code VARCHAR(50) NOT NULL,
    eligible_amount DECIMAL(12,2) NOT NULL,
    confidence DECIMAL(3,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'AUTO',
    assessment_year VARCHAR(6) NOT NULL,
    categorized_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_categorized_items_line_relief (line_item_id, relief_code),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE relief_summary (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36),
    assessment_year CHAR(6),
    relief_code VARCHAR(50),
    max_amount DECIMAL(15, 2),
    claimed_amount DECIMAL(15, 2) DEFAULT 0,
    remaining_quota DECIMAL(15, 2),
    item_count INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 3. PRODUCTION SEED DATA

-- Demo User
INSERT INTO users (id, name, tin, filing_status, assessment_year) VALUES
('user-001', 'Ji Yu', 'TIN123456789', 'SINGLE', 'YA2025');

-- YA 2025 Relief Categories
INSERT INTO tax_relief_categories (id, assessment_year, relief_code, category_name, max_amount, description) VALUES
('cat-001', 'YA2025', 'LIFESTYLE', 'Lifestyle (Books/Tech/Internet)', 2500.00, 'Smartphone, computer, books, internet'),
('cat-002', 'YA2025', 'MEDICAL_SELF', 'Medical Expenses (Self)', 10000.00, 'Medical expenses for self/spouse/child'),
('cat-003', 'YA2025', 'INSURANCE_LIFE', 'Life Insurance', 3000.00, 'Life insurance/Takaful premium'),
('cat-004', 'YA2025', 'INSURANCE_MEDICAL', 'Medical Insurance', 4000.00, 'Medical and health insurance'),
('cat-005', 'YA2025', 'SPORTS', 'Sports Expenses', 1000.00, 'Sports equipment and gym fees'),
('cat-006', 'YA2025', 'EDUCATION_SELF', 'Education Fees', 7000.00, 'Fees for self improvement'),
('cat-007', 'YA2025', 'SSPN', 'SSPN Savings', 8000.00, 'Net deposit in SSPN');

-- Financial Records (Starting State)
INSERT INTO financial_records (id, user_id, record_id, transaction_date, amount, direction, institution, account_ref, description, status, category) VALUES
-- Great Eastern (Upload Flow)
('rec-aia', 'user-001', 'TXN-GE-2025', '2025-10-20', 6000.00, 'OUTFLOW', 'Great Eastern Life', '****9999', 'Life & Medical Premium 2025', 'pending_proof', 'other'),
-- Apple Store (Confirm Flow)
('rec-iphone', 'user-001', 'TXN-AAPL-2025', '2025-10-25', 4299.00, 'OUTFLOW', 'Apple Store', '****1234', 'iPhone 15 Pro Max & Services', 'pending_confirmation', 'other'),
-- History (Populated for Summary)
('rec-gym', 'user-001', 'TXN-GYM-001', '2025-10-05', 150.00, 'OUTFLOW', 'Anytime Fitness', '****1234', 'Monthly Membership', 'claimed', 'gym_expenses'),
('rec-book', 'user-001', 'TXN-BOOK-001', '2025-10-01', 85.00, 'OUTFLOW', 'Popular Bookstore', '****1234', 'Educational Books', 'claimed', 'books_journals');

-- Apple Store E-Invoice with 3 specific items
INSERT INTO invoices (id, financial_record_id, uuid, invoice_number, status, supplier_name, supplier_tin, total_amount, issue_date) 
VALUES ('inv-apple-demo', 'rec-iphone', 'uuid-apple-demo', 'INV-AAPL-2025-X', 'PAID', 'Apple Store Malaysia', 'T1234567890', 4299.00, '2025-10-25');

INSERT INTO invoice_line_items (id, invoice_id, description, classification_code, quantity, unit_price, total_amount) VALUES
('li-phone', 'inv-apple-demo', 'iPhone 15 Pro Max 256GB', 'TECH', 1, 3999.00, 3999.00),
('li-care', 'inv-apple-demo', 'AppleCare+ Protection Plan', 'SERVICE', 1, 199.00, 199.00),
('li-cable', 'inv-apple-demo', 'USB-C Charge Cable (2m)', 'ACCESSORY', 1, 101.00, 101.00);

-- Initial Relief Summary (Matching History)
INSERT INTO relief_summary (id, user_id, assessment_year, relief_code, max_amount, claimed_amount, remaining_quota, item_count) VALUES
('rs-001', 'user-001', 'YA2025', 'SPORTS', 1000.00, 150.00, 850.00, 1),
('rs-002', 'user-001', 'YA2025', 'LIFESTYLE', 2500.00, 85.00, 2415.00, 1),
('rs-003', 'user-001', 'YA2025', 'INSURANCE_LIFE', 3000.00, 0.00, 3000.00, 0),
('rs-004', 'user-001', 'YA2025', 'INSURANCE_MEDICAL', 4000.00, 0.00, 4000.00, 0),
('rs-005', 'user-001', 'YA2025', 'MEDICAL_SELF', 10000.00, 0.00, 10000.00, 0);

SELECT 'Demo snapshot imported successfully!' as status;
