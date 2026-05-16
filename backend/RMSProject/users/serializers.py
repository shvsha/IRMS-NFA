from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import User


class UserSerializer(serializers.ModelSerializer):
    password  = serializers.CharField(write_only=True, required=False)
    confirmPassword = serializers.CharField(write_only=True, required=False)
    e_signature_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = '__all__'

    def get_e_signature_url(self, obj):
        if obj.e_signature:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.e_signature.url)
            return f"http://localhost:8000{obj.e_signature.url}"
        return None

    def validate(self, data):
        return data

    def create(self, validated_data):
        validated_data.pop('confirmPassword', None)
        password = validated_data.pop('password', None)
        default  = 'signa123' if validated_data.get('user_level') == 'Signatory' else 'whse123'
        validated_data['password'] = make_password(password or default)
        return User.objects.create(**validated_data)

    def update(self, instance, validated_data):
        validated_data.pop('confirmPassword', None)
        password = validated_data.pop('password', None)
        if password:
            instance.password = make_password(password)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class SignatorySerializer(serializers.ModelSerializer):
    """
    Used for creating and updating signatory accounts.
    e_signature is required on create, optional on update.
    """
    password = serializers.CharField(write_only=True, required=False)
    confirmPassword = serializers.CharField(write_only=True, required=False)
    e_signature_url = serializers.SerializerMethodField()

    class Meta:
        model  = User
        fields = ['user_id', 'fname', 'mI', 'lname', 'email', 'user_level',
                  'dept', 'position', 'signatory_role', 'WHCode', 'Office_id',
                  'e_signature', 'e_signature_url',
                  'username', 'password', 'confirmPassword', 'status']
    
    def get_e_signature_url(self, obj):  # ← add this method
        if obj.e_signature:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.e_signature.url)
            return f"http://localhost:8000{obj.e_signature.url}"
        return None

    def validate_user_level(self, value):
        if value != 'Signatory':
            raise serializers.ValidationError("user_level must be 'Signatory'.")
        return value

    def validate(self, data):
        signatory_role = data.get('signatory_role') or (self.instance.signatory_role if self.instance else None)
        user_level     = data.get('user_level') or (self.instance.user_level if self.instance else None)

        if user_level == 'Signatory' and self.instance is None:
            if signatory_role and User.objects.filter(
                user_level='Signatory',
                signatory_role=signatory_role,
                status='Active'
            ).exists():
                raise serializers.ValidationError({
                    'signatory_role': (
                        f"An active {signatory_role} already exists. "
                        f"Deactivate the current one before adding a new one."
                    )
                })
        return data

    def create(self, validated_data):
        validated_data.pop('confirmPassword', None)
        password = validated_data.pop('password', None)
        validated_data['password'] = make_password(password or 'signa123')
        validated_data['status']   = 'Active'
        return User.objects.create(**validated_data)

    def update(self, instance, validated_data):
        validated_data.pop('confirmPassword', None)
        password = validated_data.pop('password', None)
        if password:
            instance.password = make_password(password)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance