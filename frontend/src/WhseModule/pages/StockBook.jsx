// react
import { useState, useEffect, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"

// api
import api from "@/api/axios"

// notif
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { getNotifRoute } from "@/utils/Import & Export/getNotifRoute"
import { useUnreadCount } from "@/hooks/useUnreadCount"

// toast
import { useToast } from "@/hooks/useToast"
import { Toast } from "@/components/Toast"

// components
import Header from '../../components/Header'

// shadcn
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"

// icons
import { GoLinkExternal } from "react-icons/go"
import { FiEdit, FiRotateCcw, FiAlertCircle } from "react-icons/fi"
import { IoClose } from "react-icons/io5"
import { TbFileSearch } from "react-icons/tb"
import { FaRegCircleCheck } from "react-icons/fa6"
import { CiImport } from "react-icons/ci"
import { FaSearch, FaBars } from "react-icons/fa"

const ITEMS_PER_PAGE = 8

const MONTHS = [
  'January','February','March','April',
  'May','June','July','August',
  'September','October','November','December',
]

const STATUS = {
  inProgress:  'In Progress',
  completed:   'Completed',
  underReview: 'Under Review',
}

const CEREAL = {
  palay: 'WD1G50',
  rice:  'PD1350',
}

const CEREAL_LABEL = { [CEREAL.palay]: 'Palay', [CEREAL.rice]: 'Rice' }

const getStatusStyle = (status) => {
  const base = "px-3 py-2 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 w-30 pl-4"
  if (status === STATUS.inProgress)  return `${base} bg-[#F0E48B] text-[#856404]`
  if (status === STATUS.completed)   return `${base} bg-[#8BF093] text-[#3E7A43]`
  if (status === STATUS.underReview) return `${base} bg-[#D6E4FF] text-[#1D3A8A] text-[10px]`
  return base
}

const getStatusIcon = (status) => {
  if (status === STATUS.inProgress)  return <div className="w-3 h-3 border-2 border-[#856404] border-t-transparent rounded-full animate-spin flex-shrink-0" />
  if (status === STATUS.completed)   return <FaRegCircleCheck size={16} />
  if (status === STATUS.underReview) return <TbFileSearch size={16} />
  return null
}

const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).replace(/ /g, '-')
}

const isDateInFuture = (year, month, day) => {
  const selected = new Date(Number(year), Number(month) - 1, Number(day))
  const today    = new Date()
  today.setHours(0, 0, 0, 0)
  return selected > today
}

const getDaysInMonth = (year, month) => {
  if (!month) return 31
  return new Date(year || 2024, Number(month), 0).getDate()
}

