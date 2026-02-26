import { Outlet } from "react-router-dom";
import NavBarAdmin from "../components/admin/NavBarAdmin";
import TitleBar from "../components/TitleBar";

export default function AdminLayout() {
  return (
    <>
      <TitleBar/>
      <NavBarAdmin/>
      <Outlet />
    </>
  );
}