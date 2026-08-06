from django.db import models
from django.conf import settings
import uuid


class AnalysisJob(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        RUNNING = "RUNNING", "Running"
        COMPLETED = "COMPLETED", "Completed"
        FAILED = "FAILED", "Failed"

    class Verdict(models.TextChoices):
        AUTHENTIC = "AUTHENTIC", "Authentic"
        SUSPICIOUS = "SUSPICIOUS", "Suspicious"
        TAMPERED = "TAMPERED", "Tampered"
        INCONCLUSIVE = "INCONCLUSIVE", "Inconclusive"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    document = models.OneToOneField(
        "documents.Document",
        on_delete=models.CASCADE,
        related_name="analysis_job",
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )
    verdict = models.CharField(
        max_length=20,
        choices=Verdict.choices,
        blank=True,
        null=True,
    )
    risk_score = models.FloatField(null=True, blank=True)  # 0.0 – 100.0
    started_at = models.DateTimeField(null=True, blank=True)
    finished_at = models.DateTimeField(null=True, blank=True)
    error_message = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Analysis of {self.document.original_filename} ({self.status})"


class ForensicFinding(models.Model):
    """Stores individual findings from the rule engine (JSONB for flexibility)."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    analysis_job = models.ForeignKey(
        AnalysisJob,
        on_delete=models.CASCADE,
        related_name="findings",
    )
    category = models.CharField(max_length=100)  # e.g. "metadata", "structural", "visual"
    title = models.CharField(max_length=255)
    description = models.TextField()
    severity = models.CharField(
        max_length=20,
        choices=[
            ("LOW", "Low"),
            ("MEDIUM", "Medium"),
            ("HIGH", "High"),
            ("CRITICAL", "Critical"),
        ],
        default="MEDIUM",
    )
    details = models.JSONField(default=dict, blank=True)  # flexible extra data
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-severity", "category"]

    def __str__(self):
        return f"{self.category}: {self.title}"
