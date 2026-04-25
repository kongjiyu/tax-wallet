import argparse
import random
import uuid
from collections import defaultdict
from datetime import date, datetime, timedelta
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path


NAMESPACE = uuid.UUID("8e5f3b3a-8b8b-4c9b-8d6e-7df5a1a7a001")


RELIEF_CATEGORIES = [
    {
        "relief_code": "INDIVIDUAL",
        "category_name": "Individual and dependent relatives",
        "max_amount": Decimal("9000.00"),
        "sub_limit": None,
        "parent_relief_code": None,
        "auto_applied": True,
        "description": "Automatic individual relief.",
    },
    {
        "relief_code": "MEDICAL_SELF",
        "category_name": "Medical expenses for self, spouse, or child",
        "max_amount": Decimal("10000.00"),
        "sub_limit": None,
        "parent_relief_code": None,
        "auto_applied": False,
        "description": "Medical treatment, consultation, medicine, and diagnostic tests.",
    },
    {
        "relief_code": "LIFESTYLE",
        "category_name": "Lifestyle expenses",
        "max_amount": Decimal("2500.00"),
        "sub_limit": None,
        "parent_relief_code": None,
        "auto_applied": False,
        "description": "Books, sports equipment, internet subscriptions, and related purchases.",
    },
    {
        "relief_code": "EDUCATION_SELF",
        "category_name": "Education fees for self",
        "max_amount": Decimal("7000.00"),
        "sub_limit": None,
        "parent_relief_code": None,
        "auto_applied": False,
        "description": "Approved tertiary and professional education expenses.",
    },
    {
        "relief_code": "CHILDCARE",
        "category_name": "Childcare fees",
        "max_amount": Decimal("3000.00"),
        "sub_limit": None,
        "parent_relief_code": None,
        "auto_applied": False,
        "description": "Registered childcare centre and kindergarten fees.",
    },
    {
        "relief_code": "PARENT_MEDICAL",
        "category_name": "Medical treatment for parents",
        "max_amount": Decimal("8000.00"),
        "sub_limit": None,
        "parent_relief_code": None,
        "auto_applied": False,
        "description": "Medical treatment and care expenses for parents.",
    },
]


ITEM_CATALOG = [
    {
        "description": "General Consultation",
        "classification_code": "86101",
        "relief_code": "MEDICAL_SELF",
        "supplier_name": "SUNWAY MEDICAL CENTRE SDN BHD",
        "supplier_tin": "C20051012345",
        "supplier_registration_no": "200501012345",
        "price_range": (Decimal("80.00"), Decimal("220.00")),
    },
    {
        "description": "Blood Test Full Panel",
        "classification_code": "86903",
        "relief_code": "MEDICAL_SELF",
        "supplier_name": "BP HEALTHCARE GROUP",
        "supplier_tin": "C19820107777",
        "supplier_registration_no": "198201007777",
        "price_range": (Decimal("120.00"), Decimal("380.00")),
    },
    {
        "description": "Prescription Medicine",
        "classification_code": "21009",
        "relief_code": "MEDICAL_SELF",
        "supplier_name": "CARING PHARMACY SDN BHD",
        "supplier_tin": "C19940101234",
        "supplier_registration_no": "199401001234",
        "price_range": (Decimal("25.00"), Decimal("160.00")),
    },
    {
        "description": "Personal Finance Book",
        "classification_code": "47610",
        "relief_code": "LIFESTYLE",
        "supplier_name": "MPH BOOKSTORES SDN BHD",
        "supplier_tin": "C19901005678",
        "supplier_registration_no": "199001005678",
        "price_range": (Decimal("35.00"), Decimal("150.00")),
    },
    {
        "description": "Sports Equipment",
        "classification_code": "47640",
        "relief_code": "LIFESTYLE",
        "supplier_name": "DECATHLON MALAYSIA SDN BHD",
        "supplier_tin": "C20171234567",
        "supplier_registration_no": "201701023456",
        "price_range": (Decimal("50.00"), Decimal("450.00")),
    },
    {
        "description": "Monthly Internet Subscription",
        "classification_code": "61103",
        "relief_code": "LIFESTYLE",
        "supplier_name": "TIME DOTCOM BERHAD",
        "supplier_tin": "C199601040939",
        "supplier_registration_no": "199601040939",
        "price_range": (Decimal("99.00"), Decimal("199.00")),
    },
    {
        "description": "Professional Certification Fee",
        "classification_code": "85499",
        "relief_code": "EDUCATION_SELF",
        "supplier_name": "ASIA PACIFIC UNIVERSITY SDN BHD",
        "supplier_tin": "C19930101222",
        "supplier_registration_no": "199301001222",
        "price_range": (Decimal("600.00"), Decimal("2500.00")),
    },
    {
        "description": "Kindergarten Monthly Fee",
        "classification_code": "85101",
        "relief_code": "CHILDCARE",
        "supplier_name": "BRIGHTKIDS KINDERGARTEN SDN BHD",
        "supplier_tin": "C20190104567",
        "supplier_registration_no": "201901004567",
        "price_range": (Decimal("450.00"), Decimal("900.00")),
    },
    {
        "description": "Parent Medical Checkup",
        "classification_code": "86102",
        "relief_code": "PARENT_MEDICAL",
        "supplier_name": "PANTAI HOSPITAL KUALA LUMPUR",
        "supplier_tin": "C19740101234",
        "supplier_registration_no": "197401001234",
        "price_range": (Decimal("180.00"), Decimal("700.00")),
    },
]


