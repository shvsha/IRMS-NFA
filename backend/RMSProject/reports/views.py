from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from .models import StockBook, Transaction, WSRReport, WSIReport, Summary
from .serializers import (
    StockBookSerializer, TransactionSerializer,
    WSRReportGroupedSerializer, WSIReportGroupedSerializer, SummarySerializer,
    StockBookListSerializer
)
from audit.models import AuditLog

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
    

NFA_WEEK_RANGES = {
    1: (1, 7),
    2: (8, 14),
    3: (15, 21),
    4: (22, None),
}

def get_nfa_week_day_range(year, month, week):
    import calendar
    days_in_month = calendar.monthrange(year, month)[1]
    start_day, end_day = NFA_WEEK_RANGES.get(week, (1, 7))
    if end_day is None:
        end_day = days_in_month
    return start_day, min(end_day, days_in_month)

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
        
        stock._deleted_by = user
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
    stock._submitted_by = user
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

        if txn.type == 'WSR':
            try:
                wsr = WSRReport.objects.filter(
                    date_covered=txn.stockbook.Date,
                    CerealType=txn.stockbook.CerealType,
                    Evaluation='Approved'
                ).first()
                if wsr:
                    return Response(
                        {'error': 'Cannot edit WSR transaction. Receipt is already approved.'},
                        status=status.HTTP_403_FORBIDDEN
                    )
            except Exception:
                pass

        if txn.type == 'WSI':
            try:
                wsi = WSIReport.objects.filter(
                    date_covered=txn.stockbook.Date,
                    CerealType=txn.stockbook.CerealType,
                    Evaluation='Approved'
                ).first()
                if wsi:
                    return Response(
                        {'error': 'Cannot edit WSI transaction. Issue is already approved.'},
                        status=status.HTTP_403_FORBIDDEN
                    )
            except Exception:
                pass

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
        
        txn._deleted_by = user
        txn.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# WSRReport
@api_view(['GET'])
def get_wsr_reports(request):
    reports = WSRReport.objects.all()

    year  = request.query_params.get('year')
    month = request.query_params.get('month')
    week  = request.query_params.get('week')

    if year and month:
        year  = int(year)
        month = int(month)

        if week:
            week = int(week)
            start_day, end_day = get_nfa_week_day_range(year, month, week)
            reports = reports.filter(
                date_covered__year=year,
                date_covered__month=month,
                date_covered__day__gte=start_day,
                date_covered__day__lte=end_day,
            )
        else:
            reports = reports.filter(
                date_covered__year=year,
                date_covered__month=month,
            )

    return Response(WSRReportGroupedSerializer(reports, many=True).data)


STAGE_MAP = {
    'admin':      ('Admin',      'admin_approval',       'asst_bm'),
    'asst_bm':    ('Signatory',  'asst_bm_approval',     'accountant'),
    'accountant': ('Signatory',  'accountant_approval',  'branch_m'),
    'branch_m':   ('Signatory',  'branch_m_approval',    'done'),
}

@api_view(['GET', 'PUT'])
@permission_classes([AllowAny])
def upd_wsr_report(request, pk):
    try:
        report = WSRReport.objects.get(pk=pk)
    except WSRReport.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(WSRReportGroupedSerializer(report).data)

    elif request.method == 'PUT':
        user = get_user_from_token(request)
        if not user:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)

        evaluation = request.data.get('Evaluation')
        reason     = request.data.get('Reason', '')
        stage      = report.current_stage

        if stage not in STAGE_MAP:
            return Response({'error': 'Report is already fully processed.'}, status=status.HTTP_400_BAD_REQUEST)

        expected_level, approval_field, next_stage = STAGE_MAP[stage]

        # Validate correct user is acting
        if stage == 'admin' and user.user_level != 'Admin':
            return Response({'error': 'Only Admin can act at this stage.'}, status=status.HTTP_403_FORBIDDEN)
        if stage != 'admin' and user.user_level != 'Signatory':
            return Response({'error': 'Only a Signatory can act at this stage.'}, status=status.HTTP_403_FORBIDDEN)

        # Validate correct signatory role is acting
        signatory_role_map = {
            'asst_bm':    'Asst. Branch Manager',
            'accountant': 'Accountant 3',
            'branch_m':   'Branch Manager',
        }
        if stage in signatory_role_map:
            required_role = signatory_role_map[stage]
            if user.signatory_role != required_role:
                return Response(
                    {'error': f'Only {required_role} can act at this stage.'},
                    status=status.HTTP_403_FORBIDDEN
                )

        if evaluation == 'Approved':
            setattr(report, approval_field, 'Approved')
            report.reviewed_by = user
            report._acted_by = user

            if next_stage == 'done':
                report.Evaluation     = 'Approved'
                report.current_stage  = 'done'
                report.save()
            else:
                report.current_stage  = next_stage
                report.save()
                sb = report.stockbooks.first()
                sb_info = f"StockBook R-{str(sb.report_id).zfill(3)}" if sb else "No StockBook"
                AuditLog.objects.create(
                    User_ID=user,
                    Module="WSR Report",
                    Action=f"WSR Report #{report.wsr_report_id} Stage advanced to [{report.current_stage}] - {sb_info}"
                )

            report.save()
            return Response(WSRReportGroupedSerializer(report).data)

        elif evaluation == 'Rejected':
            setattr(report, approval_field, 'Rejected')
            report.Evaluation    = 'Rejected'
            report.Reason        = reason
            report.reviewed_by   = user
            report._acted_by     = user
            report.current_stage = stage
            report.save()
            return Response(WSRReportGroupedSerializer(report).data)

        return Response({'error': 'Evaluation must be Approved or Rejected.'}, status=status.HTTP_400_BAD_REQUEST)


