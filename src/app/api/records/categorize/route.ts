import { NextRequest, NextResponse } from 'next/server';
import { categorizeTransaction, CategorizedTransaction, Transaction } from '@/lib/tax-relief-algorithm';
import { getUserRecords, updateRecordCategory } from '@/lib/db';

interface CategorizeRequestBody {
  userId?: string;
  transactions?: Transaction[];
  recordIds?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body: CategorizeRequestBody = await request.json();

    const categorizedResults: CategorizedTransaction[] = [];

    if (body.transactions && body.transactions.length > 0) {
      // Process provided transactions
      for (const transaction of body.transactions) {
        const result = categorizeTransaction(transaction);
        categorizedResults.push(result);
      }
    } else if (body.userId) {
      // Fetch from database and process
      const records = await getUserRecords(body.userId);

      const transactions: Transaction[] = records.map((record: any) => ({
        id: String(record.id),
        date: String(record.transaction_date),
        amount: Number(record.amount),
        counterpartyName: record.institution || 'Unknown',
        counterpartyType: record.direction === 'INFLOW' ? 'individual' : 'business' as const,
        description: record.description || record.institution || '',
        source: 'bank' as const,
      }));

      for (const transaction of transactions) {
        const result = categorizeTransaction(transaction);
        categorizedResults.push(result);

        if (body.recordIds && body.recordIds.includes(transaction.id)) {
          await updateRecordCategory(transaction.id, result.taxReliefCategory || 'other');
        }
      }
    } else {
      return NextResponse.json(
        { error: 'Either userId or transactions must be provided' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: categorizedResults,
      count: categorizedResults.length,
    });
  } catch (error) {
    console.error('Error categorizing transactions:', error);
    return NextResponse.json(
      { error: 'Failed to categorize transactions' },
      { status: 500 }
    );
  }
}