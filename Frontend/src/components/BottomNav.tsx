import { NavLink } from "react-router-dom";
import {
  Home,
  BookOpen,
  ClipboardList,
  BarChart2,
  MoreHorizontal,
} from "lucide-react";

interface BottomNavProps {
  onMasClick: () => void;
}

const BottomNav = ({ onMasClick }: BottomNavProps) => {
  return (
    <nav className="bottom-nav">
      <NavLink
        to="/alumno"
        end
        className={({ isActive }) =>
          isActive ? "bottom-nav-item active" : "bottom-nav-item"
        }
      >
        <Home size={18} />
        <span>Inicio</span>
      </NavLink>

      <NavLink
        to="asignaturas"
        className={({ isActive }) =>
          isActive ? "bottom-nav-item active" : "bottom-nav-item"
        }
      >
        <BookOpen size={18} />
        <span>Asignaturas</span>
      </NavLink>

      <NavLink
        to="tareas"
        className={({ isActive }) =>
          isActive ? "bottom-nav-item active" : "bottom-nav-item"
        }
      >
        <ClipboardList size={18} />
        <span>Tareas</span>
      </NavLink>

      <NavLink
        to="calificaciones"
        className={({ isActive }) =>
          isActive ? "bottom-nav-item active" : "bottom-nav-item"
        }
      >
        <BarChart2 size={18} />
        <span>Notas</span>
      </NavLink>

      <button className="bottom-nav-item" onClick={onMasClick}>
        <MoreHorizontal size={18} />
        <span>Más</span>
      </button>
    </nav>
  );
};

export default BottomNav;
