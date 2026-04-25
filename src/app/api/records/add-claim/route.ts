import { NextRequest, NextResponse } from 'next/server';
import { addReliefClaim, updateRecordStatus, saveCategorizedItem } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, recordId, assessmentYear, reliefCode, amount, category } = body;

    if (!userId || !recordId || !reliefCode || amount === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, recordId, reliefCode, amount' },
        { status: 400 }
      );
    }

    // Update record status to claimed and persist the category
    await updateRecordStatus(recordId, 'claimed', category);

    // Save categorized item for drill-down details
    await saveCategorizedItem(
      userId,
      recordId,
      reliefCode,
      amount,
      assessmentYear || 'YA2025'
    );

    // Add to relief summary
    await addReliefClaim(
      userId,
      assessmentYear || 'YA2025',
      reliefCode,
      amount
    );

    return NextResponse.json({
      success: true,
      message: 'Claim added successfully'
    });
  } catch (error) {
    console.error('Error adding claim:', error);
    return NextResponse.json(
      { error: 'Failed to add claim' },
      { status: 500 }
    );
  }
}
