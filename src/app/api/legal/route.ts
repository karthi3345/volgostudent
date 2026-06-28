import { NextResponse } from 'next/server';
import { fetchLegalDoc } from '@/lib/googleDocs';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  if (type !== 'privacy' && type !== 'terms') {
    return NextResponse.json({ error: 'Invalid document type. Must be "privacy" or "terms".' }, { status: 400 });
  }

  try {
    const htmlContent = await fetchLegalDoc(type);

    if (!htmlContent) {
      return NextResponse.json({ error: `${type} document not found in Google Drive.` }, { status: 404 });
    }

    return NextResponse.json({ content: htmlContent });
  } catch (error) {
    console.error(`Error fetching ${type}:`, error);
    return NextResponse.json({ error: 'Internal server error while fetching document.' }, { status: 500 });
  }
}
