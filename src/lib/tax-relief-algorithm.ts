/**
 * Tax Relief Categorization Algorithm - Updated with Official LHDN Categories
 * Based on: https://www.hasil.gov.my/en/individual/individual-life-cycle/income-declaration/tax-reliefs/
 *
 * Tax Relief Categories for Year of Assessment 2025
 */

export type TransactionType = 'individual_to_individual' | 'individual_to_business';
export type IncomeCategory = 'income' | 'non_income';
export type NonIncomeSubCategory = 'non_tax_relief' | 'tax_relief';

/**
 * Official LHDN Tax Relief Categories (YA 2025)
 * Based on actual categories from hasil.gov.my
 */
export type TaxReliefCategory =
  | 'individual_relief'                    // Item 1: Individual and dependent relatives (RM9,000)
  | 'parent_expenses'                      // Item 2: Expenses for parents and grandparents
  | 'medical_expenses'                     // Item 3: Medical expenses for self, spouse, child
  | 'medical_education_expenses'          // Item 4: Medical expenses for serious disease (up to RM10,000)
  | 'fertility_expenses'                   // Item 5: Fertility treatment
  | 'vaccination_expenses'                 // Item 6: Vaccination expenses (child 0-18 years, up to RM1,000)
  | 'education_fees'                       // Item 7: Education fees (up to RM7,000)
  | 'education_loan'                       // Item 8: Education loan interest
  | 'life_insurance'                       // Item 9: Life insurance / takaful (up to RM3,000)
  | 'medical_insurance'                    // Item 10: Medical/health insurance (up to RM4,000)
  | 'education_insurance'                  // Item 11: Education/medical insurance for children (up to RM2,000)
  | 'provident_fund'                       // Item 12: EPF/KWSP contributions
  | 'social_security'                     // Item 13: SOCSO/PEPS (up to RM350)
  | 'charity_donation'                    // Item 14: Zakat/charitable donations
  | 'deferred_annuity'                    // Item 15: Deferred annuity / PRS (up to RM3,000)
  | 'gateway'                              // Item 16: Private Retirement Scheme / Gateway
  | 'real_property_gains'                  // Item 17: Property gains exemption
  | 'home_loan'                           // Item 18: Interest from home loan (RM10,000)
  | 'broadband_internet'                  // Item 19: Broadband/internet (up to RM1,000)
  | 'books_journals'                      // Item 20: Books/journals (up to RM1,000)
  | 'sports_expenses'                     // Item 21: Sports equipment - Razak/Omar card
  | 'gym_expenses'                        // Item 21: Gym/fitness - individual
  | 'handphone'                          // Item 22: Handphone (up to RM1,000)
  | 'computer_laptop'                    // Item 22: Computer/laptop (up to RM1,000 per device)
  | 'electricity'                         // Item 23: Electricity (up to RM2,000)
  | 'disabled_dependent'                  // Item 24: Disabled dependent expenses
  | 'disabled_self'                       // Item 25: Disabled self expenses (RM6,000)
  | 'career_expenses'                    // Item 26: Career expenses (up to RM4,000)
  | 'postgraduate_study'                 // Item 27: Postgraduate study
  | 'toolkit_expenses'                    // Item 28: Tools/equipment (up to RM1,000)
  | 'tax_filing_expenses'                // Item 29: Tax filing fees
  | 'rental_expenses'                    // Item 30: Rental expenses (special needs equipment)
  | 'other';                              // Fallback for unrecognized items

export type ProofRequirement = 'none' | 'required' | 'conditional';

interface ProofRule {
  category: TaxReliefCategory;
  description: string;
  maxReliefAmount: number;
  proofRequired: ProofRequirement;
  reason: string;
  governmentVerifiable: boolean;
  governmentSource?: string;
}

/**
 * Official LHDN Tax Relief Proof Requirements (YA 2025)
 * Based on whether data can be verified via government databases
 */
