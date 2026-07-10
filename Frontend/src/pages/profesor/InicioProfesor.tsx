import SummaryGridProfesor from "../../components/SummaryGridProfesor";
import { getUser } from "../../utils/auth";
import "../../styles/dashboardProfesor.css";

const InicioProfesor = () => {
  const user = getUser();
  return (
    <div className="inicio-pf content-pf">
      <h1>Inicio</h1>
      <p className="subtitle">
        Hola, {user?.nombre} <br />
        Aquí tienes un resumen de hoy
      </p>
      <SummaryGridProfesor />
    </div>
  );
};

export default InicioProfesor;
