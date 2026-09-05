import { Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import BottomNav from "../components/BottomNav";
import CerrarSesionModal from "../components/CerrarSesionModal";
import { clearSecureStorage } from "../utils/secureStorage";
import "../styles/alumno/LayoutAlumno.css";

const LayoutAlumno = () => {
  const [modalCerrarSesion, setModalCerrarSesion] = useState(false);
  const [sidebarAbierto, setSidebarAbierto] = useState(false);
  const navigate = useNavigate();

  const handleCerrarSesion = () => {
    clearSecureStorage();
    localStorage.clear();
    sessionStorage.clear();
    navigate("/");
  };

  return (
    <div className="layout-alumno">
      {/* SIDEBAR */}
      <Sidebar
        onCerrarSesionClick={() => setModalCerrarSesion(true)}
        abierto={sidebarAbierto}
        onClose={() => setSidebarAbierto(false)}
      />

      {sidebarAbierto && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarAbierto(false)}
        />
      )}

      {/*ZONA DERECHA */}
      <div className="right-side-al">
        {/* HEADER */}
        <Header onMenuClick={() => setSidebarAbierto((v) => !v)} />
        {/*CONTENIDO DINAMICO*/}
        <main className="center">
          <Outlet />
        </main>
      </div>

      {/* BARRA INFERIOR SOLO EN MOVIL */}
      <BottomNav onMasClick={() => setSidebarAbierto(true)} />

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
