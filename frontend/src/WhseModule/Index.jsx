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
  </>
)

export const WhseReportRoute = (
  <>
    <Route path="create/:id" element={<CreateReport />}/>
    <Route path='create/:id/review' element={<ReviewTransaction/>}/>
    <Route path="view/:id" element={<ViewReport />} />
    <Route path="edit/:id" element={<CreateReport />} />
  </>
)

export default WhseRoute
