import { useEffect, useState } from "react";
import { X, ArrowLeft, Download } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getCentroActivo } from "../utils/auth";
import { getMaterialIcono } from "../utils/materialIconos";
import "../styles/calificarModal.css";

const API_URL = import.meta.env.VITE_API_URL;

interface CalificarModalProps {
  tareaId: number | string;
  alumnoId: number;
  onClose: () => void;
  onGuardado: () => void;
}

interface EntregaDetalle {
  id: number;
  nombre: string;
  apellidos: string;
  estado: string;
  fechaEntregaReal: string | null;
  nota: number | null;
  comentario: string | null;
  archivoUrl: string | null;
  archivoNombre: string | null;
  archivoTamano: number | null;
}

function CalificarModal({
  tareaId,
  alumnoId,
  onClose,
  onGuardado,
}: CalificarModalProps) {
  const [entrega, setEntrega] = useState<EntregaDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [nota, setNota] = useState("");
  const [comentario, setComentario] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [guardadoExito, setGuardadoExito] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargar = async () => {
      const token = localStorage.getItem("token");
      const centroActivo = getCentroActivo();
      try {
        const res = await fetch(
          `${API_URL}/api/profesor/tarea/${tareaId}/entrega/${alumnoId}?centroId=${centroActivo.id}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const data = await res.json();
        if (!res.ok)
          throw new Error(data?.error || "Error al cargar la entrega");
        setEntrega(data);
        if (data.nota != null) setNota(String(data.nota));
        if (data.comentario) setComentario(data.comentario);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al cargar la entrega",
        );
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [tareaId, alumnoId]);

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

  const handleGuardar = async () => {
    if (!nota) {
      setError("La nota es requerida");
      return;
    }
    setGuardando(true);
    setError("");
    const token = localStorage.getItem("token");
    const centroActivo = getCentroActivo();

    try {
      const res = await fetch(
        `${API_URL}/api/profesor/tarea/${tareaId}/entrega/${alumnoId}/calificar`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            centroId: centroActivo.id,
            nota: Number(nota),
            comentario,
          }),
        },
      );
      const data = await res.json();
      if (!res.ok)
        throw new Error(data?.error || "Error al guardar la calificacion");

      setGuardadoExito(true);
      onGuardado();
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al guardar la calificacion",
      );
    } finally {
      setGuardando(false);
    }
  };

  const esImagen = (nombre: string | null) => {
    const ext = nombre?.split(".").pop()?.toLowerCase();
    return ext === "jpg" || ext === "jpeg" || ext === "png";
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="calificar-modal" onClick={(e) => e.stopPropagation()}>
        <div className="calificar-modal-header">
          <button className="btn-volver-modal" onClick={onClose}>
            <ArrowLeft size={16} />
          </button>
          <h2>
            {entrega ? `${entrega.nombre} ${entrega.apellidos}` : "Cargando..."}
          </h2>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <p style={{ padding: 20 }}>Cargando...</p>
        ) : entrega ? (
          <div className="calificar-modal-body">
            <div className="calificar-col-info">
              <h4>Informacion</h4>
              <p className="calificar-label">
                {entrega.fechaEntregaReal ? "Entregado el" : "Estado"}
              </p>
              <p className="calificar-valor">
                {entrega.fechaEntregaReal
                  ? formatearFechaHora(entrega.fechaEntregaReal)
                  : entrega.estado === "calificada"
                    ? "Calificado sin entrega digital (ej. examen en papel)"
                    : "No entregado"}
              </p>

              {entrega.archivoNombre && (
                <>
                  <p className="calificar-label">Archivo entregado</p>
                  {(() => {
                    const ext = entrega
                      .archivoNombre!.split(".")
                      .pop()!
                      .toLowerCase();
                    const { icon, bg, color } = getMaterialIcono(ext);
                    return (
                      <div className="calificar-archivo">
                        <div
                          className="calificar-archivo-icono"
                          style={{ background: bg, color }}
                        >
                          <FontAwesomeIcon icon={icon} size="xs" />
                        </div>
                        <div>
                          <strong>{entrega.archivoNombre}</strong>
                          <span>
                            {ext.toUpperCase()} •{" "}
                            {entrega.archivoTamano
                              ? `${(entrega.archivoTamano / (1024 * 1024)).toFixed(1)} MB`
                              : ""}
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                  <a
                    className="calificar-btn-descargar"
                    href={entrega.archivoUrl ?? "#"}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Download size={14} /> Descargar
                  </a>
                </>
              )}

              <div className="calificar-form">
                <label>Calificacion</label>
                <div className="calificar-nota-input-wrapper">
                  <input
                    type="number"
                    min={0}
                    max={10}
                    step={0.1}
                    placeholder="Nota"
                    value={nota}
                    onChange={(e) => setNota(e.target.value)}
                  />
                  <span>/ 10</span>
                </div>

                <label>Comentario (opcional)</label>
                <textarea
                  placeholder="Escribe un comentario para el estudiante..."
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                />

                {error && <p className="modal-error">{error}</p>}
                {guardadoExito && (
                  <p className="calificar-exito">
                    ✓ Calificacion guardada correctamente
                  </p>
                )}

                {!guardadoExito && (
                  <div className="calificar-botones">
                    <button className="modal-btn-cancelar" onClick={onClose}>
                      Cancelar
                    </button>
                    <button
                      className="modal-btn-crear"
                      onClick={handleGuardar}
                      disabled={guardando}
                    >
                      {guardando ? "Guardando..." : "Guardar calificacion"}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="calificar-col-preview">
              <h4>Vista previa</h4>
              <div className="calificar-preview-box">
                {entrega.archivoUrl ? (
                  esImagen(entrega.archivoNombre) ? (
                    <img src={entrega.archivoUrl} alt="entrega" />
                  ) : (
                    <div className="calificar-preview-sin-imagen">
                      <p>
                        Vista previa no disponible para este tipo de archivo.
                      </p>
                      <a
                        href={entrega.archivoUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Abrir archivo
                      </a>
                    </div>
                  )
                ) : (
                  <div className="calificar-preview-sin-imagen">
                    <p>El estudiante no ha entregado ningun archivo.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <p style={{ padding: 20 }}>{error}</p>
        )}
      </div>
    </div>
  );
}

export default CalificarModal;
