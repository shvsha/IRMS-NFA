import { GoLinkExternal } from "react-icons/go";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { useState, useRef, useEffect } from 'react'
import { FaSearch } from "react-icons/fa";

import '../../styles/admin/ReportEvaluation.css'

const sampleReports = [
  {id: "11692615", cerealtype: 'Palay', transaction: "Milling", whse: "Warehouse 1", date: "30-Jan-26", status: "Pending"},
  {id: "11692616", cerealtype: 'Rice', transaction: "Distribution", whse: "Warehouse 2", date: "31-Jan-26", status: "Approved"},
  {id: "11692617", cerealtype: 'Palay', transaction: "Milling", whse: "Warehouse 1", date: "29-Jan-26", status: "Pending"},
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
        <span className={`dropdown-chevron-eval${open ? ' open' : ''}`}>▼</span>
      </button>
      {open && (
        <ul className="dropdown-content-eval">
          {options.map((option) => (
            <li
              key={option}
              onClick={() => { onSelect(option); setOpen(false) }}
              className={selected === option ? 'dropdown-item-active-eval' : ''}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function ReportEvaluation() {
  const [selectedStatus, setSelectedStatus] = useState("All Status")
  const [selectedCerealType, setSelectedCerealType] = useState("All Cereal Type")
  const [selectedWarehouse, setSelectedWarehouse] = useState("All Warehouses")
  const [search, setSearch] = useState("");

  const handleStatusChange = (val) => { setSelectedStatus(val); setSearch("") }
  const handleCerealChange = (val) => { setSelectedCerealType(val); setSearch("") }
  const handleWarehouseChange = (val) => { setSelectedWarehouse(val); setSearch("") }

  const filterReports = sampleReports.filter(r => {
    const matchSearch =
      r.transaction.toLowerCase().includes(search.toLowerCase()) ||
      r.id.includes(search) ||
      r.whse.toLowerCase().includes(search.toLowerCase())
    const matchStatus = selectedStatus === "All Status" || r.status === selectedStatus
    const matchCerealType = selectedCerealType === "All Cereal Type" || r.cerealtype === selectedCerealType
    const matchWarehouse = selectedWarehouse === "All Warehouses" || r.whse === selectedWarehouse
    return matchSearch && matchStatus && matchCerealType && matchWarehouse
  });

  const getStatusStyle = (status) => {
    const base = {
      padding: "6px 14px",
      borderRadius: "20px",
      fontWeight: "600",
      fontSize: "13px",
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
    }
    if (status === "Pending") return { ...base, backgroundColor: "#FFF3CD", color: "#856404", border: "1px solid #FFE08A" }
    if (status === "Approved") return { ...base, backgroundColor: "#D4EDDA", color: "#155724", border: "1px solid #90EE90" }
    if (status === "Rejected") return { ...base, backgroundColor: "#F8D7DA", color: "#721C24", border: "1px solid #F5A0A0" }
    return base
  }

  return (
    <>
      <div className="whole-content">
        <div className='total-reports-container'>
          <div className="total-reports">
            <label>Total Reports:</label>
            <p>{sampleReports.length}</p>
          </div>
          <div className="report-status-container">
            <label>Pending: </label>
            <p className="pending-report">{sampleReports.filter(r => r.status === "Pending").length}</p>
            <label>Approved: </label>
            <p className="approved-report">{sampleReports.filter(r => r.status === "Approved").length}</p>
            <label>Rejected: </label>
            <p className="rejected-report">{sampleReports.filter(r => r.status === "Rejected").length}</p>
          </div>
        </div>

        <div className="filter-report-container-eval">
          <div className="search-filter-container">
            <input
              className="filter-report-eval"
              type="text"
              placeholder='Search'
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <FaSearch className="search-icon-right-eval" size={20}/>
          </div>

          <div className="status-cereal-whse-filter-container">
            <FilterDropdown
              selected={selectedStatus}
              options={["All Status", "Pending", "Approved", "Rejected"]}
              onSelect={handleStatusChange}
              buttonClass="report-status-filter-dropdown"
            />
            <FilterDropdown
              selected={selectedCerealType}
              options={["All Cereal Type", "Rice", "Palay"]}
              onSelect={handleCerealChange}
              buttonClass="cereal-filter-report-eval"
            />
            <FilterDropdown
              selected={selectedWarehouse}
              options={["All Warehouses", "Warehouse 1", "Warehouse 2"]}
              onSelect={handleWarehouseChange}
              buttonClass="whse-filter-report-eval"
            />
          </div>
          
        </div>

        <div className="table-wrapper-eval">
          <table className="reports-table-eval">
            <thead>
              <tr>
                <th>WRS#/WRH#</th>
                <th>Cereal Type</th>
                <th>Transaction</th>
                <th>Submitted By</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filterReports.map((reports) => (
                <tr key={reports.id}>
                  <td>{reports.id}</td>
                  <td>{reports.cerealtype}</td>
                  <td>{reports.transaction}</td>
                  <td>{reports.whse}</td>
                  <td>{reports.date}</td>
                  <td>
                    <span style={getStatusStyle(reports.status)}>{reports.status}</span>
                  </td>
                  <td>
                    <div className="action-btns-eval">
                      <button className="view-report-eval"><GoLinkExternal size={15}/>View</button>
                      <button className="approve-report-eval"><IoMdCheckmarkCircleOutline size={20} color={"green"}/>Approve</button>
                      <button className="reject-report-eval">X</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}