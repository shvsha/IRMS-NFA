from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import StockBook, WSR, WSI, Summary
from .serializers import StockBookSerializer, WSRSerializer, WSISerializer,  SummarySerializer
from reports.models import Summary, WSR, WSI

# Create your views here.

# StockBook
@api_view(['GET'])
def get_stock(request):
    stock = StockBook.objects.all()
    serializer = StockBookSerializer(stock, many=True)
    return Response(serializer.data)


@api_view(['POST'])
def create_stock(request):
    serializer = StockBookSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view (['GET', 'PUT', 'DELETE'])
def upd_stock(request,pk):
    try:
        stock_b = StockBook.objects.get(pk=pk)
    except StockBook.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = StockBookSerializer(stock_b)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = StockBookSerializer(stock_b, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        stock_b.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
        

# WRS
@api_view(['GET'])
def get_wsr(request):
    wsr = WSR.objects.all()
    serializer = WSRSerializer(wsr, many=True)
    return Response(serializer.data)


@api_view(['POST'])
def create_wsr(request):
    serializer = WSRSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view (['GET', 'PUT', 'DELETE'])
def upd_wsr(request,pk):
    try:
        wsr_s = WSR.objects.get(pk=pk)
    except WSR.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = WSRSerializer(wsr_s)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = WSRSerializer(wsr_s, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        wsr_s.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# WSI
@api_view(['GET'])
def get_wsi(request):
    wsi = WSI.objects.all()
    serializer = WSISerializer(wsi, many=True)
    return Response(serializer.data)


@api_view(['POST'])
def create_wsi(request):
    serializer = WSISerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view (['GET', 'PUT', 'DELETE'])
def upd_wsi(request,pk):
    try:
        wsi_s = WSI.objects.get(pk=pk)
    except WSI.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = WSISerializer(wsi_s)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = WSISerializer(wsi_s, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        wsi_s.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
# Summary
@api_view(['GET'])
def get_summary(request):
    summary = Summary.objects.all()
    serializer = SummarySerializer(summary, many=True)
    return Response(serializer.data)


@api_view(['POST'])
def create_summary(request):
    serializer = SummarySerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view (['GET', 'PUT', 'DELETE'])
def upd_summary(request,pk):
    try:
        summary_r = Summary.objects.get(pk=pk)
    except Summary.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = SummarySerializer(summary_r)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = SummarySerializer(summary_r, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        summary_r.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# When a WRS is approved/created → auto assign to summary
def assign_to_summary(wrs_id=None, wsi_id=None):
    if wrs_id:
        wrs = WSR.objects.get(Receipt_ID=wrs_id)
        Summary.get_or_create_summary(wrs=wrs)

    if wsi_id:
        wsi = WSI.objects.get(Issue_ID=wsi_id)
        Summary.get_or_create_summary(wsi=wsi)