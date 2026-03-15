import React, { useState } from "react";
import { GoLinkExternal } from "react-icons/go";
import "../../styles/warehouse supervisor/reportStatus.css";

const reportsData = [
  {
    id: "R-001",
    wrs: "11692615",
    transaction: "Milling",
    warehouse: "Warehouse 1",
    date: "30-Jan-26",
    cereal: "Palay",
    reportType: "Statement of Issuance",
    status: "Pending",
  },
  {
    id: "R-002",
    wrs: "11692616",
    transaction: "Milling",
    warehouse: "Warehouse 1",
    date: "30-Jan-26",
    cereal: "Rice",
    reportType: "Statement of Receipts",
    status: "Rejected",
  },
  {
    id: "R-003",
    wrs: "11692617",
    transaction: "Storage",
    warehouse: "Warehouse 2",
    date: "31-Jan-26",
    cereal: "Rice",
    reportType: "Summary of Warehouse Reports",
    status: "Approved",
  },
];

export default function ReportStatus() {
  const [filters, setFilters] = useState({
    cereal: "",
    report: "",
    status: "",
  });

  const [showModal, setShowModal] = useState(false);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  const isFiltering =
    filters.cereal !== "" || filters.report !== "" || filters.status !== "";

  const filteredReports = isFiltering
    ? reportsData.filter((report) => {
        return (
          (filters.cereal === "" || report.cereal === filters.cereal) &&
          (filters.report === "" || report.reportType === filters.report) &&
          (filters.status === "" || report.status === filters.status)
        );
      })
    : reportsData;

  return (
    <div className="whole-content-status">
      {/* Top Summary */}

      {/* Filters (RIGHT SIDE) */}
      <div className="filter-report-container-status">
        <select
          value={filters.cereal}
          onChange={(e) => handleFilterChange("cereal", e.target.value)}
        >
          <option value="">Cereal Type</option>
          <option value="Palay">Palay</option>
          <option value="Rice">Rice</option>
        </select>

        <select
          value={filters.report}
          onChange={(e) => handleFilterChange("report", e.target.value)}
        >
          <option value="">All Reports</option>
          <option value="Statement of Issuance">Statement of Issuance</option>
          <option value="Statement of Receipts">Statement of Receipts</option>
          <option value="Summary of Warehouse Reports">
            Summary of Warehouse Reports
          </option>
        </select>

        <select
          value={filters.status}
          onChange={(e) => handleFilterChange("status", e.target.value)}
        >
          <option value="">All Status</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
          <option value="Pending">Pending</option>
        </select>
      </div>

      {/* Table */}
      <div className="table-wrapper-status">
        <table className="reports-table-status">
          <thead>
            <tr>
              <th>Report ID</th>
              <th>WRS#/WRI#</th>
              <th>Transaction</th>
              <th>Warehouse</th>
              <th>Report Type</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredReports.length === 0 ? (
              <tr>
                <td colSpan="8">No reports found</td>
              </tr>
            ) : (
              filteredReports.map((report) => (
                <tr key={report.id}>
                  <td>{report.id}</td>
                  <td>{report.wrs}</td>
                  <td>{report.transaction}</td>
                  <td>{report.warehouse}</td>
                  <td>{report.reportType}</td>
                  <td>{report.date}</td>

                  <td>
                    <span
                      className={`status-badge ${
                        report.status === "Pending"
                          ? "pending"
                          : report.status === "Approved"
                            ? "approved"
                            : "rejected"
                      }`}
                      onClick={() =>
                        report.status === "Rejected" && setShowModal(true)
                      }
                    >
                      {report.status}
                    </span>
                  </td>

                  <td>
                    <div className="action-btns-status">
                      <button className="view-report-status">
                        <GoLinkExternal size={15} />
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {showModal && (
        <div className="modal-overlay-status">
          <div className="modal-box-status">
            <div className="modal-header-status">Reason for Rejection</div>

            <div className="modal-content-status">
              <div className="modal-icon-status">📋</div>

              <p>
                Incorrect warehouse report data submitted. Please review and
                edit the report before resubmitting.
              </p>

              <div className="modal-buttons-status">
                <button
                  className="modal-btn-back"
                  onClick={() => setShowModal(false)}
                >
                  Back
                </button>

                <button className="modal-btn-edit">Edit</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
