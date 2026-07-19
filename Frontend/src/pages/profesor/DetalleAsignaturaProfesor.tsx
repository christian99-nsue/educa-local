import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getIconoAsignatura } from "../../utils/asignaturaIconos";
import {
  Upload,
  FolderPlus,
  User,
  Users,
  GitBranch,
  MoreVertical,
  CalendarCheck,
  Layers,
} from "lucide-react";
import { getCentroActivo } from "../../utils/auth";
import {
  getMaterialIcono,
  getCarpetaIcono,
  formatearTamano,
} from "../../utils/materialIconos";
import "../../styles/detalleAsignaturaProfesor.css";

const API_URL = import.meta.env.VITE_API_URL;

interface DetalleAsignatura {
  asignaturaId: number;
  asignatura: string;
  codigo: string | null;
  curso: string;
  rama: string | null;
  profesor: string;
  totalAlumnos: number;
  proximasClases: {
    fecha: string;
    horaInicio: string;
    horaFin: string;
    aula: string | null;
  }[];
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

function DetalleAsignaturaProfesor() {
  const { cursoAsignaturaId } = useParams();
  const [detalle, setDetalle] = useState<DetalleAsignatura | null>(null);
  const [carpetas, setCarpetas] = useState<Carpeta[]>([]);
  const [archivos, setArchivos] = useState<Archivo[]>([]);
  const [carpetaActual, setCarpetaActual] = useState<{
    id: number;
    nombre: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [subiendo, setSubiendo] = useState(false);
  const [mostrarModalCarpeta, setMostrarModalCarpeta] = useState(false);
  const [nombreCarpeta, setNombreCarpeta] = useState("");

  const cargarDetalle = async () => {
    const token = localStorage.getItem("token");
    const centroActivo = getCentroActivo();
    try {
      const res = await fetch(
        `${API_URL}/api/profesor/asignatura/${cursoAsignaturaId}/detalle?centroId=${centroActivo.id}`,
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

  const cargarMateriales = async (carpetaId?: number) => {
    const token = localStorage.getItem("token");
    const centroActivo = getCentroActivo();
    try {
      const url = carpetaId
        ? `${API_URL}/api/profesor/asignatura/${cursoAsignaturaId}/materiales?centroId=${centroActivo.id}&carpetaId=${carpetaId}`
        : `${API_URL}/api/profesor/asignatura/${cursoAsignaturaId}/materiales?centroId=${centroActivo.id}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error al cargar materiales");
      setCarpetas(data.carpetas);
      setArchivos(data.archivos);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar materiales",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de datos al montar, patron estandar
    cargarDetalle();
    cargarMateriales();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursoAsignaturaId]);
  const abrirCarpeta = (carpeta: Carpeta) => {
    setCarpetaActual({ id: carpeta.id, nombre: carpeta.nombre });
    setLoading(true);
    cargarMateriales(carpeta.id);
  };

  const salirDeCarpeta = () => {
    setCarpetaActual(null);
    setLoading(true);
    cargarMateriales();
  };

  const handleSubirArchivo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSubiendo(true);
    setError("");
    const token = localStorage.getItem("token");
    const centroActivo = getCentroActivo();

    const formData = new FormData();
    formData.append("cursoAsignaturaId", String(cursoAsignaturaId));
    formData.append("centroId", String(centroActivo.id));
    if (carpetaActual) {
      formData.append("carpetaId", String(carpetaActual.id));
    }
    formData.append("archivo", file);

    try {
      const res = await fetch(
        `${API_URL}/api/profesor/asignatura/materiales/subir`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error al subir el material");
      cargarMateriales(carpetaActual?.id);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al subir el material",
      );
    } finally {
      setSubiendo(false);
      e.target.value = "";
    }
  };

  const handleCrearCarpeta = async () => {
    if (!nombreCarpeta.trim()) return;
    const token = localStorage.getItem("token");
    const centroActivo = getCentroActivo();

    try {
      const res = await fetch(
        `${API_URL}/api/profesor/asignatura/materiales/crear-carpeta`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            cursoAsignaturaId,
            nombre: nombreCarpeta,
            centroId: centroActivo.id,
          }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error al crear la carpeta");
      setNombreCarpeta("");
      setMostrarModalCarpeta(false);
      cargarMateriales();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al crear la carpeta",
      );
    }
  };

  const formatearFecha = (fecha: string) =>
    new Date(fecha).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  if (loading && !detalle) return <p>Cargando asignatura...</p>;
  if (error && !detalle) {
    return (
      <div className="content-pf">
        <p>{error}</p>
      </div>
    );
  }
  if (!detalle) return null;

  const estilo = estilos[detalle.asignaturaId % estilos.length];

  return (
    <div className="content-pf detalle-asignatura-page">
      <div className="detalle-header">
        <div
          className="detalle-header-icono"
          style={{ background: estilo.bg, color: estilo.color }}
        >
          <FontAwesomeIcon
            icon={getIconoAsignatura(detalle.asignatura)}
            size="2x"
          />
        </div>
        <div>
          <h1>{detalle.asignatura}</h1>
          <p>
            {detalle.curso} • Codigo: {detalle.codigo ?? "-"}
          </p>
        </div>
      </div>

      <div className="detalle-layout">
        <div className="detalle-materiales-col">
          <div className="detalle-materiales-card">
            <div className="detalle-materiales-header">
              <div>
                <h3>
                  {carpetaActual
                    ? carpetaActual.nombre
                    : "Contenido y materiales"}
                </h3>
                <p>
                  {carpetaActual
                    ? "Archivos dentro de esta carpeta."
                    : "Materiales y recursos que has compartido con tus estudiantes."}
                </p>
              </div>
              <div className="detalle-materiales-acciones">
                {!carpetaActual && (
                  <button
                    className="btn-nueva-carpeta"
                    onClick={() => setMostrarModalCarpeta(true)}
                  >
                    <FolderPlus size={14} /> Nueva carpeta
                  </button>
                )}
                <label className="btn-subir-material">
                  <Upload size={14} />{" "}
                  {subiendo ? "Subiendo..." : "Subir material"}
                  <input
                    type="file"
                    style={{ display: "none" }}
                    onChange={handleSubirArchivo}
                    disabled={subiendo}
                  />
                </label>
              </div>
            </div>

            {carpetaActual && (
              <button className="btn-volver-carpeta" onClick={salirDeCarpeta}>
                ← Volver a contenido
              </button>
            )}

            {error && <p className="modal-error">{error}</p>}

            {loading ? (
              <p style={{ padding: 20 }}>Cargando materiales...</p>
            ) : (
              <div className="detalle-materiales-lista">
                {carpetas.map((c) => {
                  const { icon, bg, color } = getCarpetaIcono();
                  return (
                    <div
                      key={`carpeta-${c.id}`}
                      className="material-item"
                      onClick={() => abrirCarpeta(c)}
                    >
                      <div
                        className="material-icono"
                        style={{ background: bg, color }}
                      >
                        <FontAwesomeIcon icon={icon} size="lg" />
                      </div>
                      {/* ... */}
                      <div className="material-info">
                        <strong>{c.nombre}</strong>
                        <span>
                          Carpeta • {c.totalArchivos} archivo
                          {c.totalArchivos !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <span className="material-fecha">
                        Subido el {formatearFecha(c.createdAt)}
                      </span>
                      <button
                        className="material-mas"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  );
                })}

                {archivos.map((a) => {
                  const { icon, bg, color } = getMaterialIcono(a.extension);
                  return (
                    <a
                      key={`archivo-${a.id}`}
                      className="material-item"
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
                      {/* ... */}
                      <div className="material-info">
                        <strong>{a.nombre}</strong>
                        <span>
                          {a.extension.toUpperCase()} •{" "}
                          {formatearTamano(a.tamanoBytes)}
                        </span>
                      </div>
                      <span className="material-fecha">
                        Subido el {formatearFecha(a.createdAt)}
                      </span>
                      <button
                        className="material-mas"
                        onClick={(e) => e.preventDefault()}
                      >
                        <MoreVertical size={16} />
                      </button>
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

        <div className="detalle-sidebar-col">
          <div className="detalle-info-card">
            <h3>Informacion de la asignatura</h3>
            <div className="detalle-info-item">
              <User size={16} />
              <div>
                <span>Profesor</span>
                <strong>{detalle.profesor}</strong>
              </div>
            </div>
            <div className="detalle-info-item">
              <Layers size={16} />
              <div>
                <span>Curso</span>
                <strong>{detalle.curso}</strong>
              </div>
            </div>
            <div className="detalle-info-item">
              <Users size={16} />
              <div>
                <span>Estudiantes</span>
                <strong>{detalle.totalAlumnos}</strong>
              </div>
            </div>
            {detalle.rama && (
              <div className="detalle-info-item">
                <GitBranch size={16} />
                <div>
                  <span>Rama</span>
                  <strong>{detalle.rama}</strong>
                </div>
              </div>
            )}
          </div>

          <div className="detalle-proximas-card">
            <div className="detalle-proximas-header">
              <h3>Proximas clases</h3>
            </div>
            {detalle.proximasClases.length === 0 ? (
              <p className="material-vacio">No hay clases programadas.</p>
            ) : (
              detalle.proximasClases.map((c, i) => (
                <div key={i} className="detalle-proxima-item">
                  <CalendarCheck size={16} />
                  <div>
                    <strong>
                      {new Date(c.fecha).toLocaleDateString("es-ES", {
                        weekday: "long",
                        day: "numeric",
                        month: "short",
                      })}
                    </strong>
                    <span>
                      {c.horaInicio.slice(0, 5)} - {c.horaFin.slice(0, 5)}
                    </span>
                    {c.aula && <span>Aula {c.aula}</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {mostrarModalCarpeta && (
        <div
          className="modal-overlay"
          onClick={() => setMostrarModalCarpeta(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Nueva carpeta</h2>
            <label className="modal-label">Nombre de la carpeta</label>
            <input
              className="modal-input"
              placeholder="Ej: Unidad 1: Numeros reales"
              value={nombreCarpeta}
              onChange={(e) => setNombreCarpeta(e.target.value)}
            />
            <div className="modal-botones">
              <button
                className="modal-btn-cancelar"
                onClick={() => setMostrarModalCarpeta(false)}
              >
                Cancelar
              </button>
              <button className="modal-btn-crear" onClick={handleCrearCarpeta}>
                Crear carpeta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DetalleAsignaturaProfesor;
