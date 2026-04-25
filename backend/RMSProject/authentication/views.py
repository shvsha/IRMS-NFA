from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import LoginSerializer
from rest_framework_simplejwt.tokens import RefreshToken

from django.core.mail import send_mail
from django.conf import settings
import random
from users.models import User, PasswordResetCode
from django.contrib.auth.hashers import make_password

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']

            refresh = RefreshToken()
            refresh['user_id'] = user.user_id
            refresh['user_level'] = user.user_level

            return Response({
                "access":  str(refresh.access_token),
                "refresh": str(refresh),
                "user": {
                    "id": user.user_id,
                    "username": user.username,
                    "user_level": user.user_level,
                    "fname": user.fname,
                    "lname": user.lname,
                    "WHCode":     user.WHCode,
                    "Office_id":  user.Office_id, 
                    "dept":       user.dept,
                    "position":   user.position,
                }
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()  # invalidate the refresh token
            return Response({"message": "Logged out successfully."})
        except Exception:
            return Response({"error": "Invalid token."}, status=status.HTTP_400_BAD_REQUEST)
        
# change password
class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'email': 'No account found with this email address.'}, status=status.HTTP_404_NOT_FOUND)

        # generate 6 digit code
        code = str(random.randint(100000, 999999))

        # save to db
        PasswordResetCode.objects.create(user=user, code=code)

        # send email
        send_mail(
            subject='Password Reset Code',
            message=f'Your password reset code is: {code}. It expires in 10 minutes.',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
        )

        return Response({'message': 'Code sent to email.'}, status=status.HTTP_200_OK)


class VerifyResetCodeView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        code = request.data.get('code')

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        reset = PasswordResetCode.objects.filter(user=user, code=code, is_used=False).last()

        if not reset or reset.is_expired():
            return Response({'code': 'That code is incorrect. Please try again.'}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'message': 'Code verified.'}, status=status.HTTP_200_OK)


class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        code = request.data.get('code')
        new_password = request.data.get('password')

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        reset = PasswordResetCode.objects.filter(user=user, code=code, is_used=False).last()

        if not reset or reset.is_expired():
            return Response({'error': 'Invalid or expired code.'}, status=status.HTTP_400_BAD_REQUEST)

        user.password = make_password(new_password)
        user.save()

        reset.is_used = True
        reset.save()

        return Response({'message': 'Password reset successful.'}, status=status.HTTP_200_OK)