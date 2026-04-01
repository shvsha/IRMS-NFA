from django.db import models


class Notification(models.Model):
    notif_id = models.AutoField(primary_key=True)

    # Link to StockBook (report)
    report_id = models.ForeignKey(
        'reports.StockBook',
        on_delete=models.CASCADE,
        related_name='notifications'
    )

    # Submitted by (optional, plain text)
    # submitted_by = models.CharField(max_length=100, null=True, blank=True)
    # submitted_by = models.ForeignKey(
    #     'reports.StockBook',
    #     on_delete=models.CASCADE,
    #     related_name='notifications',
    #     blank=True, null=True
    # )

    # Optional links to WSR or WSI (to get status)
    wsr = models.ForeignKey(
        'reports.WSR', on_delete=models.CASCADE, related_name='notifications', null=True, blank=True)
    wsi = models.ForeignKey(
        'reports.WSI', on_delete=models.CASCADE, related_name='notifications', null=True, blank=True)

    # Date & Time of audit
    date_audited = models.DateField(null=True, blank=True)
    time_audited = models.TimeField(null=True, blank=True)

    # ───────────── Properties for FK display ─────────────
    @property
    def submitted_by_name(self):
        return self.report_id.name  # if self.report_id else '-'

    # @property
    # def report_id_value(self):
    #     return self.report.report_id #if self.report else None

    @property
    def status(self):
        """Get status from WSR or WSI evaluation."""
        if self.wsr:
            return self.wsr.Evaluation
        elif self.wsi:
            return self.wsi.Evaluation
        return '-'

    @property
    def office_id(self):
        """Get office from the User linked to StockBook."""
        if self.report_id and self.report_id.name:
            return self.report_id.name.Office_id or '-'
        return '-'

    @property
    def reason_text(self):
        """Get reason from WSR or WSI."""
        if self.wsr and self.wsr.Reason:
            return self.wsr.Reason
        elif self.wsi and self.wsi.Reason:
            return self.wsi.Reason
        return '-'

    def __str__(self):
        return f"Notif #{self.notif_id} - Report #{self.report_id} - Status: {self.status} - Reason: {self.reason_text}"
