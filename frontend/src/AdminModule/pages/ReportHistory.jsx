// react
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

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
import { DailyFilter } from '../../components/filters/DailyFilter'
import { WeeklyFilter } from '../../components/filters/WeeklyFilter'
import { MonthlyFilter } from '../../components/filters/MonthlyFilter'

// export utils
import { exportWSRToExcel, exportWSIToExcel, exportSummaryToExcel } from '@/utils/Import & Export/exportToExcel'

// shadcn
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

// icons
import { FaSearch, FaBars } from "react-icons/fa"
import { GoLinkExternal } from "react-icons/go"
import { CiExport } from "react-icons/ci"
import { FaRegCalendarAlt } from "react-icons/fa"
import { FiCheckSquare } from "react-icons/fi"
import { ChevronDown } from "lucide-react"

const ITEMS_PER_PAGE = 7

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]

// Agency info 
const AGENCY_INFO = {
  region:    'Region 1',
  province:  'La Union',
  whName:    'San Juan GID 2A',
  whAddress: 'San Juan, La Union',
}

const WAREHOUSE_OPTIONS = [
  { label: 'All Warehouses', value: 'All Warehouses' },
  { label: 'Warehouse 1',    value: '010501A' },
  { label: 'Warehouse 2',    value: '010502A' },
]

/** Merges WSR, WSI, and Summary data into a unified row shape, sorted by ID descending */
function buildRows(stocks, wsrReports, wsiReports, summaries) {
  const rows = []

  wsrReports
    .filter(r => r.Evaluation === 'Archive')
    .forEach(r => {
      const stock = stocks.find(s => s.report_id === r.stockbook)
      rows.push({
        date:        stock?.Date        ?? '—',
        reportid:    `WSR-${r.wsr_report_id}`,
        reporttype:  'Statement of Receipts',
        whse:        stock?.user_WHCode ?? '—',
        cerealtype:  stock?.CerealType  ?? '—',
        summaryId:   null,
        stockbookId: stock?.report_id   ?? null,
        wsrId:       r.wsr_report_id,
        wsiId:       null,
      })
    })

  wsiReports
    .filter(r => r.Evaluation === 'Archive')
    .forEach(r => {
      const stock = stocks.find(s => s.report_id === r.stockbook)
      rows.push({
        date:        stock?.Date        ?? '—',
        reportid:    `WSI-${r.wsi_report_id}`,
        reporttype:  'Statement of Issuance',
        whse:        stock?.user_WHCode ?? '—',
        cerealtype:  stock?.CerealType  ?? '—',
        summaryId:   null,
        stockbookId: stock?.report_id   ?? null,
        wsrId:       null,
        wsiId:       r.wsi_report_id,
      })
    })

  summaries.forEach(s => {
    const stock = stocks.find(st => st.report_id === s.stockbook)
    if (stock?.Status === 'Archived') {
      const cerealTypes = [...new Set(
        (s.rows ?? []).map(r => r.cerealType).filter(c => c && c !== '—')
      )]
      const cerealDisplay = cerealTypes.length === 0
        ? (s.CerealType ?? '—')
        : cerealTypes.length === 1
          ? cerealTypes[0]
          : 'Mixed Cereal'

      rows.push({
        date:        s.date_covered ?? '—',
        reportid:    `SUM-${s.summary_id}`,
        reporttype:  'Summary of Warehouse Reports',
        whse:        s.WHCode       ?? '—',
        cerealtype:  cerealDisplay,
        summaryId:   s.summary_id,
        stockbookId: s.stockbook,
        wsrId:       null,
        wsiId:       null,
      })
    }
  })

  rows.sort((a, b) => {
    const idA = parseInt(a.reportid.split('-').pop())
    const idB = parseInt(b.reportid.split('-').pop())
    return idB - idA
  })

  return rows
}

