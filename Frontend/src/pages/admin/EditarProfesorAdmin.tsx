import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { getCentroActivo } from "../../utils/auth";
import "../../styles/adminPerfilProfesor.css";

const API_URL = import.meta.env.VITE_API_URL;

interface PerfilEditable {
  nombre: string;
  apellidos: string;
  email: string;
  telefono: string | null;
  codigo: string | null;
  estado: "activo" | "inactivo";
}

function EditarProfesorAdmin() {
  const { profesorId } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"info" | "asignaciones" | "acceso">("info");
  const [perfil, setPerfil] = useState<PerfilEditable | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      const token = localStorage.getItem("token");
      const centroActivo = getCentroActivo();
      try {
        const res = await fetch(
          `${API_URL}/api/admin/profesores/${profesorId}/perfil?centroId=${centroActivo.id}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const data = await res.json();
        if (!res.ok)
          throw new Error(data?.error || "Error al cargar el profesor");
        setPerfil({
          nombre: data.nombre,
          apellidos: data.apellidos,
          email: data.email,
          telefono: data.telefono,
          codigo: data.codigo,
          estado: data.estado,
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al cargar el profesor",
        );
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [profesorId]);

  const handleGuardar = async () => {
    if (!perfil) return;
    setGuardando(true);
    setError("");
    setExito("");
    const token = localStorage.getItem("token");
    const centroActivo = getCentroActivo();

    try {
      const res = await fetch(`${API_URL}/api/admin/profesores/${profesorId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          centroId: centroActivo.id,
          nombre: perfil.nombre,
          apellidos: perfil.apellidos,
          email: perfil.email,
          telefono: perfil.telefono,
          estado: perfil.estado,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error al guardar");
      setExito("Cambios guardados correctamente");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setGuardando(false);
    }
  };

  if (loading) return <p>Cargando profesor...</p>;
  if (error && !perfil) {
    return (
      <div className="content">
        <p>{error}</p>
      </div>
    );
  }
  if (!perfil) return null;

  return (
    <div className="content editar-profesor-admin-page">
      <div className="detalle-asig-breadcrumb">
        <span onClick={() => navigate("/admin/profesores")}>Profesores</span>
        <ChevronRight size={12} />{" "}
        <strong>
          {perfil.nombre} {perfil.apellidos}
        </strong>
      </div>
      <h1>
        Editar profesor: {perfil.nombre} {perfil.apellidos}
      </h1>

      <div className="editar-profesor-tabs">
        <button
          className={tab === "info" ? "activo" : ""}
          onClick={() => setTab("info")}
        >
          Informacion
        </button>
        <button
          className={tab === "asignaciones" ? "activo" : ""}
          onClick={() => setTab("asignaciones")}
        >
          Asignaciones
        </button>
        <button
          className={tab === "acceso" ? "activo" : ""}
          onClick={() => setTab("acceso")}
        >
          Acceso
        </button>
      </div>

      {tab === "info" && (
        <div className="ppa-card">
          <h3>Informacion personal</h3>

          <div className="editar-profesor-grid-2">
            <div>
              <label className="modal-label">Nombre *</label>
              <input
                className="modal-input"
                value={perfil.nombre}
                onChange={(e) =>
                  setPerfil({ ...perfil, nombre: e.target.value })
                }
              />
            </div>
            <div>
              <label className="modal-label">Apellidos *</label>
              <input
                className="modal-input"
                value={perfil.apellidos}
                onChange={(e) =>
                  setPerfil({ ...perfil, apellidos: e.target.value })
                }
              />
            </div>
            <div>
              <label className="modal-label">Correo electronico *</label>
              <input
                className="modal-input"
                type="email"
                value={perfil.email}
                onChange={(e) =>
                  setPerfil({ ...perfil, email: e.target.value })
                }
              />
            </div>
            <div>
              <label className="modal-label">Telefono</label>
              <input
                className="modal-input"
                value={perfil.telefono ?? ""}
                onChange={(e) =>
                  setPerfil({ ...perfil, telefono: e.target.value })
                }
              />
            </div>
            <div>
              <label className="modal-label">Codigo de profesor *</label>
              <input
                className="modal-input"
                value={perfil.codigo ?? ""}
                disabled
              />
            </div>
            <div>
              <label className="modal-label">Estado *</label>
              <select
                className="modal-select"
                value={perfil.estado}
                onChange={(e) =>
                  setPerfil({
                    ...perfil,
                    estado: e.target.value as "activo" | "inactivo",
                  })
                }
              >
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>
          </div>

          {error && <p className="perfil-error">{error}</p>}
          {exito && <p className="perfil-exito">{exito}</p>}

          <div className="modal-botones">
            <button
              className="modal-btn-cancelar"
              onClick={() => navigate(`/admin/profesores/${profesorId}`)}
            >
              Cancelar
            </button>
            <button
              className="btn-guardar-verde"
              onClick={handleGuardar}
              disabled={guardando}
            >
              {guardando ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </div>
      )}

      {tab === "asignaciones" && (
        <div className="ppa-card">
          <p className="material-vacio">
            Pestaña de Asignaciones — la construimos en el siguiente paso.
          </p>
        </div>
      )}

      {tab === "acceso" && (
        <div className="ppa-card">
          <p className="material-vacio">
            Pestaña de Acceso — la construimos mas adelante.
          </p>
        </div>
      )}
    </div>
  );
}

export default EditarProfesorAdmin;
