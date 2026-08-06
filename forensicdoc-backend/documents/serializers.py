from rest_framework import serializers
from .models import Document


class DocumentSerializer(serializers.ModelSerializer):
    uploader_username = serializers.CharField(source="uploader.username", read_only=True)

    class Meta:
        model = Document
        fields = [
            "id",
            "original_filename",
            "file",
            "file_size",
            "mime_type",
            "sha256_hash",
            "status",
            "uploaded_at",
            "updated_at",
            "lgu_unit",
            "notes",
            "uploader",
            "uploader_username",
        ]
        read_only_fields = [
            "id",
            "sha256_hash",
            "status",
            "uploaded_at",
            "updated_at",
            "uploader",
            "file_size",
            "mime_type",
        ]


class DocumentUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ["file", "lgu_unit", "notes"]
