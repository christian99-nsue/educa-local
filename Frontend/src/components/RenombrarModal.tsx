import { useState } from "react";
import { X } from "lucide-react";

interface REnombrarModalProps {
  titulo: string;
  nombreActual: string;
  onClose: () => void;
  onConfirmar: (nuevoNombre: string) => Promise<void>;
}

function RenombrarModal({
  titulo,
  nombreActual,
  onClose,
  onConfirmar,
}: REnombrarModalProps) {
  const [nombre, setNombre] = useState(nombreActual);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const handleGuardar = async () => {
    if (!nombre.trim()) return;
    setGuardando(true);
    setError("");
    try {
      await onConfirmar(nombre);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ width: 400 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>
        <h2>{titulo}</h2>
        <label className="modal-label">Nombre</label>
        <input
          className="modal-input"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          autoFocus
        />
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
            {guardando ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default RenombrarModal;
