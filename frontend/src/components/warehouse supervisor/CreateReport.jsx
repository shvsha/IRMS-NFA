import { useParams, useNavigate } from "react-router-dom";
import "../../styles/warehouse supervisor/createReport.css";

export default function CreateReport() {
  const { cereal } = useParams();
  const navigate = useNavigate();

  const rows = Array.from({ length: 15 });

  return (
    <div className="create-report-container">
      {/* HEADER */}
      <div className="report-header">
        <div>
          <strong>Report ID:</strong> R-001
        </div>

        <div className="header-input">
          <strong>Warehouse Supervisor:</strong>
          <input type="text" />
        </div>

        <div>
          <strong>Cereal Type:</strong> {cereal}
        </div>

        <div className="header-input">
          <strong>Warehouse Code:</strong>
          <input type="text" />
        </div>

        <div className="status-badge">In Progress</div>
      </div>

      {/* TABLE */}
      <div className="report-table-scroll">
        <table className="report-table">
          <thead>
            {/* FIRST ROW */}
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

            {/* SECOND ROW */}
            <tr>
              {/* DATE already handled above */}
              <th>Year</th>
              <th>Month</th>

              {/* WTS# subcolumns */}
              <th>WSR#</th>
              <th>WSI#</th>

              {/* Receipts subcolumns */}
              <th>Bags</th>
              <th>GKg</th>
              <th>NKg</th>

              {/* Issues subcolumns */}
              <th>Bags</th>
              <th>GKg</th>
              <th>NKg</th>

              {/* Balance subcolumns */}
              <th>Bags</th>
              <th>GKg</th>
              <th>NKg</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((_, rowIndex) => (
              <tr key={rowIndex}>
                {/* DATE */}
                <td>
                  <input type="text" />
                </td>
                <td>
                  <input type="text" />
                </td>
                {/* Main info */}
                <td>
                  <input type="text" />
                </td>
                <td>
                  <input type="text" />
                </td>
                <td>
                  <input type="text" />
                </td>
                <td>
                  <input type="text" />
                </td>
                <td>
                  <input type="text" />
                </td>
                <td>
                  <input type="text" />
                </td>
                <td>
                  <input type="text" />
                </td>
                <td>
                  <input type="text" />
                </td>
                <td>
                  <input type="text" />
                </td>
                <td>
                  <input type="text" />
                </td>
                <td>
                  <input type="text" />
                </td>
                <td>
                  <input type="text" />
                </td>
                <td>
                  <input type="text" />
                </td>
                {/* Receipts */}
                <td>
                  <input type="number" />
                </td>
                <td>
                  <input type="number" />
                </td>
                <td>
                  <input type="number" />
                </td>
                <td>
                  <input type="number" />
                </td>{" "}
                {/* Average Weight */}
                {/* Issues */}
                <td>
                  <input type="number" />
                </td>
                <td>
                  <input type="number" />
                </td>
                <td>
                  <input type="number" />
                </td>
                <td>
                  <input type="number" />
                </td>{" "}
                {/* Average Weight */}
                {/* Fillers */}
                <td>
                  <input type="number" />
                </td>
                {/* Balance */}
                <td>
                  <input type="number" />
                </td>
                <td>
                  <input type="number" />
                </td>
                <td>
                  <input type="number" />
                </td>
                <td>
                  <input type="number" />
                </td>{" "}
                {/* AVE. WT. per GKg BAL */}
                <td>
                  <input type="number" />
                </td>{" "}
                {/* BAGS @50KGs per BAG */}
                {/* SOBRA */}
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

        <button className="btn-save">Save</button>
        <button className="btn-submit">Submit</button>
      </div>
    </div>
  );
}
