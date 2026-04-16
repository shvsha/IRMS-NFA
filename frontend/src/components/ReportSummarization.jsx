import { useState } from 'react'
import { GoLinkExternal } from "react-icons/go";
import { CiExport } from "react-icons/ci";
import { useNavigate } from 'react-router-dom';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const ITEMS_PER_PAGE = 4

const sampleSummaryReports = [
  { date: '30-Jan-26', whse: 'Warehouse 1', cerealtype: 'WD1G50', cond: 'GQ', receipts: '5,000', issues: '2,200', beginbalance: '10,000', balance: '2,800' },
  { date: '28-Jan-26', whse: 'Warehouse 2', cerealtype: 'WD1G50', cond: 'TD', receipts: '4,000', issues: '3,200', beginbalance: '8,000', balance: '1,800' },
  { date: '28-Jan-26', whse: 'Warehouse 1', cerealtype: 'PD1350', cond: 'TD', receipts: '4,000', issues: '3,200', beginbalance: '8,000', balance: '1,800' },
  { date: '28-Jan-26', whse: 'Warehouse 2', cerealtype: 'PD1350', cond: 'TD', receipts: '4,000', issues: '3,200', beginbalance: '8,000', balance: '1,800' },
  
]

const TABLE_HEADERS = [
  { label: "Date" },
  { label: "Cereal Type" },
  { label: "Cond." },
  { label: "Warehouse No." },
  { label: "Beginning Balance", sub: "Nkg" },
  { label: "Receipts", sub: "Nkg" },
  { label: "Issues", sub: "Nkg" },
  { label: "Ending Balance", sub: "Nkg" },
  { label: "Action" },
]

