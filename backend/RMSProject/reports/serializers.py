from rest_framework import serializers
from .models import StockBook, WSR, WSI, Summary

class StockBookSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockBook
        fields = '__all__'

class WSRSerializer(serializers.ModelSerializer):
    class Meta:
        model = WSR
        fields = '__all__'

class WSISerializer(serializers.ModelSerializer):
    class Meta:
        model =WSI
        fields = '__all__'

class SummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Summary
        fields = '__all__'
