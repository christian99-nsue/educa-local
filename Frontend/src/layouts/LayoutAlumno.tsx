import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import "../styles/LayoutAlumno.css";

const LayoutAlumno = () => {
  return (
    <div className="layout-alumno">
      {/* SIDEBAR */}
      <Sidebar />
      {/*ZONA DERECHA */}
      <div className="right-side">
        {/* HEADER */}
        <Header />
        {/*CONTENIDO DINAMICO*/}
        <main className="center">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default LayoutAlumno;
