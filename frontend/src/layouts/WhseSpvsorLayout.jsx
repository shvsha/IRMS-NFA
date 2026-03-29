import { Outlet } from "react-router-dom";
import TitleBar from "../components/TitleBar";
import NavBarWhse from "../components/warehouse supervisor/NavBarWhse";

export default function WhseSpvsorLayout() {
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

