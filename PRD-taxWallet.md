

# Product Requirement Document (PRD)

## taxWallet

**AI-Powered Open Finance Tax Relief Wallet for Malaysia**

---

## Table of Contents

1. Project Overview
2. Background and Problem Statement
3. Product Vision
4. Target Users
5. Product Goals
6. Key Concept
7. Scope
8. Malaysian Tax Relief Reference
9. User Journey
10. Core Features
11. Ads and Recommendation Engine
12. Final Output
13. Functional Requirements
14. Non-Functional Requirements
15. Data Model
16. Example Use Cases
17. MVP Features
18. MVP Demo Flow
19. Success Metrics
20. Risks and Mitigation
21. Future Enhancements
22. Final Product Positioning

---

## 1. Project Overview

**taxWallet** is a Malaysian personal tax relief wallet that uses the Open Finance concept to securely collect user financial transaction data from multiple banks, e-wallets, credit cards, and financial accounts with user consent.

The system links transaction data with e-Invoice records, uploaded receipts, statements, and supporting documents to identify potential personal income tax relief claims based on the latest Malaysian individual tax relief categories.

Instead of directly submitting tax to LHDN, taxWallet generates a structured tax relief summary that users can review and manually key into the LHDN MyTax / e-Filing website.

The product is designed for Malaysia’s future financial ecosystem, where Open Finance, e-Invoice, AI, and digital tax compliance work together.

---

## 2. Background and Problem Statement

Malaysia’s personal income tax filing process is still largely manual. During tax season, users need to remember what they spent on, collect receipts, check which expenses are tax-relief eligible, calculate annual limits, and manually enter the claim amount into the income tax website.

This creates several problems:

1. Users often do not know whether an expense is actually claimable.
2. Users may lose receipts, invoices, statements, or supporting documents.
3. Transaction records alone do not show item-level purchase details.
4. Some claimable categories, such as insurance, EPF, SOCSO, PRS, and SSPN, require statements instead of normal invoices.
5. Users may underclaim because they forget eligible expenses.
6. Users may overclaim because they misunderstand tax relief rules.
7. Users only realise these problems during tax season.

Malaysia is moving toward a more structured digital tax and financial data ecosystem. LHDN’s MyInvois APIs support searching and retrieving e-Invoice documents, including document source in XML or JSON format. This makes e-Invoice data machine-readable and useful for future tax automation use cases.

Bank Negara Malaysia has also published an Open Finance exposure draft that describes a framework for consent-driven customer information sharing across the financial sector. This supports the long-term vision of taxWallet, where users can securely connect financial data from different institutions with consent.

---

## 3. Product Vision

To build a future-ready Malaysian tax assistant where every transaction can become a real-time tax insight.

Instead of waiting until tax season, users can continuously track their potential tax relief throughout the year.

**Vision Statement:**

> taxWallet helps Malaysians understand, verify, and prepare their personal tax relief claims by connecting financial transactions, e-Invoices, uploaded documents, and Malaysian tax relief rules into one AI-powered wallet.

---

## 4. Target Users

### Primary Users

Individual Malaysian taxpayers who file personal income tax through LHDN MyTax / e-Filing.

### Secondary Users

Freelancers, gig workers, young professionals, families, and users with multiple spending sources such as banks, credit cards, debit cards, TNG eWallet, DuitNow, and other digital payment platforms.

### Future Users

SME owners or self-employed individuals who need stronger separation between personal expenses, business expenses, and claimable personal tax relief.

---

## 5. Product Goals

The system should:

1. Collect transaction data from multiple financial sources using Open Finance principles.
2. Match transaction data with e-Invoice records where possible.
3. Extract item-level invoice details to determine claimable and non-claimable items.
4. Allow users to upload supporting documents when transaction or e-Invoice data is insufficient.
5. Analyse expenses against Malaysia’s latest individual income tax relief categories.
6. Calculate how much tax relief is available under each category.
7. Show whether each claim is claimable, probably claimable, not claimable, needs document, needs user information, duplicate, or exceeded limit.
8. Recommend relevant offers or ads for unused tax relief categories.
9. Generate a final category-based summary for users to key into the income tax website.
10. Store evidence and audit trail for future verification.

---

## 6. Key Concept

The system should not rely on only one data source.

```text
Open Finance transaction data = proves payment happened

e-Invoice data = shows item-level purchase details

Uploaded supporting document = proves claimable amount when invoice is not enough

LHDN tax rules = determine whether the item is eligible

AI engine = classifies, explains, and recommends

User confirmation = final human review before tax summary
```

