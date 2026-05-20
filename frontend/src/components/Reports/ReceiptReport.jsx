import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from '../../components/Header';
import api from "@/api/axios";

// for notif
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { getNotifRoute } from "@/utils/Import & Export/getNotifRoute";
import { useUnreadCount } from "@/hooks/useUnreadCount";

// export
import { exportWSRToExcel } from "@/utils/Import & Export/exportToExcel";

const fmt = (val, decimals = 2) =>
  val != null && val !== "" ? Number(val).toFixed(decimals) : "";

export default function WarehouseReceiptsForm() {
  const user        = useCurrentUser()
  const notifRoute  = getNotifRoute(user)
  const userName    = user ? `${user.fname} ${user.lname}` : 'User'
  const unreadCount = useUnreadCount()

  const navigate = useNavigate();
  const location = useLocation();

  const { reportId, stockbookId, pageTitle } = location.state ?? {};

  const [report,  setReport]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!stockbookId) {
      setError("No stockbook ID provided.")
      setLoading(false)
      return
    }
    api.get(`/reports/stocks/wsr-grouped/${stockbookId}/`)
      .then(res => setReport(res.data))
      .catch(err => { console.error(err); setError("Failed to load report.") })
      .finally(() => setLoading(false))
  }, [stockbookId])

  const transactions   = report?.transactions   ?? []
  const accountOfficer = report?.user_full_name ?? '—'
  const whseCode       = report?.user_WHCode    ?? '—'
  const reportDate     = report?.date
    ? new Date(report.date + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'long', day: '2-digit', year: 'numeric'
      }).toUpperCase()
    : '—'
  const cerealVariety = report?.cereal ?? '—'

  // Signatories
  const signatories = [
    {
      label:        'Certified Correct:',
      name:         accountOfficer,
      role:         'Warehouse Supervisor',
      signatureUrl: report?.ws_signature ?? null,
      approved:     !!report?.ws_signature,  
    },
    {
      label:        'Verified Correct:',
      name:         report?.asst_bm_name    ?? '—',
      role:         'Asst. Branch Manager',
      signatureUrl: report?.asst_bm_signature    ?? null,
      approved:     report?.asst_bm_approved     ?? false,
    },
    {
      label:        'Verified Correct:',
      name:         report?.accountant_name  ?? '—',
      role:         'Accountant III',
      signatureUrl: report?.accountant_signature ?? null,
      approved:     report?.accountant_approved  ?? false,
    },
    {
      label:        'Noted by:',
      name:         report?.branch_m_name    ?? '—',
      role:         'Branch Manager',
      signatureUrl: report?.branch_m_signature   ?? null,
      approved:     report?.branch_m_approved    ?? false,
    },
  ]

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-[#2D317F]">Loading report…</div>
  );
  if (error) return (
    <div className="flex items-center justify-center h-64 text-red-500">{error}</div>
  );

  const DISPLAY_ROWS = Math.max(transactions.length, 10);
  const emptyCount   = DISPLAY_ROWS - transactions.length;

  return (
    <>
      <Header
        pageTitle={pageTitle ?? 'Evaluation'}
        notifTo={notifRoute}
        userName={userName}
        unreadCount={unreadCount}
      />

      <div className="overflow-auto !min-h-[650px] mx-4 my-4 p-3 xl:p-5 box-border flex justify-center items-start shadow-2xl border border-black/10">
        <div className="text-[#111] bg-white w-full box-border overflow-x-auto relative">

          {/* Close Button */}
          <button
            onClick={() => navigate(-1)}
            className="absolute top-2 right-2 bg-white border border-[#e00] text-[#e00] font-bold w-[22px] h-[22px] cursor-pointer text-[14px] leading-none flex items-center justify-center"
          >✕</button>

          {/* Title */}
          <div className="text-center font-bold uppercase mb-0.5 text-[clamp(11px,1.5vw,14px)]">
            National Food Authority
          </div>
          <div className="text-center font-bold mb-1 text-[clamp(10px,1.3vw,13px)]">
            Statement of Daily Warehouse Receipts
          </div>
          <div className="text-center mb-[clamp(8px,1.5vw,14px)] text-[clamp(10px,1.2vw,12px)]">
            Date: <span className="font-bold underline pb-px">{reportDate}</span>
          </div>

          {/* Meta Info */}
          <div className="flex justify-between flex-wrap gap-2 mb-[clamp(8px,1.5vw,14px)]">
            <div className="text-[clamp(9px,1.1vw,12px)] px-10">
              <p className="my-0.5">Region : 1</p>
              <p className="my-0.5">Province : <span className="font-bold underline">La Union</span></p>
              <p className="my-0.5">Accountable Officer : <span className="font-bold underline">{accountOfficer}</span></p>
            </div>
            <div className="text-[clamp(9px,1.1vw,12px)] px-10 text-left">
              <p className="my-0.5">Warehouse Name : <span className="font-bold underline">San Juan GID 2A</span></p>
              <p className="my-0.5">Warehouse Address : <span className="font-bold underline">San Juan, La Union</span></p>
              <p className="my-0.5">Warehouse Code : <span className="font-bold underline">{whseCode}</span></p>
            </div>
          </div>

          {/* Table */}
          <div className="w-full overflow-x-auto">
            <table
              className="w-full border-collapse table-fixed mb-[clamp(10px,2vw,18px)]"
              style={{ fontSize: "clamp(8px, 1vw, 11px)" }}
            >
              <colgroup>
                <col style={{ width: "8%" }} />
                <col style={{ width: "7%" }} />
                <col style={{ width: "10%" }} />
                <col style={{ width: "9%" }} />
                <col style={{ width: "9%" }} />
                <col style={{ width: "4%" }} />
                <col style={{ width: "5%" }} />
                <col style={{ width: "4%" }} />
                <col style={{ width: "7%" }} />
                <col style={{ width: "7%" }} />
                <col style={{ width: "8%" }} />
                <col style={{ width: "8%" }} />
              </colgroup>
              <thead>
                <tr>
                  {[
                    { label: "Cereal Type / Variety", rowSpan: 2 },
                    { label: "WSR# / WTS#",           rowSpan: 2 },
                    { label: "Nature of Transaction",  rowSpan: 2 },
                    { label: "From Whom Received",     colSpan: 2 },
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
                      style={{ padding: "clamp(2px,0.4vw,5px) clamp(2px,0.3vw,4px)", fontSize: "clamp(7px, 0.9vw, 10px)" }}
                    >
                      {th.label}
                    </th>
                  ))}
                </tr>
                <tr>
                  {["Name", "PR/BL/", "Bags", "Gross Kg.", "Net Kg."].map((label, i) => (
                    <th
                      key={i}
                      className="border border-[#333] text-center bg-[#ADCEFF] font-bold leading-[1.3] break-words overflow-hidden"
                      style={{ padding: "clamp(2px,0.4vw,5px) clamp(2px,0.3vw,4px)", fontSize: "clamp(7px, 0.9vw, 10px)" }}
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn, i) => {
                  const isWTS = txn.type === "WTS";
                  return (
                    <tr key={txn.transaction_id ?? i}>
                      <td className="border border-[#333] text-center break-words" style={{ padding: "clamp(2px,0.4vw,5px) clamp(2px,0.3vw,4px)", height: "clamp(18px,2.5vw,28px)" }}>
                        {txn.cereal_type || cerealVariety}
                      </td>
                      <td className="border border-[#333] text-center" style={{ padding: "clamp(2px,0.4vw,5px) clamp(2px,0.3vw,4px)", height: "clamp(18px,2.5vw,28px)" }}>
                        {txn.WSR_no || txn.WTS_no || ""}
                      </td>
                      <td className="border border-[#333] text-center break-words" style={{ padding: "clamp(2px,0.4vw,5px) clamp(2px,0.3vw,4px)", height: "clamp(18px,2.5vw,28px)" }}>
                        {txn.Transaction_ref || ""}
                      </td>
                      <td className="border border-[#333] text-center break-words" style={{ padding: "clamp(2px,0.4vw,5px) clamp(2px,0.3vw,4px)", height: "clamp(18px,2.5vw,28px)" }}>
                        {txn.Particulars || ""}
                      </td>
                      <td className="border border-[#333] text-center" style={{ padding: "clamp(2px,0.4vw,5px) clamp(2px,0.3vw,4px)", height: "clamp(18px,2.5vw,28px)" }} />
                      <td className="border border-[#333] text-center" style={{ padding: "clamp(2px,0.4vw,5px) clamp(2px,0.3vw,4px)", height: "clamp(18px,2.5vw,28px)" }}>{fmt(txn.Age)}</td>
                      <td className="border border-[#333] text-center" style={{ padding: "clamp(2px,0.4vw,5px) clamp(2px,0.3vw,4px)", height: "clamp(18px,2.5vw,28px)" }}>{txn.Cond_R || ""}</td>
                      <td className="border border-[#333] text-center" style={{ padding: "clamp(2px,0.4vw,5px) clamp(2px,0.3vw,4px)", height: "clamp(18px,2.5vw,28px)" }}>{fmt(txn.Moisture_Content)}</td>
                      <td className="border border-[#333] text-center" style={{ padding: "clamp(2px,0.4vw,5px) clamp(2px,0.3vw,4px)", height: "clamp(18px,2.5vw,28px)" }}>{txn.Plate_Number || ""}</td>
                      <td className="border border-[#333] text-center" style={{ padding: "clamp(2px,0.4vw,5px) clamp(2px,0.3vw,4px)", height: "clamp(18px,2.5vw,28px)" }}>{fmt(txn.R_Bags)}</td>
                      <td className="border border-[#333] text-center" style={{ padding: "clamp(2px,0.4vw,5px) clamp(2px,0.3vw,4px)", height: "clamp(18px,2.5vw,28px)" }}>{fmt(txn.R_GKG)}</td>
                      <td className="border border-[#333] text-center" style={{ padding: "clamp(2px,0.4vw,5px) clamp(2px,0.3vw,4px)", height: "clamp(18px,2.5vw,28px)" }}>{fmt(txn.R_NKG)}</td>
                    </tr>
                  );
                })}
                {Array(emptyCount).fill(null).map((_, i) => (
                  <tr key={`empty-${i}`}>
                    {Array(12).fill(null).map((_, j) => (
                      <td key={j} className="border border-[#333] text-center" style={{ padding: "clamp(2px,0.4vw,5px) clamp(2px,0.3vw,4px)", height: "clamp(18px,2.5vw,28px)" }} />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Signature Block */}
          <div className="flex justify-between flex-wrap mt-8 mb-4" style={{ gap: "clamp(8px,2vw,16px)" }}>
            {signatories.map((sig, i) => (
              <div key={i} className="text-center flex-1 min-w-[120px] flex flex-col items-center">
                {/* Signature image — only if approved and URL exists */}
                <div className="h-14 flex items-end justify-center mb-1">
                  {sig.approved && sig.signatureUrl ? (
                    <img
                      src={sig.signatureUrl}
                      alt={`${sig.name} signature`}
                      className="max-h-14 max-w-[120px] object-contain"
                    />
                  ) : (
                    <div className="h-14" />
                  )}
                </div>
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