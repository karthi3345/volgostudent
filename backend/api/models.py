from django.db import models
from django.utils import timezone
from django.utils.text import slugify

class BlogPost(models.Model):
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    excerpt = models.TextField(blank=True)
    content = models.TextField(blank=True, help_text='HTML or rich text content')
    image_file = models.ImageField(upload_to='blogs/', blank=True, null=True, help_text='Upload cover image file (.webp recommended)')
    image = models.CharField(max_length=500, blank=True, default='/images/welcome-volgo.webp', help_text='Image URL or path (used if no file uploaded)')
    major_tag = models.CharField(max_length=100, default='Education')
    tags = models.JSONField(default=list, blank=True, help_text='List of tags, e.g. [\"Education\", \"France\"]')
    read_time = models.CharField(max_length=50, default='3 min read')
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title) or 'post'
            slug = base_slug
            counter = 1
            while BlogPost.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f'{base_slug}-{counter}'
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

    @property
    def formatted_date(self):
        return self.created_at.strftime('%B %d, %Y')


class LegalDocument(models.Model):
    DOC_CHOICES = [
        ('privacy', 'Privacy Policy'),
        ('terms', 'Terms and Conditions'),
    ]
    doc_type = models.CharField(max_length=20, choices=DOC_CHOICES, unique=True)
    title = models.CharField(max_length=255)
    pdf_file = models.FileField(upload_to='documents/pdf/', blank=True, null=True, help_text='Upload the official PDF document')
    pages = models.JSONField(default=list, blank=True, help_text='List of document page image URLs, e.g. ["/documents/privacy/page-1.jpg", "/documents/privacy/page-2.jpg"]')
    content = models.TextField(blank=True, default='', help_text='Optional text or notes')
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'{self.get_doc_type_display()}'