USERS = [
    ("Aiman Rahman", "IG560128104321", "SINGLE", False, False, None),
    ("Nurul Hassan", "IG780416107654", "MARRIED_JOINT", False, False, False),
    ("Wei Jian Lim", "IG840921105678", "MARRIED_SEPARATE", False, True, True),
]

INSTITUTIONS = [
    ("MAYBANK", "ACC-***-7890", "DEBIT_CARD"),
    ("CIMB", "ACC-***-4321", "FPX"),
    ("RHB", "ACC-***-1298", "DUITNOW"),
]


def money(value):
    return Decimal(value).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def sql_uuid(name):
    return str(uuid.uuid5(NAMESPACE, name))


def sql_string(value):
    if value is None:
        return "NULL"
    return "'" + str(value).replace("'", "''") + "'"


def sql_bool(value):
    if value is None:
        return "NULL"
    return "TRUE" if value else "FALSE"


def sql_decimal(value):
    return f"{money(value):.2f}"


def row(values):
    return "(" + ", ".join(values) + ")"


def insert_statement(table, columns, rows):
    if not rows:
        return ""
    rendered_rows = ",\n".join(f"    {row(values)}" for values in rows)
    return f"INSERT INTO {table} ({', '.join(columns)}) VALUES\n{rendered_rows};\n"


def random_money(rng, low, high):
    cents = rng.randint(int(low * 100), int(high * 100))
    return money(Decimal(cents) / Decimal("100"))


