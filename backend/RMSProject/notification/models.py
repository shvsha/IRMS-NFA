from django.db import models


class Notification(models.Model):
    notif_id = models.AutoField(primary_key=True)

    report_id = models.ForeignKey(
        'reports.StockBook',
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    recipient = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='notifications',
        null=True, blank=True
    )
    wsr_report = models.ForeignKey(
        'reports.WSRReport',
        on_delete=models.CASCADE,
        related_name='notifications',
        null=True, blank=True
    )
    wsi_report = models.ForeignKey(
        'reports.WSIReport',
        on_delete=models.CASCADE,
        related_name='notifications',
        null=True, blank=True
    )
    submitted_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='submitted_notifications'
    )
    reviewed_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='reviewed_notifications'
    )
    date_audited = models.DateField(null=True, blank=True)
    time_audited = models.TimeField(null=True, blank=True)

    @property
    def submitted_by_name(self):
        return (self.submitted_by.full_name if self.submitted_by
                else (self.report_id.name.full_name if self.report_id.name else '-'))

    @property
    def reviewed_by_name(self):
        return self.reviewed_by.full_name if self.reviewed_by else '-'

    @property
    def status(self):
        if self.wsr_report:
            return self.wsr_report.Evaluation
        elif self.wsi_report:
            return self.wsi_report.Evaluation
        return '-'

    @property
    def report_type(self):
        if self.wsr_report:
            return 'WSR'
        elif self.wsi_report:
            return 'WSI'
        return '-'

    @property
    def office_id(self):
        if self.report_id and self.report_id.name:
            return self.report_id.name.Office_id or '-'
        return '-'

    @property
    def reason_text(self):
        if self.wsr_report and self.wsr_report.Reason:
            return self.wsr_report.Reason
        elif self.wsi_report and self.wsi_report.Reason:
            return self.wsi_report.Reason
        return '-'

    def __str__(self):
        return f"Notif #{self.notif_id} - Report #{self.report_id} - Status: {self.status}"

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['wsr_report', 'recipient'],
                name='unique_wsr_report_per_recipient'
            ),
            models.UniqueConstraint(
                fields=['wsi_report', 'recipient'],
                name='unique_wsi_report_per_recipient'
            ),
        ]