import { getUser } from "../utils/auth";
import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState, useEffect } from "react";
import avatar from "../assets/images/avatar-default.png";
import {
  faHouse,
  faBook,
  faClipboardList,
  faSquarePollVertical,
  faCalendarDays,
  faUser,
  faArrowRightFromBracket,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";

interface SidebarProfesorProps {
  onCerrarSesionClick: () => void;
  abierto: boolean;
  onClose: () => void;
}
const SidebarProfesor = ({
  onCerrarSesionClick,
  abierto,
  onClose,
}: SidebarProfesorProps) => {
  const [user, setUser] = useState(getUser());

  useEffect(() => {
    const actualizar = () => setUser(getUser());
    window.addEventListener("perfil-actualizado", actualizar);
    return () => window.removeEventListener("perfil-actualizado", actualizar);
  }, []);

  return (
    <div className={`sidebar-profesor ${abierto ? "abierta" : ""}`}>
      <h2 className="logo-pf">EDUCA LOCAL</h2>
      <div className="profile-pf">
        <img
          src={user?.foto_url || avatar}
          alt="user"
          className="avatar-logo-pf"
        />
        <p>
          Nombre: {user?.nombre} <br /> Apellidos: {user?.apellidos} <br /> Rol:
          &nbsp;
          {user?.rol_en_centro}
        </p>
      </div>
      <h3 className="menu-title-pf">Menu</h3>
      <nav>
        <NavLink
          to="/profesor"
          end
          onClick={onClose}
          className={({ isActive }) =>
            isActive ? "nav-item-pf active-pf" : "nav-item-pf"
          }
        >
          <FontAwesomeIcon icon={faHouse} />
          <span>Inicio</span>
        </NavLink>
        <NavLink
          to="asignaturas"
          onClick={onClose}
          className={({ isActive }) =>
            isActive ? "nav-item-pf active-pf" : "nav-item-pf"
          }
        >
          <FontAwesomeIcon icon={faBook} />
          <span>Mis asignaturas</span>
        </NavLink>
        <NavLink
          to="tareas"
          onClick={onClose}
          className={({ isActive }) =>
            isActive ? "nav-item-pf active-pf" : "nav-item-pf"
          }
        >
          <FontAwesomeIcon icon={faClipboardList} />
          <span>Tareas</span>
        </NavLink>
        <NavLink
          to="asistencia"
          onClick={onClose}
          className={({ isActive }) =>
            isActive ? "nav-item-pf active-pf" : "nav-item-pf"
          }
        >
          <FontAwesomeIcon icon={faUsers} /> <span>Asistencia</span>
        </NavLink>
        <NavLink
          to="calificaciones"
          onClick={onClose}
          className={({ isActive }) =>
            isActive ? "nav-item-pf active-pf" : "nav-item-pf"
          }
        >
          <FontAwesomeIcon icon={faSquarePollVertical} />
          <span>Calificaciones</span>
        </NavLink>
        <NavLink
          to="horario"
          onClick={onClose}
          className={({ isActive }) =>
            isActive ? "nav-item-pf active-pf" : "nav-item-pf"
          }
        >
          <FontAwesomeIcon icon={faCalendarDays} />
          <span>Horario</span>
        </NavLink>
        <NavLink
          to="perfil"
          onClick={onClose}
          className={({ isActive }) =>
            isActive ? "nav-item-pf active-pf" : "nav-item-pf"
          }
        >
          <FontAwesomeIcon icon={faUser} />
          <span>Perfil</span>
        </NavLink>
        <button
          className="nav-item-pf nav-item-btn"
          onClick={onCerrarSesionClick}
        >
          <FontAwesomeIcon icon={faArrowRightFromBracket} />
          <span>Cerrar Sesion</span>
        </button>
      </nav>
    </div>
  );
};

export default SidebarProfesor;
