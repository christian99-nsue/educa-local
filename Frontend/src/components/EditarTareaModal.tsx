import { useState } from "react";
import { X, Upload } from "lucide-react";
import { getCentroActivo } from "../utils/auth";
import { AlertTriangle } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

interface EditarTareaModalProps {
  tareaId: number | string;
  asignatura: string;
  curso: string;
  tituloInicial: string;
  descripcionInicial: string;
  instruccionesInicial: string;
  fechaEntregaInicial: string;
  tieneEntregas: boolean;
  archivoNombreActual: string | null;
  onClose: () => void;
  onGuardado: () => void;
}

function EditarTareaModal({
  tareaId,
  asignatura,
  curso,
  tituloInicial,
  descripcionInicial,
  instruccionesInicial,
  fechaEntregaInicial,
  tieneEntregas,
  archivoNombreActual,
  onClose,
  onGuardado,
}: EditarTareaModalProps) {
  const fechaObj = new Date(fechaEntregaInicial);
  const [titulo, setTitulo] = useState(tituloInicial);
  const [descripcion, setDescripcion] = useState(descripcionInicial);
  const [instrucciones, setInstrucciones] = useState(instruccionesInicial);
  const [dia, setDia] = useState(String(fechaObj.getDate()).padStart(2, "0"));
  const [mes, setMes] = useState(
    String(fechaObj.getMonth() + 1).padStart(2, "0"),
  );
  const [anio, setAnio] = useState(String(fechaObj.getFullYear()));
  const [horas, setHoras] = useState(
    String(fechaObj.getHours()).padStart(2, "0"),
  );
  const [minutos, setMinutos] = useState(
    String(fechaObj.getMinutes()).padStart(2, "0"),
  );
  const [archivo, setArchivo] = useState<File | null>(null);
  const [nombreArchivoActual, setNombreArchivoActual] =
    useState(archivoNombreActual);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const handleGuardar = async () => {
    if (!titulo || !descripcion || !dia || !mes || !anio) {
      setError("Completa los campos obligatorios");
      return;
    }
    setGuardando(true);
    setError("");
    const token = localStorage.getItem("token");
    const centroActivo = getCentroActivo();

    const formData = new FormData();
    formData.append("centroId", String(centroActivo.id));
    formData.append("titulo", titulo);
    formData.append("descripcion", descripcion);
    formData.append("instrucciones", instrucciones);
    formData.append(
      "fecha_entrega",
      `${anio}-${mes}-${dia} ${horas}:${minutos}:00`,
    );
    if (archivo) {
      formData.append("archivo", archivo);
    }

    try {
      const res = await fetch(
        `${API_URL}/api/profesor/tarea/${tareaId}/editar`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        },
      );
      const data = await res.json();
      if (!res.ok)
        throw new Error(data?.error || "Error al actualizar la tarea");

      onGuardado();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al actualizar la tarea",
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>
        <h2>Editar tarea</h2>
        <p className="modal-subtitle">
          {asignatura} • {curso}
        </p>

        <label className="modal-label">Titulo de la tarea *</label>
        <input
          className="modal-input"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
        />

        <label className="modal-label">Descripcion *</label>
        <textarea
          className="modal-textarea"
          maxLength={500}
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />
        <p className="modal-contador">{descripcion.length}/500</p>

        <label className="modal-label">Fecha limite *</label>
        <div className="modal-fecha-hora-grid">
          <div className="modal-fecha-selects">
            <select
              className="modal-select"
              value={dia}
              onChange={(e) => setDia(e.target.value)}
            >
              {Array.from({ length: 31 }, (_, i) =>
                String(i + 1).padStart(2, "0"),
              ).map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <select
              className="modal-select"
              value={mes}
              onChange={(e) => setMes(e.target.value)}
            >
              {Array.from({ length: 12 }, (_, i) =>
                String(i + 1).padStart(2, "0"),
              ).map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <select
              className="modal-select"
              value={anio}
              onChange={(e) => setAnio(e.target.value)}
            >
              {Array.from({ length: 6 }, (_, i) =>
                String(new Date().getFullYear() - 1 + i),
              ).map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))} 
            </select>
          </div>
          <div className="modal-hora-selects">
            <select
              className="modal-select"
              value={horas}
              onChange={(e) => setHoras(e.target.value)}
            >
              {Array.from({ length: 24 }, (_, i) =>
                String(i).padStart(2, "0"),
              ).map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
            <span>:</span>
            <select
              className="modal-select"
              value={minutos}
              onChange={(e) => setMinutos(e.target.value)}
            >
              {Array.from({ length: 60 }, (_, i) =>
                String(i).padStart(2, "0"),
              ).map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        <label className="modal-label">Archivo del enunciado</label>
        {nombreArchivoActual && !archivo && (
          <div className="modal-archivo-actual">
            <span>{nombreArchivoActual}</span>
            <label className="modal-link-cambiar">
              Cambiar archivo
              <input
                type="file"
                style={{ display: "none" }}
                onChange={(e) => setArchivo(e.target.files?.[0] || null)}
              />
            </label>
            <button onClick={() => setNombreArchivoActual(null)}>
              <X size={14} />
            </button>
          </div>
        )}
        {(!nombreArchivoActual || archivo) && (
          <label className="modal-dropzone">
            <Upload size={18} color="#9333ea" />
            <p>{archivo ? archivo.name : "Selecciona un nuevo archivo"}</p>
            <input
              type="file"
              style={{ display: "none" }}
              onChange={(e) => setArchivo(e.target.files?.[0] || null)}
            />
          </label>
        )}

        <label className="modal-label">Instrucciones (opcional)</label>
        <textarea
          className="modal-textarea"
          value={instrucciones}
          onChange={(e) => setInstrucciones(e.target.value)}
        />

        {tieneEntregas && (
          <div className="modal-aviso-entregas">
            <AlertTriangle size={14} /> Esta tarea ya tiene entregas. Los
            cambios pueden afectar a los estudiantes.
          </div>
        )}

        {error && <p className="modal-error">{error}</p>}

        <div className="modal-botones">
          <button className="modal-btn-cancelar" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="modal-btn-crear"
            onClick={handleGuardar}
            disabled={guardando}
          >
            {guardando ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditarTareaModal;
