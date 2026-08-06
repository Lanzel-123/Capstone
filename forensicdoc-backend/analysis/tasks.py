from celery import shared_task
from django.utils import timezone
from .models import AnalysisJob, ForensicFinding
from documents.models import Document
from .services.pdf_analyser import analyse_pdf
from .services.docx_analyser import analyse_docx
from .services.metadata import extract_metadata, check_chronological_anomalies
from .services.scoring import calculate_verdict_and_score
import os


@shared_task(bind=True)
def run_document_analysis(self, document_id):
    """
    Executes real document forensic analysis pipeline:
    - ExifTool metadata & chronological anomaly detection
    - pypdf / python-docx structural checks
    - Deterministic risk scoring and verdict generation
    """
    try:
        document = Document.objects.get(id=document_id)
        job = document.analysis_job

        job.status = AnalysisJob.Status.RUNNING
        job.started_at = timezone.now()
        job.save(update_fields=["status", "started_at"])

        file_path = document.file.path
        ext = os.path.splitext(document.original_filename)[1].lower()

        findings_data = []

        # 1. Format-specific analysis
        if ext == ".pdf":
            findings_data.extend(analyse_pdf(file_path))
        elif ext in [".docx", ".doc"]:
            findings_data.extend(analyse_docx(file_path))

        # 2. Metadata analysis
        meta = extract_metadata(file_path)
        if isinstance(meta, dict) and "error" not in meta:
            findings_data.extend(check_chronological_anomalies(meta))

        # 3. Calculate score & verdict
        verdict, risk_score = calculate_verdict_and_score(findings_data)

        # Save findings
        for finding in findings_data:
            ForensicFinding.objects.create(
                analysis_job=job,
                category=finding.get("category", "general"),
                title=finding.get("title", "Forensic Finding"),
                description=finding.get("description", ""),
                severity=finding.get("severity", "LOW"),
                details=finding.get("details", {}),
            )

        job.status = AnalysisJob.Status.COMPLETED
        job.verdict = verdict
        job.risk_score = risk_score
        job.finished_at = timezone.now()
        job.save()

        # Update document status
        document.status = Document.Status.COMPLETED
        document.save(update_fields=["status"])

        return {"status": "completed", "document_id": str(document_id), "verdict": verdict, "risk_score": risk_score}

    except Exception as e:
        if "job" in locals():
            job.status = AnalysisJob.Status.FAILED
            job.error_message = str(e)
            job.finished_at = timezone.now()
            job.save()
        document.status = Document.Status.FAILED
        document.save(update_fields=["status"])
        raise
