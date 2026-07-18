import { useEffect, useRef, useState } from "react";
import { Save } from "lucide-react";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { getCentroActivo } from "../../utils/auth";
import "../../styles/calificacionesProfesor.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const API_URL = import.meta.env.VITE_API_URL;

interface AsignaturaOpcion {
  cursoAsignaturaId: number;
  nombre: string;
  curso: string;
  rama: string | null;
}

interface AsignaturaApiItem {
  curso_asignatura_id: number;
  nombre: string;
  curso: string;
  rama: string | null;
}

interface Tarea {
  id: number;
  titulo: string;
}

interface Alumno {
  id: number;
  nombre: string;
  apellidos: string;
  notas: Record<number, string | null>;
  notaFinal: number | string | null;
}

const getIniciales = (nombre: string, apellidos: string) =>
  `${nombre[0] ?? ""}${apellidos[0] ?? ""}`.toUpperCase();

type SistemaCalificacion = "sobre 10" | "sobre 100" | "A-F";

const letraAValor: Record<string, number> = { F: 0, D: 1, C: 2, B: 3, A: 4 };
const valorALetra = ["F", "D", "C", "B", "A"];

const calcularNotaFinal = (
  notas: Record<number, string | null>,
  sistema: SistemaCalificacion,
) => {
  if (sistema === "A-F") {
    const valores = Object.values(notas)
      .filter(
        (n): n is string =>
          n !== null && n !== "" && letraAValor[n.toUpperCase()] !== undefined,
      )
      .map((n) => letraAValor[n.toUpperCase()]);

    if (valores.length === 0) return null;
    const promedio = valores.reduce((a, b) => a + b, 0) / valores.length;
    const indice = Math.min(4, Math.max(0, Math.round(promedio)));
    return valorALetra[indice];
  }

  const valores = Object.values(notas)
    .filter((n) => n !== null && n !== "" && !isNaN(Number(n)))
    .map((n) => Number(n));

  if (valores.length === 0) return null;
  return Number(
    (valores.reduce((a, b) => a + b, 0) / valores.length).toFixed(1),
  );
};

// Misma logica y paleta que TareaCard.tsx: verde >=70%, amarillo >=50%, rojo el resto.
// Para A-F: A/B verde, C amarillo, D/F rojo.
const getColorNota = (
  valor: string | number | null | undefined,
  sistema: SistemaCalificacion,
): string | null => {
  if (valor === null || valor === undefined || valor === "") return null;

  if (sistema === "A-F") {
    const letra = String(valor).toUpperCase();
    if (letra === "A" || letra === "B") return "#18B300";
    if (letra === "C") return "#F8C822";
    if (letra === "D" || letra === "F") return "#FC4850";
    return null;
  }

  const valorNumerico = Number(valor);
  if (isNaN(valorNumerico)) return null;

  const maximo = sistema === "sobre 100" ? 100 : 10;
  const porcentaje = (valorNumerico / maximo) * 100;

  if (porcentaje >= 70) return "#18B300";
  if (porcentaje >= 50) return "#F8C822";
  return "#FC4850";
};

