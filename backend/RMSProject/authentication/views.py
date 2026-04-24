from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import LoginSerializer
from rest_framework_simplejwt.tokens import RefreshToken


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