import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from '../../components/Header'

const initialRows = Array(8).fill(null).map((_, i) => ({
  id: i,
  cerealType: "",
  condition: "",
  beginBags: "",
  beginNetKg: "",
  receiptBags: "",
  receiptNetKg: "",
  issueBags: "",
  issueNetKg: "",
}));

const SIGNATURES = [
  { label: "Certified Correct:", name: "LOUIE A. VALENZUELA", title: "Warehouse Supervisor" },
  { label: "Verified Correct:", name: "MARCELINA A. DOMINGO", title: "Asst. Branch Manager" },
  { label: "Verified Correct:", name: "LOVELYN M. PICARDAL", title: "Accountant II" },
  { label: "Noted by:", name: "CELERINA T. CAPONES", title: "Branch Manager" },
];

export default function NFAWarehouseReceipt() {
  const navigate = useNavigate();
  const [rows, setRows] = useState(initialRows);
  const [header, setHeader] = useState({
    region: "1",
    province: "La Union",
    accountableOfficer: "Engr. Louie A. Valenzuela",
    date: "2026-02-03",
    warehouseName: "San Juan GID 2A",
    warehouseAddress: "San Juan, La Union",
    warehouseCode: "010502A",
  });

  const updateRow = (id, field, value) =>
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)));

  const updateHeader = (field, value) =>
    setHeader((prev) => ({ ...prev, [field]: value }));

  const computeEnding = (row) => {
    const bB = parseFloat(row.beginBags) || 0;
    const rB = parseFloat(row.receiptBags) || 0;
    const iB = parseFloat(row.issueBags) || 0;
    const bK = parseFloat(row.beginNetKg) || 0;
    const rK = parseFloat(row.receiptNetKg) || 0;
    const iK = parseFloat(row.issueNetKg) || 0;
    return {
      endBags: bB + rB - iB || "",
      endNetKg: bK + rK - iK ? (bK + rK - iK).toFixed(2) : "",
    };
  };

  const totals = rows.reduce(
    (acc, row) => {
      const { endBags, endNetKg } = computeEnding(row);
      return {
        beginBags:    acc.beginBags    + (parseFloat(row.beginBags)    || 0),
        beginNetKg:   acc.beginNetKg   + (parseFloat(row.beginNetKg)   || 0),
        receiptBags:  acc.receiptBags  + (parseFloat(row.receiptBags)  || 0),
        receiptNetKg: acc.receiptNetKg + (parseFloat(row.receiptNetKg) || 0),
        issueBags:    acc.issueBags    + (parseFloat(row.issueBags)    || 0),
        issueNetKg:   acc.issueNetKg   + (parseFloat(row.issueNetKg)   || 0),
        endBags:      acc.endBags      + (parseFloat(endBags)          || 0),
        endNetKg:     acc.endNetKg     + (parseFloat(endNetKg)         || 0),
      };
    },
    { beginBags: 0, beginNetKg: 0, receiptBags: 0, receiptNetKg: 0,
      issueBags: 0, issueNetKg: 0, endBags: 0, endNetKg: 0 }
  );

  const formattedDate = new Date(header.date + "T00:00:00")
    .toLocaleDateString("en-US", { month: "long", day: "2-digit", year: "numeric" })
    .toUpperCase();

  const thClass = "border border-black text-center bg-[#ADCEFF] font-bold text-[10.5px] py-1 px-[5px]";
  const tdClass = "border border-black text-center text-[11px] bg-white px-[5px]";
  const metaInputBase = "border-none outline-none font-[inherit] text-[12px] bg-transparent inline";

  return (
    <>
      <Header
        pageTitle="Summary"
        notifTo="/admin/notif"
        unreadCount={5}
        userName="Raph Nigos"
      />
    
      <div
          className="shadow-2xl border border-black/10 !min-h-[650px] mx-4 my-4 overflow-auto p-3 xl:p-5"
          style={{ maxHeight: "calc(100vh - 90px - 60px)" }}
        >
        <div className="relative bg-white w-full box-border "
          style={{ minWidth: 0 }}
        >

          {/* Close Button */}
          <button
            onClick={() => navigate(-1)}
            className="absolute top-2 right-2 bg-white border border-red-600 text-red-600 font-bold w-[22px] h-[22px] cursor-pointer text-[14px] leading-none flex items-center justify-center z-10"
          >
            ✕
          </button>

          {/* Title Block */}
          <div className="text-center mb-1.5 text-black">
            <div className="font-bold text-[14px] tracking-wide uppercase">
              National Food Authority
            </div>
            <div className="font-bold text-[13px] mt-0.5">
              Statement of Daily Warehouse Receipt, Issues, and Balances
            </div>
            <div className="text-[12px] mt-[3px]">
              Date:{" "}
              <span className="font-bold underline text-[12px] cursor-pointer">
                {formattedDate}
              </span>
            </div>
          </div>

          {/* Meta Info */}
          <div className="flex justify-between flex-wrap gap-2 my-2.5 text-[12px] text-black">
            <div className="leading-[1.8] px-10">
              <div>
                Region<span className="ml-[14px]">: </span>
                <input
                  className={metaInputBase}
                  style={{ width: 120 }}
                  value={header.region}
                  onChange={(e) => updateHeader("region", e.target.value)}
                />
              </div>
              <div>
                Province<span className="ml-2">: </span>
                <input
                  className={`${metaInputBase} underline`}
                  style={{ width: 160, fontWeight: 'bold'}}
                  value={header.province}
                  onChange={(e) => updateHeader("province", e.target.value)}
                />
              </div>
              <div>
                Accountable Officer<span className="ml-2">: </span>
                <input
                  className={`${metaInputBase} underline`}
                  style={{ width: 160, fontWeight: 'bold'}}
                  value={header.accountableOfficer}
                  onChange={(e) => updateHeader("province", e.target.value)}
                />
              </div>
            </div>
            <div className="leading-[1.8] px-10 text-left">
              <div>
                Warehouse Name<span className="ml-2">: </span>
                <input
                  className={`${metaInputBase} font-bold underline`}
                  style={{ width: 160 }}
                  value={header.warehouseName}
                  onChange={(e) => updateHeader("warehouseName", e.target.value)}
                />
              </div>
              <div>
                Warehouse Address<span className="ml-2">: </span>
                <input
                  className={`${metaInputBase} font-bold underline`}
                  style={{ width: 160 }}
                  value={header.warehouseAddress}
                  onChange={(e) => updateHeader("warehouseName", e.target.value)}
                />
              </div>
              <div>
                Warehouse Code<span className="ml-2">: </span>
                <input
                  className={`${metaInputBase} font-bold underline`}
                  style={{ width: 100 }}
                  value={header.warehouseCode}
                  onChange={(e) => updateHeader("warehouseCode", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse table-fixed text-black" style={{ minWidth: 600 }}>
              <thead>
                <tr>
                  <th rowSpan={2} className={thClass} style={{ width: "11%", verticalAlign: "middle" }}>Cereal Type</th>
                  <th rowSpan={2} className={thClass} style={{ width: "6%", verticalAlign: "middle" }}>Cond.</th>
                  <th colSpan={2} className={thClass}>Beginning Balance</th>
                  <th colSpan={2} className={thClass}>Receipts</th>
                  <th colSpan={2} className={thClass}>Issues</th>
                  <th colSpan={2} className={thClass}>Ending Balance</th>
                </tr>
                <tr>
                  {["Bags", "Nkg", "Bags", "Nkg", "Bags", "Nkg", "Bags", "Nkg"].map((h, i) => (
                    <th key={i} className={thClass} style={{ width: "10%" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const { endBags, endNetKg } = computeEnding(row);
                  return (
                    <tr key={row.id}>
                      <td className={tdClass} style={{ height: "clamp(18px,2.5vw,28px)" }}></td>
                      <td className={tdClass} style={{ height: "clamp(18px,2.5vw,28px)" }}></td>
                      <td className={tdClass} style={{ height: "clamp(18px,2.5vw,28px)" }}></td>
                      <td className={tdClass} style={{ height: "clamp(18px,2.5vw,28px)" }}></td>
                      <td className={tdClass} style={{ height: "clamp(18px,2.5vw,28px)" }}></td>
                      <td className={tdClass} style={{ height: "clamp(18px,2.5vw,28px)" }}></td>
                      <td className={tdClass} style={{ height: "clamp(18px,2.5vw,28px)" }}></td>
                      <td className={tdClass} style={{ height: "clamp(18px,2.5vw,28px)" }}></td>
                      <td className={tdClass} style={{ height: "clamp(18px,2.5vw,28px)" }}></td>
                      <td className={tdClass} style={{ height: "clamp(18px,2.5vw,28px)" }}></td>
                    </tr>
                  );
                })}

                {/* Totals Row */}
                <tr className="font-bold text-[11px]">
                  <td className={tdClass} style={{ height: "clamp(18px,2.5vw,28px)" }}></td>
                  <td className={tdClass} style={{ height: "clamp(18px,2.5vw,28px)" }}></td>
                  <td className={tdClass} style={{ height: "clamp(18px,2.5vw,28px)" }}></td>
                  <td className={tdClass} style={{ height: "clamp(18px,2.5vw,28px)" }}></td>
                  <td className={tdClass} style={{ height: "clamp(18px,2.5vw,28px)" }}></td>
                  <td className={tdClass} style={{ height: "clamp(18px,2.5vw,28px)" }}></td>
                  <td className={tdClass} style={{ height: "clamp(18px,2.5vw,28px)" }}></td>
                  <td className={tdClass} style={{ height: "clamp(18px,2.5vw,28px)" }}></td>
                  <td className={tdClass} style={{ height: "clamp(18px,2.5vw,28px)" }}></td>
                  <td className={tdClass} style={{ height: "clamp(18px,2.5vw,28px)" }}></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Signatures */}
          <div
            className="flex justify-between flex-wrap mt-15 text-[11px] text-black"
            style={{ gap: "clamp(8px,2vw,16px)" }}
          >
            {SIGNATURES.map((sig, i) => (
              <div key={i} className="text-center w-[22%] min-w-25">
                <div className="text-[#555] mb-1" style={{ fontSize: "clamp(8px,1vw,11px)" }}>{sig.label}</div>
                <div className="font-bold underline mb-0.5">{sig.name}</div>
                <div className="text-[11px] text-[#444]">{sig.title}</div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </>
  );
}