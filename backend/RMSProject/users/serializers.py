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
        # password only required on add/create
        if self.instance is None:
            if not data.get('password') or not data.get('confirmPassword'):
                raise serializers.ValidationError({"password": "Password is required."})
            if data['password'] != data['confirmPassword']:
                raise serializers.ValidationError({"confirmPassword": "Passwords do not match."})
        return data

    def create(self, validated_data):
        validated_data.pop('confirmPassword', None)
        password = validated_data.pop('password')
        validated_data['password'] = make_password(password) #hash it 
        return User.objects.create(**validated_data)
    
    def update(self, instance, validated_data):
        validated_data.pop('confirmPassword', None)
        password = validated_data.pop('password', None)
        if password:
            instance.password = make_password(password) #hash new password
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
