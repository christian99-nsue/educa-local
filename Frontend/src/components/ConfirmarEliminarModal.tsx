import { X, AlertTriangle } from "lucide-react";
import { useState } from "react";

interface ConfirmarEliminarModalProps {
  titulo: string;
  mensaje: string;
  onClose: () => void;
  onConfirmar: () => Promise<void>;
}

function ConfirmarEliminarModal({
  titulo,
  mensaje,
  onClose,
  onConfirmar,
}: ConfirmarEliminarModalProps) {
  const [eliminando, setEliminando] = useState(false);
  const [error, setError] = useState("");

  const handleEliminar = async () => {
    setEliminando(true);
    setError("");
    try {
      await onConfirmar();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar");
    } finally {
      setEliminando(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="cerrar-sesion-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={18} />
        </button>
        <div className="cerrar-sesion-icono">
          <AlertTriangle size={22} />
        </div>
        <h2>{titulo}</h2>
        <h2 className="mensaje">{mensaje}</h2>
        {error && <p className="modal-error">{error}</p>}
        <div className="cerrar-sesion-botones">
          <button className="btn-cancelar-sesion" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="btn-confirmar-cerrar-sesion"
            onClick={handleEliminar}
            disabled={eliminando}
          >
            {eliminando ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmarEliminarModal;
