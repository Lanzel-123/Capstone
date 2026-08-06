from django.urls import path
from .views import AnalysisJobDetailView

urlpatterns = [
    path("<uuid:id>/", AnalysisJobDetailView.as_view(), name="analysis-detail"),
]
