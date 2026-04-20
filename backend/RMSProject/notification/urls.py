from django.urls import path
from .views import notification_list, notification_detail, notifications_by_report

urlpatterns = [
    path('notifications/',                        notification_list,       name='notification-list'),
    path('notifications/<int:pk>/',               notification_detail,     name='notification-detail'),
    path('notifications/report/<int:report_id>/', notifications_by_report, name='notifications-by-report'),
]
