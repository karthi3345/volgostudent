import { google } from 'googleapis';

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

let cachedBlogs: BlogPost[] | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 30 * 1000; // 30 seconds cache

export async function fetchGoogleDocsBlogs(forceRefresh: boolean = false): Promise<BlogPost[]> {
  // Check if we have valid cached data
  const now = Date.now();
  if (!forceRefresh && cachedBlogs && (now - lastFetchTime < CACHE_TTL)) {
    return cachedBlogs;
  }

  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  if (!clientEmail || !privateKey || !folderId) {
    console.warn("Google Docs environment variables are not fully configured.");
    return [];
  }

  try {
    let formattedPrivateKey = privateKey.trim();
    if (formattedPrivateKey.startsWith('"') && formattedPrivateKey.endsWith('"')) {
      formattedPrivateKey = formattedPrivateKey.substring(1, formattedPrivateKey.length - 1);
    }
    formattedPrivateKey = formattedPrivateKey.replace(/\\n/g, '\n');

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: formattedPrivateKey,
      },
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });

    const drive = google.drive({ version: 'v3', auth });

    // 1. List files in the specified folder, excluding templates
    const listResponse = await drive.files.list({
      q: `'${folderId}' in parents and mimeType = 'application/vnd.google-apps.document' and not name contains '[TEMPLATE]' and trashed = false`,
      fields: 'files(id, name, createdTime, modifiedTime)',
      orderBy: 'createdTime desc',
    });

    const files = listResponse.data.files || [];

    // 2. Fetch and parse files in parallel using Promise.all
    const postPromises = files.map(async (file) => {
      if (!file.id || !file.name) return null;

      try {
        // Export document as plain text and HTML in parallel
        const [textResponse, htmlResponse] = await Promise.all([
          drive.files.export({
            fileId: file.id,
            mimeType: 'text/plain',
          }),
          drive.files.export({
            fileId: file.id,
            mimeType: 'text/html',
          })
        ]);

        const plainText = textResponse.data as string;
        const htmlContent = htmlResponse.data as string;

        // 4. Parse metadata from the top of the plain text file
        let excerpt = '';
        let tags: string[] = [];
        let majorTag = '';
        let image = '/images/welcome-volgo.webp'; // default
        let cleanTitle = file.name;
        
        const lines = plainText.split('\n').map(l => l.replace(/\r$/, '').trim());
        let contentStartIndex = 0;

        for (let i = 0; i < Math.min(lines.length, 15); i++) {
          const line = lines[i];
          
          if (line.startsWith('Title:')) {
            cleanTitle = line.replace('Title:', '').trim();
          } else if (line.startsWith('Excerpt:')) {
            excerpt = line.replace('Excerpt:', '').trim();
          } else if (line.startsWith('Major Tag:')) {
            majorTag = line.replace('Major Tag:', '').trim();
          } else if (line.startsWith('Minor Tags:')) {
            tags = line.replace('Minor Tags:', '').split(',').map(t => t.trim()).filter(Boolean);
          } else if (line.startsWith('Tags:')) {
            tags = line.replace('Tags:', '').split(',').map(t => t.trim()).filter(Boolean);
          } else if (line.startsWith('Image:')) {
            image = line.replace('Image:', '').trim();
          } else if (line.startsWith('Cover Image:')) {
            image = line.replace('Cover Image:', '').trim();
          }

          if (i < lines.length - 1) {
            const nextLine = lines[i+1];
            if (line === 'Title') {
              cleanTitle = nextLine;
            } else if (line === 'Excerpt') {
              excerpt = nextLine;
            } else if (line === 'Major Tag') {
              majorTag = nextLine;
            } else if (line === 'Minor Tags' || line === 'Tags') {
              tags = nextLine.split(',').map(t => t.trim()).filter(Boolean);
            } else if (line === 'Cover Image' || line === 'Image') {
              image = nextLine;
            }
          }

          if (line === '---') {
            contentStartIndex = i + 1;
            break;
          }
        }

        // Apply fallbacks
        if (!majorTag) {
          majorTag = tags[0] || 'Education';
        }
        if (tags.length === 0) {
          tags = [majorTag];
        }

        if (!excerpt) {
          const mainBodyText = lines.slice(contentStartIndex).join(' ').trim();
          excerpt = mainBodyText.substring(0, 150) + (mainBodyText.length > 150 ? '...' : '');
        }

        const bodyMatch = htmlContent.match(/<body[^>]*>([\s\S]*)<\/body>/i);
        let cleanedHtml = bodyMatch ? bodyMatch[1] : htmlContent;
        
        cleanedHtml = cleanedHtml.replace(/<style[^>]*>([\s\S]*)<\/style>/gi, '');
        cleanedHtml = cleanedHtml.replace(/<table[^>]*>[\s\S]*?<\/table>/i, '');

        if (cleanedHtml.includes('---')) {
          cleanedHtml = cleanedHtml.replace(/^[\s\S]*?<p[^>]*>[\s\S]*?---\s*[\s\S]*?<\/p>/i, '');
        }

        cleanedHtml = cleanedHtml.replace(/<span\s+style="[^"]*">/gi, '<span>');
        cleanedHtml = cleanedHtml.replace(/<p\s+style="[^"]*">/gi, '<p>');

        const titleNormalized = cleanTitle.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
        if (titleNormalized.length > 0) {
          const firstTagMatch = cleanedHtml.match(/^\s*<([a-z1-6]+)[^>]*>([\s\S]*?)<\/\1>/i);
          if (firstTagMatch) {
            const tagText = firstTagMatch[2].replace(/<[^>]*>/g, '').toLowerCase().replace(/[^a-z0-9]/g, '').trim();
            if (tagText && (tagText === titleNormalized || (tagText.length > 10 && (titleNormalized.includes(tagText) || tagText.includes(titleNormalized))))) {
              cleanedHtml = cleanedHtml.replace(/^\s*<([a-z1-6]+)[^>]*>[\s\S]*?<\/\1>/i, '');
            }
          }
        }

        const dateObj = new Date(file.createdTime || new Date());
        const formattedDate = dateObj.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        });

        const wordCount = plainText.split(/\s+/).length;
        const readTime = `${Math.max(1, Math.ceil(wordCount / 200))} min read`;

        return {
          id: file.id,
          title: cleanTitle,
          excerpt,
          content: cleanedHtml,
          image,
          date: formattedDate,
          readTime,
          tags,
          majorTag
        };
      } catch (err) {
        console.error(`Error exporting/parsing Google Doc with ID ${file.id}:`, err);
        return null;
      }
    });

    const resolvedPosts = await Promise.all(postPromises);
    const posts = resolvedPosts.filter((post): post is BlogPost => post !== null);

    // Save to cache
    cachedBlogs = posts;
    lastFetchTime = Date.now();

    return posts;
  } catch (error) {
    console.error("Error fetching blogs from Google Drive:", error);
    return [];
  }
}
