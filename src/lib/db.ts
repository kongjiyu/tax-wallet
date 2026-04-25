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