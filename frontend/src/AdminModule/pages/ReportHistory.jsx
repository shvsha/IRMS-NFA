// react icons
import { FaSearch, FaBars } from "react-icons/fa"
import { GoLinkExternal } from "react-icons/go";
import { CiExport } from "react-icons/ci";
import { FaRegCalendarAlt } from "react-icons/fa";
import { FiCheckSquare } from "react-icons/fi";

// react
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';

// for notif
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { getNotifRoute } from "@/utils/getNotifRoute";
import { useUnreadCount } from "@/hooks/useUnreadCount";

// components
import { DailyFilter } from '../../components/filters/DailyFilter';
import { WeeklyFilter } from '../../components/filters/WeeklyFilter';
import { MonthlyFilter } from '../../components/filters/MonthlyFilter';
import Header from '../../components/Header'
import api from "@/api/axios";

// shadcn components
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field"
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

const ITEMS_PER_PAGE = 7

import { exportWSRToExcel, exportWSIToExcel, exportSummaryToExcel } from '@/utils/exportToExcel'

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
        date:        s.date_covered    ?? '—',
        reportid:    `SUM-${s.summary_id}`,
        reporttype:  'Summary of Warehouse Reports',
        whse:        s.WHCode          ?? '—',
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

export default function ReportHistory() {
  // for notif
  const user       = useCurrentUser()
  const notifRoute = getNotifRoute(user)
  const userName   = user ? `${user.fname} ${user.lname}` : 'User'
  const unreadCount = useUnreadCount()

  const navigate = useNavigate()

  // data
  const [rows,     setRows]     = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)

  // table filters
  const [selectedWarehouse,  setSelectedWarehouse]  = useState("All Warehouses")
  const [selectedReportType, setSelectedReportType] = useState("All Reports")
  const [selectedCerealType, setSelectedCerealType] = useState("All Cereal Type")
  const [currentPage,        setCurrentPage]        = useState(1)
  const [search,             setSearch]             = useState("")
  const [selectedRows,       setSelectedRows]       = useState([])

  // date filter
  const [rangeDate,          setRangeDate]          = useState("Daily")
  const [showCalendarFilter, setShowCalendarFilter] = useState(false)
  const [selectedDate,       setSelectedDate]       = useState(null)
  const [selectedWeek,       setSelectedWeek]       = useState(1)
  const [weeklyYear,         setWeeklyYear]         = useState(new Date().getFullYear())
  const [weeklyMonth,        setWeeklyMonth]        = useState(new Date().getMonth())
  const [selectedMonth,      setSelectedMonth]      = useState("January")
  const [monthlyYear,        setMonthlyYear]        = useState(new Date().getFullYear())

  // for multi export
  const [showExportModal, setShowExportModal] = useState(false)
  const [isExporting,     setIsExporting]     = useState(false)

  // fetch all needed data
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
        const built = buildRows(
          stocksRes.data,
          wsrRes.data,
          wsiRes.data,
          summaryRes.data,
        )
        setRows(built)
      } catch (err) {
        console.error(err)
        setError('Failed to load report history.')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const handleSearchChange = (e) => { setSearch(e.target.value); setCurrentPage(1) }
  const handlePrevMonth = () => {
    if (weeklyMonth === 0) { setWeeklyMonth(11); setWeeklyYear(y => y - 1) }
    else setWeeklyMonth(m => m - 1)
  }
  const handleNextMonth = () => {
    if (weeklyMonth === 11) { setWeeklyMonth(0); setWeeklyYear(y => y + 1) }
    else setWeeklyMonth(m => m + 1)
  }

  const filteredReports = rows.filter(report => {
    const matchesWarehouse  = selectedWarehouse  === "All Warehouses"  || report.whse       === selectedWarehouse
    const matchesReportType = selectedReportType === "All Reports"     || report.reporttype === selectedReportType
    const matchesCerealType = selectedCerealType === "All Cereal Type" || report.cerealtype === selectedCerealType
    const matchesSearch     = report.reportid.toLowerCase().includes(search.toLowerCase())

    let matchesDate = true

    if (report.date && report.date !== '—') {
      const reportDate = new Date(report.date)

      if (rangeDate === 'Daily' && selectedDate) {
        matchesDate =
          reportDate.getFullYear() === selectedDate.getFullYear() &&
          reportDate.getMonth()    === selectedDate.getMonth()    &&
          reportDate.getDate()     === selectedDate.getDate()

      } else if (rangeDate === 'Weekly' && selectedWeek) {
        const firstOfMonth = new Date(weeklyYear, weeklyMonth, 1)
        const firstDayOfWeek = firstOfMonth.getDay()
        const weekStart = new Date(weeklyYear, weeklyMonth, 1 + (selectedWeek - 1) * 7 - firstDayOfWeek)
        const weekEnd   = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 6)
        weekEnd.setHours(23, 59, 59, 999)
        matchesDate = reportDate >= weekStart && reportDate <= weekEnd

      } else if (rangeDate === 'Monthly' && selectedMonth) {
        const MONTHS = ['January','February','March','April','May','June',
                        'July','August','September','October','November','December']
        const monthIndex = MONTHS.indexOf(selectedMonth)
        matchesDate =
          reportDate.getFullYear() === monthlyYear &&
          reportDate.getMonth()    === monthIndex
      }
    }

    return matchesWarehouse && matchesReportType && matchesCerealType && matchesSearch && matchesDate
  })

  const handleRangeDateChange = (v) => {
    setRangeDate(v)
    setShowCalendarFilter(false)
    setSelectedDate(null)
    setSelectedWeek(1)
    setSelectedMonth('January')
    setCurrentPage(1)
  }

  const handleDateSelect    = (d) => { setSelectedDate(d);    setCurrentPage(1) }
  const handleWeekSelect    = (w) => { setSelectedWeek(w);    setCurrentPage(1) }
  const handleMonthSelect   = (m) => { setSelectedMonth(m);   setCurrentPage(1) }
  const handleYearChange    = (y) => { setMonthlyYear(y);     setCurrentPage(1) }

  const totalPages      = Math.ceil(filteredReports.length / ITEMS_PER_PAGE)
  const startIndex      = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedReports = filteredReports.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  const handleWarehouseChange  = (val) => { setSelectedWarehouse(val);  setCurrentPage(1) }
  const handleReportTypeChange = (val) => { setSelectedReportType(val); setCurrentPage(1) }
  const handleCerealChange     = (val) => { setSelectedCerealType(val); setCurrentPage(1) }

  const toggleRow = (id) =>
    setSelectedRows(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const pageIds      = paginatedReports.map(r => r.reportid)
  const areAllOnPage = pageIds.length > 0 && pageIds.every(id => selectedRows.includes(id))
  const toggleSelectAll = () => {
    if (areAllOnPage) setSelectedRows(prev => prev.filter(id => !pageIds.includes(id)))
    else              setSelectedRows(prev => [...prev, ...pageIds.filter(id => !prev.includes(id))])
  }

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
  
  const handleExport = async (report) => {
    try {
      if (report.reporttype === 'Statement of Receipts') {
        await api.post('/audit/log-export/', { type: 'WSR', id: report.wsrId })
        const [wsrRes, stockRes] = await Promise.all([
          api.get(`/reports/wsr-reports/upd/${report.wsrId}/`),
          api.get(`/reports/stocks/upd/${report.stockbookId}/`),
        ])
        const wsrReport = wsrRes.data
        const stock     = stockRes.data
        const firstTx   = wsrReport.transactions?.[0] ?? {}

        exportWSRToExcel(
          {
            date:        stock.Date                        ?? '—',
            region:      'Region 1',
            province:    'La Union',
            officer:     firstTx.user_full_name            ?? '—',
            whName:      'San Juan GID 2A',
            whAddress:   'San Juan, La Union',
            whCode:      firstTx.user_WHCode               ?? '—',
            cerealType:  stock.CerealType                  ?? '—',
            wsrId:       `WSR-${report.wsrId}`,
            certifiedBy: firstTx.user_full_name            ?? '—',
            verifiedBy1: wsrReport.wsr_report?.asst_bm_name      ?? wsrReport.asst_bm_name      ?? '—',
            verifiedBy2: wsrReport.wsr_report?.accountant_name   ?? wsrReport.accountant_name   ?? '—',
            notedBy:     wsrReport.wsr_report?.branch_m_name     ?? wsrReport.branch_m_name     ?? '—',
          },
          wsrReport.transactions ?? []
        )

      } else if (report.reporttype === 'Statement of Issuance') {
        await api.post('/audit/log-export/', { type: 'WSR', id: report.wsrId })
        const [wsiRes, stockRes] = await Promise.all([
          api.get(`/reports/wsi-reports/upd/${report.wsiId}/`),
          api.get(`/reports/stocks/upd/${report.stockbookId}/`),
        ])
        const wsiReport = wsiRes.data
        const stock     = stockRes.data
        const firstTx   = wsiReport.transactions?.[0] ?? {}

        exportWSIToExcel(
          {
            date:        stock.Date                               ?? '—',
            region:      'Region 1',
            province:    'La Union',
            officer:     firstTx.user_full_name                   ?? '—',
            whName:      'San Juan GID 2A',
            whAddress:   'San Juan, La Union',
            whCode:      firstTx.user_WHCode                      ?? '—',
            cerealType:  stock.CerealType                         ?? '—',
            wsiId:       `WSI-${report.wsiId}`,
            certifiedBy: firstTx.user_full_name                   ?? '—',
            verifiedBy1: wsiReport.wsi_report?.asst_bm_name      ?? wsiReport.asst_bm_name      ?? '—',
            verifiedBy2: wsiReport.wsi_report?.accountant_name   ?? wsiReport.accountant_name   ?? '—',
            notedBy:     wsiReport.wsi_report?.branch_m_name     ?? wsiReport.branch_m_name     ?? '—',
          },
          wsiReport.transactions ?? []
        )
      } else if (report.reporttype === 'Summary of Warehouse Reports') {
        await api.post('/audit/log-export/', { type: 'Summary', id: report.summaryId })
        const summaryRes = await api.get(`/reports/summary/upd/${report.summaryId}/`)
        exportSummaryToExcel(summaryRes.data)
      }
    } catch (err) {
      console.error('Export failed:', err)
    }
  }

  const handleBulkExport = async () => {
    setIsExporting(true)
    try {
      const reportsToExport = rows.filter(r => selectedRows.includes(r.reportid))
      for (const report of reportsToExport) {
        await handleExport(report)
        await new Promise(res => setTimeout(res, 400))
      }
      setSelectedRows([])
      setShowExportModal(false)
    } catch (err) {
      console.error('Bulk export failed:', err)
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
              <Popover>
                <PopoverTrigger asChild>
                  <button className="flex items-center justify-center rounded-md  text-[#072560] hover:bg-[#d5e3f0] transition ease-in h-10 w-12 shadow-[0_6px_6px_-2px_rgba(0,0,0,0.2)]">
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
                        <Select value={rangeDate} onValueChange={handleRangeDateChange}>
                          <SelectTrigger className="w-full border-gray-300 bg-white"><SelectValue placeholder="Select range" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem className="p-2 text-[#2D317F]" value="Daily">Daily</SelectItem>
                            <SelectItem className="p-2 text-[#2D317F]" value="Weekly">Weekly</SelectItem>
                            <SelectItem className="p-2 text-[#2D317F]" value="Monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>
                      {rangeDate === "Daily" && (
                        <Field>
                          <FieldLabel className="font-medium text-[#2D317F]">Date</FieldLabel>
                          <button type="button" onClick={() => setShowCalendarFilter(p => !p)} className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-xs focus:outline-none">
                            <span className={selectedDate ? "text-[#2D317F]" : "text-gray-400"}>
                              {selectedDate ? `${String(selectedDate.getMonth()+1).padStart(2,'0')}/${String(selectedDate.getDate()).padStart(2,'0')}/${selectedDate.getFullYear()}` : "MM/DD/YYYY"}
                            </span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 opacity-50"><path d="m6 9 6 6 6-6"/></svg>
                          </button>
                        </Field>
                      )}
                      {rangeDate === "Weekly" && (
                        <Field>
                          <FieldLabel className="font-medium text-[#2D317F]">Week</FieldLabel>
                          <button type="button" onClick={() => setShowCalendarFilter(p => !p)} className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-xs focus:outline-none">
                            <span>Week {selectedWeek}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 opacity-50"><path d="m6 9 6 6 6-6"/></svg>
                          </button>
                        </Field>
                      )}
                      {rangeDate === "Monthly" && (
                        <Field>
                          <FieldLabel className="font-medium text-[#2D317F]">Month</FieldLabel>
                          <button type="button" onClick={() => setShowCalendarFilter(p => !p)} className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-xs focus:outline-none">
                            <span>{selectedMonth}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 opacity-50"><path d="m6 9 6 6 6-6"/></svg>
                          </button>
                        </Field>
                      )}
                    </FieldGroup>
                  </div>
                  {showCalendarFilter && (
                    <div className="absolute left-7 top-60 z-50 mt-2">
                      {rangeDate === "Daily"   && <DailyFilter value={selectedDate} onChange={handleDateSelect} />}
                      {rangeDate === "Weekly"  && <WeeklyFilter
                        selectedWeek={selectedWeek}
                        year={weeklyYear} month={weeklyMonth}
                        onPrevMonth={handlePrevMonth} onNextMonth={handleNextMonth}
                        onMonthChange={setWeeklyMonth} onYearChange={setWeeklyYear}
                        onWeekSelect={handleWeekSelect}
                      />}
                      {rangeDate === "Monthly" && <MonthlyFilter
                        selectedMonth={selectedMonth}
                        year={monthlyYear}
                        onYearChange={handleYearChange}
                        onMonthChange={handleMonthSelect}
                      />}
                    </div>
                  )}
                </PopoverContent>
              </Popover>

              <div className="flex gap-2">
                <Select value={selectedWarehouse} onValueChange={handleWarehouseChange}>
                  <SelectTrigger className="py-5 border-[#2D317F] bg-white text-[#2D317F] shadow-[0_6px_4px_-4px_rgba(0,0,0,0.2)]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem className='p-2 text-[#2D317F]' value="All Warehouses">All Warehouses</SelectItem>
                    <SelectItem className='p-2 text-[#2D317F]' value="Warehouse 1">Warehouse 1</SelectItem>
                    <SelectItem className='p-2 text-[#2D317F]' value="Warehouse 2">Warehouse 2</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedReportType} onValueChange={handleReportTypeChange}>
                  <SelectTrigger className="py-5 border-[#2D317F] bg-white text-[#2D317F] shadow-[0_6px_4px_-4px_rgba(0,0,0,0.2)]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["All Reports", "Statement of Receipts", "Statement of Issuance", "Summary of Warehouse Reports"].map(o => (
                      <SelectItem key={o} className="p-2 text-[#2D317F]" value={o}>{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedCerealType} onValueChange={handleCerealChange}>
                  <SelectTrigger className="py-5 border-[#2D317F] bg-white text-[#2D317F] shadow-[0_6px_4px_-4px_rgba(0,0,0,0.2)]"><SelectValue /></SelectTrigger>
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
                  <TableHead className="h-12 text-center font-bold text-[13px] text-[#2D317F]">Date</TableHead>
                  <TableHead className="h-12 text-center font-bold text-[13px] text-[#2D317F]">Report ID</TableHead>
                  <TableHead className="h-12 text-center font-bold text-[13px] text-[#2D317F]">Report Type</TableHead>
                  <TableHead className="h-12 text-center font-bold text-[13px] text-[#2D317F]">Warehouse</TableHead>
                  <TableHead className="h-12 text-center font-bold text-[13px] text-[#2D317F]">Cereal Type</TableHead>
                  <TableHead className="h-12 text-center font-bold text-[13px] text-[#2D317F]">Action</TableHead>
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
                    <TableCell colSpan={7} className="py-10 text-center text-gray-400">
                      No archived reports found.
                    </TableCell>
                  </TableRow>
                ) : paginatedReports.length === 0 ? (
                  <>
                    <TableRow>
                      <TableCell colSpan={7} className="py-10 text-center text-[#9CA3AF]">No archived reports found.</TableCell>
                    </TableRow>
                    {Array.from({ length: ITEMS_PER_PAGE - 1 }).map((_, i) => (
                      <TableRow key={`filler-${i}`} className="h-11 hover:bg-transparent"><TableCell colSpan={7} /></TableRow>
                    ))}
                  </>
                ) : (
                  <>
                    {paginatedReports.map(report => (
                      <TableRow key={report.reportid} className="h-9 border-none transition-colors">
                        <TableCell className="pl-5 text-center">
                          <input type="checkbox" checked={selectedRows.includes(report.reportid)} onChange={() => toggleRow(report.reportid)} />
                        </TableCell>
                        <TableCell className="text-center text-[13px] font-medium text-[#2D317F]">{report.date}</TableCell>
                        <TableCell className="text-center text-[13px] font-semibold text-[#2D317F]">{report.reportid}</TableCell>
                        <TableCell className="text-center text-[13px] font-medium text-[#2D317F]">{report.reporttype}</TableCell>
                        <TableCell className="text-center text-[13px] font-medium text-[#2D317F]">{report.whse}</TableCell>
                        <TableCell className="text-center text-[13px] font-medium text-[#2D317F]">
                          {report.cerealtype === 'Mixed Cereal' ? (
                            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[13px] text-[#2D317F]">
                              Mixed Cereal
                            </span>
                          ) : report.cerealtype}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleView(report)}
                              className="inline-flex items-center gap-[5px] rounded-full border-[1.5px] border-[#2D317F] bg-white px-[14px] py-[6px] text-[13px] font-semibold text-[#2D317F] transition-colors hover:bg-[#2D317F] hover:text-white"
                            >
                              <GoLinkExternal size={14} />View
                            </button>
                            <button 
                              className="inline-flex items-center gap-[5px] rounded-full border border-[#1D8104] px-[14px] py-[6px] text-[13px] font-semibold text-[#1D8104] transition-colors hover:bg-[#1D8104] hover:text-white"
                              onClick={() => handleExport(report)}
                            >
                              <CiExport size={17} />Export
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {Array.from({ length: ITEMS_PER_PAGE - paginatedReports.length }).map((_, i) => (
                      <TableRow key={`filler-${i}`} className="h-12 !border-none hover:bg-transparent"><TableCell colSpan={7} /></TableRow>
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
                  className="inline-flex items-center gap-[5px] rounded-full border border-[#1D8104] px-[14px] py-[6px] text-[13px] font-semibold text-[#1D8104] transition-colors hover:bg-[#1D8104] hover:text-white">
                  <CiExport size={17} />Export ({selectedRows.length})
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
              <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1 || totalPages === 0}
                className="rounded-md border-[1.5px] border-[#2D317F] bg-[#2D317F] px-[18px] py-[7px] text-[13px] font-semibold text-white opacity-75 transition-colors hover:bg-[#222669] disabled:cursor-not-allowed">
                Previous
              </button>
              <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages || totalPages === 0}
                className="rounded-md border-[1.5px] border-[#2D317F] bg-[#2D317F] px-[18px] py-[7px] text-[13px] font-semibold text-white transition-colors hover:bg-[#222669] disabled:cursor-not-allowed">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Export Confirmation Dialog */}
      <Dialog open={showExportModal} onOpenChange={setShowExportModal}>
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
                  onClick={() => setShowExportModal(false)}
                  className='px-7 py-4.5 rounded-md bg-[#D9D9D9] text-black font-medium hover:bg-gray-300'
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleBulkExport}
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
    </>
  )
}