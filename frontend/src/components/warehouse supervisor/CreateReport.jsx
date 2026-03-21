// react
import { useParams, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";

// css
import "../../styles/warehouse supervisor/createReport.css";

// react icons
import { CiExport, CiImport } from "react-icons/ci";

// Auth Context
// ⚠️ Replace this import path with wherever your AuthContext actually lives
// import { AuthContext } from "../../context/AuthContext";

export default function CreateReport({ stockBook }) {
  const { cereal } = useParams();
  const navigate = useNavigate();

  // auth context
  // const { user }= useContext(AuthContext);
  // const supervisorName = user?.name ?? "—";
  // const warehouseCode = user?.whcode ?? "—";

  // Status of the Stock Book
  const reportId = stockBook?.StockBook_ID ?? "—";
  const cerealType = stockBook?.CerealType ?? cereal ?? "—";
  const status = stockBook?.Status ?? "In Progress";

  // Status badge styles
  const STATUS_CONFIG = {
    "In Progress": { label: "In Progress", className: "status-badge status-in-progress"},
    "Under Review": { label: "Under Review", className: "status-badge status-under-review"},
    "Completed": { label: "Completed", className: "status-badge status-completed"}
  };
  const badgeConfig = STATUS_CONFIG[status] ?? STATUS_CONFIG["In Progress"]

  // each fields/row in the table
    const EMPTY_ROW = {
    year:            "",
    month:           "",
    Particulars:     "",
    Plate_Number:    "",
    WSR:             "",
    WSI:             "",
    Batch_No:        "",
    Age:             "",
    AI_Number:       "",
    OR_Number:       "",
    Moisture_Content:"",
    Classifier:      "",
    Transaction:     "",
    Pile_No:         "",
    R_Bags:          "",
    R_GKG:           "",
    R_NKG:           "",
    R_Ave_Weight:    "",
    I_Bags:          "",
    I_GKG:           "",
    I_NKG:           "",
    I_Ave_Weight:    "",
    Fillers:         "",
    B_Bags:          "",
    B_GKG:           "",
    B_NKG:           "",
    Avg_Weight:      "",
    Bags_Weight:     "",
    SOBRA:           "",
  };
  const [rows, setRows]= useState(
    // TODO (backend): when viewing an existing stock book, pre-fill from fetched rows:
    // stockBook?.rows ?? Array.from({ length: 15 }, () => ({ ...EMPTY_ROW }))
    Array.from({ length: 15}, () => ({ ...EMPTY_ROW}))
  );

  // custom functions
  const handleRowChange = (rowIndex, field, value) => {
    setRows((prev) => {
      const updated = [...prev];
      updated[rowIndex] = { ...updated[rowIndex], [field]: value};
      return updated;
    });
  };

  const handleSubmit = () => {
    const payload = {
      // Name: supervisorName,
      // WHCode: warehouseCode,
      CerealType: cerealType,
      Status: "Under Review",

      rows: rows.filter((row) =>
        Object.values(row).some((v) => v !== "")
      ),
    };

    console.log("Stock Book Payload (ready for API):", payload);

    // TODO (backend): wire up your API call here, e.g.:
    // const res = await axios.post("/api/stockbook", payload);
    // or:
    // const res = await fetch("/api/stockbook", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify(payload),
    // });
    
    navigate("/whse/management");
  }

  return (
    <div className="create-report-container">
      {/* HEADER */}
      <div className="report-header">
        <div>
          <strong>Report ID:</strong> R-001
        </div>

        <div className="header-input">
          <strong>Warehouse Supervisor:</strong>
          {/* reflect to the user later on */}
          {/* <span>{supervisorName}</span> */}
        </div>

        <div>
          <strong>Cereal Type:</strong> {cerealType}
        </div>

        <div className="header-input">
          <strong>Warehouse Code:</strong>
          {/* reflect to the user's whse code later on */}
          {/* <span>{warehouseCode}</span> */}
        </div>

        <div style={{ display: 'flex', alignItems: "center", gap: '8px'}}>
          <strong>Status:</strong>
          <div className={badgeConfig.className}>{badgeConfig.label}</div>
        </div>

        {/* import and export of stock book */}
        <div className="import-export-container">
          <button className="imp-exp-btn imp-btn"><CiImport size={25} color={'#3E7A43'} /></button>
          <button className="imp-exp-btn exp-btn"><CiExport size={25} color={'white'} />Export</button>

        </div>
      </div>

      {/* TABLE */}
      <div className="report-table-scroll">
        <table className="report-table">
          <thead>
            <tr>
              <th colSpan="2">Date</th>
              <th rowSpan="2">Particulars</th>
              <th rowSpan="2">Plate #</th>
              <th colSpan="2">WTS#</th>
              <th rowSpan="2">Batch No.</th>
              <th rowSpan="2">Age</th>
              <th rowSpan="2">AI#</th>
              <th rowSpan="2">OR#</th>
              <th rowSpan="2">Moisture Content</th>
              <th rowSpan="2">Classifier</th>
              <th rowSpan="2">Transaction</th>
              <th rowSpan="2">Pile No.</th>
              <th colSpan="3">Receipts</th>
              <th rowSpan="2">Average Weight</th>
              <th colSpan="3">Issues</th>
              <th rowSpan="2">Average Weight</th>
              <th rowSpan="2">Fillers</th>
              <th colSpan="3">Balance</th>
              <th rowSpan="2">AVE. WT. per GKg BAL</th>
              <th rowSpan="2">BAGS @50KGs per BAG</th>
              <th rowSpan="2">SOBRA</th>
            </tr>

            <tr>
              <th>Year</th>
              <th>Month</th>

              <th>WSR#</th>
              <th>WSI#</th>

              <th>Bags</th>
              <th>GKg</th>
              <th>NKg</th>

              <th>Bags</th>
              <th>GKg</th>
              <th>NKg</th>

              <th>Bags</th>
              <th>GKg</th>
              <th>NKg</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                <td>
                  <input type="text" value={row.year} onChange={(e) => handleRowChange(rowIndex, "year", e.target.value)} />
                </td>
                <td>
                  <input type="text" value={row.month} onChange={(e) => handleRowChange(rowIndex, "month", e.target.value)} />
                </td>
                {/* Main info */}
                <td>
                  <input type="text" value={row.Particulars} onChange={(e) => handleRowChange(rowIndex, "Particulars", e.target.value)}/>
                </td>
                <td>
                  <input type="text" value={row.Plate_Number} onChange={(e)=> handleRowChange(rowIndex, "Plate_Number", e.target.value)}/>
                </td>
                <td>
                  <input type="text" value={row.WSR} onChange={(e) => handleRowChange(rowIndex, "WSR", e.target.value)}/>
                </td>
                <td>
                  <input type="text" value={row.WSI} onChange={(e) => handleRowChange(rowIndex, "WSI", e.target.value)} />
                </td>
                <td>
                  <input type="text" value={row.Batch_No} onChange={(e) => handleRowChange(rowIndex, "Batch_No", e.target.value)}/>
                </td>
                <td>
                  <input type="text" value={row.Age} onChange={(e) => handleRowChange(rowIndex, "Age", e.target.value)}/>
                </td>
                <td>
                  <input type="text" value={row.AI_Number} onChange={(e) => handleRowChange(rowIndex, "AI_Number", e.target.value)}/>
                </td>
                <td>
                  <input type="text" value={row.OR_Number} onChange={(e) => handleRowChange(rowIndex, "OR_Number", e.target.value)}/>
                </td>
                <td>
                  <input type="text" value={row.Moisture_Content} onChange={(e) => handleRowChange(rowIndex, "Moisture_Content", e.target.value)}/>
                </td>
                <td>
                  <input type="text" value={row.Classifier} onChange={(e) => handleRowChange(rowIndex, "Classifier", e.target.value)}/>
                </td>
                <td>
                  <input type="text" value={row.Transaction} onChange={(e) => handleRowChange(rowIndex, "Transaction", e.target.value)}/>
                </td>
                <td>
                  <input type="text" value={row.Pile_No} onChange={(e) => handleRowChange(rowIndex, "Pile_No", e.target.value)}/>
                </td>

                {/* Receipts */}
                <td>
                  <input type="text" value={row.R_Bags} onChange={(e) => handleRowChange(rowIndex, "R_Bags", e.target.value)}/>
                </td>
                <td>
                  <input type="text" value={row.R_GKG} onChange={(e) => handleRowChange(rowIndex, "R_GKG", e.target.value)}/>
                </td>
                <td>
                  <input type="text" value={row.R_NKG} onChange={(e) => handleRowChange(rowIndex, "R_NKG", e.target.value)}/>
                </td>
                <td>
                  <input type="text" value={row.R_Ave_Weight} onChange={(e) => handleRowChange(rowIndex, "R_Ave_Weight", e.target.value)}/>
                </td>

                {/* Issues */}
                <td>
                  <input type="text" value={row.I_Bags} onChange={(e) => handleRowChange(rowIndex, "I_Bags", e.target.value)}/>
                </td>
                <td>
                  <input type="text" value={row.I_GKG} onChange={(e) => handleRowChange(rowIndex, "I_GKG", e.target.value)}/>
                </td>
                <td>
                  <input type="text" value={row.I_NKG} onChange={(e) => handleRowChange(rowIndex, "I_NKG", e.target.value)}/>
                </td>
                <td>
                  <input type="text" value={row.I_Ave_Weight} onChange={(e) => handleRowChange(rowIndex, "I_Ave_Weight", e.target.value)}/>
                </td>

                {/* Fillers */}
                <td>
                  <input type="text" value={row.Fillers} onChange={(e) => handleRowChange(rowIndex, "Fillers", e.target.value)}/>
                </td>

                {/* Balance */}
                <td>
                  <input type="text" value={row.B_Bags} onChange={(e) => handleRowChange(rowIndex, "B_Bags", e.target.value)}/>
                </td>
                <td>
                  <input type="text" value={row.B_GKG} onChange={(e) => handleRowChange(rowIndex, "B_GKG", e.target.value)}/>
                </td>
                <td>
                  <input type="text" value={row.B_NKG} onChange={(e) => handleRowChange(rowIndex, "B_NKG", e.target.value)}/>
                </td>

                {/* AVE. WT. per GKg BAL */}
                <td>
                  <input type="text" value={row.Avg_Weight} onChange={(e) => handleRowChange(rowIndex, "Avg_Weight", e.target.value)}/>
                </td>
                {/* BAGS @50KGs per BAG */}
                <td>
                  <input type="text" value={row.Bags_Weight} onChange={(e) => handleRowChange(rowIndex, "Bags_Weight", e.target.value)}/>
                </td>
                {/* SOBRA */}
                <td>
                  <input type="text" value={row.SOBRA} onChange={(e) => handleRowChange(rowIndex, "SOBRA", e.target.value)}/>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* BUTTONS */}
      <div className="report-buttons">
        <button
          className="btn-back"
          onClick={() => navigate("/whse/management")}
        >
          Back
        </button>
        <button className="btn-submit" onClick={handleSubmit}>Submit</button>
      </div>
    </div>
  );
}
