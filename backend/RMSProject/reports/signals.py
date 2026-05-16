import logging
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.utils import timezone
from .models import StockBook, WSRReport, WSIReport, Summary, Transaction
logger = logging.getLogger(__name__)
_recomputing = set()
from django.db import models


@receiver(post_save, sender=StockBook)
def handle_stockbook_submit(sender, instance, created, update_fields, **kwargs):
    if update_fields and 'Status' in update_fields and len(update_fields) == 1:
        return
    if instance.Status != 'Under Review':
        return

    submitted_by = getattr(instance, '_submitted_by', None)

    has_wsr = instance.transactions.filter(type__in=['WSR', 'WTS']).exists()
    has_wsi = instance.transactions.filter(type__in=['WSI', 'WTS']).exists()

    if has_wsr:
        # Find existing WSR linked to this stockbook
        existing_wsr = WSRReport.objects.filter(
            stockbooks=instance,
            date_covered=instance.Date,
        ).order_by('-wsr_report_id').first()

        # Skip entirely if already approved — independent report, don't touch
        if existing_wsr and existing_wsr.Evaluation == 'Approved':
            pass
        else:
            if existing_wsr and existing_wsr.Evaluation in ['Rejected', 'Pending']:
                created_wsr = False
                existing_wsr.Evaluation          = 'Pending'
                existing_wsr.current_stage       = 'admin'
                existing_wsr.Reason              = ''
                existing_wsr.reviewed_by         = None
                existing_wsr.admin_approval      = 'Pending'
                existing_wsr.asst_bm_approval    = 'Pending'
                existing_wsr.accountant_approval = 'Pending'
                existing_wsr.branch_m_approval   = 'Pending'
                existing_wsr.save(update_fields=[
                    'Evaluation', 'current_stage', 'Reason', 'reviewed_by',
                    'admin_approval', 'asst_bm_approval',
                    'accountant_approval', 'branch_m_approval',
                ])
                wsr_report = existing_wsr
            else:
                wsr_report = WSRReport.objects.create(
                    date_covered=instance.Date,
                    Evaluation='Pending',
                    current_stage='admin',
                )
                created_wsr = True

            if not wsr_report.stockbook:
                wsr_report.stockbook = instance
                wsr_report.save(update_fields=['stockbook'])

            wsr_report.stockbooks.add(instance)
            instance.transactions.filter(
                type__in=['WSR', 'WTS']
            ).update(wsr_report=wsr_report)

            if submitted_by:
                from audit.models import AuditLog
                action = "Created" if created_wsr else "Updated"
                AuditLog.objects.create(
                    User_ID=submitted_by,
                    Module="WSR Report",
                    Action=f"WSR Report #{wsr_report.wsr_report_id} {action} - StockBook R-{str(instance.report_id).zfill(3)}"
                )

    if has_wsi:
        # Find existing WSI linked to this stockbook
        existing_wsi = WSIReport.objects.filter(
            stockbooks=instance,
            date_covered=instance.Date,
        ).order_by('-wsi_report_id').first()

        # Skip entirely if already approved — independent report, don't touch
        if existing_wsi and existing_wsi.Evaluation == 'Approved':
            pass
        else:
            if existing_wsi and existing_wsi.Evaluation in ['Rejected', 'Pending']:
                created_wsi = False
                existing_wsi.Evaluation          = 'Pending'
                existing_wsi.current_stage       = 'admin'
                existing_wsi.Reason              = ''
                existing_wsi.reviewed_by         = None
                existing_wsi.admin_approval      = 'Pending'
                existing_wsi.asst_bm_approval    = 'Pending'
                existing_wsi.accountant_approval = 'Pending'
                existing_wsi.branch_m_approval   = 'Pending'
                existing_wsi.save(update_fields=[
                    'Evaluation', 'current_stage', 'Reason', 'reviewed_by',
                    'admin_approval', 'asst_bm_approval',
                    'accountant_approval', 'branch_m_approval',
                ])
                wsi_report = existing_wsi
            else:
                wsi_report = WSIReport.objects.create(
                    date_covered=instance.Date,
                    Evaluation='Pending',
                    current_stage='admin',
                )
                created_wsi = True

            if not wsi_report.stockbook:
                wsi_report.stockbook = instance
                wsi_report.save(update_fields=['stockbook'])

            wsi_report.stockbooks.add(instance)
            instance.transactions.filter(
                type__in=['WSI', 'WTS']
            ).update(wsi_report=wsi_report)

            if submitted_by:
                from audit.models import AuditLog
                action = "Created" if created_wsi else "Updated"
                AuditLog.objects.create(
                    User_ID=submitted_by,
                    Module="WSI Report",
                    Action=f"WSI Report #{wsi_report.wsi_report_id} {action} - StockBook R-{str(instance.report_id).zfill(3)}"
                )


