import { Outlet } from "react-router-dom";
import NavBarAdmin from "../components/admin/NavBarAdmin";
import TitleBar from "../components/TitleBar";

export default function AdminLayout() {
  return (
    <div className="flex flex-col h-screen pb-6.5">
      <TitleBar/>
      <NavBarAdmin/>
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}