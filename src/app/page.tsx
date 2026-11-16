import { fetchBlogs } from '@/lib/api';
import HomeClient from './HomeClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  const blogs = await fetchBlogs();
  return <HomeClient initialBlogs={blogs} />;
}
