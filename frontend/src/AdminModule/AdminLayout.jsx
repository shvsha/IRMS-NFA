import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import NavBarAdmin from "../AdminModule/pages/NavBarAdmin";
import TitleBar from "../components/TitleBar";

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation(); //triggers re-check on every navigation

  useEffect(() => {
    const token = localStorage.getItem('access_token');

    if (!token) {
      navigate('/', { replace: true });
    }
  }, [location.pathname]) // runs every time the path changes

  return (
    <div className="flex flex-col h-screen">
      <TitleBar/>
      <NavBarAdmin/>
      <div className="flex-1 overflow-hidden min-h-0">
        <Outlet />
      </div>
    </div>
  );
}