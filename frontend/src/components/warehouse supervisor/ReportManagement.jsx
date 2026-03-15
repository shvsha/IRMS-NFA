import { GoLinkExternal } from "react-icons/go";
import { FiEdit } from "react-icons/fi";
import { IoClose } from "react-icons/io5";
import { useState } from "react";
import { useNavigate } from "react-router-dom"; // added

import "../../styles/warehouse/stockBook.css";

const stockReports = [
  {
    cereal: "Palay",
    id: "R-001",
    transaction: "Milling",
    warehouse: "Warehouse 1",
    date: "30-Jan-26",
    status: "In Progress",
  },
  {
    cereal: "Rice",
    id: "R-002",
    transaction: "Sales",
    warehouse: "Warehouse 2",
    date: "30-Jan-26",
    status: "Completed",
  },
  {
    cereal: "Palay",
    id: "R-003",
    transaction: "Milling",
    warehouse: "Warehouse 1",
    date: "30-Jan-26",
    status: "Under Review",
  },
];

export default function StockBook() {
  const [cerealFilter, setCerealFilter] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  /* NEW STATES */
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCereal, setSelectedCereal] = useState("");

  const navigate = useNavigate();

  const filteredReports =
    cerealFilter === ""
      ? stockReports
      : stockReports.filter((r) => r.cereal === cerealFilter);

  const getStatusStyle = (status) => {
    const base = {
      padding: "6px 14px",
      borderRadius: "20px",
      fontWeight: "600",
      fontSize: "13px",
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
    };

    if (status === "In Progress")
      return { ...base, background: "#FFF3CD", color: "#856404" };

    if (status === "Completed")
      return { ...base, background: "#D4EDDA", color: "#155724" };

    if (status === "Under Review")
      return { ...base, background: "#D6E4FF", color: "#1D3A8A" };

    return base;
  };

  /* CREATE REPORT REDIRECT */
  const handleCreateReport = () => {
    if (!selectedCereal) {
      alert("Please select a cereal type");
      return;
    }

    navigate(`/whse/create/${selectedCereal}`);
  };

  return (
    <div className="whole-content-stock">
      {/* Top Controls */}
      <div className="stock-controls">
        <select
          className="cereal-filter-stock"
          value={cerealFilter}
          onChange={(e) => setCerealFilter(e.target.value)}
        >
          <option value="">Cereal Type</option>
          <option value="Palay">Palay</option>
          <option value="Rice">Rice</option>
        </select>

        {/* UPDATED BUTTON */}
        <button
          className="add-report-btn"
          onClick={() => setShowAddModal(true)}
        >
          + Add Report
        </button>
      </div>

      {/* Table */}
      <div className="table-wrapper-stock">
        <table className="reports-table-stock">
          <thead>
            <tr>
              <th>Cereal Type</th>
              <th>Report ID</th>
              <th>Transaction</th>
              <th>Warehouse</th>
              <th>Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredReports.map((r) => (
              <tr key={r.id}>
                <td>{r.cereal}</td>
                <td>{r.id}</td>
                <td>{r.transaction}</td>
                <td>{r.warehouse}</td>
                <td>{r.date}</td>

                <td>
                  <span style={getStatusStyle(r.status)}>{r.status}</span>
                </td>

                <td>
                  <div className="action-btns-stock">
                    <button className="view-btn-stock">
                      <GoLinkExternal size={14} />
                      View
                    </button>

                    <button
                      className="edit-btn-stock"
                      disabled={r.status === "Completed"}
                    >
                      <FiEdit size={14} />
                      Edit
                    </button>

                    <button
                      className="delete-btn-stock"
                      onClick={() => setShowDeleteModal(true)}
                    >
                      <IoClose size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div className="modal-overlay-stock">
          <div className="modal-box-stock">
            <h3>Delete Report</h3>

            <p>Are you sure you want to delete this report?</p>

            <div className="modal-buttons-stock">
              <button
                className="modal-cancel"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>

              <button className="modal-delete">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ADD REPORT MODAL */}
      {showAddModal && (
        <div className="modal-overlay-stock">
          <div className="modal-box-stock">
            <h3>Select Cereal Type</h3>

            <select
              className="cereal-filter-stock"
              value={selectedCereal}
              onChange={(e) => setSelectedCereal(e.target.value)}
            >
              <option value="">Select Cereal</option>
              <option value="Palay">Palay</option>
              <option value="Rice">Rice</option>
            </select>

            <div className="modal-buttons-stock">
              <button
                className="modal-cancel"
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedCereal("");
                }}
              >
                Cancel
              </button>

              <button
                className="modal-create"
                disabled={!selectedCereal}
                onClick={handleCreateReport}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
