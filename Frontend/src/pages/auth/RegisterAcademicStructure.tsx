import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import RegisterSteps from "../../components/RegisterSteps";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers } from "@fortawesome/free-solid-svg-icons";
import "../../styles/Login.css";

// IMAGES
import logo from "../../assets/images/Libro1.1.png";
import illustration from "../../assets/images/IMG3.1.png";

interface NivelConfig {
  key: "primaria" | "secundaria" | "bachillerato";
  label: string;
  cursosDefault: string[];
}

const NIVELES: NivelConfig[] = [
  {
    key: "primaria",
    label: "Primaria",
    cursosDefault: ["1° Primaria", "2° Primaria", "3° Primaria"],
  },
  {
    key: "secundaria",
    label: "Secundaria",
    cursosDefault: ["1° Esba", "2° Esba", "3° Esba"],
  },
  {
    key: "bachillerato",
    label: "Bachillerato",
    cursosDefault: ["1° Bach"],
  },
];

type CursosPorNivel = Record<string, string[]>;
type NivelesSeleccionados = Record<string, boolean>;

const RegisterAcademicStructure = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  const centro =
    state?.centro ??
    JSON.parse(sessionStorage.getItem("registro_centro") ?? "null");
  const admin =
    state?.admin ??
    JSON.parse(sessionStorage.getItem("registro_admin") ?? "null");

  const [nivelesSeleccionados, setNivelesSeleccionados] =
    useState<NivelesSeleccionados>({
      primaria: false,
      secundaria: false,
      bachillerato: false,
    });

  const [cursosPorNivel, setCursosPorNivel] = useState<CursosPorNivel>({
    primaria: [],
    secundaria: [],
    bachillerato: [],
  });

  const [nuevoCurso, setNuevoCurso] = useState<Record<string, string>>({
    primaria: "",
    secundaria: "",
    bachillerato: "",
  });

  const [errorNiveles, setErrorNiveles] = useState("");

  const handleToggleNivel = (nivel: NivelConfig) => {
    const yaSeleccionado = nivelesSeleccionados[nivel.key];

    setNivelesSeleccionados((prev) => ({
      ...prev,
      [nivel.key]: !yaSeleccionado,
    }));

    if (!yaSeleccionado) {
      // Se está marcando: añade los cursos por defecto si la lista está vacía
      setCursosPorNivel((prev) => ({
        ...prev,
        [nivel.key]:
          prev[nivel.key].length > 0
            ? prev[nivel.key]
            : [...nivel.cursosDefault],
      }));
    }

    if (errorNiveles) setErrorNiveles("");
  };

  const handleAgregarCurso = (nivelKey: string) => {
    const curso = nuevoCurso[nivelKey].trim();
    if (!curso) return;

    setCursosPorNivel((prev) => ({
      ...prev,
      [nivelKey]: [...prev[nivelKey], curso],
    }));

    setNuevoCurso((prev) => ({ ...prev, [nivelKey]: "" }));
  };

  const handleEliminarCurso = (nivelKey: string, curso: string) => {
    setCursosPorNivel((prev) => ({
      ...prev,
      [nivelKey]: prev[nivelKey].filter((c) => c !== curso),
    }));
  };

  const handleVolver = () => {
    navigate("/register-admin-account", { state: { centro, admin } });
  };

  const validate = () => {
    const algunoSeleccionado =
      Object.values(nivelesSeleccionados).some(Boolean);
    if (!algunoSeleccionado) {
      setErrorNiveles("Selecciona al menos un nivel educativo");
      return false;
    }
    setErrorNiveles("");
    return true;
  };

  const handleContinuar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const estructuraData = {
      niveles: nivelesSeleccionados,
      cursos: cursosPorNivel,
    };

    sessionStorage.setItem(
      "registro_estructura",
      JSON.stringify(estructuraData),
    );

    navigate("/register-configuration", {
      state: { centro, admin, estructura: estructuraData },
    });
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
        <RegisterSteps currentStep={3} />

        <div className="info">
          <p className="info-sm">
            Estructura académica inicial <br />
            <small>Agrega los niveles y cursos que tiene tu centro.</small>
          </p>

          <form className="form" onSubmit={handleContinuar}>
            <div className="niveles-section">
              <div className="label-row">
                <label>Niveles educativos</label>
                {errorNiveles && (
                  <span className="lg-error">{errorNiveles || "\u00A0"}</span>
                )}
              </div>

              <div className="niveles-checkbox-list">
                {NIVELES.map((nivel) => (
                  <label key={nivel.key} className="nivel-checkbox">
                    <input
                      type="checkbox"
                      checked={nivelesSeleccionados[nivel.key]}
                      onChange={() => handleToggleNivel(nivel)}
                    />
                    {nivel.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="cursos-section-wrapper">
              <div className="cursos-section">
                <label className="cursos-title">Cursos/ Grados</label>
                <small className="cursos-subtitle">
                  Agrega los cursos para cada nivel seleccionado.
                </small>

                {NIVELES.filter((nivel) => nivelesSeleccionados[nivel.key]).map(
                  (nivel) => (
                    <div key={nivel.key} className="nivel-cursos-block">
                      <p className="nivel-cursos-label">{nivel.label}</p>

                      <div className="cursos-chips">
                        {cursosPorNivel[nivel.key].map((curso) => (
                          <span key={curso} className="curso-chip">
                            {curso}
                            <button
                              type="button"
                              className="curso-chip-remove"
                              onClick={() =>
                                handleEliminarCurso(nivel.key, curso)
                              }
                              aria-label={`Eliminar ${curso}`}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>

                      <div className="agregar-curso-row">
                        <input
                          type="text"
                          className="agregar-curso-input"
                          placeholder="Seleccionar o agregar cursos"
                          value={nuevoCurso[nivel.key]}
                          onChange={(e) =>
                            setNuevoCurso((prev) => ({
                              ...prev,
                              [nivel.key]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAgregarCurso(nivel.key);
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="agregar-curso-btn"
                          onClick={() => handleAgregarCurso(nivel.key)}
                        >
                          + Agregar curso
                        </button>
                      </div>
                    </div>
                  ),
                )}
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

export default RegisterAcademicStructure;
