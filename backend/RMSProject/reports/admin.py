from django.contrib import admin
from .models import StockBook, WSR, WSI, Summary


# ── StockBook Admin ────────────────────────────────────────
@admin.register(StockBook)
class StockBookAdmin(admin.ModelAdmin):
    list_display = [
        'report_id', 'get_name', 'get_whcode',
        'CerealType', 'Status', 'Date', 'Transaction'
    ]
    search_fields = ['CerealType', 'Status', 'Transaction']
    list_filter = ['Status', 'CerealType']

    def get_name(self, obj):
        return obj.name.full_name if obj.name else '-'
    get_name.short_description = 'Name'

    def get_whcode(self, obj):
        return obj.name.WHCode if obj.name else '-'
    get_whcode.short_description = 'WH Code'

    def save_model(self, request, obj, form, change):
        # ✅ Save StockBook first
        super(StockBookAdmin, self).save_model(request, obj, form, change)

        # ✅ Auto-create WSR if WSR number is filled
        if obj.WSR:
            wsr_exists = WSR.objects.filter(Report_id=obj).exists()
            if not wsr_exists:                          # ← only create if not already exists
                wsr = WSR.objects.create(
                    Report_id=obj,
                    Evaluation='Pending'
                )
                # ✅ Auto-create or merge Summary for WSR
                Summary.get_or_create_summary(wsr=wsr)

        # ✅ Auto-create WSI if WSI number is filled
        if obj.WSI:
            wsi_exists = WSI.objects.filter(Report_id=obj).exists()
            if not wsi_exists:                          # ← only create if not already exists
                wsi = WSI.objects.create(
                    Report_id=obj,
                    Evaluation='Pending'
                )
                # ✅ Auto-create or merge Summary for WSI
                Summary.get_or_create_summary(wsi=wsi)


# ── WRS Admin ──────────────────────────────────────────────
@admin.register(WSR)
class WSRAdmin(admin.ModelAdmin):
    list_display = [
        'Receipt_ID', 'get_report_id', 'get_cereal_type',
        'get_transaction', 'get_name', 'get_age', 'get_mc',
        'get_truck_no', 'get_cond_r', 'get_r_bags', 'get_r_gkg',
        'get_r_nkg', 'get_assist_bm', 'get_account_ii',
        'Evaluation', 'get_date',
    ]
    search_fields = ['Evaluation', 'Reason']
    list_filter = ['Evaluation']

    def get_report_id(self, obj):
        return obj.Report_id
    get_report_id.short_description = 'Report'

    def get_cereal_type(self, obj):
        return obj.Report_id.CerealType
    get_cereal_type.short_description = 'Cereal Type'

    def get_transaction(self, obj):
        return obj.Report_id.Transaction
    get_transaction.short_description = 'Transaction'

    def get_name(self, obj):
        return obj.Report_id.Particulars
    get_name.short_description = 'From Whom Received'

    def get_age(self, obj):
        return obj.Report_id.Age
    get_age.short_description = 'Age'

    def get_mc(self, obj):
        return obj.Report_id.Moisture_Content
    get_mc.short_description = 'MC'

    def get_truck_no(self, obj):
        return obj.Report_id.Plate_Number
    get_truck_no.short_description = 'Truck No'

    def get_cond_r(self, obj):
        return obj.Report_id.Cond_R
    get_cond_r.short_description = 'Condition'

    def get_r_bags(self, obj):
        return obj.Report_id.R_Bags
    get_r_bags.short_description = 'R_Bags'

    def get_r_gkg(self, obj):
        return obj.Report_id.R_GKG
    get_r_gkg.short_description = 'R_GKG'

    def get_r_nkg(self, obj):
        return obj.Report_id.R_NKG
    get_r_nkg.short_description = 'R_NKG'

    def get_assist_bm(self, obj):
        return obj.Report_id.Assist_BM
    get_assist_bm.short_description = 'Assist BM'

    def get_account_ii(self, obj):
        return obj.Report_id.Account_II
    get_account_ii.short_description = 'Account II'

    def get_date(self, obj):
        return obj.Report_id.Date
    get_date.short_description = 'Date'


