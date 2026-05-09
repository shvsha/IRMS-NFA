from django.urls import path
from . import views

urlpatterns = [
    path('logs/',        views.AuditLogListView.as_view(), name='audit-logs'),
    path('log-export/',  views.log_export,                 name='audit-log-export'),
    path('log-import/',  views.log_import,                 name='audit-log-import'),
    path('log-login/',   views.log_login,                  name='audit-log-login'),
    path('log-logout/',  views.log_logout,                 name='audit-log-logout'),
]