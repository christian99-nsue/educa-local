import SummaryGrid from "../../components/SummaryGrid";
import { getUser } from "../../utils/auth";
import "../../styles/dashboard.css";

const Inicio = () => {
  const user = getUser();
  return (
    <div className="inicio content">
      <h1>Inicio</h1>
      <p className="subtitle">
        Hola, {user?.nombre} <br />
        Aquí tienes un resumen de hoy
      </p>
      <SummaryGrid />
    </div>
  );
};

export default Inicio;
