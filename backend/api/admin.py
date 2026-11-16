from django.contrib import admin
from django.utils.html import format_html
from .models import BlogPost, LegalDocument

@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ('image_preview', 'title', 'major_tag', 'read_time', 'is_published', 'created_at')
    list_display_links = ('image_preview', 'title')
    list_filter = ('is_published', 'major_tag', 'created_at')
    search_fields = ('title', 'excerpt', 'content')
    prepopulated_fields = {'slug': ('title',)}
    date_hierarchy = 'created_at'
    readonly_fields = ('admin_image_preview', 'created_at', 'updated_at')

    fieldsets = (
        ('Blog Details', {
            'fields': ('title', 'slug', 'is_published', 'created_at')
        }),
        ('Cover Image (WebP Format)', {
            'fields': ('image_file', 'admin_image_preview', 'image')
        }),
        ('Tags & Metadata', {
            'fields': ('major_tag', 'tags', 'read_time', 'excerpt')
        }),
        ('Full Content (HTML / Rich Text)', {
            'fields': ('content',)
        }),
    )

    def image_preview(self, obj):
        url = obj.image_file.url if obj.image_file else obj.image
        if url:
            return format_html('<img src=\"{}\" style=\"width: 60px; height: 35px; object-fit: cover; border-radius: 4px;\" />', url)
        return '-'
    image_preview.short_description = 'Cover'

    def admin_image_preview(self, obj):
        url = obj.image_file.url if obj.image_file else obj.image
        if url:
            return format_html('<img src=\"{}\" style=\"max-width: 360px; max-height: 200px; object-fit: cover; border-radius: 8px; border: 1px solid #ccc;\" />', url)
        return '(No image selected)'
    admin_image_preview.short_description = 'Current Preview'


@admin.register(LegalDocument)
class LegalDocumentAdmin(admin.ModelAdmin):
    list_display = ('title', 'doc_type', 'current_pdf_link', 'updated_at')
    list_filter = ('doc_type',)
    search_fields = ('title', 'content')
    fields = ('doc_type', 'title', 'pdf_file', 'current_pdf_link', 'content', 'pages', 'pages_preview', 'updated_at')
    readonly_fields = ('current_pdf_link', 'pages_preview', 'updated_at')

    def current_pdf_link(self, obj):
        url = obj.pdf_file.url if obj.pdf_file else (
            f'/documents/{obj.doc_type}/privacy-policy.pdf' if obj.doc_type == 'privacy' else f'/documents/{obj.doc_type}/terms-and-conditions.pdf'
        )
        return format_html(
            '<a href="{}" target="_blank" style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; background: #0f172a; color: #fff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 12px;">'
            '📥 Download / View Current PDF</a>',
            url
        )
    current_pdf_link.short_description = 'Current PDF'

    def pages_preview(self, obj):
        if obj.pages:
            html = '<div style=\"display: flex; gap: 10px;\">'
            for p in obj.pages:
                html += f'<img src=\"{p}\" style=\"max-height: 120px; border: 1px solid #ccc; border-radius: 4px;\" />'
            html += '</div>'
            return format_html(html)
        return '(No pages configured)'
    pages_preview.short_description = 'Pages Preview'

    def formfield_for_dbfield(self, db_field, **kwargs):
        formfield = super().formfield_for_dbfield(db_field, **kwargs)
        if db_field.name == 'content':
            formfield.widget.attrs.update({
                'rows': 12,
                'style': 'width: 95%; max-width: 900px; font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif; font-size: 14px; line-height: 1.6; padding: 12px; border-radius: 6px;',
                'placeholder': 'Optional document notes or text'
            })
        return formfield
