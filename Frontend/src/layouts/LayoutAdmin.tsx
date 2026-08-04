import { Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import CerrarSesionModal from "../components/CerrarSesionModal";
import SidebarAdmin from "../components/SidebarAdmin";
import Header from "../components/Header";
import "../styles/LayoutAdmin.css";

const LayoutAdmin = () => {
  const [modalCerrarSesion, setModalCerrarSesion] = useState(false);
  const navigate = useNavigate();

  const handleCerrarSesion = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/");
  };

  return (
    <div className="layout-admin">
      {/* SIDEBAR */}
      <SidebarAdmin onCerrarSesionClick={() => setModalCerrarSesion(true)} />
      {/*ZONA DERECHA */}
      <div className="right-side">
        {/* HEADER */}
        <Header />
        {/*CONTENIDO DINAMICO*/}
        <main className="center-ad">
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

export default LayoutAdmin;
