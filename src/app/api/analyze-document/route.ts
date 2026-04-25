import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const category = formData.get('category') as string | null;
    const imageUrl = formData.get('imageUrl') as string | null;

    let base64Image: string;
    let mimeType = 'image/jpeg';
    let fileName = 'document';

    if (imageUrl) {
      fileName = imageUrl.split('/').pop() || 'sample-document';
      // Fetch image from URL (for sample/demo mode)
      try {
        const url = new URL(imageUrl);
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch image');
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        base64Image = buffer.toString('base64');
        mimeType = response.headers.get('content-type') || 'image/jpeg';
      } catch {
        return NextResponse.json(
          { error: 'Failed to fetch image from URL' },
          { status: 400 }
        );
      }
    } else if (file) {
      fileName = file.name;
      // Read file as base64
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      base64Image = buffer.toString('base64');
      mimeType = file.type || 'image/jpeg';
    } else {
      return NextResponse.json(
        { error: 'No file or imageUrl provided' },
        { status: 400 }
      );
    }

    // Prepare the prompt for document analysis
    const prompt = `Analyze this tax document/receipt (specifically a Malaysian Premium Paid Statement) and extract information in JSON format.
Look for a table with "Benefit Type" and "Amount (RM)".
Common types to map:
- "LIFE" -> map to "INSURANCE_LIFE"
- "MEDICAL" -> map to "INSURANCE_MEDICAL"
- "MEDICAL/LIFE" -> map to "INSURANCE_MEDICAL"
- "OTHERS" -> map to "OTHER"

{
  "documentType": "type of document (e.g. Premium Paid Statement)",
  "issuer": "company/organization name",
  "amount": total numerical amount in MYR,
  "date": "date in readable format",
  "year": "2025",
  "categories": [
    {
      "name": "Benefit Type (e.g. LIFE, MEDICAL)",
      "amount": numerical amount,
      "eligible": true (if maps to an LHDN category)
    }
  ],
  "confidence": score between 0 and 1
}

LHDN Tax Relief Categories YA2025:
- Medical/Health Insurance (INSURANCE_MEDICAL) - up to RM4,000
- Life Insurance/Takaful (INSURANCE_LIFE) - up to RM3,000

Return ONLY valid JSON.`;

    const apiKey = process.env.AI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'AI_API_KEY not configured' },
        { status: 500 }
      );
    }

    // Use Gemini 3.1 Flash Lite for vision
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${apiKey}`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType: mimeType,
                    data: base64Image
                  }
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 800
          }
        }),
      });

      console.log(`Gemini Response status: ${response.status}`);

      if (response.ok) {
        const result = await response.json();
        console.log('Gemini response:', JSON.stringify(result).substring(0, 1000));

        // Parse Gemini response
        try {
          let content = result.candidates?.[0]?.content?.parts?.[0]?.text || '';

          if (!content) {
            throw new Error('Empty response from Gemini');
          }

          // Clean up any markdown formatting
          content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            content = jsonMatch[0];
          }

          const extractedData = JSON.parse(content);

          return NextResponse.json({
            success: true,
            data: {
              ...extractedData,
              fileName: fileName,
              category: category || 'general',
            }
          });
        } catch (parseError) {
          console.error('Parse error:', parseError);
          return NextResponse.json(
            { error: 'Failed to parse Gemini response' },
            { status: 500 }
          );
        }
      } else {
        const errorText = await response.text();
        console.error(`Gemini API error ${response.status}:`, errorText.substring(0, 500));
        return NextResponse.json(
          { error: `Gemini API error: ${response.status} - ${errorText.substring(0, 200)}` },
          { status: 502 }
        );
      }
    } catch (error) {
      console.error('Error analyzing document:', error);
      return NextResponse.json(
        { error: 'Failed to analyze document' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error analyzing document:', error);
    return NextResponse.json(
      { error: 'Failed to analyze document' },
      { status: 500 }
    );
  }
}