import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ChevronRight,
  Pencil,
  GraduationCap,
  BookOpen,
  Users,
  UserCheck,
  Layers,
  QrCode,
  GitBranch,
  Info,
  Calendar,
  CalendarClock,
} from "lucide-react";
import { getCentroActivo } from "../../utils/auth";
import { getIconoAsignatura } from "../../utils/asignaturaIconos";
import "../../styles/admin/adminDetalleCurso.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const API_URL = import.meta.env.VITE_API_URL;

interface Grupo {
  id: number;
  grupo: string | null;
  totalAlumnos: number;
  estado: string;
  tutor: string | null;
}

interface AsignaturaItem {
  id: number;
  nombre: string;
}

interface ProfesorItem {
  id: number;
  nombre: string;
  fotoUrl: string | null;
  asignatura: string;
}

interface DetalleCurso {
  id: number;
  curso: string;
  cursoBase: string | null;
  nivel: string | null;
  grupo: string | null;
  rama: string | null;
  codigo: string | null;
  descripcion: string | null;
  estado: string;
  fechaCreacion: string | null;
  fechaActualizacion: string | null;
  tutor: { id: number; nombre: string } | null;
  totalGrupos: number;
  totalAsignaturas: number;
  totalProfesores: number;
  totalAlumnos: number;
  grupos: Grupo[];
  asignaturas: AsignaturaItem[];
  profesores: ProfesorItem[];
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

function DetalleCursoAdmin() {
  const { cursoId } = useParams();
  const navigate = useNavigate();
  const [curso, setCurso] = useState<DetalleCurso | null>(null);
  const [tab, setTab] = useState<
    "general" | "grupos" | "asignaturas" | "profesores" | "resumen"
  >("general");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargar = async () => {
      const token = localStorage.getItem("token");
      const centroActivo = getCentroActivo();
      try {
        const res = await fetch(
          `${API_URL}/api/admin/cursos/${cursoId}/detalle?centroId=${centroActivo.id}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Error al cargar el curso");
        setCurso(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al cargar el curso",
        );
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [cursoId]);

  const formatearFecha = (fecha: string | null) =>
    fecha
      ? new Date(fecha).toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : "-";
  const formatearFechaHora = (fecha: string | null) =>
    fecha
      ? new Date(fecha).toLocaleString("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "-";

  if (loading) return <p>Cargando curso...</p>;
  if (error || !curso) {
    return (
      <div className="content">
        <p>{error}</p>
      </div>
    );
  }

  const columnas = [];

  for (let i = 0; i < curso.asignaturas.length && columnas.length < 3; i += 8) {
    columnas.push(curso.asignaturas.slice(i, i + 8));
  }

  const profesoresAgrupados = Object.values(
    curso.profesores.reduce(
      (acc, profesor) => {
        if (!acc[profesor.id]) {
          acc[profesor.id] = {
            id: profesor.id,
            nombre: profesor.nombre,
            fotoUrl: profesor.fotoUrl,
            asignaturas: [],
          };
        }

        if (!acc[profesor.id].asignaturas.includes(profesor.asignatura)) {
          acc[profesor.id].asignaturas.push(profesor.asignatura);
        }

        return acc;
      },
      {} as Record<
        number,
        {
          id: number;
          nombre: string;
          fotoUrl: string | null;
          asignaturas: string[];
        }
      >,
    ),
  );

  const columnasProfesores = [];

  for (
    let i = 0;
    i < profesoresAgrupados.length && columnasProfesores.length < 3;
    i += 5
  ) {
    columnasProfesores.push(profesoresAgrupados.slice(i, i + 5));
  }

  const titulo = curso.rama
    ? `${curso.cursoBase} - ${curso.rama}`
    : (curso.cursoBase ?? curso.curso);

  return (
    <div className="content detalle-curso-admin-page">
      <div className="detalle-asig-breadcrumb">
        <span onClick={() => navigate("/admin/cursos")}>Cursos</span>
        <ChevronRight size={12} /> <strong>{curso.cursoBase}</strong>
      </div>

      <div className="dca-header">
        <div className="dca-header-izq">
          <div className="dca-icono">
            <GraduationCap size={40} />
          </div>
          <div>
            <div className="dca-titulo-row">
              <h1>{titulo}</h1>
              <span
                className={`estado-pill ${curso.estado === "activo" ? "estado-activo" : "estado-inactivo"}`}
              >
                ● {curso.estado === "activo" ? "Activo" : "Inactivo"}
              </span>
            </div>
            <p className="dca-meta">
              Nivel: {curso.nivel} · Codigo: {curso.codigo ?? "-"}
            </p>
            {curso.descripcion && (
              <p className="dca-descripcion">
                Descripcion: {curso.descripcion}
              </p>
            )}
          </div>
        </div>
        <button
          className="btn-editar-perfil-admin"
          onClick={() => navigate(`/admin/cursos/${cursoId}/editar`)}
        >
          <Pencil size={14} /> Editar curso
        </button>
      </div>

      <div className="admin-summary-grid" style={{ marginBottom: 20 }}>
        <div className="admin-summary-card">
          <div
            className="admin-summary-icono"
            style={{ background: "#f3e8ff", color: "#9333ea" }}
          >
            <Users size={22} />
          </div>
          <div>
            <span>Grupos</span>
            <strong>{curso.totalGrupos}</strong>
          </div>
        </div>
        <div className="admin-summary-card">
          <div
            className="admin-summary-icono"
            style={{ background: "#dbeafe", color: "#2563eb" }}
          >
            <BookOpen size={22} />
          </div>
          <div>
            <span>Asignaturas</span>
            <strong>{curso.totalAsignaturas}</strong>
          </div>
        </div>
        <div className="admin-summary-card">
          <div
            className="admin-summary-icono"
            style={{ background: "#dcfce7", color: "#16a34a" }}
          >
            <UserCheck size={22} />
          </div>
          <div>
            <span>Profesores</span>
            <strong>{curso.totalProfesores}</strong>
          </div>
        </div>
        <div className="admin-summary-card">
          <div
            className="admin-summary-icono"
            style={{ background: "#fce7f3", color: "#db2777" }}
          >
            <Users size={22} />
          </div>
          <div>
            <span>Alumnos</span>
            <strong>{curso.totalAlumnos}</strong>
          </div>
        </div>
      </div>

      <div className="editar-profesor-tabs">
        <button
          className={tab === "general" ? "activo" : ""}
          onClick={() => setTab("general")}
        >
          Informacion general
        </button>
        <button
          className={tab === "grupos" ? "activo" : ""}
          onClick={() => setTab("grupos")}
        >
          Grupos
        </button>
        <button
          className={tab === "asignaturas" ? "activo" : ""}
          onClick={() => setTab("asignaturas")}
        >
          Asignaturas
        </button>
        <button
          className={tab === "profesores" ? "activo" : ""}
          onClick={() => setTab("profesores")}
        >
          Profesores
        </button>
        <button
          className={tab === "resumen" ? "activo" : ""}
          onClick={() => setTab("resumen")}
        >
          Resumen
        </button>
      </div>

      {tab === "general" && (
        <div className="dca-layout">
          <div className="ppa-card">
            <div className="dca-info-row">
              <Layers size={14} />
              <span>Nivel educativo</span>
              <strong>{curso.nivel}</strong>
            </div>
            <div className="dca-info-row">
              <BookOpen size={14} />
              <span>Curso</span>
              <strong>{curso.cursoBase}</strong>
            </div>
            <div className="dca-info-row">
              <GitBranch size={14} />
              <span>Rama</span>
              <strong>{curso.rama ?? "-"}</strong>
            </div>
            <div className="dca-info-row">
              <QrCode size={14} />
              <span>Codigo</span>
              <strong>{curso.codigo ?? "-"}</strong>
            </div>
            <div className="dca-info-row">
              <Info size={14} />
              <span>Estado</span>
              <strong>
                {curso.estado === "activo" ? "Activo" : "Inactivo"}
              </strong>
            </div>
            <div className="dca-info-row">
              <Calendar size={14} />
              <span>Fecha de creacion</span>
              <strong>{formatearFecha(curso.fechaCreacion)}</strong>
            </div>
            <div className="dca-info-row">
              <CalendarClock size={14} />
              <span>Ultima actualizacion</span>
              <strong>{formatearFechaHora(curso.fechaActualizacion)}</strong>
            </div>
          </div>

          <div className="dca-col-der">
            <div className="ppa-card">
              <div className="dca-card-header">
                <h3>Grupos del curso</h3>
                <span
                  className="dca-ver-todos"
                  onClick={() => setTab("grupos")}
                >
                  Ver todos
                </span>
              </div>
              {curso.grupos.slice(0, 3).map((g) => (
                <div key={g.id} className="dca-grupo-item">
                  <Users size={16} color="#2563eb" />
                  <div>
                    <strong>Grupo {g.grupo ?? "-"}</strong>
                    <p>{g.totalAlumnos} alumnos</p>
                  </div>
                  <span
                    className={`estado-pill ${g.estado === "activo" ? "estado-activo" : "estado-inactivo"}`}
                  >
                    {g.estado === "activo" ? "Activo" : "Inactivo"}
                  </span>
                </div>
              ))}
            </div>

            <div className="ppa-card">
              <div className="dca-card-header">
                <h3>Asignaturas del curso</h3>
                <span
                  className="dca-ver-todos"
                  onClick={() => setTab("asignaturas")}
                >
                  Ver todos
                </span>
              </div>
              {curso.asignaturas.slice(0, 4).map((a, i) => {
                const estilo = estilos[i % estilos.length];
                const icono = getIconoAsignatura(a.nombre);
                return (
                  <div key={a.id} className="dca-asignatura-item">
                    <div
                      className="row-icon-ad"
                      style={{ background: estilo.bg, color: estilo.color }}
                    >
                      <FontAwesomeIcon
                        icon={icono}
                        size="sm"
                        color={estilo.color}
                      />
                    </div>
                    {a.nombre}
                  </div>
                );
              })}
              {curso.asignaturas.length > 4 && (
                <p
                  className="dca-mas-texto"
                  onClick={() => setTab("asignaturas")}
                >
                  + {curso.asignaturas.length - 4} asignaturas mas
                </p>
              )}
            </div>
          </div>

          <div className="ppa-card">
            <div className="dca-card-header">
              <h3>Profesores asignados ({profesoresAgrupados.length})</h3>
              <span
                className="dca-ver-todos"
                onClick={() => setTab("profesores")}
              >
                Ver todas
              </span>
            </div>
            <div className="dca-profesores-grid">
              {profesoresAgrupados.slice(0, 5).map((p) => (
                <div key={p.id} className="dca-profesor-item">
                  <img
                    src={p.fotoUrl || "/vite.svg"}
                    alt={p.nombre}
                    className="dca-profesor-avatar"
                  />

                  <div>
                    <strong>{p.nombre}</strong>

                    <div className="dca-profesor-asignaturas">
                      {p.asignaturas.map((asignatura) => (
                        <p key={asignatura}>{asignatura}</p>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {profesoresAgrupados.length > 5 && (
              <p className="dca-mas-texto" onClick={() => setTab("profesores")}>
                + {profesoresAgrupados.length - 5} profesores mas
              </p>
            )}
          </div>
        </div>
      )}

      {tab === "grupos" && (
        <div className="ppa-card">
          <h3>Grupos del curso</h3>
          {curso.grupos.map((g) => (
            <div key={g.id} className="dca-grupo-item">
              <Users size={16} color="#2563eb" />
              <div>
                <strong>Grupo {g.grupo ?? "-"}</strong>
                <p>
                  {g.totalAlumnos} alumnos {g.tutor && `· Tutor: ${g.tutor}`}
                </p>
              </div>
              <span
                className={`estado-pill ${g.estado === "activo" ? "estado-activo" : "estado-inactivo"}`}
              >
                {g.estado === "activo" ? "Activo" : "Inactivo"}
              </span>
            </div>
          ))}
        </div>
      )}

      {tab === "asignaturas" && (
        <div className="ppa-card">
          <h3>Asignaturas del curso</h3>
          <div className="dca-asignaturas-container">
            {columnas.map((columna, columnaIndex) => (
              <div className="dca-asignaturas-columna" key={columnaIndex}>
                {columna.map((a, i) => {
                  const indiceGlobal = columnaIndex * 8 + i;
                  const estilo = estilos[indiceGlobal % estilos.length];
                  const icono = getIconoAsignatura(a.nombre);

                  return (
                    <div key={a.id} className="dca-asignatura-item">
                      <div
                        className="row-icon-ad"
                        style={{
                          background: estilo.bg,
                          color: estilo.color,
                        }}
                      >
                        <FontAwesomeIcon
                          icon={icono}
                          size="sm"
                          color={estilo.color}
                        />
                      </div>

                      {a.nombre}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "profesores" && (
        <div className="ppa-card">
          <h3>Profesores asignados</h3>

          <div className="dca-profesores-container">
            {columnasProfesores.map((columna, columnaIndex) => (
              <div className="dca-profesores-columna" key={columnaIndex}>
                {columna.map((p) => (
                  <div key={p.id} className="dca-profesor-item">
                    <img
                      src={p.fotoUrl || "/vite.svg"}
                      alt={p.nombre}
                      className="dca-profesor-avatar"
                    />

                    <div>
                      <strong>{p.nombre}</strong>

                      <div className="dca-profesor-asignaturas">
                        {p.asignaturas.map((asignatura) => (
                          <p key={asignatura}>{asignatura}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "resumen" && (
        <div className="ppa-card">
          <h3>Resumen</h3>
          <div className="dca-info-row">
            <span style={{ width: 14 }} />
            <span>Tutor de curso</span>
            <strong>{curso.tutor?.nombre ?? "Sin asignar"}</strong>
          </div>
          <div className="dca-info-row">
            <span style={{ width: 14 }} />
            <span>Total alumnos</span>
            <strong>{curso.totalAlumnos}</strong>
          </div>
        </div>
      )}
    </div>
  );
}

export default DetalleCursoAdmin;