# ── WSI Admin ──────────────────────────────────────────────
@admin.register(WSI)
class WSIAdmin(admin.ModelAdmin):
    list_display = [
        'Issue_ID', 'get_report_id', 'get_cereal_type',
        'get_wsi_number', 'get_wts', 'get_transaction',
        'get_name', 'get_or_bl_wsr', 'get_age', 'get_mc',
        'get_cond_i', 'get_truck_no', 'get_i_bags', 'get_i_nkg',
        'get_i_gkg', 'get_assist_bm', 'get_account_ii',
        'get_branch_m', 'Evaluation', 'get_date',
    ]
    search_fields = ['Evaluation', 'Reason']
    list_filter = ['Evaluation']

    def get_report_id(self, obj):
        return obj.Report_id
    get_report_id.short_description = 'Report'

    def get_cereal_type(self, obj):
        return obj.Report_id.CerealType
    get_cereal_type.short_description = 'Cereal Type'

    def get_wsi_number(self, obj):
        return obj.Report_id.WSI
    get_wsi_number.short_description = 'WSI No'

    def get_wts(self, obj):
        return obj.Report_id.WTS
    get_wts.short_description = 'WTS'

    def get_transaction(self, obj):
        return obj.Report_id.Transaction
    get_transaction.short_description = 'Transaction'

    def get_name(self, obj):
        return obj.Report_id.Particulars
    get_name.short_description = 'Issued To'

    def get_or_bl_wsr(self, obj):
        return obj.Report_id.OR_Number
    get_or_bl_wsr.short_description = 'OR/BL/WSR No'

    def get_age(self, obj):
        return obj.Report_id.Age
    get_age.short_description = 'Age'

    def get_mc(self, obj):
        return obj.Report_id.Moisture_Content
    get_mc.short_description = 'MC'

    def get_cond_i(self, obj):
        return obj.Report_id.Cond_I
    get_cond_i.short_description = 'Condition'

    def get_truck_no(self, obj):
        return obj.Report_id.Plate_Number
    get_truck_no.short_description = 'Truck No'

    def get_i_bags(self, obj):
        return obj.Report_id.I_Bags
    get_i_bags.short_description = 'I_Bags'

    def get_i_nkg(self, obj):
        return obj.Report_id.I_NKG
    get_i_nkg.short_description = 'I_NKG'

    def get_i_gkg(self, obj):
        return obj.Report_id.I_GKG
    get_i_gkg.short_description = 'I_GKG'

    def get_assist_bm(self, obj):
        return obj.Report_id.Assist_BM
    get_assist_bm.short_description = 'Assist BM'

    def get_account_ii(self, obj):
        return obj.Report_id.Account_II
    get_account_ii.short_description = 'Account II'

    def get_branch_m(self, obj):
        return obj.Report_id.Branch_M
    get_branch_m.short_description = 'Branch Manager'

    def get_date(self, obj):
        return obj.Report_id.Date
    get_date.short_description = 'Date'


