import { NextRequest, NextResponse } from 'next/server';
import { categorizeTransaction, Transaction } from '@/lib/tax-relief-algorithm';
import { getUserReliefSummary, getUserRecords } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Try to get existing relief summary from database
    const reliefSummaries = await getUserReliefSummary(userId);

    if (reliefSummaries) {
      // Also fetch and categorize records to count pending items
      const records = await getUserRecords(userId);
      let pendingCount = 0;

      if (records.length > 0) {
        const transactions: Transaction[] = records.map((record: any) => ({
          id: String(record.id),
          date: String(record.transaction_date),
          amount: Number(record.amount),
          counterpartyName: record.institution || 'Unknown',
          counterpartyType: record.direction === 'INFLOW' ? 'individual' as const : 'business' as const,
          description: record.description || record.institution || '',
          source: 'bank' as const,
        }));

        for (const transaction of transactions) {
          const result = categorizeTransaction(transaction);
          if (result.requiresReview) {
            pendingCount++;
          }
        }
      }

      // Transform database records to frontend format
      const totalClaimed = reliefSummaries.reduce((sum: number, r: any) => sum + Number(r.claimed_amount || 0), 0);
      const totalMax = reliefSummaries.reduce((sum: number, r: any) => sum + Number(r.max_amount || 0), 0);
      const totalRemaining = reliefSummaries.reduce((sum: number, r: any) => sum + Number(r.remaining_quota || 0), 0);
      const totalPotential = totalMax - totalClaimed;

      // Map database categories to frontend format
      const categoryMap: Record<string, { key: string; name: string }> = {
        SSPN: { key: 'sspn', name: 'SSPN' },
        MEDICAL_SELF: { key: 'medical', name: 'Medical' },
        SPORTS: { key: 'sports', name: 'Sports' },
        EDUCATION_SELF: { key: 'education', name: 'Education' },
        INSURANCE_LIFE: { key: 'insurance', name: 'Life Insurance' },
        INSURANCE_MEDICAL: { key: 'insurance', name: 'Health Insurance' },
        EPF: { key: 'insurance', name: 'EPF' },
      };

      const categories = reliefSummaries.map((r: any) => {
        const mapped = categoryMap[r.relief_code] || { key: 'lifestyle', name: r.relief_code };
        return {
          key: mapped.key,
          name: mapped.name,
          amount: Number(r.claimed_amount || 0),
          limit: Number(r.max_amount || 0),
          status: Number(r.remaining_quota) <= 0 ? 'filled' :
                  Number(r.remaining_quota) < Number(r.max_amount) * 0.2 ? 'almost_full' : 'available',
        };
      });

      return NextResponse.json({
        success: true,
        data: {
          totalRelief: totalClaimed,
          potential: totalPotential,
          remaining: totalRemaining,
          pendingItems: pendingCount,
          categories,
          attentionItems: pendingCount > 0 ? [{ title: "Items need review", category: "review", amount: `${pendingCount} items`, issue: "Confirm eligibility", badge: "Review" }] : [],
        },
        source: 'database',
      });
    }

    // If no summary, compute from records
    const records = await getUserRecords(userId);

    if (records.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          user_id: userId,
          assessment_year: new Date().getFullYear(),
          categories: [],
          total_relief_amount: 0,
          transaction_count: 0,
        },
        source: 'empty',
      });
    }

    // Transform records to transactions
    const transactions: Transaction[] = records.map((record: any) => ({
      id: String(record.id),
      date: String(record.transaction_date),
      amount: Number(record.amount),
      counterpartyName: record.institution || 'Unknown',
      counterpartyType: record.direction === 'INFLOW' ? 'individual' as const : 'business' as const,
      description: record.description || record.institution || '',
      source: 'bank' as const,
    }));

    // Categorize each transaction
    let totalRelief = 0;
    let pendingCount = 0;
    const categoryTotals: Record<string, number> = {};

    for (const transaction of transactions) {
      const result = categorizeTransaction(transaction);

      if (result.taxReliefCategory && result.incomeCategory === 'non_income') {
        const amount = Number(transaction.amount);
        totalRelief += amount;
        categoryTotals[result.taxReliefCategory] = (categoryTotals[result.taxReliefCategory] || 0) + amount;

        if (result.requiresReview) {
          pendingCount++;
        }
      }
    }

    // Build summary response
    const summary = {
      user_id: userId,
      assessment_year: new Date().getFullYear(),
      categories: Object.entries(categoryTotals).map(([code, amount]) => ({
        code,
        amount,
      })),
      total_relief_amount: totalRelief,
      pendingItems: pendingCount,
      transaction_count: transactions.length,
    };

    return NextResponse.json({
      success: true,
      data: summary,
      source: 'computed',
    });
  } catch (error) {
    console.error('Error fetching relief summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch relief summary' },
      { status: 500 }
    );
  }
}