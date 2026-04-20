# audit/apps.py
from django.apps import AppConfig

class AuditConfig(AppConfig):
    default_auto_field = 'django.db.models.AutoField'
    name = 'audit'

    def ready(self):
        import audit.signals  # ← critical