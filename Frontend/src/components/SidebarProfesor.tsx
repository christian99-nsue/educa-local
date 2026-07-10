import { getUser } from "../utils/auth";
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
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import avatar from "../assets/images/avatar-default.png";

const SidebarProfesor = () => {
  const user = getUser();
  return (
    <div className="sidebar-profesor">
      <h2 className="logo-pf">EDUCA LOCAL</h2>
      <div className="profile-pf">
        <img src={avatar} alt="user" className="avatar-logo-pf" />
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
          className={({ isActive }) =>
            isActive ? "nav-item-pf active-pf" : "nav-item-pf"
          }
        >
          <FontAwesomeIcon icon={faHouse} />
          <span>Inicio</span>
        </NavLink>
        <NavLink
          to="asignaturas"
          className={({ isActive }) =>
            isActive ? "nav-item-pf active-pf" : "nav-item-pf"
          }
        >
          <FontAwesomeIcon icon={faBook} />
          <span>Mis asignaturas</span>
        </NavLink>
        <NavLink
          to="tareas"
          className={({ isActive }) =>
            isActive ? "nav-item-pf active-pf" : "nav-item-pf"
          }
        >
          <FontAwesomeIcon icon={faClipboardList} />
          <span>Tareas</span>
        </NavLink>
        <NavLink
          to="asistencia"
          className={({ isActive }) =>
            isActive ? "nav-item-pf active-pf" : "nav-item-pf"
          }
        >
          <FontAwesomeIcon icon={faUsers} /> <span>Asistencia</span>
        </NavLink>
        <NavLink
          to="calificaciones"
          className={({ isActive }) =>
            isActive ? "nav-item-pf active-pf" : "nav-item-pf"
          }
        >
          <FontAwesomeIcon icon={faSquarePollVertical} />
          <span>Calificaciones</span>
        </NavLink>
        <NavLink
          to="horario"
          className={({ isActive }) =>
            isActive ? "nav-item-pf active-pf" : "nav-item-pf"
          }
        >
          <FontAwesomeIcon icon={faCalendarDays} />
          <span>Horario</span>
        </NavLink>
        <NavLink
          to="perfil"
          className={({ isActive }) =>
            isActive ? "nav-item-pf active-pf" : "nav-item-pf"
          }
        >
          <FontAwesomeIcon icon={faUser} />
          <span>Perfil</span>
        </NavLink>
        <NavLink
          to="cerrar-sesion"
          className={({ isActive }) =>
            isActive ? "nav-item-pf active-pf" : "nav-item-pf"
          }
        >
          <FontAwesomeIcon icon={faArrowRightFromBracket} />
          <span>Cerrar Sesion</span>
        </NavLink>
      </nav>
    </div>
  );
};

export default SidebarProfesor;
