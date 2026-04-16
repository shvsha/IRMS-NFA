from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
from .models import Notification
from .serializers import NotificationSerializer


# ── List & Create ──────────────────────────────────────────
@api_view(['GET', 'POST'])
def notification_list(request):
    if request.method == 'GET':
        notifs= Notification.objects.select_related(
            'report_id', 'report_id__name', 'wsr', 'wsi'
        ).all()

        # # Optional filters
        # report_id = request.query_params.get('report_id')
        # if report_id:
        #     notifs = notifs.filter(report_id=report_id)

        # serializer = NotificationSerializer(notifs, many=True)
        # return Response({
        #     "count": notifs.count(),
        #     "results": serializer.data
        # }, status=status.HTTP_200_OK)

    elif request.method == 'POST':
        serializer = NotificationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ── Retrieve, Update, Delete ───────────────────────────────
@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
def notification_detail(request, pk):
    try:
        notif = Notification.objects.select_related(
            'report_id', 'report_id__name', 'wsr', 'wsi'
        ).get(pk=pk)
    except Notification.DoesNotExist:
        return Response(
            {"error": f"Notification with id '{pk}' not found."},
            status=status.HTTP_404_NOT_FOUND
        )

    if request.method == 'GET':
        serializer = NotificationSerializer(notif)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method in ['PUT', 'PATCH']:
        partial = request.method == 'PATCH'  # PATCH allows partial updates
        serializer = NotificationSerializer(notif, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        notif_id = notif.notif_id
        notif.delete()
        return Response(
            {"message": f"Notification #{notif_id} deleted successfully."},
            status=status.HTTP_200_OK      # 200 so the message body is visible
        )


# ── Notifications by Report ────────────────────────────────
@api_view(['GET'])
def notifications_by_report(request, report_id):
    """
    GET /notifications/report/<report_id>/
    """
    notifs = Notification.objects.select_related(
        'report_id', 'report_id__name', 'wsr', 'wsi'
    ).filter(report_id=report_id)

    if not notifs.exists():
        return Response(
            {"error": f"No notifications found for report '{report_id}'."},
            status=status.HTTP_404_NOT_FOUND
        )

    serializer = NotificationSerializer(notifs, many=True)
    return Response({
        "report_id": report_id,
        "count": notifs.count(),
        "results": serializer.data
    }, status=status.HTTP_200_OK)