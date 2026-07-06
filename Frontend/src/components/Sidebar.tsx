import { getUser } from "../utils/auth";
import { getCentroActivo } from "../utils/auth";
import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faBook,
  faClipboardList,
  faSquarePollVertical,
  faCalendarDays,
  faUser,
  faArrowRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import avatar from "../assets/images/avatar-default.png";

const Sidebar = () => {
  const user = getUser();
  const centroActivo = getCentroActivo();
  return (
    <div className="sidebar">
      <h2 className="logo">EDUCA LOCAL</h2>
      <div className="profile">
        <img src={avatar} alt="user" className="avatar-logo" />
        <p>
          Nombre: {user?.nombre} <br /> Apellidos: {user?.apellidos} <br /> Rol:
          &nbsp;
          {user?.rol_en_centro} <br /> Curso: {centroActivo?.nombre_del_curso}
        </p>
      </div>
      <h3 className="menu-title">Menu</h3>
      <nav>
        <NavLink
          to="/alumno"
          end
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <FontAwesomeIcon icon={faHouse} />
          <span>Inicio</span>
        </NavLink>
        <NavLink
          to="asignaturas"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <FontAwesomeIcon icon={faBook} />
          <span>Mis asignaturas</span>
        </NavLink>
        <NavLink
          to="tareas"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <FontAwesomeIcon icon={faClipboardList} />
          <span>Tareas</span>
        </NavLink>
        <NavLink
          to="calificaciones"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <FontAwesomeIcon icon={faSquarePollVertical} />
          <span>Calificaciones</span>
        </NavLink>
        <NavLink
          to="horario"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <FontAwesomeIcon icon={faCalendarDays} />
          <span>Horario</span>
        </NavLink>
        <NavLink
          to="perfil"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <FontAwesomeIcon icon={faUser} />
          <span>Perfil</span>
        </NavLink>
        <NavLink
          to="cerrar-sesion"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <FontAwesomeIcon icon={faArrowRightFromBracket} />
          <span>Cerrar Sesion</span>
        </NavLink>
      </nav>
    </div>
  );
};

export default Sidebar;
