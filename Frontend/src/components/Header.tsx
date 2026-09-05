import { getUser } from "../utils/auth";
import avatar from "../assets/images/avatar-default.png";
import { useEffect, useRef, useState } from "react";
import NotificacionesDropdown from "./NotificacionesDropdown";
import { ChevronDown, User, LogOut, Settings, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";

import CerrarSesionModal from "./CerrarSesionModal";

interface HeaderProps {
  onMenuClick: () => void;
}

const Header = ({ onMenuClick }: HeaderProps) => {
  const user = getUser();
  const [modalCerrarSesion, setModalCerrarSesion] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const manejarClickFuera = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuAbierto(false);
      }
    };

    document.addEventListener("mousedown", manejarClickFuera);

    return () => {
      document.removeEventListener("mousedown", manejarClickFuera);
    };
  }, []);

  return (
    <div className="header">
      <div className="header-brand">
        <button
          className="menu-toggle"
          onClick={onMenuClick}
          aria-label="Abrir menú"
        >
          <Menu size={20} />
        </button>
        <div className="header-left">{user?.centro?.nombre}</div>
      </div>
      <div className="header-right" ref={menuRef}>
        {" "}
        <span>
          <NotificacionesDropdown />
        </span>
        <span
          className="header-perfil"
          onClick={() => setMenuAbierto((v) => !v)}
        >
          <img src={user?.foto_url || avatar} alt="user" className="avatar" />
          <small>
            <strong>{user?.nombre}</strong> <br /> {user?.rol_en_centro}
          </small>
          <ChevronDown size={12} />
        </span>
        {menuAbierto && (
          <div className="header-user-dropdown">
            {user?.rol_en_centro === "admin" ? (
              <button
                onClick={() => {
                  navigate(`/${user?.rol_en_centro}/ajustes`);
                  setMenuAbierto(false);
                }}
              >
                <Settings size={14} /> Ajustes
              </button>
            ) : (
              <button
                onClick={() => {
                  navigate(`/${user?.rol_en_centro}/perfil`);
                  setMenuAbierto(false);
                }}
              >
                {" "}
                <User size={14} /> Perfil
              </button>
            )}
            <button
              className="header-dropdown-cerrar"
              onClick={() => {
                setModalCerrarSesion(true);
                setMenuAbierto(false);
              }}
            >
              <LogOut size={14} /> Cerrar sesion
            </button>
          </div>
        )}
        {modalCerrarSesion && (
          <CerrarSesionModal
            onCancel={() => setModalCerrarSesion(false)}
            onConfirm={() => {
              localStorage.clear();
              sessionStorage.clear();
              navigate("/");
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Header;