This is important because a bank transaction such as:

```text
Apple Store RM4,299
```

does not tell whether the user bought:

```text
iPhone
MacBook
phone case
charger
AppleCare
repair service
gift card
```

Only e-Invoice or receipt line items can show this.

For categories like insurance, the transaction may only show:

```text
AIA Malaysia RM250
```

However, the claimable amount may come from an annual insurance tax statement, not the transaction itself.

---

## 7. Scope

### 7.1 In Scope

The system will include:

1. User registration and profile setup.
2. Mock or simulated Open Finance transaction import.
3. Multi-bank and multi-wallet transaction data structure.
4. e-Invoice matching and line-item analysis.
5. Receipt and supporting document upload.
6. AI document extraction.
7. Tax relief rule engine.
8. Claim confidence status.
9. Tax relief dashboard.
10. Ads and recommendation engine for unused categories.
11. Final tax relief summary report.
12. Audit trail and evidence list.

### 7.2 Out of Scope for MVP

The MVP will not:

1. Directly submit tax returns to LHDN.
2. Guarantee final tax approval.
3. Provide official tax agent services.
4. Integrate with real banks or TNG production APIs.
5. Replace professional tax advice.
6. Automatically claim relief without user confirmation.

---

## 8. Malaysian Tax Relief Reference

The system should maintain a tax relief rule database based on LHDN’s latest official relief categories.

For individual tax filing, the system should focus on relief categories that can be supported by transaction data, e-Invoice data, receipts, or uploaded statements.

Example categories include:

| Category | Detection Source | Notes |
|---|---|---|
| Lifestyle relief | e-Invoice / receipt / transaction | Books, smartphone, computer, tablet, internet subscription, selected self-development items |
| Sports relief | e-Invoice / receipt | Sports equipment, gym membership, sports facility, competition fee |
| Medical expenses | Receipt / medical document | May require medical details or certificate |
| Parents’ medical expenses | Receipt + certification | Usually requires stronger proof |
| Education fees | Fee receipt / statement | Course type matters |
| Childcare / kindergarten | Receipt + child profile | Child age and centre status matter |
| Insurance | Insurance statement | Transaction alone is not enough |
| EPF | EPF statement | Usually from contribution statement |
| SOCSO | SOCSO statement / payroll | Usually from contribution record |
| PRS | PRS statement | Requires official statement |
| SSPN | SSPN statement | Based on net deposit, not just transaction |
| Donation | Approved donation receipt | Must be an approved donation |

The system must treat LHDN’s official tax relief page as the source of truth and update the relief rule database yearly.

---

## 9. User Journey

### Step 1: User Creates Account

The user registers and enters basic profile information:

```text
Name
Tax year
TIN / optional tax identifier
Employment type
Marital status
Spouse / child / parent details where relevant
Child age
Personal vs business use preference
```

This profile is needed because some tax relief categories depend on personal conditions.

---

### Step 2: User Connects Financial Data

The user connects bank, credit card, debit card, or e-wallet data using the Open Finance concept.

For MVP, this can be simulated with mock data.

The consent screen should clearly explain:

```text
What data is accessed:
- Transaction date
- Merchant name
- Amount
- Description
- Payment reference
- Account source

Purpose:
- To detect potential tax-relief eligible expenses

Access duration:
- User-defined or fixed period

Control:
- User can revoke access anytime
```

---

### Step 3: System Imports Transactions

The system imports transactions from different sources and normalises them into one format.

Example:

```json
{
  "transaction_id": "TXN001",
  "source": "Bank A Credit Card",
  "date": "2026-03-12",
  "merchant": "Apple Store Malaysia",
  "description": "Retail Purchase",
  "amount": 4299.00,
  "payment_reference": "CARD123456"
}
```

---

### Step 4: System Matches Transaction With e-Invoice

The system tries to link transactions with e-Invoice records.

Matching signals:

| Signal | Example |
|---|---|
| Merchant name | Apple Store Malaysia |
| Amount | RM4,299 |
| Transaction date | 12 March 2026 |
| Invoice date | 12 March 2026 |
| Payment reference | CARD123456 |
| Invoice number | INV-2026-0001 |
| Buyer identity | User’s TIN / name / email |
| MyInvois UUID | e-Invoice unique ID |

The system should use a confidence score when matching transactions with e-Invoices.

