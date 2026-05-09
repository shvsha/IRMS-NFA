import logging
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone

from reports.models import WSRReport, WSIReport
from .models import Notification
from users.models import User

logger = logging.getLogger(__name__)


def _now():
    n = timezone.now()
    return n.date(), n.time()


def _create_notif(report_instance, recipient, submitted_by, reviewed_by, is_wsr,
                  snapshot_evaluation=None, snapshot_stage=None):
    try:
        date, time = _now()
        kwargs = dict(
            recipient           = recipient,
            submitted_by        = submitted_by,
            reviewed_by         = reviewed_by,
            date_audited        = date,
            time_audited        = time,
            report_id           = report_instance.stockbook,
            snapshot_evaluation = snapshot_evaluation,  # ADD
            snapshot_stage      = snapshot_stage,       # ADD
        )
        if is_wsr:
            kwargs['wsr_report'] = report_instance
        else:
            kwargs['wsi_report'] = report_instance
        Notification.objects.create(**kwargs)
    except Exception as e:
        logger.error(f"Failed to create notification: {e}", exc_info=True)


def _handle_report_save(instance, created, is_wsr):
    try:
        stockbook = instance.stockbook
        if not stockbook or not stockbook.name:
            return

        ws_user = stockbook.name
        stage   = instance.current_stage
        eval_   = instance.Evaluation

        is_initial_submission = created and stage == 'admin' and eval_ == 'Pending'

        if is_initial_submission:
            admins = User.objects.filter(user_level='Admin', status='Active')
            for admin in admins:
                already = Notification.objects.filter(
                    recipient=admin,
                    **({'wsr_report': instance} if is_wsr else {'wsi_report': instance})
                ).exists()
                if not already:
                    _create_notif(
                        instance, admin, ws_user, None, is_wsr,
                        snapshot_evaluation='Pending',
                        snapshot_stage='admin',
                    )
            return

        if not created and stage == 'admin' and eval_ == 'Pending':
            report_filter = {'wsr_report': instance} if is_wsr else {'wsi_report': instance}
            Notification.objects.filter(**report_filter).delete()
            
            admins = User.objects.filter(user_level='Admin', status='Active')
            for admin in admins:
                _create_notif(
                    instance, admin, ws_user, None, is_wsr,
                    snapshot_evaluation='Pending',
                    snapshot_stage='admin',
                )
            return

        if eval_ == 'Approved' and stage == 'done':
            already = Notification.objects.filter(
                recipient=ws_user,
                snapshot_evaluation='Approved',
                **({'wsr_report': instance} if is_wsr else {'wsi_report': instance})
            ).exists()
            if not already:
                _create_notif(instance, ws_user, ws_user, instance.reviewed_by, is_wsr,
                              snapshot_evaluation='Approved', snapshot_stage='done')
            return

        if eval_ == 'Rejected':
            already = Notification.objects.filter(
                recipient=ws_user,
                snapshot_evaluation='Rejected',
                snapshot_stage=stage,
                **({'wsr_report': instance} if is_wsr else {'wsi_report': instance})
            ).exists()
            if not already:
                _create_notif(instance, ws_user, ws_user, instance.reviewed_by, is_wsr,
                              snapshot_evaluation='Rejected', snapshot_stage=stage)
            return

        next_role_map = {
            'asst_bm':    ('Signatory', 'Asst. Branch Manager'),
            'accountant': ('Signatory', 'Accountant 3'),
            'branch_m':   ('Signatory', 'Branch Manager'),
        }

        if stage in next_role_map:
            level, role = next_role_map[stage]
            next_users = User.objects.filter(
                user_level=level,
                signatory_role=role,
                status='Active'
            )
            for u in next_users:
                already = Notification.objects.filter(
                    recipient=u,
                    snapshot_stage=stage,
                    **({'wsr_report': instance} if is_wsr else {'wsi_report': instance})
                ).exists()
                if not already:
                    _create_notif(instance, u, ws_user, instance.reviewed_by, is_wsr,
                                  snapshot_evaluation='Pending', snapshot_stage=stage)

            already = Notification.objects.filter(
                recipient=ws_user,
                snapshot_evaluation='Stage_Approved',
                snapshot_stage=stage,
                **({'wsr_report': instance} if is_wsr else {'wsi_report': instance})
            ).exists()
            if not already:
                _create_notif(instance, ws_user, ws_user, instance.reviewed_by, is_wsr,
                              snapshot_evaluation='Stage_Approved', snapshot_stage=stage)

    except Exception as e:
        logger.error(f"Notification signal error: {e}", exc_info=True)


@receiver(post_save, sender=WSRReport)
def handle_wsr(sender, instance, created, **kwargs):
    _handle_report_save(instance, created, is_wsr=True)


@receiver(post_save, sender=WSIReport)
def handle_wsi(sender, instance, created, **kwargs):
    _handle_report_save(instance, created, is_wsr=False)
