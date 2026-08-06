from django.contrib import admin
from .models import Document


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = (
        "original_filename",
        "uploader",
        "status",
        "sha256_hash",
        "uploaded_at",
        "file_size",
    )
    list_filter = ("status", "uploaded_at")
    search_fields = ("original_filename", "sha256_hash", "uploader__username")
    readonly_fields = ("sha256_hash", "uploaded_at", "updated_at")
