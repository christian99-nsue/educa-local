import { getUser } from "../utils/auth";
import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState, useEffect } from "react";
import avatar from "../assets/images/avatar-default.png";
import {
  faHouse,
  faCalendarDays,
  faUser,
  faUsers,
  faLayerGroup,
  faGear,
  faArrowRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";

interface SidebarAdminProps {
  onCerrarSesionClick: () => void;
}
const SidebarAdmin = ({ onCerrarSesionClick }: SidebarAdminProps) => {
  const [user, setUser] = useState(getUser());

  useEffect(() => {
    const actualizar = () => setUser(getUser());
    window.addEventListener("perfil-actualizado", actualizar);
    return () => window.removeEventListener("perfil-actualizado", actualizar);
  }, []);

  return (
    <div className="sidebar-admin">
      <h2 className="logo-ad">EDUCA LOCAL</h2>
      <div className="profile-ad">
        <img
          src={user?.foto_url || avatar}
          alt="user"
          className="avatar-logo-ad"
        />
        <p>
          Nombre: {user?.nombre} <br /> Apellidos: {user?.apellidos} <br /> Rol:
          &nbsp;
          {user?.rol_en_centro}
        </p>
      </div>
      <h3 className="menu-title-ad">Menu</h3>
      <nav>
        <NavLink
          to="/admin"
          end
          className={({ isActive }) =>
            isActive ? "nav-item-ad active-ad" : "nav-item-ad"
          }
        >
          <FontAwesomeIcon icon={faHouse} />
          <span>Inicio</span>
        </NavLink>
        <NavLink
          to="alumnos"
          className={({ isActive }) =>
            isActive ? "nav-item-ad active-ad" : "nav-item-ad"
          }
        >
          <FontAwesomeIcon icon={faUsers} />
          <span>Alumnos</span>
        </NavLink>
        <NavLink
          to="profesores"
          className={({ isActive }) =>
            isActive ? "nav-item-ad active-ad" : "nav-item-ad"
          }
        >
          <FontAwesomeIcon icon={faUser} />
          <span>Profesores</span>
        </NavLink>
        <NavLink
          to="Cursos"
          className={({ isActive }) =>
            isActive ? "nav-item-ad active-ad" : "nav-item-ad"
          }
        >
          <FontAwesomeIcon icon={faLayerGroup} /> <span>Cursos</span>
        </NavLink>

        <NavLink
          to="horario"
          className={({ isActive }) =>
            isActive ? "nav-item-ad active-ad" : "nav-item-ad"
          }
        >
          <FontAwesomeIcon icon={faCalendarDays} />
          <span>Horario</span>
        </NavLink>
        <NavLink
          to="ajustes"
          className={({ isActive }) =>
            isActive ? "nav-item-ad active-ad" : "nav-item-ad"
          }
        >
          <FontAwesomeIcon icon={faGear} />
          <span>Ajustes</span>
        </NavLink>
        <button
          className="nav-item-ad nav-item-btn"
          onClick={onCerrarSesionClick}
        >
          <FontAwesomeIcon icon={faArrowRightFromBracket} />
          <span>Cerrar Sesion</span>
        </button>
      </nav>
    </div>
  );
};

export default SidebarAdmin;
