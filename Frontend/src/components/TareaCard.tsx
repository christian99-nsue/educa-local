import { ChevronRight } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type IconDefinition } from "@fortawesome/free-solid-svg-icons";

interface TareaCardProps {
  titulo: string;
  asignatura: string;
  fechaEntrega: string;
  diasRestantes: number;
  estado: "activa" | "vencida" | "entregada" | "calificada";
  nota?: number | null;
  sistemaCalificacion: "sobre 10" | "sobre 100" | "A-F";
  color: string;
  bgColor: string;
  icono: IconDefinition;
  onClick: () => void;
}

type SistemaCalificacion = "sobre 10" | "sobre 100" | "A-F";

const estadoLabel: Record<string, string> = {
  activa: "En curso",
  vencida: "Vencida",
  entregada: "Entregada",
  calificada: "Calificada",
};

const estadoColor: Record<string, string> = {
  activa: "#18B300",
  vencida: "#FC4850",
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
  sistemaCalificacion,
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
  const getColorNota = (
    nota: string | number,
    sistema: SistemaCalificacion,
  ): string => {
    if (sistema === "A-F") {
      const letra = String(nota).toUpperCase();
      if (letra === "A" || letra === "B") return "#18B300";
      if (letra === "C") return "#F8C822";
      return "#FC4850";
    }

    const ValorNumerico = Number(nota);
    const maximo = sistema === "sobre 100" ? 100 : 10;
    const porcentaje = (ValorNumerico / maximo) * 100;

    if (porcentaje >= 70) return "#18B300";
    if (porcentaje >= 50) return "#F8C822";
    return "#FC4850";
  };

  return (
    <div className="tarea-row" onClick={onClick}>
      <div className="row-icon-tr" style={{ background: bgColor, color }}>
        <FontAwesomeIcon icon={icono} size="2xl" />
      </div>
      <div className="row-info-tr">
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
          <span
            className="tarea-nota"
            style={{
              color: getColorNota(nota, sistemaCalificacion),
              fontWeight: 600,
            }}
          >
            Nota: {nota}
          </span>
        )}
      </div>
      <div className="row-dias">
        {estado === "activa" || estado === "vencida" ? (
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
