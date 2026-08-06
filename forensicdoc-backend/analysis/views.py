from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404

from documents.models import Document
from .models import AnalysisJob
from .serializers import AnalysisJobSerializer


class AnalysisByDocumentView(APIView):
    """
    GET /api/documents/<document_id>/analysis/
    Returns the analysis job + all findings for a document.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, document_id):
        document = get_object_or_404(Document, id=document_id)

        # Permission check: only owner or ADMIN
        if request.user.role != "ADMIN" and document.uploader != request.user:
            return Response({"detail": "Not found."}, status=404)

        try:
            job = document.analysis_job
        except AnalysisJob.DoesNotExist:
            return Response(
                {"detail": "No analysis job found for this document."},
                status=404,
            )

        serializer = AnalysisJobSerializer(job)
        return Response(serializer.data)


class AnalysisJobDetailView(generics.RetrieveAPIView):
    """
    GET /api/analysis/<job_id>/
    """
    serializer_class = AnalysisJobSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = "id"

    def get_queryset(self):
        user = self.request.user
        if user.role == "ADMIN":
            return AnalysisJob.objects.all()
        return AnalysisJob.objects.filter(document__uploader=user)
