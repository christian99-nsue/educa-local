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
        localStorage.setItem("centroActivo", JSON.stringify(centro));
        const rol = centro.rol_en_centro ?? centro.rol ?? "alumno";
        if (rol === "admin") navigate("/admin/dashboard");
        else if (rol === "profesor") navigate("/profesor/dashboard");
        else navigate("/alumno/dashboard");
      }}
    />
  );
}
