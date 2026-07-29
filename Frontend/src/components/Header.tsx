import { getUser } from "../utils/auth";
import avatar from "../assets/images/avatar-default.png";
import { useState, useEffect } from "react";
import NotificacionesDropdown from "./NotificacionesDropdown";
import { ChevronDown, User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CerrarSesionModal from "./CerrarSesionModal";

const Header = () => {
  const [user, setUser] = useState(getUser());
  const [modalCerrarSesion, setModalCerrarSesion] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const actualizar = () => setUser(getUser());
    window.addEventListener("perfil-actualizado", actualizar);
    return () => window.removeEventListener("perfil-actualizado", actualizar);
  }, []);

  useEffect(() => {
    const cerrar = () => setMenuAbierto(false);
    if (menuAbierto) document.addEventListener("click", cerrar);
    return () => document.removeEventListener("click", cerrar);
  }, [menuAbierto]);

  return (
    <div className="header">
      <div className="header-left">{user?.centro?.nombre} </div>
      <div className="header-right" onClick={(e) => e.stopPropagation()}>
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
            <button
              onClick={() => {
                navigate(`/${user?.rol_en_centro}/perfil`);
                setMenuAbierto(false);
              }}
            >
              <User size={14} />
              Perfil
            </button>
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
