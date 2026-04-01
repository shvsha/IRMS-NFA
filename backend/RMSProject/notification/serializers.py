from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    # Include dynamic property fields
    status = serializers.ReadOnlyField()
    reason_text = serializers.ReadOnlyField()
    office_id = serializers.ReadOnlyField()

    class Meta:
        model = Notification
        # Fields you want exposed in the API
        fields = [
            'notif_id',
            'report_id',        # FK to StockBook
            'submitted_by_name',  # dynamic from StockBook.name
            'status',        # dynamic
            'date_audited',
            'time_audited',
            'office_id',     # dynamic
            'reason_text',   # dynamic
        ]
