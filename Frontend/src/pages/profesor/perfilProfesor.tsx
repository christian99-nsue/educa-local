import { useEffect, useRef, useState } from "react";
import { Camera } from "lucide-react";
import avatarDefault from "../../assets/images/avatar-default.png";
import { getUser } from "../../utils/auth";
import "../../styles/perfilProfesor.css";

const API_URL = import.meta.env.VITE_API_URL;

interface PerfilData {
  nombre: string;
  apellidos: string;
  email: string;
  telefono: string;
  foto_url: string | null;
}

function PerfilProfesor() {
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
      try {
        const res = await fetch(`${API_URL}/api/profesor/perfil`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error || "Error al cargar el perfil");
        }
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
      const res = await fetch(`${API_URL}/api/profesor/perfil`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Error al actualizar la foto");
      }

      setPerfil(data);
      setFotoPreview(null);

      const usuarioActual = getUser();
      const usuarioActualizado = {
        ...usuarioActual,
        foto_url: data.foto_url,
      };
      localStorage.setItem("user", JSON.stringify(usuarioActualizado));
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
      const res = await fetch(`${API_URL}/api/profesor/perfil`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Error al actualizar el perfil");
      }

      setPerfil(data);

      const usuarioActual = getUser();
      const usuarioActualizado = {
        ...usuarioActual,
        nombre: data.nombre,
        apellidos: data.apellidos,
      };
      localStorage.setItem("user", JSON.stringify(usuarioActualizado));

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
      <div className="content-pf">
        <p>{error || "No se pudo cargar el perfil"}</p>
      </div>
    );
  }

  return (
    <div className="content-pf perfil-page">
      <h1>Mi perfil</h1>
      <p className="subtitle">Informacion de tu cuenta.</p>

      <div className="perfil-avatar-wrapper">
        <div className="perfil-avatar-container">
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

      <div className="perfil-form">
        <label>Nombre</label>
        <input
          value={perfil.nombre}
          onChange={(e) => {
            setPerfil({ ...perfil, nombre: e.target.value });
          }}
        />
        <label>Apellidos</label>
        <input
          value={perfil.apellidos}
          onChange={(e) => {
            setPerfil({
              ...perfil,
              apellidos: e.target.value,
            });
          }}
        />

        <label>Email</label>
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

        {error && <p className="perfil-error">{error}</p>}
        {exito && <p className="perfil-exito">{exito}</p>}

        <button
          className="btn-actualizar-perfil"
          onClick={handleGuardar}
          disabled={guardando}
        >
          {guardando ? "Guardando..." : "Actualizar informacion"}
        </button>
      </div>
    </div>
  );
}

export default PerfilProfesor;
