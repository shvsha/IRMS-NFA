from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status

from .models import Notification
from .serializers import NotificationSerializer


def get_user(request):
    from reports.views import get_user_from_token
    return get_user_from_token(request)


# ── List & Create ──────────────────────────────────────────
@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def notification_list(request):
    user = get_user(request)
    if not user:
        return Response({'error': 'Unauthorized'}, status=401)

    if request.method == 'GET':
        notifs = Notification.objects.select_related(
            'report_id', 'report_id__name', 'wsr_report', 'wsi_report'
        ).filter(recipient=user).order_by('-date_audited', '-time_audited')
        return Response(NotificationSerializer(notifs, many=True).data)

    elif request.method == 'POST':
        serializer = NotificationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


# ── Retrieve, Update, Delete ───────────────────────────────
@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([AllowAny])
def notification_detail(request, pk):
    user = get_user(request)
    if not user:
        return Response({'error': 'Unauthorized'}, status=401)

    try:
        notif = Notification.objects.select_related(
            'report_id', 'report_id__name', 'wsr_report', 'wsi_report'  # fixed: was 'wsr'/'wsi'
        ).get(pk=pk, recipient=user)  # fixed: was request.user

    except Notification.DoesNotExist:
        return Response(
            {'error': f"Notification with id '{pk}' not found."},
            status=status.HTTP_404_NOT_FOUND
        )

    if request.method == 'GET':
        return Response(NotificationSerializer(notif).data)

    elif request.method in ['PUT', 'PATCH']:
        serializer = NotificationSerializer(notif, data=request.data, partial=request.method == 'PATCH')
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    elif request.method == 'DELETE':
        notif_id = notif.notif_id
        notif.delete()
        return Response({'message': f'Notification #{notif_id} deleted successfully.'})


# ── Notifications by Report ────────────────────────────────
@api_view(['GET'])
@permission_classes([AllowAny])
def notifications_by_report(request, report_id):
    notifs = Notification.objects.select_related(
        'report_id', 'report_id__name', 'wsr_report', 'wsi_report'  # fixed: was 'wsr'/'wsi'
    ).filter(report_id=report_id)

    if not notifs.exists():
        return Response(
            {'error': f"No notifications found for report '{report_id}'."},
            status=status.HTTP_404_NOT_FOUND
        )

    return Response({
        'report_id': report_id,
        'count':     notifs.count(),
        'results':   NotificationSerializer(notifs, many=True).data,
    })