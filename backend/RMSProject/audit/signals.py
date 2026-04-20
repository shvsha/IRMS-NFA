# audit/signals.py

from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import AuditLog


# ── Audit User Changes ─────────────────────────────────────
@receiver(post_save, sender='users.User')
def log_user_save(sender, instance, created, **kwargs):
    if created:
        action = f"Added User: {instance.full_name} ({instance.username}) - Level: {instance.user_level}"
    else:
        # Check if it was an archive/status change
        if instance.status == 'Inactive':
            action = f"Archived User: {instance.full_name} ({instance.username})"
        else:
            action = f"Edited User: {instance.full_name} ({instance.username}) - Level: {instance.user_level}, Status: {instance.status}"

    AuditLog.objects.create(
        User_ID=None,  # the actor (who made the change) isn't available in signals
        Module="User Management",
        Action=action
    )


@receiver(post_delete, sender='users.User')
def log_user_delete(sender, instance, **kwargs):
    AuditLog.objects.create(
        User_ID=None,
        Module="User Management",
        Action=f"Deleted User: {instance.full_name} ({instance.username})"
    )


# ── Audit StockBook Changes ────────────────────────────────
@receiver(post_save, sender='reports.StockBook')
def log_stockbook_save(sender, instance, created, **kwargs):
    action = "Created" if created else "Updated"
    AuditLog.objects.create(
        User_ID=instance.name,
        Module="Stock Book",
        Action=f"StockBook #{instance.report_id} {action} - {instance.CerealType} ({instance.Transaction})"
    )


@receiver(post_delete, sender='reports.StockBook')
def log_stockbook_delete(sender, instance, **kwargs):
    AuditLog.objects.create(
        User_ID=None,
        Module="Stock Book",
        Action=f"Deleted StockBook #{instance.report_id} - {instance.CerealType}"
    )


# ── Audit WSR Changes ──────────────────────────────────────
@receiver(post_save, sender='reports.WSR')
def log_wsr_save(sender, instance, created, **kwargs):
    action = "Created" if created else "Updated"
    AuditLog.objects.create(
        User_ID=instance.Report_id.name,
        Module="WSR",
        Action=f"WSR #{instance.Receipt_ID} {action} - Evaluation: {instance.Evaluation}"
    )


@receiver(post_delete, sender='reports.WSR')
def log_wsr_delete(sender, instance, **kwargs):
    AuditLog.objects.create(
        User_ID=None,
        Module="WSR",
        Action=f"Deleted WSR #{instance.Receipt_ID}"
    )


# ── Audit WSI Changes ──────────────────────────────────────
@receiver(post_save, sender='reports.WSI')
def log_wsi_save(sender, instance, created, **kwargs):
    action = "Created" if created else "Updated"
    AuditLog.objects.create(
        User_ID=instance.Report_id.name,
        Module="WSI",
        Action=f"WSI #{instance.Issue_ID} {action} - Evaluation: {instance.Evaluation}"
    )


@receiver(post_delete, sender='reports.WSI')
def log_wsi_delete(sender, instance, **kwargs):
    AuditLog.objects.create(
        User_ID=None,
        Module="WSI",
        Action=f"Deleted WSI #{instance.Issue_ID}"
    )