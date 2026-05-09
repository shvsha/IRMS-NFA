from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone

from reports.models import WSRReport, WSIReport
from .models import Notification
from users.models import User

NOTIFY_STATUSES = ['Approved', 'Rejected']


def get_admins():
    return User.objects.filter(user_level='Admin')


def _get_stockbook(instance):
    """Get the relevant stockbook from FK first, then M2M fallback."""
    if instance.stockbook:
        return instance.stockbook
    return instance.stockbooks.first()


# ── WSRReport CREATED → Notify Admins ─────────────────────
@receiver(post_save, sender=WSRReport)
def notify_admin_wsr_created(sender, instance, created, **kwargs):
    if not created:
        return

    stockbook = _get_stockbook(instance)
    if not stockbook or not stockbook.name:
        return

    now          = timezone.now()
    submitted_by = stockbook.name

    for admin in get_admins():
        if Notification.objects.filter(wsr_report=instance, recipient=admin).exists():
            continue
        Notification.objects.create(
            report_id    = stockbook,
            wsr_report   = instance,
            recipient    = admin,
            submitted_by = submitted_by,
            reviewed_by  = None,
            date_audited = now.date(),
            time_audited = now.time(),
        )


# ── WSIReport CREATED → Notify Admins ─────────────────────
@receiver(post_save, sender=WSIReport)
def notify_admin_wsi_created(sender, instance, created, **kwargs):
    if not created:
        return

    stockbook = _get_stockbook(instance)
    if not stockbook or not stockbook.name:
        return

    now          = timezone.now()
    submitted_by = stockbook.name

    for admin in get_admins():
        if Notification.objects.filter(wsi_report=instance, recipient=admin).exists():
            continue
        Notification.objects.create(
            report_id    = stockbook,
            wsi_report   = instance,
            recipient    = admin,
            submitted_by = submitted_by,
            reviewed_by  = None,
            date_audited = now.date(),
            time_audited = now.time(),
        )


# ── WSRReport APPROVED/REJECTED → Notify Warehouse User ───
@receiver(post_save, sender=WSRReport)
def notify_user_wsr_evaluated(sender, instance, created, **kwargs):
    if created:
        return
    if instance.Evaluation not in NOTIFY_STATUSES:
        return

    stockbook = _get_stockbook(instance)
    if not stockbook or not stockbook.name:
        return

    now         = timezone.now()
    report_user = stockbook.name
    reviewed_by = instance.reviewed_by

    if Notification.objects.filter(wsr_report=instance, recipient=report_user).exists():
        return

    Notification.objects.create(
        report_id    = stockbook,
        wsr_report   = instance,
        recipient    = report_user,
        submitted_by = report_user,
        reviewed_by  = reviewed_by,
        date_audited = now.date(),
        time_audited = now.time(),
    )


# ── WSIReport APPROVED/REJECTED → Notify Warehouse User ───
@receiver(post_save, sender=WSIReport)
def notify_user_wsi_evaluated(sender, instance, created, **kwargs):
    if created:
        return
    if instance.Evaluation not in NOTIFY_STATUSES:
        return

    stockbook = _get_stockbook(instance)
    if not stockbook or not stockbook.name:
        return

    now         = timezone.now()
    report_user = stockbook.name
    reviewed_by = instance.reviewed_by

    if Notification.objects.filter(wsi_report=instance, recipient=report_user).exists():
        return

    Notification.objects.create(
        report_id    = stockbook,
        wsi_report   = instance,
        recipient    = report_user,
        submitted_by = report_user,
        reviewed_by  = reviewed_by,
        date_audited = now.date(),
        time_audited = now.time(),
    )