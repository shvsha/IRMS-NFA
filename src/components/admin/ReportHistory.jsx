import { useState, useRef, useEffect } from 'react'
import { FaRegCalendarAlt, FaSearch } from "react-icons/fa";
import { GoLinkExternal } from "react-icons/go";
import { CiExport } from "react-icons/ci";
import '../../styles/admin/ReportHistory.css'

const ITEMS_PER_PAGE = 5

const sampleReportHistory = [
  {date: '30-Jan-26', reportid: 'R-001', reporttype: 'Statement of Issuance', whse: 'Warehouse 1', cerealtype: 'Rice'},
  {date: '23-Jan-26', reportid: 'R-002', reporttype: 'Statement of Receipts', whse: 'Warehouse 1', cerealtype: 'Palay'},
  {date: '31-Jan-26', reportid: 'R-003', reporttype: 'Summary of Warehouse Reports', whse: 'Warehouse 1', cerealtype: 'Rice'},
  {date: '28-Jan-26', reportid: 'R-004', reporttype: 'Statement of Warehouse Reports', whse: 'Warehouse 2', cerealtype: 'Palay'},
  {date: '28-Jan-26', reportid: 'R-005', reporttype: 'Statement of Receipts', whse: 'Warehouse 2', cerealtype: 'Palay'},
  {date: '28-Jan-26', reportid: 'R-006', reporttype: 'Statement of Receipts', whse: 'Warehouse 2', cerealtype: 'Palay'},
  {date: '28-Jan-26', reportid: 'R-007', reporttype: 'Statement of Issuance', whse: 'Warehouse 2', cerealtype: 'Palay'},
]

function FilterDropdown({ selected, options, onSelect, buttonClass }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button className={buttonClass} onClick={() => setOpen(o => !o)}>
        <span>{selected}</span>
        <span className={`dropdown-chevron-history${open ? ' open' : ''}`}>▼</span>
      </button>
      {open && (
        <ul className="dropdown-content-history">
          {options.map((option) => (
            <li
              key={option}
              onClick={() => { onSelect(option); setOpen(false) }}
              className={selected === option ? 'dropdown-item-active-history' : ''}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function ReportHistory() {
  // us
  const [selectedWarehouse, setSelectedWarehouse] = useState("All Warehouses")
  const [selectedReportType, setSelectedReportType] = useState("All Reports")
  const [selectedCerealType, setSelectedCerealType] = useState("All Cereal Type")
  const [currentPage, setCurrentPage] = useState(1)
  const [search, setSearch] = useState("");
  const handleSearchChange = (e) => { setSearch(e.target.value); setCurrentPage(1); }
  const [selectedRows, setSelectedRows] = useState([]);

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
  const handleReportTypeChange = (val) => {setSelectedReportType(val); setCurrentPage(1)}
  const handleCerealChange = (val) => { setSelectedCerealType(val); setCurrentPage(1) }

  const toggleRow = (id) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const pageIds = paginatedReports.map(r => r.reportid)
  const areAllOnPage = pageIds.every(id => selectedRows.includes(id))
  const toggleSelectAll = () => {
    if (areAllOnPage) {
      setSelectedRows(prev => prev.filter(id => !pageIds.includes(id)))
    } else {
      setSelectedRows(prev => [...prev, ...pageIds.filter(id => !prev.includes(id))])
    }
  }



  return (
    <>
      <div className='whole-container'>
        <div className='filter-container-history'>
          <div className='filter-wrapper-history'>
            <div className='filter-title-container-history'>
              <label className='filter-label-history' htmlFor="">Date</label>
              <button className='filter-date-history'><FaRegCalendarAlt size={18}/></button>
            </div>
            <div className='filter-title-container-history'>
              <label className='filter-label-history' htmlFor="">Warehouses</label>
              <FilterDropdown
                selected={selectedWarehouse}
                options={["All Warehouses", "Warehouse 1", "Warehouse 2"]}
                onSelect={handleWarehouseChange}
                buttonClass="whse-filter-report-history"
              />
            </div>
            <div className='filter-title-container-history'>
              <label className='filter-label-history' htmlFor="">Report Type</label>
              <FilterDropdown
                selected={selectedReportType}
                options={["All Reports", "Statement of Receipts", "Statement of Issuance", "Summary of Warehouse Reports"]}
                onSelect={handleReportTypeChange}
                buttonClass="whse-filter-report-history"
              />
            </div>
            <div className='filter-title-container-history'>
              <label className='filter-label-history' htmlFor="">Cereal Type</label>
              <FilterDropdown
                selected={selectedCerealType}
                options={["All Cereal Type", "Palay", "Rice"]}
                onSelect={handleCerealChange}
                buttonClass="whse-filter-report-history"
              />
            </div>
            <div className='filter-title-container-history search-container-history'>
              <div className='search-filter-container-history'>
                <input
                  className='filter-report-history'
                  type="text"
                  placeholder='Search Report ID'
                  value={search}
                  onChange={handleSearchChange}
                />
                <FaSearch className='search-icon-right-eval' size={20} />
              </div>
            </div>
          </div>
        </div>

        <div className='title-date-result-container-history'>
          <span className='date-result-label'>Showing Reports For:</span>
          <span className='date-range-text'>Date:January 01, 2026 - May 05, 2026</span>
          <span className='result-count-text'>Result: {filteredReports.length}</span>
        </div>

        <div className='report-history-table-container'>
          <div className='table-wrapper-history'>
            <table className='reports-table-history'>
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={areAllOnPage && paginatedReports.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th>Date</th>
                  <th>Report ID</th>
                  <th>Report Type</th>
                  <th>Warehouse</th>
                  <th>Cereal Type</th>
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
                  paginatedReports.map((report) => (
                    <tr key={report.reportid}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(report.reportid)}
                          onChange={() => toggleRow(report.reportid)}
                        />
                      </td>
                      <td>{report.date}</td>
                      <td>{report.reportid}</td>
                      <td>{report.reporttype}</td>
                      <td>{report.whse}</td>
                      <td>{report.cerealtype}</td>
                      <td>
                        <div className='action-btns-history'>
                          <button className='view-report-history'><GoLinkExternal size={14}/>View</button>
                          <button className='export-report-history'><CiExport size={15}/>Export</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className='selection-footer-history'>
            {selectedRows.length > 0 && (
              <div className='selected-info-history'>
                {selectedRows.length} Reports Selected
                <button className='export-selected-history'><CiExport size={15}/>Export</button>
              </div>
            )}
          </div>

          <div className='pagination-history'>
            <span className='pagination-page-text-history'>
              {totalPages > 0 ? `${currentPage} of ${totalPages}` : '—'}
            </span>
            <div className='pagination-btns-history'>
              <button
                className='btn-prev-history'
                onClick={() => setCurrentPage(p => p - 1)}
                disabled={currentPage === 1 || totalPages === 0}
              >
                Previous
              </button>
              <button
                className='btn-next-history'
                onClick={() => setCurrentPage(p => p + 1)}
                disabled={currentPage === totalPages || totalPages === 0}
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
