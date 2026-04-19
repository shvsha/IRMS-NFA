from rest_framework import serializers
from .models import AuditLog

class AuditLogSerializer(serializers.ModelSerializer):
    Name = serializers.SerializerMethodField()
    Position = serializers.SerializerMethodField()

    class Meta:
        model = AuditLog
        fields = [
            'Audit_id',
            'User_ID',
            'Name',
            'Position',
            'Module',
            'Action',
            'Date_audited',
            'Time_audited',
        ]
        read_only_fields = [
            'Audit_id',
            'User_ID',
            'Name',
            'Position',
            'Module',
            'Action',
            'Date_audited',
            'Time_audited',
        ]

    def get_Name(self, obj):
        return obj.Name

    def get_Position(self, obj):
        return obj.Position