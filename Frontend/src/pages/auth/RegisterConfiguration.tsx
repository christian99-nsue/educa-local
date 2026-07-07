import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { addYears } from "date-fns";
import RegisterSteps from "../../components/RegisterSteps";
import TimezoneSelect from "../../components/TimezoneSelect";
import { obtenerZonaHorariaLocal } from "../../utils/timezones";
import DatePicker from "react-datepicker";
import { faCalendarAlt, faUsers } from "@fortawesome/free-solid-svg-icons";
import "react-datepicker/dist/react-datepicker.css";
import "../../styles/Login.css";

// IMAGES
import logo from "../../assets/images/Libro1.1.png";
import illustration from "../../assets/images/IMG3.1.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const API_URL = import.meta.env.VITE_API_URL;

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
      const response = await fetch(`${API_URL}/api/auth/registro/centro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          centro,
          admin,
          estructura,
          configuracion: configuracionData,
        }),
      });
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
            <FontAwesomeIcon icon={faUsers} size="2x" />
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
