from django.contrib import admin
from .models import User, PasswordResetCode


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = [
        'user_id',
        'full_name',
        'username',
        'email',
        'user_level',
        'Office_id',
        'status'
    ]

    list_filter = [
        'user_level',
        'status',
        'signatory_role'
    ]

    search_fields = [
        'fname',
        'lname',
        'username',
        'email',
        'Office_id'
    ]

    readonly_fields = ['user_id']

    ordering = ['lname', 'fname']


@admin.register(PasswordResetCode)
class PasswordResetCodeAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'user',
        'code',
        'created_at',
        'is_used'
    ]

    list_filter = [
        'is_used',
        'created_at'
    ]

    search_fields = [
        'user__fname',
        'user__lname',
        'user__email',
        'code'
    ]

    readonly_fields = ['created_at']