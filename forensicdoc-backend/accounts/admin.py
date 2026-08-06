from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ("username", "email", "role", "lgu_unit", "is_staff", "is_active")
    list_filter = ("role", "is_staff", "is_active")
    fieldsets = UserAdmin.fieldsets + (
        ("ForensicDoc Profile", {"fields": ("role", "lgu_unit")}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ("ForensicDoc Profile", {"fields": ("role", "lgu_unit")}),
    )
