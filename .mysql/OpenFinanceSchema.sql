-- Open Finance Tax Wallet MySQL schema
-- Requires MySQL 8.0.13+ for expression defaults such as UUID().

-- 1. Users table
-- The taxpayer using your system.
CREATE TABLE users (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    tin VARCHAR(20) NOT NULL UNIQUE,          -- LHDN Tax Identification Number
    filing_status VARCHAR(20) NOT NULL,       -- SINGLE, MARRIED_JOINT, MARRIED_SEPARATE
    has_disability BOOLEAN DEFAULT FALSE,
    spouse_has_disability BOOLEAN DEFAULT FALSE,
    spouse_working BOOLEAN DEFAULT NULL,
    assessment_year VARCHAR(6) NOT NULL,      -- e.g. YA2025
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Dependents
-- Children and parents needed for certain relief eligibility.
CREATE TABLE dependents (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    relationship VARCHAR(20) NOT NULL,        -- CHILD, PARENT
    name VARCHAR(255) NOT NULL,
    age INT,
    has_disability BOOLEAN DEFAULT FALSE,
    in_full_time_education BOOLEAN DEFAULT FALSE,
    parent_medical_condition BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_dependents_user
        FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Connected accounts
-- Bank accounts the user has consented to share.
CREATE TABLE connected_accounts (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    institution VARCHAR(50) NOT NULL,         -- MAYBANK, CIMB, RHB, etc.
    account_ref VARCHAR(50) NOT NULL,         -- masked account number
    consent_id VARCHAR(100) NOT NULL,
    consent_status VARCHAR(20) DEFAULT 'ACTIVE',
    consent_expiry DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_connected_accounts_user
        FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Financial records
-- One row per transaction pulled from the open finance API.
CREATE TABLE financial_records (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    record_id VARCHAR(50) NOT NULL UNIQUE,    -- from open finance API e.g. REC-001
    transaction_date DATE NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'MYR',
    direction VARCHAR(10) NOT NULL,           -- INFLOW, OUTFLOW
    institution VARCHAR(50) NOT NULL,
    account_ref VARCHAR(50) NOT NULL,
    transaction_ref VARCHAR(100),
    payment_method VARCHAR(30),               -- FPX, DEBIT_CARD, CREDIT_CARD, DUITNOW
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_financial_records_user
        FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Invoices
-- E-invoice data linked to each financial record.
CREATE TABLE invoices (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    financial_record_id CHAR(36) NOT NULL UNIQUE,
    uuid VARCHAR(100) NOT NULL UNIQUE,        -- LHDN MyInvois UUID
    invoice_number VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL,              -- VALID, CANCELLED, ADJUSTED
    supplier_name VARCHAR(255) NOT NULL,
    supplier_tin VARCHAR(20) NOT NULL,
    supplier_registration_no VARCHAR(50),
    total_amount DECIMAL(12,2) NOT NULL,
    issue_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_invoices_financial_record
        FOREIGN KEY (financial_record_id) REFERENCES financial_records(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Invoice line items
-- The purchased items where classification happens.
CREATE TABLE invoice_line_items (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    invoice_id CHAR(36) NOT NULL,
    description VARCHAR(500) NOT NULL,        -- "Climbing Shoes - Vertika"
    classification_code VARCHAR(10) NOT NULL, -- MSIC code e.g. 47640
    quantity INT NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL,
    tax_amount DECIMAL(12,2) DEFAULT 0.00,
    total_amount DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_invoice_line_items_invoice
        FOREIGN KEY (invoice_id) REFERENCES invoices(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Tax relief categories
-- Reference table updated once per year from LHDN guidelines.
CREATE TABLE tax_relief_categories (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    assessment_year VARCHAR(6) NOT NULL,      -- YA2025
    relief_code VARCHAR(50) NOT NULL,         -- MEDICAL_SELF, LIFESTYLE, EDUCATION_SELF
    category_name VARCHAR(255) NOT NULL,
    max_amount DECIMAL(12,2) NOT NULL,
    sub_limit DECIMAL(12,2) DEFAULT NULL,     -- some reliefs have sub-caps
    parent_relief_code VARCHAR(50) DEFAULT NULL,
    auto_applied BOOLEAN DEFAULT FALSE,       -- e.g. individual relief RM9000
    description TEXT,
    UNIQUE KEY uq_tax_relief_categories_year_code (assessment_year, relief_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Classification code to relief mapping
-- Maps MSIC classification codes to tax relief categories.
CREATE TABLE classification_relief_mapping (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    classification_code VARCHAR(10) NOT NULL,
    relief_code VARCHAR(50) NOT NULL,
    assessment_year VARCHAR(6) NOT NULL,
    confidence DECIMAL(3,2) DEFAULT 1.00,     -- 1.00 = definite match, lower = needs review
    UNIQUE KEY uq_classification_relief_mapping (classification_code, relief_code, assessment_year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Categorized transactions
-- Output of your model; each line item mapped to a relief.
CREATE TABLE categorized_items (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    line_item_id CHAR(36) NOT NULL,
    relief_code VARCHAR(50) NOT NULL,
    eligible_amount DECIMAL(12,2) NOT NULL,
    confidence DECIMAL(3,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'AUTO',        -- AUTO, USER_CONFIRMED, USER_CORRECTED, REJECTED
    assessment_year VARCHAR(6) NOT NULL,
    categorized_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_categorized_items_line_relief (line_item_id, relief_code),
    CONSTRAINT fk_categorized_items_user
        FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_categorized_items_line_item
        FOREIGN KEY (line_item_id) REFERENCES invoice_line_items(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Relief summary
-- Precomputed totals per relief category per user for dashboard reads.
CREATE TABLE relief_summary (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    assessment_year VARCHAR(6) NOT NULL,
    relief_code VARCHAR(50) NOT NULL,
    max_amount DECIMAL(12,2) NOT NULL,
    claimed_amount DECIMAL(12,2) DEFAULT 0.00,
    remaining_quota DECIMAL(12,2) NOT NULL,
    item_count INT DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_relief_summary_user_year_code (user_id, assessment_year, relief_code),
    CONSTRAINT fk_relief_summary_user
        FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
