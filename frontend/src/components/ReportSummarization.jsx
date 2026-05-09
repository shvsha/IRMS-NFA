import { useState, useEffect } from 'react'
import { GoLinkExternal } from "react-icons/go";
import { CiExport } from "react-icons/ci";
import { useNavigate } from 'react-router-dom';
import { exportSummaryToExcel } from '@/utils/exportToExcel'

import { FaSearch, FaBars } from "react-icons/fa"

import Header from '../components/Header'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Field } from "@/components/ui/field"
import api from '@/api/axios'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"

const ITEMS_PER_PAGE = 4

const TABLE_HEADERS = [
  { label: "Date" },
  { label: "Cond." },
  { label: "Warehouse No." },
  { label: "Beginning Balance", sub: "Nkg" },
  { label: "Receipts", sub: "Nkg" },
  { label: "Issues", sub: "Nkg" },
  { label: "Ending Balance", sub: "Nkg" },
  { label: "Action" },
]

export default function ReportSummarization() {
  const navigate = useNavigate();
  const basePath = window.location.pathname.startsWith('/signa')
    ? '/signa'
    : window.location.pathname.startsWith('/whse')
      ? '/whse'
      : '/admin';

  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedWarehouse, setSelectedWarehouse] = useState("All Warehouses")
  const [currentPage, setCurrentPage] = useState(1)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchSummaries = async () => {
      setLoading(true)
      try {
        const [summaryRes, stocksRes] = await Promise.all([
          api.get('/reports/summary/'),
          api.get('/reports/stocks/'),
        ])

        const archivedIds = new Set(
          stocksRes.data
            .filter(s => s.Status === 'Archived')
            .map(s => s.report_id)
        )

      const mapped = summaryRes.data
        .filter(item => {
          if (!Array.isArray(item.stockbooks) || item.stockbooks.length === 0) return true
          return item.stockbooks.some(id => !archivedIds.has(id))
        })
        .map((item) => ({
          ...item,
          date:         item.date_covered || '—',
          cerealtype:   item.CerealType   || '—',
          cond:         item.Condition    || '—',
          whse:         item.WHCode       || '—',
          beginbalance: item.prev_B_NKG   != null ? Number(item.prev_B_NKG).toLocaleString()   : '0',
          receipts:     item.total_R_NKG  != null ? Number(item.total_R_NKG).toLocaleString()  : '0',
          issues:       item.total_I_NKG  != null ? Number(item.total_I_NKG).toLocaleString()  : '0',
          balance:      item.ending_B_NKG != null ? Number(item.ending_B_NKG).toLocaleString() : '0',
        }))
        .sort((a, b) => b.summary_id - a.summary_id)

        setReports(mapped)
      } catch (err) {
        console.error('Failed to load summarized reports:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchSummaries()
  }, [])

  const filteredReports = reports.filter((report) => {
    const matchesWarehouse = selectedWarehouse === "All Warehouses" || report.whse === selectedWarehouse
    const matchesSearch = search === '' ||
      report.date?.toString().toLowerCase().includes(search.toLowerCase()) ||
      report.whse?.toString().toLowerCase().includes(search.toLowerCase()) ||
      report.cond?.toString().toLowerCase().includes(search.toLowerCase())
    return matchesWarehouse && matchesSearch
  })

  const totalPages = Math.ceil(filteredReports.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredReports.length)
  const paginatedReports = filteredReports.slice(startIndex, endIndex)

  const getTotal = (key) =>
    filteredReports.reduce((sum, r) => sum + Number(r[key].replace(/,/g, '')), 0).toLocaleString()

  const handleExport = async (summaryId) => {
    try {
      await api.post('/audit/log-export/', { type: 'Summary', id: summaryId })
      const res = await api.get(`/reports/summary/upd/${summaryId}/`)
      exportSummaryToExcel(res.data)
    } catch (err) {
      console.error('Failed to export summary:', err)
    }
  }

  return (
    <div>
      <Header
        pageTitle="Summary"
        notifTo={`${basePath}/notif`}
        unreadCount={5}
        userName="Raph Nigos"
      />

      {/* Outer card  */}
      <div className='flex flex-col bg-[#F5F9F9] mx-4 my-4 !min-h-[650px] border border-black/10 rounded-lg shadow-[0_6px_4px_-4px_rgba(0,0,0,0.2)]'>

        {/* Filter Bar */}
        <div className="px-3 py-4">
          <div className="flex items-center justify-between gap-4">

            {/* Search */}
            <div className="bg-white flex items-center border border-[#2D317F] rounded-full px-3 py-[6px] gap-2 shadow-[0_6px_4px_-4px_rgba(0,0,0,0.2)] w-[440px]">
              <FaBars color={'#2D317F'} size={15} className="shrink-0" />
              <Input
                value={search}
                onChange={e => { setSearch(e.target.value); setCurrentPage(1) }}
                placeholder="Search Report"
                className="bg-transparent border-0 rounded-xl placeholder:text-black/50 focus-visible:ring-0 h-7 text-sm"
              />
              <FaSearch color={'#2D317F'} size={15} className="shrink-0" />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">

              {/* Warehouses */}
              <Field>
                <Select value={selectedWarehouse} onValueChange={(v) => { setSelectedWarehouse(v); setCurrentPage(1) }}>
                  <SelectTrigger className="w-40 border border-[#2D317F] rounded-md py-5 bg-white px-3 shadow-[0_6px_4px_-4px_rgba(0,0,0,0.2)] text-[#2d317f] font-medium text-[13px] cursor-pointer">
                    <SelectValue placeholder="All Warehouses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem className='text-[#2D317F] py-2' value="All Warehouses">All Warehouses</SelectItem>
                    <SelectItem className='text-[#2D317F] py-2' value="Warehouse 1">Warehouse 1</SelectItem>
                    <SelectItem className='text-[#2D317F] py-2' value="Warehouse 2">Warehouse 2</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>

          </div>
        </div>

        {/* Table section */}
        <div className="flex flex-col flex-1 overflow-hidden">

          {/* Table */}
          <div className="w-full overflow-x-auto">
            <Table className="bg-[#F5F9F9]">
              <TableHeader>
                <TableRow className="bg-[#E2EBFF] text-[#2D317F] font-medium border-b border-gray-200 h-10 xl:h-12 2xl:h-[50px]">
                  {TABLE_HEADERS.map((h, i) => (
                    <TableHead
                      key={i}
                      className="font-bold text-[#2d317f] text-center px-4 first:pl-5 leading-tight h-10 xl:h-12 2xl:h-[50px] text-[11px] xl:text-[13px]"
                    >
                      <div className="flex flex-col items-center">
                        <span>{h.label}</span>
                        {h.sub && <span className="font-normal text-[11px] text-[#5a6ab1]">{h.sub}</span>}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow className='border-0'>
                    <TableCell colSpan={9} className="text-center py-16">
                      <div className="flex flex-col items-center gap-3 text-[#2D317F]">
                        <div className="w-8 h-8 border-4 border-[#2D317F] border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm font-medium">Loading summary reports...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : paginatedReports.length === 0 ? (
                  <TableRow className='border-0'>
                    <TableCell colSpan={9} className="text-center text-gray-400 py-10">
                      No summary reports found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedReports.map((report, i) => (
                    <TableRow
                      key={i}
                      className="border-0 h-[52px] hover:bg-blue-50/40 transition-colors duration-150"
                    >
                      <TableCell className="text-center px-4 pl-5 font-semibold text-[13px] text-[#2d317f] border-0">{report.date}</TableCell>
                      <TableCell className="text-center px-4 font-medium text-[13px] text-[#2d317f] border-0">{report.cond}</TableCell>
                      <TableCell className="text-center px-4 font-medium text-[13px] text-[#2d317f] border-0">{report.whse}</TableCell>
                      <TableCell className="text-center px-4 font-medium text-[13px] text-[#2d317f] border-0">{report.beginbalance}</TableCell>
                      <TableCell className="text-center px-4 font-medium text-[13px] text-[#2d317f] border-0">{report.receipts}</TableCell>
                      <TableCell className="text-center px-4 font-medium text-[13px] text-[#2d317f] border-0">{report.issues}</TableCell>
                      <TableCell className="text-center px-4 font-medium text-[13px] text-[#2d317f] border-0">{report.balance}</TableCell>
                      <TableCell className="text-center px-4 border-0">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => navigate(`${basePath}/summarization/summary`, {
                              state: { summaryId: report.summary_id }
                            })}
                            className="inline-flex items-center gap-[5px] px-[14px] py-[6px] border-[1.5px] border-[#2d317f] rounded-full bg-white text-[#2d317f] text-[13px] font-semibold cursor-pointer transition-colors duration-150 hover:bg-[#2d317f] hover:text-white"
                          >
                            <GoLinkExternal size={14} /> View
                          </button>
                          <button
                            onClick={() => handleExport(report.summary_id)}
                            className="
                              inline-flex items-center gap-[5px] rounded-full border
                              border-[#1D8104] px-[14px] py-[6px]
                              text-[13px] font-semibold text-[#1D8104]
                              transition-colors hover:border-[#1D8104] hover:bg-[#1D8104] hover:text-white
                            "
                          >
                            <CiExport size={17} />Export
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-auto">

            {/* Totals Row */}
            {filteredReports.length > 0 && (
              <table className="w-full table-fixed">
                <colgroup>
                  {Array(8).fill(null).map((_, i) => (
                    <col key={i} style={{ width: '12.5%' }} />
                  ))}
                </colgroup>
                <tbody>
                  <tr>
                    <td colSpan={3} />
                    <td className="text-center px-4 py-3 text-[13px] text-[#8C8C8C]">{getTotal('beginbalance')}</td>
                    <td className="text-center px-4 py-3 text-[13px] text-[#8C8C8C]">{getTotal('receipts')}</td>
                    <td className="text-center px-4 py-3 text-[13px] text-[#8C8C8C]">{getTotal('issues')}</td>
                    <td className="text-center px-4 py-3 text-[13px] text-[#8C8C8C]">{getTotal('balance')}</td>
                    <td />
                  </tr>
                </tbody>
              </table>
            )}

            {/* Pagination */}
            <div className="flex items-center justify-between px-5 py-[14px] ">
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

      </div>
    </div>
  )
}