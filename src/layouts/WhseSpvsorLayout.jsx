import { Outlet } from "react-router-dom";
import TitleBar from "../components/TitleBar";
import NavBarWhse from "../components/warehouse supervisor/NavBarWhse";

export default function WhseSpvsorLayout() {
  return (
    <>
      <TitleBar />
      <NavBarWhse/>
      <Outlet />
    </>
  );
}