| Match Score | Action |
|---:|---|
| 85–100 | Auto-match |
| 60–84 | Ask user to confirm |
| Below 60 | Do not match |

---

### Step 5: System Analyses e-Invoice Line Items

Once matched, the system reads the e-Invoice line items.

Example:

```json
{
  "supplier": "Apple Store Malaysia",
  "invoice_total": 4299.00,
  "line_items": [
    {
      "description": "iPhone 15",
      "amount": 3999.00,
      "classification": "smartphone"
    },
    {
      "description": "Phone Case",
      "amount": 199.00,
      "classification": "accessory"
    },
    {
      "description": "USB-C Cable",
      "amount": 101.00,
      "classification": "accessory"
    }
  ]
}
```

The system should analyse each line item separately.

Example result:

| Line Item | Result |
|---|---|
| iPhone 15 | Potentially claimable under Lifestyle relief |
| Phone Case | Not claimable |
| USB-C Cable | Not claimable |

---

### Step 6: User Uploads Supporting Documents If Needed

If e-Invoice or transaction data is not enough, the system asks the user to upload proof.

This is especially important for:

| Category | Why Upload Is Needed |
|---|---|
| Insurance | Annual statement may separate life, medical, education, and non-claimable portions |
| SSPN | Need net deposit statement |
| EPF | Need contribution statement |
| SOCSO | Need contribution record |
| PRS | Need official PRS statement |
| Medical | May need diagnosis, medical certificate, or detailed receipt |
| Parents’ medical | May require certification by medical practitioner |
| Childcare | May need registered centre proof |
| Education | May need course details and institution proof |
| Donation | Must show approved donation receipt |

Example flow:

```text
Detected transaction:
AIA Malaysia RM250 monthly

System status:
Needs supporting document

User uploads:
Annual insurance tax statement

System extracts:
Life insurance claimable amount: RM1,200
Medical insurance claimable amount: RM800

System uses statement amount instead of transaction amount.
```

---

### Step 7: AI Document Extraction

The system uses AI/OCR to extract useful fields from uploaded files.

Extracted fields:

```text
Document type
Issuer name
Taxpayer name
Year of assessment
Policy number / account number
Claimable category
Claimable amount
Date range
Confidence score
```

Example:

```json
{
  "document_type": "Insurance Tax Statement",
  "issuer": "AIA Malaysia",
  "year": "2025",
  "life_insurance_claimable": 1200.00,
  "medical_insurance_claimable": 800.00,
  "confidence": 0.92
}
```

---

### Step 8: Tax Relief Rule Engine

The tax rule engine checks each claim candidate against:

```text
Relief category
Annual limit
Sub-limit
Eligible person
Tax year
Document requirement
User profile condition
Personal/business use condition
Remaining available relief amount
```

Example rule:

```text
If item is smartphone
AND user confirms non-business use
AND transaction is within assessment year
AND Lifestyle relief remaining amount > 0
THEN mark as probably claimable under Lifestyle relief
```

Example insurance rule:

```text
If uploaded insurance statement contains life insurance claimable amount
THEN map amount to Life Insurance / EPF category
AND cap based on yearly limit
```

---

### Step 9: Claim Status Output

Every transaction, invoice item, or uploaded document should receive one of these statuses:

| Status | Meaning |
|---|---|
| Claimable | Strong evidence and rule matched |
| Probably Claimable | Looks eligible but needs user confirmation |
| Needs Document | Transaction suggests claim but proof is missing |
| Needs User Info | Missing personal condition such as child age or personal/business use |
| Not Claimable | Does not match any relief category |
| Exceeded Limit | Category is eligible but annual cap is already reached |
| Duplicate / Possible Duplicate | Same claim may already be counted |

Example:

```text
Transaction:
Apple Store RM4,299

Matched e-Invoice:
iPhone RM3,999
Phone case RM199
USB-C cable RM101

System result:
iPhone: Probably Claimable under Lifestyle Relief
Phone case: Not Claimable
Cable: Not Claimable

Action required:
Confirm the iPhone is for non-business use.
```

---

## 10. Core Features

### 10.1 Open Finance Transaction Aggregation

The system collects transaction data from multiple financial sources with user consent.

For MVP, the Open Finance layer can be simulated using mock APIs or CSV imports.

### 10.2 e-Invoice Matching Engine

The system matches transactions with e-Invoice records using date, amount, merchant, invoice number, payment reference, buyer identity, and MyInvois UUID.

### 10.3 Line-Item Tax Analysis

The system analyses invoice line items instead of assuming the whole transaction is claimable.

