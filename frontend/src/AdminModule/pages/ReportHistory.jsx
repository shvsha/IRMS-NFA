// react icons
import { FaSearch, FaBars } from "react-icons/fa"
import { GoLinkExternal } from "react-icons/go";
import { CiExport } from "react-icons/ci";
import { FaRegCalendarAlt } from "react-icons/fa";
import { FiCheckSquare } from "react-icons/fi";

// react
import { useState } from 'react'
import { useNavigate } from 'react-router-dom';

// components
import { DailyFilter } from '../../components/filters/DailyFilter';
import { WeeklyFilter } from '../../components/filters/WeeklyFilter';
import { MonthlyFilter } from '../../components/filters/MonthlyFilter';
import Header from '../../components/Header'

// shadcn components
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const ITEMS_PER_PAGE = 7

const sampleReportHistory = [
  { date: '30-Jan-26', reportid: 'R-001', reporttype: 'Statement of Issuance', whse: 'Warehouse 1', cerealtype: 'WD1G50' },
  { date: '23-Jan-26', reportid: 'R-002', reporttype: 'Statement of Receipts', whse: 'Warehouse 1', cerealtype: 'PD1350' },
  { date: '31-Jan-26', reportid: 'R-003', reporttype: 'Summary of Warehouse Reports', whse: 'Warehouse 1', cerealtype: 'WD1G50' },
  { date: '28-Jan-26', reportid: 'R-004', reporttype: 'Statement of Warehouse Reports', whse: 'Warehouse 2', cerealtype: 'PD1350' },
  { date: '28-Jan-26', reportid: 'R-005', reporttype: 'Statement of Receipts', whse: 'Warehouse 2', cerealtype: 'PD1350' },
  { date: '28-Jan-26', reportid: 'R-006', reporttype: 'Statement of Receipts', whse: 'Warehouse 2', cerealtype: 'PD1350' },
  { date: '28-Jan-26', reportid: 'R-007', reporttype: 'Statement of Issuance', whse: 'Warehouse 2', cerealtype: 'PD1350' },
]

