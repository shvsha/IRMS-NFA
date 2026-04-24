from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import StockBook, WSRReport, WSIReport, Summary, Transaction
import logging
logger = logging.getLogger(__name__)

@receiver(post_save, sender=StockBook)
def handle_stockbook_submit(sender, instance, created, update_fields, **kwargs):
    if update_fields and 'Status' in update_fields and len(update_fields) == 1:
        return

    if instance.Status != 'Under Review':
        return

    has_wsr = instance.transactions.filter(type__in=['WSR', 'WTS']).exists()
    has_wsi = instance.transactions.filter(type__in=['WSI', 'WTS']).exists()

    if has_wsr:
        wsr_report, created = WSRReport.objects.get_or_create(
            stockbook=instance
        )
        if not created:

            wsr_report.Evaluation = 'Pending'
            wsr_report.Reason = None
            wsr_report.reviewed_by = None
            wsr_report.save()

        instance.transactions.filter(
            type__in=['WSR', 'WTS']
        ).update(wsr_report=wsr_report)

    if has_wsi:
        wsi_report, created = WSIReport.objects.get_or_create(
            stockbook=instance
        )
        if not created:
            wsi_report.Evaluation = 'Pending'
            wsi_report.Reason = None
            wsi_report.reviewed_by = None
            wsi_report.save()

        instance.transactions.filter(
            type__in=['WSI', 'WTS']
        ).update(wsi_report=wsi_report)


# Recompute Summary
@receiver(post_save, sender=WSRReport)
@receiver(post_save, sender=WSIReport)
def recompute_summary_on_approval(sender, instance, **kwargs):
    if instance.Evaluation not in ['Approved', 'Rejected']:
        return

    stockbook = instance.stockbook

    wsr_eval = None
    wsi_eval = None

    try:
        wsr_eval = stockbook.wsr_report.Evaluation
    except: pass

    try:
        wsi_eval = stockbook.wsi_report.Evaluation
    except: pass

    both_exist = wsr_eval is not None and wsi_eval is not None
    one_exists = wsr_eval is not None or wsi_eval is not None

    if both_exist:
        if wsr_eval == 'Approved' and wsi_eval == 'Approved':
            stockbook.Status = 'Completed'
        elif 'Rejected' in [wsr_eval, wsi_eval]:
            stockbook.Status = 'In Progress'
    elif one_exists:
        current_eval = wsr_eval or wsi_eval
        if current_eval == 'Approved':
            stockbook.Status = 'Completed'
        elif current_eval == 'Rejected':
            stockbook.Status = 'In Progress'

    stockbook.save(update_fields=['Status'])

    summary = stockbook.summaries.first()
    if summary:
        summary.compute_and_save()

# inherit the balance of the previous stock book
@receiver(post_save, sender=StockBook)
def carry_previous_balance(sender, instance, created, **kwargs):
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

# update or delete the balance data
def recompute_stockbook_balance(stockbook):
    from decimal import Decimal

    prev = StockBook.objects.filter(
        CerealType=stockbook.CerealType,
        Status='Completed'
    ).exclude(pk=stockbook.pk).order_by('-Date').first()

    base_bags = prev.B_Bags if prev and prev.B_Bags else Decimal('0')
    base_gkg  = prev.B_GKG  if prev and prev.B_GKG  else Decimal('0')
    base_nkg  = prev.B_NKG  if prev and prev.B_NKG  else Decimal('0')

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


@receiver(post_save, sender=Transaction)
@receiver(post_delete, sender=Transaction)
def update_balance_on_transaction_change(sender, instance, **kwargs):
    recompute_stockbook_balance(instance.stockbook)