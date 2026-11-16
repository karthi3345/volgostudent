from rest_framework import serializers
from .models import BlogPost, LegalDocument

class BlogPostSerializer(serializers.ModelSerializer):
    date = serializers.CharField(source='formatted_date', read_only=True)
    readTime = serializers.CharField(source='read_time', required=False)
    majorTag = serializers.CharField(source='major_tag', required=False)
    image = serializers.SerializerMethodField()

    class Meta:
        model = BlogPost
        fields = [
            'id',
            'title',
            'slug',
            'excerpt',
            'content',
            'image',
            'image_file',
            'date',
            'readTime',
            'read_time',
            'majorTag',
            'major_tag',
            'tags',
            'is_published',
            'created_at',
            'updated_at',
        ]

    def get_image(self, obj):
        if obj.image_file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image_file.url)
            return f"http://127.0.0.1:8000{obj.image_file.url}"
        return obj.image or '/images/welcome-volgo.webp'

class LegalDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = LegalDocument
        fields = ['id', 'doc_type', 'title', 'content', 'updated_at']
