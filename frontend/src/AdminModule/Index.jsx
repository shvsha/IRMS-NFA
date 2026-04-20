
import { Route } from "react-router-dom"

// pages
import Dashboard from "./pages/Dashboard"
import UserManagement from "./pages/UserManagement"
import ReportEvaluation from "./pages/ReportEvaluation"
import ReportHistory from "./pages/ReportHistory"

// general pages
import ReportSummarization from "@/components/ReportSummarization"
import Notifications from "@/components/Notifications"
import AuditLogs from "@/components/AuditLogs"

// Reports
import ReceiptReport from '@/components/Reports/ReceiptReport'
import IssuesReport from '@/components/Reports/IssuesReport'
import SummaryReport from '@/components/Reports/SummaryReport'

const AdminRoute = (
  <>
    <Route path="dashboard" element={<Dashboard />} />
    <Route path="users" element={<UserManagement />} />
    <Route path="evaluation" element={<ReportEvaluation />} />
    <Route path="summarization" element={<ReportSummarization />} />
    <Route path="history" element={<ReportHistory />} />
    <Route path="audit" element={<AuditLogs />} />
    <Route path="notif" element={<Notifications role="admin" />} />

    {/* Generated Receipt Report Route */}
    <Route path = "evaluation/receipt" element={<ReceiptReport/>}/>
    <Route path = "evaluation/issue" element={<IssuesReport/>}/>
    <Route path = "summarization/summary" element={<SummaryReport/>}/>
  </>
)

export default AdminRoute

