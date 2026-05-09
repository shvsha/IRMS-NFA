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
        if instance.status == 'Inactive':
            action = f"Archived User: {instance.full_name} ({instance.username})"
        else:
            action = f"Edited User: {instance.full_name} ({instance.username}) - Level: {instance.user_level}, Status: {instance.status}"

    AuditLog.objects.create(
        User_ID=None,
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
        Action=f"StockBook #{instance.report_id} {action} - {instance.CerealType} - Status: {instance.Status}"
    )


@receiver(post_delete, sender='reports.StockBook')
def log_stockbook_delete(sender, instance, **kwargs):
    AuditLog.objects.create(
        User_ID=None,
        Module="Stock Book",
        Action=f"Deleted StockBook #{instance.report_id} - {instance.CerealType}"
    )


# ── Audit Transaction Changes ──────────────────────────────
@receiver(post_save, sender='reports.Transaction')
def log_transaction_save(sender, instance, created, **kwargs):
    action = "Created" if created else "Updated"
    AuditLog.objects.create(
        User_ID=instance.stockbook.name,
        Module=instance.type,
        Action=f"{instance.type} #{instance.transaction_id} {action} - StockBook #{instance.stockbook.report_id}"
    )


@receiver(post_delete, sender='reports.Transaction')
def log_transaction_delete(sender, instance, **kwargs):
    AuditLog.objects.create(
        User_ID=None,
        Module=instance.type,
        Action=f"Deleted {instance.type} #{instance.transaction_id}"
    )


# ── Audit WSRReport Changes ────────────────────────────────
@receiver(post_save, sender='reports.WSRReport')
def log_wsr_report_save(sender, instance, created, **kwargs):
    action = "Created" if created else "Updated"
    stockbook = instance.stockbook or instance.stockbooks.first()
    stockbook_info = f"StockBook #{stockbook.report_id}" if stockbook else "No StockBook"
    AuditLog.objects.create(
        User_ID=instance.reviewed_by if not created else None,
        Module="WSR Report",
        Action=f"WSRReport #{instance.wsr_report_id} {action} - Evaluation: {instance.Evaluation} - {stockbook_info}"
    )


@receiver(post_delete, sender='reports.WSRReport')
def log_wsr_report_delete(sender, instance, **kwargs):
    AuditLog.objects.create(
        User_ID=None,
        Module="WSR Report",
        Action=f"Deleted WSRReport #{instance.wsr_report_id}"
    )


# ── Audit WSIReport Changes ────────────────────────────────
@receiver(post_save, sender='reports.WSIReport')
def log_wsi_report_save(sender, instance, created, **kwargs):
    action = "Created" if created else "Updated"
    stockbook = instance.stockbook or instance.stockbooks.first()
    stockbook_info = f"StockBook #{stockbook.report_id}" if stockbook else "No StockBook"
    AuditLog.objects.create(
        User_ID=instance.reviewed_by if not created else None,
        Module="WSI Report",
        Action=f"WSIReport #{instance.wsi_report_id} {action} - Evaluation: {instance.Evaluation} - {stockbook_info}"
    )


@receiver(post_delete, sender='reports.WSIReport')
def log_wsi_report_delete(sender, instance, **kwargs):
    AuditLog.objects.create(
        User_ID=None,
        Module="WSI Report",
        Action=f"Deleted WSIReport #{instance.wsi_report_id}"
    )