export const TAX_RELIEF_PROOF_RULES: ProofRule[] = [
  // Item 1: Individual Relief (automatic via employment data)
  {
    category: 'individual_relief',
    description: 'Individual and dependent relatives - Basic relief RM9,000',
    maxReliefAmount: 9000,
    proofRequired: 'none',
    reason: 'Basic individual relief, automatically applied via employment income data',
    governmentVerifiable: true,
    governmentSource: 'Employer PCB data / LHDN database'
  },

  // Item 2: Parent Expenses - requires verification
  {
    category: 'parent_expenses',
    description: 'Medical/dental treatment expenses for parents and grandparents',
    maxReliefAmount: 8000,
    proofRequired: 'required',
    reason: 'Need to prove relationship and actual expenses paid for parents/grandparents',
    governmentVerifiable: false,
    governmentSource: ''
  },

  // Item 3: Medical Expenses - conditional
  {
    category: 'medical_expenses',
    description: 'Medical expenses for self, spouse, or child with medical card',
    maxReliefAmount: 10000,
    proofRequired: 'conditional',
    reason: 'Public hospital treatments verifiable via MOH. Private treatments require receipt.',
    governmentVerifiable: true,
    governmentSource: 'Kementerian Kesihatan Malaysia (MOH)'
  },

  // Item 4: Medical Education Expenses (serious diseases)
  {
    category: 'medical_education_expenses',
    description: 'Medical expenses for serious diseases - education treatment',
    maxReliefAmount: 10000,
    proofRequired: 'conditional',
    reason: 'Government hospital data verifiable. Private treatments require medical reports.',
    governmentVerifiable: true,
    governmentSource: 'MOH / LHDN verification'
  },

  // Item 5: Fertility Expenses
  {
    category: 'fertility_expenses',
    description: 'Fertility treatment expenses',
    maxReliefAmount: 10000,
    proofRequired: 'required',
    reason: 'Private medical procedure - requires official receipt from clinic/hospital',
    governmentVerifiable: false,
    governmentSource: ''
  },

  // Item 6: Vaccination
  {
    category: 'vaccination_expenses',
    description: 'Vaccination for children 0-18 years',
    maxReliefAmount: 1000,
    proofRequired: 'none',
    reason: 'Vaccination records maintained by MOH through KKM. Can be verified via MySejahtera.',
    governmentVerifiable: true,
    governmentSource: 'MySejahtera / KKM vaccine registry'
  },

  // Item 7: Education Fees
  {
    category: 'education_fees',
    description: 'Education fees for self, spouse, or child (up to RM7,000)',
    maxReliefAmount: 7000,
    proofRequired: 'conditional',
    reason: 'Government institutions verifiable via MOE. Private institutions require enrollment proof.',
    governmentVerifiable: true,
    governmentSource: 'Kementerian Pendidikan Malaysia (MOE)'
  },

  // Item 8: Education Loan Interest
  {
    category: 'education_loan',
    description: 'Interest from education loan - PTPTN or approved loan',
    maxReliefAmount: 10000,
    proofRequired: 'none',
    reason: 'PTPTN maintains loan records. Can be verified directly.',
    governmentVerifiable: true,
    governmentSource: 'PTPTN / LHDN database'
  },

  // Item 9: Life Insurance / Takaful
  {
    category: 'life_insurance',
    description: 'Life insurance premium or takaful contribution (up to RM3,000)',
    maxReliefAmount: 3000,
    proofRequired: 'none',
    reason: 'LIA Malaysia and Takaful operators maintain policy registry. LHDN can verify.',
    governmentVerifiable: true,
    governmentSource: 'LIA Malaysia / LHDN database'
  },

  // Item 10: Medical Insurance
  {
    category: 'medical_insurance',
    description: 'Medical insurance premium or health card (up to RM4,000)',
    maxReliefAmount: 4000,
    proofRequired: 'none',
    reason: 'PIAM maintains policy registry. LHDN can verify contributions directly.',
    governmentVerifiable: true,
    governmentSource: 'PIAM / LHDN database'
  },

  // Item 11: Education Insurance for Children
  {
    category: 'education_insurance',
    description: 'Education/medical insurance for children (up to RM2,000)',
    maxReliefAmount: 2000,
    proofRequired: 'none',
    reason: 'Insurance companies maintain policy registry. LHDN can verify.',
    governmentVerifiable: true,
    governmentSource: 'Insurance registry / LHDN'
  },

  // Item 12: EPF/KWSP
  {
    category: 'provident_fund',
    description: 'EPF/KWSP contributions (mandatory, no limit)',
    maxReliefAmount: 0, // Unlimited
    proofRequired: 'none',
    reason: 'KWSP maintains contribution records. LHDN can verify directly.',
    governmentVerifiable: true,
    governmentSource: 'KWSP / EPF database'
  },

  // Item 13: SOCSO/PEPS
  {
    category: 'social_security',
    description: 'SOCSO or Employment Insurance Scheme (EIS) contributions (up to RM350)',
    maxReliefAmount: 350,
    proofRequired: 'none',
    reason: 'PERKESO maintains employment and contribution records. LHDN can verify directly.',
    governmentVerifiable: true,
    governmentSource: 'PERKESO'
  },

  // Item 14: Zakat/Charity
  {
    category: 'charity_donation',
    description: 'Zakat, fitrah, or charitable donations (up to 10% of income)',
    maxReliefAmount: 0, // Up to 10% of income
    proofRequired: 'none',
    reason: 'LHDN maintains list of approved charitable organizations and zakat bodies.',
    governmentVerifiable: true,
    governmentSource: 'LHDN approved list / State Islamic Religious Council'
  },

  // Item 15: Deferred Annuity
  {
    category: 'deferred_annuity',
    description: 'Deferred annuity (up to RM3,000) - excluding EPF',
    maxReliefAmount: 3000,
    proofRequired: 'none',
    reason: 'Annuity providers maintain records. LHDN can verify contributions directly.',
    governmentVerifiable: true,
    governmentSource: 'LHDN PRS database'
  },

  // Item 16: Gateway/PRS
  {
    category: 'gateway',
    description: 'Private Retirement Scheme (PRS) / Gateway (up to RM3,000)',
    maxReliefAmount: 3000,
    proofRequired: 'none',
    reason: 'LHDN maintains PRS registry. Contributions verifiable directly.',
    governmentVerifiable: true,
    governmentSource: 'LHDN PRS database'
  },

  // Item 21: Sports Expenses
  {
    category: 'sports_expenses',
    description: 'Sports equipment - Razak card (U33) or Omar card (U34)',
    maxReliefAmount: 1000,
    proofRequired: 'conditional',
    reason: 'Sports card registration maintained by JSW. Only with Razak/Omar card qualifies.',
    governmentVerifiable: true,
    governmentSource: 'Ministry of Youth and Sports'
  },

  {
    category: 'gym_expenses',
    description: 'Gym/fitness expenses for individual',
    maxReliefAmount: 500,
    proofRequired: 'required',
    reason: 'Gym membership not automatically qualified - requires review',
    governmentVerifiable: false
  },

  // Item 20: Books and Journals
  {
    category: 'books_journals',
    description: 'Books, journals, newspapers (up to RM1,000)',
    maxReliefAmount: 1000,
    proofRequired: 'none',
    reason: 'Purchase receipts acceptable. Malaysian publishers maintain records.',
    governmentVerifiable: false,
    governmentSource: ''
  },

  // Item 19: Broadband/Internet
  {
    category: 'broadband_internet',
    description: 'Broadband internet subscription (up to RM1,000)',
    maxReliefAmount: 1000,
    proofRequired: 'none',
    reason: 'Telecommunication providers maintain subscription records. Can verify via telco data.',
    governmentVerifiable: true,
    governmentSource: 'MCMC / Telco records'
  },

  // Item 22: Handphone / Computer
  {
    category: 'handphone',
    description: 'Handphone purchase (up to RM1,000)',
    maxReliefAmount: 1000,
    proofRequired: 'conditional',
    reason: 'Only for education or work-from-home purposes - requires declaration',
    governmentVerifiable: false
  },

  {
    category: 'computer_laptop',
    description: 'Computer/laptop purchase (up to RM1,000 per device)',
    maxReliefAmount: 1000,
    proofRequired: 'conditional',
    reason: 'Only for education or work-from-home purposes - requires declaration',
    governmentVerifiable: false
  },

  // Item 23: Electricity
  {
    category: 'electricity',
    description: 'Electricity bill (up to RM2,000) - work from home',
    maxReliefAmount: 2000,
    proofRequired: 'conditional',
    reason: 'Only for work-from-home purposes - requires employer confirmation',
    governmentVerifiable: false
  },

  // Item 24: Disabled Dependent
  {
    category: 'disabled_dependent',
    description: 'Expenses for disabled child/dependent (no limit)',
    maxReliefAmount: 0,
    proofRequired: 'none',
    reason: 'JKM maintains disabled person registry. LHDN can verify directly.',
    governmentVerifiable: true,
    governmentSource: 'Jabatan Kebajikan Sosial (JKM)'
  },

  // Item 25: Disabled Self
  {
    category: 'disabled_self',
    description: 'Disabled person self expenses (RM6,000)',
    maxReliefAmount: 6000,
    proofRequired: 'none',
    reason: 'OKU card registration maintained by JKM. LHDN can verify directly.',
    governmentVerifiable: true,
    governmentSource: 'JKM / SOCSO OKU registry'
  },

  // Item 26: Career Expenses
  {
    category: 'career_expenses',
    description: 'Professional body subscription, exam fees, training (up to RM4,000)',
    maxReliefAmount: 4000,
    proofRequired: 'none',
    reason: 'Professional body records maintain membership. Exam fees verifiable via institutions.',
    governmentVerifiable: true,
    governmentSource: 'Professional body registry / MQA'
  },

  // Item 27: Postgraduate Study
  {
    category: 'postgraduate_study',
    description: 'Postgraduate degree or professional qualification',
    maxReliefAmount: 7000,
    proofRequired: 'conditional',
    reason: 'MOE maintains postgraduate enrollment records. Private institutions may need proof.',
    governmentVerifiable: true,
    governmentSource: 'MOE / University records'
  },

  // Item 28: Toolkits
  {
    category: 'toolkit_expenses',
    description: 'Tools and equipment for work (up to RM1,000)',
    maxReliefAmount: 1000,
    proofRequired: 'required',
    reason: 'Require proof of work-related purpose - receipt needed',
    governmentVerifiable: false
  },

  // Item 29: Tax Filing
  {
    category: 'tax_filing_expenses',
    description: 'Tax agent/filing fees (up to RM1,000)',
    maxReliefAmount: 1000,
    proofRequired: 'none',
    reason: 'Tax agents registered with LHDN. Fee verifiable via receipt.',
    governmentVerifiable: true,
    governmentSource: 'LHDN tax agent registry'
  },

  // Item 30: Rental for Special Needs
  {
    category: 'rental_expenses',
    description: 'Special needs equipment rental',
    maxReliefAmount: 5000,
    proofRequired: 'required',
    reason: 'Requires medical report and prescription to verify special needs requirement',
    governmentVerifiable: false
  },

  // Fallback
  {
    category: 'other',
    description: 'Other tax relief items not listed above',
    maxReliefAmount: 0,
    proofRequired: 'required',
    reason: 'Cannot automatically verify - requires documentation',
    governmentVerifiable: false
  }
];

