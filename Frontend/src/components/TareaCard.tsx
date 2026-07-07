import { ChevronRight } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type IconDefinition } from "@fortawesome/free-solid-svg-icons";

interface TareaCardProps {
  titulo: string;
  asignatura: string;
  fechaEntrega: string;
  diasRestantes: number;
  estado: "activa" | "atrasada" | "entregada" | "calificada";
  nota?: number | null;
  color: string;
  bgColor: string;
  icono: IconDefinition;
  onClick: () => void;
}

const estadoLabel: Record<string, string> = {
  activa: "En curso",
  atrasada: "Atrasada",
  entregada: "Entregada",
  calificada: "Calificada",
};

const estadoColor: Record<string, string> = {
  activa: "#18B300",
  atrasada: "#FC4850",
  entregada: "#59ADFF",
  calificada: "#B032E7",
};

function TareaCard({
  titulo,
  asignatura,
  fechaEntrega,
  diasRestantes,
  estado,
  nota,
  color,
  bgColor,
  icono,
  onClick,
}: TareaCardProps) {
  const fechaFormateada = new Date(fechaEntrega).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="tarea-row" onClick={onClick}>
      <div className="row-icon" style={{ background: bgColor, color }}>
        <FontAwesomeIcon icon={icono} size="lg" />
      </div>
      <div className="row-info">
        <h3>{titulo}</h3>
        <p>Asignatura: {asignatura}</p>
        <p>Fecha de entrega: {fechaFormateada}</p>
      </div>
      <div className="tarea-estado">
        <span
          className="estado-badge"
          style={{
            color: estadoColor[estado],
            borderColor: estadoColor[estado],
          }}
        >
          {estadoLabel[estado]}
        </span>
        {estado === "calificada" && nota != null && (
          <span className="tarea-nota">Nota: {nota}</span>
        )}
      </div>
      <div className="row-dias">
        {estado === "activa" || estado === "atrasada" ? (
          <span>
            {diasRestantes >= 0
              ? `Faltan ${diasRestantes} dias`
              : `Vencida hace ${Math.abs(diasRestantes)} dias`}
          </span>
        ) : (
          <span>&nbsp;</span>
        )}
      </div>
      <ChevronRight size={20} color="gray" />
    </div>
  );
}

export default TareaCard;
