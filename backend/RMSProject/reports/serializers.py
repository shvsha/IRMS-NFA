from rest_framework import serializers
from .models import StockBook, Transaction, WSRReport, WSIReport, Summary

class TransactionSerializer(serializers.ModelSerializer):
    user_full_name = serializers.ReadOnlyField()
    user_WHCode    = serializers.ReadOnlyField()
    Assist_BM      = serializers.SerializerMethodField(read_only=True)
    Account_II     = serializers.SerializerMethodField(read_only=True)
    Branch_M       = serializers.SerializerMethodField(read_only=True)

    def get_Assist_BM(self, obj):
        try:
            return obj.Assist_BM.pk if obj.Assist_BM else None
        except Exception:
            return None

    def get_Account_II(self, obj):
        try:
            return obj.Account_II.pk if obj.Account_II else None
        except Exception:
            return None

    def get_Branch_M(self, obj):
        try:
            return obj.Branch_M.pk if obj.Branch_M else None
        except Exception:
            return None

    class Meta:
        model  = Transaction
        fields = '__all__'
        read_only_fields = [
            'user_full_name', 'user_WHCode',
            'Assist_BM', 'Account_II', 'Branch_M',
            'wsr_report', 'wsi_report',
        ]


class WSRReportGroupedSerializer(serializers.ModelSerializer):
    transactions      = TransactionSerializer(many=True, read_only=True)
    stockbook_date    = serializers.DateField(source='stockbook.Date', read_only=True)
    stockbook_cereal  = serializers.SerializerMethodField()
    asst_bm_name      = serializers.CharField(source='stockbook.Assist_BM.full_name', read_only=True, default='—')
    accountant_name   = serializers.CharField(source='stockbook.Account_II.full_name', read_only=True, default='—')
    branch_m_name     = serializers.CharField(source='stockbook.Branch_M.full_name', read_only=True, default='—')
    user_full_name    = serializers.CharField(source='stockbook.user_full_name', read_only=True)
    user_WHCode       = serializers.CharField(source='stockbook.user_WHCode', read_only=True)
    warehouse         = serializers.SerializerMethodField()

    def get_stockbook_cereal(self, obj):
        cereals = list(
            obj.stockbooks.exclude(CerealType=None)
            .values_list('CerealType', flat=True)
            .distinct()
        )
        if not cereals:
            return obj.stockbook.CerealType if obj.stockbook else '—'
        if len(cereals) == 1:
            return cereals[0]
        return 'Mixed Cereal'

    def get_warehouse(self, obj):
        txn = obj.transactions.first()
        if txn and txn.user_WHCode:
            return txn.user_WHCode
        if obj.stockbook and obj.stockbook.user_WHCode:
            return obj.stockbook.user_WHCode
        sb = obj.stockbooks.first()
        return sb.user_WHCode if sb else None

    class Meta:
        model  = WSRReport
        fields = '__all__'


class WSIReportGroupedSerializer(serializers.ModelSerializer):
    transactions      = TransactionSerializer(many=True, read_only=True)
    stockbook_date    = serializers.DateField(source='stockbook.Date', read_only=True)
    stockbook_cereal  = serializers.SerializerMethodField()
    asst_bm_name      = serializers.CharField(source='stockbook.Assist_BM.full_name', read_only=True, default='—')
    accountant_name   = serializers.CharField(source='stockbook.Account_II.full_name', read_only=True, default='—')
    branch_m_name     = serializers.CharField(source='stockbook.Branch_M.full_name', read_only=True, default='—')
    user_full_name    = serializers.CharField(source='stockbook.user_full_name', read_only=True)
    user_WHCode       = serializers.CharField(source='stockbook.user_WHCode', read_only=True)
    warehouse         = serializers.SerializerMethodField()

    def get_stockbook_cereal(self, obj):
        cereals = list(
            obj.stockbooks.exclude(CerealType=None)
            .values_list('CerealType', flat=True)
            .distinct()
        )
        if not cereals:
            return obj.stockbook.CerealType if obj.stockbook else '—'
        if len(cereals) == 1:
            return cereals[0]
        return ', '.join(cereals)

    def get_warehouse(self, obj):
        txn = obj.transactions.first()
        if txn and txn.user_WHCode:
            return txn.user_WHCode
        if obj.stockbook and obj.stockbook.user_WHCode:
            return obj.stockbook.user_WHCode
        sb = obj.stockbooks.first()
        return sb.user_WHCode if sb else None

    class Meta:
        model  = WSIReport
        fields = '__all__'


class StockBookListSerializer(serializers.ModelSerializer):
    user_WHCode    = serializers.ReadOnlyField()
    user_full_name = serializers.ReadOnlyField()

    class Meta:
        model  = StockBook
        fields = ['report_id', 'CerealType', 'Status', 'Date', 'B_Bags', 'B_GKG', 'B_NKG', 'user_WHCode', 'user_full_name']


