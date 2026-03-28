from rest_framework import serializers
from django.contrib.auth.hashers import check_password
from users.models import User

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        try:
            user = User.objects.get(username=data['username'])
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid username or password.")
        
        if not check_password(data['password'], user.password):
            raise serializers.ValidationError("Invalid username or password.")

        if user.status == 'Inactive':
            raise serializers.ValidationError("This user is inactive.")
        
        data['user'] = user
        return data