### 10.4 Supporting Document Wallet

The system allows users to upload statements, receipts, certificates, and supporting proof for claims that cannot be verified through e-Invoice alone.

### 10.5 AI Document Extraction

The system extracts key information from uploaded documents, such as claimable amount, issuer, year, and category.

### 10.6 Tax Relief Rule Engine

The system maps each claim candidate to Malaysian tax relief categories and checks limits, conditions, and required proof.

### 10.7 User Confirmation and Audit Trail

The system requires user confirmation before including claims in the final summary. It also records which evidence was used.

### 10.8 Tax Relief Dashboard

The dashboard shows confirmed relief, potential relief, missing documents, remaining category limits, and recommendation opportunities.

---

## 11. Ads and Recommendation Engine

The system can recommend relevant offers based on unused tax relief categories.

However, this must be designed carefully to avoid looking like the system is encouraging unnecessary spending just for tax relief.

### Recommendation Goal

Help users discover useful products or services that may fit their remaining relief categories.

Example:

```text
You still have RM800 remaining under Sports Relief.
You may be interested in eligible gym memberships, sports facility bookings, or sports equipment.
```

### Recommendation Rules

The ads engine should:

1. Only show ads for categories with remaining relief balance.
2. Clearly state that eligibility is subject to LHDN rules.
3. Avoid guaranteeing tax deductibility.
4. Prioritise useful and relevant categories.
5. Allow users to hide or disable recommendations.
6. Separate tax guidance from paid promotion.
7. Label sponsored content clearly.

### Example Recommendation

```text
Remaining relief:
Sports Relief: RM700 available

Suggested:
- Gym membership plans
- Badminton court booking platforms
- Sports equipment stores

Disclaimer:
These suggestions may fall under sports-related relief depending on item type, receipt, and LHDN rules.
```

### Ad Matching Logic

```text
User's remaining relief category
+ user spending pattern
+ available partner offers
+ eligibility rules
= recommended offer
```

Example:

| Available Relief | Suggested Ad Category |
|---|---|
| Lifestyle relief | Books, laptop, smartphone, internet subscription |
| Sports relief | Gym, sports equipment, sports facility |
| Education relief | Approved upskilling courses |
| Medical relief | Health screening packages |
| Childcare relief | Registered childcare/kindergarten |
| PRS relief | PRS providers |
| Insurance relief | Medical/life insurance providers |

---

## 12. Final Output

At the end, the system generates a summary for the user to manually key into the income tax website.

The output should be grouped by LHDN relief category.

Example:

| Relief Category | Claimable Amount | Limit | Evidence | Status |
|---|---:|---:|---|---|
| Lifestyle Relief | RM2,300 | RM2,500 | e-Invoice + receipt | Ready |
| Sports Relief | RM600 | RM1,000 | e-Invoice | Ready |
| Medical Expenses | RM450 | Based on LHDN limit | Receipt uploaded | Ready |
| Insurance | RM2,000 | Based on category limit | Insurance statement | Ready |
| SSPN | RM3,500 | RM8,000 | SSPN statement | Ready |
| Education Fees | RM0 | Based on category limit | Missing course info | Needs Info |

The system should also export:

```text
Tax relief summary PDF
Excel report
Supporting document checklist
Missing proof list
Not claimable item list
Audit trail
```

---

## 13. Functional Requirements

### FR1: User Profile Management

The system shall allow users to create and update their tax profile.

The profile should include:

```text
Tax year
Relationship info
Child details
Spouse details
Parent-related claim info
Business/personal use declaration
```

### FR2: Consent-Based Financial Data Connection

The system shall allow users to connect financial accounts using Open Finance-style consent.

The consent module shall show:

```text
Data requested
Purpose
Duration
Revocation option
Privacy notice
```

### FR3: Transaction Import

The system shall import transaction data from mock Open Finance APIs, CSV files, or future bank/e-wallet APIs.

Transaction fields shall include:

```text
Transaction ID
Source
Date
Merchant
Description
Amount
Payment reference
Account type
```

### FR4: e-Invoice Matching

The system shall match transaction records with e-Invoice records using merchant, amount, date, invoice number, payment reference, and buyer details.

The system shall assign a match score.

```text
85–100: auto-match
60–84: ask user to confirm
below 60: no match
```

### FR5: e-Invoice Line Item Analysis

The system shall analyse each invoice line item separately.

The system shall not assume the entire transaction is claimable.

### FR6: Supporting Document Upload

