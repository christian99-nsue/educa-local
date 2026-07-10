import { useLocation, useNavigate } from "react-router-dom";
import RegisterSteps from "../../components/RegisterSteps";
import { faUsers } from "@fortawesome/free-solid-svg-icons";
import "../../styles/Login.css";

// IMAGES
import logo from "../../assets/images/Libro1.1.png";
import illustration from "../../assets/images/IMG3.1.png";
import imagen from "../../assets/images/imagen_centro.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface CentroData {
  nombre_del_centro: string;
  tipo_de_centro: string;
  pais: string;
  ciudad: string;
  direccion: string;
  telefono: string;
  email: string;
}

interface AdminData {
  nombre: string;
  apellidos: string;
  correo: string;
  telefono: string;
  password: string;
}

interface ConfiguracionData {
  anoAcademico: string;
  idiomaSistema: string;
  zonaHoraria: string;
  sistemaCalificacion: string;
  inicioAnoAcademico: string | null;
}

// Convierte "2024-2025" -> "2024 - 2025"
const formatearAnoAcademico = (valor?: string) => {
  if (!valor) return "";
  return valor.replace("-", " - ");
};

const RegisterConfirmation = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  // Recupera los datos acumulados de todos los pasos anteriores
  const centro: CentroData | null =
    state?.centro ??
    JSON.parse(sessionStorage.getItem("registro_centro") ?? "null");

  const admin: AdminData | null =
    state?.admin ??
    JSON.parse(sessionStorage.getItem("registro_admin") ?? "null");

  const configuracion: ConfiguracionData | null =
    state?.configuracion ??
    JSON.parse(sessionStorage.getItem("registro_configuracion") ?? "null");

  const nombreCompletoAdmin = admin
    ? `${admin.nombre} ${admin.apellidos}`.trim()
    : "";

  const handleIrAlPanel = () => {
    // Limpia los datos temporales del registro
    sessionStorage.removeItem("registro_centro");
    sessionStorage.removeItem("registro_admin");
    sessionStorage.removeItem("registro_estructura");
    sessionStorage.removeItem("registro_configuracion");

    navigate("/admin");
  };

  const filasResumen = [
    { label: "Centro", valor: centro?.nombre_del_centro ?? "—" },
    { label: "Administrador", valor: nombreCompletoAdmin ?? "—" },
    {
      label: "Año académico",
      valor: formatearAnoAcademico(configuracion?.anoAcademico) || "—",
    },
  ];

  return (
    <div className="login-container">
      {/* LEFT SIDE */}
      <div className="login-left">
        <div className="edu-logo">
          <img src={logo} className="logo-img" />
          <h1 className="edu-local-logo">EDUCA LOCAL</h1>
        </div>

        <h1 className="edu">
          Tu educacion,
          <br /> <span>sin limites</span>
        </h1>
        <p>
          Accede a tus cursos, tareas y recursos
          <br />
          desde cualquier lugar. Aprende, crece
          <br />y alcanza tus metas.
        </p>
        <div className="illustration">
          <img src={illustration} />
        </div>
        <div className="oval-note">
          <span className="oval">
            <FontAwesomeIcon icon={faUsers} size="2x" />
          </span>
          <small>
            Miles de estudiantes ya estan aprendiendo en Educa Local
          </small>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="login-right-reg">
        <RegisterSteps currentStep={5} />
        <div className="info">
          <div className="image">
            <img src={imagen} />
          </div>
          <div className="centro-reg">
            <h3>
              ¡Centro registrado <br /> correctamente!
            </h3>
            <p>
              Tu centro ha sido creado con éxito <br /> ahora puedes empezar a
              añadir profesores, <br /> alumnos y gestionar tu institución.
            </p>
          </div>

          {/* RESUMEN DE DATOS DEL REGISTRO */}
          <div className="resumen-card">
            <div className="resumen-header">
              <h2>Resumen</h2>
            </div>
            <div className="resumen-body">
              {filasResumen.map((fila) => (
                <div className="resumen-row" key={fila.label}>
                  <span className="resumen-label">{fila.label}</span>
                  <span className="resumen-value">{fila.valor}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="form-buttons-reg">
            <button
              className="btn-ir-al-panel"
              type="button"
              onClick={handleIrAlPanel}
            >
              Ir al panel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterConfirmation;
