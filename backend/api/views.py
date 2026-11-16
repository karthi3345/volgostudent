from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import BlogPost, LegalDocument
from .serializers import BlogPostSerializer, LegalDocumentSerializer

class BlogPostViewSet(viewsets.ModelViewSet):
    queryset = BlogPost.objects.filter(is_published=True)
    serializer_class = BlogPostSerializer
    lookup_field = 'id'

    def get_queryset(self):
        qs = BlogPost.objects.all()
        # Non-staff only see published posts
        if not (self.request.user and self.request.user.is_staff):
            qs = qs.filter(is_published=True)
        return qs

class LegalDocumentView(APIView):
    def get(self, request):
        doc_type = request.query_params.get('type')
        if not doc_type or doc_type not in ['privacy', 'terms']:
            return Response(
                {'error': 'Invalid or missing document type. Must be \"privacy\" or \"terms\".'},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            doc = LegalDocument.objects.get(doc_type=doc_type)
            if doc.pdf_file:
                pdf_url = request.build_absolute_uri(doc.pdf_file.url)
            else:
                pdf_url = f'/documents/{doc_type}/privacy-policy.pdf' if doc_type == 'privacy' else f'/documents/{doc_type}/terms-and-conditions.pdf'
            return Response({
                'title': doc.title,
                'doc_type': doc.doc_type,
                'pdf_url': pdf_url,
                'pages': doc.pages or [],
                'content': doc.content
            })
        except LegalDocument.DoesNotExist:
            return Response(
                {'error': f'Document of type \"{doc_type}\" not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
