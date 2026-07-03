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
      />
      <SummaryCard
        icon={<FontAwesomeIcon icon={faClipboardList} />}
        title="Tareas Pendientes"
      />
      <SummaryCard
        icon={<FontAwesomeIcon icon={faSquarePollVertical} />}
        title="Promedio"
      />
      <SummaryCard
        icon={<FontAwesomeIcon icon={faCalendarDays} />}
        title="Proximas Clases"
      />
    </div>
  );
};

export default SummaryGrid;
