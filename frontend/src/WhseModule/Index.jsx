import { Route } from "react-router-dom"

// pages
import ReportStatus from "./pages/ReportStatus"
import CreateReport from "./pages/CreateReport"
import ViewReport from './pages/ViewReport'
import ReviewTransaction from "./pages/ReviewTransaction"
import StockBook from "./pages/StockBook"

// general pages
import ReportSummarization from "@/components/ReportSummarization"
import Notifications from "@/components/Notifications"
import AuditLogs from "@/components/AuditLogs"

// reports
import SummaryReport from '@/components/Reports/SummaryReport'

import React from 'react'

const WhseRoute = (
  <>
    <Route path="management" element={<StockBook />} />
    <Route path="status" element={<ReportStatus />} />
    <Route path="summarization" element={<ReportSummarization />} />

    {/* report */}
    <Route path = "summarization/summary" element={<SummaryReport/>}/>

    <Route path="notif" element={<Notifications role="supervisor" />} />
    <Route path="audit" element={<AuditLogs />} />
  </>
)

export const WhseReportRoute = (
  <>
    <Route path="create/:cereal" element={<CreateReport />}/>
    <Route path='create/:cereal/review/' element={<ReviewTransaction/>}/>
    <Route path="view/" element={<ViewReport />} />
    <Route path="edit/" element={<CreateReport />} />
  </>
)

export default WhseRoute
