import { useEffect, useState } from "react";
import { X, Upload, Calendar } from "lucide-react";
import { getCentroActivo } from "../utils/auth";

const API_URL = import.meta.env.VITE_API_URL;

interface AsignaturaOpcion {
  cursoAsignaturaId: number;
  label: string;
}
interface AsignaturaApiItem {
  curso_asignatura_id: number;
  nombre: string;
  curso: string;
  rama: string | null;
}

interface CrearTareaModalProps {
  onClose: () => void;
  onCreated: () => void;
}

function CrearTareaModal({ onClose, onCreated }: CrearTareaModalProps) {
  const [opciones, setOpciones] = useState<AsignaturaOpcion[]>([]);
  const [cursoAsignaturaId, setCursoAsignaturaId] = useState("");
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fechaLimite, setFechaLimite] = useState("");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    const cargarAsignaturas = async () => {
      const token = localStorage.getItem("token");
      const centroActivo = getCentroActivo();
      try {
        const res = await fetch(
          `${API_URL}/api/profesor/asignaturas/mis-asignaturas?centroId=${centroActivo.id}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const data = await res.json();
        const opcionesFormateadas = data.map((a: AsignaturaApiItem) => ({
          cursoAsignaturaId: a.curso_asignatura_id,
          label: `${a.nombre} - ${a.curso}${a.rama ? " - " + a.rama : ""}`,
        }));
        setOpciones(opcionesFormateadas);
      } catch (err) {
        console.log(err);
      }
    };
    cargarAsignaturas();
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      setArchivo(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async () => {
    setError("");

    if (!cursoAsignaturaId || !titulo || !fechaLimite) {
      setError("Completa los campos obligatorios");
      return;
    }

    setEnviando(true);
    const token = localStorage.getItem("token");
    const centroActivo = getCentroActivo();

    const formData = new FormData();
    formData.append("curso_asignatura_id", cursoAsignaturaId);
    formData.append("titulo", titulo);
    formData.append("descripcion", descripcion);
    formData.append("fecha_entrega", fechaLimite);
    formData.append("centroId", centroActivo.id);
    if (archivo) {
      formData.append("archivo", archivo);
    }

    try {
      const res = await fetch(`${API_URL}/api/profesor/tareas/crear`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Error al crear la tarea");
      }
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear la tarea");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>
        <h2>Crear nueva tarea</h2>
        <p className="modal-subtitle">Completa la informacion de la tarea</p>

        <label className="modal-label">Asignatura</label>
        <select
          className="modal-select"
          value={cursoAsignaturaId}
          onChange={(e) => setCursoAsignaturaId(e.target.value)}
        >
          <option value="">Selecciona una asignatura</option>
          {opciones.map((op) => (
            <option key={op.cursoAsignaturaId} value={op.cursoAsignaturaId}>
              {op.label}
            </option>
          ))}
        </select>

        <label className="modal-label">Titulo</label>
        <input
          className="modal-input"
          placeholder="Ej: Tareas 3: Ecuaciones"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
        />

        <label className="modal-label">Descripcion</label>
        <textarea
          className="modal-textarea"
          placeholder="Describe las instrucciones de la tarea..."
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />

        <label className="modal-label">Fecha limite</label>
        <div className="modal-fecha-wrapper">
          <input
            type="date"
            className="modal-input"
            value={fechaLimite}
            onChange={(e) => setFechaLimite(e.target.value)}
          />
          <Calendar size={16} className="modal-fecha-icon" />
        </div>

        <label className="modal-label">Archivos y recursos</label>
        <div
          className={`modal-dropzone ${dragActive ? "active" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById("input-archivo")?.click()}
        >
          <Upload size={20} color="#9333ea" />
          <p>
            {archivo ? (
              archivo.name
            ) : (
              <>
                Arrastra y suelta tu archivo aqui o{" "}
                <span className="modal-link">haz clic para seleccionar</span>
              </>
            )}
          </p>
          <span className="modal-formatos">
            Formatos permitidos PDF, DOCX, JPG, PNG
          </span>
          <input
            id="input-archivo"
            type="file"
            accept=".pdf,.docx,.jpg,.jpeg,.png"
            style={{ display: "none" }}
            onChange={(e) => setArchivo(e.target.files?.[0] || null)}
          />
        </div>

        {error && <p className="modal-error">{error}</p>}

        <div className="modal-botones">
          <button className="modal-btn-cancelar" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="modal-btn-crear"
            onClick={handleSubmit}
            disabled={enviando}
          >
            {enviando ? "Creando..." : "Crear Tarea"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CrearTareaModal;