/**
 * Keywords mapping for tax relief identification
 * Based on official LHDN category descriptions
 */
export const TAX_RELIEF_KEYWORDS: Record<TaxReliefCategory, string[]> = {
  individual_relief: ['individual', 'basic relief', 'diri sendiri', 'mandatory'],

  parent_expenses: [
    'parent medical', 'parents medical', 'father treatment', 'mother treatment',
    'grandparent medical', 'parents dental', 'medical expenses parents'
  ],

  medical_expenses: [
    'hospital', 'clinic', 'medical', 'treatment', 'surgery', 'dental',
    'doctor', 'medicine', 'prescription', 'ward', 'patient',
    'rawatan', 'klinik', 'hospital', 'pembedahan', 'doktor'
  ],

  medical_education_expenses: [
    'cancer treatment', 'chemotherapy', 'dialysis', 'serious illness education',
    'kidney dialysis', 'heart disease education', 'leukemia education'
  ],

  fertility_expenses: [
    'ivf', 'fertility', 'ivf treatment', 'surrogacy', 'infertility'
  ],

  vaccination_expenses: [
    'vaccination', 'vaccine', 'immunization', 'child vaccine', 'vaccine 0-18'
  ],

  education_fees: [
    'tuition', 'university', 'college', 'school fees', 'degree', 'diploma',
    'foundation', 'pre-u', 'matriculation', 'examination fees',
    'kursus', 'pengajian', 'tuition fee', 'tuition fees'
  ],

  education_loan: [
    'ptptn interest', 'education loan interest', 'study loan interest'
  ],

  life_insurance: [
    'life insurance', 'takaful hayat', 'insurance premium', 'insurans hayat',
    'endowment', 'policy'
  ],

  medical_insurance: [
    'medical insurance', 'health insurance', 'medical card', 'hospital insurance',
    'takaful kesehatan', 'insurans perubatan', 'health card'
  ],

  education_insurance: [
    'education insurance', 'child insurance', 'insurance for child',
    'insurance education'
  ],

  provident_fund: [
    'epf', 'kwsp', 'kwsp contribution', 'epf contribution', 'caruman kwsp', 'sspn', 'sspn contribution', 'ssn'
  ],

  social_security: [
    'socso', 'perkeso', 'eis', 'employment insurance', 'keselamatan sosial'
  ],

  charity_donation: [
    'zakat', 'charity', 'donation', 'sumbangan', 'derma', 'zakat fitrah',
    'sedekah', 'charitable'
  ],

  deferred_annuity: [
    'annuity', 'deferred annuity', 'annuity contribution'
  ],

  gateway: [
    'gateway', 'prs', 'private retirement', 'retirement scheme'
  ],

  real_property_gains: [
    'property gain', 'real property', 'land sale'
  ],

  home_loan: [
    'home loan interest', 'mortgage interest', 'housing loan'
  ],

  broadband_internet: [
    'broadband', 'internet', 'fiber', 'unifi', 'maxis fiber', 'streamyx',
    'broadband subscription', 'wifi subscription'
  ],

  books_journals: [
    'book', 'books', 'journal', 'newspaper', 'buku', 'majalah',
    'ebook', 'e-book', 'online subscription'
  ],

  sports_expenses: [
    'sports equipment', 'razak card', 'omar card', 'sports card',
    'sukan', ' peralatan sukan', 'razak', 'omar'
  ],

  gym_expenses: [
    'gym', 'fitness', 'gym membership', 'kebugaran', 'fitness membership'
  ],

  handphone: [
    'handphone', 'smartphone', 'mobile phone', 'hp', 'phone purchase'
  ],

  computer_laptop: [
    'computer', 'laptop', 'pc', 'tablet', 'laptop purchase', 'komputer'
  ],

  electricity: [
    'electricity bill', 'elektrik', 'tenaga elektrik', 'bill electricity'
  ],

  disabled_dependent: [
    'disabled child', 'oku dependent', 'oku expenses', 'cacat'
  ],

  disabled_self: [
    'oku', 'disabled person', 'oku card', 'disabled self'
  ],

  career_expenses: [
    'professional body', 'subscription', 'exam fee', 'mqa', 'professional exam',
    'training', 'seminar', 'conference'
  ],

  postgraduate_study: [
    'postgraduate', 'masters', 'phd', 'doctoral', 'master degree',
    'postgraduate degree', 'professional qualification'
  ],

  toolkit_expenses: [
    'tools', 'equipment', 'toolkit', 'alat'
  ],

  tax_filing_expenses: [
    'tax agent', 'tax filing', 'e-filing', 'tax return fee'
  ],

  rental_expenses: [
    'rental equipment', 'special needs rental', 'alat bantuan'
  ],

  other: []
};

