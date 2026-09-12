import { Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import CerrarSesionModal from "../components/CerrarSesionModal";
import SidebarProfesor from "../components/SidebarProfesor";
import Header from "../components/Header";
import BottomNavProfesor from "../components/BottomNavProfesor";
import { clearSecureStorage } from "../utils/secureStorage";
import "../styles/profesor/LayoutProfesor.css";

const LayoutProfesor = () => {
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
    <div className="layout-profesor">
      {/* SIDEBAR */}
      <SidebarProfesor
        abierto={sidebarAbierto}
        onClose={() => setSidebarAbierto(false)}
        onCerrarSesionClick={() => setModalCerrarSesion(true)}
      />

      {sidebarAbierto && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarAbierto(false)}
        />
      )}
      {/*ZONA DERECHA */}
      <div className="right-side">
        {/* HEADER */}
        <Header onMenuClick={() => setSidebarAbierto((v) => !v)} />
        {/*CONTENIDO DINAMICO*/}
        <main className="center">
          <Outlet />
        </main>
      </div>

      {/* BARRA INFERIOR SOLO EN MOVIL */}
      <BottomNavProfesor onMasClick={() => setSidebarAbierto(true)} />

      {modalCerrarSesion && (
        <CerrarSesionModal
          onCancel={() => setModalCerrarSesion(false)}
          onConfirm={handleCerrarSesion}
        />
      )}
    </div>
  );
};

export default LayoutProfesor;
