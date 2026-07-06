import SummaryCard from "./SummaryCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBook,
  faClipboardList,
  faCalendarDays,
  faSquarePollVertical,
} from "@fortawesome/free-solid-svg-icons";
const SummaryGrid = () => {
  return (
    <div className="summary-grid">
      <SummaryCard
        icon={<FontAwesomeIcon icon={faBook} />}
        title="Asignaturas Activas"
        path="asignaturas"
      />
      <SummaryCard
        icon={<FontAwesomeIcon icon={faClipboardList} />}
        title="Tareas Pendientes"
        path="tareas"
      />
      <SummaryCard
        icon={<FontAwesomeIcon icon={faSquarePollVertical} />}
        title="Promedio"
        path="calificaciones"
      />
      <SummaryCard
        icon={<FontAwesomeIcon icon={faCalendarDays} />}
        title="Proximas Clases"
        path="horario"
      />
    </div>
  );
};

export default SummaryGrid;
