// react
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from '../../components/Header'

// react icons
import { CiExport, CiImport } from "react-icons/ci";
import { IoArrowBack } from "react-icons/io5";

// api
import api from "@/api/axios";

// for notif
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { getNotifRoute } from "@/utils/getNotifRoute";
import { useUnreadCount } from "@/hooks/useUnreadCount";

// excel
import { exportStockbookToExcel } from '@/utils/exportToExcel'

export default function ViewReport() {
  // for notif
  const user       = useCurrentUser()
  const notifRoute = getNotifRoute(user)
  const userName   = user ? `${user.fname} ${user.lname}` : 'User'
  const unreadCount = useUnreadCount()
  
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const stockBook  = location.state?.stockBook ?? null;
  const reportId   = stockBook?.report_id ?? id ?? "—";
  const cerealType = stockBook?.CerealType ?? "—";
  const status     = stockBook?.Status ?? "In Progress";

  const whseUser = JSON.parse(localStorage.getItem("user") || "{}");

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

  // us 
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const EMPTY_ROW = {
    year: "", month: "", Particulars: "", Plate_Number: "", WTS: "",
    WSR: "", WSI: "", Batch_No: "", Age: "", AI_Number: "", OR_Number: "",
    Moisture_Content: "", Classifier: "", Transaction: "", Pile_No: "",
    R_Bags: "", R_GKG: "", R_NKG: "", R_Cond: "", I_Bags: "", I_GKG: "",
    I_NKG: "", I_Cond: "", Fillers: "", B_Bags: "", B_GKG: "", B_NKG: "",
  };

  const FIELDS = [
    "year", "month", "Particulars", "Plate_Number", "WTS", "WSR", "WSI",
    "Batch_No", "Age", "AI_Number", "OR_Number", "Moisture_Content",
    "Classifier", "Transaction", "Pile_No",
    "R_Bags", "R_GKG", "R_NKG", "R_Cond",
    "I_Bags", "I_GKG", "I_NKG", "I_Cond",
    "Fillers", "B_Bags", "B_GKG", "B_NKG",
  ];

  // fetch transactions 
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/reports/transactions/?stockbook=${reportId}`);

        const mapped = res.data.map((t) => ({
          year:             stockBook?.Date?.split("-")[0]  ?? "",
          month:            stockBook?.Date?.split("-")[1]  ?? "",
          Particulars:      t.Particulars                   ?? "",
          Plate_Number:     t.Plate_Number                  ?? "",
          WTS:              t.WTS_no                        ?? "",
          WSR:              t.WSR_no                        ?? "",
          WSI:              t.WSI_no                        ?? "",
          Batch_No:         t.Batch_No                      ?? "",
          Age:              t.Age                           ?? "",
          AI_Number:        t.AI_Number                     ?? "",
          OR_Number:        t.OR_Number                     ?? "",
          Moisture_Content: t.Moisture_Content              ?? "",
          Classifier:       t.Classifier                    ?? "",
          Transaction:      t.Transaction_ref               ?? "",
          Pile_No:          t.Pile_No                       ?? "",
          R_Bags:           t.R_Bags                        ?? "",
          R_GKG:            t.R_GKG                         ?? "",
          R_NKG:            t.R_NKG                         ?? "",
          R_Cond:           t.Cond_R                        ?? "",
          I_Bags:           t.I_Bags                        ?? "",
          I_GKG:            t.I_GKG                         ?? "",
          I_NKG:            t.I_NKG                         ?? "",
          I_Cond:           t.Cond_I                        ?? "",
          Fillers:          t.Fillers                       ?? "",
          B_Bags:           stockBook?.B_Bags               ?? "",
          B_GKG:            stockBook?.B_GKG                ?? "",
          B_NKG:            stockBook?.B_NKG                ?? "",
        }));

        // Pad to at least 15 rows
        const padded = [...mapped];
        while (padded.length < 15) padded.push({ ...EMPTY_ROW });
        setRows(padded);
      } catch (err) {
        setError("Failed to load transactions.");
      } finally {
        setLoading(false);
      }
    };

    if (reportId !== "—") fetchTransactions();
  }, [reportId]);

  // read-only cell
  const Cell = ({ value }) => (
    <div className="w-full h-full px-1 py-0.5 text-[12px] text-[#2d317f] bg-white">
      {value !== "" && value !== null && value !== undefined ? String(value) : ""}
    </div>
  );

  // export
  const handleExport = async () => {
    await api.post('/audit/log-export/', { type: 'StockBook', id: reportId })
    exportStockbookToExcel(rows, reportId)
  }

  return (
    <>
      <Header
        pageTitle="Stock Book"
        unreadCount={unreadCount}
        notifTo={notifRoute}
        userName={userName}
      />

      <div className="mx-4 my-4 pb-50 flex flex-col shadow-[0_6px_4px_-4px_rgba(0,0,0,0.2)] !min-h-[653px]">

        {/* header */}
        <div className="flex-shrink-0 flex gap-[30px] items-center bg-white px-5 py-3 text-sm text-[#2d317f] border border-[#cfd6e0]">
          <button
            onClick={() => navigate(-1)}
            className="cursor-pointer transition-opacity duration-200 hover:opacity-70 flex items-center gap-1 text-[#2d317f]"
          >
            <IoArrowBack size={18} />
          </button>
          <div><strong>Report ID:</strong> R-{String(reportId).padStart(3, "0")}</div>
          <div><strong>Warehouse Supervisor:</strong> {whseUser?.fname} {whseUser?.lname}</div>
          <div><strong>Cereal Type:</strong> {cerealType}</div>
          <div><strong>Warehouse Code:</strong> {whseUser?.WHCode ?? "—"}</div>
          <div className="flex items-center gap-2">
            <strong>Status:</strong>
            <div className={badgeConfig.className}>{badgeConfig.label}</div>
          </div>
          <div className="flex gap-5 ml-auto">
            <button 
              className="shadow-[0_6px_4px_-4px_rgba(0,0,0,0.2)] cursor-pointer transition-opacity duration-200 hover:opacity-70 bg-[#1D8104] text-white rounded-lg px-3 py-1 flex items-center gap-2"
              
              onClick={handleExport}
              >
              <CiExport size={21} color="white" /> Export
            </button>
          </div>
        </div>

        {/* loading / error states */}
        {loading && (
          <div className="flex items-center justify-center flex-1 mt-20 text-[#2d317f]">
            Loading transactions...
          </div>
        )}
        {error && (
          <div className="flex items-center justify-center flex-1 mt-20 text-red-500">
            {error}
          </div>
        )}

        {/* table */}
        {!loading && !error && (
          <>
            <div className="mt-[15px] overflow-x-auto w-full border border-[#8fa3c1]">
              <table className="border-collapse min-w-[2200px] w-full">
                <thead className="sticky top-0 z-10">
                  <tr>
                    {[
                      { label: "Date",             colSpan: 2 },
                      { label: "Particulars",      rowSpan: 2 },
                      { label: "Plate #",          rowSpan: 2 },
                      { label: "WTS #",            rowSpan: 2 },
                      { label: "WSR #",            rowSpan: 2 },
                      { label: "WSI #",            rowSpan: 2 },
                      { label: "Batch No.",        rowSpan: 2 },
                      { label: "Age",              rowSpan: 2 },
                      { label: "AI#",              rowSpan: 2 },
                      { label: "OR#",              rowSpan: 2 },
                      { label: "Moisture Content", rowSpan: 2 },
                      { label: "Classifier",       rowSpan: 2 },
                      { label: "Transaction",      rowSpan: 2 },
                      { label: "Pile No.",         rowSpan: 2 },
                      { label: "Receipts",         colSpan: 3 },
                      { label: "Cond",             rowSpan: 2 },
                      { label: "Issues",           colSpan: 3 },
                      { label: "Cond",             rowSpan: 2 },
                      { label: "Fillers",          rowSpan: 2 },
                      { label: "Balance",          colSpan: 3 },
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
                      {FIELDS.map((field) => (
                        <td key={field} className="border border-[#8fa3c1] h-8">
                          <Cell value={row[field]} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

      </div>
    </>
  );
}