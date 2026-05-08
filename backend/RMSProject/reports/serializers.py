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

class WSRReportSerializer(serializers.ModelSerializer):
    transactions  = TransactionSerializer(many=True, read_only=True)
    stockbook_date    = serializers.DateField(source='stockbook.Date', read_only=True)
    stockbook_cereal  = serializers.CharField(source='stockbook.CerealType', read_only=True)
    asst_bm_name      = serializers.CharField(source='stockbook.Assist_BM.full_name', read_only=True, default='—')
    accountant_name   = serializers.CharField(source='stockbook.Account_II.full_name', read_only=True, default='—')
    branch_m_name     = serializers.CharField(source='stockbook.Branch_M.full_name', read_only=True, default='—')

    debug_signatories = serializers.SerializerMethodField()

    def get_debug_signatories(self, obj):
        return {
            'assist_bm_id':   obj.stockbook.Assist_BM_id,
            'account_ii_id':  obj.stockbook.Account_II_id,
            'branch_m_id':    obj.stockbook.Branch_M_id,
    }

    class Meta:
        model  = WSRReport
        fields = '__all__'

class WSIReportSerializer(serializers.ModelSerializer):
    transactions  = TransactionSerializer(many=True, read_only=True)
    stockbook_date    = serializers.DateField(source='stockbook.Date', read_only=True)
    stockbook_cereal  = serializers.CharField(source='stockbook.CerealType', read_only=True)
    asst_bm_name      = serializers.CharField(source='stockbook.Assist_BM.full_name', read_only=True, default='—')
    accountant_name   = serializers.CharField(source='stockbook.Account_II.full_name', read_only=True, default='—')
    branch_m_name     = serializers.CharField(source='stockbook.Branch_M.full_name', read_only=True, default='—')

    class Meta:
        model  = WSIReport
        fields = '__all__'

class StockBookListSerializer(serializers.ModelSerializer):
    """For listing — no nested data"""
    class Meta:
        model  = StockBook
        fields = ['report_id', 'CerealType', 'Status', 'Date', 'B_Bags', 'B_GKG', 'B_NKG']

class StockBookSerializer(serializers.ModelSerializer):
    transactions = TransactionSerializer(many=True, read_only=True)
    wsr_report   = WSRReportSerializer(read_only=True)
    wsi_report   = WSIReportSerializer(read_only=True)

    class Meta:
        model  = StockBook
        fields = '__all__'

class SummarySerializer(serializers.ModelSerializer):
    ending_B_Bags = serializers.ReadOnlyField()
    ending_B_NKG  = serializers.ReadOnlyField()
    Assist_BM     = serializers.SerializerMethodField()
    Account_II    = serializers.SerializerMethodField()
    Branch_M      = serializers.SerializerMethodField()
    Name          = serializers.ReadOnlyField()
    WHCode        = serializers.ReadOnlyField()

    def get_Assist_BM(self, obj):
        try:
            return obj.stockbook.Assist_BM.full_name if obj.stockbook.Assist_BM else '—'
        except Exception:
            return '—'

    def get_Account_II(self, obj):
        try:
            return obj.stockbook.Account_II.full_name if obj.stockbook.Account_II else '—'
        except Exception:
            return '—'

    def get_Branch_M(self, obj):
        try:
            return obj.stockbook.Branch_M.full_name if obj.stockbook.Branch_M else '—'
        except Exception:
            return '—'

    class Meta:
        model  = Summary
        fields = '__all__'