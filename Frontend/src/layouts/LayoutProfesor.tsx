import { Outlet } from "react-router-dom";
import SidebarProfesor from "../components/SidebarProfesor";
import Header from "../components/Header";
import "../styles/LayoutProfesor.css";

const LayoutProfesor = () => {
  return (
    <div className="layout-profesor">
      {/* SIDEBAR */}
      <SidebarProfesor />
      {/*ZONA DERECHA */}
      <div className="right-side">
        {/* HEADER */}
        <Header />
        {/*CONTENIDO DINAMICO*/}
        <main className="center-pf">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default LayoutProfesor;
