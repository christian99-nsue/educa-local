import SummaryCard from "./SummaryCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBook,
  faClipboardList,
  faCalendarDays,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
const SummaryGridProfesor = () => {
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
        icon={<FontAwesomeIcon icon={faUsers} />}
        title="Asistencia"
        path="asistencia"
      />
      <SummaryCard
        icon={<FontAwesomeIcon icon={faCalendarDays} />}
        title="Proximas Clases"
        path="horario"
      />
    </div>
  );
};

export default SummaryGridProfesor;