@receiver(post_save, sender=WSRReport)
@receiver(post_save, sender=WSIReport)
def recompute_summary_on_approval(sender, instance, **kwargs):
    if instance.Evaluation not in ['Approved', 'Rejected']:
        return

    linked_stockbooks = instance.stockbooks.all()
    if not linked_stockbooks.exists():
        return

    for stockbook in linked_stockbooks:
        wsr_report = WSRReport.objects.filter(
            date_covered=stockbook.Date,
            stockbooks=stockbook,
        ).order_by(
            models.Case(
                models.When(Evaluation='Approved', then=0),
                models.When(Evaluation='Pending',  then=1),
                default=2,
                output_field=models.IntegerField(),
            )
        ).first()

        wsi_report = WSIReport.objects.filter(
            date_covered=stockbook.Date,
            stockbooks=stockbook,
        ).order_by(
            models.Case(
                models.When(Evaluation='Approved', then=0),
                models.When(Evaluation='Pending',  then=1),
                default=2,
                output_field=models.IntegerField(),
            )
        ).first()

        wsr_eval = wsr_report.Evaluation if wsr_report else None
        wsi_eval = wsi_report.Evaluation if wsi_report else None

        # Determine stockbook status independently per report
        # A stockbook is Completed only when all its existing reports are Approved
        # If either existing report is Rejected → In Progress
        any_rejected = 'Rejected' in [wsr_eval, wsi_eval]
        all_approved = all(
            e == 'Approved'
            for e in [wsr_eval, wsi_eval]
            if e is not None  # only consider reports that actually exist
        )

        if any_rejected:
            stockbook.Status = 'In Progress'
        elif all_approved:
            stockbook.Status = 'Completed'
        # else: still Pending somewhere, leave status as-is (Under Review)

        if stockbook.Status == 'Completed' and not stockbook.completed_at:
            stockbook.completed_at = timezone.now()
            stockbook.save(update_fields=['Status', 'completed_at'])
        else:
            stockbook.save(update_fields=['Status'])

    # Add stockbook to summary and recompute whenever ANY report is Approved
    # (not just when stockbook is Completed — reports are now independent)
    if instance.Evaluation == 'Approved':
        ref = linked_stockbooks.first()
        summary, created_summary = Summary.objects.get_or_create(
            date_covered=ref.Date,
        )
        for stockbook in linked_stockbooks:
            summary.stockbooks.add(stockbook)
        summary.compute_and_save()

        from audit.models import AuditLog
        action = "Created" if created_summary else "Updated"
        AuditLog.objects.create(
            User_ID=instance.reviewed_by,
            Module="Summary",
            Action=f"Summary #{summary.summary_id} {action} - {summary.CerealType} ({summary.date_covered})"
        )


@receiver(post_save, sender=StockBook)
def carry_previous_balance(sender, instance, created, **kwargs):
    if instance.Status != 'Completed':
        return

    next_stock = StockBook.objects.filter(
        CerealType=instance.CerealType,
        Date__gt=instance.Date
    ).exclude(pk=instance.pk).order_by('Date').first()

    if next_stock:
        next_stock.B_Bags = instance.B_Bags
        next_stock.B_GKG  = instance.B_GKG
        next_stock.B_NKG  = instance.B_NKG
        next_stock.save(update_fields=['B_Bags', 'B_GKG', 'B_NKG'])

    if not created:
        return

    prev = StockBook.objects.filter(
        CerealType=instance.CerealType,
        Status='Completed'
    ).exclude(pk=instance.pk).order_by('-Date').first()

    if prev:
        instance.B_Bags = prev.B_Bags
        instance.B_GKG  = prev.B_GKG
        instance.B_NKG  = prev.B_NKG
        instance.save(update_fields=['B_Bags', 'B_GKG', 'B_NKG'])


def recompute_stockbook_balance(stockbook):
    if stockbook.pk in _recomputing:
        return
    _recomputing.add(stockbook.pk)
    try:
        from decimal import Decimal

        prev = StockBook.objects.filter(
            CerealType=stockbook.CerealType,
            Status='Completed'
        ).exclude(pk=stockbook.pk).order_by('-Date').first()

        if prev:
            base_bags = prev.B_Bags or Decimal('0')
            base_gkg  = prev.B_GKG  or Decimal('0')
            base_nkg  = prev.B_NKG  or Decimal('0')
        else:
            base_bags = Decimal('1000.000')
            base_gkg  = Decimal('1500000.000')
            base_nkg  = Decimal('2300000.000')

        txns = stockbook.transactions.all()

        total_r_bags = sum(t.R_Bags or 0 for t in txns if t.R_Bags)
        total_r_gkg  = sum(t.R_GKG  or 0 for t in txns if t.R_GKG)
        total_r_nkg  = sum(t.R_NKG  or 0 for t in txns if t.R_NKG)

        total_i_bags = sum(t.I_Bags or 0 for t in txns if t.I_Bags)
        total_i_gkg  = sum(t.I_GKG  or 0 for t in txns if t.I_GKG)
        total_i_nkg  = sum(t.I_NKG  or 0 for t in txns if t.I_NKG)

        stockbook.B_Bags = base_bags + total_r_bags - total_i_bags
        stockbook.B_GKG  = base_gkg  + total_r_gkg  - total_i_gkg
        stockbook.B_NKG  = base_nkg  + total_r_nkg  - total_i_nkg
        stockbook.save(update_fields=['B_Bags', 'B_GKG', 'B_NKG'])

    finally:
        _recomputing.discard(stockbook.pk)


@receiver(post_save, sender=Transaction)
@receiver(post_delete, sender=Transaction)
def update_balance_on_transaction_change(sender, instance, **kwargs):
    try:
        recompute_stockbook_balance(instance.stockbook)
    except Exception as e:
        import traceback
        logger.error(f"SIGNAL ERROR in update_balance_on_transaction_change: {e}")
        logger.error(traceback.format_exc())
        raise