/**
 * Keywords for identifying NON-TAX RELIEF items
 * Common expenses that do NOT qualify for tax relief
 */
export const NON_TAX_RELIEF_KEYWORDS = [
  // Food & Dining
  'food', 'meal', 'restaurant', 'cafe', 'coffee', 'tea', 'lunch', 'dinner',
  'breakfast', 'supper', 'makan', 'makanan', 'restoran', 'kafe',
  'nasi', 'rice', 'chicken rice', 'kfc', 'mcdonald', 'pizza',

  // Transportation
  'taxi', 'grab', 'bus', 'train', 'lrt', 'mrt', 'transport',
  'parking', 'tol', 'fuel', 'petrol', 'gas', 'transportation',

  // Clothing
  'clothes', 'clothing', 'shirt', 'pants', 'dress', 'baju', 'pakaian',

  // Entertainment
  'movie', 'netflix', 'spotify', 'entertainment', 'concert', 'game',
  'online game', 'subscription', 'hiburan',

  // Daily supplies
  'grocery', 'supermarket', 'convenience store', 'milk', 'diaper',

  // Personal care
  'haircut', 'salon', 'spa', 'beauty',

  // General shopping
  'shopping', 'mall', 'pasar', 'buy', 'purchase',

  // Pet
  'pet', 'dog food', 'cat food'
];

