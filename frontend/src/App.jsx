import './App.css'
import Login from './components/Login'
import { Routes, Route } from 'react-router-dom'

// layouts
import AdminLayout from './layouts/AdminLayout'
import WhseSpvsorLayout from './layouts/WhseSpvsorLayout'

// general import
import ReportSummarization from './components/ReportSummarization'

// import for admin nav
import Dashboard from './components/admin/Dashboard'
import UserMagement from './components/admin/UserManagement'
import ReportEvaluation from './components/admin/ReportEvaluation'
import ReportHistory from './components/admin/ReportHistory'
import AuditLogs from './components/admin/AuditLogs'

// import for whse supervisor nav
import ReportManagement from './components/warehouse supervisor/ReportManagement'
import ReportStatus from './components/warehouse supervisor/ReportStatus'

function App() {
  return (
    <Routes>
      {/* Public route */}
      <Route path="/" element={<Login />} />

      {/* admin */}
      <Route path="/admin" element={<AdminLayout />}> 
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<UserMagement />} />
        <Route path="evaluation" element={<ReportEvaluation/>} />
        <Route path="summarization" element={<ReportSummarization/>}/>
        <Route path="history" element={<ReportHistory/>}/>
        <Route path="audit" element={<AuditLogs/>}/>
      </Route>

      {/* warehouse supervisor */}
      <Route path="/whse" element={<WhseSpvsorLayout />}>  
        <Route path="management" element={<ReportManagement/>} />
        <Route path="status" element={<ReportStatus/>} />
        <Route path="summarization" element={<ReportSummarization/>} />
      </Route>
    </Routes>
  )
}

export default App