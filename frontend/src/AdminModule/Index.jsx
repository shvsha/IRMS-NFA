
import { Route } from "react-router-dom"

// pages
import Dashboard from "./pages/Dashboard"
import WSManagement from "./pages/WSManagement"
import SignaManagement from "./pages/SignaManagement"
import ReportEvaluation from "./pages/ReportEvaluation"
import ReportHistory from "./pages/ReportHistory"

// general pages
import ReportSummarization from "@/components/General Pages/ReportSummarization"
import Notifications from "@/components/General Pages/Notifications"
import AuditLogs from "@/components/General Pages/AuditLogs"
import PileLayout from "@/components/General Pages/PileLayout"

// Reports
import ReceiptReport from '@/components/Reports/ReceiptReport'
import IssuesReport from '@/components/Reports/IssuesReport'
import SummaryReport from '@/components/Reports/SummaryReport'

const AdminRoute = (
  <>
    <Route path="dashboard" element={<Dashboard />} />
    <Route path="ws" element={<WSManagement />} />
    <Route path="signa" element={<SignaManagement />} />
    <Route path="evaluation" element={<ReportEvaluation />} />
    <Route path="summarization" element={<ReportSummarization />} />
    <Route path="history" element={<ReportHistory />} />
    <Route path="pile" element={<PileLayout />} />
    <Route path="audit" element={<AuditLogs />} />
    <Route path="notif" element={<Notifications role="admin" />} />

    {/* Generated Receipt Report Route */}
    <Route path="evaluation/receipt" element={<ReceiptReport />} />
    <Route path="evaluation/issue" element={<IssuesReport />} />

    <Route path="summarization/summary" element={<SummaryReport />} />

    <Route path="history/receipt" element={<ReceiptReport />} />
    <Route path="history/issue" element={<IssuesReport />} />
    <Route path="history/summary" element={<SummaryReport />} />
  </>
)

export default AdminRoute

