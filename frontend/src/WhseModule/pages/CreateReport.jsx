// react
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import Header from '../../components/Header'

// shadcn
import { Input } from "@/components/ui/input"
import { Field, FieldLabel } from "@/components/ui/field"
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

// react icons
import { CiExport, CiImport } from "react-icons/ci";
import { FaExclamation } from "react-icons/fa"

// api
import api from "@/api/axios";

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
  if (hasWTS) return { wsr: true, wsi: true, wts: false };
  if (hasWSR) return { wts: true, wsi: true, wsr: false };
  if (hasWSI) return { wts: true, wsr: true, wsi: false };
  return { wts: false, wsr: false, wsi: false };
};

const getSectionLock = (txn) => {
  const hasWTS = txn.wts && String(txn.wts).trim() !== '';
  const hasWSR = txn.wsr && String(txn.wsr).trim() !== '';
  const hasWSI = txn.wsi && String(txn.wsi).trim() !== '';
  if (hasWTS) return { receipt: false, issue: false };
  if (hasWSR) return { receipt: false, issue: true };
  if (hasWSI) return { receipt: true,  issue: false };
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
  id:               txn.transaction_id,
  particulars:      txn.Particulars      || '',
  plateNo:          txn.Plate_Number     || '',
  batchNo:          txn.Batch_No         || '',
  aiNo:             txn.AI_Number        || '',
  orNo:             txn.OR_Number        || '',
  transaction:      txn.Transaction_ref  || '',
  wts:              txn.WTS_no           || '',
  wsr:              txn.WSR_no           || '',
  wsi:              txn.WSI_no           || '',
  age:              txn.Age              || '',
  classifier:       txn.Classifier       || '',
  moistureContent:  txn.Moisture_Content || '',
  pileNo:           txn.Pile_No          || '',
  fillers:          txn.Fillers          || '',
  rBags:            txn.R_Bags           || '',
  rGkg:             txn.R_GKG            || '',
  rNkg:             txn.R_NKG            || '',
  rCondition:       txn.Cond_R           || '',
  iBags:            txn.I_Bags           || '',
  iGkg:             txn.I_GKG            || '',
  iNkg:             txn.I_NKG            || '',
  iCondition:       txn.Cond_I           || '',
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

const PILE_NO_REGEX = /^(([1-9]|1[0-5])[AB]?)$/;
const MOISTURE_REGEX = /^\d{0,2}(\.\d{0,2})?$/;
const AGE_REGEX = /^\d{0,2}(\.\d{0,4})?$/;

const getTransactionOptions = (txn) => {
  const hasWSR = txn.wsr && String(txn.wsr).trim() !== '';
  const hasWSI = txn.wsi && String(txn.wsi).trim() !== '';
  const hasReceipt = txn.rBags || txn.rGkg || txn.rNkg;
  const hasIssue   = txn.iBags || txn.iGkg || txn.iNkg;
  if (hasWSR || hasReceipt) return TRANSACTION_OPTIONS.receipt;
  if (hasWSI || hasIssue)   return TRANSACTION_OPTIONS.issue;
  return [...TRANSACTION_OPTIONS.receipt, ...TRANSACTION_OPTIONS.issue];
};

export default function CreateReport() {
  const { id }       = useParams();  
  const navigate     = useNavigate();
  const location     = useLocation();

  //  stockBook state: prefer location.state, fall back to API fetch 
  const [stockBook,  setStockBook]  = useState(location.state?.stockBook ?? null);
  const [loadError,  setLoadError]  = useState(null);
  const [loadingBook, setLoadingBook] = useState(!location.state?.stockBook);

  const mode       = location.state?.mode ?? 'edit';
  const isEditMode = mode === 'edit';

  useEffect(() => {
    // If we already have it from navigation state, skip fetch
    if (stockBook) {
      setLoadingBook(false);
      return;
    }
    if (!id) {
      setLoadError("No report ID found in URL.");
      setLoadingBook(false);
      return;
    }
    api.get(`/reports/stocks/upd/${id}`)
      .then(res => {
        setStockBook(res.data);
        setLoadingBook(false);
      })
      .catch(() => {
        setLoadError("Failed to load report. Please go back and try again.");
        setLoadingBook(false);
      });
  }, [id]);

  //  transactions: seed once stockBook is ready 
  const [transactions,  setTransactions]  = useState([{ ...emptyTransaction }]);
  const [currentIndex,  setCurrentIndex]  = useState(0);
  const [saving,        setSaving]        = useState(false);
  const transactionsSeeded = useRef(false);

  useEffect(() => {
    if (!stockBook || transactionsSeeded.current) return;
    transactionsSeeded.current = true;

    const raw = stockBook.transactions;
    const editIndex = location.state?.editIndex ?? 0;

    if (!raw?.length) {
      setTransactions([{ ...emptyTransaction }]);
      setCurrentIndex(0);
    } else if ('id' in raw[0] || 'particulars' in raw[0]) {
      setTransactions(raw);
      setCurrentIndex(Math.max(0, Math.min(editIndex, raw.length - 1)));
    } else {
      const mapped = raw.map(mapFromBackend);
      setTransactions(mapped);
      setCurrentIndex(Math.max(0, Math.min(editIndex, mapped.length - 1)));
    }
  }, [stockBook]);

  // Early returns for loading / error
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

  // Derived values
  const reportId   = stockBook.report_id;
  const cerealType = stockBook.CerealType ?? '—';
  const status     = stockBook.Status ?? 'In Progress';
  const badgeConfig = STATUS_CONFIG[status] ?? STATUS_CONFIG['In Progress'];
  const whseUser   = JSON.parse(localStorage.getItem('user') || '{}');

  const currentTransaction = transactions[currentIndex] ?? { ...emptyTransaction };
  const lockedDocs         = getLockedDocs(currentTransaction);
  const sectionLock        = getSectionLock(currentTransaction);
  const isFirstTransaction = currentIndex === 0;
  const isLastTransaction  = currentIndex === transactions.length - 1;

  // Auto-save debounce 
  const debounceTimer = useRef(null);

  useEffect(() => {
    const hasData = Object.entries(currentTransaction)
      .filter(([k]) => k !== 'id')
      .some(([, v]) => String(v).trim() !== '');
    if (!hasData) return;

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      saveTransaction(transactions, currentIndex);
    }, 1000);

    return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current); };
  }, [currentTransaction]);

  //  Handlers functions
  const handleChange = (field) => (e) => {
    setTransactions(prev => prev.map((t, i) =>
      i === currentIndex ? { ...t, [field]: e.target.value } : t
    ));
  };

  const handleNumericInput = (field, maxLen) => (e) => {
  const val = e.target.value.replace(/\D/g, '').slice(0, maxLen);
  setTransactions(prev => prev.map((t, i) =>
    i === currentIndex ? { ...t, [field]: val } : t
  ));
};

