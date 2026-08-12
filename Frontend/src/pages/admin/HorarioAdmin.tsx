import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Info,
  Download,
  MoreVertical,
  GraduationCap,
  Users,
  Plus,
} from "lucide-react";
import { getCentroActivo } from "../../utils/auth";
import "../../styles/adminHorario.css";

const API_URL = import.meta.env.VITE_API_URL;

interface CursoOpcion {
  cursoId: number;
  ramaId: number | null;
  curso: string;
  nivel: string | null;
  rama: string | null;
  etiqueta: string;
  totalAlumnos: number;
}

interface Clase {
  id: number;
  tipo: string;
  diaSemana: number;
  horaInicio: string;
  horaFin: string;
  titulo: string;
  profesor: string;
}

interface Descanso {
  id: number;
  nombre: string;
  horaInicio: string;
  horaFin: string;
}

const DIAS = [
  { num: 1, nombre: "Lunes" },
  { num: 2, nombre: "Martes" },
  { num: 3, nombre: "Miercoles" },
  { num: 4, nombre: "Jueves" },
  { num: 5, nombre: "Viernes" },
];

const colores = [
  { bg: "#e8eefd", borde: "#5b8def" },
  { bg: "#e0f5e9", borde: "#3ba873" },
  { bg: "#eee6fb", borde: "#8b5cf6" },
  { bg: "#fdf3e0", borde: "#e0a83a" },
  { bg: "#fde8e8", borde: "#e05a5a" },
  { bg: "#e6e6e6", borde: "#888" },
];

