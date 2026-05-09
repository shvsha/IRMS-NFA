from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import AuditLog


# User
@receiver(post_save, sender='users.User')
def log_user_save(sender, instance, created, **kwargs):
    if created:
        action = f"Created {instance.user_level}: {instance.full_name} ({instance.username})"
    else:
        if instance.status == 'Inactive':
            action = f"Archived User: {instance.full_name} ({instance.username})"
        else:
            action = f"Edited User: {instance.full_name} ({instance.username}) - Level: {instance.user_level}, Status: {instance.status}"

    AuditLog.objects.create(User_ID=None, Module="User Management", Action=action)


@receiver(post_delete, sender='users.User')
def log_user_delete(sender, instance, **kwargs):
    AuditLog.objects.create(
        User_ID=None,
        Module="User Management",
        Action=f"Deleted User: {instance.full_name} ({instance.username})"
    )


# StockBook
@receiver(post_save, sender='reports.StockBook')
def log_stockbook_save(sender, instance, created, update_fields, **kwargs):
    # Skip noisy balance-only updates
    if update_fields and set(update_fields) <= {'B_Bags', 'B_GKG', 'B_NKG'}:
        return
    # Skip completed_at-only updates
    if update_fields and set(update_fields) <= {'completed_at'}:
        return

    action = "Created" if created else f"Updated - Status: {instance.Status}"
    AuditLog.objects.create(
        User_ID=instance.name,
        Module="Stock Book",
        Action=f"StockBook R-{str(instance.report_id).zfill(3)} {action} - {instance.CerealType}"
    )


@receiver(post_delete, sender='reports.StockBook')
def log_stockbook_delete(sender, instance, **kwargs):
    user = getattr(instance, '_deleted_by', None)
    AuditLog.objects.create(
        User_ID=user,
        Module="Stock Book",
        Action=f"Deleted StockBook R-{str(instance.report_id).zfill(3)} - {instance.CerealType}"
    )


# Transaction
@receiver(post_save, sender='reports.Transaction')
def log_transaction_save(sender, instance, created, **kwargs):
    action = "Created" if created else "Updated"
    AuditLog.objects.create(
        User_ID=instance.stockbook.name,
        Module=instance.type,
        Action=f"{instance.type} Transaction #{instance.transaction_id} {action} - StockBook R-{str(instance.stockbook.report_id).zfill(3)}"
    )


@receiver(post_delete, sender='reports.Transaction')
def log_transaction_delete(sender, instance, **kwargs):
    user = getattr(instance, '_deleted_by', None)
    AuditLog.objects.create(
        User_ID=user,
        Module=instance.type,
        Action=f"Deleted {instance.type} Transaction #{instance.transaction_id} - StockBook R-{str(instance.stockbook.report_id).zfill(3)}"
    )


# WSRReport
@receiver(post_save, sender='reports.WSRReport')
def log_wsr_report_save(sender, instance, created, **kwargs):
    if created:
        return
    
    try:
        sb = instance.stockbooks.first()
        sb_info = f"StockBook R-{str(sb.report_id).zfill(3)}" if sb else "No StockBook"
    except Exception:
        sb_info = "No StockBook"

    acting_user = getattr(instance, '_acted_by', None) or instance.reviewed_by

    if created:
        action = f"WSR Report #{instance.wsr_report_id} Created - {sb_info}"
        acting_user = None
    elif instance.Evaluation == 'Approved':
        action = f"WSR Report #{instance.wsr_report_id} Approved at stage [{instance.current_stage}] - {sb_info}"
    elif instance.Evaluation == 'Rejected':
        action = f"WSR Report #{instance.wsr_report_id} Rejected at stage [{instance.current_stage}] - Reason: {instance.Reason} - {sb_info}"
    elif instance.Evaluation == 'Archive':
        action = f"WSR Report #{instance.wsr_report_id} Archived - {sb_info}"
    else:
        return 

    AuditLog.objects.create(
        User_ID=acting_user,
        Module="WSR Report",
        Action=action
    )


@receiver(post_delete, sender='reports.WSRReport')
def log_wsr_report_delete(sender, instance, **kwargs):
    user = getattr(instance, '_deleted_by', None)
    AuditLog.objects.create(
        User_ID=user,
        Module="WSR Report",
        Action=f"Deleted WSR Report #{instance.wsr_report_id}"
    )


# WSIReport
@receiver(post_save, sender='reports.WSIReport')
def log_wsi_report_save(sender, instance, created, **kwargs):
    if created:
        return

    try:
        sb = instance.stockbooks.first()
        sb_info = f"StockBook R-{str(sb.report_id).zfill(3)}" if sb else "No StockBook"
    except Exception:
        sb_info = "No StockBook"

    acting_user = getattr(instance, '_acted_by', None) or instance.reviewed_by

    if created:
        action = f"WSI Report #{instance.wsi_report_id} Created - {sb_info}"
        acting_user = None
    elif instance.Evaluation == 'Approved':
        action = f"WSI Report #{instance.wsi_report_id} Approved at stage [{instance.current_stage}] - {sb_info}"
    elif instance.Evaluation == 'Rejected':
        action = f"WSI Report #{instance.wsi_report_id} Rejected at stage [{instance.current_stage}] - Reason: {instance.Reason} - {sb_info}"
    elif instance.Evaluation == 'Archive':
        action = f"WSI Report #{instance.wsi_report_id} Archived - {sb_info}"
    else:
        return 

    AuditLog.objects.create(
        User_ID=acting_user,
        Module="WSI Report",
        Action=action
    )


@receiver(post_delete, sender='reports.WSIReport')
def log_wsi_report_delete(sender, instance, **kwargs):
    user = getattr(instance, '_deleted_by', None)
    AuditLog.objects.create(
        User_ID=user,
        Module="WSI Report",
        Action=f"Deleted WSI Report #{instance.wsi_report_id}"
    )

# Summary
@receiver(post_save, sender='reports.Summary')
def log_summary_save(sender, instance, created, **kwargs):
    acting_user = getattr(instance, '_edited_by', None)
    if not acting_user:
        return

    AuditLog.objects.create(
        User_ID=acting_user,
        Module="Summary",
        Action=f"Summary #{instance.summary_id} Updated - {instance.CerealType} ({instance.date_covered})"
    )


@receiver(post_delete, sender='reports.Summary')
def log_summary_delete(sender, instance, **kwargs):
    user = getattr(instance, '_deleted_by', None)
    AuditLog.objects.create(
        User_ID=user,
        Module="Summary",
        Action=f"Deleted Summary #{instance.summary_id} - {instance.CerealType} ({instance.date_covered})"
    )