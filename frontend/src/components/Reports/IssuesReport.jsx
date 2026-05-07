import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from '../../components/Header';
import api from "@/api/axios";

// Variety code mapping
const VARIETY_CODE = {
  palay: "WD1G50",
  rice:  "PD1350",
};

const getVarietyCode = (cerealType) => {
  if (!cerealType) return "—";
  const lower = cerealType.toLowerCase();
  return VARIETY_CODE[lower] ?? cerealType;
};

const fmt = (val, decimals = 2) =>
  val != null && val !== "" ? Number(val).toFixed(decimals) : "";

export default function WarehouseIssuesForm() {
  const navigate = useNavigate();
  const location = useLocation();

  const { reportId, stockbookId } = location.state ?? {};

  const [report,  setReport]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!reportId) {
      setError("No report ID provided.");
      setLoading(false);
      return;
    }
    api.get(`/reports/wsi-reports/upd/${reportId}/`)
      .then(res => setReport(res.data))
      .catch(err => {
        console.error(err);
        setError("Failed to load report.");
      })
      .finally(() => setLoading(false));
  }, [reportId]);

  // derived data
  const transactions = report?.transactions ?? [];
  const firstTxn     = transactions[0] ?? {};

  const accountOfficer = firstTxn.user_full_name ?? "—";
  const whseCode       = firstTxn.user_WHCode    ?? "—";

  const reportDate = report?.stockbook_date
    ? new Date(report.stockbook_date).toLocaleDateString("en-US", {
        month: "long", day: "2-digit", year: "numeric",
      }).toUpperCase()
    : "—";

  const cerealVariety = getVarietyCode(report?.stockbook_cereal);

  const signatories = [
    { label: "Certified Correct:", name: accountOfficer,               role: "Warehouse Supervisor" },
    { label: "Verified Correct:",  name: report?.asst_bm_name  ?? "—", role: "Asst. Branch Manager" },
    { label: "Verified Correct:",  name: report?.accountant_name ?? "—", role: "Accountant II"       },
    { label: "Noted by:",          name: report?.branch_m_name  ?? "—", role: "Branch Manager"       },
  ];

  // render states
  if (loading) return (
    <div className="flex items-center justify-center h-64 text-[#2D317F]">
      Loading report…
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-64 text-red-500">
      {error}
    </div>
  );

  const DISPLAY_ROWS = Math.max(transactions.length, 10);
  const emptyCount   = DISPLAY_ROWS - transactions.length;

  return (
    <>
      <Header
        pageTitle="Evaluation"
        notifTo="/admin/notif"
        unreadCount={5}
        userName="Raph Nigos"
      />

      <div className="overflow-auto !min-h-[650px] mx-4 my-4 p-3 xl:p-5 box-border flex justify-center items-start shadow-2xl border border-black/10">
        <div className="text-[#111] bg-white w-full box-border overflow-x-auto relative">

          {/* Close Button */}
          <button
            onClick={() => navigate(-1)}
            className="absolute top-2 right-2 bg-white border border-[#e00] text-[#e00] font-bold w-[22px] h-[22px] cursor-pointer text-[14px] leading-none flex items-center justify-center"
          >
            ✕
          </button>

          {/* Title */}
          <div className="text-center font-bold uppercase mb-0.5 text-[clamp(11px,1.5vw,14px)]">
            National Food Authority
          </div>
          <div className="text-center font-bold mb-1 text-[clamp(10px,1.3vw,13px)]">
            Statement of Daily Warehouse Issue
          </div>
          <div className="text-center mb-[clamp(8px,1.5vw,14px)] text-[clamp(10px,1.2vw,12px)]">
            Date:{" "}
            <span className="font-bold underline pb-px">{reportDate}</span>
          </div>

          {/* Meta Info */}
          <div className="flex justify-between flex-wrap gap-2 mb-[clamp(8px,1.5vw,14px)]">
            <div className="text-[clamp(9px,1.1vw,12px)] px-10">
              <p className="my-0.5">Region : 1</p>
              <p className="my-0.5">
                Province : <span className="font-bold underline">La Union</span>
              </p>
              <p className="my-0.5">
                Accountable Officer :{" "}
                <span className="font-bold underline">{accountOfficer}</span>
              </p>
            </div>
            <div className="text-[clamp(9px,1.1vw,12px)] px-10 text-left">
              <p className="my-0.5">
                Warehouse Name : <span className="font-bold underline">San Juan GID 2A</span>
              </p>
              <p className="my-0.5">
                Warehouse Address : <span className="font-bold underline">San Juan, La Union</span>
              </p>
              <p className="my-0.5">
                Warehouse Code : <span className="font-bold underline">{whseCode}</span>
              </p>
            </div>
          </div>

          {/* Table */}
          <div className="w-full overflow-x-auto">
            <table
              className="w-full border-collapse table-fixed mb-[clamp(10px,2vw,18px)]"
              style={{ fontSize: "clamp(8px, 1vw, 11px)" }}
            >
              <colgroup>
                <col style={{ width: "6.5%" }} />
                <col style={{ width: "6%" }} />
                <col style={{ width: "6%" }} />
                <col style={{ width: "6%" }} />
                <col style={{ width: "8%" }} />
                <col style={{ width: "15%" }} />
                <col style={{ width: "7%" }} />
                <col style={{ width: "4%" }} />
                <col style={{ width: "5%" }} />
                <col style={{ width: "4%" }} />
                <col style={{ width: "7%" }} />
                <col style={{ width: "8%" }} />
                <col style={{ width: "8%" }} />
                <col style={{ width: "8%" }} />
              </colgroup>
              <thead>
                <tr>
                  {[
                    { label: "Cereal Type / Variety", rowSpan: 2 },
                    { label: "WSI#",                  rowSpan: 2 },
                    { label: "WTS#",                  rowSpan: 2 },
                    { label: "AI#",                   rowSpan: 2 },
                    { label: "Nature of Transaction",  rowSpan: 2 },
                    { label: "Issued to",              colSpan: 2 },
                    { label: "Age",                    rowSpan: 2 },
                    { label: "Cond.",                  rowSpan: 2 },
                    { label: "MC",                     rowSpan: 2 },
                    { label: "Truck No.",              rowSpan: 2 },
                    { label: "Quantity",               colSpan: 3 },
                  ].map((th, i) => (
                    <th
                      key={i}
                      rowSpan={th.rowSpan}
                      colSpan={th.colSpan}
                      className="border border-[#333] text-center bg-[#ADCEFF] font-bold leading-[1.3] break-words"
                      style={{ padding: "clamp(2px,0.4vw,5px) clamp(2px,0.3vw,4px)", fontSize: "clamp(7px,0.9vw,10px)" }}
                    >
                      {th.label}
                    </th>
                  ))}
                </tr>
                <tr>
                  {["Name", "OR/BL/WSR No.", "Bags", "Gross Kg.", "Net Kg."].map((label, i) => (
                    <th
                      key={i}
                      className="border border-[#333] text-center bg-[#ADCEFF] font-bold leading-[1.3] break-words overflow-hidden"
                      style={{ padding: "clamp(2px,0.4vw,5px) clamp(2px,0.3vw,4px)", fontSize: "clamp(7px,0.9vw,10px)" }}
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Data rows */}
                {transactions.map((txn, i) => {
                  // Determine if this is a WTS transaction or a pure WSI
                  const isWTS = txn.type === "WTS";

                  return (
                    <tr key={txn.transaction_id ?? i}>
                      {/* Cereal Type / Variety */}
                      <td className="border border-[#333] text-center break-words"
                          style={{ padding: "clamp(2px,0.4vw,5px) clamp(2px,0.3vw,4px)", height: "clamp(18px,2.5vw,28px)" }}>
                        {cerealVariety}
                      </td>
                      {/* WSI# — only if type is WSI */}
                      <td className="border border-[#333] text-center"
                          style={{ padding: "clamp(2px,0.4vw,5px) clamp(2px,0.3vw,4px)", height: "clamp(18px,2.5vw,28px)" }}>
                        {!isWTS ? (txn.WSI_no || "") : ""}
                      </td>
                      {/* WTS# — only if type is WTS */}
                      <td className="border border-[#333] text-center"
                          style={{ padding: "clamp(2px,0.4vw,5px) clamp(2px,0.3vw,4px)", height: "clamp(18px,2.5vw,28px)" }}>
                        {isWTS ? (txn.WTS_no || "") : ""}
                      </td>
                      {/* AI# */}
                      <td className="border border-[#333] text-center"
                          style={{ padding: "clamp(2px,0.4vw,5px) clamp(2px,0.3vw,4px)", height: "clamp(18px,2.5vw,28px)" }}>
                        {txn.AI_Number || ""}
                      </td>
                      {/* Nature of Transaction */}
                      <td className="border border-[#333] text-center break-words"
                          style={{ padding: "clamp(2px,0.4vw,5px) clamp(2px,0.3vw,4px)", height: "clamp(18px,2.5vw,28px)" }}>
                        {txn.Transaction_ref || ""}
                      </td>
                      {/* Issued to – Name (Particulars) */}
                      <td className="border border-[#333] text-center break-words"
                          style={{ padding: "clamp(2px,0.4vw,5px) clamp(2px,0.3vw,4px)", height: "clamp(18px,2.5vw,28px)" }}>
                        {txn.Particulars || ""}
                      </td>
                      {/* OR/BL/WSR No. — blank as instructed */}
                      <td className="border border-[#333] text-center"
                          style={{ padding: "clamp(2px,0.4vw,5px) clamp(2px,0.3vw,4px)", height: "clamp(18px,2.5vw,28px)" }} />
                      {/* Age */}
                      <td className="border border-[#333] text-center"
                          style={{ padding: "clamp(2px,0.4vw,5px) clamp(2px,0.3vw,4px)", height: "clamp(18px,2.5vw,28px)" }}>
                        {fmt(txn.Age)}
                      </td>
                      {/* Cond. */}
                      <td className="border border-[#333] text-center"
                          style={{ padding: "clamp(2px,0.4vw,5px) clamp(2px,0.3vw,4px)", height: "clamp(18px,2.5vw,28px)" }}>
                        {txn.Cond_I || ""}
                      </td>
                      {/* MC */}
                      <td className="border border-[#333] text-center"
                          style={{ padding: "clamp(2px,0.4vw,5px) clamp(2px,0.3vw,4px)", height: "clamp(18px,2.5vw,28px)" }}>
                        {fmt(txn.Moisture_Content)}
                      </td>
                      {/* Truck No. */}
                      <td className="border border-[#333] text-center"
                          style={{ padding: "clamp(2px,0.4vw,5px) clamp(2px,0.3vw,4px)", height: "clamp(18px,2.5vw,28px)" }}>
                        {txn.Plate_Number || ""}
                      </td>
                      {/* Bags */}
                      <td className="border border-[#333] text-center"
                          style={{ padding: "clamp(2px,0.4vw,5px) clamp(2px,0.3vw,4px)", height: "clamp(18px,2.5vw,28px)" }}>
                        {fmt(txn.I_Bags)}
                      </td>
                      {/* Gross Kg. */}
                      <td className="border border-[#333] text-center"
                          style={{ padding: "clamp(2px,0.4vw,5px) clamp(2px,0.3vw,4px)", height: "clamp(18px,2.5vw,28px)" }}>
                        {fmt(txn.I_GKG)}
                      </td>
                      {/* Net Kg. */}
                      <td className="border border-[#333] text-center"
                          style={{ padding: "clamp(2px,0.4vw,5px) clamp(2px,0.3vw,4px)", height: "clamp(18px,2.5vw,28px)" }}>
                        {fmt(txn.I_NKG)}
                      </td>
                    </tr>
                  );
                })}

                {/* Empty filler rows */}
                {Array(emptyCount).fill(null).map((_, i) => (
                  <tr key={`empty-${i}`}>
                    {Array(14).fill(null).map((_, j) => (
                      <td
                        key={j}
                        className="border border-[#333] text-center"
                        style={{
                          padding: "clamp(2px,0.4vw,5px) clamp(2px,0.3vw,4px)",
                          height: "clamp(18px,2.5vw,28px)",
                        }}
                      />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Signature Block */}
          <div
            className="flex justify-between flex-wrap mt-[clamp(12px,2vw,24px)]"
            style={{ gap: "clamp(8px,2vw,16px)" }}
          >
            {signatories.map((sig, i) => (
              <div key={i} className="text-center flex-1 min-w-[120px]">
                <div className="text-[#555] mb-1" style={{ fontSize: "clamp(8px,1vw,11px)" }}>
                  {sig.label}
                </div>
                <div className="font-bold pt-[3px] underline" style={{ fontSize: "clamp(9px,1.1vw,12px)" }}>
                  {sig.name}
                </div>
                <div className="text-[#444]" style={{ fontSize: "clamp(8px,1vw,11px)" }}>
                  {sig.role}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </>
  );
}