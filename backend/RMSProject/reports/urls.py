from django.urls import path
from .views import (
    get_stock, create_stock, upd_stock, submit_stock,
    get_transactions, create_transaction, upd_transaction,
    get_wsr_reports, upd_wsr_report,
    get_wsi_reports, upd_wsi_report,
    get_summary, create_summary, upd_summary,
    unsubmit_stock
)

urlpatterns = [
    # StockBook 
    path('stocks/',                    get_stock,       name='get_stock'),
    path('stocks/create/',             create_stock,    name='create_stock'),  
    path('stocks/submit/<int:pk>/',    submit_stock,    name='submit_stock'),   
    path('stocks/unsubmit/<int:pk>/',  unsubmit_stock,  name='unsubmit_stock'), 
    path('stocks/upd/<int:pk>/',       upd_stock,       name='upd_stock'), 

    # Transactions 
    path('transactions/',              get_transactions,   name='get_transactions'),
    path('transactions/create/',       create_transaction, name='create_transaction'),
    path('transactions/upd/<int:pk>/', upd_transaction,    name='upd_transaction'),

    # WSR
    path('wsr-reports/',               get_wsr_reports,  name='get_wsr_reports'),
    path('wsr-reports/upd/<int:pk>/',  upd_wsr_report,   name='upd_wsr_report'),

    # WSI
    path('wsi-reports/',               get_wsi_reports,  name='get_wsi_reports'),
    path('wsi-reports/upd/<int:pk>/',  upd_wsi_report,   name='upd_wsi_report'),

    # Summary
    path('summary/',                   get_summary,    name='get_summary'),
    path('summary/create/',            create_summary, name='create_summary'),
    path('summary/upd/<int:pk>/',      upd_summary,    name='upd_summary'),
]