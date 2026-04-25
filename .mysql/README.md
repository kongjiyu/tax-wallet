# MySQL Schema

This directory contains the MySQL database artifacts for the Open Finance tax wallet prototype.

## Files

- `OpenFinanceSchema.sql` defines the MySQL relational schema.
- `generate_mock_mysql_sql.py` generates MySQL-compatible `INSERT` seed data.
- `mock_openfinance_seed.sql` is the default generated output when the mock-data script is run.

## Schema Overview

The schema models a taxpayer's consented open-finance records, linked e-invoice data, and tax-relief categorization output.

`users` is the root taxpayer table. It stores taxpayer identity, filing status, disability flags, spouse context, and the assessment year.

`dependents` stores children and parents linked to a user. These records support relief eligibility rules such as child education, parent medical treatment, and disability-related conditions.

`connected_accounts` stores bank accounts that the user has consented to share through open finance. Each account has an institution, masked account reference, consent ID, consent status, and consent expiry.

`financial_records` stores transaction-level records from an open-finance provider. Each transaction belongs to a user and includes the record ID, transaction date, amount, direction, institution, account reference, transaction reference, and payment method.

`invoices` stores e-invoice metadata linked one-to-one with a financial record. It includes invoice UUID, invoice number, status, supplier identity, total amount, and issue date.

`invoice_line_items` stores the purchased goods or services inside each invoice. These rows are the main input for classification because each line item has a description, classification code, quantity, unit price, tax amount, and total amount.

`tax_relief_categories` is the yearly reference table for available tax reliefs. It stores the relief code, display name, max claimable amount, optional sub-limit, parent relief relationship, and whether the relief is auto-applied.

`classification_relief_mapping` maps classification codes to relief codes for a given assessment year. This is the deterministic reference layer used before or alongside model classification.

`categorized_items` stores the output of the classification process. Each invoice line item can be mapped to a relief code with an eligible amount, confidence score, status, and assessment year.

`relief_summary` stores precomputed totals per user, assessment year, and relief code. It is intended for dashboard reads and quota tracking.

## Relationship Flow

The main data flow is:

```text
users
  -> dependents
  -> connected_accounts
  -> financial_records
      -> invoices
          -> invoice_line_items
              -> categorized_items
  -> relief_summary
```

Reference data is stored separately:

```text
tax_relief_categories
classification_relief_mapping
```

## MySQL Notes

The schema stores UUIDs as `CHAR(36)` and uses `DEFAULT (UUID())`, which requires MySQL 8.0.13 or newer.

The schema uses InnoDB, `utf8mb4`, and explicit foreign-key constraints. The transaction date column is named `transaction_date` to avoid relying on `date` as a column name.

## Generate Mock Seed Data

From the project root:

```bash
python .mysql/generate_mock_mysql_sql.py
```

The default output is:

```text
.mysql/mock_openfinance_seed.sql
```

You can customize the amount of generated data:

```bash
python .mysql/generate_mock_mysql_sql.py --users 5 --records-per-user 20 --assessment-year YA2025
```

## Load Into MySQL

Create the schema first, then load the generated seed data:

```bash
mysql -u root -p your_database < .mysql/OpenFinanceSchema.sql
mysql -u root -p your_database < .mysql/mock_openfinance_seed.sql
```
