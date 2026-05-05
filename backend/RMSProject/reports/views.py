from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from .models import StockBook, Transaction, WSRReport, WSIReport, Summary
from .serializers import (
    StockBookSerializer, TransactionSerializer,
    WSRReportSerializer, WSIReportSerializer, SummarySerializer,
    StockBookListSerializer
)

def get_user_from_token(request):
    from rest_framework_simplejwt.tokens import AccessToken
    from users.models import User
    try:
        raw = request.headers.get('Authorization', '').split(' ')[1]
        decoded = AccessToken(raw)
        user_id = decoded.get('user_id')
        if not user_id:
            return None
        return User.objects.get(user_id=user_id)
    except User.DoesNotExist:
        return None
    except Exception:
        return None

# Stockbook
@api_view(['GET'])
def get_stock(request):
    return Response(StockBookListSerializer(StockBook.objects.all(), many=True).data)


@api_view(['POST'])
@permission_classes([AllowAny])
def create_stock(request):
    user = get_user_from_token(request)
    if not user:
        return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)

    if user.user_level != 'Warehouse Supervisor':
        return Response({'error': 'Only Warehouse Supervisor can create StockBooks'}, status=status.HTTP_403_FORBIDDEN)

    serializer = StockBookSerializer(data=request.data)
    if serializer.is_valid():
        from users.models import User

        assist_bm  = User.objects.filter(user_level='Signatory', signatory_role='Asst. Branch Manager', status='Active').first()
        account_ii = User.objects.filter(user_level='Signatory', signatory_role='Accountant 3', status='Active').first()
        branch_m   = User.objects.filter(user_level='Signatory', signatory_role='Branch Manager', status='Active').first()

        instance = serializer.save(
            name=user,
            Assist_BM=assist_bm,
            Account_II=account_ii,
            Branch_M=branch_m,
        )
        full = StockBook.objects.get(pk=instance.report_id)
        return Response(StockBookSerializer(full).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([AllowAny])
def upd_stock(request, pk):
    try:
        stock = StockBook.objects.get(pk=pk)
    except StockBook.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(StockBookSerializer(stock).data)

    elif request.method == 'PUT':
        user = get_user_from_token(request)
        if not user:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)

        if stock.Status in ['Under Review', 'Completed']:
            if 'Status' in request.data and user.user_level == 'Admin':
                pass
            else:
                return Response(
                    {'error': 'StockBook is locked. Cannot edit while Under Review or Completed.'},
                    status=status.HTTP_403_FORBIDDEN
                )

        serializer = StockBookSerializer(stock, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        user = get_user_from_token(request)
        if not user:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)
        if stock.Status in ['Under Review', 'Completed']:
            return Response({'error': 'Cannot delete a locked StockBook.'}, status=status.HTTP_403_FORBIDDEN)
        stock.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# Submit StockBook (changes status to Under Review)
@api_view(['POST'])
@permission_classes([AllowAny])
def submit_stock(request, pk):
    try:
        stock = StockBook.objects.get(pk=pk)
    except StockBook.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    user = get_user_from_token(request)
    if not user:
        return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)

    if user.user_level != 'Warehouse Supervisor':
        return Response(
            {'error': 'Only Warehouse Supervisor can submit reports'},
            status=status.HTTP_403_FORBIDDEN
        )

    if not stock.transactions.exists():
        return Response(
            {'error': 'Cannot submit a StockBook with no transactions'},
            status=status.HTTP_400_BAD_REQUEST
        )

    stock.Status = 'Under Review'
    stock.save()

    return Response(StockBookSerializer(stock).data)

# Transactions
@api_view(['GET'])
def get_transactions(request):
    stockbook_id = request.query_params.get('stockbook')
    txns = Transaction.objects.all()
    if stockbook_id:
        txns = txns.filter(stockbook_id=stockbook_id)
    return Response(TransactionSerializer(txns, many=True).data)

@api_view(['POST'])
@permission_classes([AllowAny])
def create_transaction(request):
    user = get_user_from_token(request)
    if not user:
        return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)

    if user.user_level != 'Warehouse Supervisor':
        return Response(
            {'error': 'Only Warehouse Supervisor can create transactions'},
            status=status.HTTP_403_FORBIDDEN
        )

    stockbook_id = request.data.get('stockbook')
    if stockbook_id:
        try:
            stock = StockBook.objects.get(pk=stockbook_id)
            if stock.Status in ['Under Review', 'Completed']:
                return Response(
                    {'error': 'Cannot add transactions. StockBook is locked.'},
                    status=status.HTTP_403_FORBIDDEN
                )
        except StockBook.DoesNotExist:
            pass

    serializer = TransactionSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

