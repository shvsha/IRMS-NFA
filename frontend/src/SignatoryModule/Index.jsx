import { Route } from "react-router-dom"

// pages
import ReportEvaluation from "@/AdminModule/pages/ReportEvaluation"

// general pages
import ReportSummarization from "@/components/General Pages/ReportSummarization"
import Notifications from "@/components/General Pages/Notifications"
import PileLayout from "@/components/General Pages/PileLayout"

// reports
import ReceiptReport from '@/components/Reports/ReceiptReport'
import IssueReport from '@/components/Reports/IssuesReport'
import SummaryReport from '@/components/Reports/SummaryReport'

import React from 'react'

const SignaRoute = (
  <>
    <Route path="evaluation" element={<ReportEvaluation />} />
    <Route path="summarization" element={<ReportSummarization />} />
    <Route path="pile" element={<PileLayout />} />

    {/* report */}
    <Route path="evaluation/receipt" element={<ReceiptReport />} />
    <Route path="evaluation/issue" element={<IssueReport />} />

    <Route path="summarization/summary" element={<SummaryReport />} />

    <Route path="notif" element={<Notifications role="signatory" />} />
  </>
)

export default SignaRoute
