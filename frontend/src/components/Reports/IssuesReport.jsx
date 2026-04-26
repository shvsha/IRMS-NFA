import { useNavigate } from "react-router-dom";

import Header from '../../components/Header'

const EMPTY_ROWS = Array(10).fill(null);

const SIGNATURES = [
  { label: "Certified Correct:", name: "LOUIE A. VALENZUELA", role: "Warehouse Supervisor" },
  { label: "Verified Correct:", name: "MARCELINA A. DOMINGO", role: "Asst. Branch Manager" },
  { label: "Verified Correct:", name: "LOVELYN M. PICARDAL", role: "Accountant II" },
  { label: "Noted by:", name: "CELERINA T. CAPONES", role: "Branch Manager" },
];

export default function WarehouseIssuesForm() {
  const navigate = useNavigate();

  return (
    <>
      <Header
        pageTitle="Evaluation"
        notifTo="/admin/notif"
        unreadCount={5}
        userName="Raph Nigos"
      />

      <div
        className="overflow-auto !min-h-[650px] mx-4 my-4 p-3 xl:p-5 box-border flex justify-center items-start shadow-2xl border border-black/10"
      >
        <div className="text-[#111] bg-white w-full box-border overflow-x-auto relative ">

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

          {/* Subtitle */}
          <div className="text-center font-bold mb-1 text-[clamp(10px,1.3vw,13px)]">
            Statement of Daily Warehouse Issue
          </div>

          {/* Date */}
          <div className="text-center mb-[clamp(8px,1.5vw,14px)] text-[clamp(10px,1.2vw,12px)]">
            Date:{" "}
            <span className="font-bold underline pb-px">
              FEBRUARY 03, 2026
            </span>
          </div>

          {/* Meta Info */}
          <div className="flex justify-between flex-wrap gap-2 mb-[clamp(8px,1.5vw,14px)]">
            <div className="text-[clamp(9px,1.1vw,12px)] px-10">
              <p className="my-0.5">Region : 1</p>
              <p className="my-0.5">
                Province : <span className="font-bold underline">La Union</span>
              </p>
              <p className="my-0.5">Accountable Officer : <span className="font-bold underline">Engr. Louie A. Valenzuela</span></p>
            </div>
            <div className="text-[clamp(9px,1.1vw,12px)] px-10 text-left">
              <p className="my-0.5">
                Warehouse Name : <span className="font-bold underline">San Juan GID 2A</span>
              </p>
              <p className="my-0.5">Warehouse Address : <span className="font-bold underline">San Juan, La Union</span></p>
              <p className="my-0.5">
                Warehouse Code : <span className="font-bold underline">010502A</span>
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
                <col style={{ width: "6.5%" }} /> {/* Cereal Type */}
                <col style={{ width: "6%" }} /> {/* WSI# */}
                <col style={{ width: "6%" }} /> {/* WTS# */}
                <col style={{ width: "6%" }} /> {/* AI# */}
                <col style={{ width: "8%" }} /> {/* Nature of Transaction */}
                <col style={{ width: "15%" }} /> {/* Name (Issued to col 1) */}
                <col style={{ width: "7%" }} /> {/* OR/BL/WSR No (Issued to col 2) */}
                <col style={{ width: "4%" }} /> {/* Age */}
                <col style={{ width: "5%" }} /> {/* Cond. */}
                <col style={{ width: "4%" }} /> {/* MC */}
                <col style={{ width: "7%" }} /> {/* Truck No. */}
                <col style={{ width: "8%" }} /> {/* Bags (Quantity col 1) */}
                <col style={{ width: "8%" }} /> {/* Gross Kg. (Quantity col 2) */}
                <col style={{ width: "8%" }} /> {/* Net Kg. (Quantity col 3) */}
              </colgroup>
              <thead>
                <tr>
                  {[
                    { label: "Cereal Type / Variety", rowSpan: 2 },
                    { label: "WSI#", rowSpan: 2 },
                    { label: "WTS#", rowSpan: 2 },
                    { label: "AI#", rowSpan: 2 },
                    { label: "Nature of Transaction", rowSpan: 2 },
                    { label: "Issued to", colSpan: 2 },
                    { label: "Age", rowSpan: 2 },
                    { label: "Cond.", rowSpan: 2 },
                    { label: "MC", rowSpan: 2 },
                    { label: "Truck No.", rowSpan: 2 },
                    { label: "Quantity", colSpan: 3 },
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
                      {i === 4 ? <div className="truncate">{label}</div> : label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {EMPTY_ROWS.map((_, i) => (
                  <tr key={i}>
                    {Array(14).fill(null).map((_, j) => (
                      <td
                        key={j}
                        className="border border-[#333] text-center break-words overflow-hidden"
                        style={{
                          padding: "clamp(2px,0.4vw,5px) clamp(2px,0.3vw,4px)",
                          height: "clamp(18px,2.5vw,28px)",
                        }}
                      >
                        {j === 13 ? <div className="truncate"></div> : null}
                      </td>
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
            {SIGNATURES.map((sig) => (
              <div key={sig.name} className="text-center flex-1 min-w-[120px]">
                <div className="text-[#555] mb-1" style={{ fontSize: "clamp(8px,1vw,11px)" }}>
                  {sig.label}
                </div>
                <div
                  className="font-bold pt-[3px] underline"
                  style={{ fontSize: "clamp(9px,1.1vw,12px)" }}
                >
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