The system shall allow users to upload PDF, image, or document files as proof for tax relief.

Supported documents include:

```text
Insurance statement
EPF statement
SOCSO statement
SSPN statement
PRS statement
Medical receipt
Medical certificate
Education receipt
Childcare receipt
Donation receipt
```

### FR7: Document Extraction

The system shall extract relevant information from uploaded documents.

Extracted data includes:

```text
Issuer
Document type
Year
Taxpayer name
Claimable amount
Claimable category
Date range
Confidence score
```

### FR8: Tax Relief Rule Engine

The system shall compare transaction, invoice, and document data with the latest Malaysian tax relief categories and limits.

LHDN’s official tax relief page should be treated as the reference source for category and limit updates.

### FR9: Claim Status Classification

The system shall classify each claim candidate into one of the following:

```text
Claimable
Probably Claimable
Needs Document
Needs User Info
Not Claimable
Exceeded Limit
Duplicate
```

### FR10: User Confirmation

The system shall require user confirmation before including an item in the final tax relief summary.

### FR11: Recommendation / Ads Engine

The system shall recommend relevant products or services based on remaining tax relief availability.

The system shall clearly label ads and avoid guaranteeing claim eligibility.

### FR12: Tax Relief Summary Report

The system shall generate a final report grouped by tax relief category.

The report shall include:

```text
Category name
Claimable amount
Annual limit
Evidence used
Missing proof
User confirmation status
Remarks
```

---

## 14. Non-Functional Requirements

### 14.1 Security

The system must protect sensitive financial and tax data.

Requirements:

```text
Encryption at rest
Encryption in transit
Secure authentication
Role-based access control
Audit logs
Secure file storage
```

### 14.2 Privacy

The system must follow data minimisation principles.

It should only collect data required for tax relief analysis.

### 14.3 Compliance

The system should support:

```text
User consent
Consent revocation
Data deletion
Purpose limitation
Document retention policy
```

### 14.4 Accuracy

The system should not guarantee that a claim will be approved by LHDN.

It should provide confidence levels and require user confirmation.

### 14.5 Explainability

Every claim suggestion should include a reason.

Example:

```text
This item is suggested under Lifestyle Relief because the e-Invoice line item contains “smartphone”.
User confirmation is required because the item must be for non-business use.
```

---

## 15. Data Model

### User

```text
user_id
name
email
tax_year
tin_optional
profile_status
```

### Transaction

```text
transaction_id
user_id
source
date
merchant
description
amount
payment_reference
raw_data
```

### EInvoice

```text
invoice_id
user_id
supplier
buyer
invoice_date
invoice_total
uuid
source_json
match_status
```

### InvoiceLineItem

```text
line_item_id
invoice_id
description
classification_code
amount
tax_amount
suggested_relief_category
claim_status
```

### SupportingDocument

```text
document_id
user_id
document_type
issuer
uploaded_file_url
extracted_data
confidence_score
```

### ReliefCategory

```text
category_id
tax_year
category_name
annual_limit
sub_limit
conditions
required_documents
```

### ClaimCandidate

```text
claim_id
user_id
source_type
source_id
relief_category
claimable_amount
confidence_score
status
reason
user_confirmation
```

### TaxSummary

```text
summary_id
user_id
tax_year
category
total_claimable
limit
remaining_amount
evidence_status
```

### ConsentRecord

```text
consent_id
user_id
provider_name
data_scope
purpose
start_date
expiry_date
status
revoked_at
```

### AuditLog

```text
audit_id
user_id
action
source_type
source_id
timestamp
remarks
```

---

## 16. Example Use Cases

### Use Case 1: Smartphone Purchase

```text
User pays RM4,299 at Apple Store.

System matches e-Invoice.

Line items:
- iPhone RM3,999
- Phone case RM199
- Cable RM101

System result:
The iPhone is probably claimable under Lifestyle Relief.
Accessories are not claimable.
User must confirm non-business use.
```

### Use Case 2: Insurance Payment

```text
User pays RM250 monthly to AIA.

Transaction data only says “Insurance Premium”.

System cannot determine claimable category.

System asks user to upload annual insurance tax statement.

Uploaded statement shows:
Life insurance claimable: RM1,200
Medical insurance claimable: RM800

System maps amounts to correct categories.
```

### Use Case 3: SSPN

```text
User has multiple SSPN deposits and withdrawals.

System asks user to upload SSPN annual statement.

System calculates or extracts net deposit.

Only net deposit amount is included in relief summary.
```

