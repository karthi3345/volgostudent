import { fetchGoogleDocsBlogs } from '@/lib/googleDocs';
import HomeClient from './HomeClient';

export const dynamic = 'force-dynamic';

export default async function Home(props: { searchParams: Promise<{ refresh?: string }> }) {
  const searchParams = await props.searchParams;
  const forceRefresh = searchParams.refresh === 'true';
  const blogs = await fetchGoogleDocsBlogs(forceRefresh);
  return <HomeClient initialBlogs={blogs} />;
}
