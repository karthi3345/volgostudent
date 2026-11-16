from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BlogPostViewSet, LegalDocumentView

router = DefaultRouter()
router.register(r'blogs', BlogPostViewSet, basename='blogpost')

urlpatterns = [
    path('', include(router.urls)),
    path('legal/', LegalDocumentView.as_view(), name='legal-doc'),
]
