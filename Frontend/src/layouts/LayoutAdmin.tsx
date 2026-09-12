import { Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import CerrarSesionModal from "../components/CerrarSesionModal";
import SidebarAdmin from "../components/SidebarAdmin";
import Header from "../components/Header";
import BottomNavAdmin from "../components/BottomNavAdmin";
import { clearSecureStorage } from "../utils/secureStorage";
import "../styles/admin/LayoutAdmin.css";

const LayoutAdmin = () => {
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
    <div className="layout-admin">
      {/* SIDEBAR */}
      <SidebarAdmin
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
      <BottomNavAdmin onMasClick={() => setSidebarAbierto(true)} />

      {modalCerrarSesion && (
        <CerrarSesionModal
          onCancel={() => setModalCerrarSesion(false)}
          onConfirm={handleCerrarSesion}
        />
      )}
    </div>
  );
};

export default LayoutAdmin;
