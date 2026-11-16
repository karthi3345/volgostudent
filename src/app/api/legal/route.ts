import { NextResponse } from 'next/server';
import { fetchLegalDoc } from '@/lib/api';
import { rateLimit } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
    const doc = await fetchLegalDoc(type);

    if (!doc) {
      return NextResponse.json({ error: `${type} document not found.` }, { status: 404 });
    }

    return NextResponse.json(doc);
  } catch (error) {
    console.error(`Error fetching ${type}:`, error);
    return NextResponse.json({ error: 'Internal server error while fetching document.' }, { status: 500 });
  }
}
