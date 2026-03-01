import { FaCalendarAlt } from "react-icons/fa";
import { GoLinkExternal } from "react-icons/go";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { useState } from 'react'

import '../../styles/admin/ReportEvaluation.css'

const sampleReports = [
  {id: "11692615", transaction: "Milling", submittedby: "Warehouse Supervisor 1", date: "30-Jan-26", status: "Pending"},
  {id: "11692616", transaction: "Distribution", submittedby: "Warehouse Supervisor 2", date: "31-Jan-26", status: "Approved"},
  {id: "11692617", transaction: "Milling", submittedby: "Warehouse Supervisor 1", date: "29-Jan-26", status: "Pending"},
]

export default function ReportEvaluation() {
  // us
  const [filterstatus, setFilterStatus] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState("All Status")
  const [search, setSearch] = useState("");
  
    const filterReports = sampleReports.filter(r =>
      r.transaction.toLowerCase().includes(search.toLowerCase())
    );

  const toggleDropDown = () => setFilterStatus(!filterstatus)

  const handleSelect = (option) => {
    setSelectedStatus(option)
    setFilterStatus(false)
  }

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
          <label htmlFor="">Total Reports:</label>
          <p>0</p>
        </div>
        <div className="report-status-container">
          <label htmlFor="">Pending: </label>
          <p className="pending-report">0</p>
          <label htmlFor="">Approved: </label>
          <p className="approved-report">0</p>
          <label htmlFor="">Rejected: </label>
          <p className="rejected-report">0</p>
        </div>
      </div>

      <div className="filter-report-container-eval">
        <div>
          <input 
            className="filter-report-eval" 
            type="text" 
            placeholder='Search'
            value={search} 
            onChange={e => setSearch(e.target.value)} />
        </div>
        <div>
          <div style={{ position: "relative", display: "inline-block" }}>
            <button className="report-status-filter-dropdown" onClick={toggleDropDown}>
              <span style={{marginLeft: "10px"}}>{selectedStatus}</span>
              <span>▼</span>
            </button>
            {filterstatus && (
              <ul className="dropdown-content-eval">
                {["All Status", "Pending", "Approved", "Rejected"].map((option) => (
                  <li
                    key={option}
                    onClick={() => handleSelect(option)}
                    style={{ padding: "8px 12px", cursor: "pointer" }}
                  >
                    {option}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button className="calendar-filter-report-eval"><FaCalendarAlt size={18} /></button>
        </div>
      </div>

      <div className="table-wrapper-eval">
        <table className="reports-table">
          <thead>
            <tr>
              <th>WRS#/WRH#</th>
              <th>Transaction</th>
              <th>Submitted By</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filterReports.map((reports, i) => (
              <tr key={i}>
                <td>{reports.id}</td>
                <td>{reports.transaction}</td>
                <td>{reports.submittedby}</td>
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
