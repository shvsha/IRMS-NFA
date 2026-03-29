import { useState, useRef, useEffect } from 'react'
import { GoLinkExternal } from "react-icons/go";
import { CiExport } from "react-icons/ci";

import FilterDropdown from './filters/FilterDropdown'

import { useNavigate } from 'react-router-dom';

import '../styles/ReportSummarization.css'

const ITEMS_PER_PAGE = 4

const sampleSummaryReports = [
  {date: '30-Jan-26', whse: 'Warehouse 1', cerealtype: 'Rice', receipts: '5,000 Kg', issues: '2,200 Kg', balance: '2,800 Kg'},
  {date: '28-Jan-26', whse: 'Warehouse 2', cerealtype: 'Palay', receipts: '4,000 Kg', issues: '3,200 Kg', balance: '1,800 Kg'}
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

  const handleCerealChange = (val) => { setSelectedCerealType(val); setCurrentPage(1) }
  const handleWarehouseChange = (val) => { setSelectedWarehouse(val); setCurrentPage(1) }

  return (
    <div className='whole-container'>
      <div className='filter-reports-summary-container'>
        <div className='filter-reports-summary-wrapper'>
          <div className='filter-title-container'>
            <label className='filter-label-summary'>Cereal Type</label>
            <FilterDropdown
              selected={selectedCerealType}
              options={["All Cereal Type", "Rice", "Palay"]}
              onSelect={handleCerealChange}
              buttonClass="cereal-filter-report-summary"
            />
          </div>
          <div className='filter-title-container'>
            <label className='filter-label-summary'>Warehouses</label>
            <FilterDropdown
              selected={selectedWarehouse}
              options={["All Warehouses", "Warehouse 1", "Warehouse 2"]}
              onSelect={handleWarehouseChange}
              buttonClass="whse-filter-report-summary"
            />
          </div>
        </div>
      </div>

      <div className='report-summary-table-container'>
        <div className='title-pagenum-container'>
          <span className='title-report-label'>Report</span>
          <span className='title-pagenum-text'>
            {filteredReports.length === 0
              ? '0 of 0'
              : `${startIndex + 1}-${endIndex} of ${filteredReports.length}`}
          </span>
        </div>

        <div className='table-wrapper-summary'>
          <table className="reports-table-summary">
            <thead>
              <tr>
                <th>Date</th>
                <th>Cereal Type</th>
                <th>Warehouse</th>
                <th>Receipts</th>
                <th>Issues</th>
                <th>Ending Balance</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedReports.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: '#9CA3AF', padding: '40px 0' }}>
                    No records found.
                  </td>
                </tr>
              ) : (
                paginatedReports.map((report, i) => (
                  <tr key={i}>
                    <td>{report.date}</td>
                    <td>{report.cerealtype}</td>
                    <td>{report.whse}</td>
                    <td>{report.receipts}</td>
                    <td>{report.issues}</td>
                    <td>{report.balance}</td>
                    <td>
                      <div className='action-btns-summary'>
                        <button className='view-report-summary' onClick={()=>navigate("/admin/summarization/summary")}><GoLinkExternal size={14} />View</button>
                        <button className='export-report-summary'><CiExport size={15} />Export</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className='pagination-summary'>
          <span className='pagination-page-text-summary'>
            {totalPages > 0 ? `${currentPage} of ${totalPages}` : '—'}
          </span>
          <div className='pagination-btns-summary'>
            <button
              className='btn-prev-summary'
              onClick={() => setCurrentPage(p => p - 1)}
              disabled={currentPage === 1 || totalPages === 0}
            >
              Previous
            </button>
            <button
              className='btn-next-summary'
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}