export default function ReportSummarization() {
  const [selectedCerealType, setSelectedCerealType] = useState("All Cereal Type")
  const [selectedWarehouse, setSelectedWarehouse] = useState("All Warehouses")
  const [currentPage, setCurrentPage] = useState(1)

  const navigate = useNavigate();

  const filteredReports = sampleSummaryReports.filter((report) => {
    const matchesCerealType = selectedCerealType === "All Cereal Type" || report.cerealtype === selectedCerealType
    const matchesWarehouse = selectedWarehouse === "All Warehouses" || report.whse === selectedWarehouse
    return matchesCerealType && matchesWarehouse
  })

  const totalPages = Math.ceil(filteredReports.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredReports.length)
  const paginatedReports = filteredReports.slice(startIndex, endIndex)

  return (
    <div className="m-[30px]">

      {/* Filter Bar */}
      <div className="bg-white px-6 py-5 shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
        <div className="flex gap-8 w-100">

          {/* Cereal Type */}
          <FieldGroup>
            <Field>
              <FieldLabel className="text-[#2D317F] font-medium mb-2 text-sm">
                Cereal Type
              </FieldLabel>
              <Select value={selectedCerealType} onValueChange={(v) => { setSelectedCerealType(v); setCurrentPage(1) }}>
                <SelectTrigger className="w-40 border border-[#bbb] rounded-md bg-white px-3 py-5 text-[#2d317f] font-semibold text-[13px] cursor-pointer">
                  <SelectValue placeholder="All Cereal Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem className='text-[#2D317F] py-2' value="All Cereal Type">All Cereal Type</SelectItem>
                  <SelectItem className='text-[#2D317F] py-2' value="WD1G50">Rice</SelectItem>
                  <SelectItem className='text-[#2D317F] py-2' value="PD1350">Palay</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>

          {/* Warehouses */}
          <FieldGroup>
            <Field>
              <FieldLabel className="text-[#2D317F] font-medium mb-2 text-sm">
                Warehouses
              </FieldLabel>
              <Select value={selectedWarehouse} onValueChange={(v) => { setSelectedWarehouse(v); setCurrentPage(1) }}>
                <SelectTrigger className="w-44 border border-[#bbb] rounded-md bg-white px-3 py-5 text-[#2d317f] font-semibold text-[13px] cursor-pointer">
                  <SelectValue placeholder="All Warehouses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem className='text-[#2D317F] py-2' value="All Warehouses">All Warehouses</SelectItem>
                  <SelectItem className='text-[#2D317F] py-2' value="Warehouse 1">Warehouse 1</SelectItem>
                  <SelectItem className='text-[#2D317F] py-2' value="Warehouse 2">Warehouse 2</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>

        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white mt-4 shadow-[0_1px_4px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col min-h-[374px]">

        {/* Title + Count */}
        <div className="flex items-center px-5 py-[14px]">
          <span className="font-bold text-[15px] text-[#2d317f] pr-4 border-r-2 border-slate-300 leading-none">
            Report
          </span>
          <span className="text-[13px] text-gray-500 font-medium pl-4">
            {filteredReports.length === 0
              ? '0 of 0'
              : `${startIndex + 1}-${endIndex} of ${filteredReports.length}`}
          </span>
        </div>

        {/* Table */}
        <div className="w-full flex-1 ">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#E2EBFF] text-[#2D317F] font-medium border-b border-gray-200 h-10 xl:h-12 2xl:h-[50px] ">
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
              {paginatedReports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-gray-400 py-10">
                    No records found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedReports.map((report, i) => (
                  <TableRow
                    key={i}
                    className="border-b border-[#e9eef6] h-[52px] hover:bg-transparent transition-colors duration-150"
                  >
                    <TableCell className="text-center px-4 pl-5 font-semibold text-[13px] text-[#2d317f]">{report.date}</TableCell>
                    <TableCell className="text-center px-4 font-medium text-[13px] text-[#2d317f]">{report.cerealtype}</TableCell>
                    <TableCell className="text-center px-4 font-medium text-[13px] text-[#2d317f]">{report.cond}</TableCell>
                    <TableCell className="text-center px-4 font-medium text-[13px] text-[#2d317f]">{report.whse}</TableCell>
                    <TableCell className="text-center px-4 font-medium text-[13px] text-[#2d317f]">{report.beginbalance}</TableCell>
                    <TableCell className="text-center px-4 font-medium text-[13px] text-[#2d317f]">{report.receipts}</TableCell>
                    <TableCell className="text-center px-4 font-medium text-[13px] text-[#2d317f]">{report.issues}</TableCell>
                    <TableCell className="text-center px-4 font-medium text-[13px] text-[#2d317f]">{report.balance}</TableCell>
                    <TableCell className="text-center px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => navigate("/admin/summarization/summary")}
                          className="inline-flex items-center gap-[5px] px-[14px] py-[6px] border-[1.5px] border-[#2d317f] rounded-md bg-white text-[#2d317f] text-[13px] font-semibold cursor-pointer transition-colors duration-150 hover:bg-[#2d317f] hover:text-white"
                        >
                          <GoLinkExternal size={14} /> View
                        </button>
                        <button
                          className="inline-flex items-center gap-[5px] px-[14px] py-[6px] border-[1.5px] border-[#1f7a3e] rounded-md bg-[#1f7a3e] text-white text-[13px] font-semibold cursor-pointer transition-colors duration-150 hover:bg-[#185f30] hover:border-[#185f30]"
                        >
                          <CiExport size={15} /> Export
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-[14px] border-t border-[#e9eef6]">
          <span className="text-[13px] text-gray-500 font-medium">
            {totalPages > 0 ? `${currentPage} of ${totalPages}` : '—'}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => p - 1)}
              disabled={currentPage === 1 || totalPages === 0}
              className="px-[18px] py-[7px] rounded-md text-[13px] font-semibold text-white bg-[#2d317f] border-[1.5px] border-[#2d317f] opacity-75 cursor-pointer transition-colors duration-150 hover:bg-[#222669] hover:border-[#222669] disabled:cursor-not-allowed disabled:opacity-50"
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
  )
}