from rest_framework import generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status

from audit.models import AuditLog
from .serializers import AuditLogSerializer


def get_user_from_token(request):
    from rest_framework_simplejwt.tokens import AccessToken
    from users.models import User
    try:
        raw = request.headers.get('Authorization', '').split(' ')[1]
        decoded = AccessToken(raw)
        user_id = decoded.get('user_id')
        if not user_id:
            return None
        return User.objects.get(user_id=user_id)
    except Exception:
        return None


class AuditLogListView(generics.ListAPIView):
    serializer_class = AuditLogSerializer
    permission_classes = [AllowAny] 

    def get_queryset(self):
        # Only admins can see audit logs
        user = get_user_from_token(self.request)
        if not user or user.user_level != 'Admin':
            return AuditLog.objects.none()

        queryset = AuditLog.objects.all().order_by('-Date_audited', '-Time_audited')

        module  = self.request.query_params.get('module')
        user_id = self.request.query_params.get('user_id')
        date    = self.request.query_params.get('date')

        if module:
            queryset = queryset.filter(Module__icontains=module)
        if user_id:
            queryset = queryset.filter(User_ID=user_id)
        if date:
            queryset = queryset.filter(Date_audited=date)

        return queryset


@api_view(['POST'])
@permission_classes([AllowAny])
def log_export(request):
    """Called by frontend before triggering any Excel download."""
    user        = get_user_from_token(request)
    export_type = request.data.get('type', 'Unknown')
    export_id   = request.data.get('id', '')

    AuditLog.objects.create(
        User_ID=user,
        Module="Export",
        Action=f"Exported {export_type} #{export_id}"
    )
    return Response({'status': 'logged'}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def log_import(request):
    """Called by frontend after a successful Excel import."""
    user        = get_user_from_token(request)
    import_type = request.data.get('type', 'StockBook')
    report_id   = request.data.get('id', '')
    count       = request.data.get('count', 0)

    AuditLog.objects.create(
        User_ID=user,
        Module="Import",
        Action=f"Imported Excel into {import_type} R-{str(report_id).zfill(3)} - {count} transaction(s)"
    )
    return Response({'status': 'logged'}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def log_login(request):
    """Called by frontend after successful login."""
    user = get_user_from_token(request)
    if not user:
        return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)

    AuditLog.objects.create(
        User_ID=user,
        Module="Authentication",
        Action=f"User {user.full_name} ({user.username}) logged in"
    )
    return Response({'status': 'logged'}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def log_logout(request):
    """Called by frontend on logout."""
    user = get_user_from_token(request)
    if not user:
        return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)

    AuditLog.objects.create(
        User_ID=user,
        Module="Authentication",
        Action=f"User {user.full_name} ({user.username}) logged out"
    )
    return Response({'status': 'logged'}, status=status.HTTP_200_OK)