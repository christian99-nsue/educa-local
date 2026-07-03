import Sidebar from "../../componets/student/Sidebar";
import Header from "../../componets/Header";
import SummaryGrid from "../../componets/student/SummaryGrid";
import { getUser } from "../../utils/auth";
import "../../styles/dashboard.css";

const Dashboard = () => {
  const user = getUser();
  return (
    <div className="layout">
      <Sidebar />
      <div className="main">
        <Header />

        <div className="content">
          <h1>Inicio</h1>
          <p className="subtitle">
            Hola, {user?.nombre} <br />
            Aquí tienes un resumen de hoy
          </p>
          <SummaryGrid />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
