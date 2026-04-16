# notification/signals.py

from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from reports.models import WSR, WSI
from .models import Notification

NOTIFY_STATUSES = ['Approved', 'Rejected']


@receiver(post_save, sender=WSR)
def handle_wsr_save(sender, instance, created, **kwargs):
    now = timezone.now()

    if instance.Evaluation not in NOTIFY_STATUSES:
        return

    # ✅ Get reviewer automatically from view
    reviewed_by = getattr(instance, '_reviewed_by', None) or instance.reviewed_by

    if created:
        Notification.objects.create(
            report_id=instance.Report_id,
            wsr=instance,
            reviewed_by=reviewed_by,
            date_audited=now.date(),
            time_audited=now.time(),
        )
    else:
        existing = Notification.objects.filter(wsr=instance).first()
        if existing:
            existing.reviewed_by = reviewed_by
            existing.date_audited = now.date()
            existing.time_audited = now.time()
            existing.save()
        else:
            Notification.objects.create(
                report_id=instance.Report_id,
                wsr=instance,
                reviewed_by=reviewed_by,
                date_audited=now.date(),
                time_audited=now.time(),
            )


@receiver(post_save, sender=WSI)
def handle_wsi_save(sender, instance, created, **kwargs):
    now = timezone.now()

    if instance.Evaluation not in NOTIFY_STATUSES:
        return

    # ✅ Get reviewer automatically from view
    reviewed_by = getattr(instance, '_reviewed_by', None) or instance.reviewed_by

    if created:
        Notification.objects.create(
            report_id=instance.Report_id,
            wsi=instance,
            reviewed_by=reviewed_by,
            date_audited=now.date(),
            time_audited=now.time(),
        )
    else:
        existing = Notification.objects.filter(wsi=instance).first()
        if existing:
            existing.reviewed_by = reviewed_by
            existing.date_audited = now.date()
            existing.time_audited = now.time()
            existing.save()
        else:
            Notification.objects.create(
                report_id=instance.Report_id,
                wsi=instance,
                reviewed_by=reviewed_by,
                date_audited=now.date(),
                time_audited=now.time(),
            )