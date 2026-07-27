import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Download, ArrowBigLeft, ChevronRight } from "lucide-react";
import { getCentroActivo } from "../../utils/auth";
import { getIconoAsignatura } from "../../utils/asignaturaIconos";
import {
  getMaterialIcono,
  getCarpetaIcono,
  formatearTamano,
} from "../../utils/materialIconos";
import "../../styles/detalleAsignaturaAlumno.css";

const API_URL = import.meta.env.VITE_API_URL;

interface DetalleAsignatura {
  asignatura: string;
  codigo: string | null;
  rama: string | null;
  profesor: string;
  horario: string;
  asignaturaId: number;
  descripcion: string;
  notaActual: string | null;
  notaColor: { bg: string; color: string } | null;
}

interface TareaPendiente {
  id: number;
  titulo: string;
  fechaEntrega: string;
}

interface Carpeta {
  id: number;
  tipo: "carpeta";
  nombre: string;
  totalArchivos: number;
  createdAt: string;
}

interface Archivo {
  id: number;
  tipo: "archivo";
  nombre: string;
  extension: string;
  url: string;
  tamanoBytes: number | null;
  createdAt: string;
  carpetaId: number | null;
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

function DetalleAsignaturaAlumno() {
  const { cursoAsignaturaId } = useParams();
  const navigate = useNavigate();

  const [detalle, setDetalle] = useState<DetalleAsignatura | null>(null);
  const [tareas, setTareas] = useState<TareaPendiente[]>([]);
  const [carpetas, setCarpetas] = useState<Carpeta[]>([]);
  const [archivos, setArchivos] = useState<Archivo[]>([]);
  const [carpetaActual, setCarpetaActual] = useState<{
    id: number;
    nombre: string;
  } | null>(null);
  const [mostrarTodasTareas, setMostrarTodasTareas] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMateriales, setLoadingMateriales] = useState(true);
  const [error, setError] = useState("");

