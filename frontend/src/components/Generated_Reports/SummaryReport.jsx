import { useState } from "react";
import "../../styles/Generated_Reports/SummaryReport.css";

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
    const endBags = bB + rB - iB;
    const endNetKg = bK + rK - iK;
    return {
      endBags: endBags !== 0 ? endBags : "",
      endNetKg: endNetKg !== 0 ? endNetKg.toFixed(2) : "",
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

  return (
    <div className="nfa-wrapper">

      {/* Title */}
      <div className="nfa-title-block">
        <div className="nfa-title">NATIONAL FOOD AUTHORITY</div>
        <div className="nfa-subtitle">Statement of Daily Warehouse Receipt, Issues, and Balances</div>
        <div className="nfa-date-row">
          Date{" "}
          <span className="nfa-date-input">
            {new Date(header.date + "T00:00:00").toLocaleDateString("en-US", {month: "long", day: "2-digit", year: "numeric"}).toUpperCase()}
          </span>
        </div>
      </div>

      {/* Meta */}
      <div className="nfa-meta">
        <div className="nfa-meta-left">
          <div>
            Region<span style={{ marginLeft: 14 }}>: </span>
            <input className="nfa-meta-input" style={{ width: 120 }} value={header.region}
              onChange={(e) => updateHeader("region", e.target.value)} />
          </div>
          <div>
            Province<span style={{ marginLeft: 8 }}>: </span>
            <input className="nfa-meta-input underline" style={{ width: 160 }} value={header.province}
              onChange={(e) => updateHeader("province", e.target.value)} />
          </div>
          <div>
            Accountable Officer<span style={{ marginLeft: 4 }}>: </span>
            <input className="nfa-meta-input bold-underline" style={{ width: 200 }} value={header.accountableOfficer}
              onChange={(e) => updateHeader("accountableOfficer", e.target.value)} />
          </div>
        </div>
        <div className="nfa-meta-right">
          <div>
            Warehouse Name<span style={{ marginLeft: 8 }}>: </span>
            <input className="nfa-meta-input bold" style={{ width: 160 }} value={header.warehouseName}
              onChange={(e) => updateHeader("warehouseName", e.target.value)} />
          </div>
          <div>
            Warehouse Address<span style={{ marginLeft: 4 }}>: </span>
            <input className="nfa-meta-input bold" style={{ width: 160 }} value={header.warehouseAddress}
              onChange={(e) => updateHeader("warehouseAddress", e.target.value)} />
          </div>
          <div>
            Warehouse Code<span style={{ marginLeft: 8 }}>: </span>
            <input className="nfa-meta-input bold" style={{ width: 100 }} value={header.warehouseCode}
              onChange={(e) => updateHeader("warehouseCode", e.target.value)} />
          </div>
        </div>
      </div>

      {/* Table */}
      <table className="nfa-table">
        <thead>
          <tr>
            <th rowSpan={2} style={{ width: "11%", verticalAlign: "middle" }}>Cereal/Type</th>
            <th rowSpan={2} style={{ width: "6%",  verticalAlign: "middle" }}>Cond.</th>
            <th colSpan={2}>Beginning Balance</th>
            <th colSpan={2}>Receipts</th>
            <th colSpan={2}>Issues</th>
            <th colSpan={2}>Ending Balance</th>
          </tr>
          <tr>
            {["Bags","Net Kg","Bags","Net Kg","Bags","Net Kg","Bags","Net Kg"].map((h, i) => (
              <th key={i} style={{ width: "10%" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const { endBags, endNetKg } = computeEnding(row);
            return (
              <tr key={row.id}>
                <td><input className="nfa-cell-input" value={row.cerealType}    onChange={(e) => updateRow(row.id, "cerealType",    e.target.value)} /></td>
                <td><input className="nfa-cell-input" value={row.condition}     onChange={(e) => updateRow(row.id, "condition",     e.target.value)} /></td>
                <td><input className="nfa-cell-input" type="number" value={row.beginBags}    onChange={(e) => updateRow(row.id, "beginBags",    e.target.value)} /></td>
                <td><input className="nfa-cell-input" type="number" value={row.beginNetKg}   onChange={(e) => updateRow(row.id, "beginNetKg",   e.target.value)} /></td>
                <td><input className="nfa-cell-input" type="number" value={row.receiptBags}  onChange={(e) => updateRow(row.id, "receiptBags",  e.target.value)} /></td>
                <td><input className="nfa-cell-input" type="number" value={row.receiptNetKg} onChange={(e) => updateRow(row.id, "receiptNetKg", e.target.value)} /></td>
                <td><input className="nfa-cell-input" type="number" value={row.issueBags}    onChange={(e) => updateRow(row.id, "issueBags",    e.target.value)} /></td>
                <td><input className="nfa-cell-input" type="number" value={row.issueNetKg}   onChange={(e) => updateRow(row.id, "issueNetKg",   e.target.value)} /></td>
                <td className="ending">{endBags}</td>
                <td className="ending">{endNetKg}</td>
              </tr>
            );
          })}

          {/* Totals */}
          <tr className="totals-row">
            <td colSpan={2} className="totals-label">TOTAL</td>
            <td>{totals.beginBags    || ""}</td>
            <td>{totals.beginNetKg   ? totals.beginNetKg.toFixed(2)   : ""}</td>
            <td>{totals.receiptBags  || ""}</td>
            <td>{totals.receiptNetKg ? totals.receiptNetKg.toFixed(2) : ""}</td>
            <td>{totals.issueBags    || ""}</td>
            <td>{totals.issueNetKg   ? totals.issueNetKg.toFixed(2)   : ""}</td>
            <td className="ending">{totals.endBags    || ""}</td>
            <td className="ending">{totals.endNetKg   ? totals.endNetKg.toFixed(2)   : ""}</td>
          </tr>
        </tbody>
      </table>

      
      {/* Signatures */}
      <div className="nfa-signatures">
        {SIGNATURES.map((sig, i) => (
          <div key={i} className="nfa-sig-block">
            <div className="nfa-sig-label">{sig.label}</div>
            <div className="nfa-sig-name">{sig.name}</div>
            <div className="nfa-sig-title">{sig.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
}