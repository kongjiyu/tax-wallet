import os
import json
import random

output_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'customer_records')
os.makedirs(output_dir, exist_ok=True)

base_user_id = "USR-001"
base_consent_id = "CONSENT-2025-ABC"

for i in range(1, 16):
    day = f"{i:02d}"
    date_str = f"2025-04-{day}"
    amount = round(random.uniform(10, 210), 2)
    direction = "OUTFLOW" if random.random() > 0.5 else "INFLOW"
    
    record = {
        "userId": base_user_id,
        "consentId": base_consent_id,
        "dateRange": {
            "from": date_str,
            "to": date_str
        },
        "financialRecords": [
            {
                "recordId": f"REC-04{day}-01",
                "date": date_str,
                "amount": amount,
                "currency": "MYR",
                "direction": direction,
                "source": {
                    "institution": "MAYBANK",
                    "accountRef": "ACC-***-7890",
                    "transactionRef": f"TXN-{date_str}-01",
                    "paymentMethod": "DEBIT_CARD"
                },
                "invoice": {
                    "uuid": f"INV-UUID-{date_str}",
                    "invoiceNumber": f"INV-202504{day}",
                    "status": "VALID",
                    "supplier": {
                        "name": "DAILY MART SDN BHD",
                        "tin": "C1234567890",
                        "registrationNo": "1234567890"
                    },
                    "lineItems": [
                        {
                            "description": "Daily Groceries",
                            "classificationCode": "47110",
                            "quantity": 1,
                            "unitPrice": amount,
                            "taxAmount": 0.00,
                            "totalAmount": amount
                        }
                    ],
                    "totalAmount": amount
                }
            }
        ],
        "summary": {
            "totalRecords": 1,
            "totalOutflow": amount if direction == "OUTFLOW" else 0.00,
            "totalInflow": amount if direction == "INFLOW" else 0.00,
            "institutionsIncluded": ["MAYBANK"]
        }
    }
    
    file_path = os.path.join(output_dir, f"record_{date_str}.json")
    with open(file_path, 'w') as f:
        json.dump(record, f, indent=2)

print("Successfully generated 15 files in the customer_records directory.")