import traceback

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([AllowAny])
def upd_transaction(request, pk):
    try:
        txn = Transaction.objects.get(pk=pk)
    except Transaction.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(TransactionSerializer(txn).data)

    elif request.method == 'PUT':
        user = get_user_from_token(request)
        if not user:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)

        if txn.stockbook.Status in ['Under Review', 'Completed']:
            return Response(
                {'error': 'Cannot edit transaction. StockBook is locked.'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            safe_data = {k: v for k, v in request.data.items() 
                        if k not in ['Assist_BM', 'Account_II', 'Branch_M', 
                                      'user_full_name', 'user_WHCode',
                                      'wsr_report', 'wsi_report']}

            serializer = TransactionSerializer(txn, data=safe_data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            # This will now return JSON instead of HTML so you can see the real error
            return Response(
                {'error': str(e), 'trace': traceback.format_exc()},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    elif request.method == 'DELETE':
        user = get_user_from_token(request)
        if not user:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)

        if txn.stockbook.Status in ['Under Review', 'Completed']:
            return Response(
                {'error': 'Cannot delete transaction. StockBook is locked.'},
                status=status.HTTP_403_FORBIDDEN
            )

        txn.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# WSRReport
@api_view(['GET'])
def get_wsr_reports(request):
    reports = WSRReport.objects.all()
    return Response(WSRReportSerializer(reports, many=True).data)


@api_view(['GET', 'PUT'])
@permission_classes([AllowAny])
def upd_wsr_report(request, pk):
    try:
        report = WSRReport.objects.get(pk=pk)
    except WSRReport.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(WSRReportSerializer(report).data)

    elif request.method == 'PUT':
        user = get_user_from_token(request)
        if not user:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)

        if user.user_level != 'Admin':
            return Response(
                {'error': 'Only Admin can evaluate reports'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = WSRReportSerializer(report, data=request.data, partial=True)
        if serializer.is_valid():
            instance = serializer.save()
            instance.reviewed_by = user
            instance.save()
            return Response(WSRReportSerializer(instance).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# WSIReport
@api_view(['GET'])
def get_wsi_reports(request):
    reports = WSIReport.objects.all()
    return Response(WSIReportSerializer(reports, many=True).data)


@api_view(['GET', 'PUT'])
@permission_classes([AllowAny])
def upd_wsi_report(request, pk):
    try:
        report = WSIReport.objects.get(pk=pk)
    except WSIReport.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(WSIReportSerializer(report).data)

    elif request.method == 'PUT':
        user = get_user_from_token(request)
        if not user:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)

        if user.user_level != 'Admin':
            return Response(
                {'error': 'Only Admin can evaluate reports'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = WSIReportSerializer(report, data=request.data, partial=True)
        if serializer.is_valid():
            instance = serializer.save()
            instance.reviewed_by = user
            instance.save()
            return Response(WSIReportSerializer(instance).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Summary
@api_view(['GET'])
def get_summary(request):
    summaries = Summary.objects.all()
    return Response(SummarySerializer(summaries, many=True).data)


@api_view(['POST'])
def create_summary(request):
    serializer = SummarySerializer(data=request.data)
    if serializer.is_valid():
        summary = serializer.save()
        summary.compute_and_save()
        return Response(SummarySerializer(summary).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([AllowAny])
def upd_summary(request, pk):
    try:
        summary = Summary.objects.get(pk=pk)
    except Summary.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(SummarySerializer(summary).data)

    elif request.method == 'PUT':
        serializer = SummarySerializer(summary, data=request.data, partial=True)
        if serializer.is_valid():
            instance = serializer.save()
            instance.compute_and_save()
            return Response(SummarySerializer(instance).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        summary.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
# for unsubmitting the submitted reports
@api_view(['POST'])
@permission_classes([AllowAny])
def unsubmit_stock(request, pk):
    try:
        stock = StockBook.objects.get(pk=pk)
    except StockBook.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    user = get_user_from_token(request)
    if not user:
        return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)

    if user.user_level != 'Warehouse Supervisor':
        return Response(
            {'error': 'Only Warehouse Supervisor can unsubmit reports'},
            status=status.HTTP_403_FORBIDDEN
        )

    if stock.Status != 'Under Review':
        return Response(
            {'error': 'Only reports Under Review can be unsubmitted'},
            status=status.HTTP_400_BAD_REQUEST
        )

    stock.Status = 'In Progress'
    stock.save(update_fields=['Status'])

    return Response(StockBookSerializer(stock).data)