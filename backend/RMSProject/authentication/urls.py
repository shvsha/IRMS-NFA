from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import LoginView, LogoutView, ForgotPasswordView, VerifyResetCodeView, ResetPasswordView

urlpatterns = [
    path('login/', LoginView.as_view()),
    path('logout/', LogoutView.as_view()),
    path('token/refresh/', TokenRefreshView.as_view()),
    path('forgot-password/', ForgotPasswordView.as_view()),
    path('verify-code/', VerifyResetCodeView.as_view()),
    path('reset-password/', ResetPasswordView.as_view()),
]