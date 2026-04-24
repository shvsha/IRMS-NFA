// react
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

// shadcn
import { Input } from "@/components/ui/input"
import { Field, FieldLabel } from "@/components/ui/field"
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog"

// react icons
import { CiExport, CiImport } from "react-icons/ci";
import { FaExclamation } from "react-icons/fa"

// api
import api from "@/api/axios";

// helpers
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
  Particulars:      txn.particulars    || null,
  Plate_Number:     txn.plateNo        || null,
  Batch_No:         txn.batchNo        || null,
  AI_Number:        txn.aiNo           || null,
  OR_Number:        txn.orNo           || null,
  Transaction_ref:  txn.transaction    || null,
  WTS_no:           txn.wts            || null,
  WSR_no:           txn.wsr            || null,
  WSI_no:           txn.wsi            || null,
  Age:              txn.age            || null,
  Moisture_Content: txn.moistureContent|| null,
  Classifier:       txn.classifier     || null,
  Pile_No:          txn.pileNo         || null,
  Fillers:          txn.fillers        || null,
  R_Bags:           txn.rBags          || null,
  R_GKG:            txn.rGkg           || null,
  R_NKG:            txn.rNkg           || null,
  Cond_R:           txn.rCondition     || null,
  I_Bags:           txn.iBags          || null,
  I_GKG:            txn.iGkg           || null,
  I_NKG:            txn.iNkg           || null,
  Cond_I:           txn.iCondition     || null,
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

