import { Outlet } from "react-router-dom";
import TitleBar from "../components/TitleBar";

export default function WhseSpvsorLayout() {
  return (
    <>
      <TitleBar />
      <NavBarWhseSpvsor />
      <Outlet />
    </>
  );
}