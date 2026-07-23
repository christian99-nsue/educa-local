import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  MoreVertical,
  Calendar,
  Users,
  Download,
} from "lucide-react";
import { getCentroActivo } from "../../utils/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getIconoAsignatura } from "../../utils/asignaturaIconos";
import { getMaterialIcono } from "../../utils/materialIconos";
import CalificarModal from "../../components/CalificarModal";
import EditarTareaModal from "../../components/EditarTareaModal";
import "../../styles/detalleTareaProfesor.css";

const API_URL = import.meta.env.VITE_API_URL;

interface Entrega {
  id: number;
  nombre: string;
  apellidos: string;
  fotoUrl: string | null;
  estado: "pendiente" | "entregada" | "calificada";
  fechaEntregaReal: string | null;
  nota: number | null;
  archivoUrl: string | null;
  archivoNombre: string | null;
  archivoTamano: number | null;
}

interface DetalleTarea {
  id: number;
  titulo: string;
  descripcion: string | null;
  fechaCreacion: string;
  fechaEntrega: string;
  archivoUrl: string | null;
  instrucciones: string | null;
  asignaturaId: number;
  archivoNombre: string | null;
  asignatura: string;
  curso: string;
  rama: string | null;
  totalAlumnos: number;
  totalEntregados: number;
  totalPendientes: number;
  entregas: Entrega[];
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

type TabFiltro = "entregados" | "pendientes" | "todos";

function DetalleTareaProfesor() {
  const { tareaId } = useParams();
  const navigate = useNavigate();
  const [tarea, setTarea] = useState<DetalleTarea | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<TabFiltro>("entregados");
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState<number | null>(
    null,
  );
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);

