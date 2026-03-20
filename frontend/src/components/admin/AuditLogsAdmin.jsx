// components
import DailyFilter from '../filters/DailyFilter'

// css
import '../../styles/admin/AuditLogs.css'

// react
import { useState } from 'react'

const sampleAudit = [
  {recordid: "23100123", officeid: "1000212", name: "Louie Valenzuela", role: "Warehouse Supervisor 1", action: "Submitted Report", module: "Report Management", recordid: "00101", date: "30-Jan-26", time: "5:00 PM" },
  {recordid: "23100124", officeid: "1000213", name: "Febrose Valenzuela", role: "Admin 2", action: "Evaluted Report", module: "Report Evaluation", recordid: "00102", date: "30-Jan-26", time: "5:00 PM" },
  {recordid: "23100124", officeid: "1000213", name: "Febrose Valenzuela", role: "Admin 2", action: "Evaluted Report", module: "Report Evaluation", recordid: "00102", date: "30-Jan-26", time: "5:00 PM" },
  {recordid: "23100124", officeid: "1000213", name: "Febrose Valenzuela", role: "Admin 2", action: "Evaluted Report", module: "Report Evaluation", recordid: "00102", date: "30-Jan-26", time: "5:00 PM" }
  //add more for testing
]

export default function AuditLogsAdmin() {
  // us
  const [selectedStartDate, setSelectedStartDate] = useState(new Date(2026, 0, 1));
  const [selectedEndDate, setSelectedEndDate] = useState(new Date(2026, 2, 20));

  // validation
  const handleEndDateChange = (date) => {
    if (selectedStartDate && date < selectedStartDate ) {
      alert("Your end date cant be lower that your start date.")
      return;
    }
    setSelectedEndDate(date);
  }
  return (
    <>
      <div className='filter-container-audit'>
        <div className='filter-date-wrapper'> 
          <label htmlFor="">Start Date</label>
          <DailyFilter value={selectedStartDate} onChange={setSelectedStartDate} className="daily-filter--full"/>
        </div>
        <div className='filter-date-container'>
          <label htmlFor="">End Date</label>
          <DailyFilter value={selectedEndDate} onChange={handleEndDateChange} className="daily-filter--full"/>
        </div>
      </div>
      <div className='whole-container-audit'>
        <div>
          <table className='audit-table'>
            <thead>
              <tr>
                <th>Record ID</th>
                <th>Office ID</th>
                <th>Name</th>
                <th>Role</th>
                <th>Action</th>
                <th>Module</th>
                <th>Date</th>
                <th>Time</th>
              </tr>
            </thead>

            <tbody>
              {sampleAudit.map((audit, i) => (
                <tr key={i}>
                  <td>{audit.recordid}</td>
                  <td>{audit.officeid}</td>
                  <td>{audit.name}</td>
                  <td>{audit.role}</td>
                  <td>{audit.action}</td>
                  <td>{audit.module}</td>
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
