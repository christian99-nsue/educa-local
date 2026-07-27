import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Download,
  Upload,
  Calendar,
  MessageSquare,
  Clock,
  CheckCircle2,
  ClipboardCheck,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolder } from "@fortawesome/free-solid-svg-icons";
import { getCentroActivo } from "../../utils/auth";
import { getMaterialIcono, formatearTamano } from "../../utils/materialIconos";
import "../../styles/detalleTareaAlumno.css";

const API_URL = import.meta.env.VITE_API_URL;

interface Entrega {
  fechaEntregaReal: string;
  archivoUrl: string | null;
  archivoNombre: string | null;
  archivoTamano: number | null;
  comentario: string | null;
}

interface Calificacion {
  nota: string;
  estado: string | null;
  color: { bg: string; color: string } | null;
}

interface DetalleTarea {
  id: number;
  titulo: string;
  descripcion: string | null;
  instrucciones: string | null;
  fechaCreacion: string;
  fechaEntrega: string;
  archivoUrl: string | null;
  archivoNombre: string | null;
  asignatura: string;
  profesor: string;
  estado: "pendiente" | "entregada" | "calificada" | "vencida";
  miEntrega: Entrega | null;
  calificacion: Calificacion | null;
  vencida: boolean;
}

const estadoLabel: Record<string, string> = {
  pendiente: "Pendiente",
  entregada: "Entregado",
  calificada: "Calificada",
  vencida: "Vencida",
};

const estadoEstilo: Record<string, { bg: string; color: string }> = {
  pendiente: { bg: "#fef3c7", color: "#d97706" },
  entregada: { bg: "#dcfce7", color: "#16a34a" },
  calificada: { bg: "#dbeafe", color: "#2563eb" },
  vencida: { bg: "#fee2e2", color: "#dc2626" },
};

