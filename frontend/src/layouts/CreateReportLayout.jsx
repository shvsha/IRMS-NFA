import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import TitleBar from "../components/TitleBar";
import NavBarWhse from "../WhseModule/pages/SideBardWhse";

export default function CreateReportLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/', { replace: true });
    }
  }, [location.pathname]);

  return (
    <div className="flex flex-col h-screen">
      <TitleBar />
      <NavBarWhse />
      <div className="flex-1 overflow-y-auto ">
        <Outlet />
      </div>
    </div>
  );
}