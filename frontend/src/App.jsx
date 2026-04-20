import Login from "./components/Login";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

// layouts
import AdminLayout from "./AdminModule/AdminLayout";
import WhseSpvsorLayout from "./WhseModule/WhseSpvsorLayout";
import CreateReportLayout from "./layouts/CreateReportLayout";

// Routes
import AdminRoute from './AdminModule/Index'
import WhseRoute, { WhseReportRoute } from './WhseModule/Index'

function App() {
  return (
    <Routes>
      {/* landing page */}
      <Route path="/" element={<Login />} />

      {/* admin */}
      <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
        {AdminRoute}
      </Route>

      {/* warehouse supervisor */}
      <Route path="/whse" element={<ProtectedRoute> <WhseSpvsorLayout /> </ProtectedRoute>
        }>
        {WhseRoute}
      </Route>

      {/* create/edit/view report layout for whse (stock book) */}
      <Route path="/whse" element={<ProtectedRoute><CreateReportLayout /></ProtectedRoute>}>
        {WhseReportRoute}
      </Route>

    </Routes>
  );
}

export default App;