/* Date range filter */
function matchesDateFilter(report, rangeDate, selectedDate, selectedWeek, weeklyYear, weeklyMonth, selectedMonth, monthlyYear) {
  if (!report.date || report.date === '—') return true

  const reportDate = new Date(report.date)

  if (rangeDate === 'Daily' && selectedDate) {
    return (
      reportDate.getFullYear() === selectedDate.getFullYear() &&
      reportDate.getMonth()    === selectedDate.getMonth()    &&
      reportDate.getDate()     === selectedDate.getDate()
    )
  }

  if (rangeDate === 'Weekly' && selectedWeek) {
    const firstOfMonth  = new Date(weeklyYear, weeklyMonth, 1)
    const firstDayOfWeek = firstOfMonth.getDay()
    const weekStart     = new Date(weeklyYear, weeklyMonth, 1 + (selectedWeek - 1) * 7 - firstDayOfWeek)
    const weekEnd       = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)
    weekEnd.setHours(23, 59, 59, 999)
    return reportDate >= weekStart && reportDate <= weekEnd
  }

  if (rangeDate === 'Monthly' && selectedMonth) {
    const monthIndex = MONTHS.indexOf(selectedMonth)
    return (
      reportDate.getFullYear() === monthlyYear &&
      reportDate.getMonth()    === monthIndex
    )
  }

  return true
}

/* Builds the export payload*/
function buildExportPayload(g, reportId, type) {
  return {
    date:                 g.date,
    ...AGENCY_INFO,
    officer:              g.user_full_name       ?? '—',
    whCode:               g.user_WHCode          ?? '—',
    cerealType:           g.cereal               ?? '—',
    [`${type.toLowerCase()}Id`]: reportId,
    certifiedBy:          g.user_full_name       ?? '—',
    verifiedBy1:          g.asst_bm_name         ?? '—',
    verifiedBy2:          g.accountant_name      ?? '—',
    notedBy:              g.branch_m_name        ?? '—',
    ws_signature:         g.ws_signature         ?? null,
    asst_bm_signature:    g.asst_bm_approved     ? (g.asst_bm_signature    ?? null) : null,
    accountant_signature: g.accountant_approved  ? (g.accountant_signature ?? null) : null,
    branch_m_signature:   g.branch_m_approved    ? (g.branch_m_signature   ?? null) : null,
  }
}

/** Manages all date filter state and navigation helpers */
function useDateFilter() {
  const [rangeDate,          setRangeDate]          = useState('Daily')
  const [showCalendarFilter, setShowCalendarFilter] = useState(false)
  const [selectedDate,       setSelectedDate]       = useState(null)
  const [selectedWeek,       setSelectedWeek]       = useState(1)
  const [weeklyYear,         setWeeklyYear]         = useState(new Date().getFullYear())
  const [weeklyMonth,        setWeeklyMonth]        = useState(new Date().getMonth())
  const [selectedMonth,      setSelectedMonth]      = useState('January')
  const [monthlyYear,        setMonthlyYear]        = useState(new Date().getFullYear())

  const handleRangeDateChange = (v) => {
    setRangeDate(v)
    setShowCalendarFilter(false)
    setSelectedDate(null)
    setSelectedWeek(1)
    setSelectedMonth('January')
  }

  const handlePrevMonth = () => {
    if (weeklyMonth === 0) { setWeeklyMonth(11); setWeeklyYear(y => y - 1) }
    else setWeeklyMonth(m => m - 1)
  }

  const handleNextMonth = () => {
    if (weeklyMonth === 11) { setWeeklyMonth(0); setWeeklyYear(y => y + 1) }
    else setWeeklyMonth(m => m + 1)
  }

  return {
    rangeDate, showCalendarFilter, setShowCalendarFilter,
    selectedDate,  setSelectedDate,
    selectedWeek,  setSelectedWeek,
    weeklyYear,    setWeeklyYear,
    weeklyMonth,   setWeeklyMonth,
    selectedMonth, setSelectedMonth,
    monthlyYear,   setMonthlyYear,
    handleRangeDateChange, handlePrevMonth, handleNextMonth,
  }
}

