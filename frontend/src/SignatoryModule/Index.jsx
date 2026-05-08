import { Route } from "react-router-dom"

// pages
import ReportEvaluation from "@/AdminModule/pages/ReportEvaluation"

// general pages
import ReportSummarization from "@/components/ReportSummarization"
import Notifications from "@/components/Notifications"
import PileLayout from "@/components/PileLayout"

// reports
import SummaryReport from '@/components/Reports/SummaryReport'

import React from 'react'

const SignaRoute = (
  <>
    <Route path="evaluation" element={<ReportEvaluation />} />
    <Route path="summarization" element={<ReportSummarization />} />
    <Route path="pile" element={<PileLayout />} />

    {/* report */}
    <Route path = "summarization/summary" element={<SummaryReport/>}/>

    <Route path="notif" element={<Notifications role="signatory" />} />
  </>
)

export default SignaRoute
