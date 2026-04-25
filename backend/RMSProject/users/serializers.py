from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import User

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)
    confirmPassword = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = User
        fields = '__all__'

    def validate(self, data):
        if self.instance is None:
            pass
        return data

    def create(self, validated_data):
        validated_data.pop('confirmPassword', None)
        password = validated_data.pop('password', 'whse123')
        validated_data['password'] = make_password(password)
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