def generate_mock_data(user_count, records_per_user, assessment_year, seed):
    rng = random.Random(seed)
    base_year = int(assessment_year.replace("YA", ""))
    start_date = date(base_year, 1, 1)
    created_at = datetime(base_year, 1, 1, 9, 0, 0)

    users = []
    dependents = []
    accounts = []
    records = []
    invoices = []
    line_items = []
    categorized_items = []
    summary_totals = defaultdict(lambda: {"claimed": Decimal("0.00"), "count": 0})

    selected_users = [USERS[index % len(USERS)] for index in range(user_count)]

    for user_index, user_template in enumerate(selected_users, start=1):
        name, tin, filing_status, has_disability, spouse_has_disability, spouse_working = user_template
        user_id = sql_uuid(f"user-{user_index}")
        user_created_at = created_at + timedelta(days=user_index)
        users.append(
            [
                sql_string(user_id),
                sql_string(name),
                sql_string(tin if user_index <= len(USERS) else f"IG90010110{user_index:04d}"),
                sql_string(filing_status),
                sql_bool(has_disability),
                sql_bool(spouse_has_disability),
                sql_bool(spouse_working),
                sql_string(assessment_year),
                sql_string(user_created_at),
                sql_string(user_created_at),
            ]
        )

        dependent_templates = [
            ("CHILD", f"{name.split()[0]} Child", rng.randint(3, 17), False, rng.choice([True, False]), False),
            ("PARENT", f"{name.split()[0]} Parent", rng.randint(62, 78), rng.choice([False, False, True]), False, True),
        ]
        for dep_index, dep in enumerate(dependent_templates, start=1):
            relationship, dep_name, age, dep_disabled, full_time, parent_medical = dep
            dependents.append(
                [
                    sql_string(sql_uuid(f"dependent-{user_index}-{dep_index}")),
                    sql_string(user_id),
                    sql_string(relationship),
                    sql_string(dep_name),
                    str(age),
                    sql_bool(dep_disabled),
                    sql_bool(full_time),
                    sql_bool(parent_medical),
                    sql_string(user_created_at),
                ]
            )

        for account_index, (institution, account_ref, _) in enumerate(INSTITUTIONS[:2], start=1):
            accounts.append(
                [
                    sql_string(sql_uuid(f"account-{user_index}-{account_index}")),
                    sql_string(user_id),
                    sql_string(institution),
                    sql_string(account_ref),
                    sql_string(f"CONSENT-{base_year}-{user_index:03d}-{account_index:02d}"),
                    sql_string("ACTIVE"),
                    sql_string(date(base_year, 12, 31)),
                    sql_string(user_created_at),
                ]
            )

        for record_index in range(1, records_per_user + 1):
            item_count = rng.choice([1, 1, 2, 3])
            purchased_items = rng.sample(ITEM_CATALOG, k=item_count)
            institution, account_ref, payment_method = rng.choice(INSTITUTIONS)
            record_date = start_date + timedelta(days=rng.randint(0, 330))
            record_id = sql_uuid(f"financial-record-{user_index}-{record_index}")
            invoice_id = sql_uuid(f"invoice-{user_index}-{record_index}")
            transaction_ref = f"{payment_method}-{record_date:%Y%m%d}-{user_index:03d}{record_index:03d}"
            invoice_total = Decimal("0.00")

            invoice_line_ids = []
            for item_index, item in enumerate(purchased_items, start=1):
                quantity = rng.choice([1, 1, 1, 2])
                unit_price = random_money(rng, item["price_range"][0], item["price_range"][1])
                tax_amount = money(unit_price * quantity * Decimal("0.00"))
                total_amount = money((unit_price * quantity) + tax_amount)
                line_item_id = sql_uuid(f"line-item-{user_index}-{record_index}-{item_index}")
                invoice_total += total_amount
                invoice_line_ids.append((line_item_id, item, total_amount))
                line_items.append(
                    [
                        sql_string(line_item_id),
                        sql_string(invoice_id),
                        sql_string(item["description"]),
                        sql_string(item["classification_code"]),
                        str(quantity),
                        sql_decimal(unit_price),
                        sql_decimal(tax_amount),
                        sql_decimal(total_amount),
                        sql_string(datetime.combine(record_date, datetime.min.time())),
                    ]
                )

            records.append(
                [
                    sql_string(record_id),
                    sql_string(user_id),
                    sql_string(f"REC-{base_year}-{user_index:03d}-{record_index:04d}"),
                    sql_string(record_date),
                    sql_decimal(invoice_total),
                    sql_string("MYR"),
                    sql_string("OUTFLOW"),
                    sql_string(institution),
                    sql_string(account_ref),
                    sql_string(transaction_ref),
                    sql_string(payment_method),
                    sql_string(datetime.combine(record_date, datetime.min.time())),
                ]
            )

            supplier = purchased_items[0]
            invoices.append(
                [
                    sql_string(invoice_id),
                    sql_string(record_id),
                    sql_string(f"INV-UUID-{base_year}-{user_index:03d}-{record_index:04d}"),
                    sql_string(f"INV-{base_year}{record_index:04d}-{user_index:03d}"),
                    sql_string("VALID"),
                    sql_string(supplier["supplier_name"]),
                    sql_string(supplier["supplier_tin"]),
                    sql_string(supplier["supplier_registration_no"]),
                    sql_decimal(invoice_total),
                    sql_string(record_date),
                    sql_string(datetime.combine(record_date, datetime.min.time())),
                ]
            )

            for line_item_id, item, total_amount in invoice_line_ids:
                max_amount = next(
                    category["max_amount"]
                    for category in RELIEF_CATEGORIES
                    if category["relief_code"] == item["relief_code"]
                )
                existing_claimed = summary_totals[(user_id, item["relief_code"])]["claimed"]
                eligible_amount = min(total_amount, max(Decimal("0.00"), max_amount - existing_claimed))
                confidence = Decimal(str(rng.choice([0.87, 0.91, 0.95, 0.98, 1.00])))
                categorized_items.append(
                    [
                        sql_string(sql_uuid(f"categorized-{line_item_id}-{item['relief_code']}")),
                        sql_string(user_id),
                        sql_string(line_item_id),
                        sql_string(item["relief_code"]),
                        sql_decimal(eligible_amount),
                        sql_decimal(confidence),
                        sql_string("AUTO"),
                        sql_string(assessment_year),
                        sql_string(datetime.combine(record_date, datetime.min.time())),
                    ]
                )
                summary_totals[(user_id, item["relief_code"])]["claimed"] += eligible_amount
                summary_totals[(user_id, item["relief_code"])]["count"] += 1

        individual_max = next(
            category["max_amount"] for category in RELIEF_CATEGORIES if category["relief_code"] == "INDIVIDUAL"
        )
        summary_totals[(user_id, "INDIVIDUAL")]["claimed"] = individual_max
        summary_totals[(user_id, "INDIVIDUAL")]["count"] = 1

    relief_category_rows = []
    for category in RELIEF_CATEGORIES:
        relief_category_rows.append(
            [
                sql_string(sql_uuid(f"relief-category-{assessment_year}-{category['relief_code']}")),
                sql_string(assessment_year),
                sql_string(category["relief_code"]),
                sql_string(category["category_name"]),
                sql_decimal(category["max_amount"]),
                "NULL" if category["sub_limit"] is None else sql_decimal(category["sub_limit"]),
                sql_string(category["parent_relief_code"]),
                sql_bool(category["auto_applied"]),
                sql_string(category["description"]),
            ]
        )

    mapping_rows = []
    seen_mappings = set()
    for item in ITEM_CATALOG:
        key = (item["classification_code"], item["relief_code"])
        if key in seen_mappings:
            continue
        seen_mappings.add(key)
        mapping_rows.append(
            [
                sql_string(sql_uuid(f"mapping-{assessment_year}-{item['classification_code']}-{item['relief_code']}")),
                sql_string(item["classification_code"]),
                sql_string(item["relief_code"]),
                sql_string(assessment_year),
                sql_decimal(Decimal("1.00")),
            ]
        )

    category_limits = {category["relief_code"]: category["max_amount"] for category in RELIEF_CATEGORIES}
    relief_summary_rows = []
    for (user_id, relief_code), values in sorted(summary_totals.items()):
        max_amount = category_limits[relief_code]
        claimed_amount = min(values["claimed"], max_amount)
        relief_summary_rows.append(
            [
                sql_string(sql_uuid(f"summary-{user_id}-{assessment_year}-{relief_code}")),
                sql_string(user_id),
                sql_string(assessment_year),
                sql_string(relief_code),
                sql_decimal(max_amount),
                sql_decimal(claimed_amount),
                sql_decimal(max(Decimal("0.00"), max_amount - claimed_amount)),
                str(values["count"]),
                sql_string(datetime(base_year, 12, 31, 23, 59, 0)),
            ]
        )

    return {
        "users": users,
        "dependents": dependents,
        "connected_accounts": accounts,
        "financial_records": records,
        "invoices": invoices,
        "invoice_line_items": line_items,
        "tax_relief_categories": relief_category_rows,
        "classification_relief_mapping": mapping_rows,
        "categorized_items": categorized_items,
        "relief_summary": relief_summary_rows,
    }


