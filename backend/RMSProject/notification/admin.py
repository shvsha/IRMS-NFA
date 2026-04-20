
from django.contrib import admin
from .models import Notification

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = [
        'notif_id', 'report_id', 'status', 'reviewed_by',
        'reason_text', 'date_audited', 'time_audited'
    ]
    readonly_fields = ['status', 'reason_text']