import { NavLink } from "react-router-dom";
import { Home, User, Layers, MoreHorizontal, Users } from "lucide-react";

interface BottomNavProps {
  onMasClick: () => void;
}

const BottomNavAdmin = ({ onMasClick }: BottomNavProps) => {
  return (
    <nav className="bottom-nav">
      <NavLink
        to="/admin"
        end
        className={({ isActive }) =>
          isActive ? "bottom-nav-item-ad active-ad" : "bottom-nav-item-ad"
        }
      >
        <Home size={18} />
        <span>Inicio</span>
      </NavLink>

      <NavLink
        to="alumnos"
        className={({ isActive }) =>
          isActive ? "bottom-nav-item-ad active-ad" : "bottom-nav-item-ad"
        }
      >
        <Users size={18} />
        <span>Alumnos</span>
      </NavLink>

      <NavLink
        to="profesores"
        className={({ isActive }) =>
          isActive ? "bottom-nav-item-ad active-ad" : "bottom-nav-item-ad"
        }
      >
        <User size={18} />
        <span>Profesores</span>
      </NavLink>

      <NavLink
        to="cursos"
        className={({ isActive }) =>
          isActive ? "bottom-nav-item-ad active-ad" : "bottom-nav-item-ad"
        }
      >
        <Layers size={18} />
        <span>Cursos</span>
      </NavLink>

      <button className="bottom-nav-item-ad" onClick={onMasClick}>
        <MoreHorizontal size={18} />
        <span>Más</span>
      </button>
    </nav>
  );
};

export default BottomNavAdmin;
