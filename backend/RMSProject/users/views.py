from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny

from .models import User
from .serializers import UserSerializer, SignatorySerializer
from audit.models import AuditLog

SIGNATORY_LEVEL = 'Signatory'

def get_user_from_token(request):
    from rest_framework_simplejwt.tokens import AccessToken
    try:
        raw     = request.headers.get('Authorization', '').split(' ')[1]
        decoded = AccessToken(raw)
        user_id = decoded.get('user_id')
        if not user_id:
            return None
        return User.objects.get(user_id=user_id)
    except User.DoesNotExist:
        return None
    except Exception:
        return None


def admin_required(request):
    user = get_user_from_token(request)
    if not user:
        return None, Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)
    if user.user_level != 'Admin':
        return None, Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
    return user, None


class CreateAdminView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        if User.objects.filter(user_level='Admin').exists():
            return Response(
                {'error': 'Admin already exists. Use the normal login flow.'},
                status=status.HTTP_403_FORBIDDEN
            )
        data = request.data.copy()
        data['user_level'] = 'Admin'
        serializer = UserSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        _, err = admin_required(request)
        if err:
            return err
        users = User.objects.exclude(user_level='Admin')
        return Response(UserSerializer(users, many=True).data)

    def post(self, request):
        user, err = admin_required(request)  # capture user
        if err:
            return err

        data = request.data.copy()
        if data.get('user_level') == 'Signatory':
            return Response(
                {'error': 'Use /users/signatories/ to create signatory accounts.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = UserSerializer(data=data)
        if serializer.is_valid():
            instance = serializer.save()
            AuditLog.objects.create(
                User_ID = user,
                Module  = 'User Management',
                Action  = f"Created {instance.user_level}: {instance.full_name} ({instance.username})"
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserDetailView(APIView):
    permission_classes = [AllowAny]

    def get_object(self, pk):
        try:
            return User.objects.get(pk=pk)
        except User.DoesNotExist:
            return None

    def put(self, request, pk):
        user, err = admin_required(request)  # capture user
        if err:
            return err

        target = self.get_object(pk)
        if not target:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        if target.is_signatory:
            return Response(
                {'error': 'Use /users/signatories/<pk>/ to edit signatory accounts.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = UserSerializer(target, data=request.data, partial=True)
        if serializer.is_valid():
            instance = serializer.save()
            AuditLog.objects.create(
                User_ID = user,
                Module  = 'User Management',
                Action  = f"Edited User: {instance.full_name} ({instance.username}) - Level: {instance.user_level}, Status: {instance.status}"
            )
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        user, err = admin_required(request)  # capture user
        if err:
            return err

        target = self.get_object(pk)
        if not target:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get('status', 'Inactive')
        target.status = new_status
        target.save()
        AuditLog.objects.create(
            User_ID = user,
            Module  = 'User Management',
            Action  = f"{'Archived' if new_status == 'Inactive' else 'Activated'} User: {target.full_name} ({target.username})"
        )
        return Response({'message': f'User status updated to {new_status}.'})


class SignatoryListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        _, err = admin_required(request)
        if err:
            return err
        signatories = User.objects.filter(user_level='Signatory')
        return Response(SignatorySerializer(signatories, many=True, context={'request': request}).data)

    def post(self, request):
        user, err = admin_required(request)  # capture user
        if err:
            return err

        serializer = SignatorySerializer(data=request.data)
        if serializer.is_valid():
            instance = serializer.save()
            AuditLog.objects.create(
                User_ID = user,
                Module  = 'User Management',
                Action  = f"Created Signatory: {instance.full_name} ({instance.username}) - Role: {instance.signatory_role}"
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SignatoryDetailView(APIView):
    permission_classes = [AllowAny]

    def get_object(self, pk):
        try:
            return User.objects.get(pk=pk, user_level='Signatory')
        except User.DoesNotExist:
            return None

    def get(self, request, pk):
        _, err = admin_required(request)
        if err:
            return err
        target = self.get_object(pk)
        if not target:
            return Response({'error': 'Signatory not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(SignatorySerializer(target).data)

    def put(self, request, pk):
        user, err = admin_required(request)  # capture user
        if err:
            return err

        target = self.get_object(pk)
        if not target:
            return Response({'error': 'Signatory not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = SignatorySerializer(target, data=request.data, partial=True)
        if serializer.is_valid():
            instance = serializer.save()
            AuditLog.objects.create(
                User_ID = user,
                Module  = 'User Management',
                Action  = f"Edited Signatory: {instance.full_name} ({instance.username}) - Role: {instance.signatory_role}, Status: {instance.status}"
            )
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        user, err = admin_required(request)  # capture user
        if err:
            return err

        target = self.get_object(pk)
        if not target:
            return Response({'error': 'Signatory not found.'}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get('status')
        if new_status not in ('Active', 'Inactive'):
            return Response(
                {'error': "status must be 'Active' or 'Inactive'."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if new_status == 'Active':
            conflict = User.objects.filter(
                user_level='Signatory',
                signatory_role=target.signatory_role,
                status='Active'
            ).exclude(pk=pk).first()

            if conflict:
                return Response(
                    {'error': (
                        f"Cannot activate: {conflict.full_name} is already the active "
                        f"{target.signatory_role}. Deactivate them first."
                    )},
                    status=status.HTTP_409_CONFLICT
                )

        target.status = new_status
        target.save()
        AuditLog.objects.create(
            User_ID = user,
            Module  = 'User Management',
            Action  = f"{'Deactivated' if new_status == 'Inactive' else 'Activated'} Signatory: {target.full_name} ({target.username}) - Role: {target.signatory_role}"
        )
        return Response({'message': f'Signatory status updated to {new_status}.'})