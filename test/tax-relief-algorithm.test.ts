/**
 * Test file for Tax Relief Categorization Algorithm (Updated with Official LHDN Categories)
 */

import {
  categorizeTransaction,
  processTransactions,
  generateTaxReliefSummary,
  getReviewQueue,
  getCategoryInfo,
  Transaction,
  EInvoice,
  TaxReliefCategory
} from './tax-relief-algorithm';

// Sample transaction data mimicking real Malaysian transactions
const sampleTransactions: Transaction[] = [
  {
    id: 'TXN001',
    date: '2025-01-15',
    amount: 5000.00,
    counterpartyName: 'Great Eastern Life Assurance',
    counterpartyType: 'business',
    description: 'Life insurance premium payment - annual',
    source: 'bank'
  },
  {
    id: 'TXN002',
    date: '2025-01-20',
    amount: 2500.00,
    counterpartyName: 'AIA Berhad',
    counterpartyType: 'business',
    description: 'Medical insurance card - hospitalization',
    source: 'bank'
  },
  {
    id: 'TXN003',
    date: '2025-02-01',
    amount: 150.00,
    counterpartyName: 'Nasi Kandaq Village',
    counterpartyType: 'business',
    description: 'Lunch expenses',
    source: 'ewallet'
  },
  {
    id: 'TXN004',
    date: '2025-02-05',
    amount: 8500.00,
    counterpartyName: 'University Malaya',
    counterpartyType: 'business',
    description: 'Tuition fee - Bachelor Degree Year 1',
    source: 'bank'
  },
  {
    id: 'TXN005',
    date: '2025-02-10',
    amount: 200.00,
    counterpartyName: 'Ahmad bin Hassan',
    counterpartyType: 'individual',
    description: 'Transfer to friend - repayment',
    source: 'ewallet'
  },
  {
    id: 'TXN006',
    date: '2025-02-15',
    amount: 350.00,
    counterpartyName: 'Sunway Medical Centre',
    counterpartyType: 'business',
    description: 'Medical treatment - specialist consultation',
    source: 'bank'
  },
  {
    id: 'TXN007',
    date: '2025-03-01',
    amount: 1500.00,
    counterpartyName: 'Jabatan Zakat Selangor',
    counterpartyType: 'business',
    description: 'Zakat payment - 2025',
    source: 'bank'
  },
  {
    id: 'TXN008',
    date: '2025-03-10',
    amount: 2999.00,
    counterpartyName: 'Computer Zone Sdn Bhd',
    counterpartyType: 'business',
    description: 'Laptop purchase - university student',
    source: 'bank'
  },
  {
    id: 'TXN009',
    date: '2025-03-15',
    amount: 89.00,
    counterpartyName: 'Guardian Pharmacy',
    counterpartyType: 'business',
    description: 'Medicine purchase - paracetamol',
    source: 'ewallet'
  },
  {
    id: 'TXN010',
    date: '2025-03-20',
    amount: 120.00,
    counterpartyName: 'FamilyMart',
    counterpartyType: 'business',
    description: 'Snacks and drinks',
    source: 'ewallet'
  },
  {
    id: 'TXN011',
    date: '2025-04-05',
    amount: 180.00,
    counterpartyName: 'Maxis Berhad',
    counterpartyType: 'business',
    description: 'Broadband internet bill - home fiber',
    source: 'bank'
  },
  {
    id: 'TXN012',
    date: '2025-04-10',
    amount: 450.00,
    counterpartyName: 'PTPTN',
    counterpartyType: 'business',
    description: 'Education loan interest payment',
    source: 'bank'
  },
  {
    id: 'TXN013',
    date: '2025-04-15',
    amount: 85.00,
    counterpartyName: 'Popular Bookstore',
    counterpartyType: 'business',
    description: 'Books purchase - professional development',
    source: 'ewallet'
  },
  {
    id: 'TXN014',
    date: '2025-04-20',
    amount: 250.00,
    counterpartyName: 'Anwar bin Mohd',
    counterpartyType: 'individual',
    description: 'Transfer to friend - shared expenses',
    source: 'bank'
  },
  {
    id: 'TXN015',
    date: '2025-05-01',
    amount: 7500.00,
    counterpartyName: 'Taylor University',
    counterpartyType: 'business',
    description: 'Postgraduate tuition fee - Master degree',
    source: 'bank'
  }
];

// Sample eInvoice data
const sampleEInvoices: Map<string, EInvoice> = new Map([
  ['TXN001', {
    id: 'EINV001',
    invoiceNumber: 'GEF-20250115-001-InP-111',
    date: '2025-01-15',
    sellerName: 'Great Eastern Life Assurance (Malaysia) Berhad',
    buyerName: 'CHAU SENG CHONG',
    totalAmount: 5000.00,
    items: [{
      description: 'LIFE - Insurance premium - annual policy',
      quantity: 1,
      unitPrice: 5000.00,
      totalPrice: 5000.00,
      taxType: '06 (Not Applicable)',
      taxRate: 0
    }]
  }],
  ['TXN004', {
    id: 'EINV004',
    invoiceNumber: 'UM-20250205-001',
    date: '2025-02-05',
    sellerName: 'University Malaya',
    buyerName: 'CHAU SENG CHONG',
    totalAmount: 8500.00,
    items: [{
      description: 'Tuition Fee - Bachelor of Medicine Year 1',
      quantity: 1,
      unitPrice: 8500.00,
      totalPrice: 8500.00,
      taxType: '06 (Not Applicable)',
      taxRate: 0
    }]
  }]
]);

