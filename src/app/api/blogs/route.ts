import { NextResponse } from 'next/server';
import { fetchGoogleDocsBlogs } from '@/lib/googleDocs';
import { rateLimit } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
  if (!rateLimit(ip)) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('refresh') === 'true';
    const blogs = await fetchGoogleDocsBlogs(forceRefresh);
    return NextResponse.json(blogs);
  } catch (error) {
    console.error('Error inside /api/blogs:', error);
    return NextResponse.json({ error: 'Failed to fetch blogs' }, { status: 500 });
  }
}
