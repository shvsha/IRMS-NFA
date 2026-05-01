// components
import { DailyFilter } from './filters/DailyFilter'
import Header from './Header'

// icons
import { FaRegCalendarAlt, FaSearch, FaBars } from "react-icons/fa";

// react
import { useState } from 'react'

// shadcn
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"

const ITEMS_PER_PAGE = 7

const sampleAudit = [
  { recordid: "23100123", officeid: "1000212", name: "Louie Valenzuela", action: "Submitted Report", module: "Report Management", date: "30-Jan-26", time: "5:00 PM" },
  { recordid: "23100124", officeid: "1000213", name: "Febrose Valenzuela", action: "Evaluted Report", module: "Report Evaluation", date: "30-Jan-26", time: "5:00 PM" },
  { recordid: "23100125", officeid: "1000214", name: "John Dela Cruz", action: "Deleted Record", module: "Report Management", date: "29-Jan-26", time: "3:00 PM" },
  { recordid: "23100126", officeid: "1000215", name: "Maria Santos", action: "Submitted Report", module: "Report Management", date: "29-Jan-26", time: "2:00 PM" },
  { recordid: "23100127", officeid: "1000216", name: "Pedro Reyes", action: "Evaluated Report", module: "Report Evaluation", date: "28-Jan-26", time: "1:00 PM" },
  { recordid: "23100127", officeid: "1000216", name: "Pedro Reyes", action: "Evaluated Report", module: "Report Evaluation", date: "28-Jan-26", time: "1:00 PM" },
  { recordid: "23100127", officeid: "1000216", name: "Pedro Reyes", action: "Evaluated Report", module: "Report Evaluation", date: "28-Jan-26", time: "1:00 PM" },
  { recordid: "23100127", officeid: "1000216", name: "Pedro Reyes", action: "Evaluated Report", module: "Report Evaluation", date: "28-Jan-26", time: "1:00 PM" },
  { recordid: "23100127", officeid: "1000216", name: "Pedro Reyes", action: "Evaluated Report", module: "Report Evaluation", date: "28-Jan-26", time: "1:00 PM" },
  { recordid: "23100127", officeid: "1000216", name: "Pedro Reyes", action: "Evaluated Report", module: "Report Evaluation", date: "28-Jan-26", time: "1:00 PM" },
]

const HEADERS = ["Record ID", "Office ID", "Name", "Action", "Module", "Date", "Time"]

