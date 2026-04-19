from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone

from reports.models import WSR, WSI
from .models import Notification
from users.models import User


NOTIFY_STATUSES = ['Approved', 'Rejected']


# ───────────────────────────────
# 🟢 GET ADMINS
# ───────────────────────────────
def get_admins():
    return User.objects.filter(user_level='Admin')


# ───────────────────────────────
# 🟢 WSR CREATED → NOTIFY ADMINS
# ───────────────────────────────
@receiver(post_save, sender=WSR)
def notify_admin_wsr_create(sender, instance, created, **kwargs):
    if not created:
        return

    now = timezone.now()
    submitted_by = instance.Report_id.name  # Warehouse user who submitted

    for admin in get_admins():
        Notification.objects.create(
            report_id=instance.Report_id,
            wsr=instance,
            recipient=admin,
            submitted_by=submitted_by,      # ✅ NEW
            reviewed_by=None,               # Admin notifs have no reviewer yet
            date_audited=now.date(),
            time_audited=now.time(),
        )


# ───────────────────────────────
# 🟢 WSI CREATED → NOTIFY ADMINS
# ───────────────────────────────
@receiver(post_save, sender=WSI)
def notify_admin_wsi_create(sender, instance, created, **kwargs):
    if not created:
        return

    now = timezone.now()
    submitted_by = instance.Report_id.name  # Warehouse user who submitted

    for admin in get_admins():
        Notification.objects.create(
            report_id=instance.Report_id,
            wsi=instance,
            recipient=admin,
            submitted_by=submitted_by,      # ✅ NEW
            reviewed_by=None,               # Admin notifs have no reviewer yet
            date_audited=now.date(),
            time_audited=now.time(),
        )


# ───────────────────────────────
# 🔴 WSR APPROVED/REJECTED → NOTIFY USER
# ───────────────────────────────
@receiver(post_save, sender=WSR)
def notify_user_wsr_status(sender, instance, created, **kwargs):
    if instance.Evaluation not in NOTIFY_STATUSES:
        return

    now = timezone.now()
    reviewed_by = getattr(instance, '_reviewed_by',
                          None) or instance.reviewed_by
    report_user = instance.Report_id.name  # User who submitted
    submitted_by = report_user

    # Prevent duplicates (uses model constraint)
    if Notification.objects.filter(wsr=instance, recipient=report_user).exists():
        return

    Notification.objects.create(
        report_id=instance.Report_id,
        wsr=instance,
        recipient=report_user,
        submitted_by=submitted_by,      # ✅ NEW
        reviewed_by=reviewed_by,        # Admin who approved/rejected
        date_audited=now.date(),
        time_audited=now.time(),
    )


# ───────────────────────────────
# 🔴 WSI APPROVED/REJECTED → NOTIFY USER
# ───────────────────────────────
@receiver(post_save, sender=WSI)
def notify_user_wsi_status(sender, instance, created, **kwargs):
    if instance.Evaluation not in NOTIFY_STATUSES:
        return

    now = timezone.now()
    reviewed_by = getattr(instance, '_reviewed_by',
                          None) or instance.reviewed_by
    report_user = instance.Report_id.name  # User who submitted
    submitted_by = report_user

    # Prevent duplicates (uses model constraint)
    if Notification.objects.filter(wsi=instance, recipient=report_user).exists():
        return

    Notification.objects.create(
        report_id=instance.Report_id,
        wsi=instance,
        recipient=report_user,
        submitted_by=submitted_by,      # ✅ NEW
        reviewed_by=reviewed_by,        # Admin who approved/rejected
        date_audited=now.date(),
        time_audited=now.time(),
    )