export default function CreateReport() {
  const { cereal, id } = useParams();
  const navigate   = useNavigate();
  const location   = useLocation();

  const stockBook  = location.state?.stockBook ?? null;
  const mode       = location.state?.mode ?? 'create';
  const isEditMode = mode === 'edit';
  const editIndex  = location.state?.editIndex ?? 0;

  const reportId   = stockBook?.report_id ?? '—';
  const cerealType = stockBook?.CerealType ?? cereal ?? '—';
  const status     = stockBook?.Status ?? 'In Progress';

  const whseUser = JSON.parse(localStorage.getItem('user') || '{}');

  const STATUS_CONFIG = {
    'In Progress':  { label: 'In Progress',  className: 'inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[13px] font-semibold whitespace-nowrap bg-[#F0E48B] text-[#856404]' },
    'Under Review': { label: 'Under Review', className: 'inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[13px] font-semibold whitespace-nowrap bg-[#ADCEFF] text-blue-800' },
  };
  const badgeConfig = STATUS_CONFIG[status] ?? STATUS_CONFIG['In Progress'];

  const seedTransactions = () => {
    const raw = stockBook?.transactions;
    if (!raw?.length) return [{ ...emptyTransaction }];
    if ('id' in raw[0] || 'particulars' in raw[0]) return raw;
    return raw.map(mapFromBackend);
  };

  const [transactions, setTransactions] = useState(seedTransactions);
  const safeIndex = Math.max(0, Math.min(editIndex, transactions.length - 1));
  const [currentIndex, setCurrentIndex] = useState(safeIndex);
  const [saving, setSaving] = useState(false);

  const currentTransaction = transactions[currentIndex];
  const lockedDocs         = getLockedDocs(currentTransaction);
  const sectionLock        = getSectionLock(currentTransaction);
  const isFirstTransaction = currentIndex === 0;
  const isLastTransaction  = currentIndex === transactions.length - 1;

  const debounceTimer = useRef(null);

  // auto save every input
  useEffect(() => {
    const hasData = Object.entries(currentTransaction)
      .filter(([k]) => k !== 'id')
      .some(([, v]) => String(v).trim() !== '');
    if (!hasData) return;

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(() => {
      saveTransaction(transactions, currentIndex);
    }, 1000);

    // cleanup
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [currentTransaction]);

  const handleChange = (field) => (e) => {
    setTransactions(prev => prev.map((t, i) =>
      i === currentIndex ? { ...t, [field]: e.target.value } : t
    ));
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
      alert(JSON.stringify(err.response?.data, null, 2) || 'Failed to save transaction.');
      return snapshot;
    } finally {
      setSaving(false);
    }
  };

  const handlePrev = async () => {
    await saveTransaction(transactions, currentIndex);
    setCurrentIndex(prev => prev - 1);
  };

  const handleNext = async () => {
    await saveTransaction(transactions, currentIndex);
    setCurrentIndex(prev => prev + 1);
  };

  const handleAddTransaction = async () => {
    await saveTransaction(transactions, currentIndex);
    if (isLastTransaction) {
      setTransactions(prev => [...prev, { ...emptyTransaction }]);
    }
    setCurrentIndex(prev => prev + 1);
  };

  const handleSubmitAll = async () => {
    const latestTransactions = await saveTransaction(transactions, currentIndex);
    navigate(`/whse/create/${cereal}/review`, {
      state: {
        stockBook,
        mode,
        transactions: latestTransactions,
      },
    });
  };

  const lockedClass = 'bg-gray-100 border-0 rounded h-8 w-full cursor-not-allowed opacity-50';
  const inputClass  = 'bg-[#E6EEF6] border-0 rounded h-8 w-full';

  return (
    <div className="flex flex-col min-h-full p-5 box-border">

      {/* header */}
      <div className="flex-shrink-0 flex gap-[30px] items-center bg-white px-5 py-3 text-sm text-[#2d317f] border border-[#cfd6e0]">
        <div><strong>Report ID:</strong> R-{String(reportId).padStart(3, '0')}</div>
        <div><strong>Warehouse Supervisor:</strong> {whseUser?.fname} {whseUser?.lname}</div>
        <div><strong>Cereal Type:</strong> {cerealType}</div>
        <div><strong>Warehouse Code:</strong> {whseUser?.WHCode ?? '—'}</div>
        <div className="flex items-center gap-2">
          <strong>Status:</strong>
          <div className={badgeConfig.className}>{badgeConfig.label}</div>
        </div>
        <div className="flex gap-5 ml-auto">
          <button className="cursor-pointer transition-opacity duration-200 hover:opacity-70 border border-[#3e7a43] bg-transparent rounded-lg px-2 py-1">
            <CiImport size={25} color="#3E7A43" />
          </button>
          <button className="cursor-pointer transition-opacity duration-200 hover:opacity-70 bg-[#1d8104] text-white rounded-lg px-3 py-1 flex items-center gap-1">
            <CiExport size={25} color="white" /> Export
          </button>
        </div>
      </div>

      {/* form */}
      <div className="mt-[15px] overflow-x-auto w-full flex flex-col gap-3">

        {/* Delivery & Vehicle */}
        <div className="bg-white py-4 px-5">
          <p className="font-bold text-[#2D317F] border-b-[#8fa3c1] border-b pb-2 mb-3">Deliver & Vehicle Information</p>
          <div className="flex gap-9 w-full">
            <div className="flex-1">
              <Field className="flex w-full">
                <FieldLabel className="text-base font-semibold text-[#2D317F]">Particulars</FieldLabel>
                <Input value={currentTransaction.particulars} onChange={handleChange('particulars')} placeholder="Particulars" className="bg-[#E6EEF6] border-0 rounded pb-21 pt-5" />
              </Field>
            </div>
            <div className="flex gap-10 flex-1">
              <Field className="flex flex-1">
                <FieldLabel className="text-base font-semibold text-[#2D317F]">Plate #</FieldLabel>
                <Input value={currentTransaction.plateNo} onChange={handleChange('plateNo')} placeholder="Plate #" className="bg-[#E6EEF6] border-0 rounded h-10" />
              </Field>
              <Field className="flex flex-1">
                <FieldLabel className="text-base font-semibold text-[#2D317F]">Batch No.</FieldLabel>
                <Input value={currentTransaction.batchNo} onChange={handleChange('batchNo')} placeholder="Batch No." className="bg-[#E6EEF6] border-0 rounded h-10" />
              </Field>
            </div>
          </div>
        </div>

        {/* Documents + Quality Metrics */}
        <div className="flex gap-3 w-full">
          <div className="bg-white py-4 px-5 flex-1">
            <p className="font-bold text-[#2D317F] border-b-[#8fa3c1] border-b pb-2 mb-3">Documents</p>
            <div className="flex gap-9 w-full">
              <div className="flex flex-col flex-1">
                <Field className="flex-col w-full flex-1">
                  <FieldLabel className="text-base font-semibold text-[#2D317F]">WTS #</FieldLabel>
                  <Input value={currentTransaction.wts} onChange={handleChange('wts')} type="number" placeholder="WTS #" disabled={lockedDocs.wts} className={lockedDocs.wts ? lockedClass : inputClass} />
                  <FieldLabel className="text-base font-semibold text-[#2D317F] mt-2">AI #</FieldLabel>
                  <Input value={currentTransaction.aiNo} onChange={handleChange('aiNo')} placeholder="AI #" className={inputClass} />
                </Field>
              </div>
              <div className="flex flex-col flex-1">
                <Field className="flex-col w-full flex-1">
                  <FieldLabel className="text-base font-semibold text-[#2D317F]">WSR #</FieldLabel>
                  <Input value={currentTransaction.wsr} onChange={handleChange('wsr')} type="number" placeholder="WSR #" disabled={lockedDocs.wsr} className={lockedDocs.wsr ? lockedClass : inputClass} />
                  <FieldLabel className="text-base font-semibold text-[#2D317F] mt-2">OR #</FieldLabel>
                  <Input value={currentTransaction.orNo} onChange={handleChange('orNo')} placeholder="OR #" className={inputClass} />
                </Field>
              </div>
              <div className="flex flex-col flex-1">
                <Field className="flex-col w-full flex-1">
                  <FieldLabel className="text-base font-semibold text-[#2D317F]">WSI #</FieldLabel>
                  <Input value={currentTransaction.wsi} onChange={handleChange('wsi')} type="number" placeholder="WSI #" disabled={lockedDocs.wsi} className={lockedDocs.wsi ? lockedClass : inputClass} />
                  <FieldLabel className="text-base font-semibold text-[#2D317F] mt-2">Transaction</FieldLabel>
                  <Input value={currentTransaction.transaction} onChange={handleChange('transaction')} placeholder="Transaction" className={inputClass} />
                </Field>
              </div>
            </div>
          </div>

          {/* Quality Metrics */}
          <div className="bg-white py-4 px-5 flex-1">
            <p className="font-bold text-[#2D317F] border-b-[#8fa3c1] border-b pb-2 mb-3">Quality Metrics</p>
            <div className="flex gap-5">
              <div className="flex flex-col flex-1">
                <Field className="flex-col w-full flex-1">
                  <FieldLabel className="text-base font-semibold text-[#2D317F]">Age</FieldLabel>
                  <Input value={currentTransaction.age} onChange={handleChange('age')} type="number" placeholder="Age" className={inputClass} />
                  <FieldLabel className="text-base font-semibold text-[#2D317F] mt-2">Moisture Content (%)</FieldLabel>
                  <Input value={currentTransaction.moistureContent} onChange={handleChange('moistureContent')} placeholder="Moisture Content (%)" className={inputClass} />
                </Field>
              </div>
              <div className="flex flex-col flex-1">
                <Field className="flex-col w-full flex-1">
                  <FieldLabel className="text-base font-semibold text-[#2D317F]">Classifier</FieldLabel>
                  <Input value={currentTransaction.classifier} onChange={handleChange('classifier')} placeholder="Classifier" className="bg-[#E6EEF6] border-0 rounded h-8" />
                  <FieldLabel className="text-base font-semibold text-[#2D317F] mt-2">Pile No.</FieldLabel>
                  <Input value={currentTransaction.pileNo} onChange={handleChange('pileNo')} type="number" placeholder="Pile No." className="bg-[#E6EEF6] border-0 rounded h-8" />
                </Field>
              </div>
            </div>
          </div>
        </div>

        {/* Receipts + Issues */}
        <div className="flex gap-3 w-full">
          <div className={`bg-white py-4 px-5 flex-1 ${sectionLock.receipt ? 'opacity-50 pointer-events-none' : ''}`}>
            <p className="font-bold text-[#2D317F] border-b-[#8fa3c1] border-b pb-2 mb-3">Receipt</p>
            <div className="flex gap-9 w-full">
              <div className="flex flex-col flex-1">
                <Field className="flex-col w-full flex-1">
                  <FieldLabel className="text-base font-semibold text-[#2D317F]">Bags</FieldLabel>
                  <Input value={currentTransaction.rBags} onChange={handleChange('rBags')} type="number" placeholder="Bags" className={inputClass} />
                  <FieldLabel className="text-base font-semibold text-[#2D317F] mt-2">Condition</FieldLabel>
                  <Input value={currentTransaction.rCondition} onChange={handleChange('rCondition')} placeholder="Condition" className={inputClass} />
                </Field>
              </div>
              <div className="flex flex-col flex-1">
                <Field className="flex-col w-full flex-1">
                  <FieldLabel className="text-base font-semibold text-[#2D317F]">Gkg</FieldLabel>
                  <Input value={currentTransaction.rGkg} onChange={handleChange('rGkg')} type="number" placeholder="Gkg" className={inputClass} />
                </Field>
              </div>
              <div className="flex flex-col flex-1">
                <Field className="flex-col w-full flex-1">
                  <FieldLabel className="text-base font-semibold text-[#2D317F]">Nkg</FieldLabel>
                  <Input value={currentTransaction.rNkg} onChange={handleChange('rNkg')} type="number" placeholder="Nkg" className={inputClass} />
                </Field>
              </div>
            </div>
          </div>

          <div className={`bg-white py-4 px-5 flex-1 ${sectionLock.issue ? 'opacity-50 pointer-events-none' : ''}`}>
            <p className="font-bold text-[#2D317F] border-b-[#8fa3c1] border-b pb-2 mb-3">Issue</p>
            <div className="flex gap-9 w-full">
              <div className="flex flex-col flex-1">
                <Field className="flex-col w-full flex-1">
                  <FieldLabel className="text-base font-semibold text-[#2D317F]">Bags</FieldLabel>
                  <Input value={currentTransaction.iBags} onChange={handleChange('iBags')} type="number" placeholder="Bags" className={inputClass} />
                  <FieldLabel className="text-base font-semibold text-[#2D317F] mt-2">Condition</FieldLabel>
                  <Input value={currentTransaction.iCondition} onChange={handleChange('iCondition')} placeholder="Condition" className={inputClass} />
                </Field>
              </div>
              <div className="flex flex-col flex-1">
                <Field className="flex-col w-full flex-1">
                  <FieldLabel className="text-base font-semibold text-[#2D317F]">Gkg</FieldLabel>
                  <Input value={currentTransaction.iGkg} onChange={handleChange('iGkg')} type="number" placeholder="Gkg" className={inputClass} />
                </Field>
              </div>
              <div className="flex flex-col flex-1">
                <Field className="flex-col w-full flex-1">
                  <FieldLabel className="text-base font-semibold text-[#2D317F]">Nkg</FieldLabel>
                  <Input value={currentTransaction.iNkg} onChange={handleChange('iNkg')} type="number" placeholder="Nkg" className={inputClass} />
                </Field>
              </div>
            </div>
          </div>
        </div>

        {/* Fillers */}
        <div className="flex gap-3 w-full">
          <div className="bg-white py-4 px-5 flex-1">
            <p className="font-bold text-[#2D317F] border-b-[#8fa3c1] border-b pb-2 mb-3">Fillers</p>
            <Field className="flex-col w-full">
              <FieldLabel className="text-base font-semibold text-[#2D317F]">Fillers Description</FieldLabel>
              <Input value={currentTransaction.fillers} onChange={handleChange('fillers')} placeholder="Fillers Description" className="bg-[#E6EEF6] border-0 rounded pt-5 pb-21 w-full" />
            </Field>
          </div>
        </div>

      </div>

      {/* Bottom buttons */}
      <div className="flex-shrink-0 mt-[15px] flex items-center justify-between gap-2.5">
        <div className="flex items-center">
          <button
            className={`px-[18px] py-1 border-none rounded-md text-[20px] ${isFirstTransaction ? 'bg-[#2D317F] text-gray-400 cursor-not-allowed opacity-50' : 'bg-[#2D317F] text-white cursor-pointer'}`}
            onClick={handlePrev}
            disabled={isFirstTransaction || saving}
          >{'<'}</button>
          <span className="text-base text-[#2d317f] font-semibold px-2 mt-0.5">
            {currentIndex + 1} of {transactions.length}
          </span>
          <button
            className={`px-[18px] py-1 border-none rounded-md text-[20px] ${isLastTransaction ? 'bg-[#2D317F] text-gray-400 cursor-not-allowed opacity-50' : 'bg-[#2D317F] text-white cursor-pointer'}`}
            onClick={handleNext}
            disabled={isLastTransaction || saving}
          >{'>'}</button>
        </div>

        <div className="flex gap-5">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="px-[18px] py-2 border-none bg-[#d9d9d9] rounded-md cursor-pointer">Cancel</button>
            </AlertDialogTrigger>
            <AlertDialogContent className="pt-0 px-0 bg-[#E6EEF6] pb-0 gap-0 max-w-[90vw] md:max-w-[600px] xl:max-w-[650px] overflow-hidden rounded-[10px] border-none">
              <div className="h-7 bg-[#BB2325] rounded-t-lg" />
              <AlertDialogHeader className="p-5 text-center items-center pb-4">
                <div className="rounded-full px-5 py-5 bg-[#BB2325]">
                  <FaExclamation color="white" size={60} />
                </div>
                <AlertDialogTitle className="!font-bold text-[#2D317F] text-2xl mx-2">
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

          <button
            onClick={handleAddTransaction}
            disabled={saving}
            className="bg-[#2D317F] rounded-md text-white cursor-pointer px-2 disabled:opacity-50"
          >
            {saving ? 'Saving...' : '+ Add Transaction'}
          </button>

          <button
            className="text-white bg-[#3E7A43] py-2 rounded-md px-[18px] disabled:opacity-50"
            onClick={handleSubmitAll}
            disabled={saving}
          >
            Submit All
          </button>
        </div>
      </div>
    </div>
  );
}