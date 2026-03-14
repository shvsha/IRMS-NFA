import { useState } from 'react'

import '../../styles/admin/AuditLogs.css'

const sampleAudit = [
  {userid: "23100123", name: "Louie Valenzuela", role: "Warehouse Supervisor 1", action: "Submitted Report", module: "Report Management", recordid: "00101", date: "30-Jan-26", time: "5:00 PM" },
  {userid: "23100124", name: "Febrose Valenzuela", role: "Admin 2", action: "Evaluted Report", module: "Report Evaluation", recordid: "00102", date: "30-Jan-26", time: "5:00 PM" }
  //add more for testing
]

export default function AuditLogs() {
  return (
    <>
      <div className='whole-container-audit'>
        <div>
          <table className='audit-table'>
            <thead>
              <tr>
                <th>User ID</th>
                <th>Name</th>
                <th>Role</th>
                <th>Action</th>
                <th>Module</th>
                <th>Record ID</th>
                <th>Date</th>
                <th>Time</th>
              </tr>
            </thead>

            <tbody>
              {sampleAudit.map((audit, i) => (
                <tr key={i}>
                  <td>{audit.userid}</td>
                  <td>{audit.name}</td>
                  <td>{audit.role}</td>
                  <td>{audit.action}</td>
                  <td>{audit.module}</td>
                  <td>{audit.recordid}</td>
                  <td>{audit.date}</td>
                  <td>{audit.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
