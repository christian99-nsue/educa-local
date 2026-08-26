import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Info, ChevronRight } from "lucide-react";
import {
  faGraduationCap,
  faFlask,
  faBookOpen,
  faUsers,
  faLightbulb,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getCentroActivo } from "../../utils/auth";
import { getIconoRama } from "../../utils/ramaIconos";
import "../../styles/admin/adminCrearCurso.css";

const API_URL = import.meta.env.VITE_API_URL;

interface Rama {
  id: number;
  nombre: string;
}

const cursosPorNivel: Record<string, string[]> = {
  Primaria: [
    "1º Primaria",
    "2º Primaria",
    "3º Primaria",
    "4º Primaria",
    "5º Primaria",
    "6º Primaria",
  ],
  Secundaria: ["1º ESBA", "2º ESBA", "3º ESBA", "4º ESBA"],
  Bachillerato: ["1º Bachillerato", "2º Bachillerato"],
};

const estilos = [
  { bg: "#f0d5fc", color: "#B032E7" },
  { bg: "#c5def8", color: "#59ADFF" },
  { bg: "#ffe3e4", color: "#FC4850" },
  { bg: "#e7fdb8", color: "#5f8408" },
  { bg: "#ffeba1", color: "#F8C822" },
  { bg: "#e6e6e6", color: "#686868" },
  { bg: "#ddffd8", color: "#18B300" },
  { bg: "#ffc9c9", color: "#ff0000" },
];

