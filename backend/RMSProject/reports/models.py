from django.db import models
from collections import Counter
from decimal import Decimal
import logging
logger = logging.getLogger(__name__)


class StockBook(models.Model):
    STATUS_CHOICES = [
        ('In Progress', 'In Progress'),
        ('Under Review', 'Under Review'),
        ('Completed', 'Completed'),
        ('Archived', 'Archived'),
    ]

    report_id = models.AutoField(primary_key=True)
    name = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='stockbooks',
        blank=True, null=True
    )
    CerealType = models.CharField(max_length=10, blank=True, null=True)
    Status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='In Progress')
    Date = models.DateField(blank=True, null=True)

    B_Bags = models.DecimalField(max_digits=15, decimal_places=3, default=1000.000)
    B_GKG  = models.DecimalField(max_digits=15, decimal_places=3, default=1500000.000)
    B_NKG  = models.DecimalField(max_digits=15, decimal_places=3, default=2300000.000)

    Assist_BM  = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='assist_bm_stockbooks')
    Account_II = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='account_ii_stockbooks')
    Branch_M   = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='branch_m_stockbooks')

    completed_at = models.DateTimeField(blank=True, null=True)

    @property
    def user_full_name(self):
        return self.name.full_name if self.name else '-'

    @property
    def user_WHCode(self):
        return self.name.WHCode if self.name else '-'

    def __str__(self):
        return f"Report #{self.report_id} - {self.CerealType} ({self.Date})"


