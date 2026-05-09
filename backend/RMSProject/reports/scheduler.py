from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from django_apscheduler.jobstores import DjangoJobStore
from django.utils import timezone
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

def archive_completed_reports():
    from .models import StockBook, WSRReport, WSIReport

    now = timezone.now()
    logger.info(f"[Scheduler] Running archive job at {now}")

    stockbooks = StockBook.objects.filter(Status='Completed')

    for stockbook in stockbooks:
        stockbook.Status = 'Archived'
        stockbook.save(update_fields=['Status'])

        try:
            if stockbook.wsr_report.Evaluation == 'Approved':
                stockbook.wsr_report.Evaluation = 'Archive'
                stockbook.wsr_report.save(update_fields=['Evaluation'])
        except WSRReport.DoesNotExist:
            pass

        try:
            if stockbook.wsi_report.Evaluation == 'Approved':
                stockbook.wsi_report.Evaluation = 'Archive'
                stockbook.wsi_report.save(update_fields=['Evaluation'])
        except WSIReport.DoesNotExist:
            pass

    logger.info(f"[Scheduler] Archived {stockbooks.count()} stockbooks.")


def start():
    scheduler = BackgroundScheduler(timezone=settings.TIME_ZONE)
    scheduler.add_jobstore(DjangoJobStore(), 'default')

    scheduler.add_job(
        archive_completed_reports,
        trigger=CronTrigger(hour=18, minute=0),  # ← 6:00 PM daily
        id='archive_reports_6pm',
        name='Archive completed reports at 6 PM',
        jobstore='default',
        replace_existing=True,
    )

    scheduler.start()
    logger.info("[Scheduler] Started. Archive job set for 6:00 PM daily.")