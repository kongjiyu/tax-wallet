-- Open Finance Tax Wallet MySQL Schema
-- Run with: mysql -u root -pkongjiyu taxwallet < schema.sql

CREATE DATABASE IF NOT EXISTS taxwallet;
USE taxwallet;

-- 1. Users table
CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    tin VARCHAR(20) NOT NULL UNIQUE,
    filing_status VARCHAR(20) NOT NULL,
    has_disability BOOLEAN DEFAULT FALSE,
    spouse_has_disability BOOLEAN DEFAULT FALSE,
    spouse_working BOOLEAN DEFAULT NULL,
    assessment_year VARCHAR(6) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Dependents
CREATE TABLE IF NOT EXISTS dependents (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    relationship VARCHAR(20) NOT NULL,
    name VARCHAR(255) NOT NULL,
    age INT,
    has_disability BOOLEAN DEFAULT FALSE,
    in_full_time_education BOOLEAN DEFAULT FALSE,
    parent_medical_condition BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 3. Connected accounts
CREATE TABLE IF NOT EXISTS connected_accounts (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    institution VARCHAR(50) NOT NULL,
    account_ref VARCHAR(50) NOT NULL,
    consent_id VARCHAR(100) NOT NULL,
    consent_status VARCHAR(20) DEFAULT 'ACTIVE',
    consent_expiry DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 4. Financial records
CREATE TABLE IF NOT EXISTS financial_records (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    record_id VARCHAR(50) NOT NULL UNIQUE,
    transaction_date DATE NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'MYR',
    direction VARCHAR(10) NOT NULL,
    institution VARCHAR(50) NOT NULL,
    account_ref VARCHAR(50) NOT NULL,
    transaction_ref VARCHAR(100),
    payment_method VARCHAR(30),
    description VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 5. Invoices
CREATE TABLE IF NOT EXISTS invoices (
    id CHAR(36) PRIMARY KEY,
    financial_record_id CHAR(36) NOT NULL UNIQUE,
    uuid VARCHAR(100) NOT NULL UNIQUE,
    invoice_number VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL,
    supplier_name VARCHAR(255) NOT NULL,
    supplier_tin VARCHAR(20) NOT NULL,
    supplier_registration_no VARCHAR(50),
    total_amount DECIMAL(12,2) NOT NULL,
    issue_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (financial_record_id) REFERENCES financial_records(id)
);

-- 6. Invoice line items
CREATE TABLE IF NOT EXISTS invoice_line_items (
    id CHAR(36) PRIMARY KEY,
    invoice_id CHAR(36) NOT NULL,
    description VARCHAR(500) NOT NULL,
    classification_code VARCHAR(10) NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL,
    tax_amount DECIMAL(12,2) DEFAULT 0.00,
    total_amount DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id)
);

-- 7. Tax relief categories
CREATE TABLE IF NOT EXISTS tax_relief_categories (
    id CHAR(36) PRIMARY KEY,
    assessment_year VARCHAR(6) NOT NULL,
    relief_code VARCHAR(50) NOT NULL,
    category_name VARCHAR(255) NOT NULL,
    max_amount DECIMAL(12,2) NOT NULL,
    sub_limit DECIMAL(12,2) DEFAULT NULL,
    parent_relief_code VARCHAR(50) DEFAULT NULL,
    auto_applied BOOLEAN DEFAULT FALSE,
    description TEXT,
    UNIQUE KEY uq_tax_relief_categories_year_code (assessment_year, relief_code)
);

-- 8. Classification code to relief mapping
CREATE TABLE IF NOT EXISTS classification_relief_mapping (
    id CHAR(36) PRIMARY KEY,
    classification_code VARCHAR(10) NOT NULL,
    relief_code VARCHAR(50) NOT NULL,
    assessment_year VARCHAR(6) NOT NULL,
    confidence DECIMAL(3,2) DEFAULT 1.00,
    UNIQUE KEY uq_classification_relief_mapping (classification_code, relief_code, assessment_year)
);

-- 9. Categorized items
CREATE TABLE IF NOT EXISTS categorized_items (
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
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (line_item_id) REFERENCES invoice_line_items(id)
);

-- 10. Relief summary
CREATE TABLE IF NOT EXISTS relief_summary (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    assessment_year VARCHAR(6) NOT NULL,
    relief_code VARCHAR(50) NOT NULL,
    max_amount DECIMAL(12,2) NOT NULL,
    claimed_amount DECIMAL(12,2) DEFAULT 0.00,
    remaining_quota DECIMAL(12,2) NOT NULL,
    item_count INT DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_relief_summary_user_year_code (user_id, assessment_year, relief_code),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- =====================================================
-- SEED DATA
-- =====================================================

-- Insert test user
INSERT INTO users (id, name, tin, filing_status, assessment_year) VALUES
('user-001', 'Ji Yu', 'TIN123456789', 'SINGLE', 'YA2025');

-- Insert financial records for test user
INSERT INTO financial_records (id, user_id, record_id, transaction_date, amount, direction, institution, account_ref, description) VALUES
('rec-001', 'user-001', 'TXN-001', '2025-10-15', 4500.00, 'OUTFLOW', 'Maybank', '****1234', 'SSPN Contribution October'),
('rec-002', 'user-001', 'TXN-002', '2025-10-12', 2500.00, 'OUTFLOW', 'Maybank', '****1234', 'Medical Checkup Hospital'),
('rec-003', 'user-001', 'TXN-003', '2025-10-08', 128.50, 'OUTFLOW', 'TNG eWallet', '****5678', 'Popular Bookstore Book'),
('rec-004', 'user-001', 'TXN-004', '2025-10-05', 120.00, 'OUTFLOW', 'Maybank', '****1234', 'Gym Membership Fitness First'),
('rec-005', 'user-001', 'TXN-005', '2025-10-02', 350.00, 'OUTFLOW', 'Public Bank', '****9012', 'Klinik HealthCare Consultation'),
('rec-006', 'user-001', 'TXN-006', '2025-09-28', 299.00, 'OUTFLOW', 'Shopee', '****3456', 'Sports Equipment Running Shoes'),
('rec-007', 'user-001', 'TXN-007', '2025-09-20', 89.00, 'OUTFLOW', 'Grab', '****7890', 'Taxi Transport'),
('rec-008', 'user-001', 'TXN-008', '2025-09-15', 250.00, 'INFLOW', 'Employer ABC', '****0001', 'Salary September');

-- Insert tax relief categories
INSERT INTO tax_relief_categories (id, assessment_year, relief_code, category_name, max_amount, description) VALUES
('cat-001', 'YA2025', 'EDUCATION_SELF', 'Education Fees (Self)', 7000.00, 'Education fees for self'),
('cat-002', 'YA2025', 'MEDICAL_SELF', 'Medical Expenses (Self/Spouse/Child)', 10000.00, 'Medical expenses for self, spouse or child'),
('cat-003', 'YA2025', 'INSURANCE_LIFE', 'Life Insurance/Takaful', 3000.00, 'Life insurance premium or takaful'),
('cat-004', 'YA2025', 'INSURANCE_MEDICAL', 'Medical Insurance', 4000.00, 'Medical/health insurance'),
('cat-005', 'YA2025', 'EPF', 'EPF/KWSP Contributions', 0, 'EPF/KWSP contributions (unlimited)'),
('cat-006', 'YA2025', 'SSPN', 'SSPN Contributions', 8000.00, 'SSPN savings'),
('cat-007', 'YA2025', 'SPORTS', 'Sports Expenses', 1000.00, 'Sports equipment'),
('cat-008', 'YA2025', 'PARENT_MEDICAL', 'Parent Medical Expenses', 8000.00, 'Medical expenses for parents');

-- Insert relief summary
INSERT INTO relief_summary (id, user_id, assessment_year, relief_code, max_amount, claimed_amount, remaining_quota, item_count) VALUES
('rs-001', 'user-001', 'YA2025', 'SSPN', 8000.00, 4500.00, 3500.00, 1),
('rs-002', 'user-001', 'YA2025', 'MEDICAL_SELF', 10000.00, 2500.00, 7500.00, 1),
('rs-003', 'user-001', 'YA2025', 'SPORTS', 1000.00, 419.00, 581.00, 2);

SELECT 'Schema and seed data created successfully!' as status;