const handleTextOnly = (field) => (e) => {
  const val = e.target.value.replace(/[^a-zA-Z\s]/g, '');
  setTransactions(prev => prev.map((t, i) =>
    i === currentIndex ? { ...t, [field]: val } : t
  ));
};

  const handleAgeInput = (e) => {
    const val = e.target.value;
    if (AGE_REGEX.test(val)) handleChange('age')({ target: { value: val } });
  };

  const handleMoistureInput = (e) => {
    const val = e.target.value;
    if (MOISTURE_REGEX.test(val)) handleChange('moistureContent')({ target: { value: val } });
  };

  const handlePileNoInput = (e) => {
    const val = e.target.value.toUpperCase().slice(0, 3);
    // Allow partial input while typing: digits optionally followed by A or B
    if (/^([1-9]|1[0-5]?)?[AB]?$/.test(val) || val === '') {
      handleChange('pileNo')({ target: { value: val } });
    }
  };

  const saveTransaction = async (snapshot, idxToSave) => {
    const stockbookId = stockBook?.report_id;
    if (!stockbookId) return snapshot;

    const current = snapshot[idxToSave];
    const hasData = Object.entries(current)
      .filter(([k]) => k !== 'id')
      .some(([, v]) => String(v).trim() !== '');
    if (!hasData) return snapshot;

    try {
      setSaving(true);
      if (current.id) {
        await api.put(`/reports/transactions/upd/${current.id}`, mapToBackend(current, stockbookId));
        return snapshot;
      } else {
        const res = await api.post('/reports/transactions/create/', mapToBackend(current, stockbookId));
        const updated = snapshot.map((t, i) =>
          i === idxToSave ? { ...t, id: res.data.transaction_id } : t
        );
        setTransactions(updated);
        return updated;
      }
    } catch (err) {
      console.error('Save failed:', err.response?.data || err);
      const errData = err.response?.data;
      const message = typeof errData === 'string'
        ? 'Server error. Please check your input and try again.'
        : JSON.stringify(errData, null, 2) || 'Failed to save transaction.';
      alert(message);
      return snapshot;
    } finally {
      setSaving(false);
    }
  };

  const handlePrev = async () => {
    if (isFirstTransaction) return;
    await saveTransaction(transactions, currentIndex);
    setCurrentIndex(prev => prev - 1);
  };

  const handleNext = async () => {
    if (isLastTransaction) return;
    await saveTransaction(transactions, currentIndex);
    setCurrentIndex(prev => prev + 1);
  };

  const handleAddTransaction = async () => {
    const latest = await saveTransaction(transactions, currentIndex);
    const next = [...latest, { ...emptyTransaction }];
    setTransactions(next);
    setCurrentIndex(next.length - 1);
  };

  const handleSubmitAll = async () => {
    const latestTransactions = await saveTransaction(transactions, currentIndex);
    navigate(`/whse/create/${id}/review`, {
      state: { stockBook, mode, transactions: latestTransactions },
    });
  };

  // class helpers 
  const lockedClass = 'bg-gray-100 border-0 rounded h-8 w-full cursor-not-allowed opacity-50';
  const inputClass  = 'bg-[#E6EEF6] border-0 rounded h-7 w-full';

  return (
    <>
      <Header pageTitle="Stock Book" notifTo="/admin/notif" unreadCount={5} userName="Raph Nigos" />

      <div className="mx-4 my-4 mt-2 pb-50 flex flex-col rounded-lg !min-h-[640px]">

        {/* Info bar */}
        <div className="shadow-[0_6px_4px_-4px_rgba(0,0,0,0.2)] flex-shrink-0 flex flex-wrap gap-[30px] rounded-lg items-center bg-white px-3 py-2 text-sm text-[#2d317f] ">
          <div><strong>Report ID:</strong> R-{String(reportId).padStart(3, '0')}</div>
          <div><strong>Warehouse Supervisor:</strong> {whseUser?.fname} {whseUser?.lname}</div>
          <div><strong>Cereal Type:</strong> {cerealType}</div>
          <div><strong>Warehouse Code:</strong> {whseUser?.WHCode ?? '—'}</div>
          <div className="flex items-center gap-2">
            <strong>Status:</strong>
            <span className={badgeConfig.className}>{badgeConfig.label}</span>
          </div>
          <div className="flex gap-5 ml-auto">
            <button className="shadow-[0_6px_4px_-4px_rgba(0,0,0,0.2)] cursor-pointer transition-opacity duration-200 hover:opacity-70 bg-[#1D8104] text-white rounded-lg px-3 py-1 flex items-center gap-2">
              <CiImport size={21} color="white" /> Import
            </button>
            <button className="shadow-[0_6px_4px_-4px_rgba(0,0,0,0.2)] cursor-pointer transition-opacity duration-200 hover:opacity-70 bg-[#1D8104] text-white rounded-lg px-3 py-1 flex items-center gap-2">
              <CiExport size={21} color="white" /> Export
            </button>
          </div>
        </div>

        {/* Form sections */}
        <div className="mt-2 overflow-x-auto w-full flex gap-3 bg-[#F5F9F9] py-2 px-2 rounded-lg border border-black/5 shadow-[0_6px_4px_-4px_rgba(0,0,0,0.2)]">

          {/* LEFT COLUMN: Delivery & Vehicle + Quality Metrics + Fillers */}
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
                      className="bg-[#E6EEF6] border-0 rounded h-12 w-full" />
                </Field>
                <div className="flex gap-4">
                  <Field className="flex-col flex-1">
                    <FieldLabel className="text-sm font-semibold text-[#2D317F]">Plate #</FieldLabel>
                    <Input 
                      value={currentTransaction.plateNo} 
                      onChange={(e) => {
                        const val = e.target.value.slice(0, 6);
                        setTransactions(prev => prev.map((t, i) => i === currentIndex ? { ...t, plateNo: val } : t));
                      }}
                      maxLength={6}
                      placeholder="ABC123"
                      className="bg-[#E6EEF6] border-0 rounded h-7" />
                  </Field>
                  <Field className="flex-col flex-1">
                    <FieldLabel className="text-sm font-semibold text-[#2D317F]">Batch No.</FieldLabel>
                    <Input 
                      value={currentTransaction.batchNo} 
                      onChange={handleNumericInput('batchNo', 2)}
                      maxLength={2}
                      placeholder="01"
                      className="bg-[#E6EEF6] border-0 rounded h-7" />
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
                      type="number" 
                      placeholder="0.000"
                      className={inputClass} />
                  </Field>
                  <Field className="flex-col w-full">
                    <FieldLabel className="text-sm font-semibold text-[#2D317F]">Moisture Content (%)</FieldLabel>
                    <Input 
                      value={currentTransaction.moistureContent} 
                      onChange={handleMoistureInput} 
                      placeholder="10.01"
                      className={inputClass} />
                  </Field>
                </div>
                <div className="flex flex-col flex-1 gap-3">
                  <Field className="flex-col w-full">
                    <FieldLabel className="text-sm font-semibold text-[#2D317F]">Classifier</FieldLabel>
                    <Input 
                      value={currentTransaction.classifier} 
                      onChange={handleTextOnly('classifier')} 
                      placeholder="Classifier" 
                      className={inputClass} />
                  </Field>
                  <Field className="flex-col w-full">
                    <FieldLabel className="text-sm font-semibold text-[#2D317F]">Pile No.</FieldLabel>
                    <Input 
                      value={currentTransaction.pileNo} 
                      onChange={handlePileNoInput} 
                      placeholder="1A – 15B"
                      maxLength={3}
                      className={inputClass} />
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
                  className="bg-[#E6EEF6] border-0 rounded h-12 w-full" />
              </Field>
            </div>

          </div>

          {/* RIGHT COLUMN: Documents + Receipt & Issue */}
          <div className="flex flex-col gap-3 flex-1">

            {/* Documents */}
            <div className="bg-white py-3 px-4 shadow-[0_0_8px_rgba(0,0,0,0.25)] rounded-lg">
              <p className="font-bold text-[#2D317F] border-b border-b-[#8fa3c1] pb-1 mb-1.5">Documents</p>
              <div className="flex gap-9 w-full">
                <div className="flex flex-col flex-1 gap-2">
                  <Field className="flex-col w-full">
                    <FieldLabel className="text-base font-semibold text-[#2D317F]">WTS #</FieldLabel>
                    <Input 
                      value={currentTransaction.wts} 
                      onChange={handleNumericInput('wts', 8)}
                      placeholder="WTS #"
                      disabled={lockedDocs.wts} 
                      className={lockedDocs.wts ? lockedClass : inputClass} />
                  </Field>
                  <Field className="flex-col w-full">
                    <FieldLabel className="text-base font-semibold text-[#2D317F]">AI #</FieldLabel>
                    <Input 
                      value={currentTransaction.aiNo} 
                      onChange={handleNumericInput('aiNo', 8)}
                      placeholder="AI #" 
                      className={inputClass} />
                  </Field>
                </div>
                <div className="flex flex-col flex-1 gap-2">
                  <Field className="flex-col w-full">
                    <FieldLabel className="text-base font-semibold text-[#2D317F]">WSR #</FieldLabel>
                    <Input 
                      value={currentTransaction.wsr} 
                      onChange={handleNumericInput('wsr', 8)}
                      placeholder="WSR #" 
                      disabled={lockedDocs.wsr} 
                      className={lockedDocs.wsr ? lockedClass : inputClass} />
                  </Field>
                  <Field className="flex-col w-full">
                    <FieldLabel className="text-base font-semibold text-[#2D317F]">OR #</FieldLabel>
                    <Input 
                      value={currentTransaction.orNo} 
                      onChange={handleNumericInput('orNo', 8)}
                      placeholder="OR #"
                      className={inputClass} />
                  </Field>
                </div>
                <div className="flex flex-col flex-1 gap-2">
                  <Field className="flex-col w-full">
                    <FieldLabel className="text-base font-semibold text-[#2D317F]">WSI #</FieldLabel>
                    <Input 
                      value={currentTransaction.wsi} 
                      onChange={handleNumericInput('wsi', 8)}
                      placeholder="WSI #"
                      disabled={lockedDocs.wsi} 
                      className={lockedDocs.wsi ? lockedClass : inputClass} />
                  </Field>
                  <Field className="flex-col w-full">
                    <FieldLabel className="text-base font-semibold text-[#2D317F]">Transaction</FieldLabel>
                    <Select
                      value={currentTransaction.transaction}
                      onValueChange={(val) => handleChange('transaction')({ target: { value: val } })}
                    >
                      <SelectTrigger className={`${inputClass} px-2 text-sm`}>
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
              <div className={`bg-white py-3 px-4 shadow-[0_0_8px_rgba(0,0,0,0.25)] rounded-lg flex-1 ${sectionLock.receipt ? 'opacity-50 pointer-events-none' : ''}`}>
                <p className="font-bold text-[#2D317F] border-b border-b-[#8fa3c1] pb-1 mb-1.5 text-center">Receipts</p>
                <div className="flex flex-col gap-3">
                  <Field className="flex-col w-full">
                    <FieldLabel className="text-base font-semibold text-[#2D317F]">Bags</FieldLabel>
                    <Input 
                      value={currentTransaction.rBags} 
                      onChange={handleNumericInput('rBags', 3)}
                      placeholder="000"
                      maxLength={3}
                      className={inputClass} />
                  </Field>
                  <Field className="flex-col w-full">
                    <FieldLabel className="text-base font-semibold text-[#2D317F]">GKg</FieldLabel>
                    <Input 
                      value={currentTransaction.rGkg} 
                      onChange={handleNumericInput('rGkg', 9)}
                      placeholder="000000"
                      className={inputClass} />
                  </Field>
                  <Field className="flex-col w-full">
                    <FieldLabel className="text-base font-semibold text-[#2D317F]">NKg</FieldLabel>
                    <Input 
                      value={currentTransaction.rNkg} 
                      onChange={handleNumericInput('rNkg', 9)}
                      placeholder="000000"
                      className={inputClass} />
                  </Field>
                  <Field className="flex-col w-full">
                    <FieldLabel className="text-base font-semibold text-[#2D317F]">Condition</FieldLabel>
                    <Select
                      value={currentTransaction.rCondition}
                      onValueChange={(val) => handleChange('rCondition')({ target: { value: val } })}
                    >
                      <SelectTrigger className={`${inputClass} px-2 text-sm`}>
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        {CONDITION_OPTIONS.map(opt => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
              </div>

              {/* Issue */}
              <div className={`bg-white py-3 px-4 shadow-[0_0_8px_rgba(0,0,0,0.25)] rounded-lg flex-1 ${sectionLock.issue ? 'opacity-50 pointer-events-none' : ''}`}>
                <p className="font-bold text-[#2D317F] border-b border-b-[#8fa3c1] pb-1 mb-1.5 text-center">Issues</p>
                <div className="flex flex-col gap-3">
                  <Field className="flex-col w-full">
                    <FieldLabel className="text-base font-semibold text-[#2D317F]">Bags</FieldLabel>
                    <Input 
                      value={currentTransaction.iBags} 
                      onChange={handleNumericInput('iBags', 3)}
                      placeholder="000"
                      maxLength={3}
                      className={inputClass} />
                  </Field>
                  <Field className="flex-col w-full">
                    <FieldLabel className="text-base font-semibold text-[#2D317F]">GKg</FieldLabel>
                    <Input 
                      value={currentTransaction.iGkg}
                      onChange={handleNumericInput('iGkg', 9)}
                      placeholder="000000"
                      className={inputClass} />
                  </Field>
                  <Field className="flex-col w-full">
                    <FieldLabel className="text-base font-semibold text-[#2D317F]">NKg</FieldLabel>
                    <Input 
                      value={currentTransaction.iNkg} 
                      onChange={handleNumericInput('iNkg', 9)}
                      placeholder="000000"
                      className={inputClass} />
                  </Field>
                  <Field className="flex-col w-full">
                    <FieldLabel className="text-base font-semibold text-[#2D317F]">Condition</FieldLabel>
                    <Select
                      value={currentTransaction.iCondition}
                      onValueChange={(val) => handleChange('iCondition')({ target: { value: val } })}
                    >
                      <SelectTrigger className={`${inputClass} px-2 text-sm`}>
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        {CONDITION_OPTIONS.map(opt => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* ── Bottom buttons ── */}
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
                <button className="px-[18px] text-sm text-[#5B5B5B] border-none bg-[#d9d9d9] rounded-lg cursor-pointer shadow-[0_6px_4px_-4px_rgba(0,0,0,0.2)]">Cancel</button>
              </AlertDialogTrigger>
              <AlertDialogContent className="pt-0 px-0 bg-[#E6EEF6] pb-0 gap-0 max-w-[90vw] md:max-w-[600px] xl:max-w-[650px] overflow-hidden rounded-[10px] border-none">
                <div className="h-7 bg-[#BB2325] rounded-t-lg" />
                <AlertDialogHeader className="p-5 text-center items-center pb-4">
                  <div className="rounded-full px-5 py-5 bg-[#BB2325]">
                    <FaExclamation color="white" size={60} />
                  </div>
                  <AlertDialogTitle className="!font-bold text-[#BB2325] text-2xl mx-2">
                    {isEditMode ? 'Cancel Editing?' : 'Cancel Creating?'}
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-sm px-2">
                    {isEditMode ? 'Are you sure you want to quit editing?' : 'Are you sure you want to quit creating a report?'}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mx-0 mb-0 bg-transparent flex flex-row !justify-center gap-3 border-0 -mt-5">
                  <AlertDialogCancel className="w-23 px-5 py-4.5">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="w-23 !bg-[#BB2325] text-white hover:bg-[#770e10] px-5 py-4.5"
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
    </>
  );
}