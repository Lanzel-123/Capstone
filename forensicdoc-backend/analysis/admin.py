from django.contrib import admin
from .models import AnalysisJob, ForensicFinding


class ForensicFindingInline(admin.TabularInline):
    model = ForensicFinding
    extra = 0
    readonly_fields = ("category", "title", "severity", "created_at")


@admin.register(AnalysisJob)
class AnalysisJobAdmin(admin.ModelAdmin):
    list_display = ("document", "status", "verdict", "risk_score", "started_at", "finished_at")
    list_filter = ("status", "verdict")
    search_fields = ("document__original_filename",)
    inlines = [ForensicFindingInline]
    readonly_fields = ("created_at", "updated_at")


@admin.register(ForensicFinding)
class ForensicFindingAdmin(admin.ModelAdmin):
    list_display = ("analysis_job", "category", "title", "severity", "created_at")
    list_filter = ("category", "severity")