### Use Case 4: Medical Expense

```text
User pays RM500 at clinic.

e-Invoice shows:
- Health screening RM300
- Medicine RM200

System maps health screening to medical-related relief.
Medicine may require further classification.
User may need to upload detailed receipt or medical document.
```

### Use Case 5: Ads Recommendation

```text
User has RM1,000 unused Sports Relief.

System suggests:
- Gym membership
- Badminton court booking
- Sports equipment

System displays:
“Eligibility depends on LHDN rules, receipt details, and user confirmation.”
```

---

## 17. MVP Features

For hackathon MVP, build:

1. Mock Open Finance transaction dashboard.
2. Mock e-Invoice matching.
3. e-Invoice line-item classification.
4. Supporting document upload.
5. AI extraction simulation.
6. Tax relief rule engine with selected categories.
7. Claim status system.
8. Tax relief summary dashboard.
9. Ads/recommendation panel for unused categories.
10. Exportable summary report.

---

## 18. MVP Demo Flow

```text
1. User logs in.
2. User connects mock bank/e-wallet account.
3. System imports transactions.
4. System detects possible tax-relief items.
5. System matches Apple transaction to e-Invoice.
6. System analyses iPhone as possible Lifestyle Relief.
7. System detects AIA insurance transaction but cannot classify it.
8. User uploads insurance statement.
9. System extracts claimable insurance amount.
10. Dashboard updates total relief by category.
11. System shows unused relief and relevant recommendations.
12. User exports final tax relief summary for e-Filing.
```

---

## 19. Success Metrics

| Metric | Target |
|---|---:|
| Transaction import success rate | 95% for mock data |
| e-Invoice match accuracy | 85%+ for demo cases |
| Document extraction accuracy | 80%+ for structured documents |
| Claim classification explainability | 100% of claims show reason |
| User confirmation completion | 90%+ |
| Report generation success | 100% |
| Reduction in manual tax preparation effort | Demonstrated through demo flow |

---

## 20. Risks and Mitigation

| Risk | Mitigation |
|---|---|
| Real Open Finance APIs may not be available yet | Use mock APIs and design future-ready architecture |
| e-Invoice access may require authorisation | Use uploaded e-Invoice / mock MyInvois JSON for MVP |
| AI may misclassify tax relief | Use rule engine + confidence score + user confirmation |
| User may upload unclear documents | Show “Needs Review” status |
| Ads may be seen as encouraging spending | Clearly label ads and show eligibility disclaimer |
| Tax rules change yearly | Maintain versioned tax rule database |
| Sensitive data risk | Use encryption, consent, audit log, and data minimisation |

---

## 21. Future Enhancements

1. Real Open Finance API integration.
2. Real MyInvois document retrieval.
3. Auto-sync with e-Filing fields.
4. Tax chatbot for explaining relief categories.
5. Family tax planning mode.
6. SME / self-employed mode.
7. Multi-year tax relief comparison.
8. Partner marketplace for tax-relief-related offers.
9. Automatic missing document reminder.
10. AI audit-risk checker.
11. Document retention reminder for the 7-year record keeping requirement.

---

## 22. Final Product Positioning

**taxWallet** is not just a receipt scanner.

It is a future-ready tax intelligence wallet that combines:

```text
Open Finance
+ e-Invoice
+ AI document analysis
+ Malaysian tax relief rules
+ user confirmation
+ smart recommendations
```

Final pitch sentence:

> taxWallet uses Open Finance and e-Invoice data to turn everyday transactions into real-time Malaysian tax relief insights, helping users identify claimable expenses, upload missing proof, track remaining relief limits, discover relevant offers, and generate a ready-to-key-in tax summary for LHDN e-Filing.

---

## References

1. Bank Negara Malaysia. (2025). **Exposure Draft on Open Finance**. The draft describes the proposed Open Finance framework for consent-driven customer information sharing across the financial sector.
2. LHDN MyInvois SDK. **e-Invoice APIs**. The APIs include document search, document retrieval, document details, and XML/JSON document source retrieval.
3. LHDN MyInvois SDK. **Get Document API**. The API allows retrieval of document source in XML or JSON format together with additional tax authority metadata.
4. LHDN. **Tax Reliefs for Individual**. Official reference for Malaysian individual tax relief categories and limits by year of assessment.
5. LHDN. **Frequently Asked Question (Individual)**. LHDN states that supporting documents are not submitted together with the ITRF but must be kept for seven years.