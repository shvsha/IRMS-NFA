from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    status           = serializers.ReadOnlyField()
    reason_text      = serializers.ReadOnlyField()
    office_id        = serializers.ReadOnlyField()
    submitted_by_name = serializers.ReadOnlyField()
    reviewed_by_name  = serializers.ReadOnlyField()
    report_type       = serializers.ReadOnlyField()

    class Meta:
        model  = Notification
        fields = [
            'notif_id', 'report_id', 'recipient',
            'submitted_by_name', 'reviewed_by_name',
            'status', 'report_type',
            'date_audited', 'time_audited',
            'office_id', 'reason_text',
            'snapshot_evaluation',
            'snapshot_stage',
            'read', 
        ]
