import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { addYears } from "date-fns";
import RegisterSteps from "../../components/RegisterSteps";
import TimezoneSelect from "../../components/TimezoneSelect";
import { obtenerZonaHorariaLocal } from "../../utils/timezones";
import DatePicker from "react-datepicker";
import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import "react-datepicker/dist/react-datepicker.css";
import "../../styles/Login.css";

// IMAGES
import logo from "../../assets/images/Libro1.1.png";
import illustration from "../../assets/images/IMG3.1.png";
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
  nombreCompleto: string;
  correo: string;
  telefono: string;
  password: string;
}

interface ConfiguracionData {
  anoAcademico: string;
  idiomaSistema: string;
  zonaHoraria: string;
  sistemaCalificacion: string;
  inicioAnoAcademico: Date | null;
}

const RegisterConfiguration = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  // Recupera los datos de los pasos anteriores (state o sessionStorage como respaldo)
  const centro: CentroData | null =
    state?.centro ??
    JSON.parse(sessionStorage.getItem("registro_centro") ?? "null");

  const admin: AdminData | null =
    state?.admin ??
    JSON.parse(sessionStorage.getItem("registro_admin") ?? "null");

  const estructura =
    state?.estructura ??
    JSON.parse(sessionStorage.getItem("registro_estructura") ?? "null");

  const [anoAcademico, setAnoAcademico] = useState("2024-2025");
  const [idiomaSistema, setIdiomaSistema] = useState("");
  const [zonaHoraria, setZonaHoraria] = useState(obtenerZonaHorariaLocal());
  const [sistemaCalificacion, setSistemaCalificacion] = useState("");
  const [inicioAnoAcademico, setInicioAnoAcademico] = useState<Date | null>(
    null,
  );
  const [isOpen, setIsOpen] = useState(false);

  const [errorInicioAno, setErrorInicioAno] = useState("");
  const [errorSistemaCalificacion, setErrorSistemaCalificacion] = useState("");
  const [errorIdiomaSistema, setErrorIdiomaSistema] = useState("");

  const validate = () => {
    let isValid = true;
    if (!idiomaSistema) {
      setErrorIdiomaSistema("Selecciona un idioma");
      isValid = false;
    } else {
      setErrorIdiomaSistema("");
    }
    if (!sistemaCalificacion) {
      setErrorSistemaCalificacion("Selecciona un sistema de calificación");
      isValid = false;
    } else {
      setErrorSistemaCalificacion("");
    }
    if (!inicioAnoAcademico) {
      setErrorInicioAno("Fecha de inicio obligatoria");
      isValid = false;
    } else {
      setErrorInicioAno("");
    }

    return isValid;
  };

  const handleVolver = () => {
    navigate("/register-academic-structure", {
      state: { centro, admin, estructura },
    });
  };

  const handleContinuar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const configuracionData: ConfiguracionData = {
      anoAcademico,
      idiomaSistema,
      zonaHoraria,
      sistemaCalificacion,
      inicioAnoAcademico,
    };

    try {
      const response = await fetch(
        "http://localhost:3001/api/auth/registro/centro",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            centro,
            admin,
            estructura,
            configuracion: configuracionData,
          }),
        },
      );
      if (!response.ok) throw new Error("Error al registrar el centro");
      navigate("/register-confirmation", {
        state: { centro, admin, estructura, configuracion: configuracionData },
      });
    } catch (error) {
      console.error(error);
    }
  };

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
        <RegisterSteps currentStep={4} />

        <div className="info">
          <p className="info-sm">
            Configuración inicial <br />
            <small>Define algunos ajustes básicos para tu centro.</small>
          </p>
          <form className="form" onSubmit={handleContinuar}>
            <div className="form-group">
              <div className="label-row">
                <label htmlFor="AnoAcademico">Año académico</label>
              </div>
              <select
                id="AnoAcademico"
                value={anoAcademico}
                onChange={(e) => setAnoAcademico(e.target.value)}
              >
                <option value="2024-2025">2024 -2025</option>
                <option value="2025-2026">2025 -2026</option>
                <option value="2026-2027">2026 -2027</option>
              </select>
            </div>

            <div className="form-group">
              <div className="label-row">
                <label htmlFor="IdiomaSistema">Idioma del sistema</label>
                {errorIdiomaSistema && (
                  <span className="lg-error">
                    {errorIdiomaSistema || "\u00A0"}
                  </span>
                )}
              </div>
              <select
                id="IdiomaSistema"
                value={idiomaSistema}
                onChange={(e) => {
                  setIdiomaSistema(e.target.value);
                  if (errorIdiomaSistema) setErrorIdiomaSistema("");
                }}
              >
                <option value="" disabled>
                  -- Selecciona un idioma --
                </option>
                <option value="Español">Español</option>
                <option value="Inglés">Inglés</option>
                <option value="Francés">Francés</option>
              </select>
            </div>

            <div className="form-group">
              <TimezoneSelect value={zonaHoraria} onChange={setZonaHoraria} />
            </div>

            <div className="form-group">
              <div className="label-row">
                <label htmlFor="SistemaCalificacion">
                  Sistema de calificación
                </label>
                {errorSistemaCalificacion && (
                  <span className="lg-error">
                    {errorSistemaCalificacion || "\u00A0"}
                  </span>
                )}
              </div>
              <select
                id="SistemaCalificacion"
                value={sistemaCalificacion}
                onChange={(e) => {
                  setSistemaCalificacion(e.target.value);
                  if (errorSistemaCalificacion) setErrorSistemaCalificacion("");
                }}
              >
                <option value="" disabled>
                  -- Selecciona una opción --
                </option>
                <option value="Sobre 10">Sobre 10</option>
                <option value="Sobre 100">Sobre 100</option>
                <option value="A-F">A - F</option>
              </select>
            </div>

            <div className="form-group">
              <div className="label-row">
                <label htmlFor="InicioAnoAcademico">
                  Inicio del año académico
                </label>
                {errorInicioAno && (
                  <span className="lg-error">{errorInicioAno || "\u00A0"}</span>
                )}
              </div>
              <div className="input-box-date-reg">
                <DatePicker
                  open={isOpen}
                  onInputClick={() => setIsOpen(true)}
                  onClickOutside={() => setIsOpen(false)}
                  className="input-date"
                  calendarClassName="custom-calendar"
                  selected={inicioAnoAcademico}
                  onChange={(d: Date | null) => {
                    setInicioAnoAcademico(d);
                    if (errorInicioAno) setErrorInicioAno("");
                  }}
                  dateFormat="dd/MM/yyyy"
                  minDate={new Date()}
                  maxDate={addYears(new Date(), 2)}
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  placeholderText="-- Selecciona una fecha --"
                />
                <FontAwesomeIcon
                  icon={faCalendarAlt}
                  onClick={() => setIsOpen(true)}
                />
              </div>
            </div>

            <div className="form-buttons">
              <button
                type="button"
                className="btn-volver"
                onClick={handleVolver}
              >
                Volver
              </button>
              <button type="submit" className="btn-continuar">
                Continuar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterConfiguration;
