#not yet sure

from .models import AuditLog

def create_audit_entry(user, module, action):
    """
    Utility function to standardize audit logging across the system.
    """
    return AuditLog.objects.create(
        User_ID=user,
        Module=module,
        Action=action
    )

