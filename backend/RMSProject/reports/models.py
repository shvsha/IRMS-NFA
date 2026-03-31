from django.db import models

class StockBook(models.Model):
    report_id = models.AutoField(primary_key=True)
    name = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='stockbooks',
        blank=True, null=True
    )
    CerealType = models.CharField(max_length=10, blank=True, null=True)
    Status = models.CharField(max_length=20, blank=True, null=True)
    Date = models.DateField(blank=True, null=True)
    Particulars = models.CharField(max_length=100, blank=True, null=True)
    Plate_Number = models.CharField(max_length=20, blank=True, null=True)
    WTS = models.IntegerField(blank=True, null=True)
    WSR = models.IntegerField(blank=True, null=True)       # ✅ WSR not WRS
    WSI = models.IntegerField(blank=True, null=True)
    Batch_No = models.IntegerField(blank=True, null=True)
    Age = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    AI_Number = models.IntegerField(blank=True, null=True)
    OR_Number = models.IntegerField(blank=True, null=True)
    Moisture_Content = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    Classifier = models.CharField(max_length=50, blank=True, null=True)
    Transaction = models.CharField(max_length=20, blank=True, null=True)
    Pile_No = models.IntegerField(blank=True, null=True)

    # Receipt
    R_Bags = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    R_GKG = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    R_NKG = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    Cond_R = models.CharField(max_length=5, blank=True, null=True)

    # Issue
    I_Bags = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    I_GKG = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    I_NKG = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    Cond_I = models.CharField(max_length=5, blank=True, null=True)

    Fillers = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)

    B_Bags = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    B_GKG = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    B_NKG = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)

    # Signatories
    Assist_BM = models.CharField(max_length=50, blank=True, null=True)
    Account_II = models.CharField(max_length=50, blank=True, null=True)
    Branch_M = models.CharField(max_length=50, blank=True, null=True)

    @property
    def user_full_name(self):
        return self.name.full_name if self.name else '-'

    @property
    def user_WHCode(self):
        return self.name.WHCode if self.name else '-'

    def __str__(self):
        return f"Report #{self.report_id} - {self.CerealType} ({self.Date})"


# ── WSR (Warehouse Stock Receipt) ─────────────────────────
class WSR(models.Model):
    EVALUATION_CHOICES = [
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
        ('Pending', 'Pending'),
        ('Archive', 'Archive'),
    ]

    Receipt_ID = models.AutoField(primary_key=True)
    Report_id = models.ForeignKey(
        'StockBook',
        on_delete=models.CASCADE,
        related_name='wsr_receipts',
        limit_choices_to={'WSR__isnull': False}    # ✅ WSR not WRS
    )
    Evaluation = models.CharField(
        max_length=20,
        choices=EVALUATION_CHOICES,
        default='Pending'
    )
    Reason = models.TextField(null=True, blank=True)

    @property
    def CerealType(self):
        return self.Report_id.CerealType

    @property
    def Created_at(self):
        return self.Report_id.Date

    @property
    def WSR_WTS(self):
        return self.Report_id.WSR                  # ✅ WSR not WRS

    @property
    def Transaction(self):
        return self.Report_id.Transaction

    @property
    def Cond_R(self):
        return self.Report_id.Cond_R

    @property
    def Name(self):
        return self.Report_id.Particulars

    @property
    def Age(self):
        return self.Report_id.Age

    @property
    def MC(self):
        return self.Report_id.Moisture_Content

    @property
    def Truck_No(self):
        return self.Report_id.Plate_Number

    @property
    def R_Bags(self):
        return self.Report_id.R_Bags

    @property
    def R_GKG(self):
        return self.Report_id.R_GKG

    @property
    def R_NKG(self):
        return self.Report_id.R_NKG

    @property
    def Assist_BM(self):
        return self.Report_id.Assist_BM

    @property
    def Account_II(self):
        return self.Report_id.Account_II

    @property
    def Branch_M(self):
        return self.Report_id.Branch_M

    def __str__(self):
        return f"WSR #{self.Receipt_ID} - {self.Report_id}"


# ── WSI (Warehouse Stock Issue) ────────────────────────────
class WSI(models.Model):
    EVALUATION_CHOICES = [
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
        ('Pending', 'Pending'),
        ('Archive', 'Archive'),
    ]

    Issue_ID = models.AutoField(primary_key=True)
    Report_id = models.ForeignKey(
        'StockBook',
        on_delete=models.CASCADE,
        related_name='wsi_issues',
        limit_choices_to={'WSI__isnull': False}
    )
    Evaluation = models.CharField(
        max_length=20,
        choices=EVALUATION_CHOICES,
        default='Pending'
    )
    Reason = models.TextField(null=True, blank=True)

    @property
    def Cereal_Type(self):
        return self.Report_id.CerealType

    @property
    def Created_at(self):
        return self.Report_id.Date                 # ✅ fixed typo Creataed_at

    @property
    def WSI_number(self):
        return self.Report_id.WSI

    @property
    def WTS(self):
        return self.Report_id.WTS

    @property
    def Name(self):
        return self.Report_id.Particulars

    @property
    def Cond_I(self):
        return self.Report_id.Cond_I

    @property
    def Transaction(self):
        return self.Report_id.Transaction

    @property
    def OR_BL_WSR_no(self):
        return self.Report_id.OR_Number

    @property
    def Age(self):
        return self.Report_id.Age

    @property
    def MC(self):
        return self.Report_id.Moisture_Content

    @property
    def Truck_No(self):
        return self.Report_id.Plate_Number

    @property
    def I_Bags(self):
        return self.Report_id.I_Bags

    @property
    def I_NKG(self):
        return self.Report_id.I_NKG

    @property
    def I_GKG(self):
        return self.Report_id.I_GKG

    @property
    def Assist_BM(self):
        return self.Report_id.Assist_BM

    @property
    def Account_II(self):
        return self.Report_id.Account_II

    @property
    def Branch_M(self):
        return self.Report_id.Branch_M

    def __str__(self):
        return f"WSI #{self.Issue_ID} - {self.Report_id}"


