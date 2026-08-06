from rest_framework import serializers
from .models import AnalysisJob, ForensicFinding


class ForensicFindingSerializer(serializers.ModelSerializer):
    class Meta:
        model = ForensicFinding
        fields = [
            "id",
            "category",
            "title",
            "description",
            "severity",
            "details",
            "created_at",
        ]


class AnalysisJobSerializer(serializers.ModelSerializer):
    findings = ForensicFindingSerializer(many=True, read_only=True)
    document_id = serializers.UUIDField(source="document.id", read_only=True)
    original_filename = serializers.CharField(
        source="document.original_filename", read_only=True
    )

    class Meta:
        model = AnalysisJob
        fields = [
            "id",
            "document_id",
            "original_filename",
            "status",
            "verdict",
            "risk_score",
            "started_at",
            "finished_at",
            "error_message",
            "created_at",
            "updated_at",
            "findings",
        ]