# WSIReport
@api_view(['GET'])
def get_wsi_reports(request):
    reports = WSIReport.objects.all()

    year  = request.query_params.get('year')
    month = request.query_params.get('month')
    week  = request.query_params.get('week')

    if year and month:
        year  = int(year)
        month = int(month)

        if week:
            week = int(week)
            start_day, end_day = get_nfa_week_day_range(year, month, week) 
            reports = reports.filter(
                date_covered__year=year,
                date_covered__month=month,
                date_covered__day__gte=start_day,
                date_covered__day__lte=end_day,
            )
        else:
            reports = reports.filter(
                date_covered__year=year,
                date_covered__month=month,
            )

    return Response(WSIReportGroupedSerializer(reports, many=True).data)


@api_view(['GET', 'PUT'])
@permission_classes([AllowAny])
def upd_wsi_report(request, pk):
    try:
        report = WSIReport.objects.get(pk=pk)
    except WSIReport.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(WSIReportGroupedSerializer(report).data)

    elif request.method == 'PUT':
        user = get_user_from_token(request)
        if not user:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)

        evaluation = request.data.get('Evaluation')
        reason     = request.data.get('Reason', '')
        stage      = report.current_stage

        if stage not in STAGE_MAP:
            return Response({'error': 'Report is already fully processed.'}, status=status.HTTP_400_BAD_REQUEST)

        expected_level, approval_field, next_stage = STAGE_MAP[stage]

        # Validate correct user is acting
        if stage == 'admin' and user.user_level != 'Admin':
            return Response({'error': 'Only Admin can act at this stage.'}, status=status.HTTP_403_FORBIDDEN)
        if stage != 'admin' and user.user_level != 'Signatory':
            return Response({'error': 'Only a Signatory can act at this stage.'}, status=status.HTTP_403_FORBIDDEN)

        # Validate correct signatory role is acting
        signatory_role_map = {
            'asst_bm':    'Asst. Branch Manager',
            'accountant': 'Accountant 3',
            'branch_m':   'Branch Manager',
        }
        if stage in signatory_role_map:
            required_role = signatory_role_map[stage]
            if user.signatory_role != required_role:
                return Response(
                    {'error': f'Only {required_role} can act at this stage.'},
                    status=status.HTTP_403_FORBIDDEN
                )

        if evaluation == 'Approved':
            setattr(report, approval_field, 'Approved')
            report.reviewed_by = user
            report._acted_by = user

            if next_stage == 'done':
                report.Evaluation     = 'Approved'
                report.current_stage  = 'done'
                report.save()
            else:
                report.current_stage  = next_stage
                report.save()
                sb = report.stockbooks.first()
                sb_info = f"StockBook R-{str(sb.report_id).zfill(3)}" if sb else "No StockBook"
                AuditLog.objects.create(
                    User_ID=user,
                    Module="WSI Report",
                    Action=f"WSI Report #{report.wsi_report_id} Stage advanced to [{report.current_stage}] - {sb_info}"
                )

            report.save()
            return Response(WSIReportGroupedSerializer(report).data)

        elif evaluation == 'Rejected':
            setattr(report, approval_field, 'Rejected')
            report.Evaluation    = 'Rejected'
            report.Reason        = reason
            report.reviewed_by   = user
            report._acted_by     = user
            report.current_stage = stage
            report.save()
            return Response(WSIReportGroupedSerializer(report).data)

        return Response({'error': 'Evaluation must be Approved or Rejected.'}, status=status.HTTP_400_BAD_REQUEST)