/**
 * Keywords for identifying INCOME items
 */
export const INCOME_KEYWORDS = [
  'salary', 'gaji', 'bonus', 'commission', 'dividend', 'interest',
  'rental income', 'freelance', 'business income', '創業', 'dividen',
  'pendapatan', 'kerja', 'upah', 'bayaran', 'payment received',
  'transfer from', 'received', 'incoming'
];

// ============================================================================
// DATA STRUCTURES
// ============================================================================

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  counterpartyName: string;
  counterpartyType: 'individual' | 'business';
  description: string;
  source: 'bank' | 'ewallet' | 'einvoice' | 'manual';
}

export interface EInvoice {
  id: string;
  invoiceNumber: string;
  date: string;
  sellerName: string;
  buyerName: string;
  totalAmount: number;
  items: EInvoiceItem[];
}

export interface EInvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  taxType?: string;
  taxRate?: number;
  category?: string;
}

export interface CategorizedTransaction {
  transaction: Transaction;
  einvoice?: EInvoice;
  transactionType: TransactionType;
  incomeCategory: IncomeCategory;
  nonIncomeSubCategory?: NonIncomeSubCategory;
  taxReliefCategory?: TaxReliefCategory;
  proofRequired: ProofRequirement;
  proofReason?: string;
  governmentVerifiable?: boolean;
  maxReliefAmount?: number;
  confidence: number;
  requiresReview: boolean;
  reviewReason?: string;
  keywordsMatched?: string[];
}