function CalificacionesProfesor() {
  const [opciones, setOpciones] = useState<AsignaturaOpcion[]>([]);
  const [asignaturaNombre, setAsignaturaNombre] = useState("");
  const [cursoAsignaturaId, setCursoAsignaturaId] = useState("");

  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [sistemaCalificacion, setSistemaCalificacion] =
    useState<SistemaCalificacion>("sobre 10");
  const [loading, setLoading] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mostrarExportar, setMostrarExportar] = useState(false);
  const exportarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mostrarExportar) return;

    const manejarClickFuera = (e: MouseEvent) => {
      if (
        exportarRef.current &&
        !exportarRef.current.contains(e.target as Node)
      ) {
        setMostrarExportar(false);
      }
    };

    document.addEventListener("mousedown", manejarClickFuera);
    return () => {
      document.removeEventListener("mousedown", manejarClickFuera);
    };
  }, [mostrarExportar]);

  useEffect(() => {
    const cargarOpciones = async () => {
      const token = localStorage.getItem("token");
      const centroActivo = getCentroActivo();
      try {
        const res = await fetch(
          `${API_URL}/api/profesor/asignaturas/mis-asignaturas?centroId=${centroActivo.id}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const data = await res.json();
        const lista = data.map((a: AsignaturaApiItem) => ({
          cursoAsignaturaId: a.curso_asignatura_id,
          nombre: a.nombre,
          curso: a.curso,
          rama: a.rama,
        }));
        setOpciones(lista);
        if (lista.length > 0) {
          setAsignaturaNombre(lista[0].nombre);
        }
      } catch (err) {
        console.log(err);
      }
    };
    cargarOpciones();
  }, []);

  const asignaturasUnicas = Array.from(new Set(opciones.map((o) => o.nombre)));

  const cursosDisponibles = opciones.filter(
    (o) => o.nombre === asignaturaNombre,
  );

  // Estado derivado durante el render (patron oficial de React), igual que
  // en AsistenciaProfesor: https://react.dev/learn/you-might-not-need-an-effect
  const claveSeleccion = `${asignaturaNombre}|${opciones.length}`;
  const [prevClaveSeleccion, setPrevClaveSeleccion] = useState(claveSeleccion);

  if (claveSeleccion !== prevClaveSeleccion) {
    setPrevClaveSeleccion(claveSeleccion);
    setCursoAsignaturaId(
      cursosDisponibles.length > 0
        ? String(cursosDisponibles[0].cursoAsignaturaId)
        : "",
    );
  }

  useEffect(() => {
    if (!cursoAsignaturaId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset al quitar filtro, no hay sistema externo que sincronizar
      setTareas([]);
      setAlumnos([]);
      return;
    }

    let ignore = false;
    const token = localStorage.getItem("token");
    const centroActivo = getCentroActivo();
    setLoading(true);
    setError("");

    fetch(
      `${API_URL}/api/profesor/calificaciones/lista?centroId=${centroActivo.id}&cursoAsignaturaId=${cursoAsignaturaId}`,
      { headers: { Authorization: `Bearer ${token}` } },
    )
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error || "Error al cargar calificaciones");
        }
        if (!ignore) {
          setTareas(Array.isArray(data.tareas) ? data.tareas : []);
          setAlumnos(Array.isArray(data.alumnos) ? data.alumnos : []);
          setSistemaCalificacion(data.sistemaCalificacion || "sobre 10");
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(
            err instanceof Error
              ? err.message
              : "Error al cargar calificaciones",
          );
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [cursoAsignaturaId]);

  const actualizarNota = (alumnoId: number, tareaId: number, valor: string) => {
    setAlumnos((prev) =>
      prev.map((al) => {
        if (al.id !== alumnoId) return al;
        const notas = { ...al.notas, [tareaId]: valor };
        return {
          ...al,
          notas,
          notaFinal: calcularNotaFinal(notas, sistemaCalificacion),
        };
      }),
    );
  };

  const guardarCambios = async () => {
    setGuardando(true);
    setError("");
    const token = localStorage.getItem("token");
    const centroActivo = getCentroActivo();

    const registros = alumnos.flatMap((al) =>
      tareas.map((t) => ({
        usuarioId: al.id,
        tareaId: t.id,
        nota: al.notas[t.id] ?? "",
      })),
    );

    try {
      const res = await fetch(
        `${API_URL}/api/profesor/calificaciones/guardar`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            centroId: centroActivo.id,
            cursoAsignaturaId: Number(cursoAsignaturaId),
            registros,
          }),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Error al guardar las calificaciones");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al guardar las calificaciones",
      );
    } finally {
      setGuardando(false);
    }
  };

  const cursoActual = cursosDisponibles.find(
    (c) => String(c.cursoAsignaturaId) === cursoAsignaturaId,
  );

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text(`Calificaciones - ${asignaturaNombre}`, 14, 15);
    doc.setFontSize(10);
    doc.text(`${cursoActual?.curso ?? ""} ${cursoActual?.rama ?? ""}`, 14, 22);

    autoTable(doc, {
      startY: 28,
      head: [["#", "Alumno", ...tareas.map((t) => t.titulo), "Nota final"]],
      body: alumnos.map((al, i) => [
        i + 1,
        `${al.nombre} ${al.apellidos}`,
        ...tareas.map((t) => al.notas[t.id] || "-"),
        al.notaFinal ?? "-",
      ]),
    });

    doc.save(`calificaciones_${asignaturaNombre}.pdf`);
    setMostrarExportar(false);
  };

  const exportarExcel = () => {
    const filas = alumnos.map((al, i) => {
      const fila: Record<string, string | number> = {
        "#": i + 1,
        Alumno: `${al.nombre} ${al.apellidos}`,
      };
      tareas.forEach((t) => {
        fila[t.titulo] = al.notas[t.id] || "";
      });
      fila["Nota final"] = al.notaFinal ?? "";
      return fila;
    });
    const hoja = XLSX.utils.json_to_sheet(filas);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "Calificaciones");
    XLSX.writeFile(libro, `calificaciones_${asignaturaNombre}.xlsx`);
    setMostrarExportar(false);
  };

  return (
    <div className="content-cal-pf calificaciones-page">
      <h1>Calificaciones</h1>
      <p className="subtitle">
        Vista global de las calificaciones de todos tus grupos y asignaturas
      </p>

      <div className="calificaciones-filtros-pf">
        <div className="filtro-col-cal-pf">
          <label>Asignatura</label>
          <select
            className="filtro-select-cal-pf"
            value={asignaturaNombre}
            onChange={(e) => setAsignaturaNombre(e.target.value)}
          >
            {asignaturasUnicas.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        <div className="filtro-col-cal-pf">
          <label>Grupo / Clase</label>
          <select
            className="filtro-select-cal-pf"
            value={cursoAsignaturaId}
            onChange={(e) => setCursoAsignaturaId(e.target.value)}
          >
            {cursosDisponibles.map((c) => (
              <option key={c.cursoAsignaturaId} value={c.cursoAsignaturaId}>
                {c.curso}
                {c.rama ? ` ${c.rama}` : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="calificaciones-tabla-wrapper-pf">
        <div className="calificaciones-tabla-header-pf">
          <strong>Lista de alumnos</strong>

          <div className="calificaciones-acciones-pf">
            <div className="exportar-col-cal-pf" ref={exportarRef}>
              <button
                className="btn-exportar-cal"
                onClick={() => setMostrarExportar((v) => !v)}
              >
                <FontAwesomeIcon icon={faDownload} /> Exportar
              </button>
              {mostrarExportar && (
                <div className="exportar-dropdown-cal-pf">
                  <button onClick={exportarPDF}>PDF</button>
                  <button onClick={exportarExcel}>Excel</button>
                </div>
              )}
            </div>

            <button
              className="btn-guardar-calificaciones"
              onClick={guardarCambios}
              disabled={guardando || loading || alumnos.length === 0}
            >
              <Save size={14} />
              {guardando ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </div>

        {error && <p className="modal-error">{error}</p>}

        {loading ? (
          <p style={{ padding: 20 }}>Cargando alumnos...</p>
        ) : (
          <div className="calificaciones-tabla-scroll-pf">
            <table className="calificaciones-tabla-pf">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Alumno</th>
                  {tareas.map((t) => (
                    <th key={t.id}>{t.titulo}</th>
                  ))}
                  <th>Nota final</th>
                </tr>
              </thead>
              <tbody>
                {alumnos.map((al, i) => (
                  <tr key={al.id}>
                    <td>{i + 1}</td>
                    <td className="col-alumno-cal-pf">
                      <div className="alumno-info-cal-pf">
                        <span className="avatar-iniciales-cal-pf">
                          {getIniciales(al.nombre, al.apellidos)}
                        </span>
                        {al.nombre} {al.apellidos}
                      </div>
                    </td>
                    {tareas.map((t) => {
                      const color = getColorNota(
                        al.notas[t.id],
                        sistemaCalificacion,
                      );
                      return (
                        <td key={t.id}>
                          <input
                            className="nota-input-cal-pf"
                            value={al.notas[t.id] ?? ""}
                            style={
                              color
                                ? { color, fontWeight: 600, borderColor: color }
                                : undefined
                            }
                            onChange={(e) =>
                              actualizarNota(al.id, t.id, e.target.value)
                            }
                          />
                        </td>
                      );
                    })}
                    <td>
                      {(() => {
                        const color = getColorNota(
                          al.notaFinal,
                          sistemaCalificacion,
                        );
                        return (
                          <div
                            className="nota-final-cal-pf"
                            style={
                              color ? { color, fontWeight: 700 } : undefined
                            }
                          >
                            {al.notaFinal ?? "-"}
                          </div>
                        );
                      })()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="calificaciones-total-pf">
          Total estudiantes: <strong>{alumnos.length}</strong>
        </div>
      </div>
    </div>
  );
}

export default CalificacionesProfesor;
