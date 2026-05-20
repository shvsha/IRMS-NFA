// components
import { DailyFilter } from '../filters/DailyFilter'
import Header from '../Header'

// icons
import { FaRegCalendarAlt, FaSearch, FaBars } from "react-icons/fa";

// react
import { useState, useEffect, useMemo } from 'react'

// for notif
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { getNotifRoute } from '@/utils/Import & Export/getNotifRoute';
import { useUnreadCount } from '@/hooks/useUnreadCount';

// shadcn
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"

// api
import api from '@/api/axios'

const ITEMS_PER_PAGE = 10

const HEADERS = ["Audit ID", "Name", "Position", "Action", "Module", "Date", "Time"]

export default function AuditLogs() {
  // for notif
  const user       = useCurrentUser()
  const notifRoute = getNotifRoute(user)
  const userName   = user ? `${user.fname} ${user.lname}` : 'User'
  const unreadCount = useUnreadCount()

  const [auditLogs,         setAuditLogs]         = useState([])
  const [loading,           setLoading]           = useState(true)
  const [selectedStartDate, setSelectedStartDate] = useState(null)
  const [selectedEndDate,   setSelectedEndDate]   = useState(null)
  const [showStartCalendar, setShowStartCalendar] = useState(false)
  const [showEndCalendar,   setShowEndCalendar]   = useState(false)
  const [currentPage,       setCurrentPage]       = useState(1)
  const [search,            setSearch]            = useState('')

  useEffect(() => {
    const fetchAuditLogs = async () => {
      setLoading(true)
      try {
        const res = await api.get('/audit/logs/')
        setAuditLogs(res.data)
      } catch (err) {
        console.error('Failed to load audit logs:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchAuditLogs()
  }, [])

  const formatDate = (date) => {
    if (!date) return 'MM/DD/YYYY'
    return `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}/${date.getFullYear()}`
  }

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return '—'
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: '2-digit'
    }).replace(/ /g, '-')
  }

  const formatDisplayTime = (timeStr) => {
    if (!timeStr) return '—'
    const [h, m] = timeStr.split(':')
    const hour = parseInt(h)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 || 12
    return `${hour12}:${m} ${ampm}`
  }

  const handleEndDateChange = (date) => {
    if (selectedStartDate && date < selectedStartDate) {
      alert("End date can't be earlier than start date.")
      return
    }
    setSelectedEndDate(date)
    setShowEndCalendar(false)
  }

  const filteredLogs = useMemo(() => {
    const query = search.trim().toLowerCase()

    return auditLogs.filter(log => {
      const logDate = new Date(log.Date_audited + 'T00:00:00')

      if (selectedStartDate) {
        const start = new Date(selectedStartDate)
        start.setHours(0, 0, 0, 0)
        if (logDate < start) return false
      }

      if (selectedEndDate) {
        const end = new Date(selectedEndDate)
        end.setHours(23, 59, 59, 999)
        if (logDate > end) return false
      }

      // Search filter
      if (!query) return true
      return (
        String(log.Audit_id).includes(query)              ||
        (log.Name     || '').toLowerCase().includes(query) ||
        (log.Position || '').toLowerCase().includes(query) ||
        (log.Action   || '').toLowerCase().includes(query) ||
        (log.Module   || '').toLowerCase().includes(query) ||
        (log.Date_audited || '').includes(query)
      )
    })
  }, [auditLogs, search, selectedStartDate, selectedEndDate])

  const totalPages   = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE)
  const startIndex   = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  const handleSearchChange = (e) => {
    setSearch(e.target.value)
    setCurrentPage(1)
  }

  return (
    <>
      <Header
        pageTitle="Audit"
        unreadCount={unreadCount}
        notifTo={notifRoute}
        userName={userName}
      />

      <div className="bg-[#F5F9F9] mx-4 my-4 flex flex-col shadow-[0_6px_4px_-4px_rgba(0,0,0,0.2)] border border-black/10 rounded-lg !min-h-[650px]">

        {/* Filter Container */}
        <div className="flex flex-row items-start gap-5 p-4 flex-wrap justify-between">
          <div className='flex gap-5'>

            {/* Start Date */}
            <div className="shadow-[0_6px_4px_-4px_rgba(0,0,0,0.2)] flex flex-col gap-1.5 text-[#2D317F] text-[13px] font-semibold">
              <label>Start Date</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => { setShowStartCalendar(p => !p); setShowEndCalendar(false) }}
                  className="flex h-9 w-50 items-center justify-between gap-3 rounded-md border border-gray-300 px-3 py-2 text-sm"
                >
                  <span>{formatDate(selectedStartDate)}</span>
                  <FaRegCalendarAlt className="text-[#2D317F]" />
                </button>
                {showStartCalendar && (
                  <div className="absolute top-full left-0 z-50 mt-1">
                    <DailyFilter
                      value={selectedStartDate}
                      onChange={(date) => { setSelectedStartDate(date); setShowStartCalendar(false); setCurrentPage(1) }}
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
                  onClick={() => { setShowEndCalendar(p => !p); setShowStartCalendar(false) }}
                  className="flex h-9 w-50 items-center justify-between gap-3 rounded-md border border-gray-300 px-3 py-2 text-sm"
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

          {/* Search */}
          <div className='mt-4'>
            <div className="bg-white border border-[#2D317F] rounded-full py-1 px-5 flex items-center gap-2 shadow-[0_6px_4px_-4px_rgba(0,0,0,0.2)]">
              <FaBars color={'#2D317F'} size={18} className="shrink-0" />
              <Input
                value={search}
                onChange={handleSearchChange}
                placeholder="Search Audit Log"
                className="bg-transparent border-0 placeholder:text-black/50 focus-visible:ring-0 h-8 w-[430px]"
              />
              <FaSearch className="text-[#2D317F] shrink" size={20} />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="w-full overflow-x-auto">
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
                {loading ? (
                  <TableRow className='border-0'>
                    <TableCell colSpan={HEADERS.length} className="text-center py-16">
                      <div className="flex flex-col items-center gap-3 text-[#2D317F]">
                        <div className="w-8 h-8 border-4 border-[#2D317F] border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm font-medium">Loading audit logs...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : paginatedLogs.length === 0 ? (
                  <>
                    <TableRow>
                      <TableCell colSpan={HEADERS.length} className="py-10 text-center text-[#9CA3AF]">
                        No audit logs found.
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
                    {paginatedLogs.map((log) => (
                      <TableRow key={log.Audit_id} className="h-10 border-b border-[#E9EEF6]">
                        <TableCell className="px-4 text-[13px] font-medium text-[#2D317F]">{log.Audit_id}</TableCell>
                        <TableCell className="px-4 text-[13px] font-medium text-[#2D317F]">{log.Name || '—'}</TableCell>
                        <TableCell className="px-4 text-[13px] font-medium text-[#2D317F]">{log.Position || '—'}</TableCell>
                        <TableCell className="px-4 text-[13px] font-medium text-[#2D317F]">{log.Action || '—'}</TableCell>
                        <TableCell className="px-4 text-[13px] font-medium text-[#2D317F]">{log.Module || '—'}</TableCell>
                        <TableCell className="px-4 text-[13px] font-medium text-[#2D317F]">{formatDisplayDate(log.Date_audited)}</TableCell>
                        <TableCell className="px-4 text-[13px] font-medium text-[#2D317F]">{formatDisplayTime(log.Time_audited)}</TableCell>
                      </TableRow>
                    ))}

                    {/* Filler rows */}
                    {Array.from({ length: ITEMS_PER_PAGE - paginatedLogs.length }).map((_, i) => (
                      <TableRow key={`filler-${i}`} className="h-10 border-b border-[#E9EEF6] hover:bg-transparent">
                        <TableCell colSpan={HEADERS.length} />
                      </TableRow>
                    ))}
                  </>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="mt-auto flex items-center justify-between px-5 py-[14px]">
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
        </div>

      </div>
    </>
  )
}