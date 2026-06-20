import { NextResponse } from 'next/server';
import { fetchGoogleDocsBlogs } from '@/lib/googleDocs';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
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
