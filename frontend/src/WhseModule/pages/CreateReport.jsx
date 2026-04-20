// react
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

// shadcn
import { Input } from "@/components/ui/input"
import { Field, FieldLabel } from "@/components/ui/field"
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog"

// react icons
import { CiExport, CiImport } from "react-icons/ci";
import { FaExclamation } from "react-icons/fa"

export default function CreateReport() {
  const { cereal } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const stockBook = location.state?.stockBook ?? null;
  const mode = location.state?.mode ?? "create";

  const isEditMode = mode === "edit";
  const editIndex = location.state?.editIndex ?? 0

  const reportId = stockBook?.StockBook_ID ?? "—";
  const cerealType = stockBook?.CerealType ?? cereal ?? "—";
  const status = stockBook?.Status ?? "In Progress";

  const STATUS_CONFIG = {
    "In Progress": {
      label: "In Progress",
      className: "inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[13px] font-semibold whitespace-nowrap bg-[#F0E48B] text-[#856404]",
    },
    "Under Review": {
      label: "Under Review",
      className: "inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[13px] font-semibold whitespace-nowrap bg-[#ADCEFF] text-blue-800",
    },
  };
  const badgeConfig = STATUS_CONFIG[status] ?? STATUS_CONFIG["In Progress"];

  const emptyTransaction = {
    year: "", month: "", particulars: "", plateNo: "", batchNo: "",
    wts: "", wsr: "", wsi: "", aiNo: "", orNo: "", transaction: "",
    age: "", classifier: "", moistureContent: "", pileNo: "",
    rBags: "", rGkg: "", rNkg: "", rCondition: "",
    iBags: "", iGkg: "", iNkg: "", iCondition: "",
    fillers: "",
    bBags: "", bGkg: "", bNkg: "", bCondition: "",
  }

  const [transactions, setTransactions] = useState(
    stockBook?.transactions?.length
      ? stockBook.transactions
      : [{ ...emptyTransaction }]
  )

  const safeIndex = Math.min(editIndex, (stockBook?.transactions?.length ?? 1) - 1)
  const [currentIndex, setCurrentIndex] = useState(safeIndex)
  const currentTransaction = transactions[currentIndex]

  const handleChange = (field) => (e) => {
    setTransactions(prev => prev.map((t, i) =>
      i === currentIndex ? { ...t, [field]: e.target.value } : t
    ))
  }

  const isFirstTransaction = currentIndex === 0
  const isLastTransaction = currentIndex === transactions.length - 1

  // handle navigation button
  const handlePrev = () => setCurrentIndex(prev => prev - 1)
  const handleNext = () => setCurrentIndex(prev => prev + 1)
  
  const handleAddTransaction = () => {
    if (isLastTransaction) {
      setTransactions(prev => [ ...prev, { ...emptyTransaction}])
    }
    setCurrentIndex(prev => prev + 1)
  }

  const handleSubmitAll = () => {
    const payload = {
      CerealType: cerealType,
      ...(isEditMode && { StockBook_ID: reportId }),
      Status: "Under Review",
      transactions: transactions.filter(t =>
        Object.values(t).some(v => v !== "")
      ),
    }
    navigate(`/whse/create/${cereal}/review`, {
      state: {
        payload,
        header: { reportId, cerealType, status, mode },
        allTransactions: transactions,
      }
    })
  }

  return (
    <div className="flex flex-col min-h-full p-5 box-border">

      {/* header */}
      <div className="flex-shrink-0 flex gap-[30px] items-center bg-white px-5 py-3 text-sm text-[#2d317f] border border-[#cfd6e0]">
        <div>
          <strong>Report ID:</strong> {reportId}
        </div>
        <div className="flex items-center gap-2.5">
          <strong>Warehouse Supervisor:</strong>
        </div>
        <div>
          <strong>Cereal Type:</strong> {cerealType}
        </div>
        <div className="flex items-center gap-2.5">
          <strong>Warehouse Code:</strong>
        </div>
        <div className="flex items-center gap-2">
          <strong>Status:</strong>
          <div className={badgeConfig.className}>{badgeConfig.label}</div>
        </div>
        <div className="flex gap-5 ml-auto">
          <button className="cursor-pointer transition-opacity duration-200 hover:opacity-70 border border-[#3e7a43] bg-transparent rounded-lg px-2 py-1">
            <CiImport size={25} color="#3E7A43" />
          </button>
          <button className="cursor-pointer transition-opacity duration-200 hover:opacity-70 bg-[#1d8104] text-white rounded-lg px-3 py-1 flex items-center gap-1">
            <CiExport size={25} color="white" />
            Export
          </button>
        </div>
      </div>

      {/* container for form */}
      <div className="mt-[15px] overflow-x-auto w-full flex flex-col gap-3">

        {/* first layer */}
        <div className="bg-white py-4 px-5 ">
          <p className="font-bold text-[#2D317F] border-b-[#8fa3c1] border-b pb-2 mb-3">Deliver & Vehicle Information</p>

            <div className="flex gap-9 w-full">
              {/* year and month */}
              <div>
                <Field className="flex-col w-fit">
                  <FieldLabel className="text-base font-semibold text-[#2D317F]" htmlFor="firstName">Year</FieldLabel>
                  <Input
                    value={currentTransaction.year}
                    onChange={handleChange("year")}
                    type='number'
                    placeholder="Year"
                    className="bg-[#E6EEF6] border-0 rounded h-8 w-full"
                  />
                  <FieldLabel className="text-base font-semibold text-[#2D317F]" htmlFor="firstName">Month</FieldLabel>
                  <Input
                    value={currentTransaction.month}
                    onChange={handleChange("month")}
                    placeholder="Month"
                    className="bg-[#E6EEF6] border-0 rounded h-8 w-full"
                  />
                </Field>
              </div>
              {/* Particulars */}
              <div className="flex-1">
                <Field className="flex w-full">
                  <FieldLabel className="text-base font-semibold text-[#2D317F]" htmlFor="firstName">Particulars</FieldLabel>
                  <Input
                    value={currentTransaction.particulars}
                    onChange={handleChange("particulars")}
                    placeholder="Particulars"
                    className="bg-[#E6EEF6] border-0 rounded pb-21 pt-5 "
                  />
                </Field>
              </div>
              {/* plate # and batch # */}
              <div className="flex gap-10 flex-1">
                <Field className="flex flex-1">
                  <FieldLabel className="text-base font-semibold text-[#2D317F]" htmlFor="firstName">Plate #</FieldLabel>
                  <Input
                    value={currentTransaction.plateNo}
                    onChange={handleChange("plateNo")}
                    placeholder="Particulars"
                    className="bg-[#E6EEF6] border-0 rounded h-10"
                  />
                </Field>
                <Field className="flex flex-1">
                  <FieldLabel className="text-base font-semibold text-[#2D317F]" htmlFor="firstName">Batch No.</FieldLabel>
                  <Input
                    value={currentTransaction.batchNo}
                    onChange={handleChange("batchNo")}
                    placeholder="Particulars"
                    className="bg-[#E6EEF6] border-0 rounded h-10"
                  />
                </Field>
              </div>
            </div>

        </div>

        {/* second layer */}
        <div className="flex gap-3 w-full">
          {/* Documents */}
          <div className="bg-white py-4 px-5 flex-1">
            <p className="font-bold text-[#2D317F] border-b-[#8fa3c1] border-b pb-2 mb-3">Documents</p>
            
            <div className="flex gap-9 w-full">
              <div className="flex flex-col flex-1">
                <Field className="flex-col w-full flex-1">
                  <FieldLabel className="text-base font-semibold text-[#2D317F]" htmlFor="firstName">WTS #</FieldLabel>
                  <Input
                    value={currentTransaction.wts}
                    onChange={handleChange("wts")}
                    type='number'
                    placeholder="WTS #"
                    className="bg-[#E6EEF6] border-0 rounded h-8 w-full"
                  />
                  <FieldLabel className="text-base font-semibold text-[#2D317F]" htmlFor="firstName">AI #</FieldLabel>
                  <Input
                    value={currentTransaction.aiNo}
                    onChange={handleChange("aiNo")}
                    placeholder="AI #"
                    className="bg-[#E6EEF6] border-0 rounded h-8 w-full"
                  />
                </Field>
              </div>
              <div className="flex flex-col flex-1">
                <Field className="flex-col w-full flex-1">
                  <FieldLabel className="text-base font-semibold text-[#2D317F]" htmlFor="firstName">WSR #</FieldLabel>
                  <Input
                    value={currentTransaction.wsr}
                    onChange={handleChange("wsr")}
                    type='number'
                    placeholder="WSR #"
                    className="bg-[#E6EEF6] border-0 rounded h-8 w-full"
                  />
                  <FieldLabel className="text-base font-semibold text-[#2D317F]" htmlFor="firstName">OR #</FieldLabel>
                  <Input
                    value={currentTransaction.orNo}
                    onChange={handleChange("orNo")}
                    placeholder="OR #"
                    className="bg-[#E6EEF6] border-0 rounded h-8 w-full"
                  />
                </Field>
              </div>
              <div className="flex flex-col flex-1">
                <Field className="flex-col w-full flex-1">
                  <FieldLabel className="text-base font-semibold text-[#2D317F]" htmlFor="firstName">WSI #</FieldLabel>
                  <Input
                    value={currentTransaction.wsi}
                    onChange={handleChange("wsi")}
                    type='number'
                    placeholder="WSI #"
                    className="bg-[#E6EEF6] border-0 rounded h-8 w-full"
                  />
                  <FieldLabel className="text-base font-semibold text-[#2D317F]" htmlFor="firstName">Transaction</FieldLabel>
                  <Input
                    value={currentTransaction.transaction}
                    onChange={handleChange("transaction")}
                    placeholder="Transaction"
                    className="bg-[#E6EEF6] border-0 rounded h-8 w-full"
                  />
                </Field>
              </div>
            </div>
          </div>

          {/* QUality Metrics */}
          <div className="bg-white py-4 px-5 flex-1">
            <p className="font-bold text-[#2D317F] border-b-[#8fa3c1] border-b pb-2 mb-3">Quality Metrics</p>
          
            {/* Age, Classifier, Moisture Content (%), Pile No. */}
            <div className="flex gap-5">
              <div className="flex flex-col flex-1">
                <Field className="flex-col w-full flex-1">
                  <FieldLabel className="text-base font-semibold text-[#2D317F]" htmlFor="firstName">Age</FieldLabel>
                  <Input
                    value={currentTransaction.age}
                    onChange={handleChange("age")}
                    type='number'
                    placeholder="Age"
                    className="bg-[#E6EEF6] border-0 rounded h-8 w-full"
                  />
                  <FieldLabel className="text-base font-semibold text-[#2D317F]" htmlFor="firstName">Moisture Content (%)</FieldLabel>
                  <Input
                    value={currentTransaction.moistureContent}
                    onChange={handleChange("moistureContent")}
                    placeholder="Moisture Content (%)"
                    className="bg-[#E6EEF6] border-0 rounded h-8 w-full"
                  />
                </Field>
              </div>
              <div className="flex flex-col flex-1">
                <Field className="flex-col w-full flex-1">
                  <FieldLabel className="text-base font-semibold text-[#2D317F]" htmlFor="firstName">Classifier</FieldLabel>
                  <Input
                    value={currentTransaction.classifier}
                    onChange={handleChange("classifier")}
                    placeholder="Classifier"
                    className="bg-[#E6EEF6] border-0 rounded h-8"
                  />
                  <FieldLabel className="text-base font-semibold text-[#2D317F]" htmlFor="firstName">Pile No.</FieldLabel>
                  <Input
                    value={currentTransaction.pileNo}
                    onChange={handleChange("pileNo")}
                    type='number'
                    placeholder="Pile No."
                    className="bg-[#E6EEF6] border-0 rounded h-8"
                  />
                </Field>
              </div>
            </div>
          </div>

        </div>

        {/* third layer */}
        <div className="flex gap-3 w-full">
          {/* Receipts */}
          <div className="bg-white py-4 px-5 flex-1">
            <p className="font-bold text-[#2D317F] border-b-[#8fa3c1] border-b pb-2 mb-3">Receipts</p>
            
            <div className="flex gap-9 w-full">
              <div className="flex flex-col flex-1">
                <Field className="flex-col w-full flex-1">
                  <FieldLabel className="text-base font-semibold text-[#2D317F]" htmlFor="firstName">Bags</FieldLabel>
                  <Input
                    value={currentTransaction.rBags}
                    onChange={handleChange("rBags")}
                    type='number'
                    placeholder="Bags"
                    className="bg-[#E6EEF6] border-0 rounded h-8 w-full"
                  />
                  <FieldLabel className="text-base font-semibold text-[#2D317F]" htmlFor="firstName">Condition</FieldLabel>
                  <Input
                    value={currentTransaction.rCondition}
                    onChange={handleChange("rCondition")}
                    placeholder="Condition"
                    className="bg-[#E6EEF6] border-0 rounded h-8 w-full"
                  />
                </Field>
              </div>
              <div className="flex flex-col flex-1">
                <Field className="flex-col w-full flex-1">
                  <FieldLabel className="text-base font-semibold text-[#2D317F]" htmlFor="firstName">Gkg</FieldLabel>
                  <Input
                    value={currentTransaction.rGkg}
                    onChange={handleChange("rGkg")}
                    type='number'
                    placeholder="Gkg"
                    className="bg-[#E6EEF6] border-0 rounded h-8 w-full"
                  />
                </Field>
              </div>
              <div className="flex flex-col flex-1">
                <Field className="flex-col w-full flex-1">
                  <FieldLabel className="text-base font-semibold text-[#2D317F]" htmlFor="firstName">Nkg</FieldLabel>
                  <Input
                    value={currentTransaction.rNkg}
                    onChange={handleChange("rNkg")}
                    type='number'
                    placeholder="Nkg"
                    className="bg-[#E6EEF6] border-0 rounded h-8 w-full"
                  />
                </Field>
              </div>
            </div>
          </div>

          {/* Issues*/}
          <div className="bg-white py-4 px-5 flex-1">
            <p className="font-bold text-[#2D317F] border-b-[#8fa3c1] border-b pb-2 mb-3">Issues</p>
            
            <div className="flex gap-9 w-full">
              <div className="flex flex-col flex-1">
                <Field className="flex-col w-full flex-1">
                  <FieldLabel className="text-base font-semibold text-[#2D317F]" htmlFor="firstName">Bags</FieldLabel>
                  <Input
                    value={currentTransaction.iBags}
                    onChange={handleChange("iBags")}
                    type='number'
                    placeholder="Bags"
                    className="bg-[#E6EEF6] border-0 rounded h-8 w-full"
                  />
                  <FieldLabel className="text-base font-semibold text-[#2D317F]" htmlFor="firstName">Condition</FieldLabel>
                  <Input
                    value={currentTransaction.iCondition}
                    onChange={handleChange("iCondition")}
                    placeholder="Condition"
                    className="bg-[#E6EEF6] border-0 rounded h-8 w-full"
                  />
                </Field>
              </div>
              <div className="flex flex-col flex-1">
                <Field className="flex-col w-full flex-1">
                  <FieldLabel className="text-base font-semibold text-[#2D317F]" htmlFor="firstName">Gkg</FieldLabel>
                  <Input
                    value={currentTransaction.iGkg}
                    onChange={handleChange("iGkg")}
                    type='number'
                    placeholder="Gkg"
                    className="bg-[#E6EEF6] border-0 rounded h-8 w-full"
                  />
                </Field>
              </div>
              <div className="flex flex-col flex-1">
                <Field className="flex-col w-full flex-1">
                  <FieldLabel className="text-base font-semibold text-[#2D317F]" htmlFor="firstName">Nkg</FieldLabel>
                  <Input
                    value={currentTransaction.iNkg}
                    onChange={handleChange("iNkg")}
                    type='number'
                    placeholder="Nkg"
                    className="bg-[#E6EEF6] border-0 rounded h-8 w-full"
                  />
                </Field>
              </div>
            </div>
          </div>

        </div>

        {/* fourth layer */}
        <div className="flex gap-3 w-full">
          {/* Receipts */}
          <div className="bg-white py-4 px-5 flex-1">
            <p className="font-bold text-[#2D317F] border-b-[#8fa3c1] border-b pb-2 mb-3">Fillers</p>
            
            <div className="flex gap-9 w-full">
              <div className="flex flex-col flex-1">
                <Field className="flex-col w-full flex-1">
                  <FieldLabel className="text-base font-semibold text-[#2D317F]" htmlFor="firstName">Fillers Description</FieldLabel>
                  <Input
                    value={currentTransaction.fillers}
                    onChange={handleChange("fillers")}
                    placeholder="Fillers Description"
                    className="bg-[#E6EEF6] border-0 rounded pt-5 pb-21 w-full"
                  />
                </Field>
              </div>

            </div>
          </div>

          {/* Balances*/}
          <div className="bg-white py-4 px-5 flex-1">
            <p className="font-bold text-[#2D317F] border-b-[#8fa3c1] border-b pb-2 mb-3">Balances</p>
            
            <div className="flex gap-9 w-full">
              <div className="flex flex-col flex-1">
                <Field className="flex-col w-full flex-1">
                  <FieldLabel className="text-base font-semibold text-[#2D317F]" htmlFor="firstName">Bags</FieldLabel>
                  <Input
                    value={currentTransaction.bBags}
                    onChange={handleChange("bBags")}
                    type='number'
                    placeholder="Bags"
                    className="bg-[#E6EEF6] border-0 rounded h-8 w-full"
                  />
                  <FieldLabel className="text-base font-semibold text-[#2D317F]" htmlFor="firstName">Condition</FieldLabel>
                  <Input
                    value={currentTransaction.bCondition}
                    onChange={handleChange("bCondition")}
                    placeholder="Condition"
                    className="bg-[#E6EEF6] border-0 rounded h-8 w-full"
                  />
                </Field>
              </div>
              <div className="flex flex-col flex-1">
                <Field className="flex-col w-full flex-1">
                  <FieldLabel className="text-base font-semibold text-[#2D317F]" htmlFor="firstName">Gkg</FieldLabel>
                  <Input
                    value={currentTransaction.bGkg}
                    onChange={handleChange("bGkg")}
                    type='number'
                    placeholder="Gkg"
                    className="bg-[#E6EEF6] border-0 rounded h-8 w-full"
                  />
                </Field>
              </div>
              <div className="flex flex-col flex-1">
                <Field className="flex-col w-full flex-1">
                  <FieldLabel className="text-base font-semibold text-[#2D317F]" htmlFor="firstName">Nkg</FieldLabel>
                  <Input
                    value={currentTransaction.bNkg}
                    onChange={handleChange("bNkg")}
                    type='number'
                    placeholder="Nkg"
                    className="bg-[#E6EEF6] border-0 rounded h-8 w-full"
                  />
                </Field>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* button */}
      <div className="flex-shrink-0 mt-[15px] flex items-center justify-between gap-2.5">

        <div className="flex justify-end">
          <button
          className={`px-[18px] py-1 border-none rounded-md text-[20px]
            ${isFirstTransaction 
              ? "bg-[#2D317F] text-gray-400 cursor-not-allowed opacity-50" 
              : "bg-[#2D317F] text-white cursor-pointer"
            }`}
          onClick={handlePrev}
          disabled={isFirstTransaction}
          >
           {'<'}
        </button>
          <span className="text-base text-[#2d317f] font-semibold px-2 mt-2.5">
            {currentIndex + 1} of {transactions.length}
          </span>

        <button
          className={`px-[18px] py-1 border-none rounded-md text-[20px]
            ${isLastTransaction 
              ? "bg-[#2D317F] text-gray-400 cursor-not-allowed opacity-50" 
              : "bg-[#2D317F] text-white cursor-pointer"
            }`}
          onClick={handleNext}
          disabled={isLastTransaction}
        >
          {'>'}
        </button>
       </div>

        {/* cancel with alert dialog */}
        <div className="flex gap-5">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="px-[18px] py-2 border-none bg-[#d9d9d9] rounded-md cursor-pointer">
                Cancel
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className='pt-0 px-0 bg-[#E6EEF6] pb-0 gap-0 max-w-[90vw] md:max-w-[600px] xl:max-w-[650px] overflow-hidden rounded-[10px] border-none'>
              <div className='h-7 bg-[#BB2325] rounded-t-lg'></div>
              <AlertDialogHeader className='p-5 text-center items-center pb-4'>
                <div className="rounded-full px-5 py-5 bg-[#BB2325]">
                  <FaExclamation color={'white'} size={60} />
                </div>
                <AlertDialogTitle className='!font-bold text-[#2D317F] text-2xl mx-2'>
                  {isEditMode ? "Cancel Editing?" : "Cancel Creating?"}
                </AlertDialogTitle>
                <AlertDialogDescription className="text-sm px-2">
                  {isEditMode
                    ? "Are you sure you want to quit editing?"
                    : "Are you sure you want to quit creating a report?"
                  }
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className='mx-0 mb-0 bg-transparent flex flex-row !justify-center gap-3 border-0 -mt-5'>
                <AlertDialogCancel className='w-23 px-5 py-4.5'>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className='w-23 !bg-[#BB2325] text-white hover:bg-[#770e10] px-5 py-4.5'
                  onClick={() => navigate("/whse/management")}
                >
                  Yes
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <button onClick={handleAddTransaction} className="bg-[#2D317F] rounded-md text-white cursor-pointer px-2">
            + Add Transaction
          </button>

          <button
            className="text-white bg-[#3E7A43] py-2 rounded-md px-[18px]"
            onClick={handleSubmitAll}
          >
            Submit All
          </button>
        </div>

      </div>

    </div>
  );
}