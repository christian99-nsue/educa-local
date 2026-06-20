import { useNavigate } from "react-router-dom";

const SelectCentro = () => {
  const navigate = useNavigate();

  const centros = JSON.parse(localStorage.getItem("centros") || "[]");

  const handleSelect = (centro: any) => {
    // Guardar centro activo
    localStorage.setItem("centroActivo", JSON.stringify(centro));

    // 🔥 Redirección por rol
    if (centro.rol === "admin") navigate("/admin/dashboard");
    else if (centro.rol === "profesor") navigate("/profesor/dashboard");
    else navigate("/alumno/dashboard");
  };

  return (
    <div>
      <h2>Selecciona un centro</h2>

      {centros.map((centro: any) => (
        <div key={centro.centro_id}>
          <p>{centro.centro_nombre}</p>
          <button onClick={() => handleSelect(centro)}>Entrar</button>
        </div>
      ))}
    </div>
  );
};

export default SelectCentro;