function AlertModal({ open, onClose, title, message, accentColor = '#BB2325' }) {
  return (
    <AlertDialog open={open} onOpenChange={(val) => { if (!val) onClose() }}>
      <AlertDialogContent className="pt-0 px-0 bg-[#E6EEF6] pb-0 gap-0 !max-w-[320px] overflow-hidden rounded-[10px] border-none">
        <div className="h-5 rounded-t-lg" style={{ backgroundColor: accentColor }} />
        <AlertDialogHeader className="p-5 text-center items-center pb-4">
          <div className="rounded-full px-4 py-4" style={{ backgroundColor: accentColor }}>
            <FiAlertCircle color="white" size={33} />
          </div>
          <AlertDialogTitle className="!font-bold text-[23px] mx-2" style={{ color: accentColor }}>
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[12px] text-gray-600">
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mx-0 mb-0 bg-transparent flex flex-row !justify-center gap-3 border-0 pb-5 -mt-5">
          <AlertDialogAction
            className="px-4 py-1.5 text-white"
            style={{ backgroundColor: accentColor }}
            onClick={onClose}
          >
            Okay
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function StockbookDialogFields({ color, selectedType, setSelectedType, selectedYear, setSelectedYear, selectedMonth, setSelectedMonth, selectedDay, setSelectedDay, error }) {
  return (
    <>
      {/* Cereal type */}
      <Select value={selectedType} onValueChange={setSelectedType}>
        <SelectTrigger className="w-full bg-white font-semibold py-5" style={{ borderColor: color, color }}>
          <SelectValue placeholder="Select cereal type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem className="p-2" value={CEREAL.palay}>Palay</SelectItem>
          <SelectItem className="p-2" value={CEREAL.rice}>Rice</SelectItem>
        </SelectContent>
      </Select>

      {/* Date fields */}
      <div className="flex gap-3 mt-3">
        <div className="flex-1">
          <label className="text-sm font-semibold" style={{ color }}>Year</label>
          <Input
            type="text" inputMode="numeric" placeholder="2026" value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value.replace(/\D/g, '').slice(0, 4))}
            className="bg-white mt-1" style={{ borderColor: color, color }}
          />
        </div>
        <div className="flex-1">
          <label className="text-sm font-semibold" style={{ color }}>Month</label>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-full bg-white font-semibold mt-1" style={{ borderColor: color, color }}>
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((m, i) => (
                <SelectItem key={i} className="p-2" value={String(i + 1)}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-20">
          <label className="text-sm font-semibold" style={{ color }}>Day</label>
          <Select value={selectedDay} onValueChange={setSelectedDay}>
            <SelectTrigger className="w-full bg-white font-semibold mt-1" style={{ borderColor: color, color }}>
              <SelectValue placeholder="Day" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: getDaysInMonth(selectedYear, selectedMonth) }, (_, i) => i + 1)
                .map(d => <SelectItem key={d} className="p-2" value={String(d)}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Inline error */}
      {error && (
        <p className="flex items-center gap-1.5 text-red-500 text-xs mt-3 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <span>⊙</span> {error}
        </p>
      )}
    </>
  )
}

// Custom hook: dialog date/cereal fields state
function useDialogFields() {
  const [selectedType,  setSelectedType]  = useState('')
  const [selectedYear,  setSelectedYear]  = useState('')
  const [selectedMonth, setSelectedMonth] = useState('')
  const [selectedDay,   setSelectedDay]   = useState('')
  const [dialogError,   setDialogError]   = useState('')

  const reset = () => {
    setSelectedType('')
    setSelectedYear('')
    setSelectedMonth('')
    setSelectedDay('')
    setDialogError('')
  }

  return {
    selectedType, setSelectedType,
    selectedYear, setSelectedYear,
    selectedMonth, setSelectedMonth,
    selectedDay, setSelectedDay,
    dialogError, setDialogError,
    reset,
  }
}

