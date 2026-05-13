import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import SidebarAdmin from "../AdminModule/pages/SidebarAdmin";

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/', { replace: true });
    }
  }, [location.pathname]);

  return (
    <div className="flex h-screen">
      <SidebarAdmin />
      <div className="flex-1 overflow-y-auto min-h-0 transition-all duration-300">
        <Outlet />
      </div>
    </div>
  );
}