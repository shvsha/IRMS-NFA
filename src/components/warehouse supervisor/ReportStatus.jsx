import React from "react";

export default function ReportStatus() {
  return (
    <>
      <div className="whole-container-status">
        <div className="filter-container-status">
          <div className="table-wrapper-status">
            <table className="table-container-status">
              <thead>
                <tr>
                  <th>Report ID</th>
                  <th>Report Name</th>
                </tr>
              </thead>
              <tbody>
                {/* Table rows would be populated with report data */}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