def build_sql(data):
    statements = [
        "-- Mock Open Finance PostgreSQL seed data",
        "-- Generated by generate_mock_openfinance_sql.py",
        "BEGIN;\n",
        insert_statement(
            "users",
            [
                "id",
                "name",
                "tin",
                "filing_status",
                "has_disability",
                "spouse_has_disability",
                "spouse_working",
                "assessment_year",
                "created_at",
                "updated_at",
            ],
            data["users"],
        ),
        insert_statement(
            "dependents",
            [
                "id",
                "user_id",
                "relationship",
                "name",
                "age",
                "has_disability",
                "in_full_time_education",
                "parent_medical_condition",
                "created_at",
            ],
            data["dependents"],
        ),
        insert_statement(
            "connected_accounts",
            [
                "id",
                "user_id",
                "institution",
                "account_ref",
                "consent_id",
                "consent_status",
                "consent_expiry",
                "created_at",
            ],
            data["connected_accounts"],
        ),
        insert_statement(
            "tax_relief_categories",
            [
                "id",
                "assessment_year",
                "relief_code",
                "category_name",
                "max_amount",
                "sub_limit",
                "parent_relief_code",
                "auto_applied",
                "description",
            ],
            data["tax_relief_categories"],
        ),
        insert_statement(
            "classification_relief_mapping",
            ["id", "classification_code", "relief_code", "assessment_year", "confidence"],
            data["classification_relief_mapping"],
        ),
        insert_statement(
            "financial_records",
            [
                "id",
                "user_id",
                "record_id",
                "date",
                "amount",
                "currency",
                "direction",
                "institution",
                "account_ref",
                "transaction_ref",
                "payment_method",
                "created_at",
            ],
            data["financial_records"],
        ),
        insert_statement(
            "invoices",
            [
                "id",
                "financial_record_id",
                "uuid",
                "invoice_number",
                "status",
                "supplier_name",
                "supplier_tin",
                "supplier_registration_no",
                "total_amount",
                "issue_date",
                "created_at",
            ],
            data["invoices"],
        ),
        insert_statement(
            "invoice_line_items",
            [
                "id",
                "invoice_id",
                "description",
                "classification_code",
                "quantity",
                "unit_price",
                "tax_amount",
                "total_amount",
                "created_at",
            ],
            data["invoice_line_items"],
        ),
        insert_statement(
            "categorized_items",
            [
                "id",
                "user_id",
                "line_item_id",
                "relief_code",
                "eligible_amount",
                "confidence",
                "status",
                "assessment_year",
                "categorized_at",
            ],
            data["categorized_items"],
        ),
        insert_statement(
            "relief_summary",
            [
                "id",
                "user_id",
                "assessment_year",
                "relief_code",
                "max_amount",
                "claimed_amount",
                "remaining_quota",
                "item_count",
                "last_updated",
            ],
            data["relief_summary"],
        ),
        "COMMIT;\n",
    ]
    return "\n".join(statement for statement in statements if statement)


