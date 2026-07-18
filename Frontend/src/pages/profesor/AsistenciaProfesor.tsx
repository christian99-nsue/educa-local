import { useEffect, useRef, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { getCentroActivo } from "../../utils/auth";
import "../../styles/AsistenciaProfesor.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";

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

interface Alumno {
  id: number;
  nombre: string;
  apellidos: string;
  estado: "presente" | "ausente" | "justificado";
  observaciones: string;
}

const estadoConfig: Record<
  string,
  { label: string; bg: string; color: string }
> = {
  presente: { label: "✓ Presente", bg: "#dcfce7", color: "#16a34a" },
  ausente: { label: "✕ Ausente", bg: "#fee2e2", color: "#dc2626" },
  justificado: { label: "⊖ Justificado", bg: "#fef3c7", color: "#d97706" },
};

const getIniciales = (nombre: string, apellidos: string) =>
  `${nombre[0] ?? ""}${apellidos[0] ?? ""}`.toUpperCase();

function AsistenciaProfesor() {
  const [opciones, setOpciones] = useState<AsignaturaOpcion[]>([]);
  const [asignaturaNombre, setAsignaturaNombre] = useState("");
  const [cursoAsignaturaId, setCursoAsignaturaId] = useState("");
  const [fecha, setFecha] = useState(() => {
    const hoy = new Date();
    return hoy.toISOString().split("T")[0];
  });

  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
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
    if (!cursoAsignaturaId || !fecha) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset al quitar filtros, no hay sistema externo que sincronizar
      setAlumnos([]);
      return;
    }

    let ignore = false;
    const token = localStorage.getItem("token");
    const centroActivo = getCentroActivo();

    setLoading(true);
    setError("");

    fetch(
      `${API_URL}/api/profesor/asistencia/alumnos?centroId=${centroActivo.id}&cursoAsignaturaId=${cursoAsignaturaId}&fecha=${fecha}`,
      { headers: { Authorization: `Bearer ${token}` } },
    )
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error || "Error al cargar alumnos");
        }
        if (!ignore) {
          setAlumnos(Array.isArray(data) ? data : []);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(
            err instanceof Error ? err.message : "Error al cargar alumnos",
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
  }, [cursoAsignaturaId, fecha]);

  const actualizarEstado = (id: number, estado: Alumno["estado"]) => {
    setAlumnos((prev) =>
      prev.map((al) => (al.id === id ? { ...al, estado } : al)),
    );
  };

  const actualizarObservaciones = (id: number, observaciones: string) => {
    setAlumnos((prev) =>
      prev.map((al) => (al.id === id ? { ...al, observaciones } : al)),
    );
  };

  const guardarAsistencia = async () => {
    setGuardando(true);
    setError("");
    const token = localStorage.getItem("token");
    const centroActivo = getCentroActivo();

    try {
      const res = await fetch(`${API_URL}/api/profesor/asistencia/guardar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          centroId: centroActivo.id,
          cursoAsignaturaId: Number(cursoAsignaturaId),
          fecha,
          registros: alumnos.map((al) => ({
            usuarioId: al.id,
            estado: al.estado,
            observaciones: al.observaciones,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Error al guardar la asistencia");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al guardar la asistencia",
      );
    } finally {
      setGuardando(false);
    }
  };

  const cursoActual = cursosDisponibles.find(
    (c) => String(c.cursoAsignaturaId) === cursoAsignaturaId,
  );

  const fechaFormateada = new Date(fecha + "T00:00:00").toLocaleDateString(
    "es-ES",
    { day: "numeric", month: "long", year: "numeric" },
  );

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text(`Asistencia - ${asignaturaNombre}`, 14, 15);
    doc.setFontSize(10);
    doc.text(
      `${cursoActual?.curso ?? ""} ${cursoActual?.rama ?? ""} - ${fechaFormateada}`,
      14,
      22,
    );

    autoTable(doc, {
      startY: 28,
      head: [["#", "Estudiante", "Estado", "Observaciones"]],
      body: alumnos.map((al, i) => [
        i + 1,
        `${al.nombre} ${al.apellidos}`,
        estadoConfig[al.estado].label.replace(/[✓✕⊖]/, "").trim(),
        al.observaciones || "-",
      ]),
    });

    doc.save(`asistencia_${asignaturaNombre}_${fecha}.pdf`);
    setMostrarExportar(false);
  };

  const exportarExcel = () => {
    const filas = alumnos.map((al, i) => ({
      "#": i + 1,
      Estudiante: `${al.nombre} ${al.apellidos}`,
      Estado: estadoConfig[al.estado].label.replace(/[✓✕⊖]/, "").trim(),
      Observaciones: al.observaciones || "",
    }));
    const hoja = XLSX.utils.json_to_sheet(filas);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "Asistencia");
    XLSX.writeFile(libro, `asistencia_${asignaturaNombre}_${fecha}.xlsx`);
    setMostrarExportar(false);
  };

  return (
    <div className="content-pf asistencia-page">
      <h1>Asistencia</h1>
      <p className="subtitle">Gestiona la asistencia de tus clases</p>

      <div className="asistencia-filtros-pf">
        <div className="filtro-col-as-pf">
          <label>Asignatura</label>
          <select
            className="filtro-select-as-pf"
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

        <div className="filtro-col-as-pf">
          <label>Curso</label>
          <select
            className="filtro-select-as-pf"
            value={cursoAsignaturaId}
            onChange={(e) => setCursoAsignaturaId(e.target.value)}
          >
            {cursosDisponibles.map((c) => (
              <option key={c.cursoAsignaturaId} value={c.cursoAsignaturaId}>
                {c.curso}
                {c.rama ? ` - ${c.rama}` : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="filtro-col-as-pf">
          <label>Fecha</label>
          <div className="modal-fecha-wrapper-as-pf">
            <input
              type="date"
              className="modal-input-as-pf"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          </div>
        </div>

        <div className="exportar-col-as-pf" ref={exportarRef}>
          <button
            className="btn-exportar"
            onClick={() => setMostrarExportar((v) => !v)}
          >
            <FontAwesomeIcon icon={faDownload} /> Exportar
          </button>
          {mostrarExportar && (
            <div className="exportar-dropdown-as-pf">
              <button onClick={exportarPDF}>PDF</button>
              <button onClick={exportarExcel}>Excel</button>
            </div>
          )}
        </div>
      </div>

      <div className="asistencia-tabla-wrapper-as-pf">
        <div className="asistencia-tabla-header-as-pf">
          <div>
            <strong>Clase del {fechaFormateada}</strong>
          </div>
          <button
            className="btn-guardar-asistencia"
            onClick={guardarAsistencia}
            disabled={guardando || loading || alumnos.length === 0}
          >
            {guardando ? "Guardando..." : "Guardar asistencia"}
          </button>
        </div>

        {error && <p className="modal-error">{error}</p>}

        {loading ? (
          <p style={{ padding: 20 }}>Cargando alumnos...</p>
        ) : (
          <table className="asistencia-tabla-pf">
            <thead>
              <tr>
                <th>#</th>
                <th>Estudiante</th>
                <th>Estado</th>
                <th>Observaciones</th>
              </tr>
            </thead>
            <tbody>
              {alumnos.map((al, i) => (
                <tr key={al.id}>
                  <td>{i + 1}</td>
                  <td className="col-estudiante-pf">
                    <span className="avatar-iniciales-pf">
                      {getIniciales(al.nombre, al.apellidos)}
                    </span>
                    {al.nombre} {al.apellidos}
                  </td>
                  <td>
                    <select
                      className="estado-select-pf"
                      value={al.estado}
                      style={{
                        background: estadoConfig[al.estado].bg,
                        color: estadoConfig[al.estado].color,
                      }}
                      onChange={(e) =>
                        actualizarEstado(
                          al.id,
                          e.target.value as Alumno["estado"],
                        )
                      }
                    >
                      <option value="presente">✓ Presente</option>
                      <option value="ausente">✕ Ausente</option>
                      <option value="justificado">⊖ Justificado</option>
                    </select>
                  </td>
                  <td>
                    <input
                      className="observaciones-input-pf"
                      placeholder="Observaciones (opcional)"
                      value={al.observaciones}
                      onChange={(e) =>
                        actualizarObservaciones(al.id, e.target.value)
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="asistencia-total-pf">
          Total estudiantes: <strong>{alumnos.length}</strong>
        </div>
      </div>
    </div>
  );
}

export default AsistenciaProfesor;
