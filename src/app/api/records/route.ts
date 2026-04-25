import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

export async function GET() {
  try {
    // Path to the generated records directory
    const recordsDir = path.join(process.cwd(), 'customer_records');
    
    // Check if the directory exists
    if (!fs.existsSync(recordsDir)) {
      return NextResponse.json(
        { error: 'Records directory not found. Have you generated them yet?' }, 
        { status: 404 }
      );
    }

    const files = fs.readdirSync(recordsDir);
    const records = [];

    // Read every JSON file in the directory
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(recordsDir, file);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        try {
          const jsonData = JSON.parse(fileContent);
          records.push(jsonData);
        } catch (parseError) {
          console.error(`Failed to parse file ${file}:`, parseError);
        }
      }
    }

    // Sort the records by date to keep them ordered
    records.sort((a, b) => {
      const dateA = new Date(a.dateRange?.from || 0).getTime();
      const dateB = new Date(b.dateRange?.from || 0).getTime();
      return dateA - dateB;
    });

    return NextResponse.json({
      success: true,
      count: records.length,
      data: records
    });
    
  } catch (error) {
    console.error('Error reading records:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}
