from django.urls import path
from .views import DocumentUploadView, DocumentListView, DocumentDetailView
from analysis.views import AnalysisByDocumentView

urlpatterns = [
    path("upload/", DocumentUploadView.as_view(), name="document-upload"),
    path("", DocumentListView.as_view(), name="document-list"),
    path("<uuid:id>/", DocumentDetailView.as_view(), name="document-detail"),
    path("<uuid:document_id>/analysis/", AnalysisByDocumentView.as_view(), name="document-analysis"),
]
