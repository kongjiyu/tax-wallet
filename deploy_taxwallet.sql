-- taxWallet Deployment & Demo Reset Script
-- This script resets the database to the initial demo state with specific Apple Store items.

CREATE DATABASE IF NOT EXISTS taxwallet;
USE taxwallet;

-- 1. CLEANUP (Handle dependencies in correct order)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE invoice_line_items;
TRUNCATE TABLE invoices;
TRUNCATE TABLE relief_summary;
TRUNCATE TABLE financial_records;
TRUNCATE TABLE tax_relief_categories;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- 2. SEED REFERENCE DATA

-- YA 2025 Relief Categories
INSERT INTO tax_relief_categories (id, assessment_year, relief_code, category_name, max_amount, description) VALUES
('cat-001', 'YA2025', 'LIFESTYLE', 'Lifestyle (Books/Tech/Internet)', 2500.00, 'Smartphone, computer, books, internet'),
('cat-002', 'YA2025', 'MEDICAL_SELF', 'Medical Expenses (Self)', 10000.00, 'Medical expenses for self/spouse/child'),
('cat-003', 'YA2025', 'INSURANCE_LIFE', 'Life Insurance', 3000.00, 'Life insurance/Takaful premium'),
('cat-004', 'YA2025', 'INSURANCE_MEDICAL', 'Medical Insurance', 4000.00, 'Medical and health insurance'),
('cat-005', 'YA2025', 'SPORTS', 'Sports Expenses', 1000.00, 'Sports equipment and gym fees'),
('cat-006', 'YA2025', 'EDUCATION_SELF', 'Education Fees', 7000.00, 'Fees for self improvement'),
('cat-007', 'YA2025', 'SSPN', 'SSPN Savings', 8000.00, 'Net deposit in SSPN');

-- 3. SEED USER DATA

INSERT INTO users (id, name, tin, filing_status, assessment_year) VALUES
('user-001', 'Ji Yu', 'TIN123456789', 'SINGLE', 'YA2025');

-- 4. SEED FINANCIAL RECORDS (DEMO START STATE)

INSERT INTO financial_records (id, user_id, record_id, transaction_date, amount, direction, institution, account_ref, description, status) VALUES
-- Great Eastern (Status: PENDING PROOF)
('rec-aia', 'user-001', 'TXN-GE-2025', '2025-10-20', 6000.00, 'OUTFLOW', 'Great Eastern Life', '****9999', 'Life & Medical Premium 2025', 'pending_proof'),
-- Apple Store (Status: PENDING CONFIRMATION)
('rec-iphone', 'user-001', 'TXN-AAPL-2025', '2025-10-25', 4299.00, 'OUTFLOW', 'Apple Store', '****1234', 'iPhone 15 Pro Max & Services', 'pending_confirmation'),
-- Claimed History (To populate categories)
('rec-gym', 'user-001', 'TXN-GYM-001', '2025-10-05', 150.00, 'OUTFLOW', 'Anytime Fitness', '****1234', 'Monthly Membership', 'claimed'),
('rec-book', 'user-001', 'TXN-BOOK-001', '2025-10-01', 85.00, 'OUTFLOW', 'Popular Bookstore', '****1234', 'Educational Books', 'claimed');

-- 5. SEED E-INVOICE DATA (APPLE STORE)

INSERT INTO invoices (id, financial_record_id, uuid, invoice_number, status, supplier_name, supplier_tin, total_amount, issue_date) 
VALUES ('inv-apple-demo', 'rec-iphone', 'uuid-apple-demo', 'INV-AAPL-2025-X', 'PAID', 'Apple Store Malaysia', 'T1234567890', 4299.00, '2025-10-25');

-- Line Items: 1 Claimable, 2 Non-claimable
INSERT INTO invoice_line_items (id, invoice_id, description, classification_code, quantity, unit_price, total_amount) VALUES
-- Claimable under Lifestyle (TECH code)
('li-phone', 'inv-apple-demo', 'iPhone 15 Pro Max 256GB', 'TECH', 1, 3999.00, 3999.00),
-- Non-claimable (SERVICE code)
('li-care', 'inv-apple-demo', 'AppleCare+ Protection Plan', 'SERVICE', 1, 199.00, 199.00),
-- Non-claimable (ACCESSORY code)
('li-cable', 'inv-apple-demo', 'USB-C Charge Cable (2m)', 'ACCESSORY', 1, 101.00, 101.00);

-- 6. SEED RELIEF SUMMARY (CURRENT PROGRESS)

INSERT INTO relief_summary (id, user_id, assessment_year, relief_code, max_amount, claimed_amount, remaining_quota, item_count) VALUES
('rs-001', 'user-001', 'YA2025', 'SPORTS', 1000.00, 150.00, 850.00, 1),
('rs-002', 'user-001', 'YA2025', 'LIFESTYLE', 2500.00, 85.00, 2415.00, 1),
('rs-003', 'user-001', 'YA2025', 'INSURANCE_LIFE', 3000.00, 0.00, 3000.00, 0),
('rs-004', 'user-001', 'YA2025', 'INSURANCE_MEDICAL', 4000.00, 0.00, 4000.00, 0);

SELECT 'Database reset to Demo state successfully!' as status;
