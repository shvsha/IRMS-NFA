import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import TitleBar from "../components/TitleBar";
import NavBarWhse from "../components/warehouse supervisor/NavBarWhse";

export default function WhseSpvsorLayout() {
  const navigate = useNavigate();
  const location = useLocation(); //triggers re-check on every navigation

  useEffect(() => {
    const token = localStorage.getItem('access_token');

    if (!token) {
      navigate('/', { replace: true }); 
    }
  }, [location.pathname])// runs every time the path changes

  return (
    <div className="flex flex-col h-screen pb-6.5">
      <TitleBar/>
      <NavBarWhse/>
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}