def parse_args():
    parser = argparse.ArgumentParser(description="Generate PostgreSQL INSERT seed data for OpenFinanceSchema.sql.")
    default_output = Path(__file__).resolve().with_name("mock_openfinance_seed.sql")
    parser.add_argument("--output", default=str(default_output), help="Output SQL file path.")
    parser.add_argument("--users", type=int, default=3, help="Number of mock users to generate.")
    parser.add_argument("--records-per-user", type=int, default=12, help="Financial records per user.")
    parser.add_argument("--assessment-year", default="YA2025", help="Assessment year, for example YA2025.")
    parser.add_argument("--seed", type=int, default=20250425, help="Random seed for repeatable output.")
    return parser.parse_args()


def main():
    args = parse_args()
    data = generate_mock_data(
        user_count=args.users,
        records_per_user=args.records_per_user,
        assessment_year=args.assessment_year,
        seed=args.seed,
    )
    sql = build_sql(data)
    with open(args.output, "w", encoding="utf-8") as output_file:
        output_file.write(sql)
    print(f"Wrote {args.output}")
    print(f"Users: {len(data['users'])}")
    print(f"Financial records: {len(data['financial_records'])}")
    print(f"Invoices: {len(data['invoices'])}")
    print(f"Line items: {len(data['invoice_line_items'])}")
    print(f"Categorized items: {len(data['categorized_items'])}")


if __name__ == "__main__":
    main()
