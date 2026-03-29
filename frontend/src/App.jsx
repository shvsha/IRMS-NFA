import "./App.css";
import Login from "./components/Login";
import { Routes, Route } from "react-router-dom";

// layouts
import AdminLayout from "./layouts/AdminLayout";
import WhseSpvsorLayout from "./layouts/WhseSpvsorLayout";

// general import
import ReportSummarization from "./components/ReportSummarization";
import Notifications from "./components/Notifications";
import AuditLogs from "./components/AuditLogs";

// import for admin nav
import Dashboard from "./components/admin/Dashboard";
import UserMagement from "./components/admin/UserManagement";
import ReportEvaluation from "./components/admin/ReportEvaluation";
import ReportHistory from "./components/admin/ReportHistory";

// import Generated Receipt Report 
import ReceiptReport from "./components/Generated_Reports/ReceiptReport";
import IssuesReport from "./components/Generated_Reports/IssuesReport";
import SummaryReport from "./components/Generated_Reports/SummaryReport";

// import for whse supervisor nav
import ReportStatus from "./components/warehouse supervisor/ReportStatus";
import CreateReport from "./components/warehouse supervisor/CreateReport";
import StockBook from "./components/warehouse supervisor/StockBook";

function App() {
  return (
    <Routes>
      {/* Public route */}
      <Route path="/" element={<Login />} />

      {/* admin */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<UserMagement />} />
        <Route path="evaluation" element={<ReportEvaluation />} />
        <Route path="summarization" element={<ReportSummarization />} />
        <Route path="history" element={<ReportHistory />} />
        <Route path="audit" element={<AuditLogs />} />
        <Route path="notif" element={<Notifications role="admin" />} />

        {/* Generated Receipt Report Route */}
        <Route path = "evaluation/receipt" element={<ReceiptReport/>}/>
        <Route path = "evaluation/issue" element={<IssuesReport/>}/>
        <Route path = "summarization/summary" element={<SummaryReport/>}/>

      </Route>

      {/* warehouse supervisor */}
      <Route path="/whse" element={<WhseSpvsorLayout />}>
        <Route path="management" element={<StockBook />} />
        <Route path="status" element={<ReportStatus />} />
        <Route path="summarization" element={<ReportSummarization />} />

        {/* report */}
        <Route path = "summarization/summary" element={<SummaryReport/>}/>

        {/* for stock book */}
        <Route path="create/:cereal" element={<CreateReport />} />
        <Route path="view/:id" element={<CreateReport />} />
        <Route path="edit/:id" element={<CreateReport />} />

        <Route path="notif" element={<Notifications role="supervisor" />} />
        <Route path="audit" element={<AuditLogs />} />
        <Route path = "summarization/summary" element={<SummaryReport/>}/>
      </Route>
    </Routes>
  );
}

export default App;