function HorarioAdmin() {
  const [cursosOpciones, setCursosOpciones] = useState<CursoOpcion[]>([]);
  const [seleccionActual, setSeleccionActual] = useState<{
    cursoId: number;
    ramaId: number | null;
  } | null>(null);
  const [nombreCurso, setNombreCurso] = useState("");
  const [clases, setClases] = useState<Clase[]>([]);
  const [descansos, setDescansos] = useState<Descanso[]>([]);
  const [filtroNivel, setFiltroNivel] = useState("todos");
  const [filtroDia, setFiltroDia] = useState("todos");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarCursos = async () => {
      const token = localStorage.getItem("token");
      const centroActivo = getCentroActivo();
      try {
        const res = await fetch(
          `${API_URL}/api/admin/horario/cursos?centroId=${centroActivo.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Error al cargar cursos");
        setCursosOpciones(data);
        if (data.length > 0)
          setSeleccionActual({
            cursoId: data[0].cursoId,
            ramaId: data[0].ramaId,
          });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar cursos");
        setLoading(false);
      }
    };
    cargarCursos();
  }, []);

  useEffect(() => {
    if (seleccionActual == null) return;
    const cargarHorario = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      const centroActivo = getCentroActivo();
      try {
        const res = await fetch(
          `${API_URL}/api/admin/horario/curso/${seleccionActual.cursoId}?centroId=${centroActivo.id}&ramaId=${seleccionActual.ramaId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const data = await res.json();
        if (!res.ok)
          throw new Error(data?.error || "Error al cargar el horario");
        setNombreCurso(data.curso);
        setClases(data.clases ?? []);
        setDescansos(data.descansos ?? []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al cargar el horario",
        );
      } finally {
        setLoading(false);
      }
    };
    cargarHorario();
  }, [seleccionActual]);

  const nivelesUnicos = Array.from(
    new Set(cursosOpciones.filter((c) => c.nivel).map((c) => c.nivel)),
  ) as string[];

  const cursosDelNivel = cursosOpciones.filter(
    (c) => filtroNivel === "todos" || c.nivel === filtroNivel,
  );

  const handleCambiarNivel = (nivel: string) => {
    setFiltroNivel(nivel);
    const primerCurso = cursosOpciones.find(
      (c) => nivel === "todos" || c.nivel === nivel,
    );
    if (primerCurso)
      setSeleccionActual({
        cursoId: primerCurso.cursoId,
        ramaId: primerCurso.ramaId,
      });
  };

  const diasAMostrar =
    filtroDia === "todos"
      ? DIAS
      : DIAS.filter((d) => String(d.num) === filtroDia);

  const franjasHorarias = Array.from(
    new Set([
      ...clases.map((c) => c.horaInicio),
      ...descansos.map((d) => d.horaInicio),
    ]),
  ).sort();

  const descansoEnHora = (horaInicio: string) =>
    descansos.find((d) => d.horaInicio === horaInicio);
  const claseEnDiaYHora = (diaNum: number, horaInicio: string) =>
    clases.find((c) => c.diaSemana === diaNum && c.horaInicio === horaInicio);

  const colorPorAsignatura = (titulo: string) => {
    let hash = 0;
    for (let i = 0; i < titulo.length; i++)
      hash = titulo.charCodeAt(i) + ((hash << 5) - hash);
    return colores[Math.abs(hash) % colores.length];
  };

  const irCursoAnterior = () => {
    const idx = cursosDelNivel.findIndex(
      (c) => c.cursoId === seleccionActual?.cursoId,
    );
    if (idx > 0)
      setSeleccionActual({
        cursoId: cursosDelNivel[idx - 1].cursoId,
        ramaId: cursosDelNivel[idx - 1].ramaId,
      });
  };

  const irCursoSiguiente = () => {
    const idx = cursosDelNivel.findIndex(
      (c) => c.cursoId === seleccionActual?.cursoId,
    );
    if (idx >= 0 && idx < cursosDelNivel.length - 1)
      setSeleccionActual({
        cursoId: cursosDelNivel[idx + 1].cursoId,
        ramaId: cursosDelNivel[idx + 1].ramaId,
      });
  };

  return (
    <div className="content admin-horario-page">
      <div className="admin-horario-header">
        <div className="horario-ad">
          <h1>Horario</h1>
          <p className="subtitle">
            Gestiona y administra los horarios de todos los cursos del centro.
          </p>
        </div>
        <button className="btn-agregar-curso">
          <Plus size={16} /> Agregar horario
        </button>
      </div>

      <div className="admin-horario-filtros">
        <div className="filtro-col">
          <label>Nivel</label>
          <select
            className="filtro-select-ad"
            value={filtroNivel}
            onChange={(e) => handleCambiarNivel(e.target.value)}
          >
            <option value="todos">Todos los niveles</option>
            {nivelesUnicos.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <div className="filtro-col">
          <label>Curso</label>
          <select
            className="filtro-select"
            value={
              seleccionActual
                ? `${seleccionActual.cursoId}-${seleccionActual.ramaId ?? "null"}`
                : ""
            }
            onChange={(e) => {
              const [cursoId, ramaId] = e.target.value.split("-");
              setSeleccionActual({
                cursoId: Number(cursoId),
                ramaId: ramaId === "null" ? null : Number(ramaId),
              });
            }}
          >
            {cursosDelNivel.map((c) => (
              <option
                key={`${c.cursoId}-${c.ramaId ?? "null"}`}
                value={`${c.cursoId}-${c.ramaId ?? "null"}`}
              >
                {c.etiqueta}
              </option>
            ))}
          </select>
        </div>
        <div className="filtro-col">
          <label>Dia</label>
          <select
            className="filtro-select-ad"
            value={filtroDia}
            onChange={(e) => setFiltroDia(e.target.value)}
          >
            <option value="todos">Todos los dias</option>
            {DIAS.map((d) => (
              <option key={d.num} value={d.num}>
                {d.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="admin-horario-acciones">
        <div className="admin-horario-aviso-info">
          <Info size={16} /> Puedes ver el horario de cada curso seleccionandolo
          arriba.
        </div>
        <div className="calif-exportar-col">
          <button className="btn-exportar-cal">
            <Download size={14} /> Exportar
          </button>
        </div>
      </div>

      {loading ? (
        <p>Cargando horario...</p>
      ) : error ? (
        <p className="modal-error">{error}</p>
      ) : (
        <div className="admin-horario-tabla-card">
          <div className="admin-horario-tabla-header">
            <button onClick={irCursoAnterior}>
              <ChevronLeft size={16} />
            </button>
            <strong>Horario semanal - {nombreCurso}</strong>
            <button onClick={irCursoSiguiente}>
              <ChevronRight size={16} />
            </button>
          </div>

          {franjasHorarias.length === 0 ? (
            <p className="material-vacio">
              No hay horario configurado para este curso todavia.
            </p>
          ) : (
            <table className="admin-horario-tabla">
              <thead>
                <tr>
                  <th className="col-hora">Hora</th>
                  {diasAMostrar.map((d) => (
                    <th key={d.num}>{d.nombre}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {franjasHorarias.map((horaInicio) => {
                  const descanso = descansoEnHora(horaInicio);
                  if (descanso) {
                    return (
                      <tr key={horaInicio}>
                        <td className="col-hora">
                          {descanso.horaInicio.slice(0, 5)} -{" "}
                          {descanso.horaFin.slice(0, 5)}
                        </td>
                        <td
                          colSpan={diasAMostrar.length}
                          className="horario-descanso-celda"
                        >
                          <div className="horario-descanso-bloque">
                            {descanso.nombre.toUpperCase()}
                          </div>
                        </td>
                      </tr>
                    );
                  }
                  const claseParaFin = clases.find(
                    (c) => c.horaInicio === horaInicio,
                  );
                  const horaFin = claseParaFin?.horaFin ?? "";
                  return (
                    <tr key={horaInicio}>
                      <td className="col-hora">
                        {horaInicio.slice(0, 5)} - {horaFin.slice(0, 5)}
                      </td>
                      {diasAMostrar.map((d) => {
                        const clase = claseEnDiaYHora(d.num, horaInicio);
                        if (!clase) return <td key={d.num}></td>;
                        const color = colorPorAsignatura(clase.titulo);
                        return (
                          <td key={d.num}>
                            <div
                              className="admin-horario-bloque"
                              style={{
                                background: color.bg,
                                borderLeft: `3px solid ${color.borde}`,
                              }}
                            >
                              <div className="admin-horario-bloque-header">
                                <strong>{clase.titulo}</strong>
                                <MoreVertical size={12} />
                              </div>
                              <span>{clase.profesor}</span>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      <div className="admin-horario-por-curso-card">
        <h3>Horarios por curso</h3>
        <p>Selecciona un curso para ver o editar su horario.</p>
        <div className="admin-horario-cursos-grid">
          {cursosOpciones.slice(0, 4).map((c) => (
            <div
              key={c.cursoId + "-" + (c.ramaId ?? "null")}
              className={`admin-horario-curso-item ${
                seleccionActual?.cursoId === c.cursoId &&
                seleccionActual?.ramaId === c.ramaId
                  ? "activo"
                  : ""
              }`}
              onClick={() =>
                setSeleccionActual({ cursoId: c.cursoId, ramaId: c.ramaId })
              }
            >
              <GraduationCap size={20} />
              <div>
                <strong>{c.etiqueta}</strong>
                <span>{c.totalAlumnos} alumnos</span>
              </div>
            </div>
          ))}
          {cursosOpciones.length > 4 && (
            <div className="admin-horario-curso-item admin-horario-ver-todos">
              <Users size={16} />
              <div>
                <strong>Ver todos los cursos</strong>
                <span>{cursosOpciones.length} cursos en total</span>
              </div>
              <ChevronRight size={16} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HorarioAdmin;
