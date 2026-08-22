import { useState } from "react";
import { X } from "lucide-react";

interface AsignaturaOpcion {
  cursoAsignaturaId: number;
  asignatura: string;
  profesor: string | null;
}

interface ClaseModalProps {
  asignaturas: AsignaturaOpcion[];
  diaInicial: number;
  diaNombre: string;
  horaInicioInicial?: string;
  horaFinInicial?: string;
  cursoAsignaturaIdInicial?: number;
  esEdicion: boolean;
  onClose: () => void;
  onGuardar: (datos: {
    cursoAsignaturaId: number;
    diaSemana: number;
    horaInicio: string;
    horaFin: string;
  }) => Promise<void>;
  onEliminar?: () => Promise<void>;
}

const DIAS = [
  { num: 1, nombre: "Lunes" },
  { num: 2, nombre: "Martes" },
  { num: 3, nombre: "Miercoles" },
  { num: 4, nombre: "Jueves" },
  { num: 5, nombre: "Viernes" },
];

function ClaseModal({
  asignaturas,
  diaInicial,
  diaNombre,
  horaInicioInicial,
  horaFinInicial,
  cursoAsignaturaIdInicial,
  esEdicion,
  onClose,
  onGuardar,
  onEliminar,
}: ClaseModalProps) {
  const [cursoAsignaturaId, setCursoAsignaturaId] = useState(
    cursoAsignaturaIdInicial ?? 0,
  );
  const [dia, setDia] = useState(diaInicial);
  const [horaInicio, setHoraInicio] = useState(horaInicioInicial ?? "08:00");
  const [horaFin, setHoraFin] = useState(horaFinInicial ?? "08:55");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const handleGuardar = async () => {
    if (!cursoAsignaturaId) {
      setError("Selecciona una asignatura");
      return;
    }
    setGuardando(true);
    setError("");
    try {
      await onGuardar({
        cursoAsignaturaId,
        diaSemana: dia,
        horaInicio,
        horaFin,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async () => {
    if (!onEliminar) return;
    setGuardando(true);
    try {
      await onEliminar();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ width: 380 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose}>
          <X size={18} />
        </button>
        <h2>{esEdicion ? "Editar clase" : "Añadir clase"}</h2>

        <label className="modal-label">Asignatura *</label>
        <select
          className="modal-select"
          value={cursoAsignaturaId}
          onChange={(e) => setCursoAsignaturaId(Number(e.target.value))}
        >
          <option value={0}>Selecciona una asignatura</option>
          {asignaturas.map((a) => (
            <option key={a.cursoAsignaturaId} value={a.cursoAsignaturaId}>
              {a.asignatura} {a.profesor ? `(${a.profesor})` : ""}
            </option>
          ))}
        </select>

        <label className="modal-label">Dia *</label>
        <select
          className="modal-select"
          value={dia}
          onChange={(e) => setDia(Number(e.target.value))}
        >
          {DIAS.map((d) => (
            <option key={d.num} value={d.num}>
              {d.nombre}
            </option>
          ))}
        </select>

        <div className="crear-curso-grid-2">
          <div>
            <label className="modal-label">Hora de inicio *</label>
            <input
              type="time"
              className="modal-input"
              value={horaInicio}
              onChange={(e) => setHoraInicio(e.target.value)}
            />
          </div>
          <div>
            <label className="modal-label">Hora de fin *</label>
            <input
              type="time"
              className="modal-input"
              value={horaFin}
              onChange={(e) => setHoraFin(e.target.value)}
            />
          </div>
        </div>

        {error && <p className="modal-error">{error}</p>}

        <div className="modal-botones">
          {esEdicion && onEliminar && (
            <button
              className="modal-btn-cancelar"
              style={{ color: "#dc2626" }}
              onClick={handleEliminar}
              disabled={guardando}
            >
              Eliminar
            </button>
          )}
          <button className="modal-btn-cancelar" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="modal-btn-crear"
            onClick={handleGuardar}
            disabled={guardando}
          >
            {guardando
              ? "Guardando..."
              : esEdicion
                ? "Guardar cambios"
                : "Añadir clase"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ClaseModal;
