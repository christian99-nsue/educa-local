import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

function CambiarPasswordForm() {
  const [passwordActual, setPasswordActual] = useState("");
  const [passwordNueva, setPasswordNueva] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [mostrarActual, setMostrarActual] = useState(false);
  const [mostrarNueva, setMostrarNueva] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  const handleGuardar = async () => {
    setError("");
    setExito("");

    if (!passwordActual || !passwordNueva || !confirmarPassword) {
      setError("Completa todos los campos");
      return;
    }
    if (passwordNueva !== confirmarPassword) {
      setError("Las contraseñas nuevas no coinciden");
      return;
    }
    if (passwordNueva.length < 6) {
      setError("La nueva contraseña debe tener al menos 6 caracteres");
      return;
    }

    setGuardando(true);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API_URL}/api/password/cambiar`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ passwordActual, passwordNueva }),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data?.error || "Error al cambiar la contraseña");

      setExito("Contraseña actualizada correctamente");
      setPasswordActual("");
      setPasswordNueva("");
      setConfirmarPassword("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cambiar la contraseña",
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="perfil-alumno-form-card">
      <h3 className="perfil-alumno-seccion-academica">Cambiar contraseña</h3>

      <label>Contraseña actual</label>
      <div className="password-input-wrapper">
        <input
          type={mostrarActual ? "text" : "password"}
          value={passwordActual}
          onChange={(e) => setPasswordActual(e.target.value)}
        />
        <span onClick={() => setMostrarActual((v) => !v)}>
          {mostrarActual ? <EyeOff size={16} /> : <Eye size={16} />}
        </span>
      </div>

      <label>Nueva contraseña</label>
      <div className="password-input-wrapper">
        <input
          type={mostrarNueva ? "text" : "password"}
          value={passwordNueva}
          onChange={(e) => setPasswordNueva(e.target.value)}
        />
        <span onClick={() => setMostrarNueva((v) => !v)}>
          {mostrarNueva ? <EyeOff size={16} /> : <Eye size={16} />}
        </span>
      </div>

      <label>Confirmar nueva contraseña</label>
      <input
        type={mostrarNueva ? "text" : "password"}
        value={confirmarPassword}
        onChange={(e) => setConfirmarPassword(e.target.value)}
      />

      {error && <p className="perfil-error">{error}</p>}
      {exito && <p className="perfil-exito">{exito}</p>}

      <button
        className="btn-actualizar-perfil-alumno"
        onClick={handleGuardar}
        disabled={guardando}
      >
        {guardando ? "Guardando..." : "Actualizar contraseña"}
      </button>
    </div>
  );
}

export default CambiarPasswordForm;
