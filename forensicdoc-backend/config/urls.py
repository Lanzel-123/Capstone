from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse  # <-- Added
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

# Root URL handler to verify backend status
def root_status(request):
    return JsonResponse({
        "status": "online",
        "message": "ForensicDoc Backend API is running"
    })

urlpatterns = [
    path("", root_status),  # <-- Added route for '/'

    path("admin/", admin.site.urls),

    # JWT Auth
    path("api/auth/login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # Documents + Analysis under documents
    path("api/documents/", include("documents.urls")),

    # Direct analysis access
    path("api/analysis/", include("analysis.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
