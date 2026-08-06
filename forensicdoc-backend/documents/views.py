from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Document
from .serializers import DocumentSerializer, DocumentUploadSerializer


class DocumentUploadView(generics.CreateAPIView):
    serializer_class = DocumentUploadSerializer
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        uploaded_file = self.request.FILES.get("file")
        document = serializer.save(
            uploader=self.request.user,
            original_filename=uploaded_file.name,
            file_size=uploaded_file.size,
            mime_type=uploaded_file.content_type or "",
        )

        # Calculate SHA-256
        document.sha256_hash = document.calculate_sha256() or ""
        document.status = Document.Status.QUEUED
        document.save(update_fields=["sha256_hash", "status"])

        # Create AnalysisJob
        from analysis.models import AnalysisJob
        AnalysisJob.objects.create(document=document)

        # Trigger task
        from analysis.tasks import run_document_analysis
        run_document_analysis.delay(str(document.id))
        return document

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        document = self.perform_create(serializer)
        output_serializer = DocumentSerializer(document, context={"request": request})
        headers = self.get_success_headers(output_serializer.data)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class DocumentListView(generics.ListAPIView):
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == "ADMIN":
            return Document.objects.all()
        return Document.objects.filter(uploader=user)


class DocumentDetailView(generics.RetrieveAPIView):
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = "id"

    def get_queryset(self):
        user = self.request.user
        if user.role == "ADMIN":
            return Document.objects.all()
        return Document.objects.filter(uploader=user)
