import os
import sys
import json
import django
from pathlib import Path

# Setup Django environment
BASE_DIR = Path(__file__).resolve().parent
sys.path.append(str(BASE_DIR))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'volgo_backend.settings')
django.setup()

from api.models import BlogPost, LegalDocument

def run_seed():
    print('Starting database seeding...')
    
    # 1. Seed Blogs
    blogs_path = BASE_DIR.parent / 'seed_blogs.json'
    if blogs_path.exists():
        with open(blogs_path, 'r', encoding='utf-8') as f:
            blogs_data = json.load(f)
        
        for item in blogs_data:
            post, created = BlogPost.objects.update_or_create(
                title=item.get('title'),
                defaults={
                    'excerpt': item.get('excerpt', ''),
                    'content': item.get('content', ''),
                    'image': item.get('image', '/images/welcome-volgo.webp'),
                    'major_tag': item.get('majorTag', 'Education'),
                    'tags': item.get('tags', []),
                    'read_time': item.get('readTime', '3 min read'),
                    'is_published': True,
                }
            )
            status_str = 'Created' if created else 'Updated'
            print(f'{status_str} blog: {post.title}')
    else:
        print('seed_blogs.json not found, skipping blogs seed.')

    # 2. Seed Legal Documents
    legal_path = BASE_DIR.parent / 'seed_legal.json'
    if legal_path.exists():
        with open(legal_path, 'r', encoding='utf-8') as f:
            legal_data = json.load(f)

        privacy = legal_data.get('privacy', {})
        if privacy and privacy.get('content'):
            LegalDocument.objects.update_or_create(
                doc_type='privacy',
                defaults={
                    'title': 'Privacy Policy',
                    'content': privacy.get('content')
                }
            )
            print('Seeded Privacy Policy')

        terms = legal_data.get('terms', {})
        if terms and terms.get('content'):
            LegalDocument.objects.update_or_create(
                doc_type='terms',
                defaults={
                    'title': 'Terms and Conditions',
                    'content': terms.get('content')
                }
            )
            print('Seeded Terms and Conditions')

    print('Seeding completed successfully!')

if __name__ == '__main__':
    run_seed()