function DetalleTareaAlumno() {
  const { tareaId } = useParams();
  const navigate = useNavigate();
  const [tarea, setTarea] = useState<DetalleTarea | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const cargar = async () => {
    const token = localStorage.getItem("token");
    const centroActivo = getCentroActivo();
    try {
      const res = await fetch(
        `${API_URL}/api/alumno/tarea/${tareaId}/detalle?centroId=${centroActivo.id}`,
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
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de datos al montar, patron estandar
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tareaId]);

  const formatearFecha = (fecha: string) =>
    new Date(fecha).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const formatearFechaHora = (fecha: string) =>
    new Date(fecha).toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) setArchivo(e.dataTransfer.files[0]);
  };

  const handleEntregar = async () => {
    if (!archivo) {
      setError("Selecciona un archivo antes de entregar");
      return;
    }
    setEnviando(true);
    setError("");
    const token = localStorage.getItem("token");
    const centroActivo = getCentroActivo();

    const formData = new FormData();
    formData.append("centroId", String(centroActivo.id));
    formData.append("archivo", archivo);

    try {
      const res = await fetch(
        `${API_URL}/api/alumno/tarea/${tareaId}/entregar`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error al entregar la tarea");
      setArchivo(null);
      cargar();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al entregar la tarea",
      );
    } finally {
      setEnviando(false);
    }
  };

  if (loading) return <p>Cargando tarea...</p>;
  if (error && !tarea) {
    return (
      <div className="content">
        <p>{error}</p>
      </div>
    );
  }
  if (!tarea) return null;

  return (
    <div className="content detalle-tarea-alumno-page">
      <div className="detalle-asig-breadcrumb">
        <span onClick={() => navigate("/alumno/tareas")}>Tareas</span>{" "}
        <ChevronRight size={12} /> <strong>{tarea.titulo}</strong>
      </div>

      <h1>{tarea.titulo}</h1>
      <p className="dta-asignatura">
        {" "}
        <FontAwesomeIcon icon={faFolder} /> {tarea.asignatura}
      </p>
      <p className="dta-profesor">{tarea.profesor}</p>

      <div className="dta-layout">
        <div className="dta-col-izq">
          <div className="dta-card">
            <h3>Descripcion de la tarea</h3>
            <p>{tarea.descripcion || "Sin descripcion."}</p>
          </div>

          {tarea.instrucciones && (
            <div className="dta-card">
              <h3>Instrucciones</h3>
              <ul className="instrucciones-lista">
                {tarea.instrucciones
                  .split("\n")
                  .filter((l) => l.trim() !== "")
                  .map((l, i) => (
                    <li key={i}>{l}</li>
                  ))}
              </ul>
            </div>
          )}

          <div className="dta-card">
            <h3>Archivo adjunto</h3>
            {tarea.archivoUrl ? (
              (() => {
                const ext =
                  tarea.archivoNombre?.split(".").pop()?.toLowerCase() || "";
                const { icon, bg, color } = getMaterialIcono(ext);
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
                      <FontAwesomeIcon icon={icon} size="lg" />
                    </div>
                    <div>
                      <strong>{tarea.archivoNombre}</strong>
                    </div>
                    <Download size={16} />
                  </a>
                );
              })()
            ) : (
              <p className="material-vacio">No hay archivo adjunto.</p>
            )}
          </div>

          <div className="dta-card">
            <h3>
              <MessageSquare size={16} /> Comentarios del profesor
            </h3>
            {tarea.miEntrega?.comentario ? (
              <div className="dta-comentario-box">
                <p>{tarea.miEntrega.comentario}</p>
                {tarea.calificacion && (
                  <span className="dta-comentario-fecha">
                    Calificado el{" "}
                    {formatearFechaHora(tarea.miEntrega.fechaEntregaReal)}
                  </span>
                )}
              </div>
            ) : (
              <p className="dta-sin-comentarios">
                <Clock size={14} /> Aun no hay comentarios.{" "}
                {tarea.estado !== "calificada" &&
                  "Tu tarea esta pendiente de calificacion."}
              </p>
            )}
          </div>
        </div>

        <div className="dta-col-der">
          <div className="dta-card">
            <div className="dta-estado-header">
              <span>
                {tarea.estado === "calificada" ? (
                  <ClipboardCheck size={16} />
                ) : tarea.estado === "entregada" ? (
                  <CheckCircle2 size={16} />
                ) : (
                  <Calendar size={16} />
                )}{" "}
                Estado
              </span>
              <span
                className="estado-pill"
                style={{
                  background: estadoEstilo[tarea.estado].bg,
                  color: estadoEstilo[tarea.estado].color,
                }}
              >
                {estadoLabel[tarea.estado]}
              </span>
            </div>
            <div className="dta-info-row">
              <span>Fecha de publicacion</span>
              <strong>{formatearFecha(tarea.fechaCreacion)}</strong>
            </div>
            <div className="dta-info-row">
              <span>Fecha limite de entrega</span>
              <strong>{formatearFechaHora(tarea.fechaEntrega)}</strong>
            </div>
            {tarea.miEntrega && (
              <div className="dta-info-row">
                <span>Fecha de entrega</span>
                <strong>
                  {formatearFechaHora(tarea.miEntrega.fechaEntregaReal)}
                </strong>
              </div>
            )}
          </div>

          {tarea.calificacion && (
            <div className="dta-card">
              <h3>Calificacion</h3>
              <div
                className="dta-calificacion-box"
                style={{ background: tarea.calificacion.color?.bg }}
              >
                <strong style={{ color: tarea.calificacion.color?.color }}>
                  {tarea.calificacion.nota}
                </strong>
                {tarea.calificacion.estado && (
                  <span style={{ color: tarea.calificacion.color?.color }}>
                    ☆ {tarea.calificacion.estado}
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="dta-card">
            <h3>Tu entrega</h3>
            {tarea.miEntrega ? (
              <>
                <p className="dta-entrega-realizada">✓ Entrega realizada</p>
                {tarea.miEntrega.archivoUrl &&
                  (() => {
                    const ext =
                      tarea
                        .miEntrega!.archivoNombre?.split(".")
                        .pop()
                        ?.toLowerCase() || "";
                    const { icon, bg, color } = getMaterialIcono(ext);
                    return (
                      <a
                        className="archivo-adjunto"
                        href={tarea.miEntrega.archivoUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <div
                          className="archivo-adjunto-icono"
                          style={{ background: bg, color }}
                        >
                          <FontAwesomeIcon icon={icon} size="xs" />
                        </div>
                        <div>
                          <strong>{tarea.miEntrega.archivoNombre}</strong>
                          <span>
                            {formatearTamano(tarea.miEntrega.archivoTamano)}
                          </span>
                        </div>
                        <Download size={16} />
                      </a>
                    );
                  })()}
              </>
            ) : tarea.vencida ? (
              <div className="dta-tarea-vencida">
                {" "}
                <AlertTriangle size={20} />
                <p>
                  El plazo de entrega para esta tarea ha vencido. Ya no es
                  posible realizar la entrega.
                </p>
              </div>
            ) : (
              <>
                <p className="dta-sin-entrega">
                  Todavia no has entregado esta tarea.
                </p>
                <div
                  className={`modal-dropzone ${dragActive ? "active" : ""}`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleDrop}
                  onClick={() => inputRef.current?.click()}
                >
                  <Upload size={18} color="#9333ea" />
                  <p>
                    {archivo ? (
                      archivo.name
                    ) : (
                      <>
                        Arrastra tu archivo aqui o{" "}
                        <span className="modal-link">selecciona</span>
                      </>
                    )}
                  </p>
                  <span className="modal-formatos">
                    Formatos permitidos PDF, JPG, PNG
                  </span>
                  <input
                    ref={inputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    style={{ display: "none" }}
                    onChange={(e) => setArchivo(e.target.files?.[0] || null)}
                  />
                </div>
                {error && <p className="modal-error">{error}</p>}
                <button
                  className="btn-entregar-tarea"
                  onClick={handleEntregar}
                  disabled={enviando}
                >
                  {enviando ? "Entregando..." : "Entregar tarea"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetalleTareaAlumno;
