# Register your models here.
from django.contrib import admin
from .models import AuditLog


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    # Display columns in the list view
    list_display = ('Audit_id', 'User_ID', 'Name', 'Position', 'Module', 'Action', 'Date_audited', 'Time_audited')
    
    # Add filters on the right sidebar
    list_filter = ('Date_audited', 'Module', 'User_ID')
    
    # Add search bar for users and actions
    search_fields = ('Action', 'Module', 'User_ID__username', 'User_ID__full_name')
    
    # Make logs read-only 
    readonly_fields = ('Audit_id', 'User_ID', 'Date_audited', 'Time_audited', 'Module', 'Action', 'Name', 'Position')

    # Order by most recent by default
    ordering = ('-Date_audited', '-Time_audited')

    #def has_add_permission(self, request):
        #return False # Logs should only be created by system actions, not manually in admin