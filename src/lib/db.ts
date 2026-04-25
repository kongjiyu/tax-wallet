import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || process.env.HOST || 'localhost',
  user: process.env.DB_USER || process.env.USER || 'root',
  password: process.env.DB_PASSWORD || process.env.PASSWORD || 'kongjiyu',
  database: process.env.DB_NAME || process.env.DATABASE || 'taxwallet',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;

export interface FinancialRecord {
  id: string;
  user_id: string;
  transaction_date: Date;
  amount: number;
  direction: string;
  institution: string;
  description?: string;
  status?: string;
  category?: string;
  created_at?: Date;
  updated_at?: Date;
}

export async function getUserRecords(userId: string): Promise<FinancialRecord[]> {
  const [rows] = await pool.execute<mysql.RowDataPacket[]>(
    'SELECT * FROM financial_records WHERE user_id = ? ORDER BY transaction_date DESC',
    [userId]
  );
  return rows as FinancialRecord[];
}

export async function getUserReliefSummary(userId: string) {
  const [rows] = await pool.execute<mysql.RowDataPacket[]>(
    `SELECT * FROM relief_summary WHERE user_id = ?`,
    [userId]
  );
  return rows.length > 0 ? rows : null;
}

export async function updateRecordCategory(recordId: string, category: string): Promise<void> {
  await pool.execute(
    'UPDATE financial_records SET category = ? WHERE id = ?',
    [category, recordId]
  );
}

export async function getRecordInvoice(recordId: string) {
  const [invoices] = await pool.execute<mysql.RowDataPacket[]>(
    'SELECT * FROM invoices WHERE financial_record_id = ?',
    [recordId]
  );

  if (invoices.length === 0) return null;

  const invoice = invoices[0];

  const [items] = await pool.execute<mysql.RowDataPacket[]>(
    'SELECT * FROM invoice_line_items WHERE invoice_id = ?',
    [invoice.id]
  );

  return {
    ...invoice,
    items: items
  };
}

export async function getRecordClaimedAmount(recordId: string) {
  const [rows] = await pool.execute<mysql.RowDataPacket[]>(
    'SELECT eligible_amount FROM categorized_items WHERE line_item_id = ?',
    [recordId]
  );
  return rows.length > 0 ? Number(rows[0].eligible_amount) : null;
}

export async function updateRecordStatus(recordId: string, status: string, category?: string): Promise<void> {
  if (category) {
    await pool.execute(
      'UPDATE financial_records SET status = ?, category = ? WHERE id = ?',
      [status, category, recordId]
    );
  } else {
    await pool.execute(
      'UPDATE financial_records SET status = ? WHERE id = ?',
      [status, recordId]
    );
  }
}

export async function saveCategorizedItem(
  userId: string,
  recordId: string,
  reliefCode: string,
  amount: number,
  assessmentYear: string = 'YA2025'
): Promise<void> {
  // Use recordId as a reference since we might not have a specific line_item_id for direct transactions
  await pool.execute(
    `INSERT INTO categorized_items (id, user_id, line_item_id, relief_code, eligible_amount, confidence, status, assessment_year)
     VALUES (UUID(), ?, ?, ?, ?, 1.00, 'VERIFIED', ?)
     ON DUPLICATE KEY UPDATE eligible_amount = ?`,
    [userId, recordId, reliefCode, amount, assessmentYear, amount]
  );
}

export async function addReliefClaim(
  userId: string,
  assessmentYear: string,
  reliefCode: string,
  amount: number
): Promise<void> {
  // 1. Get the current summary and the official category limit
  const [summaries] = await pool.execute<mysql.RowDataPacket[]>(
    'SELECT * FROM relief_summary WHERE user_id = ? AND assessment_year = ? AND relief_code = ?',
    [userId, assessmentYear, reliefCode]
  );

  const [categories] = await pool.execute<mysql.RowDataPacket[]>(
    'SELECT max_amount FROM tax_relief_categories WHERE assessment_year = ? AND relief_code = ?',
    [assessmentYear, reliefCode]
  );

  const categoryLimit = categories.length > 0 ? Number(categories[0].max_amount) : 0;

  if (summaries.length > 0) {
    const current = summaries[0];
    const currentClaimed = Number(current.claimed_amount);

    // Calculate how much more can be claimed for this category
    const spaceLeftInCategory = Math.max(0, categoryLimit - currentClaimed);
    const actualClaimableAmount = Math.min(amount, spaceLeftInCategory);

    // Update existing claim
    await pool.execute(
      `UPDATE relief_summary
       SET claimed_amount = claimed_amount + ?,
           remaining_quota = GREATEST(0, remaining_quota - ?),
           item_count = item_count + 1
       WHERE user_id = ? AND assessment_year = ? AND relief_code = ?`,
      [actualClaimableAmount, actualClaimableAmount, userId, assessmentYear, reliefCode]
    );
  } else {
    // Insert new claim
    const actualClaimableAmount = Math.min(amount, categoryLimit);

    await pool.execute(
      `INSERT INTO relief_summary (id, user_id, assessment_year, relief_code, max_amount, claimed_amount, remaining_quota, item_count)
       VALUES (UUID(), ?, ?, ?, ?, ?, ?, 1)`,
      [userId, assessmentYear, reliefCode, categoryLimit, actualClaimableAmount, Math.max(0, categoryLimit - actualClaimableAmount)]
    );
  }
}