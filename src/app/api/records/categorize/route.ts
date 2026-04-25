import { NextRequest, NextResponse } from 'next/server';
import { categorizeTransaction, CategorizedTransaction, Transaction } from '@/lib/tax-relief-algorithm';
import { getUserRecords, updateRecordCategory, getRecordInvoice, getRecordClaimedAmount } from '@/lib/db';

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

      for (let i = 0; i < records.length; i++) {
        const record = records[i];
        
        // Fetch invoice and claimed amount if exists
        const invoice = await getRecordInvoice(record.id) as any;
        const claimedAmount = await getRecordClaimedAmount(record.id);

        const transaction: Transaction = {
          id: String(record.id),
          date: String(record.transaction_date),
          amount: Number(record.amount),
          counterpartyName: record.institution || 'Unknown',
          counterpartyType: record.direction === 'INFLOW' ? 'individual' : 'business' as const,
          description: record.description || record.institution || '',
          source: 'bank' as const,
        };

        const result: any = categorizeTransaction(transaction);
        // Include database status and invoice info
        result.dbStatus = record.status || 'pending';
        result.claimedAmount = claimedAmount;
        
        // OVERRIDE with database category if present (proves manual confirmation)
        if (record.category && record.category !== 'other') {
          result.taxReliefCategory = record.category as any;
        }
        
        if (invoice) {
          result.einvoice = {
            id: invoice.id,
            invoiceNumber: invoice.invoice_number,
            date: String(invoice.issue_date),
            sellerName: invoice.supplier_name,
            buyerName: 'Ji Yu',
            totalAmount: Number(invoice.total_amount),
            items: invoice.items.map((item: any) => ({
              description: item.description,
              quantity: item.quantity,
              unitPrice: Number(item.unit_price),
              totalPrice: Number(item.total_amount),
              category: item.classification_code === 'TECH' ? 'lifestyle' : 'other'
            }))
          };
        }

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