import { useLocation, useNavigate } from "react-router-dom";
import SelectCenter from "./SelectCentro";

interface CentroRaw {
  id?: number;
  centro_id?: number;
  nombre?: string;
  centro_nombre?: string;
  rol?: string;
  rol_en_centro?: string;
  logo?: string;
}

export default function SelectCenterPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const centros = (state?.centros ?? []).map((c: CentroRaw) => ({
    ...c,
    nombre: c.centro_nombre ?? c.nombre,
    id: c.centro_id ?? c.id,
    rol: c.rol_en_centro ?? c.rol ?? "alumno",
  }));

  return (
    <SelectCenter
      centros={centros}
      userName={state?.user?.nombre}
      onSelect={(centro) => {
        const rol = centro.rol_en_centro ?? centro.rol ?? "alumno";

        localStorage.setItem("centroActivo", JSON.stringify(centro));

        const existingUser = JSON.parse(localStorage.getItem("user") || "{}");
        const fullUser = {
          ...(state?.user ?? existingUser),
          rol_en_centro: rol,
          centro: { nombre: centro.nombre },
        };
        localStorage.setItem("user", JSON.stringify(fullUser));

        if (rol === "admin") navigate("/admin");
        else if (rol === "profesor") navigate("/profesor");
        else navigate("/alumno");
      }}
    />
  );
}