class WSRReport(models.Model):
    EVALUATION_CHOICES = [
        ('Pending',  'Pending'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
        ('Archive',  'Archive'),
    ]
    STAGE_CHOICES = [
        ('admin',      'Admin'),
        ('asst_bm',    'Asst. Branch Manager'),
        ('accountant', 'Accountant 3'),
        ('branch_m',   'Branch Manager'),
        ('done',       'Done'),
    ]

    wsr_report_id       = models.AutoField(primary_key=True)
    stockbook           = models.ForeignKey('StockBook', on_delete=models.SET_NULL, null=True, blank=True, related_name='wsr_report_single')
    stockbooks          = models.ManyToManyField('StockBook', related_name='wsr_reports', blank=True)
    date_covered        = models.DateField(blank=True, null=True)
    CerealType          = models.CharField(max_length=10, blank=True, null=True)
    Evaluation          = models.CharField(max_length=20, choices=EVALUATION_CHOICES, default='Pending')
    Reason              = models.TextField(blank=True, null=True)
    reviewed_by         = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_wsr_reports')
    current_stage       = models.CharField(max_length=20, choices=STAGE_CHOICES, default='admin')
    admin_approval      = models.CharField(max_length=20, choices=EVALUATION_CHOICES, default='Pending')
    asst_bm_approval    = models.CharField(max_length=20, choices=EVALUATION_CHOICES, default='Pending')
    accountant_approval = models.CharField(max_length=20, choices=EVALUATION_CHOICES, default='Pending')
    branch_m_approval   = models.CharField(max_length=20, choices=EVALUATION_CHOICES, default='Pending')

    def __str__(self):
        return f"WSRReport #{self.wsr_report_id} → {self.stockbook}"


class WSIReport(models.Model):
    EVALUATION_CHOICES = [
        ('Pending',  'Pending'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
        ('Archive',  'Archive'),
    ]
    STAGE_CHOICES = [
        ('admin',      'Admin'),
        ('asst_bm',    'Asst. Branch Manager'),
        ('accountant', 'Accountant 3'),
        ('branch_m',   'Branch Manager'),
        ('done',       'Done'),
    ]

    wsi_report_id       = models.AutoField(primary_key=True)
    stockbook           = models.ForeignKey('StockBook', on_delete=models.SET_NULL, null=True, blank=True, related_name='wsi_report_single')
    stockbooks          = models.ManyToManyField('StockBook', related_name='wsi_reports', blank=True)
    date_covered        = models.DateField(blank=True, null=True)
    CerealType          = models.CharField(max_length=10, blank=True, null=True)
    Evaluation          = models.CharField(max_length=20, choices=EVALUATION_CHOICES, default='Pending')
    Reason              = models.TextField(blank=True, null=True)
    reviewed_by         = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_wsi_reports')
    current_stage       = models.CharField(max_length=20, choices=STAGE_CHOICES, default='admin')
    admin_approval      = models.CharField(max_length=20, choices=EVALUATION_CHOICES, default='Pending')
    asst_bm_approval    = models.CharField(max_length=20, choices=EVALUATION_CHOICES, default='Pending')
    accountant_approval = models.CharField(max_length=20, choices=EVALUATION_CHOICES, default='Pending')
    branch_m_approval   = models.CharField(max_length=20, choices=EVALUATION_CHOICES, default='Pending')

    def __str__(self):
        return f"WSIReport #{self.wsi_report_id} → {self.stockbook}"


class Transaction(models.Model):
    TYPE_CHOICES = [
        ('WTS', 'WTS'),
        ('WSR', 'WSR'),
        ('WSI', 'WSI'),
    ]

    transaction_id   = models.AutoField(primary_key=True)
    stockbook        = models.ForeignKey('StockBook', on_delete=models.CASCADE, related_name='transactions')
    wsr_report       = models.ForeignKey('WSRReport', on_delete=models.SET_NULL, null=True, blank=True, related_name='transactions')
    wsi_report       = models.ForeignKey('WSIReport', on_delete=models.SET_NULL, null=True, blank=True, related_name='transactions')
    type             = models.CharField(max_length=5, choices=TYPE_CHOICES)

    Particulars      = models.CharField(max_length=100, blank=True, null=True)
    Plate_Number     = models.CharField(max_length=20,  blank=True, null=True)
    Batch_No         = models.CharField(max_length=2,   blank=True, null=True)
    AI_Number        = models.CharField(max_length=8,   blank=True, null=True)
    OR_Number        = models.CharField(max_length=8,   blank=True, null=True)
    Transaction_ref  = models.CharField(max_length=20,  blank=True, null=True)

    WTS_no = models.CharField(max_length=8, blank=True, null=True)
    WSR_no = models.CharField(max_length=8, blank=True, null=True)
    WSI_no = models.CharField(max_length=8, blank=True, null=True)

    Age              = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    Moisture_Content = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    Classifier       = models.CharField(max_length=50,  blank=True, null=True)
    Pile_No          = models.CharField(max_length=10,  blank=True, null=True)
    Fillers          = models.CharField(max_length=255, blank=True, null=True)

    R_Bags = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    R_GKG  = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    R_NKG  = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    Cond_R = models.CharField(max_length=5, blank=True, null=True)

    I_Bags = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    I_GKG  = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    I_NKG  = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    Cond_I = models.CharField(max_length=5, blank=True, null=True)

    @property
    def user_full_name(self):
        return self.stockbook.name.full_name if self.stockbook.name else '-'

    @property
    def user_WHCode(self):
        return self.stockbook.name.WHCode if self.stockbook.name else '-'

    @property
    def Assist_BM(self):
        return self.stockbook.Assist_BM

    @property
    def Account_II(self):
        return self.stockbook.Account_II

    @property
    def Branch_M(self):
        return self.stockbook.Branch_M

    def __str__(self):
        return f"{self.type} #{self.transaction_id} → Report #{self.stockbook.report_id}"


class Summary(models.Model):
    summary_id = models.AutoField(primary_key=True)

    date_covered = models.DateField(blank=True, null=True)
    CerealType   = models.CharField(max_length=10, blank=True, null=True)

    stockbooks = models.ManyToManyField(
        'StockBook',
        related_name='summaries',
        blank=True
    )

    prev_B_Bags  = models.DecimalField(max_digits=15, decimal_places=3, blank=True, null=True)
    prev_B_NKG   = models.DecimalField(max_digits=15, decimal_places=3, blank=True, null=True)
    total_R_Bags = models.DecimalField(max_digits=15, decimal_places=3, blank=True, null=True)
    total_R_NKG  = models.DecimalField(max_digits=15, decimal_places=3, blank=True, null=True)
    total_I_Bags = models.DecimalField(max_digits=15, decimal_places=3, blank=True, null=True)
    total_I_NKG  = models.DecimalField(max_digits=15, decimal_places=3, blank=True, null=True)
    Condition    = models.CharField(max_length=5, blank=True, null=True)

    @property
    def ending_B_Bags(self):
        return (
            (self.prev_B_Bags  or Decimal('0'))
            + (self.total_R_Bags or Decimal('0'))
            - (self.total_I_Bags or Decimal('0'))
        )

    @property
    def ending_B_NKG(self):
        return (
            (self.prev_B_NKG  or Decimal('0'))
            + (self.total_R_NKG or Decimal('0'))
            - (self.total_I_NKG or Decimal('0'))
        )

    def _primary_stockbook(self):
        """Latest completed stockbook in this summary, for signatory info."""
        return self.stockbooks.order_by('-completed_at', '-report_id').first()

    @property
    def Assist_BM(self):
        sb = self._primary_stockbook()
        return sb.Assist_BM if sb else None

    @property
    def Account_II(self):
        sb = self._primary_stockbook()
        return sb.Account_II if sb else None

    @property
    def Branch_M(self):
        sb = self._primary_stockbook()
        return sb.Branch_M if sb else None

    @property
    def Name(self):
        sb = self._primary_stockbook()
        return sb.user_full_name if sb else '-'

    @property
    def WHCode(self):
        sb = self._primary_stockbook()
        return sb.user_WHCode if sb else '-'

    def compute_and_save(self):
        from reports.models import WSRReport, WSIReport

        all_stockbooks = self.stockbooks.all()

        total_R_Bags = Decimal('0')
        total_R_NKG  = Decimal('0')
        total_I_Bags = Decimal('0')
        total_I_NKG  = Decimal('0')
        all_conditions = []

        for stockbook in all_stockbooks:
            wsr_report = WSRReport.objects.filter(
                stockbooks=stockbook,
                date_covered=stockbook.Date,
                Evaluation__in=['Approved', 'Archive'],
            ).order_by('-wsr_report_id').first()

            if wsr_report:
                for t in wsr_report.transactions.filter(
                    type__in=['WSR', 'WTS'], stockbook=stockbook
                ):
                    total_R_Bags += t.R_Bags or Decimal('0')
                    total_R_NKG  += t.R_NKG  or Decimal('0')
                    if t.Cond_R:
                        all_conditions.append(t.Cond_R)

            wsi_report = WSIReport.objects.filter(
                stockbooks=stockbook,
                date_covered=stockbook.Date,
                Evaluation__in=['Approved', 'Archive'],
            ).order_by('-wsi_report_id').first()

            if wsi_report:
                for t in wsi_report.transactions.filter(
                    type__in=['WSI', 'WTS'], stockbook=stockbook
                ):
                    total_I_Bags += t.I_Bags or Decimal('0')
                    total_I_NKG  += t.I_NKG  or Decimal('0')
                    if t.Cond_I:
                        all_conditions.append(t.Cond_I)

        if all_conditions:
            self.Condition = Counter(all_conditions).most_common(1)[0][0]

        self.total_R_Bags = total_R_Bags
        self.total_R_NKG  = total_R_NKG
        self.total_I_Bags = total_I_Bags
        self.total_I_NKG  = total_I_NKG

        prev_summary = Summary.objects.filter(
            date_covered__lt=self.date_covered
        ).exclude(pk=self.pk).order_by('-date_covered').first()

        if prev_summary:
            self.prev_B_Bags = prev_summary.ending_B_Bags
            self.prev_B_NKG  = prev_summary.ending_B_NKG
        else:
            total_B_Bags = Decimal('0')
            total_B_NKG  = Decimal('0')
            for stockbook in all_stockbooks:
                total_B_Bags += Decimal(str(stockbook.B_Bags))
                total_B_NKG  += Decimal(str(stockbook.B_NKG))
            self.prev_B_Bags = total_B_Bags - total_R_Bags + total_I_Bags
            self.prev_B_NKG  = total_B_NKG  - total_R_NKG  + total_I_NKG

        self.save()