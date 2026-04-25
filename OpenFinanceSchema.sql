-- 1. Users table
-- The taxpayer using your system
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    tin VARCHAR(20) UNIQUE NOT NULL,          -- LHDN Tax Identification Number
    filing_status VARCHAR(20) NOT NULL,       -- SINGLE, MARRIED_JOINT, MARRIED_SEPARATE
    has_disability BOOLEAN DEFAULT FALSE,
    spouse_has_disability BOOLEAN DEFAULT FALSE,
    spouse_working BOOLEAN DEFAULT NULL,
    assessment_year VARCHAR(6) NOT NULL,      -- e.g. YA2025
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Dependents
-- Children, parents — needed for certain relief eligibility
CREATE TABLE dependents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    relationship VARCHAR(20) NOT NULL,        -- CHILD, PARENT
    name VARCHAR(255) NOT NULL,
    age INT,
    has_disability BOOLEAN DEFAULT FALSE,
    in_full_time_education BOOLEAN DEFAULT FALSE,
    parent_medical_condition BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Connected accounts
-- Which bank accounts the user has consented to share
CREATE TABLE connected_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    institution VARCHAR(50) NOT NULL,         -- MAYBANK, CIMB, RHB, etc.
    account_ref VARCHAR(50) NOT NULL,         -- masked account number
    consent_id VARCHAR(100) NOT NULL,
    consent_status VARCHAR(20) DEFAULT 'ACTIVE',
    consent_expiry DATE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Financial records
-- One row per transaction pulled from open finance API
CREATE TABLE financial_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    record_id VARCHAR(50) UNIQUE NOT NULL,    -- from open finance API e.g. REC-001
    date DATE NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'MYR',
    direction VARCHAR(10) NOT NULL,           -- INFLOW, OUTFLOW
    institution VARCHAR(50) NOT NULL,
    account_ref VARCHAR(50) NOT NULL,
    transaction_ref VARCHAR(100),
    payment_method VARCHAR(30),               -- FPX, DEBIT_CARD, CREDIT_CARD, DUITNOW
    created_at TIMESTAMP DEFAULT NOW()
);

-- 5. Invoices
-- E-invoice data linked to each financial record
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    financial_record_id UUID UNIQUE NOT NULL REFERENCES financial_records(id),
    uuid VARCHAR(100) UNIQUE NOT NULL,        -- LHDN MyInvois UUID
    invoice_number VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL,              -- VALID, CANCELLED, ADJUSTED
    supplier_name VARCHAR(255) NOT NULL,
    supplier_tin VARCHAR(20) NOT NULL,
    supplier_registration_no VARCHAR(50),
    total_amount DECIMAL(12,2) NOT NULL,
    issue_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 6. Invoice line items
-- The actual items purchased — this is where classification happens
CREATE TABLE invoice_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id),
    description VARCHAR(500) NOT NULL,        -- "Climbing Shoes - Vertika"
    classification_code VARCHAR(10) NOT NULL, -- MSIC code e.g. 47640
    quantity INT NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL,
    tax_amount DECIMAL(12,2) DEFAULT 0.00,
    total_amount DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 7. Tax relief categories
-- Reference table — updated once per year from LHDN guidelines
CREATE TABLE tax_relief_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_year VARCHAR(6) NOT NULL,      -- YA2025
    relief_code VARCHAR(50) NOT NULL,         -- MEDICAL_SELF, LIFESTYLE, EDUCATION_SELF
    category_name VARCHAR(255) NOT NULL,
    max_amount DECIMAL(12,2) NOT NULL,
    sub_limit DECIMAL(12,2) DEFAULT NULL,     -- some reliefs have sub-caps
    parent_relief_code VARCHAR(50) DEFAULT NULL, -- for sub-categories under a main relief
    auto_applied BOOLEAN DEFAULT FALSE,       -- e.g. individual relief RM9000
    description TEXT,
    UNIQUE(assessment_year, relief_code)
);

-- 8. Classification code to relief mapping
-- Maps MSIC classification codes to tax relief categories
CREATE TABLE classification_relief_mapping (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    classification_code VARCHAR(10) NOT NULL,
    relief_code VARCHAR(50) NOT NULL,
    assessment_year VARCHAR(6) NOT NULL,
    confidence DECIMAL(3,2) DEFAULT 1.00,     -- 1.00 = definite match, lower = needs review
    UNIQUE(classification_code, relief_code, assessment_year)
);

-- 9. Categorized transactions
-- OUTPUT of your model — each line item mapped to a relief
CREATE TABLE categorized_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    line_item_id UUID NOT NULL REFERENCES invoice_line_items(id),
    relief_code VARCHAR(50) NOT NULL,
    eligible_amount DECIMAL(12,2) NOT NULL,   -- might differ from line item total
    confidence DECIMAL(3,2) NOT NULL,         -- model confidence score
    status VARCHAR(20) DEFAULT 'AUTO',        -- AUTO, USER_CONFIRMED, USER_CORRECTED, REJECTED
    assessment_year VARCHAR(6) NOT NULL,
    categorized_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(line_item_id, relief_code)
);

-- 10. Relief summary
-- Precomputed totals per relief category per user — your dashboard reads from this
CREATE TABLE relief_summary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    assessment_year VARCHAR(6) NOT NULL,
    relief_code VARCHAR(50) NOT NULL,
    max_amount DECIMAL(12,2) NOT NULL,
    claimed_amount DECIMAL(12,2) DEFAULT 0.00,
    remaining_quota DECIMAL(12,2) NOT NULL,
    item_count INT DEFAULT 0,
    last_updated TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, assessment_year, relief_code)
