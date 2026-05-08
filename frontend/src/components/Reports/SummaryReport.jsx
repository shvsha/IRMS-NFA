import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from '../../components/Header'
import api from "@/api/axios";

export default function NFAWarehouseReceipt() {
  const navigate  = useNavigate();
  const location  = useLocation();

  // Accept a summaryId or stockbookId from navigation state
  const summaryId    = location.state?.summaryId    ?? null;
  const stockbookId  = location.state?.stockbookId  ?? null;
  const pageTitle   = location.state?.pageTitle   ?? 'Summary';

  const [summary,  setSummary]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        let data = null;

        if (summaryId) {
          const res = await api.get(`/reports/summary/upd/${summaryId}/`);
          data = res.data;
        } else if (stockbookId) {
          // Find summary by stockbook
          const res = await api.get('/reports/summary/');
          data = res.data.find(s => s.stockbook === stockbookId) ?? null;
        } else {
          // Fallback: get latest summary
          const res = await api.get('/reports/summary/');
          data = res.data[res.data.length - 1] ?? null;
        }

        setSummary(data);
      } catch (err) {
        console.error('Failed to fetch summary:', err);
        setError('Failed to load summary report.');
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [summaryId, stockbookId]);

  if (loading) return (
    <>
      <Header pageTitle="Summary" notifTo="/admin/notif" unreadCount={5} userName="Raph Nigos" />
      <div className="flex items-center justify-center h-64 text-[#2D317F]">Loading summary...</div>
    </>
  );

  if (error || !summary) return (
    <>
      <Header pageTitle="Summary" notifTo="/admin/notif" unreadCount={5} userName="Raph Nigos" />
      <div className="flex items-center justify-center h-64 text-red-500">{error ?? 'No summary found.'}</div>
    </>
  );

  // Derived values from summary
  const formattedDate = summary.date_covered
    ? new Date(summary.date_covered + 'T00:00:00')
        .toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' })
        .toUpperCase()
    : '—';

  const whCode    = summary.WHCode    ?? '—';
  const wsName    = summary.Name      ?? '—';
  const cerealType = summary.CerealType ?? '—';
  const condition  = summary.Condition  ?? '—';

  const beginBags   = summary.prev_B_Bags  ?? 0;
  const beginNkg    = summary.prev_B_NKG   ?? 0;
  const receiptBags = summary.total_R_Bags ?? 0;
  const receiptNkg  = summary.total_R_NKG  ?? 0;
  const issueBags   = summary.total_I_Bags ?? 0;
  const issueNkg    = summary.total_I_NKG  ?? 0;
  const endBags     = summary.ending_B_Bags ?? (parseFloat(beginBags) + parseFloat(receiptBags) - parseFloat(issueBags));
  const endNkg      = summary.ending_B_NKG  ?? (parseFloat(beginNkg)  + parseFloat(receiptNkg)  - parseFloat(issueNkg));

  // Signatories from summary
  const SIGNATURES = [
    { label: 'Certified Correct:', name: summary.Name      ?? '—', title: 'Warehouse Supervisor' },
    { label: 'Verified Correct:',  name: summary.Assist_BM ?? '—', title: 'Asst. Branch Manager' },
    { label: 'Verified Correct:',  name: summary.Account_II ?? '—', title: 'Accountant III' },
    { label: 'Noted by:',          name: summary.Branch_M  ?? '—', title: 'Branch Manager' },
  ];

  // Pad rows to at least 8
  const dataRow = { cerealType, condition, beginBags, beginNkg, receiptBags, receiptNkg, issueBags, issueNkg, endBags, endNkg };
  const rows = [dataRow, ...Array(7).fill(null).map(() => ({
    cerealType: '', condition: '', beginBags: '', beginNkg: '',
    receiptBags: '', receiptNkg: '', issueBags: '', issueNkg: '',
    endBags: '', endNkg: '',
  }))];

  const thClass = "border border-black text-center bg-[#ADCEFF] font-bold text-[10.5px] py-1 px-[5px]";
  const tdClass = "border border-black text-center text-[11px] bg-white px-[5px]";
  const metaClass = "text-[12px] font-bold underline";

  return (
    <>
      <Header pageTitle={pageTitle} notifTo="/admin/notif" unreadCount={5} userName="Raph Nigos" />

      <div
        className="shadow-2xl border border-black/10 !min-h-[650px] mx-4 my-4 overflow-auto p-3 xl:p-5"
        style={{ maxHeight: 'calc(100vh - 90px - 60px)' }}
      >
        <div className="relative bg-white w-full box-border">

          {/* Close Button */}
          <button
            onClick={() => navigate(-1)}
            className="absolute top-2 right-2 bg-white border border-red-600 text-red-600 font-bold w-[22px] h-[22px] cursor-pointer text-[14px] leading-none flex items-center justify-center z-10"
          >✕</button>

          {/* Title */}
          <div className="text-center mb-1.5 text-black">
            <div className="font-bold text-[14px] tracking-wide uppercase">National Food Authority</div>
            <div className="font-bold text-[13px] mt-0.5">Statement of Daily Warehouse Receipt, Issues, and Balances</div>
            <div className="text-[12px] mt-[3px]">Date: <span className="font-bold underline">{formattedDate}</span></div>
          </div>

          {/* Meta Info */}
          <div className="flex justify-between flex-wrap gap-2 my-2.5 text-[12px] text-black">
            <div className="leading-[1.8] px-10">
              <div>Region<span className="ml-[14px]">: </span>1</div>
              <div>Province<span className="ml-2">: </span><span className={metaClass}>La Union</span></div>
              <div>Accountable Officer<span className="ml-2">: </span><span className={metaClass}>{wsName}</span></div>
            </div>
            <div className="leading-[1.8] px-10 text-left">
              <div>Warehouse Name<span className="ml-2">: </span><span className={metaClass}>San Juan GID 2A</span></div>
              <div>Warehouse Address<span className="ml-2">: </span><span className={metaClass}>San Juan, La Union</span></div>
              <div>Warehouse Code<span className="ml-2">: </span><span className={metaClass}>{whCode}</span></div>
            </div>
          </div>

          {/* Table */}
          <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse table-fixed text-black" style={{ minWidth: 600 }}>
              <thead>
                <tr>
                  <th rowSpan={2} className={thClass} style={{ width: '11%', verticalAlign: 'middle' }}>Cereal Type</th>
                  <th rowSpan={2} className={thClass} style={{ width: '6%',  verticalAlign: 'middle' }}>Cond.</th>
                  <th colSpan={2} className={thClass}>Beginning Balance</th>
                  <th colSpan={2} className={thClass}>Receipts</th>
                  <th colSpan={2} className={thClass}>Issues</th>
                  <th colSpan={2} className={thClass}>Ending Balance</th>
                </tr>
                <tr>
                  {['Bags', 'Nkg', 'Bags', 'Nkg', 'Bags', 'Nkg', 'Bags', 'Nkg'].map((h, i) => (
                    <th key={i} className={thClass} style={{ width: '10%' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i}>
                    <td className={tdClass} style={{ height: 26 }}>{row.cerealType}</td>
                    <td className={tdClass} style={{ height: 26 }}>{row.condition}</td>
                    <td className={tdClass} style={{ height: 26 }}>{row.beginBags !== '' ? Number(row.beginBags).toLocaleString() : ''}</td>
                    <td className={tdClass} style={{ height: 26 }}>{row.beginNkg  !== '' ? Number(row.beginNkg).toLocaleString()  : ''}</td>
                    <td className={tdClass} style={{ height: 26 }}>{row.receiptBags !== '' ? Number(row.receiptBags).toLocaleString() : ''}</td>
                    <td className={tdClass} style={{ height: 26 }}>{row.receiptNkg  !== '' ? Number(row.receiptNkg).toLocaleString()  : ''}</td>
                    <td className={tdClass} style={{ height: 26 }}>{row.issueBags !== '' ? Number(row.issueBags).toLocaleString() : ''}</td>
                    <td className={tdClass} style={{ height: 26 }}>{row.issueNkg  !== '' ? Number(row.issueNkg).toLocaleString()  : ''}</td>
                    <td className={tdClass} style={{ height: 26 }}>{row.endBags !== '' ? Number(row.endBags).toLocaleString() : ''}</td>
                    <td className={tdClass} style={{ height: 26 }}>{row.endNkg  !== '' ? Number(row.endNkg).toLocaleString()  : ''}</td>
                  </tr>
                ))}

                {/* Totals row */}
                <tr className="font-bold text-[11px]">
                  <td className={tdClass} colSpan={2} style={{ height: 26 }}>TOTAL</td>
                  <td className={tdClass}>{Number(beginBags).toLocaleString()}</td>
                  <td className={tdClass}>{Number(beginNkg).toLocaleString()}</td>
                  <td className={tdClass}>{Number(receiptBags).toLocaleString()}</td>
                  <td className={tdClass}>{Number(receiptNkg).toLocaleString()}</td>
                  <td className={tdClass}>{Number(issueBags).toLocaleString()}</td>
                  <td className={tdClass}>{Number(issueNkg).toLocaleString()}</td>
                  <td className={tdClass}>{Number(endBags).toLocaleString()}</td>
                  <td className={tdClass}>{Number(endNkg).toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Signatures */}
          <div className="flex justify-between flex-wrap mt-23 text-[11px] text-black" style={{ gap: 16 }}>
            {SIGNATURES.map((sig, i) => (
              <div key={i} className="text-center w-[22%] mb-7 min-w-25">
                <div className="text-[#555] mb-1">{sig.label}</div>
                <div className="font-bold underline mb-0.5 uppercase">{sig.name}</div>
                <div className="text-[11px] text-[#444]">{sig.title}</div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </>
  );
}