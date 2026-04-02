// react
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useContext, useState } from "react";

// react icons
import { CiExport, CiImport } from "react-icons/ci";

export default function CreateReport() {
  const { cereal } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const stockBook = location.state?.stockBook ?? null;
  const mode = location.state?.mode ?? "create";

  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";
  const isCreateMode = mode === "create";

  const reportId = stockBook?.StockBook_ID ?? "—";
  const cerealType = stockBook?.CerealType ?? cereal ?? "—";
  const status = stockBook?.Status ?? "In Progress";

  const STATUS_CONFIG = {
    "In Progress": {
      label: "In Progress",
      className: "inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[13px] font-semibold whitespace-nowrap bg-[#F0E48B] text-[#856404]",
    },
    "Under Review": {
      label: "Under Review",
      className: "inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[13px] font-semibold whitespace-nowrap bg-[#ADCEFF] text-blue-800",
    },
    Completed: {
      label: "Completed",
      className: "inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[13px] font-semibold whitespace-nowrap bg-[#8BF093] text-green-800",
    },
  };
  const badgeConfig = STATUS_CONFIG[status] ?? STATUS_CONFIG["In Progress"];

  const EMPTY_ROW = {
    year: "", month: "", Particulars: "", Plate_Number: "", WTS: "",
    WSR: "", WSI: "", Batch_No: "", Age: "", AI_Number: "", OR_Number: "",
    Moisture_Content: "", Classifier: "", Transaction: "", Pile_No: "",
    R_Bags: "", R_GKG: "", R_NKG: "", R_Cond: "", I_Bags: "", I_GKG: "",
    I_NKG: "", I_Cond: "", Fillers: "", B_Bags: "", B_GKG: "", B_NKG: "",
  };

  const [rows, setRows] = useState(
    Array.from({ length: 15 }, () => ({ ...EMPTY_ROW }))
  );

  const handleRowChange = (rowIndex, field, value) => {
    if (isViewMode) return;
    setRows((prev) => {
      const updated = [...prev];
      updated[rowIndex] = { ...updated[rowIndex], [field]: value };
      return updated;
    });
  };

  const handleSubmitCreate = () => {
    const payload = {
      CerealType: cerealType,
      Status: "Under Review",
      rows: rows.filter((row) => Object.values(row).some((v) => v !== "")),
    };
    console.log("Stock Book Payload (ready for API):", payload);
    navigate("/whse/management");
  };

  const handleSubmitEdit = () => {
    const payload = {
      StockBook_ID: reportId,
      CerealType: cerealType,
      Status: status,
      rows: rows.filter((row) => Object.values(row).some((v) => v !== "")),
    };
    console.log("Edit Payload (ready for API):", payload);
    navigate("/whse/management");
  };

  const CellInput = ({ value, onChange }) => (
    <input
      type="text"
      value={value}
      onChange={onChange}
      className="w-full h-full border border-[#cfd6e0] px-1 py-0.5 text-[12px] outline-none bg-white text-[#2d317f] focus:bg-[#f3f7ff] focus:border-[#2d317f]"
    />
  );

  return (
    <div className="flex flex-col min-h-full p-5 box-border">

      {/* header */}
      <div className="flex-shrink-0 flex gap-[30px] items-center bg-white px-5 py-3 text-sm text-[#2d317f] border border-[#cfd6e0]">
        <div>
          <strong>Report ID:</strong> {reportId}
        </div>
        <div className="flex items-center gap-2.5">
          <strong>Warehouse Supervisor:</strong>
        </div>
        <div>
          <strong>Cereal Type:</strong> {cerealType}
        </div>
        <div className="flex items-center gap-2.5">
          <strong>Warehouse Code:</strong>
        </div>
        <div className="flex items-center gap-2">
          <strong>Status:</strong>
          <div className={badgeConfig.className}>{badgeConfig.label}</div>
        </div>
        <div className="flex gap-5 ml-auto">
          <button className="cursor-pointer transition-opacity duration-200 hover:opacity-70 border border-[#3e7a43] bg-transparent rounded-lg px-2 py-1">
            <CiImport size={25} color="#3E7A43" />
          </button>
          <button className="cursor-pointer transition-opacity duration-200 hover:opacity-70 bg-[#1d8104] text-white rounded-lg px-3 py-1 flex items-center gap-1">
            <CiExport size={25} color="white" />
            Export
          </button>
        </div>
      </div>

      {/* table */}
      <div className="mt-[15px] overflow-auto border border-[#8fa3c1]">
        <table className="border-collapse min-w-[2200px] w-full">
          <thead className="sticky top-0 z-10">
            <tr>
              {[
                { label: "Date", colSpan: 2 },
                { label: "Particulars", rowSpan: 2 },
                { label: "Plate #", rowSpan: 2 },
                { label: "WTS #", rowSpan: 2 },
                { label: "WSR #", rowSpan: 2 },
                { label: "WSI #", rowSpan: 2 },
                { label: "Batch No.", rowSpan: 2 },
                { label: "Age", rowSpan: 2 },
                { label: "AI#", rowSpan: 2 },
                { label: "OR#", rowSpan: 2 },
                { label: "Moisture Content", rowSpan: 2 },
                { label: "Classifier", rowSpan: 2 },
                { label: "Transaction", rowSpan: 2 },
                { label: "Pile No.", rowSpan: 2 },
                { label: "Receipts", colSpan: 3 },
                { label: "Cond", rowSpan: 2 },
                { label: "Issues", colSpan: 3 },
                { label: "Cond", rowSpan: 2 },
                { label: "Fillers", rowSpan: 2 },
                { label: "Balance", colSpan: 3 },
              ].map((th, i) => (
                <th
                  key={i}
                  colSpan={th.colSpan}
                  rowSpan={th.rowSpan}
                  className="bg-[#d7e1f2] border border-[#8fa3c1] px-1.5 py-1 text-[12px] text-center text-[#2d317f]"
                >
                  {th.label}
                </th>
              ))}
            </tr>
            <tr>
              {["Year", "Month", "Bags", "GKg", "NKg", "Bags", "GKg", "NKg", "Bags", "GKg", "NKg"].map(
                (label, i) => (
                  <th
                    key={i}
                    className="bg-[#d7e1f2] border border-[#8fa3c1] px-1.5 py-1 text-[12px] text-center text-[#2d317f]"
                  >
                    {label}
                  </th>
                )
              )}
            </tr>
          </thead>

          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="text-[#2d317f] bg-white">
                {[
                  ["year", row.year],
                  ["month", row.month],
                  ["Particulars", row.Particulars],
                  ["Plate_Number", row.Plate_Number],
                  ["WTS", row.WTS],
                  ["WSR", row.WSR],
                  ["WSI", row.WSI],
                  ["Batch_No", row.Batch_No],
                  ["Age", row.Age],
                  ["AI_Number", row.AI_Number],
                  ["OR_Number", row.OR_Number],
                  ["Moisture_Content", row.Moisture_Content],
                  ["Classifier", row.Classifier],
                  ["Transaction", row.Transaction],
                  ["Pile_No", row.Pile_No],
                  ["R_Bags", row.R_Bags],
                  ["R_GKG", row.R_GKG],
                  ["R_NKG", row.R_NKG],
                  ["R_Cond", row.R_Cond],
                  ["I_Bags", row.I_Bags],
                  ["I_GKG", row.I_GKG],
                  ["I_NKG", row.I_NKG],
                  ["I_Cond", row.I_Cond],
                  ["Fillers", row.Fillers],
                  ["B_Bags", row.B_Bags],
                  ["B_GKG", row.B_GKG],
                  ["B_NKG", row.B_NKG],
                ].map(([field, value]) => (
                  <td key={field} className="border border-[#8fa3c1] h-8">
                    <CellInput
                      value={value}
                      onChange={(e) => handleRowChange(rowIndex, field, e.target.value)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* button */}
      <div className="flex-shrink-0 mt-[15px] flex justify-end gap-2.5">
        {isCreateMode && (
          <>
            <button
              className="px-[18px] py-2 border-none bg-[#d9d9d9] rounded-md cursor-pointer"
              onClick={() => navigate("/whse/management")}
            >
              Back
            </button>
            <button
              className="px-[18px] py-2 border-none bg-[#2d317f] text-white rounded-md cursor-pointer"
              onClick={handleSubmitCreate}
            >
              Submit
            </button>
          </>
        )}
        {isEditMode && (
          <>
            <button
              className="px-[18px] py-2 border-none bg-[#d9d9d9] rounded-md cursor-pointer"
              onClick={() => navigate("/whse/management")}
            >
              Cancel
            </button>
            <button
              className="px-[18px] py-2 border-none bg-[#2d317f] text-white rounded-md cursor-pointer"
              onClick={handleSubmitEdit}
            >
              Submit
            </button>
          </>
        )}
        {isViewMode && (
          <button
            className="px-[18px] py-2 border-none bg-[#d9d9d9] rounded-md cursor-pointer"
            onClick={() => navigate("/whse/management")}
          >
            Back
          </button>
        )}
      </div>
    </div>
  );
}