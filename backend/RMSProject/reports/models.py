from django.db import models
from collections import Counter
import logging
logger = logging.getLogger(__name__)


class StockBook(models.Model):
    STATUS_CHOICES = [
        ('In Progress', 'In Progress'),
        ('Under Review', 'Under Review'),
        ('Completed', 'Completed'),
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

    # Balances
    B_Bags = models.DecimalField(max_digits=15, decimal_places=3, default=1000.000)
    B_GKG = models.DecimalField(max_digits=15, decimal_places=3, default=1500000.000)
    B_NKG = models.DecimalField(max_digits=15, decimal_places=3, default=2300000.000)

    # Signatories
    Assist_BM = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='assist_bm_stockbooks')
    Account_II = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='account_ii_stockbooks')
    Branch_M = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='branch_m_stockbooks')

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
        ('admin',     'Admin'),
        ('asst_bm',   'Asst. Branch Manager'),
        ('accountant','Accountant 3'),
        ('branch_m',  'Branch Manager'),
        ('done',      'Done'),
    ]

    wsr_report_id = models.AutoField(primary_key=True)
    stockbook     = models.OneToOneField(
        'StockBook',
        on_delete=models.CASCADE,
        related_name='wsr_report'
    )
    Evaluation    = models.CharField(max_length=20, choices=EVALUATION_CHOICES, default='Pending')
    Reason        = models.TextField(blank=True, null=True)
    reviewed_by   = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='reviewed_wsr_reports'
    )

    current_stage = models.CharField(max_length=20, choices=STAGE_CHOICES, default='admin')
    admin_approval = models.CharField(max_length=20, choices=EVALUATION_CHOICES, default='Pending')
    asst_bm_approval = models.CharField(max_length=20, choices=EVALUATION_CHOICES, default='Pending')
    accountant_approval = models.CharField(max_length=20, choices=EVALUATION_CHOICES, default='Pending')
    branch_m_approval = models.CharField(max_length=20, choices=EVALUATION_CHOICES, default='Pending')

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
        ('admin',     'Admin'),
        ('asst_bm',   'Asst. Branch Manager'),
        ('accountant','Accountant 3'),
        ('branch_m',  'Branch Manager'),
        ('done',      'Done'),
    ]

    wsi_report_id = models.AutoField(primary_key=True)
    stockbook = models.OneToOneField(
        'StockBook',
        on_delete=models.CASCADE,
        related_name='wsi_report'
    )
    Evaluation = models.CharField(max_length=20, choices=EVALUATION_CHOICES, default='Pending')
    Reason = models.TextField(blank=True, null=True)
    reviewed_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='reviewed_wsi_reports'
    )

    current_stage = models.CharField(max_length=20, choices=STAGE_CHOICES, default='admin')
    admin_approval = models.CharField(max_length=20, choices=EVALUATION_CHOICES, default='Pending')
    asst_bm_approval = models.CharField(max_length=20, choices=EVALUATION_CHOICES, default='Pending')
    accountant_approval = models.CharField(max_length=20, choices=EVALUATION_CHOICES, default='Pending')
    branch_m_approval = models.CharField(max_length=20, choices=EVALUATION_CHOICES, default='Pending')


    def __str__(self):
        return f"WSIReport #{self.wsi_report_id} → {self.stockbook}"


