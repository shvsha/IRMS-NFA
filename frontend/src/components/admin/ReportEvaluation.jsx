// react icon
import { GoLinkExternal } from "react-icons/go";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { FaCheck } from "react-icons/fa6";
import { TbXboxX } from "react-icons/tb";
import { FaSearch } from "react-icons/fa";

import { useState} from 'react'

// react router
import { useNavigate } from "react-router-dom";

// css
import '../../styles/admin/ReportEvaluation.css'

// components
import FilterDropdown from "../filters/FilterDropdown";

const sampleReports = [
  {id: "11692615", cerealtype: 'Palay', transaction: "Milling", whse: "Warehouse 1", date: "30-Jan-26", status: "Pending"},
  {id: "11692616", cerealtype: 'Rice', transaction: "Distribution", whse: "Warehouse 2", date: "31-Jan-26", status: "Approved"},
  {id: "11692617", cerealtype: 'Palay', transaction: "Milling", whse: "Warehouse 1", date: "29-Jan-26", status: "Pending"},
]

export default function ReportEvaluation() {
  // us
  const [selectedStatus, setSelectedStatus] = useState("All Status")
  const [selectedCerealType, setSelectedCerealType] = useState("All Cereal Type")
  const [selectedWarehouse, setSelectedWarehouse] = useState("All Warehouses")
  const [search, setSearch] = useState("");

  // navigate receipt report
  const navigate = useNavigate();

  // modals
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [isHiding, setIsHiding] = useState(false);

  // custom functions
  // reject modal
  const closeRejectModal = () => {
    setIsHiding(true);
    setTimeout(() => {
      setShowRejectModal(false);
      setIsHiding(false);
    }, 300);
  };
  const rejectModal = () => {
    setShowRejectModal(true);
    return
  }
  const handleReject = () => {
  // use when submitting the reason of reject (connected with report status and notification)
  }

  //success modal
  const approveModal = () => {
    setShowApproveModal(true)
    return
  } 
  const closeApproveModal = () => {
    setIsHiding(true);
    setTimeout(() => {
      setShowApproveModal(false);
      setIsHiding(false);
    }, 300);
  };

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
                      <button className="view-report-eval" onClick={() => navigate("/admin/evaluation/issue")}><GoLinkExternal size={15}/>View</button>
                      <button className="approve-report-eval" onClick={approveModal}><IoMdCheckmarkCircleOutline size={20} color={"green"}/>Approve</button>
                      <button className="reject-report-eval" onClick={rejectModal}>X</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* success modal */}
      <div
        className={
          "eval-validation-modal-overlay" +
          (showApproveModal ? " show" : "") +
          (isHiding ? " hiding" : "")
        }
      >
        <div className='success-modal-eval'>
          <div className='top-part-modal-success-eval'></div>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '25px'}}>
            <div className='icon-success-eval'><FaCheck size={50} color='white'/></div>
          </div>
          <p style={{color: '#2D317F', fontSize: '25px', fontWeight: 'bold'}}>Success!</p>
          <p style={{color: '#2D317F', fontSize: '15px', marginTop: '-20px'}}><span>Report 11692615</span> has been approved! </p>
          <button className='success-done-btn-eval' onClick={() => closeApproveModal()}>Done</button>
        </div>
      </div>

      {/* reject modal */}
      <div
        className={
          "eval-validation-modal-overlay" +
          (showRejectModal ? " show" : "") +
          (isHiding ? " hiding" : "")
        }
      >
        <div className='reject-modal-eval'>
          <div className='top-part-modal-reject-eval'></div>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '25px'}}>
            <div className='icon-reject-eval'><TbXboxX size={70} color='#BB2325'/></div>
          </div>
          <p style={{color: '#BB2325', fontSize: '25px', fontWeight: 'bold'}}>Reject Report?</p>
          <p style={{color: '#2B0505', fontSize: '15px', marginTop: '-20px'}}>Please give the reason why you’ve rejected this report down below:</p>
          <textarea className="reject-reason-textarea" placeholder="Type your reason here..." />
          <div className='validation-btns-reject'>
            <button className='cancel-btn-reject' onClick={closeRejectModal}>Cancel</button>
            <button className='reject-btn-reject' onClick={closeRejectModal}>Reject</button>
          </div>
        </div>
      </div>
        
    </>
  )
}