# Summary
@api_view(['GET'])
def get_summary(request):
    summaries = Summary.objects.all()
    return Response(SummarySerializer(summaries, many=True).data)


@api_view(['POST'])
def create_summary(request):
    date_covered = request.data.get('date_covered')
    cereal_type  = request.data.get('CerealType')

    if not date_covered or not cereal_type:
        return Response({'error': 'date_covered and CerealType are required.'}, status=status.HTTP_400_BAD_REQUEST)

    summary, _ = Summary.objects.get_or_create(
        date_covered=date_covered,
        CerealType=cereal_type,
    )
    summary.compute_and_save()
    return Response(SummarySerializer(summary).data, status=status.HTTP_201_CREATED)


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
            instance._edited_by = user
            instance.compute_and_save()
            return Response(SummarySerializer(instance).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        user = get_user_from_token(request) 
        if not user:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)
        summary._deleted_by = user
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

    stock.transactions.all().update(wsr_report=None, wsi_report=None)

    try:
        for wsr in WSRReport.objects.filter(date_covered=stock.Date, stockbooks=stock):
            if wsr.Evaluation == 'Pending':
                wsr.stockbooks.remove(stock)
                if not wsr.stockbooks.exists():
                    wsr._deleted_by = user
                    wsr.delete()
            elif wsr.Evaluation == 'Rejected':
                wsr.stockbooks.remove(stock)
                if not wsr.stockbook:
                    wsr.stockbook = stock
                    wsr.save(update_fields=['stockbook'])
    except WSRReport.DoesNotExist:
        pass

    try:
        for wsi in WSIReport.objects.filter(date_covered=stock.Date, stockbooks=stock):
            if wsi.Evaluation == 'Pending':
                wsi.stockbooks.remove(stock)
                if not wsi.stockbooks.exists():
                    wsi._deleted_by = user
                    wsi.delete()
            elif wsi.Evaluation == 'Rejected':
                wsi.stockbooks.remove(stock)
                if not wsi.stockbook:
                    wsi.stockbook = stock
                    wsi.save(update_fields=['stockbook'])
    except WSIReport.DoesNotExist:
        pass

    stock.Status = 'In Progress'
    stock.save(update_fields=['Status'])
    stock.refresh_from_db()

    return Response(StockBookSerializer(stock).data)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_wsr_by_stockbook(request, pk):
    try:
        stock = StockBook.objects.get(pk=pk)
    except StockBook.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    wsr_report = WSRReport.objects.filter(
        date_covered=stock.Date,
        stockbooks=stock,
    ).order_by('-wsr_report_id').first()

    transactions = []
    if wsr_report:
        for t in wsr_report.transactions.filter(type__in=['WSR', 'WTS']):
            txn_data = TransactionSerializer(t).data
            txn_data['cereal_type'] = t.stockbook.CerealType if t.stockbook else '—'
            transactions.append(txn_data)

    data = {
        'date':            str(stock.Date),
        'cereal':          stock.CerealType,
        'user_full_name':  stock.user_full_name,
        'user_WHCode':     stock.user_WHCode,
        'asst_bm_name':    stock.Assist_BM.full_name  if stock.Assist_BM  else '—',
        'accountant_name': stock.Account_II.full_name if stock.Account_II else '—',
        'branch_m_name':   stock.Branch_M.full_name   if stock.Branch_M   else '—',
        'transactions':    transactions,
    }
    return Response(data)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_wsi_by_stockbook(request, pk):
    try:
        stock = StockBook.objects.get(pk=pk)
    except StockBook.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    wsi_report = WSIReport.objects.filter(
        date_covered=stock.Date,
        stockbooks=stock,
    ).order_by('-wsi_report_id').first()

    transactions = []
    if wsi_report:
        for t in wsi_report.transactions.filter(type__in=['WSI', 'WTS']):
            txn_data = TransactionSerializer(t).data
            txn_data['cereal_type'] = t.stockbook.CerealType if t.stockbook else '—'
            transactions.append(txn_data)

    data = {
        'date':            str(stock.Date),
        'cereal':          stock.CerealType,
        'user_full_name':  stock.user_full_name,
        'user_WHCode':     stock.user_WHCode,
        'asst_bm_name':    stock.Assist_BM.full_name  if stock.Assist_BM  else '—',
        'accountant_name': stock.Account_II.full_name if stock.Account_II else '—',
        'branch_m_name':   stock.Branch_M.full_name   if stock.Branch_M   else '—',
        'transactions':    transactions,
    }
    return Response(data)


@api_view(['POST'])
@permission_classes([AllowAny])
def trigger_archive(request):
    from .scheduler import archive_completed_reports
    archive_completed_reports()
    return Response({'status': 'archive triggered'})