  const cargarDetalle = async () => {
    const token = localStorage.getItem("token");
    const centroActivo = getCentroActivo();
    try {
      const res = await fetch(
        `${API_URL}/api/alumno/asignatura/${cursoAsignaturaId}/detalle?centroId=${centroActivo.id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await res.json();
      if (!res.ok)
        throw new Error(data?.error || "Error al cargar la asignatura");
      setDetalle(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar la asignatura",
      );
    }
  };

  const cargarTareas = async () => {
    const token = localStorage.getItem("token");
    const centroActivo = getCentroActivo();
    try {
      const res = await fetch(
        `${API_URL}/api/alumno/asignatura/${cursoAsignaturaId}/tareas-pendientes?centroId=${centroActivo.id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error al cargar tareas");
      setTareas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log(err);
    }
  };

  const cargarMateriales = async (carpetaId?: number) => {
    const token = localStorage.getItem("token");
    const centroActivo = getCentroActivo();
    try {
      const url = carpetaId
        ? `${API_URL}/api/alumno/asignatura/${cursoAsignaturaId}/materiales?centroId=${centroActivo.id}&carpetaId=${carpetaId}`
        : `${API_URL}/api/alumno/asignatura/${cursoAsignaturaId}/materiales?centroId=${centroActivo.id}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error al cargar materiales");
      setCarpetas(data.carpetas ?? []);
      setArchivos(data.archivos ?? []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar materiales",
      );
    } finally {
      setLoadingMateriales(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de datos al montar, patron estandar
    cargarDetalle();
    cargarTareas();
    cargarMateriales();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursoAsignaturaId]);

  const abrirCarpeta = (carpeta: Carpeta) => {
    setCarpetaActual({ id: carpeta.id, nombre: carpeta.nombre });
    cargarMateriales(carpeta.id);
  };

  const salirDeCarpeta = () => {
    setCarpetaActual(null);
    cargarMateriales();
  };

  const formatearFecha = (fecha: string) =>
    new Date(fecha).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  if (loading) return <p>Cargando asignatura...</p>;
  if (error || !detalle) {
    return (
      <div className="content">
        <p>{error}</p>
      </div>
    );
  }
  if (!detalle) return null;

  const estilo = estilos[detalle.asignaturaId % estilos.length];

  const tareasAMostrar = mostrarTodasTareas ? tareas : tareas.slice(0, 3);

  return (
    <div className="content detalle-asig-alumno-page">
      <div className="detalle-asig-breadcrumb">
        <span onClick={() => navigate("/alumno/asignaturas")}>
          Mis Asignaturas
        </span>{" "}
        <ChevronRight size={12} /> <strong>{detalle.asignatura}</strong>
      </div>

      <div
        className="detalle-asig-header"
        style={{ borderLeft: `7px solid ${estilo.color}` }}
      >
        <div
          className="detalle-asig-icono"
          style={{ background: estilo.bg, color: estilo.color }}
        >
          <FontAwesomeIcon
            icon={getIconoAsignatura(detalle.asignatura)}
            size="2xl"
          />
        </div>
        <div>
          <h2>{detalle.asignatura}</h2>
          <p>
            {detalle.profesor} <br /> Nota actual:
            <span
              style={{
                fontWeight: "600",
                color: detalle.notaColor?.color ?? "#333",
              }}
            >
              {" "}
              {detalle.notaActual ?? "-"}
            </span>{" "}
          </p>
        </div>
      </div>

      <div className="detalle-asig-layout">
        <div className="detalle-asig-col-izq">
          <div className="detalle-asig-card">
            <h3>Descripción de la asignatura</h3>
            {detalle.descripcion ? (
              <p>{detalle.descripcion}</p>
            ) : (
              <p style={{ textAlign: "center" }}>
                No se ha especificado la descripcion de esta asignatura todavia
              </p>
            )}
          </div>
          <div className="detalle-asig-card">
            <div>
              <h3>{carpetaActual ? carpetaActual.nombre : "Materiales"}</h3>
              <p>
                {carpetaActual
                  ? "Archivos dentro de esta carpeta."
                  : "Materiales y recursos."}
              </p>
            </div>

            {carpetaActual && (
              <button className="btn-volver-carpeta" onClick={salirDeCarpeta}>
                <ArrowBigLeft size={12} /> Volver a contenido
              </button>
            )}

            {error && <p className="modal-error">{error}</p>}

            {loadingMateriales ? (
              <p style={{ padding: 20 }}>Cargando materiales...</p>
            ) : (
              <div className="detalle-asig-materiales-lista">
                {carpetas.map((c) => {
                  const { icon, bg, color } = getCarpetaIcono();
                  return (
                    <div
                      key={`carpeta-${c.id}`}
                      className="material-item-alumno"
                      onClick={() => abrirCarpeta(c)}
                    >
                      <div
                        className="material-icono"
                        style={{ background: bg, color }}
                      >
                        <FontAwesomeIcon icon={icon} size="lg" />
                      </div>
                      <div className="material-info">
                        <strong>{c.nombre}</strong>
                        <span>
                          Carpeta • {c.totalArchivos} archivo
                          {c.totalArchivos !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <span className="material-fecha">
                        {formatearFecha(c.createdAt)}
                      </span>
                    </div>
                  );
                })}

                {archivos.map((a) => {
                  const { icon, bg, color } = getMaterialIcono(a.extension);
                  return (
                    <a
                      key={`archivo-${a.id}`}
                      className="material-item-alumno"
                      href={a.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <div
                        className="material-icono"
                        style={{ background: bg, color }}
                      >
                        <FontAwesomeIcon icon={icon} size="lg" />
                      </div>
                      <div className="material-info">
                        <strong>{a.nombre}</strong>
                        <span>
                          {a.extension.toUpperCase()} •{" "}
                          {formatearTamano(a.tamanoBytes)}
                        </span>
                      </div>
                      <span className="material-fecha">
                        {formatearFecha(a.createdAt)}
                      </span>
                      <Download size={14} color="#999" />
                    </a>
                  );
                })}

                {carpetas.length === 0 && archivos.length === 0 && (
                  <p className="material-vacio">No hay materiales todavia.</p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="detalle-asig-col-der">
          <div className="detalle-asig-card">
            <div className="detalle-asig-tareas-header">
              <h3>Tareas pendientes</h3>
              {tareas.length > 3 && (
                <span
                  className="detalle-asig-ver-todas"
                  onClick={() => setMostrarTodasTareas((v) => !v)}
                >
                  {mostrarTodasTareas ? "Ver menos" : "Ver todas"}
                </span>
              )}
            </div>
            {tareasAMostrar.length === 0 ? (
              <p className="material-vacio">No tienes tareas pendientes.</p>
            ) : (
              tareasAMostrar.map((t) => (
                <div
                  key={t.id}
                  className="detalle-asig-tarea-item"
                  onClick={() => navigate(`/alumno/tareas/${t.id}`)}
                >
                  <div
                    className="material-icono"
                    style={{ background: "#dbeafe", color: "#2563eb" }}
                  >
                    <FontAwesomeIcon
                      icon={getIconoAsignatura(detalle.asignatura)}
                      size="lg"
                    />
                  </div>
                  <div className="material-info">
                    <strong>{t.titulo}</strong>
                    <span>Fecha limite: {formatearFecha(t.fechaEntrega)}</span>
                  </div>
                  <span className="pendiente-pill">Pendiente</span>
                </div>
              ))
            )}
          </div>

          <div className="detalle-asig-card">
            <h3>Informacion del curso</h3>
            <div className="detalle-asig-info-row">
              <span>Codigo</span>
              <strong>{detalle.codigo ?? "-"}</strong>
            </div>
            <div className="detalle-asig-info-row">
              <span>Rama</span>
              <strong>{detalle.rama ?? "-"}</strong>
            </div>
            <div className="detalle-asig-info-row">
              <span>Horario</span>
              <strong>{detalle.horario}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetalleAsignaturaAlumno;
