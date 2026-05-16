// react
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Header from '../../components/Header';

// shadcn
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  AlertDialog, AlertDialogTrigger, AlertDialogContent,
  AlertDialogHeader, AlertDialogTitle, AlertDialogDescription,
  AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

// react icons
import { CiExport, CiImport } from "react-icons/ci";
import { FaExclamation } from "react-icons/fa";
import { FaCheck } from "react-icons/fa6"

// api
import api from "@/api/axios";

// for notif
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { getNotifRoute } from "@/utils/getNotifRoute";
import { useUnreadCount } from "@/hooks/useUnreadCount";

// export
import { exportStockbookToExcel } from "@/utils/exportToExcel";

//  pure helpers (outside component)
const getTransactionType = (txn) => {
  const hasWTS = txn.wts && String(txn.wts).trim() !== '';
  const hasWSR = txn.wsr && String(txn.wsr).trim() !== '';
  const hasWSI = txn.wsi && String(txn.wsi).trim() !== '';
  if (hasWTS) return 'WTS';
  if (hasWSR) return 'WSR';
  if (hasWSI) return 'WSI';
  const hasReceipt = txn.rBags || txn.rGkg || txn.rNkg;
  const hasIssue   = txn.iBags || txn.iGkg || txn.iNkg;
  if (hasReceipt && hasIssue) return 'WTS';
  if (hasReceipt) return 'WSR';
  if (hasIssue)   return 'WSI';
  return 'WSR';
};

const getLockedDocs = (txn) => {
  const hasWTS = txn.wts && String(txn.wts).trim() !== '';
  const hasWSR = txn.wsr && String(txn.wsr).trim() !== '';
  const hasWSI = txn.wsi && String(txn.wsi).trim() !== '';
  if (hasWTS) return { wsr: true, wsi: true,  wts: false };
  if (hasWSR) return { wts: true, wsi: true,  wsr: false };
  if (hasWSI) return { wts: true, wsr: true,  wsi: false };
  return { wts: false, wsr: false, wsi: false };
};

const getSectionLock = (txn, rejectedType) => {
  const hasWTS = txn.wts && String(txn.wts).trim() !== '';
  const hasWSR = txn.wsr && String(txn.wsr).trim() !== '';
  const hasWSI = txn.wsi && String(txn.wsi).trim() !== '';

  // Pure WSR transaction 
  if (hasWSR) return { receipt: false, issue: true };
  // Pure WSI transaction
  if (hasWSI) return { receipt: true, issue: false };

  // WTS transaction 
  if (hasWTS && rejectedType === 'WSR') {
    // WSR (receipt) was rejected
    return { receipt: false, issue: true };
  }
  if (hasWTS && rejectedType === 'WSI') {
    // WSI (issue) was rejected
    return { receipt: true, issue: false };
  }

  return { receipt: false, issue: false };
};

const mapToBackend = (txn, stockbookId) => ({
  stockbook:        stockbookId,
  type:             getTransactionType(txn),
  Particulars:      txn.particulars     || null,
  Plate_Number:     txn.plateNo         || null,
  Batch_No:         txn.batchNo         || null,
  AI_Number:        txn.aiNo            || null,
  OR_Number:        txn.orNo            || null,
  Transaction_ref:  txn.transaction     || null,
  WTS_no:           txn.wts             || null,
  WSR_no:           txn.wsr             || null,
  WSI_no:           txn.wsi             || null,
  Age:              txn.age             || null,
  Moisture_Content: txn.moistureContent || null,
  Classifier:       txn.classifier      || null,
  Pile_No:          txn.pileNo          || null,
  Fillers:          txn.fillers         || null,
  R_Bags:           txn.rBags           || null,
  R_GKG:            txn.rGkg            || null,
  R_NKG:            txn.rNkg            || null,
  Cond_R:           txn.rCondition      || null,
  I_Bags:           txn.iBags           || null,
  I_GKG:            txn.iGkg            || null,
  I_NKG:            txn.iNkg            || null,
  Cond_I:           txn.iCondition      || null,
});

const mapFromBackend = (txn) => ({
  id:              txn.transaction_id,
  particulars:     txn.Particulars      || '',
  plateNo:         txn.Plate_Number     || '',
  batchNo:         txn.Batch_No         || '',
  aiNo:            txn.AI_Number        || '',
  orNo:            txn.OR_Number        || '',
  transaction:     txn.Transaction_ref  || '',
  wts:             txn.WTS_no           || '',
  wsr:             txn.WSR_no           || '',
  wsi:             txn.WSI_no           || '',
  age:             txn.Age              || '',
  classifier:      txn.Classifier       || '',
  moistureContent: txn.Moisture_Content || '',
  pileNo:          txn.Pile_No          || '',
  fillers:         txn.Fillers          || '',
  rBags:           txn.R_Bags           || '',
  rGkg:            txn.R_GKG            || '',
  rNkg:            txn.R_NKG            || '',
  rCondition:      txn.Cond_R           || '',
  iBags:           txn.I_Bags           || '',
  iGkg:            txn.I_GKG            || '',
  iNkg:            txn.I_NKG            || '',
  iCondition:      txn.Cond_I           || '',
});

const emptyTransaction = {
  particulars: '', plateNo: '', batchNo: '',
  wts: '', wsr: '', wsi: '', aiNo: '', orNo: '', transaction: '',
  age: '', classifier: '', moistureContent: '', pileNo: '',
  rBags: '', rGkg: '', rNkg: '', rCondition: '',
  iBags: '', iGkg: '', iNkg: '', iCondition: '',
  fillers: '',
};

const STATUS_CONFIG = {
  'In Progress':  { label: 'In Progress',  className: 'inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[13px] font-semibold whitespace-nowrap bg-[#F0E48B] text-[#856404]' },
  'Under Review': { label: 'Under Review', className: 'inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[13px] font-semibold whitespace-nowrap bg-[#ADCEFF] text-blue-800' },
  'Completed':    { label: 'Completed',    className: 'inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[13px] font-semibold whitespace-nowrap bg-[#D4EDDA] text-[#155724]' },
};

const TRANSACTION_OPTIONS = {
  receipt: ['Milling', 'Transfer', 'Sales'],
  issue:   ['Rebagging', 'Repiling', 'Recondition'],
};

const CONDITION_OPTIONS = ['GQ', 'TRD', 'TD', 'INF', 'PD'];

const MOISTURE_REGEX = /^\d{0,2}(\.\d{0,2})?$/;
const AGE_REGEX      = /^\d{0,2}(\.\d{0,4})?$/;

const getTransactionOptions = (txn) => {
  const hasWSR     = txn.wsr && String(txn.wsr).trim() !== '';
  const hasWSI     = txn.wsi && String(txn.wsi).trim() !== '';
  const hasReceipt = txn.rBags || txn.rGkg || txn.rNkg;
  const hasIssue   = txn.iBags || txn.iGkg || txn.iNkg;
  if (hasWSR || hasReceipt) return TRANSACTION_OPTIONS.receipt;
  if (hasWSI || hasIssue)   return TRANSACTION_OPTIONS.issue;
  return [...TRANSACTION_OPTIONS.receipt, ...TRANSACTION_OPTIONS.issue];
};

const txnHasData = (txn) =>
  Object.entries(txn)
    .filter(([k]) => k !== 'id')
    .some(([, v]) => String(v).trim() !== '');

// Guard helper
const isTransactionLocked = (txn, rejectedType) => {
  if (!rejectedType) return false; 
  const txnType = getTransactionType(txn);
  if (txnType === 'WTS') return false;
  if (txnType === 'WSR' && rejectedType === 'WSI') return true;
  if (txnType === 'WSI' && rejectedType === 'WSR') return true;
  return false;
};

// component

