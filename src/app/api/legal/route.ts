import { NextResponse } from 'next/server';
import { fetchLegalDoc } from '@/lib/googleDocs';
import { rateLimit } from '@/lib/rateLimit';

export async function GET(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
  if (!rateLimit(ip)) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
  }

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