// ============================================================================
// CORE ALGORITHM FUNCTIONS
// ============================================================================

/**
 * Step 1: Classify transaction type
 */
export function classifyTransactionType(
  counterpartyType: 'individual' | 'business'
): TransactionType {
  return counterpartyType === 'business'
    ? 'individual_to_business'
    : 'individual_to_individual';
}

/**
 * Step 2: Classify as income or non-income
 */
export function classifyIncomeCategory(description: string): IncomeCategory {
  const lowerDesc = description.toLowerCase();

  for (const keyword of INCOME_KEYWORDS) {
    if (lowerDesc.includes(keyword.toLowerCase())) {
      return 'income';
    }
  }
  return 'non_income';
}

/**
 * Step 3: Classify non-income as tax relief or non-tax relief
 */
export function classifyNonIncomeSubCategory(
  description: string
): NonIncomeSubCategory {
  const lowerDesc = description.toLowerCase();

  // Check for non-tax relief first
  for (const keyword of NON_TAX_RELIEF_KEYWORDS) {
    if (lowerDesc.includes(keyword.toLowerCase())) {
      return 'non_tax_relief';
    }
  }

  // Check if matches any tax relief category
  const matchedCategory = matchTaxReliefCategory(description);

  if (matchedCategory && matchedCategory !== 'other') {
    return 'tax_relief';
  }

  return 'non_tax_relief';
}

/**
 * Step 4: Match description to tax relief category
 */
export function matchTaxReliefCategory(description: string): TaxReliefCategory | null {
  const lowerDesc = description.toLowerCase();
  const words = lowerDesc.split(/\s+/);

  let bestMatch: TaxReliefCategory | null = null;
  let highestScore = 0;

  for (const [category, keywords] of Object.entries(TAX_RELIEF_KEYWORDS)) {
    if (category === 'other') continue;

    let matchCount = 0;
    const matchedKeywords: string[] = [];

    for (const keyword of keywords) {
      if (lowerDesc.includes(keyword.toLowerCase())) {
        matchCount++;
        matchedKeywords.push(keyword);
      }
    }

    // Score based on matches, prioritizing longer keyword matches
    if (matchCount > 0) {
      const score = matchCount * (matchedKeywords.length > 0 ? matchedKeywords[0].length : 0);
      if (score > highestScore) {
        highestScore = score;
        bestMatch = category as TaxReliefCategory;
      }
    }
  }

  return highestScore > 0 ? bestMatch : null;
}

/**
 * Step 5: Get proof requirement for a category
 */
