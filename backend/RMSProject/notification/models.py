# notification/models.py

from django.db import models


class Notification(models.Model):
    notif_id = models.AutoField(primary_key=True)

    # Link to StockBook (report)
    report_id = models.ForeignKey(
        'reports.StockBook',
        on_delete=models.CASCADE,
        related_name='notifications'
    )

    # ✅ ADDED recipient (who receives notif)
    recipient = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='notifications',
        null=True, blank=True   # safe for migration
    )

    # Optional links to WSR or WSI (to get status)
    wsr = models.ForeignKey(
        'reports.WSR', on_delete=models.CASCADE, related_name='notifications', null=True, blank=True)
    wsi = models.ForeignKey(
        'reports.WSI', on_delete=models.CASCADE, related_name='notifications', null=True, blank=True)

    # ✅ NEW: Submitted by (warehouse user who created report)
    submitted_by = models.ForeignKey(  # 👈 ADDED
        'users.User',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='submitted_notifications'
    )

    # Reviewed by (admin who approved/rejected)
    reviewed_by = models.ForeignKey(        # 👈 added
        'users.User',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='reviewed_notifications'
    )

    # Date & Time of audit
    date_audited = models.DateField(null=True, blank=True)
    time_audited = models.TimeField(null=True, blank=True)

    # ───────────── Properties ─────────────

    @property
    def submitted_by_name(self):
        """Warehouse user who submitted (direct field fallback to report)."""
        # ✅ IMPROVED: Use direct field first, fallback to old logic
        return (self.submitted_by.full_name if self.submitted_by
                else (self.report_id.name.full_name if self.report_id.name else '-'))

    @property
    def reviewed_by_name(self):             # 👈 added
        """Admin who reviewed (approved/rejected) the report."""
        if self.reviewed_by:
            return self.reviewed_by.full_name  # → "fname mI lname" from User @property
        return '-'

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

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['wsr', 'recipient'],
                name='unique_wsr_per_user'
            ),
            models.UniqueConstraint(
                fields=['wsi', 'recipient'],
                name='unique_wsi_per_user'
            ),
        ]
