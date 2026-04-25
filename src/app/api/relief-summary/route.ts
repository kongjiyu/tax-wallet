import { NextRequest, NextResponse } from 'next/server';
import { categorizeTransaction, Transaction } from '@/lib/tax-relief-algorithm';
import { getUserReliefSummary, getUserRecords, getRecordInvoice } from '@/lib/db';

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
    const records = await getUserRecords(userId);

    // Identify attention items based on status
    const attentionItems = [];
    
    for (const r of records) {
      if (r.status === 'pending_proof' || r.status === 'pending_confirmation') {
        const invoice = await getRecordInvoice(r.id) as any;
        
        const item: any = {
          id: r.id,
          title: r.description || r.institution,
          merchant: r.institution || 'Unknown',
          category: r.description?.toLowerCase().includes('insurance') ? 'insurance' :
                    r.description?.toLowerCase().includes('iphone') ? 'lifestyle' :
                    r.description?.toLowerCase().includes('sspn') ? 'sspn' : 'lifestyle',
          amount: `RM ${Number(r.amount).toLocaleString()}`,
          rawAmount: Number(r.amount),
          issue: r.status === 'pending_proof' ? 'Statement missing' : 'Confirm eligibility',
          badge: r.status === 'pending_proof' ? 'Upload' : 'Confirm',
          status: r.status,
          date: r.transaction_date,
          source: r.direction === 'OUTFLOW' ? 'bank' : 'income',
        };

        if (invoice) {
          item.einvoice = {
            id: invoice.id,
            invoiceNumber: invoice.invoice_number,
            date: String(invoice.issue_date),
            sellerName: invoice.supplier_name,
            buyerName: 'Ji Yu',
            totalAmount: Number(invoice.total_amount),
            items: invoice.items.map((ii: any) => ({
              description: ii.description,
              quantity: ii.quantity,
              unitPrice: Number(ii.unit_price),
              totalPrice: Number(ii.total_amount),
              category: ii.classification_code === 'TECH' ? 'lifestyle' : 'other'
            }))
          };
        }

        attentionItems.push(item);
      }
    }

    if (reliefSummaries) {
      // 1. Map current status for calculations
      const quotaMap: Record<string, number> = {};
      reliefSummaries.forEach((r: any) => {
        quotaMap[r.relief_code] = Number(r.remaining_quota || 0);
      });

      // 2. Calculate actual potential gain from pending items
      let totalPotential = 0;
      attentionItems.forEach((item: any) => {
        // Map frontend category string to database relief codes
        const possibleReliefCodes = [];
        if (item.category === 'lifestyle') possibleReliefCodes.push('LIFESTYLE');
        if (item.category === 'insurance') possibleReliefCodes.push('INSURANCE_LIFE', 'INSURANCE_MEDICAL');
        if (item.category === 'sspn') possibleReliefCodes.push('SSPN');
        if (item.category === 'education') possibleReliefCodes.push('EDUCATION_SELF');

        // Check space left in these categories
        let maxSpace = 0;
        possibleReliefCodes.forEach(code => {
          maxSpace = Math.max(maxSpace, quotaMap[code] || 0);
        });

        // Gain is limited by transaction amount OR quota space
        const gain = Math.min(item.rawAmount, maxSpace);
        totalPotential += gain;
      });

      const totalClaimed = reliefSummaries.reduce((sum: number, r: any) => sum + Number(r.claimed_amount || 0), 0);
      const totalRemaining = reliefSummaries.reduce((sum: number, r: any) => sum + Number(r.remaining_quota || 0), 0);

      // Map database categories to frontend format
      const categoryMap: Record<string, { key: string; name: string }> = {
        SSPN: { key: 'sspn', name: 'SSPN' },
        MEDICAL_SELF: { key: 'medical', name: 'Medical' },
        SPORTS: { key: 'sports', name: 'Sports' },
        EDUCATION_SELF: { key: 'education', name: 'Education' },
        INSURANCE_LIFE: { key: 'insurance_life', name: 'Life Insurance' },
        INSURANCE_MEDICAL: { key: 'insurance_medical', name: 'Health Insurance' },
        EPF: { key: 'epf', name: 'EPF' },
        LIFESTYLE: { key: 'lifestyle', name: 'Lifestyle' }
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
          pendingItems: attentionItems.length,
          categories,
          attentionItems: attentionItems,
        },
        source: 'database',
      });
    }

    // Fallback logic (if no relief_summary records)
    return NextResponse.json({
      success: true,
      data: {
        totalRelief: 0,
        potential: 0,
        remaining: 0,
        pendingItems: attentionItems.length,
        categories: [],
        attentionItems: attentionItems,
      },
      source: 'database-fallback',
    });

  } catch (error) {
    console.error('Error fetching relief summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch relief summary' },
      { status: 500 }
    );
  }
}