from rest_framework import serializers
from .models import StockBook, Transaction, WSRReport, WSIReport, Summary

class TransactionSerializer(serializers.ModelSerializer):
    user_full_name = serializers.ReadOnlyField()
    user_WHCode    = serializers.ReadOnlyField()
    Assist_BM      = serializers.ReadOnlyField()
    Account_II     = serializers.ReadOnlyField()
    Branch_M       = serializers.ReadOnlyField()

    class Meta:
        model  = Transaction
        fields = '__all__'

class WSRReportSerializer(serializers.ModelSerializer):
    transactions  = TransactionSerializer(many=True, read_only=True)
    stockbook_date    = serializers.DateField(source='stockbook.Date', read_only=True)
    stockbook_cereal  = serializers.CharField(source='stockbook.CerealType', read_only=True)

    class Meta:
        model  = WSRReport
        fields = '__all__'

class WSIReportSerializer(serializers.ModelSerializer):
    transactions  = TransactionSerializer(many=True, read_only=True)
    stockbook_date    = serializers.DateField(source='stockbook.Date', read_only=True)
    stockbook_cereal  = serializers.CharField(source='stockbook.CerealType', read_only=True)

    class Meta:
        model  = WSIReport
        fields = '__all__'

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
    Assist_BM     = serializers.ReadOnlyField()
    Account_II    = serializers.ReadOnlyField()
    Branch_M      = serializers.ReadOnlyField()
    Name          = serializers.ReadOnlyField()
    WHCode        = serializers.ReadOnlyField()

    class Meta:
        model  = Summary
        fields = '__all__'