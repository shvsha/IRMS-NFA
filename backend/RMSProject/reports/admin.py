from django.contrib import admin
from .models import StockBook, Transaction, WSRReport, WSIReport, Summary


@admin.register(StockBook)
class StockBookAdmin(admin.ModelAdmin):
    list_display = ['report_id', 'CerealType', 'Status', 'Date']


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ['transaction_id', 'stockbook', 'type']


@admin.register(WSRReport)
class WSRReportAdmin(admin.ModelAdmin):
    list_display = ['wsr_report_id', 'stockbook', 'Evaluation']


@admin.register(WSIReport)
class WSIReportAdmin(admin.ModelAdmin):
    list_display = ['wsi_report_id', 'stockbook', 'Evaluation']


@admin.register(Summary)
class SummaryAdmin(admin.ModelAdmin):
    list_display = ['summary_id', 'get_stockbooks', 'CerealType', 'date_covered']

    def get_stockbooks(self, obj):
        return ', '.join([f"Report #{sb.report_id}" for sb in obj.stockbooks.all()])
    get_stockbooks.short_description = 'Stockbooks'