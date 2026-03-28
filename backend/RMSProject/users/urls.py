from django.urls import path
from .views import get_user, create_user, upd_user

urlpatterns = [
    path('users/', get_user, name='get_user'),
    path('users/create/', create_user, name='create_user'),
    path('users/upd/<int:pk>', upd_user, name='upd_user'),
]