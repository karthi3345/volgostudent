import { fetchBlogs } from '@/lib/api';
import HomeClient from './HomeClient';

// Enable Incremental Static Regeneration for instant <50ms CDN responses
export const revalidate = 60;

export default async function Home() {
  const blogs = await fetchBlogs();
  return <HomeClient initialBlogs={blogs} />;
}
