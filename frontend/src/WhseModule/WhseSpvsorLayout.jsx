import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import NavBarWhse from "./pages/SideBardWhse";

export default function WhseSpvsorLayout() {
  const navigate = useNavigate();
  const location = useLocation(); //triggers re-check on every navigation

  useEffect(() => {
    const token = sessionStorage.getItem('access_token');
    if (!token) {
      navigate('/', { replace: true }); 
    }
  }, [location.pathname])// runs every time the path changes

  return (
    <div className="flex h-screen">
      <NavBarWhse/>
      <div className="flex-1 overflow-hidden min-h-0 transition-all duration-300">
        <Outlet />
      </div>
    </div>
  );
}