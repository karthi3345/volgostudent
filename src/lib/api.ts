export interface BlogPost {
  id: string | number;
  title: string;
  excerpt: string;
  content?: string;
  image: string;
  date: string;
  readTime: string;
  tags: string[];
  majorTag?: string;
}

const DJANGO_API_URL = process.env.DJANGO_API_URL || process.env.NEXT_PUBLIC_DJANGO_API_URL || 'http://127.0.0.1:8000';

const FALLBACK_BLOGS: BlogPost[] = [
  {
    id: 1,
    title: 'Why Do Students Choose France When Other Countries Offer the Same Level of Education?',
    excerpt: "Discover why France is one of the world's top study destinations with affordable tuition, vibrant culture, and globally recognized degrees.",
    content: '<p>France is globally recognized for its world-class education, affordable tuition fees, rich cultural heritage, and exceptional career opportunities.</p>',
    image: '/images/welcome-volgo.webp',
    date: 'February 15, 2025',
    readTime: '3 min read',
    majorTag: 'Education',
    tags: ['Education', 'France', 'StudyAbroad'],
  }
];

export async function fetchBlogs(): Promise<BlogPost[]> {
  try {
    const res = await fetch(`${DJANGO_API_URL}/api/blogs/`, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
      }
    });
    if (!res.ok) {
      console.warn(`Django backend responded with ${res.status}, using default blogs`);
      return FALLBACK_BLOGS;
    }
    const data = await res.json();
    return Array.isArray(data) && data.length > 0 ? data : FALLBACK_BLOGS;
  } catch (err) {
    return FALLBACK_BLOGS;
  }
}

export interface LegalDocResponse {
  title: string;
  doc_type?: string;
  pdf_url?: string;
  pages?: string[];
  content?: string;
}

export async function fetchLegalDoc(type: 'privacy' | 'terms'): Promise<LegalDocResponse | null> {
  const fallbackPdf = type === 'privacy' ? '/documents/privacy/privacy-policy.pdf' : '/documents/terms/terms-and-conditions.pdf';
  try {
    const res = await fetch(`${DJANGO_API_URL}/api/legal/?type=${type}`, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
      }
    });
    if (!res.ok) {
      return {
        title: type === 'privacy' ? 'Privacy Policy' : 'Terms & Conditions',
        doc_type: type,
        pdf_url: fallbackPdf,
        pages: [`/documents/${type}/page-1.jpg`, `/documents/${type}/page-2.jpg`],
        content: ''
      };
    }
    const data = await res.json();
    return {
      title: data.title || (type === 'privacy' ? 'Privacy Policy' : 'Terms & Conditions'),
      doc_type: data.doc_type || type,
      pdf_url: data.pdf_url || fallbackPdf,
      pages: Array.isArray(data.pages) && data.pages.length > 0
        ? data.pages
        : [`/documents/${type}/page-1.jpg`, `/documents/${type}/page-2.jpg`],
      content: data.content || ''
    };
  } catch (err) {
    console.error(`Error connecting to Django backend for ${type}:`, err);
    return {
      title: type === 'privacy' ? 'Privacy Policy' : 'Terms & Conditions',
      doc_type: type,
      pdf_url: fallbackPdf,
      pages: [`/documents/${type}/page-1.jpg`, `/documents/${type}/page-2.jpg`],
      content: ''
    };
  }
}

