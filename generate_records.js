const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, 'customer_records');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

const baseUserId = "USR-001";
const baseConsentId = "CONSENT-2025-ABC";

// Generate 15 days of records (from 2025-04-01 to 2025-04-15)
for (let i = 1; i <= 15; i++) {
  const day = i.toString().padStart(2, '0');
  const dateStr = `2025-04-${day}`;
  
  const record = {
    userId: baseUserId,
    consentId: baseConsentId,
    dateRange: {
      from: dateStr,
      to: dateStr
    },
    financialRecords: [
      {
        recordId: `REC-04${day}-01`,
        date: dateStr,
        amount: parseFloat((Math.random() * 200 + 10).toFixed(2)), // Random amount between 10 and 210
        currency: "MYR",
        direction: Math.random() > 0.5 ? "OUTFLOW" : "INFLOW",
        source: {
          institution: "MAYBANK",
          accountRef: "ACC-***-7890",
          transactionRef: `TXN-${dateStr}-01`,
          paymentMethod: "DEBIT_CARD"
        },
        invoice: {
          uuid: `INV-UUID-${dateStr}`,
          invoiceNumber: `INV-202504${day}`,
          status: "VALID",
          supplier: {
            name: "DAILY MART SDN BHD",
            tin: "C1234567890",
            registrationNo: "1234567890"
          },
          lineItems: [
            {
              description: "Daily Groceries",
              classificationCode: "47110",
              quantity: 1,
              unitPrice: 50.00,
              taxAmount: 0.00,
              totalAmount: 50.00
            }
          ],
          totalAmount: 50.00
        }
      }
    ],
    summary: {
      totalRecords: 1,
      totalOutflow: 50.00,
      totalInflow: 0.00,
      institutionsIncluded: ["MAYBANK"]
    }
  };

  const filePath = path.join(outputDir, `record_${dateStr}.json`);
  fs.writeFileSync(filePath, JSON.stringify(record, null, 2));
}

console.log('Successfully generated 15 files in the customer_records directory.');
