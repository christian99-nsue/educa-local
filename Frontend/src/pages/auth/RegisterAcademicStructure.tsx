import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import RegisterSteps from "../../components/RegisterSteps";
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
