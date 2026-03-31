from django.urls import path
from .views import get_stock, create_stock, upd_stock, get_wsr, create_wsr, upd_wsr, get_wsi, create_wsi, upd_wsi, get_summary, create_summary, upd_summary

urlpatterns = [
    path('stocks/', get_stock, name='get_stock'),
    path('stocks/create/', create_stock, name='create_stock'),
    path('stocks/upd/<int:pk>', upd_stock, name='upd_stock'),

    path('wsr/', get_wsr, name='get_wsr'),
    path('wsr/create/', create_wsr, name='create_wsr'),
    path('wsr/upd/<int:pk>', upd_wsr, name='upd_wsr'),

    path('wsi/', get_wsi, name='get_wsi'),
    path('wsi/create/', create_wsi, name='create_wsi'),
    path('wsi/upd/<int:pk>', upd_wsi, name='upd_wsi'),

    path('summary/', get_summary, name='get_summary'),
    path('summary/create/', create_summary, name='create_sumary'),
    path('summary/upd/<int:pk>', upd_summary, name='upd_summary'),
]