export default function ReportHistory() {
  const navigate = useNavigate();

  // table filters
  const [selectedWarehouse, setSelectedWarehouse] = useState("All Warehouses")
  const [selectedReportType, setSelectedReportType] = useState("All Reports")
  const [selectedCerealType, setSelectedCerealType] = useState("All Cereal Type")
  const [currentPage, setCurrentPage] = useState(1)
  const [search, setSearch] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);

  // date filter
  const [rangeDate, setRangeDate] = useState("Daily");
  const [showCalendarFilter, setShowCalendarFilter] = useState(false);

  // daily
  const [selectedDate, setSelectedDate] = useState(null);
  // weekly
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [weeklyYear, setWeeklyYear] = useState(new Date().getFullYear());
  const [weeklyMonth, setWeeklyMonth] = useState(new Date().getMonth());
  // monthly
  const [selectedMonth, setSelectedMonth] = useState("January");
  const [monthlyYear, setMonthlyYear] = useState(new Date().getFullYear());

  const handleSearchChange = (e) => { setSearch(e.target.value); setCurrentPage(1); }

  const handlePrevMonth = () => {
    if (weeklyMonth === 0) { setWeeklyMonth(11); setWeeklyYear((y) => y - 1) }
    else setWeeklyMonth((m) => m - 1)
  }
  const handleNextMonth = () => {
    if (weeklyMonth === 11) { setWeeklyMonth(0); setWeeklyYear((y) => y + 1) }
    else setWeeklyMonth((m) => m + 1)
  }

  const filteredReports = sampleReportHistory.filter((report) => {
    const matchesWarehouse = selectedWarehouse === "All Warehouses" || report.whse === selectedWarehouse
    const matchesReportType = selectedReportType === "All Reports" || report.reporttype === selectedReportType
    const matchesCerealType = selectedCerealType === "All Cereal Type" || report.cerealtype === selectedCerealType
    const matchesSearch = report.reportid.toLowerCase().includes(search.toLowerCase())
    return matchesWarehouse && matchesReportType && matchesCerealType && matchesSearch
  })

  const totalPages = Math.ceil(filteredReports.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredReports.length)
  const paginatedReports = filteredReports.slice(startIndex, endIndex)

  const handleWarehouseChange = (val) => { setSelectedWarehouse(val); setCurrentPage(1) }
  const handleReportTypeChange = (val) => { setSelectedReportType(val); setCurrentPage(1) }
  const handleCerealChange = (val) => { setSelectedCerealType(val); setCurrentPage(1) }

  const toggleRow = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const pageIds = paginatedReports.map((r) => r.reportid)
  const areAllOnPage = pageIds.every((id) => selectedRows.includes(id))
  const toggleSelectAll = () => {
    if (areAllOnPage) {
      setSelectedRows((prev) => prev.filter((id) => !pageIds.includes(id)))
    } else {
      setSelectedRows((prev) => [...prev, ...pageIds.filter((id) => !prev.includes(id))])
    }
  }

  return (
    <>
      <Header
        pageTitle="History"
        notifTo="/admin/notif"
        unreadCount={5}
        userName="Raph Nigos"
      />
    
      <div className="bg-[#F5F9F9] mx-4 my-4 !min-h-[650px] h-[calc(100vh-120px)] border border-black/10 rounded-lg shadow-[0_6px_4px_-4px_rgba(0,0,0,0.2)] flex flex-col">
        {/* Filter Bar */}
        <div className="px-3 py-3 mt-3">
          <div className="flex justify-between gap-4">

            {/* Left: Search bar */}
            <div className="flex flex-col">
              <div className="bg-white flex items-center border border-[#2D317F] rounded-full px-3 py-[6px] gap-2 shadow-[0_6px_4px_-4px_rgba(0,0,0,0.2)] w-[440px]">
                <FaBars color={'#2D317F'} size={15} className="shrink-0" />
                <Input
                  value={search}
                  onChange={handleSearchChange}
                  placeholder="Search Report"
                  className="bg-transparent border-0 rounded-xl placeholder:text-black/50 focus-visible:ring-0 h-7 text-sm"
                />
                <FaSearch color={'#2D317F'} size={15} className="shrink-0" />
              </div>
            </div>

            {/* Calendar button + stacked dropdowns */}
            <div className="flex gap-3">

              {/* Calendar Popover */}
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className="flex items-center justify-center rounded-md bg-[#E6EEF6] text-[#072560] hover:bg-[#d5e3f0] transition ease-in h-10 w-12 shadow-[0_6px_6px_-2px_rgba(0,0,0,0.2)]"
                  >
                    <FaRegCalendarAlt color='#072560' size={20} />
                  </button>
                </PopoverTrigger>

                <PopoverContent
                  align="end"
                  alignOffset={-8.4}
                  sideOffset={12}
                  className="z-40 w-80 overflow-visible rounded border-0 bg-[#E6EEF6] p-0 shadow-lg"
                >
                  {/* Arrow */}
                  <div className="absolute -top-2 left-70 h-4 w-4 rotate-45 bg-[#2D317F]" />

                  <div className="bg-[#2D317F] rounded-t pl-4 py-2  ">
                    <p className="text-white font-semibold text-base">Date</p>
                  </div>
                  {/* Content */}
                  <div className="px-5 py-3 pb-6">
                    <p className="mb-2 text-sm font-medium text-[#2D317F]">
                      Select range type and date
                    </p>

                    <FieldGroup>
                      <Field>
                        <FieldLabel className="font-medium text-[#2D317F]">Range</FieldLabel>
                        <Select
                          value={rangeDate}
                          onValueChange={(v) => {
                            setRangeDate(v)
                            setShowCalendarFilter(false)
                          }}
                        >
                          <SelectTrigger className="w-full border-gray-300 bg-white">
                            <SelectValue placeholder="Select range" />
                          </SelectTrigger>
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
                          <button
                            type="button"
                            onClick={() => setShowCalendarFilter((p) => !p)}
                            className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-xs focus:outline-none"
                          >
                            <span className={selectedDate ? "text-[#2D317F]" : "text-gray-400"}>
                              {selectedDate
                                ? `${String(selectedDate.getMonth() + 1).padStart(2, '0')}/${String(selectedDate.getDate()).padStart(2, '0')}/${selectedDate.getFullYear()}`
                                : "MM/DD/YYYY"}
                            </span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 opacity-50">
                              <path d="m6 9 6 6 6-6" />
                            </svg>
                          </button>
                        </Field>
                      )}

                      {rangeDate === "Weekly" && (
                        <Field>
                          <FieldLabel className="font-medium text-[#2D317F]">Week</FieldLabel>
                          <button
                            type="button"
                            onClick={() => setShowCalendarFilter((p) => !p)}
                            className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-xs focus:outline-none"
                          >
                            <span>Week {selectedWeek}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 opacity-50">
                              <path d="m6 9 6 6 6-6" />
                            </svg>
                          </button>
                        </Field>
                      )}

                      {rangeDate === "Monthly" && (
                        <Field>
                          <FieldLabel className="font-medium text-[#2D317F]">Month</FieldLabel>
                          <button
                            type="button"
                            onClick={() => setShowCalendarFilter((p) => !p)}
                            className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-xs focus:outline-none"
                          >
                            <span>{selectedMonth}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 opacity-50">
                              <path d="m6 9 6 6 6-6" />
                            </svg>
                          </button>
                        </Field>
                      )}
                    </FieldGroup>
                  </div>

                  {showCalendarFilter && (
                    <div className="absolute left-7 top-60 z-50 mt-2">
                      {rangeDate === "Daily" && (
                        <DailyFilter value={selectedDate} onChange={(date) => setSelectedDate(date)} />
                      )}
                      {rangeDate === "Weekly" && (
                        <WeeklyFilter
                          selectedWeek={selectedWeek}
                          year={weeklyYear}
                          month={weeklyMonth}
                          onPrevMonth={handlePrevMonth}
                          onNextMonth={handleNextMonth}
                          onMonthChange={setWeeklyMonth}
                          onYearChange={setWeeklyYear}
                          onWeekSelect={(week) => setSelectedWeek(week)}
                        />
                      )}
                      {rangeDate === "Monthly" && (
                        <MonthlyFilter
                          selectedMonth={selectedMonth}
                          year={monthlyYear}
                          onYearChange={setMonthlyYear}
                          onMonthChange={(month) => setSelectedMonth(month)}
                        />
                      )}
                    </div>
                  )}
                </PopoverContent>
              </Popover>

              {/* Stacked dropdowns */}
              <div className="flex gap-2">

                {/* Warehouses */}
                <div className="flex flex-col">
                  <Select value={selectedWarehouse} onValueChange={handleWarehouseChange}>
                    <SelectTrigger className="py-5 border-[#2D317F] bg-white text-[#2D317F] shadow-[0_6px_4px_-4px_rgba(0,0,0,0.2)]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem className='p-2 text-[#2D317F]' value="All Warehouses">All Warehouses</SelectItem>
                      <SelectItem className='p-2 text-[#2D317F]' value="Warehouse 1">Warehouse 1</SelectItem>
                      <SelectItem className='p-2 text-[#2D317F]' value="Warehouse 2">Warehouse 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Report Type */}
                <div className="flex flex-col">
                  <Select value={selectedReportType} onValueChange={handleReportTypeChange}>
                    <SelectTrigger className="py-5 border-[#2D317F] bg-white text-[#2D317F] shadow-[0_6px_4px_-4px_rgba(0,0,0,0.2)]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["All Reports", "Statement of Receipts", "Statement of Issuance", "Summary of Warehouse Reports"].map((o) => (
                        <SelectItem key={o} className="p-2 text-[#2D317F]" value={o}>{o}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Cereal Type */}
                <div className="flex flex-col">
                  <Select value={selectedCerealType} onValueChange={handleCerealChange}>
                    <SelectTrigger className="py-5 border-[#2D317F] bg-white text-[#2D317F] shadow-[0_6px_4px_-4px_rgba(0,0,0,0.2)]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem className='p-2 text-[#2D317F]' value="All Cereal Type">All Cereal Type</SelectItem>
                      <SelectItem className='p-2 text-[#2D317F]' value="WD1G50">Rice</SelectItem>
                      <SelectItem className='p-2 text-[#2D317F]' value="PD1350">Palay</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* Result Bar */}
        <div className="mt-3 flex items-center gap-3 px-4 py-[6px]">
          <span className="font-semibold text-[#2D317F]">Showing Reports For:</span>
          
          <div className="flex items-center gap-1">
            <FaRegCalendarAlt size={14} color="#2D317F" />
            <span className="text-[13px] font-medium mt-0.5 text-[#2D317F]">Date: January 01, 2026 - May 05, 2026</span>
          </div>

          <div className="ml-auto flex items-center gap-1">
            <FiCheckSquare size={16} color="#2D317F" />
            <span className="text-[13px] font-medium text-[#2D317F]">Result: {filteredReports.length}</span>
          </div>
        </div>

        {/* Table */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="w-full overflow-auto flex-1">

            {/* shadcn Table */}
            <Table>
              <TableHeader>
                <TableRow className="bg-[#E2EBFF] text-[#2D317F] font-medium h-10 xl:h-12 2xl:h-[50px]">
                  <TableHead className="h-12 pl-5 text-center font-bold text-[13px] text-[#2D317F]">
                    <div className="flex items-center justify-center gap-2">
                      <input
                        type="checkbox"
                        checked={areAllOnPage && paginatedReports.length > 0}
                        onChange={toggleSelectAll}
                      />
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

              <TableBody>
                {paginatedReports.length === 0 ? (
                  <>
                    <TableRow>
                      <TableCell colSpan={7} className="py-10 text-center text-[#9CA3AF]">
                        No records found.
                      </TableCell>
                    </TableRow>
                    {Array.from({ length: ITEMS_PER_PAGE - 1 }).map((_, i) => (
                      <TableRow key={`filler-${i}`} className="h-11 border-b border-[#E9EEF6] hover:bg-transparent">
                        <TableCell colSpan={7} />
                      </TableRow>
                    ))}
                  </>
                ) : (
                  <>
                    {paginatedReports.map((report) => (
                      <TableRow
                        key={report.reportid}
                        className="h-9 border-0 transition-colors"
                      >
                        <TableCell className="pl-5 text-center">
                          <input
                            type="checkbox"
                            checked={selectedRows.includes(report.reportid)}
                            onChange={() => toggleRow(report.reportid)}
                          />
                        </TableCell>
                        <TableCell className="text-center text-[13px] font-medium text-[#2D317F]">
                          {report.date}
                        </TableCell>
                        <TableCell className="text-center text-[13px] font-semibold text-[#2D317F]">
                          {report.reportid}
                        </TableCell>
                        <TableCell className="text-center text-[13px] font-medium text-[#2D317F]">
                          {report.reporttype}
                        </TableCell>
                        <TableCell className="text-center text-[13px] font-medium text-[#2D317F]">
                          {report.whse}
                        </TableCell>
                        <TableCell className="text-center text-[13px] font-medium text-[#2D317F]">
                          {report.cerealtype}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => navigate("/admin/evaluation/receipt")}
                              className="
                                inline-flex items-center gap-[5px] rounded-full border-[1.5px]
                                border-[#2D317F] bg-white px-[14px] py-[6px]
                                text-[13px] font-semibold text-[#2D317F]
                                transition-colors hover:bg-[#2D317F] hover:text-white
                              "
                            >
                              <GoLinkExternal size={14} />View
                            </button>
                            <button
                              className="
                                inline-flex items-center gap-[5px] rounded-full border
                                border-[#1D8104] px-[14px] py-[6px]
                                text-[13px] font-semibold text-[#1D8104]
                                transition-colors hover:border-[#1D8104] hover:bg-[#1D8104]
                                hover:text-white
                              "
                            >
                              <CiExport size={17} />Export
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}

                    {/* filler */}
                    {Array.from({ length: ITEMS_PER_PAGE - paginatedReports.length }).map((_, i) => (
                      <TableRow key={`filler-${i}`} className="h-12 border-b border-[#E9EEF6] hover:bg-transparent">
                        <TableCell colSpan={7} />
                      </TableRow>
                    ))}
                  </>
                )}
              </TableBody>
            </Table>
          </div>

          {/* selection */}
          <div className="border-t border-[#E9EEF6] px-5 py-[12px] min-h-[50px]">
            {selectedRows.length > 0 && (
              <div className="flex items-center justify-between gap-3 font-medium text-[#2D317F]">
                <span>{selectedRows.length} Reports Selected</span>
                <button
                  className="
                    inline-flex items-center gap-[5px] rounded-full border
                    border-[#1D8104] px-[14px] py-[6px]
                    text-[13px] font-semibold text-[#1D8104]
                    transition-colors hover:border-[#1D8104] hover:bg-[#1D8104]
                    hover:text-white
                  "
                >
                  <CiExport size={17} />Export
                </button>
              </div>
            )}
          </div>

          {/* pagination with buttons*/}
          <div className="flex items-center justify-between border-t border-[#E9EEF6] px-4 py-[10px]">
            <span className="text-[13px] font-medium text-[#6B7280]">
              {totalPages > 0 ? `${currentPage} of ${totalPages}` : '—'}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => p - 1)}
                disabled={currentPage === 1 || totalPages === 0}
                className="
                  rounded-md border-[1.5px] border-[#2D317F] bg-[#2D317F] px-[18px] py-[7px]
                  text-[13px] font-semibold text-white opacity-75
                  transition-colors hover:border-[#222669] hover:bg-[#222669]
                  disabled:cursor-not-allowed
                "
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={currentPage === totalPages || totalPages === 0}
                className="
                  rounded-md border-[1.5px] border-[#2D317F] bg-[#2D317F] px-[18px] py-[7px]
                  text-[13px] font-semibold text-white
                  transition-colors hover:border-[#222669] hover:bg-[#222669]
                  disabled:cursor-not-allowed
                "
              >
                Next
              </button>
            </div>
          </div>
        </div>

      </div>
    </>
  )
}