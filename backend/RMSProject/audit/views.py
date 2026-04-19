from rest_framework import generics, permissions
from audit.models import AuditLog
from .serializers import AuditLogSerializer
from audit.models import create_audit_entry

class AuditLogListView(generics.ListAPIView):
    serializer_class = AuditLogSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        queryset = AuditLog.objects.all().order_by('-Date_audited', '-Time_audited')
        module = self.request.query_params.get('module')
        user_id = self.request.query_params.get('user_id')
        date = self.request.query_params.get('date')

        if module:
            queryset = queryset.filter(Module__icontains=module)
        if user_id:
            queryset = queryset.filter(User_ID=user_id)
        if date:
            queryset = queryset.filter(Date_audited=date)

        return queryset