# ── Summary Admin ──────────────────────────────────────────
@admin.register(Summary)
class SummaryAdmin(admin.ModelAdmin):
    list_display = [
        'Summary_id',  'get_name',
        'get_whcode', 'get_cereal_type', 'get_date',
        'get_condition', 'get_wrs', 'get_wsi',
        'get_b_bags', 'get_b_nkg', 'get_r_bags',
        'get_r_nkg', 'get_i_bags', 'get_i_nkg',
        'E_Bags', 'E_NKG',
        'get_assist_bm', 'get_account_ii', 'get_branch_m',
    ]
    fields = ['WSR', 'WSI', 'E_Bags', 'E_NKG']

    def save_model(self, request, obj, form, change):
        # Auto-set Report_id from WRS or WSI
        if obj.WSR:
            obj.Report_id = obj.WSR.Report_id
        elif obj.WSI:
            obj.Report_id = obj.WSI.Report_id
        super().save_model(request, obj, form, change)


    def get_name(self, obj):
        # ✅ Through WRS or WSI, not Report_id
        if obj.WSR:
            return obj.WSR.Report_id.name.full_name if obj.WSR.Report_id.name else '-'
        elif obj.WSI:
            return obj.WSI.Report_id.name.full_name if obj.WSI.Report_id.name else '-'
        return '-'
    get_name.short_description = 'Name'

    def get_whcode(self, obj):
        if obj.WSR:
            return obj.WSR.Report_id.name.WHCode if obj.WSR.Report_id.name else '-'
        elif obj.WSI:
            return obj.WSI.Report_id.name.WHCode if obj.WSI.Report_id.name else '-'
        return '-'
    get_whcode.short_description = 'WH Code'

    def get_cereal_type(self, obj):
        if obj.WSR:
            return obj.WSR.Report_id.CerealType or '-'
        elif obj.WSI:
            return obj.WSI.Report_id.CerealType or '-'
        return '-'
    get_cereal_type.short_description = 'Cereal Type'

    def get_date(self, obj):
        if obj.WSR:
            return obj.WSR.Report_id.Date or '-'
        elif obj.WSI:
            return obj.WSI.Report_id.Date or '-'
        return '-'
    get_date.short_description = 'Date'

    def get_condition(self, obj):
        if obj.WSR:
            return obj.WSR.Report_id.Cond_R or '-'
        elif obj.WSI:
            return obj.WSI.Report_id.Cond_I or '-'
        return '-'
    get_condition.short_description = 'Condition'

    def get_b_bags(self, obj):
        if obj.WSR:
            return obj.WSR.Report_id.B_Bags or '-'
        elif obj.WSI:
            return obj.WSI.Report_id.B_Bags or '-'
        return '-'
    get_b_bags.short_description = 'B_Bags'

    def get_b_nkg(self, obj):
        if obj.WSR:
            return obj.WSR.Report_id.B_NKG or '-'
        elif obj.WSI:
            return obj.WSI.Report_id.B_NKG or '-'
        return '-'
    get_b_nkg.short_description = 'B_NKG'

    def get_r_bags(self, obj):
        return obj.WSR.Report_id.R_Bags if obj.WSR else '-'
    get_r_bags.short_description = 'R_Bags'

    def get_r_nkg(self, obj):
        return obj.WSR.Report_id.R_NKG if obj.WSR else '-'
    get_r_nkg.short_description = 'R_NKG'

    def get_i_bags(self, obj):
        return obj.WSI.Report_id.I_Bags if obj.WSI else '-'
    get_i_bags.short_description = 'I_Bags'

    def get_i_nkg(self, obj):
        return obj.WSI.Report_id.I_NKG if obj.WSI else '-'
    get_i_nkg.short_description = 'I_NKG'

    def get_assist_bm(self, obj):
        if obj.WSR:
            return obj.WSR.Report_id.Assist_BM or '-'
        elif obj.WSI:
            return obj.WSI.Report_id.Assist_BM or '-'
        return '-'
    get_assist_bm.short_description = 'Assist BM'

    def get_account_ii(self, obj):
        if obj.WSR:
            return obj.WSR.Report_id.Account_II or '-'
        elif obj.WSI:
            return obj.WSI.Report_id.Account_II or '-'
        return '-'
    get_account_ii.short_description = 'Account II'

    def get_branch_m(self, obj):
        if obj.WSR:
            return obj.WSR.Report_id.Branch_M or '-'
        elif obj.WSI:
            return obj.WSI.Report_id.Branch_M or '-'
        return '-'
    get_branch_m.short_description = 'Branch Manager'

    def get_report_id(self, obj):
        if obj.WSR:
            return obj.WSR.Report_id
        elif obj.WSI:
            return obj.WSI.Report_id
        return '-'
    get_report_id.short_description = 'Report'

    # ── Single condition column ────────────────────────────
    def get_condition(self, obj):
        try:
            if obj.WSR:
                return obj.WSR.Report_id.Cond_R or '-'   # ← go directly to StockBook
            elif obj.WSI:
                return obj.WSI.Report_id.Cond_I or '-'   # ← go directly to StockBook
        except Exception:
            return '-'
        return '-'
    get_condition.short_description = 'Condition'

    # ── Shows which WRS is linked ──────────────────────────
    def get_wrs(self, obj):
        return f"WSR #{obj.WSR.Receipt_ID}" if obj.WSR else '-'
    get_wrs.short_description = 'WRS'

    # ── Shows which WSI is linked ──────────────────────────
    def get_wsi(self, obj):
        return f"WSI #{obj.WSI.Issue_ID}" if obj.WSI else '-'
    get_wsi.short_description = 'WSI'


    # ── Auto-create summary on save ────────────────────────
    def save_model(self, request, obj, form, change):
        if not change:  # only on CREATE, not edit
            # ✅ Check if a row already exists with same WRS or WSI
            existing = None

            if obj.WSR and obj.WSI:
                # Both selected — find row that has either one
                existing = Summary.objects.filter(
                    WSR=obj.WSR
                ).first() or Summary.objects.filter(
                    WSI=obj.WSI
                ).first()

            elif obj.WSR:
                existing = Summary.objects.filter(WSR=obj.WSR).first()

            elif obj.WSI:
                existing = Summary.objects.filter(WSI=obj.WSI).first()

            if existing:
                # ✅ Row exists — update it instead of creating new
                if obj.WSR:
                    existing.WSR = obj.WSR
                if obj.WSI:
                    existing.WSI = obj.WSI
                if obj.E_Bags:
                    existing.E_Bags = obj.E_Bags
                if obj.E_NKG:
                    existing.E_NKG = obj.E_NKG
                existing.save()
                return  # ← don't create a new row

        super(SummaryAdmin, self).save_model(request, obj, form, change)