  const cargar = async () => {
    const token = localStorage.getItem("token");
    const centroActivo = getCentroActivo();
    try {
      const res = await fetch(
        `${API_URL}/api/profesor/tarea/${tareaId}/detalle?centroId=${centroActivo.id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error al cargar la tarea");
      setTarea(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar la tarea");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    //eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de datos al montar, patron estandar
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tareaId]);

  const formatearFechaHora = (fecha: string | null) => {
    if (!fecha) return "";
    return new Date(fecha).toLocaleString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatearTamano = (bytes: number | null) => {
    if (!bytes) return "";
    const mb = bytes / (1024 * 1024);
    return mb < 1 ? `${Math.round(bytes / 1024)} KB` : `${mb.toFixed(1)} MB`;
  };

  const getIniciales = (nombre: string, apellidos: string) =>
    `${nombre[0] ?? ""}${apellidos[0] ?? ""}`.toUpperCase();

  if (loading) return <p>Cargando tarea...</p>;
  if (error || !tarea) {
    return (
      <div className="content-pf">
        <p>{error || "No se pudo cargar la tarea"}</p>
      </div>
    );
  }

  const entregasFiltradas =
    tab === "entregados"
      ? tarea.entregas.filter(
          (e) => e.estado === "entregada" || e.estado === "calificada",
        )
      : tab === "pendientes"
        ? tarea.entregas.filter((e) => e.estado === "pendiente")
        : tarea.entregas;

  const estilo = estilos[tarea.asignaturaId % estilos.length];
  return (
    <div className="content-pf detalle-tarea-page">
      <button className="btn-volver-tareas-pf" onClick={() => navigate(-1)}>
        <ArrowLeft size={14} /> Volver a tareas
      </button>

      <div className="detalle-tarea-header">
        <div
          className="detalle-tarea-icono"
          style={{ background: estilo.bg, color: estilo.color }}
        >
          <FontAwesomeIcon
            icon={getIconoAsignatura(tarea.asignatura)}
            size="2x"
          />
        </div>
        <div className="detalle-tarea-titulo-wrapper">
          <h1>{tarea.titulo}</h1>
          <div className="detalle-tarea-tags">
            <span className="tag-tipo">Tarea</span>
            <span>{tarea.asignatura}</span>
            <span>•</span>
            <span>
              {tarea.curso}
              {tarea.rama ? ` ${tarea.rama}` : ""}
            </span>
          </div>
        </div>
        <div className="detalle-tarea-acciones">
          <button
            className="btn-editar-tarea"
            onClick={() => setModalEditarAbierto(true)}
          >
            <Pencil size={14} /> Editar
          </button>
          <button className="btn-mas-opciones">
            <MoreVertical size={16} />
          </button>
        </div>
      </div>

      <div className="detalle-tarea-grid">
        <div className="grid-fecha-pub">
          <Calendar size={16} />
          <div>
            <span>Fecha de publicacion</span>
            <strong>{formatearFechaHora(tarea.fechaCreacion)}</strong>
          </div>
        </div>

        <div className="grid-fecha-limite">
          <Calendar size={16} />
          <div>
            <span>Fecha limite</span>
            <strong>{formatearFechaHora(tarea.fechaEntrega)}</strong>
          </div>
        </div>

        <div className="grid-entregados">
          <Users size={16} />
          <div>
            <span>Entregados</span>
            <strong>
              {tarea.totalEntregados} / {tarea.totalAlumnos}
            </strong>
          </div>
        </div>

        <div className="grid-entregas-card">
          <h3>Entregas de los estudiantes</h3>

          <div className="entregas-tabs">
            <button
              className={tab === "entregados" ? "tab-activo" : ""}
              onClick={() => setTab("entregados")}
            >
              Entregados ({tarea.totalEntregados})
            </button>
            <button
              className={tab === "pendientes" ? "tab-activo" : ""}
              onClick={() => setTab("pendientes")}
            >
              Pendientes ({tarea.totalPendientes})
            </button>
            <button
              className={tab === "todos" ? "tab-activo" : ""}
              onClick={() => setTab("todos")}
            >
              Todos ({tarea.totalAlumnos})
            </button>
          </div>

          <div className="entregas-lista">
            {entregasFiltradas.length === 0 ? (
              <p className="material-vacio">
                No hay estudiantes en esta lista.
              </p>
            ) : (
              entregasFiltradas.map((e) => (
                <div
                  key={e.id}
                  className="entrega-item"
                  onClick={() => setAlumnoSeleccionado(e.id)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="entrega-avatar">
                    {e.fotoUrl ? (
                      <img src={e.fotoUrl} alt={e.nombre} />
                    ) : (
                      <span>{getIniciales(e.nombre, e.apellidos)}</span>
                    )}
                  </div>
                  <div className="entrega-info">
                    <strong>
                      {e.nombre} {e.apellidos}
                    </strong>
                    {e.estado === "pendiente" ? (
                      <span className="entrega-sin-entregar">Sin entregar</span>
                    ) : e.fechaEntregaReal ? (
                      <span>
                        Entregado el {formatearFechaHora(e.fechaEntregaReal)}
                      </span>
                    ) : (
                      <span>
                        Calificado sin entrega digital (ej. examen en papel)
                      </span>
                    )}
                    {e.archivoUrl &&
                      (() => {
                        const extension =
                          e.archivoNombre?.split(".").pop()?.toLowerCase() ||
                          "";
                        const { icon, color } = getMaterialIcono(extension);
                        return (
                          <a
                            href="{e.archivoUrl}"
                            className="entrega-archivo-link"
                            target="_blank"
                            rel="noreferrer"
                          >
                            <FontAwesomeIcon
                              icon={icon}
                              color={color}
                              size="sm"
                            />
                            {e.archivoNombre}{" "}
                            <span>{formatearTamano(e.archivoTamano)}</span>
                          </a>
                        );
                      })()}
                  </div>
                  {e.estado === "calificada" && e.nota != null ? (
                    <div className="entrega-nota-wrapper">
                      <span className="entrega-nota-label">Calificacion</span>
                      <span className="entrega-nota-valor">{e.nota} / 10</span>
                    </div>
                  ) : e.estado === "entregada" ? (
                    <button className="btn-calificar">Calificar</button>
                  ) : null}
                  {e.estado !== "pendiente" && (
                    <button className="material-mas">
                      <MoreVertical size={16} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="grid-descripcion">
          {tarea.descripcion && (
            <div className="detalle-tarea-seccion">
              <h3>Descripcion</h3>
              <p>{tarea.descripcion}</p>
            </div>
          )}
        </div>

        <div className="grid-archivos">
          {tarea.archivoUrl && (
            <div className="detalle-tarea-seccion">
              <h3>Archivos adjuntos</h3>
              {(() => {
                const extension =
                  tarea.archivoNombre?.split(".").pop()?.toLocaleLowerCase() ||
                  "";
                const { icon, bg, color } = getMaterialIcono(extension);
                return (
                  <a
                    className="archivo-adjunto"
                    href={tarea.archivoUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <div
                      className="archivo-adjunto-icono"
                      style={{ background: bg, color }}
                    >
                      <FontAwesomeIcon icon={icon} />
                    </div>
                    <div>
                      <strong>{tarea.archivoNombre}</strong>
                      <span>Enunciado</span>
                    </div>
                    <Download size={16} />
                  </a>
                );
              })()}
            </div>
          )}
        </div>

        <div className="grid-instrucciones">
          {tarea.instrucciones && (
            <div className="detalle-tarea-seccion">
              <h3>Instrucciones</h3>
              <ul className="instrucciones-lista">
                {tarea.instrucciones
                  .split("\n")
                  .filter((linea) => linea.trim() !== "")
                  .map((linea, i) => (
                    <li key={i}>{linea}</li>
                  ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {alumnoSeleccionado !== null && (
        <CalificarModal
          tareaId={tareaId!}
          alumnoId={alumnoSeleccionado}
          onClose={() => setAlumnoSeleccionado(null)}
          onGuardado={cargar}
        />
      )}

      {modalEditarAbierto && (
        <EditarTareaModal
          tareaId={tareaId!}
          asignatura={tarea.asignatura}
          curso={`${tarea.curso}${tarea.rama ? " " + tarea.rama : ""} `}
          tituloInicial={tarea.titulo}
          descripcionInicial={tarea.descripcion || ""}
          instruccionesInicial={tarea.instrucciones || ""}
          fechaEntregaInicial={tarea.fechaEntrega}
          tieneEntregas={tarea.totalEntregados > 0}
          archivoNombreActual={tarea.archivoNombre}
          onClose={() => setModalEditarAbierto(false)}
          onGuardado={cargar}
        />
      )}
    </div>
  );
}

export default DetalleTareaProfesor;
