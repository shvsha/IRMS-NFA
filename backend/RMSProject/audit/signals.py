#signals

from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver 
from .models import Report, AuditLog
from django.contrib.auth import get_user_model

User = get_user_model()

#Auditing User Profile Changes
@receiver(post_save, sender=User)
def log_user_save(sender, instance, created, **kwargs):
    action = "Created User" if created else "Updated User"
    
    AuditLog.objects.create(
        User_ID=instance,
        Module="User Management",
        Action=f"{action}: {instance.username}"
    )

#Auditing Deletions/archive
@receiver(post_delete, sender=User)
def log_user_delete(sender, instance, **kwargs):
    AuditLog.objects.create(
        Module="User Management",
        Action=f"Deleted User: {instance.username}" #deleted ba or archived?
    )

#not yet done
#auditing report
@receiver(post_save, sender=Report)
def log_report_save(sender, instance, created, **kwargs):
    action = "CREATED" if created else "UPDATED"

    AuditLog.objects.create(
        User_ID=instance.updated_by,
        Module="Report",
        object_id=instance.id, 
        description=f"Report {instance.title} was {action.lower()}"
    )