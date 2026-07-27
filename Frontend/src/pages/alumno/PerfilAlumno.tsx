import { useEffect, useRef, useState } from "react";
import { Camera } from "lucide-react";
import avatarDefault from "../../assets/images/avatar-default.png";
import { getUser, getCentroActivo } from "../../utils/auth";
import "../../styles/perfilAlumno.css";

const API_URL = import.meta.env.VITE_API_URL;

interface PerfilData {
  nombre: string;
  apellidos: string;
  email: string;
  telefono: string;
  foto_url: string | null;
  centro: string | null;
  curso: string | null;
  rama: string | null;
  codigoEstudiante: string | null;
}

function PerfilAlumno() {
  const [perfil, setPerfil] = useState<PerfilData | null>(null);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const inputFotoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const cargarPerfil = async () => {
      const token = localStorage.getItem("token");
      const centroActivo = getCentroActivo();
      try {
        const res = await fetch(
          `${API_URL}/api/alumno/perfil?centroId=${centroActivo.id}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const data = await res.json();
        if (!res.ok)
          throw new Error(data?.error || "Error al cargar el perfil");
        setPerfil(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al cargar el perfil",
        );
      } finally {
        setLoading(false);
      }
    };
    cargarPerfil();
  }, []);

  const handleFotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !perfil) return;

    setFotoPreview(URL.createObjectURL(file));
    setSubiendoFoto(true);
    setError("");
    setExito("");

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("nombre", perfil.nombre);
    formData.append("apellidos", perfil.apellidos || "");
    formData.append("email", perfil.email);
    formData.append("telefono", perfil.telefono || "");
    formData.append("foto", file);

    try {
      const res = await fetch(`${API_URL}/api/alumno/perfil`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data?.error || "Error al actualizar la foto");

      setPerfil((prev) => (prev ? { ...prev, foto_url: data.foto_url } : prev));
      setFotoPreview(null);

      const usuarioActual = getUser();
      localStorage.setItem(
        "user",
        JSON.stringify({ ...usuarioActual, foto_url: data.foto_url }),
      );
      window.dispatchEvent(new Event("perfil-actualizado"));

      setExito("Foto de perfil actualizada");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al actualizar la foto",
      );
      setFotoPreview(null);
    } finally {
      setSubiendoFoto(false);
    }
  };

  const handleGuardar = async () => {
    if (!perfil) return;
    setGuardando(true);
    setError("");
    setExito("");

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("nombre", perfil.nombre);
    formData.append("apellidos", perfil.apellidos || "");
    formData.append("email", perfil.email);
    formData.append("telefono", perfil.telefono || "");

    try {
      const res = await fetch(`${API_URL}/api/alumno/perfil`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data?.error || "Error al actualizar el perfil");

      setPerfil((prev) => (prev ? { ...prev, ...data } : prev));

      const usuarioActual = getUser();
      localStorage.setItem(
        "user",
        JSON.stringify({
          ...usuarioActual,
          nombre: data.nombre,
          apellidos: data.apellidos,
        }),
      );

      setExito("Perfil actualizado correctamente");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al actualizar el perfil",
      );
    } finally {
      setGuardando(false);
    }
  };

  if (loading) return <p>Cargando perfil...</p>;
  if (!perfil) {
    return (
      <div className="content">
        <p>{error || "No se pudo cargar el perfil"}</p>
      </div>
    );
  }

  return (
    <div className="content perfil-alumno-page">
      <h1>Perfil</h1>
      <p className="subtitle">Consulta y actualiza tu informacion personal</p>

      <div className="perfil-alumno-layout">
        <div className="perfil-alumno-form-card">
          <h3>Informacion personal</h3>

          <label>Nombre</label>
          <input
            value={perfil.nombre}
            onChange={(e) => setPerfil({ ...perfil, nombre: e.target.value })}
          />

          <label>Apellidos</label>
          <input
            value={perfil.apellidos || ""}
            onChange={(e) =>
              setPerfil({ ...perfil, apellidos: e.target.value })
            }
          />

          <label>Correo electronico</label>
          <input
            type="email"
            value={perfil.email}
            onChange={(e) => setPerfil({ ...perfil, email: e.target.value })}
          />

          <label>Telefono</label>
          <input
            value={perfil.telefono || ""}
            onChange={(e) => setPerfil({ ...perfil, telefono: e.target.value })}
          />

          <h3 className="perfil-alumno-seccion-academica">
            Informacion academica
          </h3>

          <div className="perfil-group">
            <label>Centro</label>
            <span className="perfil-alumno-valor">{perfil.centro ?? "-"}</span>
          </div>
          <div className="perfil-group">
            <label>Curso</label>
            <span className="perfil-alumno-valor">{perfil.curso ?? "-"}</span>
          </div>
          <div className="perfil-group">
            <label>Rama</label>
            <span className="perfil-alumno-valor">{perfil.rama ?? "-"}</span>
          </div>

          <div className="perfil-group">
            <label>Codigo de estudiante</label>
            <span className="perfil-alumno-valor">
              {perfil.codigoEstudiante ?? "-"}
            </span>
          </div>

          {error && <p className="perfil-error">{error}</p>}
          {exito && <p className="perfil-exito">{exito}</p>}

          <button
            className="btn-actualizar-perfil-alumno"
            onClick={handleGuardar}
            disabled={guardando}
          >
            {guardando ? "Guardando..." : "Actualizar informacion"}
          </button>
        </div>

        <div className="perfil-alumno-foto-card">
          <div className="perfil-avatar-container-alumno">
            <img
              src={fotoPreview || perfil.foto_url || avatarDefault}
              alt="avatar"
              className="perfil-avatar-img"
            />
            <button
              className="perfil-avatar-boton-camara"
              onClick={() => inputFotoRef.current?.click()}
              disabled={subiendoFoto}
              title="Cambiar foto"
            >
              <Camera size={16} />
            </button>
            <input
              type="file"
              accept="image/jpeg,image/png"
              ref={inputFotoRef}
              style={{ display: "none" }}
              onChange={handleFotoChange}
            />
          </div>
          {subiendoFoto && (
            <p className="perfil-subiendo-texto">Subiendo foto...</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default PerfilAlumno;