class StockBookSerializer(serializers.ModelSerializer):
    transactions = TransactionSerializer(many=True, read_only=True)

    class Meta:
        model  = StockBook
        fields = '__all__'


class SummarySerializer(serializers.ModelSerializer):
    ending_B_Bags = serializers.SerializerMethodField()
    ending_B_NKG  = serializers.SerializerMethodField()
    stockbook     = serializers.SerializerMethodField()
    Assist_BM     = serializers.SerializerMethodField()
    Account_II    = serializers.SerializerMethodField()
    Branch_M      = serializers.SerializerMethodField()
    Name          = serializers.SerializerMethodField()
    WHCode        = serializers.SerializerMethodField()
    rows = serializers.SerializerMethodField()

    def get_rows(self, obj):
        from reports.models import WSRReport, WSIReport

        stockbooks = list(obj.stockbooks.filter(
            Status__in=['Completed', 'Archived']
        ).order_by('Date', 'report_id'))

        if not stockbooks:
            return []

        running_begin_bags = float(obj.prev_B_Bags or 0)
        running_begin_nkg  = float(obj.prev_B_NKG  or 0)

        result = []
        for stockbook in stockbooks:
            total_R_Bags = total_R_NKG = total_I_Bags = total_I_NKG = 0
            condition = ''

            # Match by BOTH date AND cereal type
            wsr_report = WSRReport.objects.filter(
                date_covered=stockbook.Date,
                Evaluation__in=['Approved', 'Archive']
            ).order_by('-wsr_report_id').first()

            wsi_report = WSIReport.objects.filter(
                date_covered=stockbook.Date,
                Evaluation__in=['Approved', 'Archive']
            ).order_by('-wsi_report_id').first()

            if wsr_report:
                for t in wsr_report.transactions.filter(
                    type__in=['WSR', 'WTS'], stockbook=stockbook
                ):
                    total_R_Bags += float(t.R_Bags or 0)
                    total_R_NKG  += float(t.R_NKG  or 0)
                    if t.Cond_R:
                        condition = t.Cond_R

            if wsi_report:
                for t in wsi_report.transactions.filter(
                    type__in=['WSI', 'WTS'], stockbook=stockbook
                ):
                    total_I_Bags += float(t.I_Bags or 0)
                    total_I_NKG  += float(t.I_NKG  or 0)
                    if t.Cond_I:
                        condition = t.Cond_I

            end_bags = running_begin_bags + total_R_Bags - total_I_Bags
            end_nkg  = running_begin_nkg  + total_R_NKG  - total_I_NKG

            result.append({
                'stockbook_id': stockbook.report_id,
                'cerealType':   stockbook.CerealType or '—',
                'condition':    condition,
                'beginBags':    running_begin_bags,
                'beginNkg':     running_begin_nkg,
                'R_Bags':       total_R_Bags,
                'R_NKG':        total_R_NKG,
                'I_Bags':       total_I_Bags,
                'I_NKG':        total_I_NKG,
                'endBags':      end_bags,
                'endNkg':       end_nkg,
            })

            running_begin_bags = end_bags
            running_begin_nkg  = end_nkg

        return result

    class Meta:
        model  = Summary
        fields = [
            'summary_id', 'date_covered', 'CerealType',
            'stockbooks',
            'prev_B_Bags', 'prev_B_NKG',
            'total_R_Bags', 'total_R_NKG',
            'total_I_Bags', 'total_I_NKG',
            'Condition',
            'ending_B_Bags', 'ending_B_NKG',
            'Assist_BM', 'Account_II', 'Branch_M', 'Name', 'WHCode',
            'stockbook',
            'rows'
        ]

    def get_ending_B_Bags(self, obj):
        return obj.ending_B_Bags

    def get_ending_B_NKG(self, obj):
        return obj.ending_B_NKG

    def get_stockbook(self, obj):
        sb = obj._primary_stockbook()
        return sb.report_id if sb else None

    def get_Assist_BM(self, obj):
        sb = obj._primary_stockbook()
        if not sb or not sb.Assist_BM: return '—'
        return sb.Assist_BM.full_name

    def get_Account_II(self, obj):
        sb = obj._primary_stockbook()
        if not sb or not sb.Account_II: return '—'
        return sb.Account_II.full_name

    def get_Branch_M(self, obj):
        sb = obj._primary_stockbook()
        if not sb or not sb.Branch_M: return '—'
        return sb.Branch_M.full_name

    def get_Name(self, obj):
        return obj.Name

    def get_WHCode(self, obj):
        return obj.WHCode