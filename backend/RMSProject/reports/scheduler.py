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
    count = stockbooks.count()

    for stockbook in stockbooks:
        # Archive the StockBook
        stockbook.Status = 'Archived'
        stockbook.save(update_fields=['Status'])

        # Archive linked WSR reports (via M2M)
        for wsr in WSRReport.objects.filter(stockbooks=stockbook, Evaluation='Approved'):
            wsr.Evaluation = 'Archive'
            wsr.save(update_fields=['Evaluation'])

        # Archive linked WSI reports (via M2M)
        for wsi in WSIReport.objects.filter(stockbooks=stockbook, Evaluation='Approved'):
            wsi.Evaluation = 'Archive'
            wsi.save(update_fields=['Evaluation'])

    logger.info(f"[Scheduler] Archived {count} stockbooks.")


def start():
    import os
    if os.environ.get('RUN_MAIN') != 'true':
        return

    scheduler = BackgroundScheduler(timezone=settings.TIME_ZONE)
    scheduler.add_jobstore(DjangoJobStore(), 'default')

    scheduler.add_job(
        archive_completed_reports,
        trigger=CronTrigger(hour=20, minute=26),
        id='archive_reports_6pm',
        name='Archive completed reports at 6 PM',
        jobstore='default',
        replace_existing=True,
    )

    scheduler.start()
    logger.info("[Scheduler] Started. Archive job set for 6:00 PM daily.")