export default function CreateReport() {
  // for notif
  const user       = useCurrentUser()
  const notifRoute = getNotifRoute(user)
  const userName   = user ? `${user.fname} ${user.lname}` : 'User'
  const unreadCount = useUnreadCount()

  const { id }   = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const mode         = location.state?.mode         ?? 'edit';
  const initialRejectedType = location.state?.rejectedType ?? null;
  const isEditMode   = mode === 'edit';

  // US
  const [stockBook,    setStockBook]    = useState(null);
  const [loadError,    setLoadError]    = useState(null);
  const [loadingBook,  setLoadingBook]  = useState(true);
  const [transactions, setTransactions] = useState([{ ...emptyTransaction }]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [saving,       setSaving]       = useState(false);
  const [toasts, setToasts] = useState([])

  const addToast = (message, color) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, color }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000)
  }

  const currentRejectedType = useMemo(() => {
    if (initialRejectedType) return initialRejectedType;
    if (!stockBook) return null;

    const wsrRejected = stockBook.wsr_report_status === 'Rejected';
    const wsiRejected = stockBook.wsi_report_status === 'Rejected';
    if (wsrRejected && !wsiRejected) return 'WSR';
    if (wsiRejected && !wsrRejected) return 'WSI';
    return null;
  }, [initialRejectedType, stockBook]);

  // Refs (never stale inside timeouts / unmount)
  const transactionsSeeded = useRef(false);
  const debounceTimer      = useRef(null);
  const transactionsRef    = useRef(transactions);
  const currentIndexRef    = useRef(currentIndex);
  const stockBookRef       = useRef(stockBook);
  const fileInputRef = useRef(null)

  useEffect(() => { transactionsRef.current = transactions; }, [transactions]);
  useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);
  useEffect(() => { stockBookRef.current    = stockBook;    }, [stockBook]);

  // Fetch stockBook
  useEffect(() => {
    if (!id) {
      setLoadError("No report ID found in URL.");
      setLoadingBook(false);
      return;
    }
    api.get(`/reports/stocks/upd/${id}/`)
      .then(res  => { setStockBook(res.data); setLoadingBook(false); })
      .catch(()  => { setLoadError("Failed to load report. Please go back and try again."); setLoadingBook(false); });
  }, [id]);

  // Seed transactions once stockBook arrives
  useEffect(() => {
    if (!stockBook || transactionsSeeded.current) return;
    transactionsSeeded.current = true;

    const raw       = stockBook.transactions;
    const editIndex = location.state?.editIndex ?? 0;

    if (!raw?.length) {
      setTransactions([{ ...emptyTransaction }]);
      setCurrentIndex(0);
    } else {
      const mapped = raw.map(mapFromBackend);
      setTransactions(mapped);
      setCurrentIndex(Math.max(0, Math.min(editIndex, mapped.length - 1)));
    }
  }, [stockBook]);

  // Derived values
  const currentTransaction = transactions[currentIndex] ?? { ...emptyTransaction };
  const lockedDocs  = getLockedDocs(currentTransaction);
  const sectionLock = getSectionLock(currentTransaction, currentRejectedType);
  const txnLocked   = isTransactionLocked(currentTransaction, currentRejectedType);
  const isFirstTransaction = currentIndex === 0;
  const isLastTransaction  = currentIndex === transactions.length - 1;

  const saveTransaction = useCallback(async (snapshot, idxToSave) => {
    const stockbookId = stockBookRef.current?.report_id;
    if (!stockbookId) return snapshot;

    const current = snapshot[idxToSave];
    if (!txnHasData(current)) return snapshot;

    if (isTransactionLocked(current, currentRejectedType)) return snapshot;

    try {
      setSaving(true);
      if (current.id) {
        await api.put(`/reports/transactions/upd/${current.id}/`, mapToBackend(current, stockbookId));
        return snapshot;
      } else {
        const res     = await api.post('/reports/transactions/create/', mapToBackend(current, stockbookId));
        const updated = snapshot.map((t, i) =>
          i === idxToSave ? { ...t, id: res.data.transaction_id } : t
        );
        setTransactions(updated);
        return updated;
      }
    } catch (err) {
      const errData = err.response?.data;
      const message = typeof errData === 'object' && errData !== null
        ? Object.entries(errData).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' | ')
        : errData || 'Failed to save transaction.';
      addToast(message, '#BB2325');
      return snapshot;
    } finally {
      setSaving(false);
    }
  }, [currentRejectedType]);

  // Auto-save debounce
  useEffect(() => {
    if (!txnHasData(currentTransaction)) return;
    if (txnLocked) return;

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      saveTransaction(transactionsRef.current, currentIndexRef.current);
    }, 1000);

    return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current); };
  }, [
    currentTransaction.particulars,    currentTransaction.plateNo,
    currentTransaction.batchNo,        currentTransaction.wts,
    currentTransaction.wsr,            currentTransaction.wsi,
    currentTransaction.aiNo,           currentTransaction.orNo,
    currentTransaction.transaction,    currentTransaction.age,
    currentTransaction.moistureContent,currentTransaction.classifier,
    currentTransaction.pileNo,         currentTransaction.fillers,
    currentTransaction.rBags,          currentTransaction.rGkg,
    currentTransaction.rNkg,           currentTransaction.rCondition,
    currentTransaction.iBags,          currentTransaction.iGkg,
    currentTransaction.iNkg,           currentTransaction.iCondition,
    saveTransaction, txnLocked,
  ]);

  // Save on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      saveTransaction(transactionsRef.current, currentIndexRef.current);
    };
  }, [saveTransaction]);

  // Custom Handlers

  const setField = (field, value) => {
    if (txnLocked) return; // guard: don't mutate locked transactions
    setTransactions(prev =>
      prev.map((t, i) => i === currentIndexRef.current ? { ...t, [field]: value } : t)
    );
  };

  const handleChange       = (field) => (e) => setField(field, e.target.value);

  const handleNumericInput = (field, maxLen) => (e) =>
    setField(field, e.target.value.replace(/\D/g, '').slice(0, maxLen));

  const handleTextOnly = (field) => (e) =>
    setField(field, e.target.value.replace(/[^a-zA-Z\s]/g, ''));

  const handleAgeInput = (e) => {
    if (AGE_REGEX.test(e.target.value)) setField('age', e.target.value);
  };

  const handleMoistureInput = (e) => {
    if (MOISTURE_REGEX.test(e.target.value)) setField('moistureContent', e.target.value);
  };

  const handlePileNoInput = (e) => {
    const val = e.target.value
    if (/^[1-6]$/.test(val) || val === '') setField('pileNo', val)
  }

  const handlePrev = async () => {
    if (isFirstTransaction || saving) return;
    await saveTransaction(transactions, currentIndex);
    setCurrentIndex(prev => prev - 1);
  };

  const handleNext = async () => {
    if (isLastTransaction || saving) return;
    await saveTransaction(transactions, currentIndex);
    setCurrentIndex(prev => prev + 1);
  };

  const handleAddTransaction = async () => {
    const latest = await saveTransaction(transactions, currentIndex);
    const next   = [...latest, { ...emptyTransaction }];
    setTransactions(next);
    setCurrentIndex(next.length - 1);
  };

  const handleSubmitAll = async () => {
    const latest = await saveTransaction(transactions, currentIndex);
    navigate(`/whse/create/${id}/review`, {
      state: { stockBook, mode, transactions: latest },
    });
  };

  // Map transactions to export format
  const mapToExportFormat = (txn) => ({
    year:  stockBook?.Date?.split("-")[0]  ?? '',
    month: stockBook?.Date?.split("-")[1]  ?? '',
    Particulars: txn.particulars || '',
    Plate_Number: txn.plateNo || '',
    WTS: txn.wts || '',
    WSR: txn.wsr || '',
    WSI: txn.wsi || '',
    Batch_No: txn.batchNo || '',
    Age: txn.age || '',
    AI_Number: txn.aiNo || '',
    OR_Number: txn.orNo || '',
    Moisture_Content: txn.moistureContent || '',
    Classifier: txn.classifier || '',
    Transaction: txn.transaction || '',
    Pile_No: txn.pileNo || '',
    R_Bags: txn.rBags || '',
    R_GKG: txn.rGkg || '',
    R_NKG: txn.rNkg || '',
    R_Cond: txn.rCondition || '',
    I_Bags: txn.iBags || '',
    I_GKG: txn.iGkg || '',
    I_NKG: txn.iNkg || '',
    I_Cond: txn.iCondition || '',
    Fillers: txn.fillers || '',
    B_Bags: stockBook?.B_Bags || '',
    B_GKG: stockBook?.B_GKG || '',
    B_NKG: stockBook?.B_NKG || '',
  });

  // export
  const handleExport = async () => {
    await api.post('/audit/log-export/', { type: 'StockBook', id: reportId })
    const exportRows = transactions.map(mapToExportFormat);
    exportStockbookToExcel(exportRows, reportId);
  }

  const handleImport = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    e.target.value = ''

    try {
      const { parseStockbookExcel } = await import('@/utils/importToExcel')
      const imported = await parseStockbookExcel(file)

      await saveTransaction(transactions, currentIndex)

      const existing = transactions.filter(t =>
        t.id || Object.entries(t).filter(([k]) => k !== 'id').some(([, v]) => String(v).trim() !== '')
      )
      const merged = [...existing, ...imported]
      setTransactions(merged)
      setCurrentIndex(existing.length)

      await api.post('/audit/log-import/', { 
        type: 'StockBook', 
        id: reportId,
        count: imported.length 
      })
      addToast(`Successfully imported ${imported.length} transaction(s).`, '#1D8104')
    } catch (err) {
      addToast(err.message || 'Import failed.', '#BB2325')
    }
  }

  // Early returns AFTER all hooks
  if (loadingBook) {
    return (
      <>
        <Header pageTitle="Stock Book" notifTo="/admin/notif" unreadCount={5} userName="Raph Nigos" />
        <div className="flex items-center justify-center h-64 text-[#2D317F] text-lg">Loading report...</div>
      </>
    );
  }

  if (loadError) {
    return (
      <>
        <Header pageTitle="Stock Book" notifTo="/admin/notif" unreadCount={5} userName="Raph Nigos" />
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p className="text-red-500 text-lg">{loadError}</p>
          <button
            onClick={() => navigate('/whse/management')}
            className="bg-[#2D317F] text-white px-6 py-2 rounded-md"
          >
            Go Back
          </button>
        </div>
      </>
    );
  }

  // Derived values that need stockBook (safe — past early returns)
  const reportId    = stockBook.report_id;
  const cerealType  = stockBook.CerealType ?? '—';
  const status      = stockBook.Status ?? 'In Progress';
  const badgeConfig = STATUS_CONFIG[status] ?? STATUS_CONFIG['In Progress'];
  const whseUser    = JSON.parse(sessionStorage.getItem('user') || '{}');

  // Class helpers
  const lockedClass    = 'bg-gray-100 border-0 rounded h-8 w-full cursor-not-allowed opacity-50';
  const inputClass     = 'bg-[#E6EEF6] border-0 rounded h-7 w-full';
  const readOnlyClass  = 'bg-gray-100 border-0 rounded h-7 w-full cursor-not-allowed opacity-60';

  // When txnLocked, swap inputClass for readOnlyClass everywhere
  const fieldClass = txnLocked ? readOnlyClass : inputClass;

  // UI
  return (
    <>
      <Header 
        pageTitle="Stock Book" 
        unreadCount={unreadCount} 
        notifTo={notifRoute}
        userName={userName}
      />

      <div className="mx-4 my-4 mt-2 pb-50 flex flex-col rounded-lg !min-h-[640px]">

        {/* Info bar */}
        <div className="shadow-[0_6px_4px_-4px_rgba(0,0,0,0.2)] flex-shrink-0 flex flex-wrap gap-[30px] rounded-lg items-center bg-white px-3 py-2 text-sm text-[#2d317f]">
          <div><strong>Report ID:</strong> R-{String(reportId).padStart(3, '0')}</div>
          <div><strong>Warehouse Supervisor:</strong> {whseUser?.fname} {whseUser?.lname}</div>
          <div><strong>Cereal Type:</strong> {cerealType}</div>
          <div><strong>Warehouse Code:</strong> {whseUser?.WHCode ?? '—'}</div>
          <div className="flex items-center gap-2">
            <strong>Status:</strong>
            <span className={badgeConfig.className}>{badgeConfig.label}</span>
          </div>
          <div className="flex gap-5 ml-auto">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="shadow-[0_6px_4px_-4px_rgba(0,0,0,0.2)] cursor-pointer transition-opacity duration-200 hover:opacity-70 bg-[#1D8104] text-white rounded-lg px-3 py-1 flex items-center gap-2">
              <CiImport size={21} color="white" /> Import
            </button>
            <button 
              onClick={handleExport}
              className="shadow-[0_6px_4px_-4px_rgba(0,0,0,0.2)] cursor-pointer transition-opacity duration-200 hover:opacity-70 bg-[#1D8104] text-white rounded-lg px-3 py-1 flex items-center gap-2">
              <CiExport size={21} color="white" /> Export
            </button>
          </div>
        </div>

        {/* Locked transaction toast */}
        {txnLocked && (
          <div className="shadow-2xl fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 bg-white border-l-4 border-[#856404] rounded-lg shadow-2xl px-5 py-3 min-w-[320px] pointer-events-none">
            <div className="rounded-full bg-[#F0E48B] px-2 py-1 my-1 flex-shrink-0">
              <span className="text-[#856404] text-base font-bold">⚠</span>
            </div>
            <div>
              <p className="font-bold text-sm text-[#856404]">Read Only</p>
              <p className="text-xs text-gray-500">This transaction was not rejected and cannot be edited.</p>
            </div>
          </div>
        )}

        {/* Form sections */}
        <div className="mt-2 overflow-x-auto w-full flex gap-3 bg-[#F5F9F9] py-2 px-2 rounded-lg border border-black/5 shadow-[0_6px_4px_-4px_rgba(0,0,0,0.2)]">

          {/* LEFT COLUMN */}
          <div className="flex flex-col gap-3 w-[38%] flex-shrink-0">

            {/* Delivery & Vehicle */}
            <div className="bg-white py-3 px-4 shadow-[0_0_8px_rgba(0,0,0,0.25)] rounded-lg">
              <p className="font-bold text-[#2D317F] text-base border-b border-b-[#8fa3c1] pb-1 mb-1.5">Delivery & Vehicle Information</p>
              <div className="flex flex-col gap-3">
                <Field className="flex-col w-full">
                  <FieldLabel className="text-sm font-semibold text-[#2D317F]">Particulars</FieldLabel>
                  <Input
                    value={currentTransaction.particulars}
                    onChange={handleChange('particulars')}
                    placeholder="Particulars"
                    readOnly={txnLocked}
                    className={`border-0 rounded h-12 w-full ${txnLocked ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'bg-[#E6EEF6]'}`} />
                </Field>
                <div className="flex gap-4">
                  <Field className="flex-col flex-1">
                    <FieldLabel className="text-sm font-semibold text-[#2D317F]">Plate #</FieldLabel>
                    <Input
                      value={currentTransaction.plateNo}
                      onChange={(e) => setField('plateNo', e.target.value.slice(0, 6))}
                      maxLength={6}
                      placeholder="ABC123"
                      readOnly={txnLocked}
                      className={`border-0 rounded h-7 ${txnLocked ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'bg-[#E6EEF6]'}`} />
                  </Field>
                  <Field className="flex-col flex-1">
                    <FieldLabel className="text-sm font-semibold text-[#2D317F]">Batch No.</FieldLabel>
                    <Input
                      value={currentTransaction.batchNo}
                      onChange={handleNumericInput('batchNo', 2)}
                      maxLength={2}
                      placeholder="01"
                      readOnly={txnLocked}
                      className={`border-0 rounded h-7 ${txnLocked ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'bg-[#E6EEF6]'}`} />
                  </Field>
                </div>
              </div>
            </div>

            {/* Quality Metrics */}
            <div className="bg-white py-3 px-4 shadow-[0_0_8px_rgba(0,0,0,0.25)] rounded-lg">
              <p className="font-bold text-[#2D317F] text-base border-b border-b-[#8fa3c1] pb-1 mb-1.5">Quality Metrics</p>
              <div className="flex gap-4">
                <div className="flex flex-col flex-1 gap-3">
                  <Field className="flex-col w-full">
                    <FieldLabel className="text-sm font-semibold text-[#2D317F]">Age</FieldLabel>
                    <Input
                      value={currentTransaction.age}
                      onChange={handleAgeInput}
                      placeholder="0.000"
                      readOnly={txnLocked}
                      className={fieldClass} />
                  </Field>
                  <Field className="flex-col w-full">
                    <FieldLabel className="text-sm font-semibold text-[#2D317F]">Moisture Content (%)</FieldLabel>
                    <Input
                      value={currentTransaction.moistureContent}
                      onChange={handleMoistureInput}
                      placeholder="10.01"
                      readOnly={txnLocked}
                      className={fieldClass} />
                  </Field>
                </div>
                <div className="flex flex-col flex-1 gap-3">
                  <Field className="flex-col w-full">
                    <FieldLabel className="text-sm font-semibold text-[#2D317F]">Classifier</FieldLabel>
                    <Input
                      value={currentTransaction.classifier}
                      onChange={handleTextOnly('classifier')}
                      placeholder="Classifier"
                      readOnly={txnLocked}
                      className={fieldClass} />
                  </Field>
                  <Field className="flex-col w-full">
                    <FieldLabel className="text-sm font-semibold text-[#2D317F]">Pile No.</FieldLabel>
                    <Input
                      value={currentTransaction.pileNo}
                      onChange={handlePileNoInput}
                      placeholder="1 - 6"
                      maxLength={1}
                      readOnly={txnLocked}
                      className={fieldClass} />
                  </Field>
                </div>
              </div>
            </div>

            {/* Fillers */}
            <div className="bg-white py-3 px-4 shadow-[0_0_8px_rgba(0,0,0,0.25)] rounded-lg">
              <p className="font-bold text-[#2D317F] border-b border-b-[#8fa3c1] pb-1 mb-1.5">Fillers</p>
              <Field className="flex-col w-full">
                <FieldLabel className="text-base font-semibold text-[#2D317F]">Fillers Description</FieldLabel>
                <Input
                  value={currentTransaction.fillers}
                  onChange={handleChange('fillers')}
                  placeholder="Fillers Description"
                  readOnly={txnLocked}
                  className={`border-0 rounded h-12 w-full ${txnLocked ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'bg-[#E6EEF6]'}`} />
              </Field>
            </div>

          </div>

          {/* RIGHT COLUMN */}
          <div className="flex flex-col gap-3 flex-1">

            {/* Documents */}
            <div className="bg-white py-3 px-4 shadow-[0_0_8px_rgba(0,0,0,0.25)] rounded-lg">
              <p className="font-bold text-[#2D317F] border-b border-b-[#8fa3c1] pb-1 mb-1.5">Documents</p>
              <div className="flex gap-9 w-full">

                {/* WTS + AI */}
                <div className="flex flex-col flex-1 gap-2">
                  <Field className="flex-col w-full">
                    <FieldLabel className="text-base font-semibold text-[#2D317F]">WTS #</FieldLabel>
                    <Input
                      value={currentTransaction.wts}
                      onChange={handleNumericInput('wts', 8)}
                      placeholder="WTS #"
                      disabled={lockedDocs.wts || txnLocked}
                      className={(lockedDocs.wts || txnLocked) ? lockedClass : inputClass} />
                  </Field>
                  <Field className="flex-col w-full">
                    <FieldLabel className="text-base font-semibold text-[#2D317F]">AI #</FieldLabel>
                    <Input
                      value={currentTransaction.aiNo}
                      onChange={handleNumericInput('aiNo', 8)}
                      placeholder="AI #"
                      readOnly={txnLocked}
                      className={fieldClass} />
                  </Field>
                </div>

                {/* WSR + OR */}
                <div className="flex flex-col flex-1 gap-2">
                  <Field className="flex-col w-full">
                    <FieldLabel className="text-base font-semibold text-[#2D317F]">WSR #</FieldLabel>
                    <Input
                      value={currentTransaction.wsr}
                      onChange={handleNumericInput('wsr', 8)}
                      placeholder="WSR #"
                      disabled={lockedDocs.wsr || txnLocked}
                      className={(lockedDocs.wsr || txnLocked) ? lockedClass : inputClass} />
                  </Field>
                  <Field className="flex-col w-full">
                    <FieldLabel className="text-base font-semibold text-[#2D317F]">OR #</FieldLabel>
                    <Input
                      value={currentTransaction.orNo}
                      onChange={handleNumericInput('orNo', 8)}
                      placeholder="OR #"
                      readOnly={txnLocked}
                      className={fieldClass} />
                  </Field>
                </div>

                {/* WSI + Transaction */}
                <div className="flex flex-col flex-1 gap-2">
                  <Field className="flex-col w-full">
                    <FieldLabel className="text-base font-semibold text-[#2D317F]">WSI #</FieldLabel>
                    <Input
                      value={currentTransaction.wsi}
                      onChange={handleNumericInput('wsi', 8)}
                      placeholder="WSI #"
                      disabled={lockedDocs.wsi || txnLocked}
                      className={(lockedDocs.wsi || txnLocked) ? lockedClass : inputClass} />
                  </Field>
                  <Field className="flex-col w-full">
                    <FieldLabel className="text-base font-semibold text-[#2D317F]">Transaction</FieldLabel>
                    <Select
                      value={currentTransaction.transaction}
                      onValueChange={(val) => setField('transaction', val)}
                      disabled={txnLocked}
                    >
                      <SelectTrigger className={`${fieldClass} px-2 text-sm`}>
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        {getTransactionOptions(currentTransaction).map(opt => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>

              </div>
            </div>

            {/* Receipt + Issue side by side */}
            <div className="flex gap-3 flex-1">

              {/* Receipt */}
              <div className={`bg-white py-3 px-4 shadow-[0_0_8px_rgba(0,0,0,0.25)] rounded-lg flex-1 ${(sectionLock.receipt || txnLocked) ? 'opacity-50 pointer-events-none' : ''}`}>
                <p className="font-bold text-[#2D317F] border-b border-b-[#8fa3c1] pb-1 mb-1.5 text-center">Receipts</p>
                <div className="flex flex-col gap-3">
                  <Field className="flex-col w-full">
                    <FieldLabel className="text-base font-semibold text-[#2D317F]">Bags</FieldLabel>
                    <Input value={currentTransaction.rBags} onChange={handleNumericInput('rBags', 3)} placeholder="000" className={inputClass} />
                  </Field>
                  <Field className="flex-col w-full">
                    <FieldLabel className="text-base font-semibold text-[#2D317F]">GKg</FieldLabel>
                    <Input value={currentTransaction.rGkg}  onChange={handleNumericInput('rGkg', 9)}  placeholder="000000" className={inputClass} />
                  </Field>
                  <Field className="flex-col w-full">
                    <FieldLabel className="text-base font-semibold text-[#2D317F]">NKg</FieldLabel>
                    <Input value={currentTransaction.rNkg}  onChange={handleNumericInput('rNkg', 9)}  placeholder="000000" className={inputClass} />
                  </Field>
                  <Field className="flex-col w-full">
                    <FieldLabel className="text-base font-semibold text-[#2D317F]">Condition</FieldLabel>
                    <Select value={currentTransaction.rCondition} onValueChange={(val) => setField('rCondition', val)}>
                      <SelectTrigger className={`${inputClass} px-2 text-sm`}><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent>
                        {CONDITION_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
              </div>

              {/* Issue */}
              <div className={`bg-white py-3 px-4 shadow-[0_0_8px_rgba(0,0,0,0.25)] rounded-lg flex-1 ${(sectionLock.issue || txnLocked) ? 'opacity-50 pointer-events-none' : ''}`}>
                <p className="font-bold text-[#2D317F] border-b border-b-[#8fa3c1] pb-1 mb-1.5 text-center">Issues</p>
                <div className="flex flex-col gap-3">
                  <Field className="flex-col w-full">
                    <FieldLabel className="text-base font-semibold text-[#2D317F]">Bags</FieldLabel>
                    <Input value={currentTransaction.iBags} onChange={handleNumericInput('iBags', 3)} placeholder="000" className={inputClass} />
                  </Field>
                  <Field className="flex-col w-full">
                    <FieldLabel className="text-base font-semibold text-[#2D317F]">GKg</FieldLabel>
                    <Input value={currentTransaction.iGkg}  onChange={handleNumericInput('iGkg', 9)}  placeholder="000000" className={inputClass} />
                  </Field>
                  <Field className="flex-col w-full">
                    <FieldLabel className="text-base font-semibold text-[#2D317F]">NKg</FieldLabel>
                    <Input value={currentTransaction.iNkg}  onChange={handleNumericInput('iNkg', 9)}  placeholder="000000" className={inputClass} />
                  </Field>
                  <Field className="flex-col w-full">
                    <FieldLabel className="text-base font-semibold text-[#2D317F]">Condition</FieldLabel>
                    <Select value={currentTransaction.iCondition} onValueChange={(val) => setField('iCondition', val)}>
                      <SelectTrigger className={`${inputClass} px-2 text-sm`}><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent>
                        {CONDITION_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Bottom buttons */}
        <div className="flex-shrink-0 mt-[15px] flex items-center justify-between gap-2.5">

          {/* Pagination */}
          <div className="flex items-center">
            <button
              onClick={handlePrev}
              disabled={isFirstTransaction || saving}
              className={`px-[18px] py-0.5 border-none rounded-lg text-[20px] ${isFirstTransaction ? 'bg-[#2D317F] text-gray-400 cursor-not-allowed opacity-50' : 'bg-[#2D317F] text-white cursor-pointer'}`}
            >{'<'}</button>
            <span className="text-sm text-[#2d317f] font-semibold px-2 mt-0.5">
              {currentIndex + 1} of {transactions.length}
            </span>
            <button
              onClick={handleNext}
              disabled={isLastTransaction || saving}
              className={`px-[18px] py-0.5 border-none rounded-lg text-[20px] ${isLastTransaction ? 'bg-[#2D317F] text-gray-400 cursor-not-allowed opacity-50' : 'bg-[#2D317F] text-white cursor-pointer'}`}
            >{'>'}</button>
          </div>

          {/* Actions */}
          <div className="flex gap-5">

            {/* Cancel */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="px-[18px] text-sm text-[#5B5B5B] border-none bg-[#d9d9d9] rounded-lg cursor-pointer shadow-[0_6px_4px_-4px_rgba(0,0,0,0.2)]">
                  Cancel
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent className="pt-0 px-0 bg-[#E6EEF6] pb-0 gap-0 !max-w-[320px] overflow-hidden rounded-[10px] border-none">
                <div className="h-5 bg-[#BB2325] rounded-t-lg" />
                <AlertDialogHeader className="p-5 text-center items-center pb-4">
                  <div className="rounded-full px-4 py-4 bg-[#BB2325]">
                    <FaExclamation color="white" size={33} />
                  </div>
                  <AlertDialogTitle className="!font-bold text-[#BB2325] text-[23px] mx-2">
                    {isEditMode ? 'Cancel Editing?' : 'Cancel Creating?'}
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-[12px] px-2">
                    {isEditMode ? 'Are you sure you want to quit editing?' : 'Are you sure you want to quit creating a report?'}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mx-0 mb-0 bg-transparent flex flex-row !justify-center gap-3 border-0 -mt-5">
                  <AlertDialogCancel className="w-23 px-1.5 py-2">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="w-23 !bg-[#BB2325] text-white hover:bg-[#770e10] px-1.5 py-2"
                    onClick={() => navigate('/whse/management', { state: { refresh: Date.now() } })}
                  >Yes</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Add Transaction */}
            <button
              onClick={handleAddTransaction}
              disabled={saving}
              className="bg-[#2D317F] rounded-lg shadow-[0_6px_4px_-4px_rgba(0,0,0,0.2)] text-sm text-white cursor-pointer px-4 py-2 disabled:opacity-50"
            >
              {saving ? 'Saving...' : '+ Add Transaction'}
            </button>

            {/* Submit All */}
            <button
              onClick={handleSubmitAll}
              disabled={saving}
              className="text-white bg-[#3E7A43] py-2 rounded-lg shadow-[0_6px_4px_-4px_rgba(0,0,0,0.2)] text-sm px-[18px] disabled:opacity-50"
            >
              Submit All
            </button>

          </div>
        </div>

      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={handleImport}
      />

    {/* toasts */}
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className="flex items-center gap-3 bg-white rounded-lg shadow-2xl px-5 py-4 min-w-[300px]"
          style={{ borderLeft: `4px solid ${toast.color}` }}
        >
          <div className="rounded-full p-1.5 flex-shrink-0" style={{ backgroundColor: toast.color }}>
            <FaCheck size={16} color="white" />
          </div>
          <div>
            <p className="font-bold text-sm" style={{ color: toast.color }}>
              {toast.color === '#BB2325' ? 'Error!' : 'Success!'}
            </p>
            <p className="text-gray-500 text-xs">{toast.message}</p>
          </div>
        </div>
      ))}
    </div>
    </>
  );
}