# ── Summary ────────────────────────────────────────────────
class Summary(models.Model):
    Summary_id = models.AutoField(primary_key=True)

    WSR = models.ForeignKey(
        'WSR',
        on_delete=models.SET_NULL,
        related_name='summaries',
        null=True, blank=True
    )
    WSI = models.ForeignKey(
        'WSI',
        on_delete=models.SET_NULL,
        related_name='summaries',
        null=True, blank=True
    )

    E_Bags = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    E_NKG = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    # ── All properties through WSR or WSI → StockBook ─────

    @property
    def Name(self):
        if self.WSR:
            return self.WSR.Report_id.name.full_name if self.WSR.Report_id.name else '-'
        elif self.WSI:
            return self.WSI.Report_id.name.full_name if self.WSI.Report_id.name else '-'
        return '-'

    @property
    def WHCode(self):
        if self.WSR:
            return self.WSR.Report_id.name.WHCode if self.WSR.Report_id.name else '-'
        elif self.WSI:
            return self.WSI.Report_id.name.WHCode if self.WSI.Report_id.name else '-'
        return '-'

    @property
    def Condition(self):
        if self.WSR:
            return self.WSR.Report_id.Cond_R or '-'
        elif self.WSI:
            return self.WSI.Report_id.Cond_I or '-'
        return '-'

    @property
    def Date(self):
        if self.WSR:
            return self.WSR.Report_id.Date
        elif self.WSI:
            return self.WSI.Report_id.Date
        return '-'

    @property
    def Cereal_Type(self):
        if self.WSR:
            return self.WSR.Report_id.CerealType
        elif self.WSI:
            return self.WSI.Report_id.CerealType
        return '-'

    @property
    def B_Bags(self):
        if self.WSR:
            return self.WSR.Report_id.B_Bags
        elif self.WSI:
            return self.WSI.Report_id.B_Bags
        return '-'

    @property
    def B_NKG(self):
        if self.WSR:
            return self.WSR.Report_id.B_NKG
        elif self.WSI:
            return self.WSI.Report_id.B_NKG
        return '-'

    @property
    def R_Bags(self):
        return self.WSR.Report_id.R_Bags if self.WSR else '-'

    @property
    def R_NKG(self):
        return self.WSR.Report_id.R_NKG if self.WSR else '-'

    @property
    def I_Bags(self):
        return self.WSI.Report_id.I_Bags if self.WSI else '-'

    @property
    def I_NKG(self):
        return self.WSI.Report_id.I_NKG if self.WSI else '-'

    @property
    def Assist_BM(self):
        if self.WSR:
            return self.WSR.Report_id.Assist_BM
        elif self.WSI:
            return self.WSI.Report_id.Assist_BM
        return '-'

    @property
    def Account_II(self):
        if self.WSR:
            return self.WSR.Report_id.Account_II
        elif self.WSI:
            return self.WSI.Report_id.Account_II
        return '-'

    @property
    def Branch_M(self):
        if self.WSR:
            return self.WSR.Report_id.Branch_M
        elif self.WSI:
            return self.WSI.Report_id.Branch_M
        return '-'

    def __str__(self):
        if self.WSR:
            return f"Summary #{self.Summary_id} - WSR #{self.WSR.Receipt_ID}"
        elif self.WSI:
            return f"Summary #{self.Summary_id} - WSI #{self.WSI.Issue_ID}"
        return f"Summary #{self.Summary_id}"

    @classmethod
    def get_or_create_summary(cls, wsr=None, wsi=None):
        if wsr:
            date = wsr.Report_id.Date
            condition = wsr.Report_id.Cond_R
        elif wsi:
            date = wsi.Report_id.Date
            condition = wsi.Report_id.Cond_I
        else:
            return None

        # ✅ Check BOTH WSR and WSI sides for existing same date + condition
        existing = cls.objects.filter(
            WSR__Report_id__Date=date,
            WSR__Report_id__Cond_R=condition
        ).first()

        if not existing:
            # ✅ Also check from WSI side
            existing = cls.objects.filter(
                WSI__Report_id__Date=date,
                WSI__Report_id__Cond_I=condition
            ).first()

        if existing:
            # ✅ Found same date + condition — merge into existing row
            if wsr:
                existing.WSR = wsr
            if wsi:
                existing.WSI = wsi
            existing.save()
            return existing
        else:
            # ✅ No match — create new row
            return cls.objects.create(
                WSR=wsr if wsr else None,
                WSI=wsi if wsi else None,
            )