/** Manages checkbox row selection and select-all for the current page */
function useRowSelection(pageIds) {
  const [selectedRows, setSelectedRows] = useState([])

  const toggleRow = (id) =>
    setSelectedRows(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const areAllOnPage = pageIds.length > 0 && pageIds.every(id => selectedRows.includes(id))

  const toggleSelectAll = () => {
    if (areAllOnPage) setSelectedRows(prev => prev.filter(id => !pageIds.includes(id)))
    else              setSelectedRows(prev => [...prev, ...pageIds.filter(id => !prev.includes(id))])
  }

  const clearSelection = () => setSelectedRows([])

  return { selectedRows, toggleRow, areAllOnPage, toggleSelectAll, clearSelection }
}

/** Confirmation dialog shown before bulk export */
function ExportConfirmDialog({ open, onClose, onConfirm, isExporting, selectedRows }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='bg-[#F8F8F8] [&>button]:hidden px-0 !pt-0 !max-w-[420px] shadow-2xl'>
        <div className='bg-[#1D8104] py-3 rounded-t-lg' />
        <div className='bg-[#1D8104] py-5 rounded-full flex justify-center mx-38 mb-3 mt-5'>
          <CiExport className="w-12 h-12" color='white' />
        </div>
        <DialogHeader>
          <div className='text-center'>
            <p className='text-[#1D8104] font-bold text-xl'>Export Reports?</p>
            <p className='text-sm mx-5 mt-2 text-[#051F52]'>
              You are about to export{' '}
              <span className='font-semibold'>{selectedRows.length}</span>{' '}
              report{selectedRows.length > 1 ? 's' : ''} as separate files.
            </p>
          </div>
          <DialogDescription className='flex flex-col gap-3 mx-5 mt-3'>
            <ul className="max-h-36 overflow-y-auto rounded-md border border-gray-200 bg-white px-4 py-2 text-sm text-[#2D317F] flex flex-col gap-1">
              {selectedRows.map(id => (
                <li key={id} className="font-medium">• {id}</li>
              ))}
            </ul>
            <div className='flex justify-center gap-3 mt-3 mb-5'>
              <Button
                variant="ghost"
                disabled={isExporting}
                onClick={onClose}
                className='px-7 py-4.5 rounded-md bg-[#D9D9D9] text-black font-medium hover:bg-gray-300'
              >
                Cancel
              </Button>
              <Button
                onClick={onConfirm}
                disabled={isExporting}
                className='px-7 py-4.5 rounded-md bg-[#1D8104] text-white font-medium hover:bg-green-700 disabled:opacity-50'
              >
                {isExporting ? 'Exporting…' : 'Confirm Export'}
              </Button>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}

export default function ReportHistory() {
  // notif
  const currentUser  = useCurrentUser()
  const notifRoute   = getNotifRoute(currentUser)
  const userName     = currentUser ? `${currentUser.fname} ${currentUser.lname}` : 'User'
  const unreadCount  = useUnreadCount()

  // toast
  const { toasts, addToast } = useToast()

  const navigate = useNavigate()

  // data
  const [rows,    setRows]    = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  // table filters
  const [selectedWarehouse,  setSelectedWarehouse]  = useState('All Warehouses')
  const [selectedReportType, setSelectedReportType] = useState('All Reports')
  const [selectedCerealType, setSelectedCerealType] = useState('All Cereal Type')
  const [currentPage,        setCurrentPage]        = useState(1)
  const [search,             setSearch]             = useState('')

  // date filter (custom hook)
  const dateFilter = useDateFilter()

  // export state
  const [showExportModal, setShowExportModal] = useState(false)
  const [isExporting,     setIsExporting]     = useState(false)

  // fetch all report data in parallel on mount
  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true)
        const [stocksRes, wsrRes, wsiRes, summaryRes] = await Promise.all([
          api.get('/reports/stocks/'),
          api.get('/reports/wsr-reports/'),
          api.get('/reports/wsi-reports/'),
          api.get('/reports/summary/'),
        ])
        setRows(buildRows(stocksRes.data, wsrRes.data, wsiRes.data, summaryRes.data))
      } catch (err) {
        console.error('Failed to fetch report history:', err)
        setError('Failed to load report history. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  // Filtering
  const filteredReports = rows.filter(report => {
    const matchesWarehouse  = selectedWarehouse  === 'All Warehouses'  || report.whse       === selectedWarehouse
    const matchesReportType = selectedReportType === 'All Reports'     || report.reporttype === selectedReportType
    const matchesCerealType = selectedCerealType === 'All Cereal Type' || report.cerealtype === selectedCerealType
    const matchesSearch     = report.reportid.toLowerCase().includes(search.toLowerCase())
    const matchesDate       = matchesDateFilter(
      report,
      dateFilter.rangeDate,
      dateFilter.selectedDate,
      dateFilter.selectedWeek,
      dateFilter.weeklyYear,
      dateFilter.weeklyMonth,
      dateFilter.selectedMonth,
      dateFilter.monthlyYear,
    )
    return matchesWarehouse && matchesReportType && matchesCerealType && matchesSearch && matchesDate
  })

  // Pagination
  const totalPages       = Math.ceil(filteredReports.length / ITEMS_PER_PAGE)
  const startIndex       = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedReports = filteredReports.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  const pageIds          = paginatedReports.map(r => r.reportid)

  // row selection hook
  const { selectedRows, toggleRow, areAllOnPage, toggleSelectAll, clearSelection } = useRowSelection(pageIds)

  // Filter handlers
  const handleSearchChange     = (e) => { setSearch(e.target.value);    setCurrentPage(1) }
  const handleWarehouseChange  = (v) => { setSelectedWarehouse(v);      setCurrentPage(1) }
  const handleReportTypeChange = (v) => { setSelectedReportType(v);     setCurrentPage(1) }
  const handleCerealChange     = (v) => { setSelectedCerealType(v);     setCurrentPage(1) }
  const handleDateSelect       = (d) => { dateFilter.setSelectedDate(d);   setCurrentPage(1) }
  const handleWeekSelect       = (w) => { dateFilter.setSelectedWeek(w);   setCurrentPage(1) }
  const handleMonthSelect      = (m) => { dateFilter.setSelectedMonth(m);  setCurrentPage(1) }
  const handleYearChange       = (y) => { dateFilter.setMonthlyYear(y);    setCurrentPage(1) }

  // Navigation
  const handleView = (report) => {
    if (report.reporttype === 'Summary of Warehouse Reports') {
      navigate('/admin/history/summary', { state: { summaryId: report.summaryId, pageTitle: 'History' } })
    } else if (report.reporttype === 'Statement of Receipts') {
      navigate('/admin/history/receipt', {
        state: { reportId: report.wsrId, reportType: 'WSR', stockbookId: report.stockbookId, pageTitle: 'History' }
      })
    } else if (report.reporttype === 'Statement of Issuance') {
      navigate('/admin/history/issue', {
        state: { reportId: report.wsiId, reportType: 'WSI', stockbookId: report.stockbookId, pageTitle: 'History' }
      })
    }
  }


  /** Exports a single report */
  const handleExport = async (report) => {
    if (report.reporttype === 'Statement of Receipts') {
      await api.post('/audit/log-export/', { type: 'WSR', id: report.wsrId })
      const { data: g } = await api.get(`/reports/stocks/wsr-grouped/${report.stockbookId}/`)
      exportWSRToExcel(
        { ...buildExportPayload(g, `WSR-${report.wsrId}`, 'WSR') },
        g.transactions ?? []
      )

    } else if (report.reporttype === 'Statement of Issuance') {
      await api.post('/audit/log-export/', { type: 'WSI', id: report.wsiId })
      const { data: g } = await api.get(`/reports/stocks/wsi-grouped/${report.stockbookId}/`)
      exportWSIToExcel(
        { ...buildExportPayload(g, `WSI-${report.wsiId}`, 'WSI') },
        g.transactions ?? []
      )

    } else if (report.reporttype === 'Summary of Warehouse Reports') {
      await api.post('/audit/log-export/', { type: 'Summary', id: report.summaryId })
      const { data } = await api.get(`/reports/summary/upd/${report.summaryId}/`)
      exportSummaryToExcel(data)
    }
  }

  const handleSingleExport = async (report) => {
    try {
      await handleExport(report)
      addToast(`${report.reportid} exported successfully.`, 'success')
    } catch (err) {
      console.error('Export failed:', err)
      addToast(`Failed to export ${report.reportid}. Please try again.`, 'error')
    }
  }

  const handleBulkExport = async () => {
    setIsExporting(true)
    const failed = []
    try {
      const reportsToExport = rows.filter(r => selectedRows.includes(r.reportid))
      for (const report of reportsToExport) {
        try {
          await handleExport(report)
          // Small delay between exports to prevent browser download conflicts
          await new Promise(res => setTimeout(res, 400))
        } catch (err) {
          console.error(`Failed to export ${report.reportid}:`, err)
          failed.push(report.reportid)
        }
      }
      clearSelection()
      setShowExportModal(false)
      if (failed.length === 0) {
        addToast(`${reportsToExport.length} report(s) exported successfully.`, 'success')
      } else {
        addToast(`${failed.length} report(s) failed to export: ${failed.join(', ')}`, 'error')
      }
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <>
      <Header
        pageTitle="History"
        unreadCount={unreadCount}
        notifTo={notifRoute}
        userName={userName}
      />

      <div className="bg-[#F5F9F9] mx-4 my-4 !min-h-[650px] h-[calc(100vh-120px)] border border-black/10 rounded-lg shadow-[0_6px_4px_-4px_rgba(0,0,0,0.2)] flex flex-col">

        {/* Filter Bar */}
        <div className="px-3 py-3 mt-3">
          <div className="flex justify-between gap-4">

            {/* Search */}
            <div className="bg-white flex items-center border border-[#2D317F] rounded-full px-3 py-[6px] gap-2 shadow-[0_6px_4px_-4px_rgba(0,0,0,0.2)] w-[440px]">
              <FaBars color={'#2D317F'} size={15} className="shrink-0" />
              <Input
                value={search}
                onChange={handleSearchChange}
                placeholder="Search Report ID"
                className="bg-transparent border-0 rounded-xl placeholder:text-black/50 focus-visible:ring-0 h-7 text-sm"
              />
              <FaSearch color={'#2D317F'} size={15} className="shrink-0" />
            </div>

            {/* Calendar + Dropdowns */}
            <div className="flex gap-3">

              {/* Date filter popover */}
              <Popover>
                <PopoverTrigger asChild>
                  <button className="flex items-center justify-center rounded-md text-[#072560] hover:bg-[#d5e3f0] transition ease-in h-10 w-12 shadow-[0_6px_6px_-2px_rgba(0,0,0,0.2)]">
                    <FaRegCalendarAlt color='#072560' size={20} />
                  </button>
                </PopoverTrigger>
                <PopoverContent align="end" alignOffset={-8.4} sideOffset={12} className="z-40 w-80 overflow-visible rounded border-0 bg-[#E6EEF6] p-0 shadow-lg">
                  <div className="absolute -top-2 left-70 h-4 w-4 rotate-45 bg-[#2D317F]" />
                  <div className="bg-[#2D317F] rounded-t pl-4 py-2">
                    <p className="text-white font-semibold text-base">Date</p>
                  </div>
                  <div className="px-5 py-3 pb-6">
                    <p className="mb-2 text-sm font-medium text-[#2D317F]">Select range type and date</p>
                    <FieldGroup>
                      <Field>
                        <FieldLabel className="font-medium text-[#2D317F]">Range</FieldLabel>
                        <Select value={dateFilter.rangeDate} onValueChange={dateFilter.handleRangeDateChange}>
                          <SelectTrigger className="w-full border-gray-300 bg-white">
                            <SelectValue placeholder="Select range" />
                          </SelectTrigger>
                          <SelectContent>
                            {['Daily', 'Weekly', 'Monthly'].map(r => (
                              <SelectItem key={r} className="p-2 text-[#2D317F]" value={r}>{r}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>

                      {/* Date sub-selector trigger */}
                      {['Daily', 'Weekly', 'Monthly'].includes(dateFilter.rangeDate) && (
                        <Field>
                          <FieldLabel className="font-medium text-[#2D317F]">
                            {dateFilter.rangeDate === 'Daily' ? 'Date' : dateFilter.rangeDate === 'Weekly' ? 'Week' : 'Month'}
                          </FieldLabel>
                          <button
                            type="button"
                            onClick={() => dateFilter.setShowCalendarFilter(p => !p)}
                            className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-xs focus:outline-none"
                          >
                            <span className={dateFilter.selectedDate || dateFilter.rangeDate !== 'Daily' ? 'text-[#2D317F]' : 'text-gray-400'}>
                              {dateFilter.rangeDate === 'Daily'
                                ? dateFilter.selectedDate
                                  ? `${String(dateFilter.selectedDate.getMonth()+1).padStart(2,'0')}/${String(dateFilter.selectedDate.getDate()).padStart(2,'0')}/${dateFilter.selectedDate.getFullYear()}`
                                  : 'MM/DD/YYYY'
                                : dateFilter.rangeDate === 'Weekly'
                                  ? `Week ${dateFilter.selectedWeek}`
                                  : dateFilter.selectedMonth}
                            </span>
                            <ChevronDown className="h-4 w-4 opacity-50" />
                          </button>
                        </Field>
                      )}
                    </FieldGroup>
                  </div>

                  {/* Calendar picker */}
                  {dateFilter.showCalendarFilter && (
                    <div className="absolute left-7 top-60 z-50 mt-2">
                      {dateFilter.rangeDate === 'Daily' && (
                        <DailyFilter value={dateFilter.selectedDate} onChange={handleDateSelect} />
                      )}
                      {dateFilter.rangeDate === 'Weekly' && (
                        <WeeklyFilter
                          selectedWeek={dateFilter.selectedWeek}
                          year={dateFilter.weeklyYear}
                          month={dateFilter.weeklyMonth}
                          onPrevMonth={dateFilter.handlePrevMonth}
                          onNextMonth={dateFilter.handleNextMonth}
                          onMonthChange={dateFilter.setWeeklyMonth}
                          onYearChange={dateFilter.setWeeklyYear}
                          onWeekSelect={handleWeekSelect}
                        />
                      )}
                      {dateFilter.rangeDate === 'Monthly' && (
                        <MonthlyFilter
                          selectedMonth={dateFilter.selectedMonth}
                          year={dateFilter.monthlyYear}
                          onYearChange={handleYearChange}
                          onMonthChange={handleMonthSelect}
                        />
                      )}
                    </div>
                  )}
                </PopoverContent>
              </Popover>

              {/* Warehouse / Report Type / Cereal dropdowns */}
              <div className="flex gap-2">
                <Select value={selectedWarehouse} onValueChange={handleWarehouseChange}>
                  <SelectTrigger className="py-5 border-[#2D317F] bg-white text-[#2D317F] shadow-[0_6px_4px_-4px_rgba(0,0,0,0.2)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WAREHOUSE_OPTIONS.map(({ label, value }) => (
                      <SelectItem key={value} className='p-2 text-[#2D317F]' value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedReportType} onValueChange={handleReportTypeChange}>
                  <SelectTrigger className="py-5 border-[#2D317F] bg-white text-[#2D317F] shadow-[0_6px_4px_-4px_rgba(0,0,0,0.2)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['All Reports', 'Statement of Receipts', 'Statement of Issuance', 'Summary of Warehouse Reports'].map(o => (
                      <SelectItem key={o} className="p-2 text-[#2D317F]" value={o}>{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedCerealType} onValueChange={handleCerealChange}>
                  <SelectTrigger className="py-5 border-[#2D317F] bg-white text-[#2D317F] shadow-[0_6px_4px_-4px_rgba(0,0,0,0.2)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem className='p-2 text-[#2D317F]' value="All Cereal Type">All Cereal Type</SelectItem>
                    <SelectItem className='p-2 text-[#2D317F]' value="Mixed Cereal">Mixed Cereal</SelectItem>
                    <SelectItem className='p-2 text-[#2D317F]' value="WD1G50">Rice</SelectItem>
                    <SelectItem className='p-2 text-[#2D317F]' value="PD1350">Palay</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Result Bar */}
        <div className="mt-3 flex items-center gap-3 px-4 py-[6px]">
          <span className="font-semibold text-[#2D317F]">Showing Archived Reports</span>
          <div className="ml-auto flex items-center gap-1">
            <FiCheckSquare size={16} color="#2D317F" />
            <span className="text-[13px] font-medium text-[#2D317F]">Result: {filteredReports.length}</span>
          </div>
        </div>

        {/* Table */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="w-full overflow-auto flex-1">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#E2EBFF] text-[#2D317F] font-medium h-10 xl:h-12 2xl:h-[50px]">
                  <TableHead className="h-12 pl-5 text-center font-bold text-[13px] text-[#2D317F]">
                    <div className="flex items-center justify-center gap-2">
                      <input type="checkbox" checked={areAllOnPage} onChange={toggleSelectAll} />
                      <span>Select All</span>
                    </div>
                  </TableHead>
                  {['Date', 'Report ID', 'Report Type', 'Warehouse', 'Cereal Type', 'Action'].map(h => (
                    <TableHead key={h} className="h-12 text-center font-bold text-[13px] text-[#2D317F]">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>

              <TableBody className="border-none">
                {loading ? (
                  <TableRow className='border-0'>
                    <TableCell colSpan={7} className="text-center py-16">
                      <div className="flex flex-col items-center gap-3 text-[#2D317F]">
                        <div className="w-8 h-8 border-4 border-[#2D317F] border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm font-medium">Loading archived reports...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-10 text-center text-red-400 text-sm">
                      {error}
                    </TableCell>
                  </TableRow>
                ) : paginatedReports.length === 0 ? (
                  <>
                    <TableRow>
                      <TableCell colSpan={7} className="py-10 text-center text-[#9CA3AF]">
                        No archived reports found.
                      </TableCell>
                    </TableRow>
                    {Array.from({ length: ITEMS_PER_PAGE - 1 }).map((_, i) => (
                      <TableRow key={`filler-${i}`} className="h-11 hover:bg-transparent">
                        <TableCell colSpan={7} />
                      </TableRow>
                    ))}
                  </>
                ) : (
                  <>
                    {paginatedReports.map(report => (
                      <TableRow key={report.reportid} className="h-9 border-none transition-colors">
                        <TableCell className="pl-5 text-center">
                          <input
                            type="checkbox"
                            checked={selectedRows.includes(report.reportid)}
                            onChange={() => toggleRow(report.reportid)}
                          />
                        </TableCell>
                        <TableCell className="text-center text-[13px] font-medium text-[#2D317F]">{report.date}</TableCell>
                        <TableCell className="text-center text-[13px] font-semibold text-[#2D317F]">{report.reportid}</TableCell>
                        <TableCell className="text-center text-[13px] font-medium text-[#2D317F]">{report.reporttype}</TableCell>
                        <TableCell className="text-center text-[13px] font-medium text-[#2D317F]">{report.whse}</TableCell>
                        <TableCell className="text-center text-[13px] font-medium text-[#2D317F]">{report.cerealtype}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleView(report)}
                              className="inline-flex items-center gap-[5px] rounded-full border-[1.5px] border-[#2D317F] bg-white px-[14px] py-[6px] text-[13px] font-semibold text-[#2D317F] transition-colors hover:bg-[#2D317F] hover:text-white"
                            >
                              <GoLinkExternal size={14} /> View
                            </button>
                            <button
                              onClick={() => handleSingleExport(report)}
                              className="inline-flex items-center gap-[5px] rounded-full border border-[#1D8104] px-[14px] py-[6px] text-[13px] font-semibold text-[#1D8104] transition-colors hover:bg-[#1D8104] hover:text-white"
                            >
                              <CiExport size={17} /> Export
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {Array.from({ length: ITEMS_PER_PAGE - paginatedReports.length }).map((_, i) => (
                      <TableRow key={`filler-${i}`} className="h-12 !border-none hover:bg-transparent">
                        <TableCell colSpan={7} />
                      </TableRow>
                    ))}
                  </>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Selection bar */}
          <div className="border-t border-[#E9EEF6] px-5 py-[12px] min-h-[50px]">
            {selectedRows.length > 0 && (
              <div className="flex items-center justify-between gap-3 font-medium text-[#2D317F]">
                <span>{selectedRows.length} Reports Selected</span>
                <button
                  onClick={() => setShowExportModal(true)}
                  className="inline-flex items-center gap-[5px] rounded-full border border-[#1D8104] px-[14px] py-[6px] text-[13px] font-semibold text-[#1D8104] transition-colors hover:bg-[#1D8104] hover:text-white"
                >
                  <CiExport size={17} /> Export ({selectedRows.length})
                </button>
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-[#E9EEF6] px-4 py-[10px]">
            <span className="text-[13px] font-medium text-[#6B7280]">
              {totalPages > 0 ? `${currentPage} of ${totalPages}` : '—'}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => p - 1)}
                disabled={currentPage === 1 || totalPages === 0}
                className="rounded-md border-[1.5px] border-[#2D317F] bg-[#2D317F] px-[18px] py-[7px] text-[13px] font-semibold text-white opacity-75 transition-colors hover:bg-[#222669] disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(p => p + 1)}
                disabled={currentPage === totalPages || totalPages === 0}
                className="rounded-md border-[1.5px] border-[#2D317F] bg-[#2D317F] px-[18px] py-[7px] text-[13px] font-semibold text-white transition-colors hover:bg-[#222669] disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk export confirmation dialog */}
      <ExportConfirmDialog
        open={showExportModal}
        onClose={() => setShowExportModal(false)}
        onConfirm={handleBulkExport}
        isExporting={isExporting}
        selectedRows={selectedRows}
      />

      {/* Toast notifications */}
      <Toast toasts={toasts} />
    </>
  )
}