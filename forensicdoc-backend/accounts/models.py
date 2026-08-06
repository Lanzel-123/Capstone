from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        RECORDS_OFFICER = "RECORDS_OFFICER", "Records Officer"
        LEGAL = "LEGAL", "Legal Officer"
        HR = "HR", "Human Resources"
        AUDITOR = "AUDITOR", "Auditor"
        ADMIN = "ADMIN", "Administrator"

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.RECORDS_OFFICER,
    )
    lgu_unit = models.CharField(max_length=100, blank=True, null=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
