// cc
import { GoLinkExternal } from "react-icons/go";
import { FiEdit } from "react-icons/fi";
import { IoClose } from "react-icons/io5";

// react
import { use, useState } from "react";
import { useNavigate } from "react-router-dom";

// css
import "../../styles/warehouse supervisor/stockBook.css";

// component
import FilterDropdown from '../filters/FilterDropdown'

// sample reports
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
  const navigate = useNavigate();

  // us
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCereal, setSelectedCereal] = useState("All Cereal Type");

  // for creating a new stock book
  const [selectedType, setSelectedType] = useState("");
  const [isHiding, setIsHiding] = useState(false);
  const [isShowing, setIsShowing] = useState(false);

  const openAddModal = () => {
    setShowAddModal(true);
    setTimeout(() => setIsShowing(true), 10);
  };

  const closeAddModal = () => {
    setIsShowing(false);
    setIsHiding(true);
    setTimeout(() => {
      setShowAddModal(false);
      setIsHiding(false);
      setSelectedType("");
    }, 300);
  };

  const handleCerealChange = (val) => { setSelectedCereal(val); }
  const handleTypeChange = (val) => { setSelectedType(val); }

  const filteredReports =
    selectedCereal === "All Cereal Type"
      ? stockReports
      : stockReports.filter((r) => r.cereal === selectedCereal);

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

  // redirect to stock book management if u didnt create any stock book yet
  const handleCreateReport = () => {
    if (!selectedType) {
      alert("Please select a cereal type");
      return;
    }

    navigate(`/whse/create/${selectedType}`);
  };

  return (
    <div className="whole-content-stock">
      <div className="stock-controls">
        <FilterDropdown
          selected={selectedCereal}
          options={['All Cereal Type', 'Palay', 'Rice']}
          onSelect={handleCerealChange}
          buttonClass={'cereal-filter-stockbook'}
        />

        <button
          className="add-report-btn"
          onClick={openAddModal}
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


      {/* ADD REPORT MODAL */}
        <div className={
          "modal-overlay-stock" +
          (isShowing ? " show" : "") +
          (isHiding ? " hiding" : "")
        }>
          <div className="modal-box-stock">
            <div className="top-part-add-report"></div>

            <div className="body-part-add-report">
              <h3>Cereal Type</h3>

              <FilterDropdown
                selected={selectedType}
                options={["Palay", "Rice"]}
                onSelect={handleTypeChange}
                buttonClass={'cereal-filter-stockbook type-filter-create'}
              />


              <div className="modal-buttons-stock">
                <button
                  className="modal-cancel"
                  onClick={closeAddModal}
                >
                  Cancel
                </button>

                <button
                  className="modal-create"
                  disabled={!selectedType}
                  onClick={handleCreateReport}
                >
                  Create
                </button>
              </div>
            </div>


          </div>
        </div>
    </div>
  );
}