class Transaction(models.Model):
    TYPE_CHOICES = [
        ('WTS', 'WTS'),
        ('WSR', 'WSR'),
        ('WSI', 'WSI'),
    ]

    transaction_id  = models.AutoField(primary_key=True)
    stockbook       = models.ForeignKey(
        'StockBook',
        on_delete=models.CASCADE,
        related_name='transactions'
    )
    # Link to WSRReport 
    wsr_report      = models.ForeignKey(
        'WSRReport',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='transactions'
    )
    # Link to WSIReport 
    wsi_report      = models.ForeignKey(
        'WSIReport',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='transactions'
    )
    type = models.CharField(max_length=5, choices=TYPE_CHOICES)

    # Delivery & Vehicle
    Particulars = models.CharField(max_length=100, blank=True, null=True)
    Plate_Number = models.CharField(max_length=20,  blank=True, null=True)
    Batch_No = models.CharField(max_length=2,  blank=True, null=True)
    AI_Number = models.CharField(max_length=8,  blank=True, null=True)
    OR_Number = models.CharField(max_length=8,  blank=True, null=True)
    Transaction_ref = models.CharField(max_length=20,  blank=True, null=True)

    # Document numbers
    WTS_no = models.CharField(max_length=8,  blank=True, null=True)
    WSR_no = models.CharField(max_length=8,  blank=True, null=True)
    WSI_no = models.CharField(max_length=8,  blank=True, null=True)

    # Quality Metrics
    Age = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    Moisture_Content= models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    Classifier = models.CharField(max_length=50, blank=True, null=True)
    Pile_No  = models.CharField(max_length=10, blank=True, null=True)
    Fillers  = models.CharField(max_length=255, blank=True, null=True)

    # Receipts (WSR + WTS)
    R_Bags = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    R_GKG = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    R_NKG = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    Cond_R = models.CharField(max_length=5, blank=True, null=True)

    # Issues (WSI + WTS)
    I_Bags  = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    I_GKG  = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    I_NKG  = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    Cond_I  = models.CharField(max_length=5, blank=True, null=True)

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
    summary_id   = models.AutoField(primary_key=True)
    stockbook    = models.ForeignKey(
        'StockBook',
        on_delete=models.CASCADE,
        related_name='summaries',
        null=True, blank=True
    )
    date_covered = models.DateField(blank=True, null=True)
    CerealType   = models.CharField(max_length=10, blank=True, null=True)

    # Beginning balance (from previous summary)
    prev_B_Bags  = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    prev_B_NKG   = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)

    # Computed totals
    total_R_Bags = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    total_R_NKG  = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    total_I_Bags = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    total_I_NKG  = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)

    # Dominant condition
    Condition    = models.CharField(max_length=5, blank=True, null=True)

    @property
    def ending_B_Bags(self):
        return self.stockbook.B_Bags

    @property
    def ending_B_NKG(self):
        return self.stockbook.B_NKG

    @property
    def Assist_BM(self):
        return self.stockbook.Assist_BM

    @property
    def Account_II(self):
        return self.stockbook.Account_II

    @property
    def Branch_M(self):
        return self.stockbook.Branch_M

    @property
    def Name(self):
        return self.stockbook.user_full_name

    @property
    def WHCode(self):
        return self.stockbook.user_WHCode

    def compute_and_save(self):
        self.CerealType  = self.stockbook.CerealType
        self.date_covered = self.stockbook.Date

        try:
            wsr_report = self.stockbook.wsr_report
            if wsr_report and wsr_report.Evaluation == 'Approved':
                receipt_txns = wsr_report.transactions.filter(type__in=['WSR', 'WTS'])
                self.total_R_Bags = sum(t.R_Bags or 0 for t in receipt_txns)
                self.total_R_NKG  = sum(t.R_NKG  or 0 for t in receipt_txns)
            else:
                self.total_R_Bags = 0
                self.total_R_NKG  = 0
        except Exception as e:
            logger.warning(f"Summary #{self.summary_id} - WSR fetch failed: {e}")
            self.total_R_Bags = 0
            self.total_R_NKG  = 0

        try:
            wsi_report = self.stockbook.wsi_report
            if wsi_report and wsi_report.Evaluation == 'Approved':
                issue_txns = wsi_report.transactions.filter(type__in=['WSI', 'WTS'])
                self.total_I_Bags = sum(t.I_Bags or 0 for t in issue_txns)
                self.total_I_NKG  = sum(t.I_NKG  or 0 for t in issue_txns)
            else:
                self.total_I_Bags = 0
                self.total_I_NKG  = 0
        except Exception as e:
            logger.warning(f"Summary #{self.summary_id} - WSI fetch failed: {e}")
            self.total_I_Bags = 0
            self.total_I_NKG  = 0

        all_conditions = []
        try:
            if self.stockbook.wsr_report:
                all_conditions += [
                    t.Cond_R for t in self.stockbook.wsr_report.transactions.all()
                    if t.Cond_R
                ]
        except Exception as e:
            logger.warning(f"Summary #{self.summary_id} - WSR condition fetch failed: {e}")
        try:
            if self.stockbook.wsi_report:
                all_conditions += [
                    t.Cond_I for t in self.stockbook.wsi_report.transactions.all()
                    if t.Cond_I
                ]
        except Exception as e:
            logger.warning(f"Summary #{self.summary_id} - WSI condition fetch failed: {e}")

        if all_conditions:
            self.Condition = Counter(all_conditions).most_common(1)[0][0]

        if self.date_covered:
            prev = Summary.objects.filter(
                CerealType=self.stockbook.CerealType,
                date_covered__lt=self.date_covered
            ).order_by('-date_covered').first()

            if prev:
                self.prev_B_Bags = prev.ending_B_Bags
                self.prev_B_NKG  = prev.ending_B_NKG

        self.save()

    def __str__(self):
        return f"Summary #{self.summary_id} - {self.CerealType} ({self.date_covered})"