function CrearCursoAdmin() {
  const navigate = useNavigate();
  const [nivel, setNivel] = useState("Bachillerato");
  const [cursoBase, setCursoBase] = useState("");
  const [ramas, setRamas] = useState<Rama[]>([]);
  const [ramaSeleccionada, setRamaSeleccionada] = useState<number | null>(null);
  const [grupo, setGrupo] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarRamas = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/admin/cursos/crear/ramas`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setRamas(data);
    };
    cargarRamas();
  }, []);

  useEffect(() => {
    const opciones = cursosPorNivel[nivel] ?? [];
    //eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de datos al montar, patron estandar
    setCursoBase(opciones[0] ?? "");
    setRamaSeleccionada(null);
  }, [nivel]);

  const esBachillerato = nivel === "Bachillerato";

  const nombreGenerado = () => {
    let nombre = cursoBase;
    const rama = ramas.find((r) => r.id === ramaSeleccionada);
    if (rama) nombre += ` - ${rama.nombre}`;
    if (grupo) nombre += ` - Grupo ${grupo}`;
    return nombre;
  };

  const handleCrear = async () => {
    setError("");
    if (!cursoBase) {
      setError("Selecciona un curso");
      return;
    }
    if (esBachillerato && !ramaSeleccionada) {
      setError("Debes seleccionar una rama para Bachillerato");
      return;
    }
    setGuardando(true);
    const token = localStorage.getItem("token");
    const centroActivo = getCentroActivo();

    try {
      const res = await fetch(`${API_URL}/api/admin/cursos/crear`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          centroId: centroActivo.id,
          nivel,
          cursoBase,
          ramaId: ramaSeleccionada,
          grupo: grupo || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error al crear el curso");
      navigate("/admin/cursos");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear el curso");
    } finally {
      setGuardando(false);
    }
  };

  const ramaActual = ramas.find((r) => r.id === ramaSeleccionada);

  return (
    <div className="content crear-curso-page">
      <div className="detalle-asig-breadcrumb">
        <span onClick={() => navigate("/admin/cursos")}>Cursos</span>
        <ChevronRight size={12} /> <strong>Crear curso</strong>
      </div>
      <h1>Crear curso</h1>
      <p className="subtitle">Añade un nuevo curso al centro educativo.</p>

      <div className="crear-curso-layout">
        <div className="crear-curso-card">
          <h3>Informacion del curso</h3>

          <div className="crear-curso-grid-2">
            <div>
              <label className="modal-label">Nivel educativo *</label>
              <select
                className="modal-select"
                value={nivel}
                onChange={(e) => setNivel(e.target.value)}
              >
                <option value="Primaria">Primaria</option>
                <option value="Secundaria">Secundaria</option>
                <option value="Bachillerato">Bachillerato</option>
              </select>
            </div>
            <div>
              <label className="modal-label">Curso *</label>
              <select
                className="modal-select"
                value={cursoBase}
                onChange={(e) => setCursoBase(e.target.value)}
              >
                {(cursosPorNivel[nivel] ?? []).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {esBachillerato && (
            <>
              <div className="crear-curso-aviso-info">
                <Info size={14} /> Para 1º y 2º de Bachillerato debes
                seleccionar una rama.
              </div>

              <label className="modal-label">Rama *</label>
              <div className="crear-curso-ramas-grid">
                {ramas.map((r, i) => {
                  const estilo = estilos[i % estilos.length];
                  const icono = getIconoRama(r.nombre);
                  return (
                    <div
                      key={r.id}
                      className={`crear-curso-rama-card ${ramaSeleccionada === r.id ? "seleccionada" : ""}`}
                      onClick={() => setRamaSeleccionada(r.id)}
                    >
                      <span
                        className="crear-curso-rama-icono"
                        style={{
                          backgroundColor: estilo.bg,
                          color: estilo.color,
                        }}
                      >
                        <FontAwesomeIcon
                          icon={icono}
                          size="sm"
                          color={estilo.color}
                        />
                      </span>
                      <div>
                        <strong>{r.nombre}</strong>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          <label className="modal-label">Grupo / seccion (opcional)</label>
          <select
            className="modal-select"
            value={grupo}
            onChange={(e) => setGrupo(e.target.value)}
          >
            <option value="">Ninguno</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
          </select>
          <p className="crear-curso-ayuda">
            Si el centro no utiliza grupos, selecciona "Ninguno".
          </p>

          <label className="modal-label">
            Nombre del curso (generado automaticamente)
          </label>
          <input className="modal-input" value={nombreGenerado()} disabled />
          <p className="crear-curso-ayuda">
            Este nombre se generara automaticamente.
          </p>

          <h3 style={{ marginTop: 24 }}>Resumen del curso</h3>
          <div className="crear-curso-resumen-grid">
            <div className="crear-curso-resumen-item">
              <FontAwesomeIcon
                icon={faGraduationCap}
                size="lg"
                color="#16a34a"
              />
              <div>
                <span>Nivel</span>
                <strong>{nivel}</strong>
              </div>
            </div>
            <div className="crear-curso-resumen-item">
              <FontAwesomeIcon icon={faBookOpen} size="lg" color="#16a34a" />
              <div>
                <span>Curso</span>
                <strong>{cursoBase || "-"}</strong>
              </div>
            </div>
            {esBachillerato && (
              <div className="crear-curso-resumen-item">
                <FontAwesomeIcon icon={faFlask} size="lg" color="#16a34a" />
                <div>
                  <span>Rama</span>
                  <strong>{ramaActual?.nombre ?? "-"}</strong>
                </div>
              </div>
            )}
            <div className="crear-curso-resumen-item">
              <FontAwesomeIcon icon={faUsers} size="lg" color="#16a34a" />
              <div>
                <span>Grupo</span>
                <strong>{grupo || "-"}</strong>
              </div>
            </div>
          </div>

          <div className="crear-curso-aviso-info" style={{ marginTop: 16 }}>
            <Info size={14} /> Podras añadir asignaturas, profesores y horarios
            despues de crear el curso.
          </div>

          {error && <p className="modal-error">{error}</p>}

          <div className="modal-botones" style={{ marginTop: 20 }}>
            <button
              className="modal-btn-cancelar"
              onClick={() => navigate("/admin/cursos")}
            >
              Cancelar
            </button>
            <button
              className="btn-guardar-verde"
              onClick={handleCrear}
              disabled={guardando}
            >
              {guardando ? "Creando..." : "Crear curso"}
            </button>
          </div>
        </div>

        <div className="crear-curso-info-card">
          <h3>¿Como funciona?</h3>
          <p>
            Un curso se compone de varios niveles. No todos los campos son
            obligatorios.
          </p>

          <div className="crear-curso-info-item">
            <span className="crear-curso-info-icono">
              <FontAwesomeIcon icon={faGraduationCap} color="#16a34a" />
            </span>
            <div>
              <strong>Nivel educativo</strong>
              <p>Selecciona el nivel al que pertenece el curso.</p>
            </div>
          </div>
          <div className="crear-curso-info-item">
            <span className="crear-curso-info-icono">
              <FontAwesomeIcon icon={faBookOpen} color="blue" />
            </span>
            <div>
              <strong>Curso</strong>
              <p>Elige el curso dentro del nivel seleccionado.</p>
            </div>
          </div>
          <div className="crear-curso-info-item">
            <span className="crear-curso-info-icono">
              <FontAwesomeIcon icon={faFlask} color="#b032e7" />
            </span>
            <div>
              <strong>Rama</strong>
              <p>
                Solo disponible para 1º y 2º de Bachillerato. Selecciona la rama
                correspondiente.
              </p>
            </div>
          </div>
          <div className="crear-curso-info-item">
            <span className="crear-curso-info-icono">
              <FontAwesomeIcon icon={faUsers} color="#FFAC39" />
            </span>
            <div>
              <strong>Grupo (opcional)</strong>
              <p>
                Si el centro utiliza grupos, selecciona o crea uno. Si no, elige
                "Ninguno".
              </p>
            </div>
          </div>

          <div className="crear-curso-info-destacado">
            <p>
              <strong>
                <FontAwesomeIcon icon={faLightbulb} color="#FFAC39" /> Despues
                de crear el curso podras:
              </strong>
            </p>
            <ul>
              <li>✓ Añadir asignaturas (comunes y especificas).</li>
              <li>✓ Asignar profesores.</li>
              <li>✓ Gestionar horarios y aulas.</li>
              <li>✓ Matricular alumnos.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CrearCursoAdmin;
