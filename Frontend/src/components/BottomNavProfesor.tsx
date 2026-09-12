import { NavLink } from "react-router-dom";
import {
  Home,
  BookOpen,
  ClipboardList,
  MoreHorizontal,
  Users,
} from "lucide-react";

interface BottomNavProps {
  onMasClick: () => void;
}

const BottomNavProfesor = ({ onMasClick }: BottomNavProps) => {
  return (
    <nav className="bottom-nav">
      <NavLink
        to="/profesor"
        end
        className={({ isActive }) =>
          isActive ? "bottom-nav-item-pf active-pf" : "bottom-nav-item-pf"
        }
      >
        <Home size={18} />
        <span>Inicio</span>
      </NavLink>

      <NavLink
        to="asignaturas"
        className={({ isActive }) =>
          isActive ? "bottom-nav-item-pf active-pf" : "bottom-nav-item-pf"
        }
      >
        <BookOpen size={18} />
        <span>Asignaturas</span>
      </NavLink>

      <NavLink
        to="tareas"
        className={({ isActive }) =>
          isActive ? "bottom-nav-item-pf active-pf" : "bottom-nav-item-pf"
        }
      >
        <ClipboardList size={18} />
        <span>Tareas</span>
      </NavLink>

      <NavLink
        to="asistencia"
        className={({ isActive }) =>
          isActive ? "bottom-nav-item-pf active-pf" : "bottom-nav-item-pf"
        }
      >
        <Users size={18} />
        <span>Asistencia</span>
      </NavLink>

      <button className="bottom-nav-item-pf" onClick={onMasClick}>
        <MoreHorizontal size={18} />
        <span>Más</span>
      </button>
    </nav>
  );
};

export default BottomNavProfesor;