export function getProofRule(category: TaxReliefCategory): ProofRule {
  const rule = TAX_RELIEF_PROOF_RULES.find(r => r.category === category);
  return rule || {
    category,
    description: 'Unknown category',
    maxReliefAmount: 0,
    proofRequired: 'required',
    reason: 'Category not recognized - requires manual review',
    governmentVerifiable: false
  };
}

/**
 * Step 6: Determine if transaction needs review
 */
export function needsReview(
  category: TaxReliefCategory,
  description: string,
  proofRequired: ProofRequirement,
  proofRule: ProofRule
): { needsReview: boolean; reason?: string } {
  // If proof is required, flag for review
  if (proofRequired === 'required') {
    return {
      needsReview: true,
      reason: `Required: ${proofRule.reason}`
    };
  }

  // If conditional, check description context
  if (proofRequired === 'conditional') {
    const lowerDesc = description.toLowerCase();

    // Education - check for private institution markers
    if (category === 'education_fees' || category === 'postgraduate_study') {
      const privateMarkers = ['private', 'international', 'not government', 'private university'];
      for (const marker of privateMarkers) {
        if (lowerDesc.includes(marker)) {
          return {
            needsReview: true,
            reason: `Private institution detected - ${proofRule.reason}`
          };
        }
      }
    }

    // Medical - check if hospital name indicates private
    if (category === 'medical_expenses') {
      const privateMarkers = ['private hospital', 'sunway', 'pantai', 'gleneagles', 'mount elizabeth'];
      for (const marker of privateMarkers) {
        if (lowerDesc.includes(marker)) {
          return {
            needsReview: true,
            reason: `Private hospital - ${proofRule.reason}`
          };
        }
      }
    }

    // Handphone/Computer - check for education context
    if (category === 'handphone' || category === 'computer_laptop') {
      const eduMarkers = ['student', 'university', 'college', 'school'];
      const hasEduContext = eduMarkers.some(marker => lowerDesc.includes(marker));

      if (!hasEduContext) {
        return {
          needsReview: true,
          reason: 'Education/work context not clear - may not qualify'
        };
      }
    }

    // Sports expenses - check for sports card
    if (category === 'sports_expenses') {
      const cardMarkers = ['razak', 'omar', 'sports card', 'u33', 'u34'];
      const hasSportsCard = cardMarkers.some(marker => lowerDesc.includes(marker));

      if (!hasSportsCard) {
        return {
          needsReview: true,
          reason: 'Razak/Omar sports card not mentioned - may not qualify'
        };
      }
    }
  }

  return { needsReview: false };
}

/**
 * Step 7: Calculate confidence score
 */
export function calculateConfidence(
  category: TaxReliefCategory,
  description: string,
  proofRequired: ProofRequirement
): number {
  const lowerDesc = description.toLowerCase();
  const keywords = TAX_RELIEF_KEYWORDS[category] || [];

  if (keywords.length === 0) return 0.3;

  let matches = 0;
  let totalWeight = 0;

  for (const keyword of keywords) {
    const keywordWeight = keyword.length;
    totalWeight += keywordWeight;

    if (lowerDesc.includes(keyword.toLowerCase())) {
      matches += keywordWeight;
    }
  }

  let baseScore = totalWeight > 0 ? matches / totalWeight : 0;

  // Reduce confidence if proof is required
  if (proofRequired === 'required') {
    baseScore *= 0.7;
  } else if (proofRequired === 'conditional') {
    baseScore *= 0.85;
  }

  return Math.min(Math.max(baseScore, 0.1), 0.95);
}

/**
 * Main categorization function
 */
