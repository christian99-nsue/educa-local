import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers } from "@fortawesome/free-solid-svg-icons";

interface AsignaturaCardProfesorProps {
  nombre: string;
  curso: string;
  rama: string | null;
  codigo: string | null;
  totalAlumnos: number;
  color: string;
  bgColor: string;
  icono: React.ReactNode;
  onClick: () => void;
}

function AsignaturaCardProfesor({
  nombre,
  curso,
  rama,
  codigo,
  totalAlumnos,
  color,
  bgColor,
  icono,
  onClick,
}: AsignaturaCardProfesorProps) {
  return (
    <div className="asignaturas-card-pf">
      <div className="asignaturas-card-header-pf">
        <div
          className="asignaturas-icon-pf"
          style={{ background: bgColor, color }}
        >
          {icono}
        </div>
        <div>
          <h3>{nombre}</h3>
          <p className="profesor-pf">Curso: {curso}</p>
          {rama && <p className="rama-badge">{rama}</p>}
        </div>
      </div>
      <p className="codigo-asignatura">Codigo: {codigo ?? "-"}</p>
      <p className="alumnos-pf">
        <FontAwesomeIcon icon={faUsers} size="lg" /> {totalAlumnos} alumnos
      </p>
      <div className="asignaturas-footer-pf">
        <button className="btn-ver-detalles" onClick={onClick}>
          Ver detalles
        </button>
      </div>
    </div>
  );
}

export default AsignaturaCardProfesor;
