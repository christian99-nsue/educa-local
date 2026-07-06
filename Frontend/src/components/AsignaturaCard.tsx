{
  /*import { ChevronRight } from "lucide-react";*/
}
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleRight,
  type IconDefinition,
} from "@fortawesome/free-solid-svg-icons";

interface AsignaturaCardProps {
  nombre: string;
  profesor?: string;
  asistencia?: number;
  tareasPendientes?: number;
  color: string;
  bgColor: string;
  icono: IconDefinition;
  onClick: () => void;
}

function AsignaturaCard({
  nombre,
  profesor = "Prof. Por asignar",
  asistencia,
  tareasPendientes = 5,
  color,
  bgColor,
  icono,
  onClick,
}: AsignaturaCardProps) {
  return (
    <div className="asignaturas-card" onClick={onClick}>
      <div className="asignaturas-card-header">
        <div
          className="asignaturas-icon"
          style={{ background: bgColor, color }}
        >
          <FontAwesomeIcon icon={icono} size="lg" />
        </div>
        <div>
          <h3>{nombre}</h3>
          <p className="profesor">{profesor}</p>
        </div>
      </div>
      <div className="progreso-wrapper">
        <div className="progreso-label">
          <span>Asistencia</span>
          <span>{asistencia}%</span>
        </div>
        <div className="progreso-bar-bg">
          <div
            className="progreso-bar-fill"
            style={{ width: `${asistencia}%`, background: color }}
          />
        </div>
      </div>
      <div className="asignaturas-footer">
        <span className="tareas">
          {tareasPendientes > 0
            ? `${tareasPendientes} tareas pendientes`
            : "sin tareas pendientes"}
        </span>
        <FontAwesomeIcon icon={faAngleRight} />
        {/*    <ChevronRight size={18} />*/}
      </div>
    </div>
  );
}

export default AsignaturaCard;