export function categorizeTransaction(
  transaction: Transaction,
  einvoice?: EInvoice
): CategorizedTransaction {
  // Step 1: Transaction type
  const transactionType = classifyTransactionType(transaction.counterpartyType);

  // Skip i2i transactions entirely
  if (transactionType === 'individual_to_individual') {
    return {
      transaction,
      einvoice,
      transactionType,
      incomeCategory: 'non_income',
      proofRequired: 'none',
      confidence: 1.0,
      requiresReview: false
    };
  }

  // Get description from transaction or e-invoice
  const itemDescriptions = einvoice?.items.map(i => i.description).join(' ') || '';
  const fullDescription = transaction.description + ' ' + itemDescriptions;

  // Step 2: Income vs Non-Income
  const incomeCategory = classifyIncomeCategory(fullDescription);

  // Initialize result
  const result: CategorizedTransaction = {
    transaction,
    einvoice,
    transactionType,
    incomeCategory,
    proofRequired: 'none',
    confidence: 1.0,
    requiresReview: false
  };

  // Step 3: For non-income, classify further
  if (incomeCategory === 'non_income') {
    const nonIncomeSubCategory = classifyNonIncomeSubCategory(fullDescription);
    result.nonIncomeSubCategory = nonIncomeSubCategory;

    if (nonIncomeSubCategory === 'tax_relief') {
      const taxReliefCategory = matchTaxReliefCategory(fullDescription) || 'other';
      result.taxReliefCategory = taxReliefCategory;

      const proofRule = getProofRule(taxReliefCategory);
      result.proofRequired = proofRule.proofRequired;
      result.proofReason = proofRule.reason;
      result.governmentVerifiable = proofRule.governmentVerifiable;
      result.maxReliefAmount = proofRule.maxReliefAmount;

      // Step 4: Check if needs review
      const reviewCheck = needsReview(
        taxReliefCategory,
        fullDescription,
        proofRule.proofRequired,
        proofRule
      );
      result.requiresReview = reviewCheck.needsReview;
      result.reviewReason = reviewCheck.reason;

      // Step 5: Calculate confidence
      result.confidence = calculateConfidence(
        taxReliefCategory,
        fullDescription,
        proofRule.proofRequired
      );
    }
  }

  return result;
}

/**
 * Process multiple transactions
 */
export function processTransactions(
  transactions: Transaction[],
  einvoices: Map<string, EInvoice> = new Map()
): CategorizedTransaction[] {
  return transactions.map(t => {
    const einvoice = einvoices.get(t.id);
    return categorizeTransaction(t, einvoice);
  });
}

/**
 * Generate summary report
 */
export function generateTaxReliefSummary(
  categorized: CategorizedTransaction[]
): {
  total: number;
  individualToBusiness: number;
  income: number;
  nonIncome: { taxRelief: number; nonTaxRelief: number; unclassified: number };
  taxReliefByCategory: Record<TaxReliefCategory, number>;
  governmentVerifiable: number;
  requiresProof: number;
  requiresReview: number;
  totalPotentialRelief: number;
} {
  const summary = {
    total: categorized.length,
    individualToBusiness: 0,
    income: 0,
    nonIncome: { taxRelief: 0, nonTaxRelief: 0, unclassified: 0 },
    taxReliefByCategory: {} as Record<TaxReliefCategory, number>,
    governmentVerifiable: 0,
    requiresProof: 0,
    requiresReview: 0,
    totalPotentialRelief: 0
  };

  for (const cat of categorized) {
    if (cat.transactionType === 'individual_to_business') {
      summary.individualToBusiness++;
    }

    if (cat.incomeCategory === 'income') {
      summary.income++;
    } else if (cat.nonIncomeSubCategory === 'tax_relief') {
      summary.nonIncome.taxRelief++;
    } else if (cat.nonIncomeSubCategory === 'non_tax_relief') {
      summary.nonIncome.nonTaxRelief++;
    } else {
      summary.nonIncome.unclassified++;
    }

    if (cat.taxReliefCategory) {
      summary.taxReliefByCategory[cat.taxReliefCategory] =
        (summary.taxReliefByCategory[cat.taxReliefCategory] || 0) + 1;

      if (cat.maxReliefAmount && cat.maxReliefAmount > 0) {
        summary.totalPotentialRelief += cat.maxReliefAmount;
      }
    }

    if (cat.governmentVerifiable) {
      summary.governmentVerifiable++;
    }

    if (cat.proofRequired === 'required') {
      summary.requiresProof++;
    }

    if (cat.requiresReview) {
      summary.requiresReview++;
    }
  }

  return summary;
}

/**
 * Get review queue for items needing manual review
 */
export function getReviewQueue(
  categorized: CategorizedTransaction[]
): CategorizedTransaction[] {
  return categorized.filter(c => c.requiresReview);
}

/**
 * Export category metadata
 */
export function getCategoryInfo(category: TaxReliefCategory): ProofRule {
  return getProofRule(category);
}