/**
 * Print category details
 */
function printCategoryDetails(result: ReturnType<typeof categorizeTransaction>) {
  console.log(`    Category: ${result.incomeCategory}`);

  if (result.nonIncomeSubCategory) {
    console.log(`    Sub-category: ${result.nonIncomeSubCategory}`);
  }

  if (result.taxReliefCategory) {
    console.log(`    Tax Relief Category: ${result.taxReliefCategory}`);
    console.log(`    Proof Required: ${result.proofRequired}`);
    console.log(`    Government Verifiable: ${result.governmentVerifiable ? 'Yes' : 'No'}`);
    console.log(`    Max Relief Amount: RM ${result.maxReliefAmount || 'N/A'}`);
    console.log(`    Confidence: ${(result.confidence * 100).toFixed(0)}%`);

    if (result.proofReason) {
      console.log(`    Reason: ${result.proofReason}`);
    }
  }

  if (result.requiresReview) {
    console.log(`    ⚠️  REVIEW REQUIRED: ${result.reviewReason}`);
  }
}

/**
 * Run tests
 */
function runTests() {
  console.log('='.repeat(80));
  console.log('TAX RELIEF CATEGORIZATION ALGORITHM - TEST');
  console.log('Official LHDN Categories (YA 2025)');
  console.log('='.repeat(80));
  console.log();

  // Process all transactions
  const results = processTransactions(sampleTransactions, sampleEInvoices);

  console.log(`Processing ${results.length} transactions...\n`);

  // Individual to Individual transactions (skipped)
  const i2iResults = results.filter(r => r.transactionType === 'individual_to_individual');
  console.log(`[SKIPPED] Individual to Individual: ${i2iResults.length}`);
  i2iResults.forEach(r => {
    console.log(`  - ${r.transaction.id}: ${r.transaction.description}`);
  });
  console.log();

  // Individual to Business transactions (processed)
  const i2bResults = results.filter(r => r.transactionType === 'individual_to_business');
  console.log(`[PROCESSED] Individual to Business: ${i2bResults.length}`);
  console.log();

  results.forEach((result, index) => {
    // Skip individual to individual
    if (result.transactionType === 'individual_to_individual') {
      return;
    }

    console.log(`[${index + 1}] ${result.transaction.id}`);
    console.log(`    Description: ${result.transaction.description}`);
    console.log(`    Counterparty: ${result.transaction.counterpartyName}`);
    console.log(`    Amount: RM ${result.transaction.amount.toFixed(2)}`);

    printCategoryDetails(result);

    if (result.einvoice) {
      console.log(`    eInvoice: ${result.einvoice.invoiceNumber}`);
      result.einvoice.items.forEach(item => {
        console.log(`      Item: ${item.description}`);
      });
    }

    console.log();
  });

  // Summary report
  console.log('='.repeat(80));
  console.log('SUMMARY REPORT');
  console.log('='.repeat(80));

  const summary = generateTaxReliefSummary(results);

  console.log();
  console.log('OVERALL:');
  console.log(`  Total Transactions: ${summary.total}`);
  console.log(`  Individual to Business (processed): ${summary.individualToBusiness}`);
  console.log(`  Individual to Individual (skipped): ${i2iResults.length}`);
  console.log();

  console.log('INCOME CATEGORIZATION:');
  console.log(`  Income: ${summary.income}`);
  console.log(`  Non-Income:`);
  console.log(`    - Tax Relief: ${summary.nonIncome.taxRelief}`);
  console.log(`    - Non-Tax Relief: ${summary.nonIncome.nonTaxRelief}`);
  console.log(`    - Unclassified: ${summary.nonIncome.unclassified}`);
  console.log();

  console.log('TAX RELIEF BY CATEGORY:');
  if (Object.keys(summary.taxReliefByCategory).length > 0) {
    for (const [category, count] of Object.entries(summary.taxReliefByCategory)) {
      const categoryInfo = getCategoryInfo(category as TaxReliefCategory);
      console.log(`  - ${category}: ${count} (Max: RM ${categoryInfo.maxReliefAmount || 'N/A'})`);
    }
  } else {
    console.log('  (No tax relief items found)');
  }
  console.log();

  console.log('VERIFICATION STATUS:');
  console.log(`  Government Verifiable: ${summary.governmentVerifiable}`);
  console.log(`  Requires Proof Upload: ${summary.requiresProof}`);
  console.log(`  Requires Review: ${summary.requiresReview}`);
  console.log(`  Total Potential Relief: RM ${summary.totalPotentialRelief}`);
  console.log();

  // Review queue
  const reviewQueue = getReviewQueue(results);
  if (reviewQueue.length > 0) {
    console.log('='.repeat(80));
    console.log('REVIEW QUEUE (Items needing manual review)');
    console.log('='.repeat(80));
    reviewQueue.forEach((item, index) => {
      console.log(`\n[${index + 1}] ${item.transaction.id}`);
      console.log(`    ${item.transaction.description}`);
      console.log(`    Category: ${item.taxReliefCategory}`);
      console.log(`    Reason: ${item.reviewReason}`);
    });
  }

  console.log();
  console.log('='.repeat(80));
  console.log('TEST COMPLETE');
  console.log('='.repeat(80));
}

// Run tests
runTests();

export { sampleTransactions, sampleEInvoices };