export default function AuditLogs() {
  const [selectedStartDate, setSelectedStartDate] = useState(new Date(2026, 0, 1));
  const [selectedEndDate, setSelectedEndDate] = useState(new Date(2026, 2, 20));
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");

  const formatDate = (date) => {
    if (!date) return "MM/DD/YYYY";
    return `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}/${date.getFullYear()}`;
  };

  const handleEndDateChange = (date) => {
    if (selectedStartDate && date < selectedStartDate) {
      alert("Your end date cant be lower that your start date.");
      return;
    }
    setSelectedEndDate(date);
    setShowEndCalendar(false);
  }

  const totalPages = Math.ceil(sampleAudit.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedAudit = sampleAudit.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <>
      <Header
        pageTitle="Audit"
        notifTo="/admin/notif"
        unreadCount={5}
        userName="Raph Nigos"
      />

      <div className="bg-[#F5F9F9] mx-4 my-4 pb-50 flex flex-col shadow-[0_6px_4px_-4px_rgba(0,0,0,0.2)] border border-black/10 rounded-lg !min-h-[640px]">
        {/* Filter Container */}
        <div className="flex flex-row items-start gap-5 p-4 flex-wrap justify-between">

            <div className='flex gap-5'>
              {/* Start Date */}
              <div className="shadow-[0_6px_4px_-4px_rgba(0,0,0,0.2)] flex flex-col gap-1.5 text-[#2D317F] text-[13px] font-semibold">
                <label>Start Date</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => { setShowStartCalendar(p => !p); setShowEndCalendar(false); }}
                    className="flex h-9 w-50 items-center justify-between gap-3 rounded-md border border-gray-300 bg-[#E0E2E4] px-3 py-2 text-sm"
                  >
                    <span>{formatDate(selectedStartDate)}</span>
                    <FaRegCalendarAlt className="text-[#2D317F]" />
                  </button>
                  {showStartCalendar && (
                    <div className="absolute top-full left-0 z-50 mt-1">
                      <DailyFilter
                        value={selectedStartDate}
                        onChange={(date) => { setSelectedStartDate(date); setShowStartCalendar(false); }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* End Date */}
              <div className="shadow-[0_6px_4px_-4px_rgba(0,0,0,0.2)] flex flex-col gap-1.5 text-[#2D317F] text-[13px] font-semibold">
                <label>End Date</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => { setShowEndCalendar(p => !p); setShowStartCalendar(false); }}
                    className="flex h-9 w-50 items-center justify-between gap-3 rounded-md border border-gray-300 bg-[#E0E2E4] px-3 py-2 text-sm"
                  >
                    <span>{formatDate(selectedEndDate)}</span>
                    <FaRegCalendarAlt className="text-[#2D317F]" />
                  </button>
                  {showEndCalendar && (
                    <div className="absolute top-full left-0 z-50 mt-1">
                      <DailyFilter
                        value={selectedEndDate}
                        onChange={handleEndDateChange}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* search */}
            <div className='mt-4'>
              <div className="bg-white border border-[#2D317F] rounded-full py-1 px-5 flex items-center gap-2 shadow-[0_6px_4px_-4px_rgba(0,0,0,0.2)]">
                <FaBars color={'#2D317F'} size={18} className="shrink-0" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search Report"
                    className="bg-transparent border-0 placeholder:text-black/50 focus-visible:ring-0 h-8 w-[430px]"
                  />
                <FaSearch className="text-[#2D317F] shrink" size={20}/>
              </div>
            </div>

        </div>

        {/* Table Container */}
        <div className="mt-3 flex flex-col">
          <div className="w-full overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#E2EBFF] hover:bg-[#E2EBFF] text-[#2D317F] font-medium border-b border-gray-200 h-10 xl:h-12 2xl:h-[50px]">
                  {HEADERS.map(header => (
                    <TableHead key={header} className="h-10 xl:h-12 2xl:h-[50px] text-left text-sm xl:text-base font-bold text-[#2D317F] px-4">
                      {header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>

              <TableBody>
                {paginatedAudit.length === 0 ? (
                  <>
                    <TableRow>
                      <TableCell colSpan={HEADERS.length} className="py-10 text-center text-[#9CA3AF]">
                        No records found.
                      </TableCell>
                    </TableRow>
                    {Array.from({ length: ITEMS_PER_PAGE - 1 }).map((_, i) => (
                      <TableRow key={`filler-${i}`} className="h-11 border-b border-[#E9EEF6] hover:bg-transparent">
                        <TableCell colSpan={HEADERS.length} />
                      </TableRow>
                    ))}
                  </>
                ) : (
                  <>
                    {paginatedAudit.map((audit, i) => (
                      <TableRow key={i} className="h-9 border-b border-[#E9EEF6]">
                        <TableCell className="px-4 text-[13px] h-10.5 font-medium text-[#2D317F]">{audit.recordid}</TableCell>
                        <TableCell className="px-4 text-[13px] h-10.5 font-medium text-[#2D317F]">{audit.officeid}</TableCell>
                        <TableCell className="px-4 text-[13px] h-10.5 font-medium text-[#2D317F]">{audit.name}</TableCell>
                        <TableCell className="px-4 text-[13px] h-10.5 font-medium text-[#2D317F]">{audit.action}</TableCell>
                        <TableCell className="px-4 text-[13px] h-10.5 font-medium text-[#2D317F]">{audit.module}</TableCell>
                        <TableCell className="px-4 text-[13px] h-10.5 font-medium text-[#2D317F]">{audit.date}</TableCell>
                        <TableCell className="px-4 text-[13px] h-10.5 font-medium text-[#2D317F]">{audit.time}</TableCell>
                      </TableRow>
                    ))}

                    {/* Filler rows */}
                    {Array.from({ length: ITEMS_PER_PAGE - paginatedAudit.length }).map((_, i) => (
                      <TableRow key={`filler-${i}`} className="h-10.5 border-b border-[#E9EEF6] hover:bg-transparent">
                        <TableCell colSpan={HEADERS.length} />
                      </TableRow>
                    ))}
                  </>
                )}
              </TableBody>
            </Table>
          </div>

        </div>
      </div>
    </>
  )
}