import { Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import CerrarSesionModal from "../components/CerrarSesionModal";
import "../styles/LayoutAlumno.css";

const LayoutAlumno = () => {
  const [modalCerrarSesion, setModalCerrarSesion] = useState(false);
  const navigate = useNavigate();

  const handleCerrarSesion = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/");
  };
  return (
    <div className="layout-alumno">
      {/* SIDEBAR */}
      <Sidebar onCerrarSesionClick={() => setModalCerrarSesion(true)} />
      {/*ZONA DERECHA */}
      <div className="right-side-al">
        {/* HEADER */}
        <Header />
        {/*CONTENIDO DINAMICO*/}
        <main className="center">
          <Outlet />
        </main>
      </div>
      {modalCerrarSesion && (
        <CerrarSesionModal
          onCancel={() => setModalCerrarSesion(false)}
          onConfirm={handleCerrarSesion}
        />
      )}
    </div>
  );
};

export default LayoutAlumno;
