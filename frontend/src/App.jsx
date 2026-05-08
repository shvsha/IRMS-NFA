import Login from "./components/Login";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

// layouts
import AdminLayout from "./AdminModule/AdminLayout";
import WhseSpvsorLayout from "./WhseModule/WhseSpvsorLayout";
import SignaLayout from './SignatoryModule/SignatoryLayout'

// Routes
import AdminRoute from './AdminModule/Index'
import WhseRoute, { WhseReportRoute } from './WhseModule/Index'
import SignaRoute from './SignatoryModule/Index'

function App() {
  return (
    <Routes>
      {/* landing page */}
      <Route path="/" element={<Login />} />

      {/* admin */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['Admin']}><AdminLayout /></ProtectedRoute>}>
        {AdminRoute}
      </Route>

      {/* warehouse supervisor */}
      <Route path="/whse" element={<ProtectedRoute allowedRoles={['Warehouse Supervisor']}> <WhseSpvsorLayout /> </ProtectedRoute>
        }>
        {WhseRoute}
        {WhseReportRoute}
      </Route>

      <Route path="/signa" element={<ProtectedRoute allowedRoles={['Signatory']}><SignaLayout /></ProtectedRoute>}>
        {SignaRoute}
      </Route>

    </Routes>
  );
}

export default App;
