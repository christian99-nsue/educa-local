import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Info, Calendar } from "lucide-react";
import { getCentroActivo } from "../../utils/auth";
import { abreviarRama } from "../../utils/abreviarRama";
import "../../styles/horarioProfesor.css";

const API_URL = import.meta.env.VITE_API_URL;

interface ClaseHorario {
  id: number;
  tipo: "clase" | "refuerzo" | "tutoria";
  diaSemana: number;
  horaInicio: string;
  horaFin: string;
  titulo: string;
  curso: string;
  rama: string | null;
}

const DIAS = [
  { num: 1, nombre: "Lunes" },
  { num: 2, nombre: "Martes" },
  { num: 3, nombre: "Miercoles" },
  { num: 4, nombre: "Jueves" },
  { num: 5, nombre: "Viernes" },
];

const HORAS = Array.from({ length: 6 }, (_, i) => 13 + i);

const colorPorTipo: Record<string, { bg: string; borde: string }> = {
  clase: { bg: "#e8eefd", borde: "#5b8def" },
  refuerzo: { bg: "#eee6fb", borde: "#8b5cf6" },
  tutoria: { bg: "#fdf3e0", borde: "#e0a83a" },
};

function getLunesDeSemana(fecha: Date) {
  const d = new Date(fecha);
  const dia = d.getDay(); // 0=domingo
  const diff = dia === 0 ? -6 : 1 - dia;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatearRangoSemana(lunes: Date) {
  const domingo = new Date(lunes);
  domingo.setDate(lunes.getDate() + 6);
  const opciones: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "long",
  };
  const inicio = lunes.toLocaleDateString("es-ES", { day: "2-digit" });
  const fin = domingo.toLocaleDateString("es-ES", opciones);
  return `${inicio} - ${fin} ${domingo.getFullYear()}`;
}

function HorarioProfesor() {
  const [clases, setClases] = useState<ClaseHorario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lunesActual, setLunesActual] = useState(() =>
    getLunesDeSemana(new Date()),
  );

  useEffect(() => {
    const cargarHorario = async () => {
      const token = localStorage.getItem("token");
      const centroActivo = getCentroActivo();
      if (!centroActivo?.id) {
        setError("No se ha seleccionado un centro activo.");
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(
          `${API_URL}/api/profesor/horario/mi-horario?centroId=${centroActivo.id}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error || "Error al cargar el horario");
        }
        setClases(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al cargar el horario",
        );
      } finally {
        setLoading(false);
      }
    };
    cargarHorario();
  }, []);

  const irSemanaAnterior = () => {
    const nueva = new Date(lunesActual);
    nueva.setDate(nueva.getDate() - 7);
    setLunesActual(nueva);
  };

  const irSemanaSiguiente = () => {
    const nueva = new Date(lunesActual);
    nueva.setDate(nueva.getDate() + 7);
    setLunesActual(nueva);
  };

  const irHoy = () => setLunesActual(getLunesDeSemana(new Date()));

  const fechasSemana = DIAS.map((_, i) => {
    const f = new Date(lunesActual);
    f.setDate(f.getDate() + i);
    return f;
  });

  const clasesPorDiaYHora = (diaNum: number, hora: number) => {
    return clases.find((c) => {
      const horaInicio = parseInt(c.horaInicio.split(":")[0], 10);
      return c.diaSemana === diaNum && horaInicio === hora;
    });
  };

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const diaSemanaHoy = hoy.getDay() === 0 ? 7 : hoy.getDay();
  const clasesHoy = clases
    .filter((c) => c.diaSemana === diaSemanaHoy)
    .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));

  const nombreDiaHoy = DIAS.find((d) => d.num === diaSemanaHoy)?.nombre ?? "";
  const fechaHoyFormateada = hoy.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
  });

  if (loading) return <p>Cargando horario...</p>;
  if (error) {
    return (
      <div className="content asignaturas-estado asignaturas-error">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="content-pf horario-page">
      <h1>Horario</h1>
      <p className="subtitle">
        Consulta tu horario de clases y actividades academicas.
      </p>
      <div className="horario-toolbar">
        <div className="horario-nav">
          <button onClick={irSemanaAnterior}>
            <ChevronLeft size={16} />
          </button>
          <span>{formatearRangoSemana(lunesActual)}</span>
          <button onClick={irSemanaSiguiente}>
            <ChevronRight size={16} />
          </button>
        </div>
        <div className="horario-acciones">
          <button className="btn-hoy" onClick={irHoy}>
            Hoy
          </button>
          <select className="filtro-select-horario" defaultValue="semanal">
            <option value="semanal">Vista semanal</option>
          </select>
        </div>
      </div>

      <div className="horario-layout">
        <div className="horario-tabla-wrapper">
          <table className="horario-tabla">
            <thead>
              <tr>
                <th className="col-hora">Hora</th>
                {DIAS.map((d, i) => (
                  <th key={d.num}>
                    {d.nombre}
                    <br />
                    <span className="horario-fecha-dia">
                      {fechasSemana[i].toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "2-digit",
                      })}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HORAS.map((hora) => (
                <tr key={hora}>
                  <td className="col-hora">
                    {String(hora).padStart(2, "0")}:00
                    <br />
                    {String(hora + 1).padStart(2, "0")}:00
                  </td>
                  {DIAS.map((d) => {
                    const clase = clasesPorDiaYHora(d.num, hora);
                    if (!clase) return <td key={d.num}></td>;
                    const colores = colorPorTipo[clase.tipo];
                    return (
                      <td key={d.num}>
                        <div
                          className="horario-bloque"
                          style={{
                            background: colores.bg,
                            borderLeft: `3px solid ${colores.borde}`,
                          }}
                        >
                          <strong>{clase.titulo}</strong>
                          <span>
                            {clase.curso} <br />
                            {clase.rama ? ` ${abreviarRama(clase.rama)}` : ""}
                          </span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="horario-sidebar">
          <h3>Clases de hoy</h3>
          <p className="horario-sidebar-fecha">
            {nombreDiaHoy}, {fechaHoyFormateada}
          </p>

          {clasesHoy.length === 0 ? (
            <p className="horario-sin-clases">No tienes clases hoy.</p>
          ) : (
            clasesHoy.map((c) => {
              const colores = colorPorTipo[c.tipo];
              return (
                <div
                  key={c.id}
                  className="horario-sidebar-item"
                  style={{ borderLeft: `3px solid ${colores.borde}` }}
                >
                  <span className="horario-sidebar-hora">
                    {c.horaInicio.slice(0, 5)} - {c.horaFin.slice(0, 5)}
                  </span>
                  <strong>{c.titulo}</strong>
                  <span>
                    {c.curso} <br />
                    {c.rama ? ` ${c.rama}` : ""}
                  </span>
                </div>
              );
            })
          )}

          <button className="btn-ver-calendario">
            <Calendar size={18} /> Ver calendario mensual
          </button>
        </div>
      </div>

      <div className="horario-aviso">
        <Info size={16} />
        Los horarios pueden estar sujetos a cambios. Revisa regularmente las
        actualizaciones.
      </div>
    </div>
  );
}

export default HorarioProfesor;
