import { getUser } from "../utils/auth";
import avatar from "../assets/images/avatar-default.png";
import { useState, useEffect } from "react";
import NotificacionesDropdown from "./NotificacionesDropdown";
import { ChevronDown } from "lucide-react";

const Header = () => {
  const [user, setUser] = useState(getUser());

  useEffect(() => {
    const actualizar = () => setUser(getUser());
    window.addEventListener("perfil-actualizado", actualizar);
    return () => window.removeEventListener("perfil-actualizado", actualizar);
  }, []);

  return (
    <div className="header">
      <div className="header-left">{user?.centro?.nombre} </div>
      <div className="header-right">
        <span>
          <NotificacionesDropdown />
        </span>
        <span className="header-perfil">
          <img src={user?.foto_url || avatar} alt="user" className="avatar" />
          {user?.nombre} <br /> {user?.rol_en_centro} <ChevronDown size={12} />
        </span>
      </div>
    </div>
  );
};

export default Header;
