import "../../styles/Generated_Reports/IssuesReport.css"

const EMPTY_ROWS = Array(10).fill(null);

const SIGNATURES = [
  { label: "Certified Correct:", name: "LOUIE A. VALENZUELA", role: "Warehouse Supervisor" },
  { label: "Verified Correct:", name: "MARCELINA A. DOMINGO", role: "Asst. Branch Manager" },
  { label: "Verified Correct:", name: "LOVELYN M. PICARDAL", role: "Accountant II" },
  { label: "Noted by:", name: "CELERINA T. CAPONES", role: "Branch Manager" },
];

export default function WarehouseIssuesForm() {
    return(
        <div className="form-container">
            <div className="form-wrap">
                <div className="form-title">National Food Authority</div>
                <div className="form-subtitle">Statement of Daily Warehouse Issue</div>
                <div className="form-date">
                    Date <span>FEBRUARY 03, 2026</span>
                </div>

                <div className="form-data">
                    <div className="data-left">
                        <p>Region : 1</p>
                        <p>Province : <span>La Union</span></p>
                        <p>Accountable Officer : <span>Engr. Louie A. Valenzuela</span></p>
                    </div>
                    <div className="data-right">
                        <p>Warehouse Name : <span>San Juan GID 2A</span></p>
                        <p>Warehouse Address : <span>San Juan, La Union</span></p>
                        <p>Warehouse Code : <span>010502A</span></p>
                    </div>
                </div>

                <div className="table-wrapper">
                    <table className="receipt-table">
                        <colgroup>
                            <col style={{ width: "8%" }} />   {/* Cereal Type */}
                            <col style={{ width: "7%" }} />   {/* WSR# */}
                            <col style={{ width: "10%" }} />  {/* Nature */}
                            <col style={{ width: "9%" }} />   {/* Name */}
                            <col style={{ width: "9%" }} />   {/* OR/BL/WSR No. */}
                            <col style={{ width: "4%" }} />   {/* Age */}
                            <col style={{ width: "5%" }} />   {/* Cond. */}
                            <col style={{ width: "4%" }} />   {/* MC */}
                            <col style={{ width: "7%" }} />   {/* Truck No. */}
                            <col style={{ width: "7%" }} />   {/* Bags */}
                            <col style={{ width: "8%" }} />   {/* Gross Kg. */}
                            <col style={{ width: "8%" }} />   {/* Net Kg. */}
                        </colgroup>

                        <thead>
                            <tr>
                                <th rowSpan={2}>Cereal Type / Variety</th>
                                <th rowSpan={2}>WSR# / WSI#</th>
                                <th rowSpan={2}>Nature of Transaction</th>
                                <th colSpan={2}>Issued to</th>
                                <th rowSpan={2}>Age</th>
                                <th rowSpan={2}>Cond.</th>
                                <th rowSpan={2}>MC</th>
                                <th rowSpan={2}>Truck No.</th>
                                <th colSpan={3}>Quantity</th>
                            </tr>
                            <tr>
                                <th>Name</th>
                                <th>OR/BL/WSR No</th>
                                <th>Bags</th>
                                <th>Gross Kg.</th>
                                <th className="net-kg"><div className="cell-truncate">Net Kg.</div></th>
                            </tr>
                        </thead>

                        <tbody>
                            {EMPTY_ROWS.map((_, i) => (
                                <tr key={i}>
                                    {Array(12).fill(null).map((_, j) => (
                                    <td key={j} className={j === 11 ? "net-kg" : ""}>
                                        {j === 11 ? <div className="cell-truncate"></div> : null}
                                    </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="sig-block">
                    {SIGNATURES.map((sig) => (
                        <div key={sig.name} className="sig-item">
                            <div className="sig-label">{sig.label}</div>
                            <div className="sig-name">{sig.name}</div>
                            <div className="sig-role">{sig.role}</div>
                        </div>
                    ))}
                </div>
    
            </div>

        </div>
    )
}