import { X, LogOut } from "lucide-react";
import "../styles/cerrarSesionModal.css";

interface CerrarSesionModalProps {
  onCancel: () => void;
  onConfirm: () => void;
}

function CerrarSesionModal({ onCancel, onConfirm }: CerrarSesionModalProps) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="cerrar-sesion-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onCancel}>
          <X size={18} />
        </button>

        <div className="cerrar-sesion-icono">
          <LogOut size={22} />
        </div>
        <h2>Cerrar sesion</h2>
        <p>
          ¿Estas seguro de que deseas cerrar sesion? Tendras que iniciar sesion
          nuevamente para acceder a tu cuenta.
        </p>
        <div className="cerrar-sesion-botones">
          <button className="btn-cancelar-sesion" onClick={onCancel}>
            Cancelar
          </button>
          <button className="btn-confirmar-cerrar-sesion" onClick={onConfirm}>
            Cerrar sesion
          </button>
        </div>
      </div>
    </div>
  );
}

export default CerrarSesionModal;