export default function StockBook() {
  // notif
  const currentUser  = useCurrentUser()
  const notifRoute   = getNotifRoute(currentUser)
  const userName     = currentUser ? `${currentUser.fname} ${currentUser.lname}` : 'User'
  const unreadCount  = useUnreadCount()

  // toast
  const { toasts, addToast } = useToast()

  const navigate = useNavigate()
  const location = useLocation()

  // data
  const [stockReports, setStockReports] = useState([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState(null)

  // table filters + pagination
  const [currentPage,    setCurrentPage]    = useState(1)
  const [selectedCereal, setSelectedCereal] = useState('All Cereal Type')
  const [search,         setSearch]         = useState('')

  // action states
  const [submitting,   setSubmitting]   = useState(false)
  const [unsubmitting, setUnsubmitting] = useState(null) 

  // dialog open states
  const [addDialogOpen,    setAddDialogOpen]    = useState(false)
  const [importDialogOpen, setImportDialogOpen] = useState(false)

  // import state
  const importFileRef = useRef(null)
  const [importing,             setImporting]             = useState(false)
  const [importedTransactions,  setImportedTransactions]  = useState([])
  const [importedFileName,      setImportedFileName]      = useState('')

  // alert modal state
  const [alertModal, setAlertModal] = useState({ open: false, title: '', message: '', accentColor: '#BB2325' })
  const showAlert  = (title, message, accentColor = '#BB2325') => setAlertModal({ open: true, title, message, accentColor })
  const closeAlert = () => setAlertModal(prev => ({ ...prev, open: false }))

  // separate field state for each dialog to avoid coupling
  const addFields    = useDialogFields()
  const importFields = useDialogFields()

  // Data fetching
  const fetchStocks = async () => {
    try {
      setLoading(true)
      const res    = await api.get('/reports/stocks/')
      const sorted = [...res.data].sort((a, b) => b.report_id - a.report_id)
      setStockReports(sorted)
    } catch (err) {
      console.error('Failed to fetch stock books:', err)
      setError('Failed to load stock books. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStocks()

    const handleFocus = () => fetchStocks()
    const handleVisibility = () => { if (document.visibilityState === 'visible') fetchStocks() }

    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibility)

    // Cleanup both listeners on unmount
    return () => {
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

  // Filtering & Pagination
  const filteredReports = stockReports
    .filter(r => r.Status !== 'Archived')
    .filter(r => selectedCereal === 'All Cereal Type' || r.CerealType === selectedCereal)
    .filter(r => {
      const term = search.toLowerCase()
      return (
        String(r.report_id).includes(term) ||
        (r.CerealType || '').toLowerCase().includes(term) ||
        (r.Date || '').includes(term)
      )
    })

  const totalPages       = Math.ceil(filteredReports.length / ITEMS_PER_PAGE)
  const startIndex       = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedReports = filteredReports.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  const handleCerealChange = (val) => { setSelectedCereal(val); setCurrentPage(1) }

  // Validation helper
  const validateDialogFields = (fields) => {
    if (!fields.selectedType)                                                    return 'Please select a cereal type.'
    if (!fields.selectedYear || !fields.selectedMonth || !fields.selectedDay)   return 'Please fill in all date fields (year, month, and day).'
    const yearNum = parseInt(fields.selectedYear)
    if (isNaN(yearNum) || yearNum < 1900 || yearNum > 2100)                     return 'Please enter a valid year (e.g. 2026).'
    if (isDateInFuture(fields.selectedYear, fields.selectedMonth, fields.selectedDay)) return 'You cannot create a stock book for a future date.'
    return null
  }

  // Add Report
  const handleAddReportClick = () => {
    addFields.reset()
    setAddDialogOpen(true)
  }

  const handleCerealNext = async () => {
    const validationError = validateDialogFields(addFields)
    if (validationError) { addFields.setDialogError(validationError); return }

    try {
      setSubmitting(true)
      const month = String(addFields.selectedMonth).padStart(2, '0')
      const day   = String(addFields.selectedDay).padStart(2, '0')
      const date  = `${addFields.selectedYear}-${month}-${day}`
      const res   = await api.post('/reports/stocks/create/', { CerealType: addFields.selectedType, Date: date })
      const newStock = res.data
      await fetchStocks()
      setAddDialogOpen(false)
      navigate(`/whse/create/${newStock.report_id}`, { state: { stockBook: newStock, mode: 'create' } })
    } catch (err) {
      addFields.setDialogError(err.response?.data?.error || 'Failed to create stock book.')
    } finally {
      setSubmitting(false)
    }
  }

  // Navigation
  const handleEditClick  = (stock) => navigate(`/whse/create/${stock.report_id}`, { state: { stockBook: stock, mode: 'edit' } })
  const handleViewReport = (stock) => navigate(`/whse/view/${stock.report_id}`,   { state: { stockBook: stock } })

  // Unsubmit
  const handleUnsubmit = async (stock) => {
    try {
      setUnsubmitting(stock.report_id)
      await api.post(`/reports/stocks/unsubmit/${stock.report_id}/`)
      await fetchStocks()
      addToast(`Stock Book R-${String(stock.report_id).padStart(3, '0')} successfully unsubmitted.`, 'success')
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to unsubmit. Please try again.', 'error')
    } finally {
      setUnsubmitting(null)
    }
  }

  // Import
  const handleImportClick = () => {
    importFields.reset()
    setImportedTransactions([])
    setImportedFileName('')
    setImportDialogOpen(true)
  }

  const handleImportStockbook = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    try {
      setImporting(true)
      const { parseStockbookExcel } = await import('@/utils/Import & Export/importToExcel')
      const imported = await parseStockbookExcel(file)
      setImportedTransactions(imported)
      setImportedFileName(file.name)
    } catch (err) {
      showAlert('Import Failed', err.message || 'Something went wrong while reading the file. Please try again.', '#1D8104')
    } finally {
      setImporting(false)
    }
  }

  const handleImportCreate = async () => {
    importFields.setDialogError('')
    const validationError = validateDialogFields(importFields)
    if (validationError)                       { importFields.setDialogError(validationError); return }
    if (importedTransactions.length === 0)     { importFields.setDialogError('Please select an Excel file first.'); return }

    try {
      setSubmitting(true)
      const month = String(importFields.selectedMonth).padStart(2, '0')
      const day   = String(importFields.selectedDay).padStart(2, '0')
      const date  = `${importFields.selectedYear}-${month}-${day}`
      const res   = await api.post('/reports/stocks/create/', { CerealType: importFields.selectedType, Date: date })
      const newStock = res.data

      // Import transactions
      const failed = []
      for (const txn of importedTransactions) {
        try {
          await api.post('/reports/transactions/create/', {
            stockbook:         newStock.report_id,
            type:              txn.wts ? 'WTS' : txn.wsr ? 'WSR' : 'WSI',
            Particulars:       txn.particulars      || null,
            Plate_Number:      txn.plateNo          || null,
            Batch_No:          txn.batchNo          || null,
            AI_Number:         txn.aiNo             || null,
            OR_Number:         txn.orNo             || null,
            Transaction_ref:   txn.transaction      || null,
            WTS_no:            txn.wts              || null,
            WSR_no:            txn.wsr              || null,
            WSI_no:            txn.wsi              || null,
            Age:               txn.age              || null,
            Moisture_Content:  txn.moistureContent  || null,
            Classifier:        txn.classifier       || null,
            Pile_No:           txn.pileNo           || null,
            Fillers:           txn.fillers          || null,
            R_Bags:            txn.rBags            || null,
            R_GKG:             txn.rGkg             || null,
            R_NKG:             txn.rNkg             || null,
            Cond_R:            txn.rCondition       || null,
            I_Bags:            txn.iBags            || null,
            I_GKG:             txn.iGkg             || null,
            I_NKG:             txn.iNkg             || null,
            Cond_I:            txn.iCondition       || null,
          })
        } catch (txnErr) {
          console.error(`Failed to import transaction row:`, txnErr)
          failed.push(txn)
        }
      }

      // Log the import audit before navigating
      await api.post('/audit/log-import/', {
        type:  'StockBook',
        id:    newStock.report_id,
        count: importedTransactions.length - failed.length,
      })

      await fetchStocks()
      setImportDialogOpen(false)
      setImportedTransactions([])
      setImportedFileName('')

      if (failed.length > 0) {
        showAlert('Partial Import', `${failed.length} transaction(s) failed to import. The rest were saved successfully.`, '#856404')
      }

      navigate(`/whse/create/${newStock.report_id}`, { state: { stockBook: newStock, mode: 'edit' } })
    } catch (err) {
      importFields.setDialogError(err.response?.data?.error || 'Failed to create stock book.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Header pageTitle="Stock Book" unreadCount={unreadCount} notifTo={notifRoute} userName={userName} />

      {/* Outer card */}
      <div className="bg-[#F5F9F9] mx-4 my-4 flex flex-col shadow-[0_6px_4px_-4px_rgba(0,0,0,0.2)] border border-black/10 rounded-lg !min-h-[653px]">

        {/* Top controls */}
        <div className="flex justify-between items-center mb-4 pt-2 mx-3 flex-shrink-0">
          <div className='mt-4'>
            <div className="bg-white border border-[#2D317F] rounded-full py-1 px-5 flex items-center gap-2 shadow-[0_6px_4px_-4px_rgba(0,0,0,0.2)]">
              <FaBars color={'#2D317F'} size={18} className="shrink-0" />
              <Input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
                placeholder="Search Report"
                className="bg-transparent border-0 placeholder:text-black/50 focus-visible:ring-0 h-8 w-[430px]"
              />
              <FaSearch className="text-[#2D317F] shrink" size={20} />
            </div>
          </div>
          <div className="flex items-center gap-6 mt-3.5">
            {/* Cereal filter */}
            <Select value={selectedCereal} onValueChange={handleCerealChange}>
              <SelectTrigger className="w-40 bg-white border-gray-300 py-5 font-semibold text-[#2D317F] rounded-md shadow-[0_6px_6px_-2px_rgba(0,0,0,0.2)]">
                <SelectValue placeholder="All Cereal Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem className="p-2" value="All Cereal Type">All Cereal Type</SelectItem>
                <SelectItem className="p-2" value={CEREAL.palay}>Palay</SelectItem>
                <SelectItem className="p-2" value={CEREAL.rice}>Rice</SelectItem>
              </SelectContent>
            </Select>

            {/* Import */}
            <button
              onClick={handleImportClick}
              className="bg-[#1D8104] px-5 py-2.5 rounded-md text-white shadow-[0_6px_6px_-2px_rgba(0,0,0,0.2)] font-semibold"
            >
              <div className="flex gap-2 items-center"><CiImport size={20} /><p className="text-sm">Import</p></div>
            </button>

            {/* Add */}
            <Button
              onClick={handleAddReportClick}
              className="bg-[#2D317F] text-white rounded-md py-5 w-35 font-semibold hover:bg-[#1f2360] shadow-[0_6px_6px_-2px_rgba(0,0,0,0.2)]"
            >
              + Add Report
            </Button>
          </div>
        </div>

        {/* Table section */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-[#2D317F]">
                <div className="w-8 h-8 border-4 border-[#2D317F] border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-medium">Loading stock book...</span>
              </div>
            </div>
          ) : error ? (
            <div className="flex-1 flex items-center justify-center text-red-400 text-sm">{error}</div>
          ) : (
            <>
              {/* Fixed table header */}
              <table className="w-full table-fixed flex-shrink-0">
                <colgroup>
                  <col className="w-[15%]" /><col className="w-[20%]" />
                  <col className="w-[20%]" /><col className="w-[20%]" />
                  <col className="w-[25%]" />
                </colgroup>
                <thead>
                  <tr className="bg-[#E2EBFF] border-b border-gray-200 h-12">
                    {['Date', 'Stock Book ID', 'Cereal Type', 'Status', 'Action'].map(h => (
                      <th key={h} className="text-[#2D317F] font-bold text-center text-sm xl:text-base">{h}</th>
                    ))}
                  </tr>
                </thead>
              </table>

              {/* Scrollable table body */}
              <div className="overflow-y-auto flex-1">
                <table className="w-full table-fixed">
                  <colgroup>
                    <col className="w-[15%]" /><col className="w-[20%]" />
                    <col className="w-[20%]" /><col className="w-[20%]" />
                    <col className="w-[25%]" />
                  </colgroup>
                  <tbody>
                    {filteredReports.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center text-gray-400 py-10">No stock books found.</td>
                      </tr>
                    ) : (
                      paginatedReports.map(r => (
                        <tr key={r.report_id} className="border-b border-gray-100">
                          <td className="text-center text-[#2D317F] py-3 text-sm">{formatDate(r.Date)}</td>
                          <td className="text-center text-[#2D317F] py-3 text-sm">R-{String(r.report_id).padStart(3, '0')}</td>
                          <td className="text-center text-[#2D317F] py-3 text-sm">{CEREAL_LABEL[r.CerealType] || r.CerealType}</td>
                          <td className="text-center py-3">
                            <span className={getStatusStyle(r.Status)}>
                              {getStatusIcon(r.Status)}
                              {r.Status}
                            </span>
                          </td>
                          <td className="text-center py-3">
                            <div className="flex justify-center gap-2">
                              {/* View */}
                              <button
                                onClick={() => handleViewReport(r)}
                                className="flex items-center gap-1.5 border border-[#2D317F] rounded-full px-3 py-1.5 text-[#2D317F] text-sm font-medium bg-white hover:bg-[#2D317F] hover:text-white transition-colors duration-300"
                              >
                                <GoLinkExternal size={14} /> View
                              </button>

                              {/* Edit */}
                              <button
                                disabled={r.Status === STATUS.completed || r.Status === STATUS.underReview}
                                onClick={() => handleEditClick(r)}
                                className="flex items-center gap-1.5 border border-[#2D317F] rounded-full px-3 py-1.5 text-[#2D317F] text-sm font-medium bg-white hover:bg-[#2D317F] hover:text-white transition-colors duration-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed disabled:hover:bg-gray-100 disabled:hover:text-gray-400"
                              >
                                <FiEdit size={14} /> Edit
                              </button>

                              {/* Unsubmit — only for Under Review */}
                              {r.Status === STATUS.underReview && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <button
                                      disabled={unsubmitting === r.report_id}
                                      className="flex items-center border border-[#BB2325] text-[#BB2325] text-sm rounded-full px-2 py-1.5 bg-white hover:bg-[#BB2325] hover:text-white transition-colors duration-500 disabled:opacity-50"
                                    >
                                      <IoClose size={18} /> Unsubmit
                                    </button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent className="pt-0 px-0 bg-[#E6EEF6] pb-0 gap-0 !max-w-[320px] overflow-hidden rounded-[10px] border-none">
                                    <div className="h-5 bg-[#BB2325] rounded-t-lg" />
                                    <AlertDialogHeader className="p-5 text-center items-center pb-4">
                                      <div className="rounded-full px-4 py-4 bg-[#BB2325]">
                                        <FiRotateCcw color="white" size={33} />
                                      </div>
                                      <AlertDialogTitle className="!font-bold text-[#BB2325] text-[23px] mx-2">
                                        Unsubmit Stockbook?
                                      </AlertDialogTitle>
                                      <AlertDialogDescription className="text-[12px] px-2">
                                        Are you sure you want to unsubmit your stock book?
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter className="mx-0 mb-0 -mt-4 bg-transparent flex flex-row !justify-center gap-3 border-0">
                                      <AlertDialogCancel className="text-xs w-23 px-4 py-1.5">Stay</AlertDialogCancel>
                                      <AlertDialogAction
                                        className="text-xs w-23 !bg-[#BB2325] text-white hover:bg-[#981416] px-4 py-1.5"
                                        onClick={() => handleUnsubmit(r)}
                                      >
                                        Yes
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-5 py-[12px] flex-shrink-0 border-t border-gray-100">
                <span className="text-[13px] text-gray-500 font-medium">
                  {totalPages > 0 ? `Page ${currentPage} of ${totalPages}` : '—'}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(p => p - 1)}
                    disabled={currentPage === 1 || totalPages === 0}
                    className="px-[18px] py-[7px] rounded-md text-[13px] font-semibold text-[#2d317f] bg-[#e2e8f0] border-[1.5px] border-[#e2e8f0] cursor-pointer transition-colors duration-150 hover:bg-[#d1d9e6] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => p + 1)}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="px-[18px] py-[7px] rounded-md text-[13px] font-semibold text-white bg-[#2d317f] border-[1.5px] border-[#2d317f] cursor-pointer transition-colors duration-150 hover:bg-[#222669] hover:border-[#222669] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Add Report dialog */}
        <Dialog open={addDialogOpen} onOpenChange={(open) => { setAddDialogOpen(open); if (!open) addFields.reset() }}>
          <DialogContent className="pt-0 px-0 pb-0 overflow-hidden max-w-[90vw] sm:max-w-[500px] xl:max-w-[315px] [&>button]:hidden bg-[#DDE4F3]">
            <div className="bg-[#2D317F] h-6 rounded-t-lg" />
            <div className="px-5 pb-5">
              <DialogHeader className="mb-3">
                <DialogTitle className="text-[#2D317F] font-bold py-2">Cereal Type</DialogTitle>
              </DialogHeader>
              <StockbookDialogFields
                color="#2D317F"
                selectedType={addFields.selectedType}   setSelectedType={addFields.setSelectedType}
                selectedYear={addFields.selectedYear}   setSelectedYear={addFields.setSelectedYear}
                selectedMonth={addFields.selectedMonth} setSelectedMonth={addFields.setSelectedMonth}
                selectedDay={addFields.selectedDay}     setSelectedDay={addFields.setSelectedDay}
                error={addFields.dialogError}
              />
              <div className="flex justify-end gap-3 mt-5">
                <button onClick={() => setAddDialogOpen(false)} className="border border-gray-300 px-4 py-1.5 rounded-lg text-sm text-[#919191] bg-[#D9D9D9]">
                  Cancel
                </button>
                <button
                  onClick={handleCerealNext}
                  disabled={!addFields.selectedType || submitting}
                  className="bg-[#2D317F] text-white px-4 py-1.5 rounded-lg text-sm hover:bg-[#1f2360] disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Creating...' : 'Create'}
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Import dialog */}
        <Dialog open={importDialogOpen} onOpenChange={(open) => { setImportDialogOpen(open); if (!open) { importFields.reset(); setImportedTransactions([]); setImportedFileName('') } }}>
          <DialogContent className="pt-0 px-0 pb-0 overflow-hidden max-w-[90vw] sm:max-w-[500px] xl:max-w-[315px] [&>button]:hidden bg-[#DDE4F3]">
            <div className="bg-[#1D8104] h-6 rounded-t-lg" />
            <div className="px-5 pb-5">
              <DialogHeader className="mb-3">
                <DialogTitle className="text-[#1D8104] font-bold py-2">Import Stockbook</DialogTitle>
              </DialogHeader>
              <StockbookDialogFields
                color="#1D8104"
                selectedType={importFields.selectedType}   setSelectedType={importFields.setSelectedType}
                selectedYear={importFields.selectedYear}   setSelectedYear={importFields.setSelectedYear}
                selectedMonth={importFields.selectedMonth} setSelectedMonth={importFields.setSelectedMonth}
                selectedDay={importFields.selectedDay}     setSelectedDay={importFields.setSelectedDay}
                error={importFields.dialogError}
              />

              {/* File drop zone */}
              <div
                onClick={() => {
                  if (!importFields.selectedType || !importFields.selectedYear || !importFields.selectedMonth || !importFields.selectedDay) {
                    showAlert('Missing Information', 'Please select a cereal type and fill in the date fields before uploading a file.', '#1D8104')
                    return
                  }
                  importFileRef.current?.click()
                }}
                className="mt-4 border-2 border-dashed border-[#1D8104] rounded-lg p-6 text-center cursor-pointer hover:bg-green-50 transition-colors"
              >
                <CiImport size={32} className="mx-auto text-[#1D8104] mb-2" />
                {importing ? (
                  <p className="text-sm font-semibold text-[#1D8104]">Parsing file...</p>
                ) : importedFileName ? (
                  <>
                    <p className="text-sm font-semibold text-[#1D8104]">✓ {importedFileName}</p>
                    <p className="text-xs text-gray-400 mt-1">{importedTransactions.length} transaction(s) ready — click Create to proceed</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-[#1D8104]">Click to select Excel file</p>
                    <p className="text-xs text-gray-400 mt-1">.xlsx or .xls</p>
                  </>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button onClick={() => setImportDialogOpen(false)} className="border border-gray-300 px-4 py-1.5 rounded-lg text-sm text-[#919191] bg-[#D9D9D9]">
                  Cancel
                </button>
                <button
                  onClick={handleImportCreate}
                  disabled={submitting || importedTransactions.length === 0}
                  className="bg-[#1D8104] text-white px-4 py-1.5 rounded-lg text-sm hover:bg-[#166303] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submitting ? 'Creating...' : 'Create'}
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

      </div>

      {/* Hidden file input for import */}
      <input ref={importFileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImportStockbook} />

      {/* Alert modal for non-recoverable errors */}
      <AlertModal
        open={alertModal.open}
        onClose={closeAlert}
        title={alertModal.title}
        message={alertModal.message}
        accentColor={alertModal.accentColor}
      />

      {/* Toast notifications */}
      <Toast toasts={toasts} />
    </>
  )
}