from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny

from .models import User
from .serializers import UserSerializer, SignatorySerializer

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
    """Returns (user, error_response). error_response is None if user is Admin."""
    user = get_user_from_token(request)
    if not user:
        return None, Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)
    if user.user_level != 'Admin':
        return None, Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
    return user, None


class UserListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        """
        Returns all non-Admin users (WS + signatories).
        Admin can see everyone except themselves.
        """
        _, err = admin_required(request)
        if err:
            return err

        users = User.objects.exclude(user_level='Admin')
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

    def post(self, request):
        """Create a Warehouse Supervisor account."""
        _, err = admin_required(request)
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
            serializer.save()
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
        """Edit a Warehouse Supervisor."""
        _, err = admin_required(request)
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
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        """Toggle Active / Inactive for a Warehouse Supervisor."""
        _, err = admin_required(request)
        if err:
            return err

        target = self.get_object(pk)
        if not target:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get('status', 'Inactive')
        target.status = new_status
        target.save()
        return Response({'message': f'User status updated to {new_status}.'})


class SignatoryListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        """List all signatory accounts (all statuses)."""
        _, err = admin_required(request)
        if err:
            return err

        signatories = User.objects.filter(user_level='Signatory')
        serializer  = SignatorySerializer(signatories, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        """
        Create a new signatory.
        RULE: An active signatory of the same user_level must not exist.
              Admin must deactivate the current one first.
        """
        _, err = admin_required(request)
        if err:
            return err

        serializer = SignatorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
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
        """Retrieve a single signatory."""
        _, err = admin_required(request)
        if err:
            return err

        target = self.get_object(pk)
        if not target:
            return Response({'error': 'Signatory not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = SignatorySerializer(target)
        return Response(serializer.data)

    def put(self, request, pk):
        """Edit a signatory's details (not status — use PATCH for that)."""
        _, err = admin_required(request)
        if err:
            return err

        target = self.get_object(pk)
        if not target:
            return Response({'error': 'Signatory not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = SignatorySerializer(target, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        """
        Deactivate (or reactivate) a signatory.
        Deactivating is the prerequisite before the Admin can add a new one of the same level.
        """
        _, err = admin_required(request)
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
                    {
                        'error': (
                            f"Cannot activate: {conflict.full_name} is already the active "
                            f"{target.signatory_role}. Deactivate them first."
                        )
                    },
                    status=status.HTTP_409_CONFLICT
                )      

        target.status = new_status
        target.save()
        return Response({'message': f'Signatory status updated to {new_status}.'})