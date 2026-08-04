import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import avatarDefault from "../../assets/images/avatar-default.png";
import { getCentroActivo } from "../../utils/auth";
import { ChevronRight } from "lucide-react";
import "../../styles/adminAlumnos.css";

const API_URL = import.meta.env.VITE_API_URL;

interface AlumnoDetalle {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  telefono: string | null;
  codigo: string | null;
  fotoUrl: string | null;
  curso: string | null;
  rama: string | null;
  nivel: string | null;
}

function DetalleAlumnoAdmin() {
  const { alumnoId } = useParams();
  const [searchParams] = useSearchParams();
  const modoEdicion = searchParams.get("editar") === "1";
  const navigate = useNavigate();

  const [alumno, setAlumno] = useState<AlumnoDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      const token = localStorage.getItem("token");
      const centroActivo = getCentroActivo();
      try {
        const res = await fetch(
          `${API_URL}/api/admin/alumnos/${alumnoId}/detalle?centroId=${centroActivo.id}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const data = await res.json();
        if (!res.ok)
          throw new Error(data?.error || "Error al cargar el alumno");
        setAlumno(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al cargar el alumno",
        );
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [alumnoId]);

  const handleGuardar = async () => {
    if (!alumno) return;
    setGuardando(true);
    const token = localStorage.getItem("token");
    const centroActivo = getCentroActivo();
    try {
      const res = await fetch(`${API_URL}/api/admin/alumnos/${alumnoId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          centroId: centroActivo.id,
          nombre: alumno.nombre,
          apellidos: alumno.apellidos,
          email: alumno.email,
          telefono: alumno.telefono,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error al guardar");
      navigate(`/admin/alumnos/${alumnoId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setGuardando(false);
    }
  };

  if (loading) return <p>Cargando alumno...</p>;
  if (error || !alumno) {
    return (
      <div className="content">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="content detalle-alumno-admin-page">
      <div className="detalle-asig-breadcrumb">
        <span onClick={() => navigate("/admin/alumnos")}>Alumnos</span>
        <ChevronRight size={12} />{" "}
        <strong>
          {alumno.nombre} {alumno.apellidos}
        </strong>
      </div>

      <div className="detalle-alumno-layout">
        <div className="detalle-alumno-foto-card">
          <img
            src={alumno.fotoUrl || avatarDefault}
            alt="avatar"
            className="perfil-avatar-img"
          />
          <h3>
            {alumno.nombre} {alumno.apellidos}
          </h3>
        </div>

        <div className="detalle-alumno-form-card">
          <h3>Informacion personal</h3>

          <label>Codigo</label>
          <p>{alumno.codigo}</p>
          <label>Nombre</label>
          <div className="grupo-ad">
            <input
              disabled={!modoEdicion}
              value={alumno.nombre}
              onChange={(e) => setAlumno({ ...alumno, nombre: e.target.value })}
            />
          </div>

          <label>Apellidos</label>
          <div className="grupo-ad">
            <input
              disabled={!modoEdicion}
              value={alumno.apellidos || ""}
              onChange={(e) =>
                setAlumno({ ...alumno, apellidos: e.target.value })
              }
            />
          </div>

          <label>Correo electronico</label>
          <div className="grupo-ad">
            <input
              disabled={!modoEdicion}
              value={alumno.email}
              onChange={(e) => setAlumno({ ...alumno, email: e.target.value })}
            />
          </div>

          <label>Telefono</label>
          <div className="grupo-ad">
            <input
              disabled={!modoEdicion}
              value={alumno.telefono || ""}
              onChange={(e) =>
                setAlumno({ ...alumno, telefono: e.target.value })
              }
            />
          </div>

          <h3 className="perfil-alumno-seccion-academica">
            Informacion academica
          </h3>
          <label>Nivel</label>
          <p className="perfil-alumno-valor-ad">{alumno.nivel}</p>
          <label>Curso</label>
          <p className="perfil-alumno-valor-ad">{alumno.curso ?? "-"}</p>
          <label>Rama</label>
          <p className="perfil-alumno-valor-ad">{alumno.rama ?? "-"}</p>

          {error && <p className="perfil-error-ad">{error}</p>}

          {modoEdicion && (
            <button
              className="btn-actualizar-perfil-alumno"
              onClick={handleGuardar}
              disabled={guardando}
            >
              {guardando ? "Guardando..." : "Guardar cambios"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default DetalleAlumnoAdmin;
