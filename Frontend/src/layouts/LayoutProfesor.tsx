import { Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import CerrarSesionModal from "../components/CerrarSesionModal";
import SidebarProfesor from "../components/SidebarProfesor";
import Header from "../components/Header";
import "../styles/LayoutProfesor.css";

const LayoutProfesor = () => {
  const [modalCerrarSesion, setModalCerrarSesion] = useState(false);
  const navigate = useNavigate();

  const handleCerrarSesion = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/");
  };

  return (
    <div className="layout-profesor">
      {/* SIDEBAR */}
      <SidebarProfesor onCerrarSesionClick={() => setModalCerrarSesion(true)} />
      {/*ZONA DERECHA */}
      <div className="right-side">
        {/* HEADER */}
        <Header />
        {/*CONTENIDO DINAMICO*/}
        <main className="center-pf">
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

export default LayoutProfesor;
