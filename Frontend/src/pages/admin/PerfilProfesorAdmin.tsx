import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronRight, Pencil, Users } from "lucide-react";
import avatarDefault from "../../assets/images/avatar-default.png";
import { getCentroActivo } from "../../utils/auth";
import { getIconoAsignatura } from "../../utils/asignaturaIconos";
import "../../styles/adminPerfilProfesor.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const API_URL = import.meta.env.VITE_API_URL;

interface AsignaturaAgrupada {
  asignatura: string;
  cursos: string[];
}

interface ClaseHorario {
  horaInicio: string;
  horaFin: string;
  asignatura: string;
  curso: string;
}

interface PerfilProfesor {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  telefono: string | null;
  codigo: string | null;
  fotoUrl: string | null;
  estado: "activo" | "inactivo";
  fechaAlta: string | null;
  totalAsignaciones: number;
  asignaturas: AsignaturaAgrupada[];
  horarioResumen: Record<string, ClaseHorario[]>;
}

const estilos = [
  { bg: "#f0d5fc", color: "#B032E7" },
  { bg: "#c5def8", color: "#59ADFF" },
  { bg: "#ffe3e4", color: "#FC4850" },
  { bg: "#e7fdb8", color: "#5f8408" },
  { bg: "#ffeba1", color: "#F8C822" },
  { bg: "#e6e6e6", color: "#686868" },
  { bg: "#ddffd8", color: "#18B300" },
  { bg: "#ffc9c9", color: "#ff0000" },
];

const DIAS = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes"];

function PerfilProfesorAdmin() {
  const { profesorId } = useParams();
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState<PerfilProfesor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
    cargar();
  }, [profesorId]);

  const formatearFecha = (fecha: string | null) =>
    fecha
      ? new Date(fecha).toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : "-";

  if (loading) return <p>Cargando perfil...</p>;
  if (error || !perfil) {
    return (
      <div className="content">
        <p>{error}</p>
      </div>
    );
  }

  const horasUnicas = Array.from(
    new Set(
      Object.values(perfil.horarioResumen)
        .flat()
        .map((c) => c.horaInicio),
    ),
  ).sort();

  return (
    <div className="content perfil-profesor-admin-page">
      <div className="detalle-asig-breadcrumb">
        <span onClick={() => navigate("/admin/profesores")}>Profesores</span>
        <ChevronRight size={12} />{" "}
        <strong>
          {perfil.nombre} {perfil.apellidos}
        </strong>
      </div>

      <div className="ppa-header">
        <div className="ppa-header-izq">
          <img
            src={perfil.fotoUrl || avatarDefault}
            alt="avatar"
            className="ppa-avatar"
          />
          <div>
            <h1>
              {perfil.nombre} {perfil.apellidos}
            </h1>
            <p className="ppa-subtitulo">Profesor(a)</p>
            <p className="ppa-codigo">Codigo: {perfil.codigo}</p>
            <span
              className={`estado-pill ${perfil.estado === "activo" ? "estado-activo" : "estado-inactivo"}`}
            >
              ● {perfil.estado === "activo" ? "Activa" : "Inactiva"}
            </span>
          </div>
        </div>
        <button
          className="btn-editar-perfil-admin"
          onClick={() => navigate(`/admin/profesores/${profesorId}/editar`)}
        >
          <Pencil size={14} /> Editar profesor
        </button>
      </div>

      <div className="ppa-layout">
        <div className="ppa-card">
          <h3>Informacion personal</h3>
          <div className="ppa-info-grid">
            <div>
              <span>Nombre</span>
              <strong>{perfil.nombre}</strong>
            </div>
            <div>
              <span>Apellidos</span>
              <strong>{perfil.apellidos}</strong>
            </div>
            <div>
              <span>Correo</span>
              <strong>{perfil.email}</strong>
            </div>
            <div>
              <span>Telefono</span>
              <strong>{perfil.telefono ?? "-"}</strong>
            </div>
            <div>
              <span>Codigo de profesor</span>
              <strong>{perfil.codigo}</strong>
            </div>
            <div>
              <span>Estado</span>
              <strong>
                {perfil.estado === "activo" ? "Activa" : "Inactiva"}
              </strong>
            </div>
            <div>
              <span>Fecha de alta</span>
              <strong>{formatearFecha(perfil.fechaAlta)}</strong>
            </div>
          </div>
        </div>

        <div className="ppa-card">
          <h3>Asignaciones docentes</h3>
          {perfil.asignaturas.map((a, i) => {
            const estilo = estilos[i % estilos.length];
            const icono = getIconoAsignatura(a.asignatura);
            return (
              <div key={a.asignatura} className="ppa-asignatura-item">
                <div
                  className="row-icon"
                  style={{ background: estilo.bg, color: estilo.color }}
                >
                  <FontAwesomeIcon
                    icon={icono}
                    size="xl"
                    color={estilo.color}
                  />
                </div>
                <div>
                  <strong>{a.asignatura}</strong>
                  {a.cursos.map((c) => (
                    <p key={c}>{c}</p>
                  ))}
                </div>
              </div>
            );
          })}
          {perfil.asignaturas.length === 0 && (
            <p className="material-vacio">Sin asignaturas asignadas.</p>
          )}
          <p className="ppa-total-asignaciones">
            <Users size={12} /> Total asignaciones: {perfil.totalAsignaciones}
          </p>
        </div>
      </div>

      <div className="ppa-card" style={{ marginTop: 20 }}>
        <h3>Horario semanal (resumen)</h3>
        {horasUnicas.length === 0 ? (
          <p className="material-vacio">Sin horario asignado.</p>
        ) : (
          <table className="admin-alumnos-tabla">
            <thead>
              <tr>
                <th>Hora</th>
                {DIAS.map((d) => (
                  <th key={d}>{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {horasUnicas.map((hora) => (
                <tr key={hora}>
                  <td>{hora.slice(0, 5)}</td>
                  {DIAS.map((d) => {
                    const clase = perfil.horarioResumen[d]?.find(
                      (c) => c.horaInicio === hora,
                    );
                    return (
                      <td key={d}>
                        {clase ? (
                          <div>
                            <strong style={{ fontSize: 12 }}>
                              {clase.asignatura}
                            </strong>
                            <p
                              style={{ fontSize: 11, color: "#999", margin: 0 }}
                            >
                              {clase.curso}
                            </p>
                          </div>
                        ) : (
                          "–"
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <p
          className="ppa-ver-completo"
          onClick={() => navigate(`/admin/horarios`)}
        >
          Ver horario completo →
        </p>
      </div>
    </div>
  );
}

export default PerfilProfesorAdmin;
