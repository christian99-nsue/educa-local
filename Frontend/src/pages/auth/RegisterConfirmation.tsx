import { useLocation, useNavigate } from "react-router-dom";
import RegisterSteps from "../../components/RegisterSteps";
import "../../styles/Login.css";

// IMAGES
import logo from "../../assets/images/Libro1.1.png";
import illustration from "../../assets/images/IMG3.1.png";
import imagen from "../../assets/images/imagen_centro.png";

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

    navigate("/admin/dashboard");
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
          <img src={logo} className="logo" />
          <h1 className="edu-local">EDUCA LOCAL</h1>
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
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
              <path d="M320 80C377.4 80 424 126.6 424 184C424 241.4 377.4 288 320 288C262.6 288 216 241.4 216 184C216 126.6 262.6 80 320 80zM96 152C135.8 152 168 184.2 168 224C168 263.8 135.8 296 96 296C56.2 296 24 263.8 24 224C24 184.2 56.2 152 96 152zM0 480C0 409.3 57.3 352 128 352C140.8 352 153.2 353.9 164.9 357.4C132 394.2 112 442.8 112 496L112 512C112 523.4 114.4 534.2 118.7 544L32 544C14.3 544 0 529.7 0 512L0 480zM521.3 544C525.6 534.2 528 523.4 528 512L528 496C528 442.8 508 394.2 475.1 357.4C486.8 353.9 499.2 352 512 352C582.7 352 640 409.3 640 480L640 512C640 529.7 625.7 544 608 544L521.3 544zM472 224C472 184.2 504.2 152 544 152C583.8 152 616 184.2 616 224C616 263.8 583.8 296 544 296C504.2 296 472 263.8 472 224zM160 496C160 407.6 231.6 336 320 336C408.4 336 480 407.6 480 496L480 512C480 529.7 465.7 544 448 544L192 544C174.3 544 160 529.7 160 512L160 496z" />
            </svg>
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
